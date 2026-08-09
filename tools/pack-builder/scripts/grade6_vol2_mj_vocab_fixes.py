"""Curated vocabulary fixes for en-grade6-v2-mj PDF parse output."""

from __future__ import annotations

import copy

RENAME: dict[str, str] = {
    'ice': 'Ice and Snow Festival',
}

REMOVE: set[str] = set()

ADD: list[dict] = []


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
            if key == 'ice':
                row['definition_zh'] = '冰雪节'
                row['kind'] = 'phrase'
            key = row['headword'].lower()
        if key == 'made':
            row['definition_zh'] = '制作（过去式）'
        if key == 'gave':
            row['definition_zh'] = '给（过去式）'
        if key == 'break':
            row['definition_zh'] = '摔断（过去式 broke）'
        if key not in by_headword or row['unit'] < by_headword[key]['unit']:
            by_headword[key] = row
    for row in ADD:
        row = _normalize_row(row)
        key = row['headword'].lower()
        by_headword[key] = row
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
