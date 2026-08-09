"""Curated vocabulary fixes for en-grade5-v2-mj PDF parse output."""

from __future__ import annotations

import copy
import re

RENAME: dict[str, str] = {
    'medal': 'Medal of the Republic',
}

REMOVE: set[str] = {'review'}

ADD: list[dict] = [
    {
        'unit': 3,
        'headword': 'Covid-19',
        'ipa': '',
        'definition_zh': '新型冠状病毒感染',
        'page': 30,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'women',
        'ipa': '',
        'definition_zh': '成年女子；妇女',
        'page': 30,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'team',
        'ipa': '',
        'definition_zh': '（体育的）队',
        'page': 30,
        'kind': 'word',
    },
]


def _normalize_row(row: dict) -> dict:
    row = copy.deepcopy(row)
    head = row['headword'].strip()
    if head.startswith('*'):
        head = head.lstrip('*').strip()
        row['headword'] = head
    return row


def apply_vocab_fixes(rows: list[dict]) -> list[dict]:
    by_headword: dict[str, dict] = {}
    for row in rows:
        row = _normalize_row(row)
        key = row['headword'].lower()
        if key in REMOVE:
            continue
        if key in RENAME:
            row['headword'] = RENAME[key]
            key = row['headword'].lower()
        if key == 'fight':
            row['definition_zh'] = '战斗；与……作斗争'
        if key == 'member':
            row['definition_zh'] = '成员'
        if key not in by_headword or row['unit'] < by_headword[key]['unit']:
            by_headword[key] = row
    for row in ADD:
        row = _normalize_row(row)
        key = row['headword'].lower()
        by_headword[key] = row
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
