"""Align canonical story paragraphs to whisper word timestamps."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass

from story_audio_transcribe import TranscriptResult, WordSpan, normalize_token, tokens_equivalent

MIN_ANCHOR_WORDS = 5
MAX_WHISPER_SKIPS = 3
MAX_EXPECTED_SKIPS = 3


@dataclass(frozen=True)
class ParagraphTimeline:
    paragraph_index: int
    text: str
    audio_start_ms: int
    audio_end_ms: int
    matched_words: int
    expected_words: int
    confidence: float


@dataclass(frozen=True)
class AlignmentReport:
    lesson_code: str
    duration_ms: int
    story_start_ms: int
    story_start_method: str
    paragraphs: list[ParagraphTimeline]
    warnings: list[str]


def tokenize_paragraph(text: str) -> list[str]:
    parts = re.findall(r"[A-Za-z0-9']+", text.lower())
    return [normalize_token(part) for part in parts if normalize_token(part)]


def _match_paragraph_words_at(
    expected: list[str],
    words: list[WordSpan],
    start: int,
    *,
    max_whisper_skips: int,
    max_expected_skips: int,
    prefer_expected_skips: bool,
) -> tuple[int, int, int] | None:
    exp_index = 0
    word_index = start
    whisper_skips = 0
    expected_skips = 0
    matched = 0
    last_matched_word_index: int | None = None

    while exp_index < len(expected) and word_index < len(words):
        if tokens_equivalent(expected[exp_index], words[word_index].word):
            matched += 1
            last_matched_word_index = word_index
            exp_index += 1
            word_index += 1
            whisper_skips = 0
            expected_skips = 0
            continue

        skip_options: tuple[str, ...]
        if prefer_expected_skips:
            skip_options = ('expected', 'whisper')
        else:
            skip_options = ('whisper', 'expected')

        skipped = False
        for option in skip_options:
            if option == 'whisper' and whisper_skips < max_whisper_skips:
                word_index += 1
                whisper_skips += 1
                skipped = True
                break
            if option == 'expected' and expected_skips < max_expected_skips:
                exp_index += 1
                expected_skips += 1
                skipped = True
                break

        if not skipped:
            break

    if exp_index < len(expected) or last_matched_word_index is None:
        return None

    return start, last_matched_word_index, matched


def _match_paragraph_words(
    expected: list[str],
    words: list[WordSpan],
    cursor: int,
    *,
    max_whisper_skips: int = MAX_WHISPER_SKIPS,
    max_expected_skips: int = MAX_EXPECTED_SKIPS,
) -> tuple[int, int, int] | None:
    """Match expected tokens from cursor, tolerating ASR insertions and omissions."""
    if not expected:
        return None

    for start in range(cursor, len(words)):
        for prefer_expected_skips in (False, True):
            match = _match_paragraph_words_at(
                expected,
                words,
                start,
                max_whisper_skips=max_whisper_skips,
                max_expected_skips=max_expected_skips,
                prefer_expected_skips=prefer_expected_skips,
            )
            if match is not None:
                return match

    return None


def _find_all_matches(
    expected: list[str],
    words: list[WordSpan],
    *,
    start_from: int = 0,
) -> list[tuple[int, int, int]]:
    if not expected:
        return []
    matches: list[tuple[int, int, int]] = []
    max_start = len(words) - len(expected)
    for start in range(start_from, max_start + 1):
        matched = 0
        for offset, token in enumerate(expected):
            if not tokens_equivalent(token, words[start + offset].word):
                break
            matched += 1
        if matched == len(expected):
            matches.append((start, start + len(expected) - 1, matched))
    return matches


def _pick_best_anchor_match(
    matches: list[tuple[int, int, int]],
    words: list[WordSpan],
) -> tuple[int, int, int]:
    """Prefer the latest match; intro summaries often precede the real story body."""
    return max(matches, key=lambda item: words[item[0]].start_ms)


def _title_prefix_end_index(title_tokens: list[str], words: list[WordSpan]) -> int | None:
    if not title_tokens or not words:
        return None

    word_index = 0
    title_index = 0
    last_matched_word_index: int | None = None

    while word_index < len(words) and title_index < len(title_tokens):
        spoken = words[word_index].word
        expected = title_tokens[title_index]
        if spoken == expected or tokens_equivalent(expected, spoken):
            last_matched_word_index = word_index
            word_index += 1
            title_index += 1
            continue
        if (
            len(spoken) >= 2
            and expected.startswith(spoken)
            and title_index + 1 < len(title_tokens)
        ):
            next_expected = title_tokens[title_index + 1]
            if word_index + 1 < len(words) and words[word_index + 1].word == next_expected:
                last_matched_word_index = word_index + 1
                word_index += 2
                title_index += 2
                continue
        if len(spoken) == 1 and expected.startswith(spoken):
            last_matched_word_index = word_index
            word_index += 1
            title_index += 1
            continue
        break

    if last_matched_word_index is None:
        return None
    if title_index < max(2, len(title_tokens) // 2):
        return None
    return last_matched_word_index + 1


def find_story_start_cursor(
    words: list[WordSpan],
    paragraphs: list[str],
    *,
    title_en: str | None = None,
) -> tuple[int, str]:
    if not paragraphs:
        return 0, 'empty story'

    first_tokens = tokenize_paragraph(paragraphs[0])
    max_prefix = min(len(first_tokens), max(MIN_ANCHOR_WORDS, len(first_tokens)))
    for prefix_len in range(len(first_tokens), MIN_ANCHOR_WORDS - 1, -1):
        prefix = first_tokens[:prefix_len]
        matches = _find_all_matches(prefix, words)
        if not matches:
            continue
        if len(matches) == 1:
            return matches[0][0], f'anchor paragraph 1 ({prefix_len}/{len(first_tokens)} words)'
        start_idx, _, _ = _pick_best_anchor_match(matches, words)
        return (
            start_idx,
            f'anchor paragraph 1 ({prefix_len}/{len(first_tokens)} words, latest of {len(matches)})',
        )

    if title_en:
        title_tokens = tokenize_paragraph(title_en)
        title_end = _title_prefix_end_index(title_tokens, words)
        if title_end is not None:
            for prefix_len in range(len(first_tokens), MIN_ANCHOR_WORDS - 1, -1):
                prefix = first_tokens[:prefix_len]
                match = _match_paragraph_words(prefix, words, title_end)
                if match is not None:
                    return match[0], f'after title prefix + paragraph 1 ({prefix_len} words)'

    return 0, 'no anchor found'


def _fallback_start_ms(
    paragraph_index: int,
    total_paragraphs: int,
    duration_ms: int,
    *,
    story_start_ms: int,
    cursor: int,
    words: list[WordSpan],
    fallback_anchor_ms: int | None,
    fallback_anchor_index: int | None,
) -> int:
    """Place unmatched paragraphs on a fair split of the remaining audio."""
    if (
        fallback_anchor_ms is not None
        and fallback_anchor_index is not None
        and paragraph_index > fallback_anchor_index
    ):
        remaining = total_paragraphs - fallback_anchor_index
        local_index = paragraph_index - fallback_anchor_index
        usable_ms = max(remaining, duration_ms - fallback_anchor_ms)
        slot = usable_ms / remaining
        return min(
            duration_ms - (remaining - local_index),
            fallback_anchor_ms + int(round(local_index * slot)),
        )

    if cursor < len(words):
        return words[cursor].start_ms

    usable_ms = max(1, duration_ms - story_start_ms)
    slot = usable_ms / total_paragraphs
    return story_start_ms + int(round(paragraph_index * slot))


def align_paragraphs(
    lesson_code: str,
    paragraphs: list[str],
    transcript: TranscriptResult,
    *,
    title_en: str | None = None,
    allow_fallback: bool = True,
) -> AlignmentReport:
    warnings: list[str] = []
    timeline: list[ParagraphTimeline] = []
    cursor, start_method = find_story_start_cursor(
        transcript.words,
        paragraphs,
        title_en=title_en,
    )
    story_start_ms = transcript.words[cursor].start_ms if transcript.words else 0
    if cursor > 0:
        warnings.append(
            f'skipped intro/title region: 0-{story_start_ms}ms ({cursor} whisper word(s)) via {start_method}',
        )
    elif start_method == 'no anchor found':
        warnings.append('could not locate story body start; matching from audio beginning')

    fallback_anchor_ms: int | None = None
    fallback_anchor_index: int | None = None

    for index, text in enumerate(paragraphs):
        expected = tokenize_paragraph(text)
        match = _match_paragraph_words(expected, transcript.words, cursor)
        if match is None and len(expected) > MIN_ANCHOR_WORDS:
            for prefix_len in range(len(expected) - 1, MIN_ANCHOR_WORDS - 1, -1):
                prefix = expected[:prefix_len]
                match = _match_paragraph_words(prefix, transcript.words, cursor)
                if match is not None:
                    warnings.append(
                        f'{lesson_code} paragraph {index + 1}: '
                        f'partial align {prefix_len}/{len(expected)} word(s)',
                    )
                    break
        if match is None:
            message = (
                f'{lesson_code} paragraph {index + 1}: '
                f'could not align {len(expected)} word(s) from cursor {cursor}'
            )
            warnings.append(message)
            if not allow_fallback:
                raise RuntimeError(message)
            start_ms = _fallback_start_ms(
                index,
                len(paragraphs),
                transcript.duration_ms,
                story_start_ms=story_start_ms,
                cursor=cursor,
                words=transcript.words,
                fallback_anchor_ms=fallback_anchor_ms,
                fallback_anchor_index=fallback_anchor_index,
            )
            if fallback_anchor_ms is None:
                fallback_anchor_ms = start_ms
                fallback_anchor_index = index
            timeline.append(
                ParagraphTimeline(
                    paragraph_index=index,
                    text=text,
                    audio_start_ms=start_ms,
                    audio_end_ms=start_ms + 1,
                    matched_words=0,
                    expected_words=len(expected),
                    confidence=0.0,
                ),
            )
            continue

        start_idx, end_idx, matched_words = match
        if matched_words == len(expected):
            fallback_anchor_ms = None
            fallback_anchor_index = None
        cursor = end_idx + 1
        start_ms = transcript.words[start_idx].start_ms
        end_ms = transcript.words[end_idx].end_ms
        confidence = matched_words / max(1, len(expected))
        timeline.append(
            ParagraphTimeline(
                paragraph_index=index,
                text=text,
                audio_start_ms=start_ms,
                audio_end_ms=max(start_ms + 1, end_ms),
                matched_words=matched_words,
                expected_words=len(expected),
                confidence=confidence,
            ),
        )

    timeline = _recompute_ends(timeline, transcript.duration_ms)
    timeline = _enforce_monotonic_timeline(timeline, transcript.duration_ms)
    return AlignmentReport(
        lesson_code=lesson_code,
        duration_ms=transcript.duration_ms,
        story_start_ms=story_start_ms,
        story_start_method=start_method,
        paragraphs=timeline,
        warnings=warnings,
    )


def _recompute_ends(
    paragraphs: list[ParagraphTimeline],
    duration_ms: int,
) -> list[ParagraphTimeline]:
    updated: list[ParagraphTimeline] = []
    for index, item in enumerate(paragraphs):
        next_start = None
        if index + 1 < len(paragraphs):
            next_start = paragraphs[index + 1].audio_start_ms
        end_ms = next_start if next_start is not None else duration_ms
        end_ms = max(item.audio_start_ms + 1, min(duration_ms, end_ms))
        updated.append(
            ParagraphTimeline(
                paragraph_index=item.paragraph_index,
                text=item.text,
                audio_start_ms=item.audio_start_ms,
                audio_end_ms=end_ms,
                matched_words=item.matched_words,
                expected_words=item.expected_words,
                confidence=item.confidence,
            ),
        )
    return updated


def _enforce_monotonic_timeline(
    paragraphs: list[ParagraphTimeline],
    duration_ms: int,
) -> list[ParagraphTimeline]:
    if not paragraphs:
        return paragraphs

    adjusted: list[ParagraphTimeline] = []
    for item in paragraphs:
        start_ms = item.audio_start_ms
        if adjusted:
            start_ms = max(start_ms, adjusted[-1].audio_start_ms + 1)
        adjusted.append(
            ParagraphTimeline(
                paragraph_index=item.paragraph_index,
                text=item.text,
                audio_start_ms=start_ms,
                audio_end_ms=item.audio_end_ms,
                matched_words=item.matched_words,
                expected_words=item.expected_words,
                confidence=item.confidence,
            ),
        )

    return _recompute_ends(adjusted, duration_ms)


def apply_timeline_to_card_paragraphs(
    card_paragraphs: list[dict],
    timeline: list[ParagraphTimeline],
) -> list[dict]:
    if len(card_paragraphs) != len(timeline):
        raise ValueError(
            f'paragraph count mismatch: card={len(card_paragraphs)} timeline={len(timeline)}',
        )
    updated: list[dict] = []
    for paragraph, segment in zip(card_paragraphs, timeline, strict=True):
        next_paragraph = dict(paragraph)
        next_paragraph['audioStartMs'] = segment.audio_start_ms
        next_paragraph['audioEndMs'] = segment.audio_end_ms
        updated.append(next_paragraph)
    return updated


def load_canonical_paragraphs(lesson_code: str, canonical_path: str) -> list[str]:
    payload = json.loads(open(canonical_path, encoding='utf-8').read())
    paragraphs = payload.get('paragraphs')
    if not isinstance(paragraphs, list) or not paragraphs:
        raise ValueError(f'invalid canonical file: {canonical_path}')
    return [str(item) for item in paragraphs]


def format_report(report: AlignmentReport) -> str:
    lines = [
        (
            f'{report.lesson_code}: duration={report.duration_ms}ms '
            f'story_start={report.story_start_ms}ms ({report.story_start_method}) '
            f'paragraphs={len(report.paragraphs)}'
        ),
    ]
    for item in report.paragraphs:
        lines.append(
            f'  P{item.paragraph_index + 1:02d} '
            f'{item.audio_start_ms:6d}-{item.audio_end_ms:6d}ms '
            f'conf={item.confidence:.2f} '
            f'words={item.matched_words}/{item.expected_words} '
            f'{item.text[:60]}{"…" if len(item.text) > 60 else ""}',
        )
    for warning in report.warnings:
        lines.append(f'  WARN: {warning}')
    return '\n'.join(lines)
