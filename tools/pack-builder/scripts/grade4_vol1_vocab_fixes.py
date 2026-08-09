"""Curated vocabulary fixes for en-grade4-v1-rj PDF parse output."""

from __future__ import annotations

import copy

# 附录词表多词短语被误拆为首个词 + 后半 IPA/释义粘连
REMOVE: set[str] = {
    'office',
    'factory',
    'bus',
    'delivery',
    'police',
    'a lot',
}

ADD: list[dict] = [
    {
        'unit': 1,
        'headword': 'office worker',
        'ipa': '/ˈɒfɪs ˈwɜːkə(r)/',
        'definition_zh': '公司职员',
        'page': 5,
        'kind': 'phrase',
    },
    {
        'unit': 1,
        'headword': 'factory worker',
        'ipa': '/ˈfæktri ˈwɜːkə(r)/',
        'definition_zh': '工厂工人',
        'page': 5,
        'kind': 'phrase',
    },
    {
        'unit': 3,
        'headword': 'bus stop',
        'ipa': '/bʌs stɒp/',
        'definition_zh': '公共汽车站',
        'page': 29,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'delivery worker',
        'ipa': '/dɪˈlɪvəri ˈwɜːkə(r)/',
        'definition_zh': '快递员',
        'page': 41,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'police officer',
        'ipa': '/pəˈliːs ˈɒfɪsə(r)/',
        'definition_zh': '警察；警员',
        'page': 41,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'a lot of',
        'ipa': '/ə lɒt əv/',
        'definition_zh': '大量；许多',
        'page': 41,
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
