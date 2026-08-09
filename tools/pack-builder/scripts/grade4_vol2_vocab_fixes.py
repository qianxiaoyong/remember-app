"""Curated vocabulary fixes for en-grade4-v2-rj PDF parse output."""

from __future__ import annotations

import copy

# 多词短语被误拆为首个词 + 后半 IPA/释义粘连
REMOVE: set[str] = {
    'hurry',
    'turn',
    'living',
    'try',
    'set',
}

ADD: list[dict] = [
    {
        'unit': 1,
        'headword': 'hurry up',
        'ipa': '/ˈhʌri ʌp/',
        'definition_zh': '快点；赶快',
        'page': 4,
        'kind': 'phrase',
    },
    {
        'unit': 1,
        'headword': 'turn off',
        'ipa': '/tɜːn ɒf/',
        'definition_zh': '关掉',
        'page': 5,
        'kind': 'phrase',
    },
    {
        'unit': 2,
        'headword': 'living room',
        'ipa': '/ˈlɪvɪŋ ruːm/',
        'definition_zh': '客厅；起居室',
        'page': 16,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'try on',
        'ipa': '/traɪ ɒn/',
        'definition_zh': '试穿',
        'page': 45,
        'kind': 'phrase',
    },
    {
        'unit': 6,
        'headword': 'set the table',
        'ipa': '/set ðə ˈteɪbl/',
        'definition_zh': '摆放餐具',
        'page': 68,
        'kind': 'phrase',
    },
]

# 解析器 IPA/释义错误但 headword 正确的条目
PATCH: dict[str, dict] = {
    'hand out': {
        'unit': 1,
        'headword': 'hand out',
        'ipa': '/hænd aʊt/',
        'definition_zh': '分发',
        'page': 9,
        'kind': 'phrase',
    },
    'green bean': {
        'unit': 5,
        'headword': 'green bean',
        'ipa': '/ɡriːn biːn/',
        'definition_zh': '青刀豆；四季豆',
        'page': 57,
        'kind': 'phrase',
    },
}


def apply_vocab_fixes(rows: list[dict]) -> list[dict]:
    by_headword: dict[str, dict] = {}
    for row in rows:
        key = row['headword'].lower()
        if key in REMOVE:
            continue
        row = copy.deepcopy(row)
        if key in PATCH:
            row = copy.deepcopy(PATCH[key])
        if key not in by_headword or row['unit'] < by_headword[key]['unit']:
            by_headword[key] = row
    for row in ADD:
        key = row['headword'].lower()
        by_headword[key] = copy.deepcopy(row)
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
