"""Curated vocabulary fixes for en-grade4-v1-mj PDF parse output."""

from __future__ import annotations

import copy

RENAME: dict[str, str] = {}

REMOVE: set[str] = set()

# PDF 跨行 IT（=（Information / Technology）信息技术，解析易漏
ADD: list[dict] = [
    {
        'unit': 1,
        'headword': 'IT（=（Information Technology）',
        'ipa': '',
        'definition_zh': '信息技术',
        'page': 10,
        'kind': 'phrase',
    },
]


def apply_vocab_fixes(rows: list[dict]) -> list[dict]:
    by_headword: dict[str, dict] = {}
    for row in rows:
        key = row['headword'].lower()
        if key in REMOVE:
            continue
        row = copy.deepcopy(row)
        if key in RENAME:
            row['headword'] = RENAME[key]
            key = row['headword'].lower()
        if key not in by_headword or row['unit'] < by_headword[key]['unit']:
            by_headword[key] = row
    for row in ADD:
        key = row['headword'].lower()
        by_headword[key] = copy.deepcopy(row)
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
