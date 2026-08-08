#!/usr/bin/env python3
"""Align primary-1000-stories paragraph timelines from official mp3 + Whisper.

Workflow:
  1. python tools/pack-builder/scripts/copy-primary-1000-audio.py
  2. pip install faster-whisper   # plus ffmpeg in PATH
  3. python tools/pack-builder/scripts/align-primary-1000-audio.py --lesson 14 --dry-run
  4. python tools/pack-builder/scripts/align-primary-1000-audio.py --from 2 --to 40 --write

Notes:
  - Official mp3 is converted to 16 kHz wav before Whisper (mp3 decode is unreliable).
  - Each track has a variable-length spoken intro (title + blurb); alignment anchors on paragraph 1 text.
  - Transcripts are cached under tools/pack-builder/cache/story-audio-align/.
  - Review low-confidence paragraphs in pack-editor before shipping.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from story_audio_align import (  # noqa: E402
    align_paragraphs,
    apply_timeline_to_card_paragraphs,
    format_report,
    load_canonical_paragraphs,
)
from story_audio_paths import (  # noqa: E402
    ALIGN_CACHE_DIR,
    CARDS_PATH,
    canonical_path,
    lesson_code,
    pack_audio_path,
    transcript_cache_path,
    whisper_wav_cache_path,
)
from story_audio_transcribe import get_audio_duration_ms, load_or_transcribe  # noqa: E402


def load_cards() -> list[dict]:
    with open(CARDS_PATH, encoding='utf-8') as handle:
        return json.load(handle)


def save_cards(cards: list[dict]) -> None:
    with open(CARDS_PATH, 'w', encoding='utf-8') as handle:
        json.dump(cards, handle, ensure_ascii=False, indent=2)
        handle.write('\n')


def find_card(cards: list[dict], code: str) -> dict:
    for card in cards:
        if card.get('content', {}).get('lesson', {}).get('code') == code:
            return card
    raise KeyError(f'missing card {code} in {CARDS_PATH}')


def align_lesson(
    lesson_number: int,
    *,
    model_size: str,
    refresh_transcript: bool,
    allow_fallback: bool,
    dry_run: bool,
) -> tuple[dict, str]:
    code = lesson_code(lesson_number)
    canonical_file = canonical_path(code)
    if not os.path.isfile(canonical_file):
        raise FileNotFoundError(
            f'{code} has no canonical file yet: {canonical_file}',
        )

    audio_file = pack_audio_path(lesson_number)
    if not os.path.isfile(audio_file):
        raise FileNotFoundError(
            f'missing pack audio {audio_file}; run copy-primary-1000-audio.py first',
        )

    paragraphs = load_canonical_paragraphs(code, canonical_file)
    transcript = load_or_transcribe(
        audio_file,
        transcript_cache_path(code),
        wav_cache_path=whisper_wav_cache_path(code),
        model_size=model_size,
        refresh=refresh_transcript,
    )

    cards = load_cards()
    card = find_card(cards, code)
    title_en = card['content']['lesson'].get('titleEn')

    report = align_paragraphs(
        code,
        paragraphs,
        transcript,
        title_en=title_en,
        allow_fallback=allow_fallback,
    )

    card_paragraphs = card['content']['story']['paragraphs']
    if len(card_paragraphs) != len(paragraphs):
        raise ValueError(
            f'{code}: cards paragraph count {len(card_paragraphs)} != canonical {len(paragraphs)}',
        )

    updated_paragraphs = apply_timeline_to_card_paragraphs(card_paragraphs, report.paragraphs)
    card['content']['story']['paragraphs'] = updated_paragraphs

    report_text = format_report(report)
    if dry_run:
        return card, report_text

    for index, item in enumerate(cards):
        if item.get('content', {}).get('lesson', {}).get('code') == code:
            cards[index] = card
            break
    save_cards(cards)
    return card, report_text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lesson', type=int, help='single lesson number, e.g. 14 for C14')
    parser.add_argument('--from', dest='from_lesson', type=int, default=1)
    parser.add_argument('--to', dest='to_lesson', type=int, default=40)
    parser.add_argument('--model', default='base', help='faster-whisper model size')
    parser.add_argument('--refresh-transcript', action='store_true')
    parser.add_argument('--no-fallback', action='store_true')
    parser.add_argument('--dry-run', action='store_true', help='print report only; do not write cards.json')
    parser.add_argument('--write', action='store_true', help='write audioStartMs/audioEndMs to cards.json')
    parser.add_argument(
        '--probe-only',
        action='store_true',
        help='print mp3 duration via ffprobe; skip whisper alignment',
    )
    args = parser.parse_args()

    if args.lesson is not None:
        lesson_numbers = [args.lesson]
    else:
        lesson_numbers = list(range(args.from_lesson, args.to_lesson + 1))

    if not args.probe_only and not args.dry_run and not args.write:
        print('Refusing to modify cards.json without --write (use --dry-run to preview).', file=sys.stderr)
        return 1

    os.makedirs(ALIGN_CACHE_DIR, exist_ok=True)

    if args.probe_only:
        for lesson_number in lesson_numbers:
            code = lesson_code(lesson_number)
            audio_file = pack_audio_path(lesson_number)
            if not os.path.isfile(audio_file):
                print(f'SKIP {code}: missing {audio_file}', file=sys.stderr)
                continue
            duration_ms = get_audio_duration_ms(audio_file)
            print(f'{code}: {audio_file} duration={duration_ms}ms')
        return 0

    failures = 0
    for lesson_number in lesson_numbers:
        code = lesson_code(lesson_number)
        try:
            _, report_text = align_lesson(
                lesson_number,
                model_size=args.model,
                refresh_transcript=args.refresh_transcript,
                allow_fallback=not args.no_fallback,
                dry_run=args.dry_run or not args.write,
            )
            print(report_text)
            print('')
        except FileNotFoundError as error:
            failures += 1
            print(f'SKIP {code}: {error}', file=sys.stderr)
        except (RuntimeError, OSError) as error:
            failures += 1
            print(f'FAIL {code}: {error}', file=sys.stderr)

    if args.write and not args.dry_run:
        print(f'updated {CARDS_PATH}')
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
