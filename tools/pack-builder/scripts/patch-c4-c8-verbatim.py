#!/usr/bin/env python3
"""Append C4–C8 story cards with verbatim PDF English and vocabulary marks."""
from __future__ import annotations

import json
import os
import shutil
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
from story_canonical import (  # noqa: E402
    assert_canonical_paragraph_lengths,
    assert_paragraphs_match_canonical,
    load_canonical,
)
from story_patch import Mark, SidebarRow, build_lesson_paragraphs, sidebar_json  # noqa: E402

ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')
SOURCE = os.path.join(ROOT, 'tools/pack-builder/source/primary-1000-stories')
CARDS_PATH = os.path.join(SOURCE, 'cards.json')
ASSETS_AUDIO = os.path.join(SOURCE, 'assets/audio')
ASSETS_IMAGES = os.path.join(SOURCE, 'assets/images')

LESSONS: dict[str, dict] = {
    'C4': {
        'sortOrder': 4,
        'titleEn': 'The Fox and the Cat',
        'titleZh': '狐狸和猫',
        'sidebar': [
            ('walk', '/wɔːk/', 'v.', '走', 'high'),
            ('wood', '/wʊd/', 'n.', '木材', 'low'),
            ('like', '/laɪk/', 'v.', '喜欢', 'high'),
            ('dog', '/dɒɡ/', 'n.', '狗', 'mid'),
            ('kill', '/kɪl/', 'v.', '杀死', 'low'),
            ('them', '/ðəm/', 'pron.', '他们(宾格)', 'high'),
            ('stop', '/stɒp/', 'v.', '停止', 'high'),
            ('hear', '/hɪə(r)/', 'v.', '听见', 'mid'),
            ('ask', '/ɑːsk/', 'v.', '问', 'high'),
            ('come', '/kʌm/', 'v.', '来', 'high'),
            ('get', '/ɡet/', 'v.', '得到', 'high'),
            ('us', '/əs/', 'pron.', '我们(宾格)', 'high'),
            ('afraid', '/əˈfreɪd/', 'adj.', '害怕的', 'low'),
            ('say', '/seɪ/', 'v.', '说', 'high'),
            ('laugh', '/lɑːf/', 'v.', '笑', 'high'),
            ('me', '/mi/', 'pron.', '我(宾格)', 'high'),
            ('smart', '/smɑːt/', 'adj.', '聪明的', 'mid'),
            ('have', '/həv/', 'v.', '有', 'high'),
            ('plan', '/plæn/', 'n.', '计划', 'low'),
            ('know', '/nəʊ/', 'v.', '知道', 'high'),
            ('you', '/juː/', 'pron.', '你(宾格)', 'high'),
            ('listen', '/ˈlɪsn/', 'v.', '听', 'mid'),
            ('run', '/rʌn/', 'v.', '跑', 'high'),
            ('tree', '/triː/', 'n.', '树', 'mid'),
            ('yours', '/jɔːz/', 'pron.', '你的东西', 'mid'),
            ('think', '/θɪŋk/', 'v.', '思考', 'high'),
            ('many', '/ˈmeni/', 'adj.', '许多的(可数)', 'high'),
            ('idea', '/aɪˈdɪə/', 'n.', '主意', 'low'),
            ('fast', '/fɑːst/', 'adj.', '快的', 'high'),
        ],
        'marks': [
            [('walking', 'walk'), ('woods', 'wood')],
            [('like', 'like'), ('dogs', 'dog'), ('kill', 'kill'), ('them', 'them')],
            [('stops', 'stop'), ('hear', 'hear'), ('dogs', 'dog'), ('asks', 'ask')],
            [('dogs', 'dog'), ('coming', 'come'), ('get', 'get'), ('us', 'us'), ('says', 'say')],
            [
                ('afraid', 'afraid'),
                ('says', 'say'),
                ('laughing', 'laugh'),
                ('dogs', 'dog'),
                ('get', 'get'),
                ('me', 'me'),
                ('smart', 'smart'),
            ],
            [('say', 'say'), ('smart', 'smart'), ('asks', 'ask')],
            [('have', 'have'), ('plans', 'plan'), ('run', 'run'), ('says', 'say')],
            [('know', 'know'), ('says', 'say')],
            [('laughs', 'laugh')],
            [('kill', 'kill'), ('you', 'you'), ('listen', 'listen')],
            [('runs', 'run'), ('tree', 'tree'), ('plan', 'plan'), ('says', 'say')],
            [('yours', 'yours'), ('thinking', 'think')],
            [('has', 'have'), ('many', 'many'), ('ideas', 'idea')],
            [('thinks', 'think')],
            [('dogs', 'dog'), ('coming', 'come')],
            [('afraid', 'afraid'), ('think', 'think')],
            [('runs', 'run'), ('fast', 'fast'), ('laughing', 'laugh')],
            [('comes', 'come'), ('tree', 'tree')],
        ],
        'translations': [
            '狐狸和猫在树林里散步。',
            '他们不喜欢狗。狗会杀死他们。',
            '狐狸停下来。「你能听到一些狗吗？」他问。',
            '「是的，狗来抓我们了，」猫说。「我们走吧。」',
            '「我不怕，」狐狸笑着说。「狗抓不到我。我很聪明。」',
            '「你为什么说自己聪明？」猫问。',
            '「我有100个逃跑的计划，」狐狸说。',
            '「我只知道一个，」猫说。',
            '狐狸笑了。',
            '「哈哈哈！他们会杀死你的。」猫不听。',
            '猫爬上树。「这是我的计划，」她说。',
            '「你的呢？」狐狸在思考。',
            '狐狸有很多主意。',
            '「我该这样做吗？」他想。',
            '「还是那样做？哦不！」狗来了。',
            '狐狸害怕了。他无法思考。',
            '狐狸尽可能快地逃跑。他现在不笑了。',
            '猫从树上下来。',
        ],
    },
    'C5': {
        'sortOrder': 5,
        'titleEn': 'The Fox and the Grapes',
        'titleZh': '狐狸和葡萄',
        'sidebar': [
            ('sun', '/sʌn/', 'n.', '太阳', 'mid'),
            ('hot', '/hɒt/', 'adj.', '热的', 'high'),
            ('walk', '/wɔːk/', 'v.', '走', 'high'),
            ('forest', '/ˈfɒrɪst/', 'n.', '森林', 'mid'),
            ('thirsty', '/ˈθɜːsti/', 'adj.', '口渴的', 'low'),
            ('see', '/siː/', 'v.', '看见', 'high'),
            ('need', '/niːd/', 'v.', '需要', 'low'),
            ('run', '/rʌn/', 'v.', '跑', 'high'),
            ('jump', '/dʒʌmp/', 'v.', '跳', 'high'),
            ('want', '/wɒnt/', 'v.', '想要', 'high'),
            ('sad', '/sæd/', 'adj.', '伤心的', 'low'),
            ('sour', '/ˈsaʊə(r)/', 'adj.', '酸的', 'low'),
            ('ask', '/ɑːsk/', 'v.', '问', 'high'),
            ('teacher', '/ˈtiːtʃə(r)/', 'n.', '教师', 'mid'),
            ('say', '/seɪ/', 'v.', '说', 'high'),
            ('true', '/truː/', 'adj.', '真实的', 'low'),
        ],
        'marks': [
            [('sun', 'sun'), ('hot', 'hot'), ('walks', 'walk'), ('forest', 'forest')],
            [('thirsty', 'thirsty'), ('sees', 'see')],
            [],
            [('thirsty', 'thirsty'), ('need', 'need'), ('says', 'say')],
            [('runs', 'run'), ('jumps', 'jump')],
            [('wants', 'want'), ('runs', 'run'), ('jumps', 'jump')],
            [('runs', 'run'), ('jumps', 'jump')],
            [('jump', 'jump')],
            [('sad', 'sad')],
            [('walks', 'walk')],
            [('sour', 'sour'), ('says', 'say')],
            [('asks', 'ask'), ('teacher', 'teacher')],
            [('says', 'say'), ('true', 'true')],
            [('says', 'say'), ('sour', 'sour'), ('says', 'say')],
            [('says', 'say'), ('says', 'say'), ('sour', 'sour')],
            [('says', 'say')],
            [('want', 'want'), ('say', 'say')],
            [('asks', 'ask'), ('teacher', 'teacher')],
            [],
        ],
        'translations': [
            '太阳很热。一只狐狸走进森林。',
            '狐狸非常口渴！它看到一些葡萄。',
            '葡萄高高地挂在树上。',
            '「我太渴了。我需要那些葡萄！」狐狸说。',
            '狐狸又跑又跳。它够不到葡萄。',
            '狐狸想要那些葡萄！它又跑又跳。',
            '然后它又跑又跳。',
            '狐狸没有得到葡萄。它跳不高。',
            '它够不到它们。狐狸很伤心。',
            '它走开了。',
            '「那些葡萄一定是酸的！」狐狸说。',
            '「你觉得怎么样，我的孩子？」老师问。',
            '「狐狸说的是真的吗？」',
            '「狐狸说那些葡萄是酸的，」男孩说。「但他不知道。」',
            '「是的，」老师说。「他够不到它们，所以他说它们是酸的。」',
            '老师说：「有些东西我们无法拥有。」',
            '「我们想要它们。但我们无法拥有它们。所以我们说我们不想拥有它们。」',
            '「你会这样做吗？」老师问。',
            '「想想吧！」',
        ],
    },
    'C6': {
        'sortOrder': 6,
        'titleEn': 'The Girl in Red',
        'titleZh': '穿红衣服的女孩',
        'sidebar': [
            ('girl', '/ɡɜːl/', 'n.', '女孩', 'mid'),
            ('red', '/red/', 'adj.', '红色的', 'high'),
            ('say', '/seɪ/', 'v.', '说', 'high'),
            ('food', '/fuːd/', 'n.', '食物', 'low'),
            ('your', '/jɔː(r)/', 'pron.', '你的', 'high'),
            ('grandmother', '/ˈɡrænmʌðə(r)/', 'n.', '祖母', 'mid'),
            ('wood', '/wʊd/', 'n.', '木材', 'low'),
            ('live', '/lɪv/', 'v.', '住', 'high'),
            ('see', '/siː/', 'v.', '看见', 'high'),
            ('run', '/rʌn/', 'v.', '跑', 'high'),
            ('get', '/ɡet/', 'v.', '得到', 'high'),
            ('hello', '/həˈləʊ/', 'int.', '你好', 'low'),
            ('sound', '/saʊnd/', 'v.', '听起来', 'mid'),
            ('strange', '/streɪndʒ/', 'adj.', '奇怪的', 'low'),
            ('little', '/ˈlɪtl/', 'adj.', '不多的', 'high'),
            ('sick', '/sɪk/', 'adj.', '生病的', 'low'),
            ('look', '/lʊk/', 'v.', '看', 'high'),
            ('man', '/mæn/', 'n.', '男人', 'mid'),
        ],
        'marks': [
            [('girl', 'girl'), ('red', 'red'), ('says', 'say'), ('food', 'food'), ('your', 'your'), ('grandmother', 'grandmother')],
            [('woods', 'wood')],
            [('lives', 'live'), ('woods', 'wood'), ('sees', 'see')],
            [('runs', 'run'), ('gets', 'get')],
            [('sees', 'see')],
            [('grandmother', 'grandmother')],
            [('girl', 'girl'), ('says', 'say'), ('Hello', 'hello')],
            [('says', 'say'), ('Hello', 'hello')],
            [('says', 'say'), ('sound', 'sound'), ('strange', 'strange')],
            [('little', 'little'), ('sick', 'sick')],
            [('says', 'say'), ('look', 'look'), ('strange', 'strange')],
            [('says', 'say'), ('grandmother', 'grandmother')],
            [('runs', 'run'), ('man', 'man')],
            [('grandmother', 'grandmother')],
        ],
        'translations': [
            '一个女孩穿着红衣服。她的妈妈说：「把这食物带给你的外婆。」',
            '穿红衣服的女孩走进森林。',
            '一只狼住在森林里。狼看见穿红衣服的女孩。',
            '狼跑起来。它先到了外婆家。',
            '外婆看见了狼。狼进了衣柜。',
            '狼穿上外婆的衣服。',
            '穿红衣服的女孩到了外婆家。女孩说：「你好，外婆。」',
            '狼说：「你好。」',
            '女孩说：「你的声音很奇怪，外婆。」',
            '狼说：「我有点不舒服。」',
            '女孩说：「你看起来很奇怪，外婆。」',
            '狼说：「我不是你的外婆！」',
            '女孩跑了！森林里的一个男人看见了女孩和狼。男人赶走了狼。',
            '女孩和她的外婆说：「谢谢你！」',
        ],
    },
    'C7': {
        'sortOrder': 7,
        'titleEn': 'The Two Pots',
        'titleZh': '两个罐子',
        'sidebar': [
            ('strong', '/strɒŋ/', 'adj.', '强大的', 'mid'),
            ('weak', '/wiːk/', 'adj.', '虚弱的', 'low'),
            ('there', '/ðeə(r)/', 'adv.', '那里', 'high'),
            ('nice', '/naɪs/', 'adj.', '不错的', 'mid'),
            ('home', '/həʊm/', 'n.', '家', 'mid'),
            ('come', '/kʌm/', 'v.', '来', 'high'),
            ('water', '/ˈwɔːtə(r)/', 'n.', '水', 'mid'),
            ('take', '/teɪk/', 'v.', '拿', 'high'),
            ('away', '/əˈweɪ/', 'adv.', '离去', 'high'),
            ('together', '/təˈɡeðə(r)/', 'adv.', '在一起', 'high'),
            ('fun', '/fʌn/', 'n.', '乐趣', 'low'),
            ('say', '/seɪ/', 'v.', '说', 'high'),
            ('ask', '/ɑːsk/', 'v.', '问', 'high'),
            ('break', '/breɪk/', 'v.', '打破', 'low'),
            ('sad', '/sæd/', 'adj.', '伤心的', 'low'),
            ('want', '/wɒnt/', 'v.', '想要', 'high'),
            ('know', '/nəʊ/', 'v.', '知道', 'high'),
            ('something', '/ˈsʌmθɪŋ/', 'pron.', '某件事', 'low'),
            ('careful', '/ˈkeəfl/', 'adj.', '小心的', 'low'),
        ],
        'marks': [
            [('strong', 'strong'), ('weak', 'weak')],
            [('There', 'there'), ('nice', 'nice'), ('home', 'home')],
            [('comes', 'come'), ('water', 'water'), ('takes', 'take'), ('away', 'away')],
            [('together', 'together')],
            [('strong', 'strong'), ('weak', 'weak')],
            [('fun', 'fun'), ('says', 'say')],
            [('break', 'break'), ('says', 'say')],
            [('asks', 'ask')],
            [('says', 'say')],
            [('nice', 'nice'), ('says', 'say')],
            [('break', 'break'), ('strong', 'strong'), ('says', 'say')],
            [('sad', 'sad'), ('wants', 'want')],
            [('knows', 'know'), ('something', 'something')],
            [],
            [('careful', 'careful')],
        ],
        'translations': [
            '有些罐子很结实。有些罐子很易碎。',
            '有两个罐子。它们有一个漂亮的家。',
            '一天，洪水来了。水把两个罐子冲走了。',
            '两个罐子一起在水里。',
            '一个罐子结实，一个罐子易碎。',
            '「这真有趣！」结实的罐子说。',
            '「小心！别碰坏我！」易碎的罐子说。',
            '「你想做我的朋友吗？」结实的罐子问。',
            '「不！」易碎的罐子说。',
            '「但我很有趣！而且我人很好！」结实的罐子说。',
            '「你不细心！你会碰坏我！我不像你那么结实，」易碎的罐子说。',
            '结实的罐子很伤心。它想和易碎的罐子做朋友。',
            '但易碎的罐子明白一些道理。',
            '强者与强者做朋友，他们在一起很合适。',
            '弱者与弱者做朋友，他们在一起时小心翼翼。',
        ],
    },
    'C8': {
        'sortOrder': 8,
        'titleEn': 'The Red Shoes',
        'titleZh': '红舞鞋',
        'sidebar': [
            ('poor', '/pɔː(r)/', 'adj.', '穷的', 'low'),
            ('live', '/lɪv/', 'v.', '住', 'high'),
            ('dance', '/dɑːns/', 'v.', '舞蹈', 'mid'),
            ('shoes', '/ʃuːz/', 'n.', '鞋子', 'low'),
            ('wear', '/weə(r)/', 'v.', '穿', 'mid'),
            ('church', '/tʃɜːtʃ/', 'n.', '教堂', 'low'),
            ('other', '/ˈʌðə(r)/', 'adj.', '其他的', 'low'),
            ('listen', '/ˈlɪsn/', 'v.', '听', 'mid'),
            ('start', '/stɑːt/', 'v.', '开始', 'high'),
            ('stop', '/stɒp/', 'v.', '停止', 'high'),
            ('forest', '/ˈfɒrɪst/', 'n.', '森林', 'mid'),
            ('mountain', '/ˈmaʊntən/', 'n.', '山', 'mid'),
            ('sleep', '/sliːp/', 'v.', '睡', 'high'),
            ('take', '/teɪk/', 'v.', '拿', 'high'),
            ('leg', '/leɡ/', 'n.', '腿', 'mid'),
            ('break', '/breɪk/', 'v.', '打破', 'low'),
            ('sorry', '/ˈsɒri/', 'adj.', '遗憾的', 'mid'),
            ('stay', '/steɪ/', 'v.', '停留', 'low'),
            ('home', '/həʊm/', 'n.', '家', 'mid'),
            ('give', '/ɡɪv/', 'v.', '给', 'high'),
            ('rose', '/rəʊz/', 'n.', '玫瑰', 'low'),
            ('magic', '/ˈmædʒɪk/', 'n.', '魔法', 'low'),
            ('leave', '/liːv/', 'v.', '离开', 'mid'),
        ],
        'marks': [
            [('poor', 'poor'), ('lives', 'live')],
            [('dancing', 'dance'), ('shoes', 'shoes')],
            [('wears', 'wear'), ('church', 'church')],
            [('church', 'church'), ('others', 'other')],
            [('listen', 'listen'), ('dance', 'dance')],
            [('start', 'start'), ('stop', 'stop'), ('dancing', 'dance')],
            [('dance', 'dance')],
            [('take', 'take'), ('forest', 'forest'), ('take', 'take'), ('mountains', 'mountain')],
            [],
            [('sleep', 'sleep')],
            [('takes', 'take'), ('legs', 'leg'), ('broken', 'break')],
            [],
            [('church', 'church'), ('sorry', 'sorry')],
            [('stop', 'stop'), ('church', 'church')],
            [('stays', 'stay'), ('home', 'home')],
            [('gives', 'give'), ('roses', 'rose')],
            [('magic', 'magic'), ('leaves', 'leave')],
            [('church', 'church'), ('sorry', 'sorry')],
        ],
        'translations': [
            '凯伦是一个贫穷的女孩。她和一位老妇人住在一起。',
            '凯伦向老妇人要一双红舞鞋。',
            '凯伦穿着红鞋去教堂。',
            '「红鞋不能去教堂，」其他人说。',
            '凯伦不听。凯伦去参加舞会。',
            '鞋子开始跳舞。凯伦无法阻止鞋子跳舞。',
            '它们跳啊跳。',
            '鞋子把她带到森林。鞋子把她带到山里。',
            '鞋子跳了很多天。',
            '凯伦非常累。她无法睡觉。',
            '凯伦脱下鞋子，但她的腿断了。',
            '现在她拄着拐杖走路。',
            '凯伦去教堂。她想说对不起。',
            '红鞋阻止她去教堂。',
            '凯伦待在家里。',
            '一位天使来到凯伦身边。他给她一些玫瑰。',
            '魔法离开了鞋子。凯伦现在摆脱了红舞鞋。',
            '她可以去教堂说对不起了。',
        ],
    },
}


def build_card(lesson_code: str, lesson: dict, paragraphs: list[dict]) -> dict:
    sort_order = lesson['sortOrder']
    code_lower = lesson_code.lower()
    return {
        'cardType': 'story_reading',
        'sortOrder': sort_order,
        'content': {
            'lesson': {
                'code': lesson_code,
                'titleEn': lesson['titleEn'],
                'titleZh': lesson['titleZh'],
                'coverImage': f'assets/images/{code_lower}.png',
                'primaryAudio': f'assets/audio/{code_lower}.mp3',
            },
            'story': {'paragraphs': paragraphs},
            'sidebar': sidebar_json(lesson['sidebar']),
        },
    }


def ensure_placeholder_assets() -> None:
    for sort_order in range(4, 9):
        code = f'c{sort_order}'
        for folder, ext, template in [
            (ASSETS_AUDIO, 'mp3', 'c1.mp3'),
            (ASSETS_IMAGES, 'png', 'c1.png'),
        ]:
            target = os.path.join(folder, f'{code}.{ext}')
            if not os.path.exists(target):
                shutil.copy2(os.path.join(folder, template), target)


def main() -> None:
    ensure_placeholder_assets()

    with open(CARDS_PATH, encoding='utf-8') as handle:
        cards: list[dict] = json.load(handle)

    by_code = {
        card['content']['lesson']['code']: card
        for card in cards
        if card.get('content', {}).get('lesson', {}).get('code')
    }

    for lesson_code, lesson in LESSONS.items():
        assert_canonical_paragraph_lengths(lesson_code)
        canonical = load_canonical(lesson_code)
        paragraphs = build_lesson_paragraphs(
            canonical,
            lesson['marks'],
            lesson['translations'],
            lesson['sidebar'],
        )
        assert_paragraphs_match_canonical(lesson_code, paragraphs)
        by_code[lesson_code] = build_card(lesson_code, lesson, paragraphs)
        print(f'{lesson_code}: {len(paragraphs)} paragraphs')

    final_cards = sorted(by_code.values(), key=lambda item: item['sortOrder'])

    with open(CARDS_PATH, 'w', encoding='utf-8') as handle:
        json.dump(final_cards, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    print(f'Wrote {len(final_cards)} cards to {CARDS_PATH}')


if __name__ == '__main__':
    main()
