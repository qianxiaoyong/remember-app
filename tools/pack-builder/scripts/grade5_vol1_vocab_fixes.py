"""Curated vocabulary fixes for en-grade5-v1-rj OCR parse output."""

from __future__ import annotations

import copy

# OCR 漏词或误拆后需删除的噪声条目（当前 cache 无单独噪声行，保留空集）
REMOVE: set[str] = set()

# 附录 2 有、OCR 漏掉或并入相邻行的词条
ADD: list[dict] = [
    # Unit 1
    {
        'unit': 1,
        'headword': 'science',
        'ipa': '/ˈsaɪəns/',
        'definition_zh': '科学',
        'page': 7,
        'kind': 'word',
    },
    # Unit 2
    {
        'unit': 2,
        'headword': 'sad',
        'ipa': '/sæd/',
        'definition_zh': '悲哀的；难过的',
        'page': 16,
        'kind': 'word',
    },
    {
        'unit': 2,
        'headword': 'Monday',
        'ipa': '/ˈmʌndeɪ/',
        'definition_zh': '星期一',
        'page': 16,
        'kind': 'word',
    },
    {
        'unit': 2,
        'headword': 'angry',
        'ipa': '/ˈæŋɡri/',
        'definition_zh': '愤怒的；生气的',
        'page': 17,
        'kind': 'word',
    },
    {
        'unit': 2,
        'headword': 'yours',
        'ipa': '/jɔːz/',
        'definition_zh': '您的；你们的（用于书信结尾签名前）',
        'page': 21,
        'kind': 'word',
    },
    # Unit 3
    {
        'unit': 3,
        'headword': 'Wednesday',
        'ipa': '/ˈwenzdeɪ/',
        'definition_zh': '星期三',
        'page': 28,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'Friday',
        'ipa': '/ˈfraɪdeɪ/',
        'definition_zh': '星期五',
        'page': 28,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'Thursday',
        'ipa': '/ˈθɜːzdeɪ/',
        'definition_zh': '星期四',
        'page': 28,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'Sunday',
        'ipa': '/ˈsʌndeɪ/',
        'definition_zh': '星期日',
        'page': 31,
        'kind': 'word',
    },
    {
        'unit': 3,
        'headword': 'evening',
        'ipa': '/ˈiːvnɪŋ/',
        'definition_zh': '晚上；傍晚',
        'page': 33,
        'kind': 'word',
    },
    # Unit 4
    {
        'unit': 4,
        'headword': 'flu',
        'ipa': '/fluː/',
        'definition_zh': '流行性感冒',
        'page': 40,
        'kind': 'word',
    },
    {
        'unit': 4,
        'headword': 'exercise',
        'ipa': '/ˈeksəsaɪz/',
        'definition_zh': '锻炼；训练；操练',
        'page': 40,
        'kind': 'word',
    },
    {
        'unit': 4,
        'headword': 'take care of',
        'ipa': '/teɪk keə əv/',
        'definition_zh': '爱护；照顾',
        'page': 44,
        'kind': 'phrase',
    },
    {
        'unit': 4,
        'headword': 'free',
        'ipa': '/friː/',
        'definition_zh': '没有安排活动的；空闲的',
        'page': 45,
        'kind': 'word',
    },
    # Unit 5
    {
        'unit': 5,
        'headword': 'a little',
        'ipa': '/ə ˈlɪtl/',
        'definition_zh': '少许；一点',
        'page': 52,
        'kind': 'phrase',
    },
    {
        'unit': 5,
        'headword': 'dumpling',
        'ipa': '/ˈdʌmplɪŋ/',
        'definition_zh': '饺子；汤圆',
        'page': 52,
        'kind': 'word',
    },
    {
        'unit': 5,
        'headword': 'interesting',
        'ipa': '/ˈɪntrəstɪŋ/',
        'definition_zh': '有趣的；有吸引力的',
        'page': 55,
        'kind': 'word',
    },
    {
        'unit': 5,
        'headword': 'pull up',
        'ipa': '/pʊl ʌp/',
        'definition_zh': '把……拔起',
        'page': 56,
        'kind': 'phrase',
    },
    {
        'unit': 5,
        'headword': 'round',
        'ipa': '/raʊnd/',
        'definition_zh': '环形的；球形的',
        'page': 57,
        'kind': 'word',
    },
    # Unit 6
    {
        'unit': 6,
        'headword': 'waterfall',
        'ipa': '/ˈwɔːtəfɔːl/',
        'definition_zh': '瀑布',
        'page': 64,
        'kind': 'word',
    },
    {
        'unit': 6,
        'headword': 'go hiking',
        'ipa': '/ɡəʊ ˈhaɪkɪŋ/',
        'definition_zh': '徒步旅行',
        'page': 69,
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
