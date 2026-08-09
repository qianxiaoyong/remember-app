"""Curated vocabulary fixes for en-grade3-v1-rj PDF parse output."""

from __future__ import annotations

import copy

# 解析器对「IPA 行 + 下一行中文」分行的词条会漏掉
ADD: list[dict] = [
    {
        'unit': 2,
        'headword': 'grandfather',
        'ipa': '/ˈɡrænfɑːðə(r)/',
        'definition_zh': '（外）祖父；爷爷；姥爷；外公',
        'page': 17,
        'kind': 'word',
    },
    {
        'unit': 2,
        'headword': 'grandmother',
        'ipa': '/ˈɡrænmʌðə(r)/',
        'definition_zh': '（外）祖母；奶奶；姥姥；外婆',
        'page': 17,
        'kind': 'word',
    },
]

# PDF 行 *red /red/ panda 小熊猫 会被误拆为 red（颜色）
REMOVE: set[str] = {'red'}

# 误拆 red panda 后补回 Unit 5 颜色词 red
ADD.append(
    {
        'unit': 5,
        'headword': 'red',
        'ipa': '/red/',
        'definition_zh': '红色；红色的',
        'page': 52,
        'kind': 'word',
    }
)

RENAME: dict[str, str] = {}

# 课文常用表达（不在附录 2 词表，原 mjs 包已收录，保留）
PHRASE_ADD: list[dict] = [
    {
        'unit': 1,
        'headword': "What's your name?",
        'ipa': '/wɒts jɔː(r) neɪm/',
        'definition_zh': '你叫什么名字？',
        'page': 4,
        'kind': 'phrase',
    },
    {
        'unit': 1,
        'headword': 'Nice to meet you.',
        'ipa': '/naɪs tə miːt juː/',
        'definition_zh': '见到你很高兴。',
        'page': 4,
        'kind': 'phrase',
    },
    {
        'unit': 2,
        'headword': 'This is my family.',
        'ipa': '/ðɪs ɪz maɪ ˈfæməli/',
        'definition_zh': '这是我的家人。',
        'page': 17,
        'kind': 'phrase',
    },
    {
        'unit': 3,
        'headword': 'I like animals.',
        'ipa': '/aɪ laɪk ˈænɪmlz/',
        'definition_zh': '我喜欢动物。',
        'page': 28,
        'kind': 'phrase',
    },
    {
        'unit': 3,
        'headword': "Let's play a game.",
        'ipa': '/lets pleɪ ə ɡeɪm/',
        'definition_zh': '我们一起玩游戏吧。',
        'page': 28,
        'kind': 'phrase',
    },
    {
        'unit': 6,
        'headword': 'How old are you?',
        'ipa': '/haʊ əʊld ɑː(r) juː/',
        'definition_zh': '你几岁了？',
        'page': 69,
        'kind': 'phrase',
    },
]

# red panda 正确短语（替换误解析的 red）
PHRASE_ADD.append(
    {
        'unit': 3,
        'headword': 'red panda',
        'ipa': '/red ˈpændə/',
        'definition_zh': '小熊猫',
        'page': 32,
        'kind': 'phrase',
    }
)


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
    for row in ADD + PHRASE_ADD:
        key = row['headword'].lower()
        by_headword[key] = copy.deepcopy(row)
    fixed = list(by_headword.values())
    fixed.sort(key=lambda r: (r['unit'], r['page'], r['headword'].lower()))
    return fixed
