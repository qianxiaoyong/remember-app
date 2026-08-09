"""Curated vocabulary fixes for en-grade6-v2-rj PDF parse output."""

from __future__ import annotations

import copy

RENAME: dict[str, str] = {}

REMOVE: set[str] = set()

# PDF 附录有、解析漏掉的词条
ADD: list[dict] = [
    {
        'unit': 3,
        'headword': 'went camping',
        'ipa': '',
        'definition_zh': '（尤指在假日）野营',
        'page': 25,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'look up',
        'ipa': '',
        'definition_zh': '（在词典中或通过电脑）查阅',
        'page': 34,
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
