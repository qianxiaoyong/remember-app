"""Curated vocabulary fixes for en-grade6-v1-rj OCR parse output."""

from __future__ import annotations

import copy

# OCR 误识别 headword → 正确 headword
RENAME: dict[str, str] = {
    'maney': 'money',
    'ssoll': 'sell',
    'jor': 'jar',
    'electriclty': 'electricity',
    'soll': 'soil',
    'eiffel': 'Eiffel Tower',
    'terracotta': 'Terracotta Warriors',
    'count': 'count down',
    'pocket': 'pocket money',
    'runny': 'runny nose',
    'outer': 'outer space',
    'gingerbread': 'gingerbread house',
}

# Appendix 3 / OCR 噪声条目，整包删除
REMOVE: set[str] = {
    'peat',
    'coll',
    'sstar',
    'tocthpaste',
    'umhappy',
    'doytime',
    # OCR 把 Hong Kong-Zhuhai-Macao Bridge 误拆成 Macao
    'macao',
}

# 附录 2 有、OCR 漏掉或并入噪声区的词条
ADD: list[dict] = [
    {
        'unit': 1,
        'headword': 'dry',
        'ipa': '/draɪ/',
        'definition_zh': '干燥的',
        'page': 7,
        'kind': 'word',
    },
    {
        'unit': 2,
        'headword': 'make',
        'ipa': '/meɪk/',
        'definition_zh': '做；使',
        'page': 19,
        'kind': 'word',
    },
    {
        'unit': 2,
        'headword': 'exciting',
        'ipa': '/ɪkˈsaɪtɪŋ/',
        'definition_zh': '令人激动的',
        'page': 20,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'ill',
        'ipa': '/ɪl/',
        'definition_zh': '有病的；不舒服的',
        'page': 28,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'fever',
        'ipa': '/ˈfiːvə(r)/',
        'definition_zh': '发烧；发热',
        'page': 29,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'stay up',
        'ipa': '',
        'definition_zh': '熬夜',
        'page': 31,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'save up',
        'ipa': '',
        'definition_zh': '攒钱',
        'page': 43,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'half',
        'ipa': '/hɑːf/',
        'definition_zh': '一半',
        'page': 44,
        'kind': 'word',
    },
    {
        'unit': 4,
        'headword': 'difficult',
        'ipa': '/ˈdɪfɪkəlt/',
        'definition_zh': '困难的',
        'page': 44,
        'kind': 'word',
    },
    {
        'unit': 5,
        'headword': 'earth',
        'ipa': '/ɜːθ/',
        'definition_zh': '地球',
        'page': 52,
        'kind': 'word',
    },
    {
        'unit': 1,
        'headword': 'Hong Kong-Zhuhai-Macao Bridge',
        'ipa': '',
        'definition_zh': '港珠澳大桥',
        'page': 5,
        'kind': 'phrase',
    },
    {
        'unit': 1,
        'headword': 'Jinggangshan Revolution Museum',
        'ipa': '',
        'definition_zh': '井冈山革命博物馆',
        'page': 8,
        'kind': 'phrase',
    },
    {
        'unit': 1,
        'headword': 'the Red Army',
        'ipa': '',
        'definition_zh': '红军',
        'page': 8,
        'kind': 'phrase',
    },
    {
        'unit': 5,
        'headword': 'space station',
        'ipa': '',
        'definition_zh': '空间站',
        'page': 52,
        'kind': 'phrase',
    },
    {
        'unit': 5,
        'headword': 'astronaut',
        'ipa': '/ˈæstrənɔːt/',
        'definition_zh': '宇航员；航天员',
        'page': 55,
        'kind': 'word',
    },
    {
        'unit': 6,
        'headword': 'run out',
        'ipa': '',
        'definition_zh': '用完',
        'page': 66,
        'kind': 'phrase',
    },
    {
        'unit': 6,
        'headword': 'top',
        'ipa': '/tɒp/',
        'definition_zh': '最高的',
        'page': 68,
        'kind': 'word',
    },
    {
        'unit': 6,
        'headword': 'dirty',
        'ipa': '/ˈdɜːti/',
        'definition_zh': '脏的',
        'page': 68,
        'kind': 'word',
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
