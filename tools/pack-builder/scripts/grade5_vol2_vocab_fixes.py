"""Curated vocabulary fixes for en-grade5-v2-rj PDF parse output."""

from __future__ import annotations

import copy

REMOVE: set[str] = set()

# 附录 2 有、PDF 解析漏掉的词条
ADD: list[dict] = [
    {
        'unit': 5,
        'headword': 'climbing',
        'ipa': '/ˈklaɪmɪŋ/',
        'definition_zh': '（climb 的 -ing 形式）（正在）攀登；攀爬',
        'page': 52,
        'kind': 'word',
    },
    {
        'unit': 6,
        'headword': 'having … class',
        'ipa': '',
        'definition_zh': '（正在）上……课',
        'page': 59,
        'kind': 'phrase',
    },
    {
        'unit': 6,
        'headword': 'eating lunch',
        'ipa': '',
        'definition_zh': '（正在）吃午饭',
        'page': 59,
        'kind': 'phrase',
    },
    {
        'unit': 6,
        'headword': 'reading a book',
        'ipa': '',
        'definition_zh': '（正在）看书',
        'page': 59,
        'kind': 'phrase',
    },
    {
        'unit': 6,
        'headword': 'listening to music',
        'ipa': '',
        'definition_zh': '（正在）听音乐',
        'page': 59,
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
        if key not in by_headword or row['unit'] < by_headword[key]['unit']:
            by_headword[key] = row
    for row in ADD:
        key = row['headword'].lower()
        by_headword[key] = copy.deepcopy(row)
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
