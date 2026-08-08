#!/usr/bin/env python3
"""Patch C3 in primary-1000-stories cards.json with verbatim PDF English."""
import json
import os
import sys
from typing import Literal

Tier = Literal['high', 'mid', 'low']

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
from story_canonical import assert_paragraphs_match_canonical  # noqa: E402

ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')
CARDS_PATH = os.path.join(
    ROOT, 'tools/pack-builder/source/primary-1000-stories/cards.json'
)

C3_SIDEBAR: list[tuple[str, str, str, str, Tier]] = [
    ('get', '/ɡet/', 'v.', '得到', 'high'),
    ('milk', '/mɪlk/', 'n.', '牛奶', 'mid'),
    ('put', '/pʊt/', 'v.', '放', 'high'),
    ('walk', '/wɔːk/', 'v.', '走', 'high'),
    ('home', '/həʊm/', 'n.', '家', 'mid'),
    ('talk', '/tɔːk/', 'v.', '谈话', 'mid'),
    ('make', '/meɪk/', 'v.', '制造', 'high'),
    ('butter', '/ˈbʌtə(r)/', 'n.', '奶油', 'low'),
    ('sell', '/sel/', 'v.', '卖', 'mid'),
    ('buy', '/baɪ/', 'v.', '买', 'high'),
    ('egg', '/eɡ/', 'n.', '蛋', 'mid'),
    ('chicken', '/ˈtʃɪkɪn/', 'n.', '鸡', 'mid'),
    ('some', '/səm/', 'adj.', '一些的', 'high'),
    ('new', '/njuː/', 'adj.', '新的', 'high'),
    ('look', '/lʊk/', 'v.', '看', 'high'),
    ('good', '/ɡʊd/', 'adj.', '好的', 'high'),
    ('fall', '/fɔːl/', 'v.', '落下', 'high'),
    ('their', '/ðeə(r)/', 'pron.', '他们的', 'high'),
    ('ask', '/ɑːsk/', 'v.', '问', 'high'),
    ('sad', '/sæd/', 'adj.', '伤心的', 'low'),
    ('young', '/jʌŋ/', 'adj.', '年轻的', 'mid'),
    ('say', '/seɪ/', 'v.', '说', 'high'),
    ('count', '/kaʊnt/', 'v.', '计算', 'low'),
]

GLOSS = {vid: defn for vid, _ipa, _pos, defn, _tier in C3_SIDEBAR}
TIER = {vid: tier for vid, _ipa, _pos, _defn, tier in C3_SIDEBAR}

Token = str | tuple[str, str]


def w(surface: str, vocab_id: str) -> tuple[str, str]:
    return (surface, vocab_id)


def build_paragraph(tokens: list[Token], translation_zh: str) -> dict:
    runs: list[dict] = []
    for token in tokens:
        if isinstance(token, str):
            runs.append({'kind': 'text', 'text': token})
            continue
        surface, vocab_id = token
        runs.append(
            {
                'kind': 'word',
                'surface': surface,
                'vocabId': vocab_id,
                'glossZh': GLOSS[vocab_id],
                'tier': TIER[vocab_id],
            }
        )
    return {'runs': runs, 'translationZh': translation_zh}


C3_PARAGRAPHS = [
    build_paragraph(
        [
            'Two girls ',
            w('get', 'get'),
            ' milk from their cow. The girls ',
            w('put', 'put'),
            ' the ',
            w('milk', 'milk'),
            ' in a pot.',
        ],
        '两个女孩从奶牛那里得到牛奶。女孩们把牛奶放进罐子里。',
    ),
    build_paragraph(
        [
            'They ',
            w('walk', 'walk'),
            ' ',
            w('home', 'home'),
            '. As they ',
            w('walk', 'walk'),
            ', the girls ',
            w('talk', 'talk'),
            '.',
        ],
        '她们走回家。走着走着，女孩们聊了起来。',
    ),
    build_paragraph(
        [
            'The older girl ',
            w('says', 'say'),
            ', "We can ',
            w('make', 'make'),
            ' ',
            w('butter', 'butter'),
            ' with this ',
            w('milk', 'milk'),
            '."',
        ],
        '姐姐说：「我们可以用这些牛奶做黄油。」',
    ),
    build_paragraph(
        [
            '"We can ',
            w('sell', 'sell'),
            ' the ',
            w('butter', 'butter'),
            ' and ',
            w('buy', 'buy'),
            ' ',
            w('eggs', 'egg'),
            '. In time, the ',
            w('eggs', 'egg'),
            ' will hatch."',
        ],
        '「我们可以卖掉黄油，再买鸡蛋。假以时日，鸡蛋会孵化。」',
    ),
    build_paragraph(
        [
            '"Then we will have lots of ',
            w('chickens', 'chicken'),
            '!" "We can ',
            w('sell', 'sell'),
            ' ',
            w('some', 'some'),
            ' ',
            w('chickens', 'chicken'),
            '. Then we can ',
            w('buy', 'buy'),
            ' ',
            w('new', 'new'),
            ' clothes."',
        ],
        '「那样我们会有很多鸡！」「我们可以卖一些鸡。然后我们可以买新衣服。」',
    ),
    build_paragraph(
        [
            '"We will ',
            w('look', 'look'),
            ' ',
            w('good', 'good'),
            ' in our ',
            w('new', 'new'),
            ' clothes." The girls are not ',
            w('looking', 'look'),
            '.',
        ],
        '「我们穿上新衣服会很好看。」女孩们没有看路。',
    ),
    build_paragraph(
        [
            'The older girl ',
            w('falls', 'fall'),
            '. There is no more ',
            w('milk', 'milk'),
            ' in the pot.',
        ],
        '姐姐摔倒了。罐子里再也没有牛奶了。',
    ),
    build_paragraph(
        [
            w('Their', 'their'),
            ' mother ',
            w('asks', 'ask'),
            ', "What is this?" The girls are ',
            w('sad', 'sad'),
            '.',
        ],
        '她们的妈妈问：「这是怎么回事？」女孩们很伤心。',
    ),
    build_paragraph(
        [
            '"We can\'t ',
            w('sell', 'sell'),
            ' ',
            w('chickens', 'chicken'),
            '," ',
            w('says', 'say'),
            ' the older sister.',
        ],
        '「我们不能卖鸡，」姐姐说。',
    ),
    build_paragraph(
        [
            '"What ',
            w('chickens', 'chicken'),
            '?" ',
            w('asks', 'ask'),
            ' their mother.',
        ],
        '「什么鸡？」她们的妈妈问。',
    ),
    build_paragraph(
        [
            '"The ',
            w('chickens', 'chicken'),
            ' come from our ',
            w('eggs', 'egg'),
            '," ',
            w('says', 'say'),
            ' the ',
            w('younger', 'young'),
            ' sister.',
        ],
        '「鸡来自我们的鸡蛋，」妹妹说。',
    ),
    build_paragraph(
        [
            '"What ',
            w('eggs', 'egg'),
            '?" ',
            w('asks', 'ask'),
            ' their mother.',
        ],
        '「什么鸡蛋？」她们的妈妈问。',
    ),
    build_paragraph(
        [
            '"The ',
            w('eggs', 'egg'),
            ' we will ',
            w('get', 'get'),
            ' from the ',
            w('butter', 'butter'),
            '," ',
            w('says', 'say'),
            ' the ',
            w('younger', 'young'),
            ' sister.',
        ],
        '「鸡蛋会从黄油里得到，」妹妹说。',
    ),
    build_paragraph(
        [
            '"We will ',
            w('make', 'make'),
            ' ',
            w('butter', 'butter'),
            ' from this ',
            w('milk', 'milk'),
            '," ',
            w('says', 'say'),
            ' the older sister.',
        ],
        '「我们会用这些牛奶做黄油，」姐姐说。',
    ),
    build_paragraph(
        [
            w('Their', 'their'),
            ' mother ',
            w('says', 'say'),
            ', "Don\'t ',
            w('count', 'count'),
            ' your ',
            w('chickens', 'chicken'),
            ' before they hatch."',
        ],
        '她们的妈妈说：「鸡蛋还没孵，别急着数鸡。」',
    ),
]

C3_SIDEBAR_JSON = [
    {
        'vocabId': vid,
        'headword': vid,
        'ipa': ipa,
        'pos': pos,
        'definitionZh': defn,
        'tier': tier,
    }
    for vid, ipa, pos, defn, tier in C3_SIDEBAR
]


def main() -> None:
    with open(CARDS_PATH, encoding='utf-8') as handle:
        cards = json.load(handle)

    for card in cards:
        if card.get('sortOrder') != 3:
            continue
        card['content']['story']['paragraphs'] = C3_PARAGRAPHS
        card['content']['sidebar'] = C3_SIDEBAR_JSON
        break
    else:
        raise SystemExit('C3 card not found')

    assert_paragraphs_match_canonical('C3', C3_PARAGRAPHS)

    with open(CARDS_PATH, 'w', encoding='utf-8') as handle:
        json.dump(cards, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    print(f'Patched C3: {len(C3_PARAGRAPHS)} paragraphs')


if __name__ == '__main__':
    main()
