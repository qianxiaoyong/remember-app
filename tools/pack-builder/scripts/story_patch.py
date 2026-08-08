#!/usr/bin/env python3
"""Shared helpers for story patch scripts."""
from __future__ import annotations

import re
from typing import Literal

Tier = Literal['high', 'mid', 'low']
Mark = tuple[str, str]
SidebarRow = tuple[str, str, str, str, Tier]


def sidebar_json(rows: list[SidebarRow]) -> list[dict]:
    return [
        {
            'vocabId': vid,
            'headword': vid,
            'ipa': ipa,
            'pos': pos,
            'definitionZh': defn,
            'tier': tier,
        }
        for vid, ipa, pos, defn, tier in rows
    ]


def _find_surface(text: str, surface: str, start: int) -> int:
    pattern = re.compile(
        rf"(?<![A-Za-z']){re.escape(surface)}(?![A-Za-z'])",
    )
    match = pattern.search(text, start)
    if match is None:
        raise ValueError(f'surface {surface!r} not found in {text!r} from index {start}')
    return match.start()


def mark_paragraph(
    text: str,
    marks: list[Mark],
    gloss: dict[str, str],
    tier: dict[str, Tier],
    translation_zh: str,
) -> dict:
    runs: list[dict] = []
    pos = 0
    for surface, vocab_id in marks:
        index = _find_surface(text, surface, pos)
        if index > pos:
            runs.append({'kind': 'text', 'text': text[pos:index]})
        runs.append(
            {
                'kind': 'word',
                'surface': surface,
                'vocabId': vocab_id,
                'glossZh': gloss[vocab_id],
                'tier': tier[vocab_id],
            },
        )
        pos = index + len(surface)
    if pos < len(text):
        runs.append({'kind': 'text', 'text': text[pos:]})
    return {'runs': runs, 'translationZh': translation_zh}


def build_lesson_paragraphs(
    canonical: list[str],
    marks_list: list[list[Mark]],
    translations: list[str],
    sidebar: list[SidebarRow],
) -> list[dict]:
    if len(canonical) != len(marks_list) or len(canonical) != len(translations):
        raise ValueError(
            f'canonical/marks/translations length mismatch '
            f'{len(canonical)}/{len(marks_list)}/{len(translations)}',
        )

    gloss = {vid: defn for vid, _ipa, _pos, defn, _tier in sidebar}
    tiers = {vid: tier for vid, _ipa, _pos, _defn, tier in sidebar}

    return [
        mark_paragraph(text, marks, gloss, tiers, translation_zh)
        for text, marks, translation_zh in zip(canonical, marks_list, translations, strict=True)
    ]
