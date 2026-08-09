"""Curated vocabulary fixes for en-grade3-v1-mj PDF parse output."""

from __future__ import annotations

import copy

RENAME: dict[str, str] = {
    "i'm=i": "I'm=I am",
    "what's=what": "what's=what is",
    "let's=let": "let's=let us",
    "that's=that": "that's=that is",
    "it's=it": "it's=it is",
    'ice': 'ice cream',
    'blow': 'blow out',
}

REMOVE: set[str] = set()

ADD: list[dict] = []


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
