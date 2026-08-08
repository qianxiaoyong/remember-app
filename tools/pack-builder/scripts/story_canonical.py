#!/usr/bin/env python3
"""Helpers to verify story card paragraphs against canonical PDF English."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

PACK_BUILDER_ROOT = Path(__file__).resolve().parents[1]
CANONICAL_DIR = PACK_BUILDER_ROOT / 'source' / 'primary-1000-stories' / 'canonical'

STORY_PARAGRAPH_MAX_SENTENCES = 3
STORY_PARAGRAPH_MAX_CHARS = 120
SENTENCE_END_PATTERN = re.compile(r'[.!?](?=\s|$|")')


def count_english_sentences(text: str) -> int:
    trimmed = text.strip()
    if not trimmed:
        return 0
    matches = SENTENCE_END_PATTERN.findall(trimmed)
    return len(matches) if matches else 1


def assert_canonical_paragraph_lengths(lesson_code: str) -> None:
    for index, paragraph in enumerate(load_canonical(lesson_code), start=1):
        sentence_count = count_english_sentences(paragraph)
        char_count = len(paragraph)
        if sentence_count <= STORY_PARAGRAPH_MAX_SENTENCES and char_count <= STORY_PARAGRAPH_MAX_CHARS:
            continue
        raise AssertionError(
            f'{lesson_code} paragraph {index} too long: '
            f'{sentence_count} sentences (max {STORY_PARAGRAPH_MAX_SENTENCES}), '
            f'{char_count} chars (max {STORY_PARAGRAPH_MAX_CHARS})\n'
            f'  text: {paragraph!r}',
        )


def runs_to_plain_text(runs: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for run in runs:
        if run['kind'] == 'text':
            parts.append(run['text'])
        elif run['kind'] == 'word':
            parts.append(run['surface'])
        else:
            raise ValueError(f'unknown run kind: {run!r}')
    return ''.join(parts)


def load_canonical(lesson_code: str) -> list[str]:
    path = CANONICAL_DIR / f'{lesson_code}.paragraphs.json'
    payload = json.loads(path.read_text(encoding='utf-8'))
    paragraphs = payload['paragraphs']
    if not isinstance(paragraphs, list) or not all(isinstance(item, str) for item in paragraphs):
        raise ValueError(f'invalid canonical file: {path}')
    return paragraphs


def assert_paragraphs_match_canonical(
    lesson_code: str,
    paragraphs: list[dict[str, Any]],
) -> None:
    expected = load_canonical(lesson_code)
    if len(paragraphs) != len(expected):
        raise AssertionError(
            f'{lesson_code}: paragraph count {len(paragraphs)} != canonical {len(expected)}',
        )
    for index, (paragraph, want) in enumerate(zip(paragraphs, expected, strict=True), start=1):
        got = runs_to_plain_text(paragraph['runs'])
        if got != want:
            raise AssertionError(
                f'{lesson_code} paragraph {index} text mismatch\n'
                f'  expected: {want!r}\n'
                f'  got:      {got!r}',
            )
