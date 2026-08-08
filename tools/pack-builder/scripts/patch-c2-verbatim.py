#!/usr/bin/env python3
"""Patch C2 in primary-1000-stories cards.json with verbatim PDF English."""
from __future__ import annotations

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)
from story_canonical import assert_canonical_paragraph_lengths, assert_paragraphs_match_canonical, load_canonical  # noqa: E402
from story_patch import Mark, SidebarRow, build_lesson_paragraphs, sidebar_json  # noqa: E402

ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')
CARDS_PATH = os.path.join(
    ROOT, 'tools/pack-builder/source/primary-1000-stories/cards.json'
)

C2_SIDEBAR: list[SidebarRow] = [
    ('sunny', '/ˈsʌni/', 'adj.', '晴朗的', 'mid'),
    ('grass', '/ɡrɑːs/', 'n.', '草', 'mid'),
    ('green', '/ɡriːn/', 'adj.', '绿色的', 'high'),
    ('sky', '/skaɪ/', 'n.', '天空', 'mid'),
    ('blue', '/bluː/', 'adj.', '蓝色的', 'high'),
    ('jump', '/dʒʌmp/', 'v.', '跳', 'high'),
    ('sing', '/sɪŋ/', 'v.', '唱', 'high'),
    ('song', '/sɒŋ/', 'n.', '歌曲', 'low'),
    ('happy', '/ˈhæpi/', 'adj.', '快乐的', 'mid'),
    ('see', '/siː/', 'v.', '看见', 'high'),
    ('work', '/wɜːk/', 'v.', '工作', 'high'),
    ('hard', '/hɑːd/', 'adj.', '困难的', 'low'),
    ('find', '/faɪnd/', 'v.', '找到', 'high'),
    ('talk', '/tɔːk/', 'v.', '谈话', 'mid'),
    ('say', '/seɪ/', 'v.', '说', 'high'),
    ('save', '/seɪv/', 'v.', '拯救', 'low'),
    ('come', '/kʌm/', 'v.', '来', 'high'),
    ('need', '/niːd/', 'v.', '需要', 'low'),
    ('food', '/fuːd/', 'n.', '食物', 'low'),
    ('change', '/tʃeɪndʒ/', 'v.', '改变', 'low'),
    ('tree', '/triː/', 'n.', '树', 'mid'),
    ('cold', '/kəʊld/', 'adj.', '冷的', 'high'),
    ('hungry', '/ˈhʌŋɡri/', 'adj.', '饥饿的', 'mid'),
    ('know', '/nəʊ/', 'v.', '知道', 'high'),
]

C2_MARKS: list[list[Mark]] = [
    [('sunny', 'sunny'), ('grass', 'grass'), ('green', 'green')],
    [('sky', 'sky'), ('blue', 'blue')],
    [('jumping', 'jump'), ('singing', 'sing'), ('song', 'song'), ('happy', 'happy')],
    [('sees', 'see'), ('working', 'work'), ('hard', 'hard'), ('finding', 'find')],
    [('Come', 'come'), ('talk', 'talk'), ('sing', 'sing'), ('song', 'song'), ('says', 'say')],
    [('Work', 'work'), ('Save', 'save')],
    [('says', 'say')],
    [],
    [('sunny', 'sunny'), ('says', 'say')],
    [('Come', 'come'), ('work', 'work'), ('need', 'need'), ('food', 'food'), ('says', 'say')],
    [('Work', 'work'), ('says', 'say')],
    [('Save', 'save'), ('work', 'work')],
    [('save', 'save'), ('food', 'food')],
    [('works', 'work'), ('hard', 'hard'), ('saves', 'save'), ('food', 'food')],
    [('grass', 'grass'), ('changes', 'change'), ('trees', 'tree'), ('change', 'change')],
    [('says', 'say')],
    [('cold', 'cold'), ('food', 'food'), ('hungry', 'hungry')],
    [('knows', 'know')],
    [('Work', 'work'), ('Save', 'save')],
    [('hungry', 'hungry')],
]

C2_TRANSLATIONS = [
    '这是一个阳光明媚的夏日。草是绿色的。',
    '天空是蓝色的。',
    '蚱蜢上下跳跃。他在唱歌。他很开心。',
    '蚱蜢看见蚂蚁。她在辛勤工作。她正在找玉米。',
    '「来和我聊聊吧，蚂蚁。我们唱首歌！」蚱蜢说。',
    '「工作、工作、工作！储存、储存、储存！没有时间了。',
    '冬天要来了！」蚂蚁说。',
    '「冬天？不！',
    '这是一个阳光明媚的夏日！」蚱蜢说。',
    '「来和我一起工作吧，蚱蜢。你需要食物，」蚂蚁说。',
    '「工作、工作、工作！」她说。',
    '「储存、储存、储存！冬天要来了！」蚱蜢不和蚂蚁一起工作。',
    '他不储存食物过冬。',
    '蚂蚁辛勤工作。她储存了很多食物。',
    '草变了。树变了。',
    '「冬天要来了！」蚂蚁说。',
    '冬天很冷！蚱蜢没有食物。他饿了。',
    '现在蚱蜢知道了。',
    '工作、工作、工作！储存、储存、储存！',
    '你就不会挨饿了！',
]


def main() -> None:
    assert_canonical_paragraph_lengths('C2')
    canonical = load_canonical('C2')
    paragraphs = build_lesson_paragraphs(canonical, C2_MARKS, C2_TRANSLATIONS, C2_SIDEBAR)
    assert_paragraphs_match_canonical('C2', paragraphs)

    with open(CARDS_PATH, encoding='utf-8') as handle:
        cards = json.load(handle)

    for card in cards:
        if card.get('sortOrder') != 2:
            continue
        card['content']['story']['paragraphs'] = paragraphs
        card['content']['sidebar'] = sidebar_json(C2_SIDEBAR)
        break
    else:
        raise SystemExit('C2 card not found')

    with open(CARDS_PATH, 'w', encoding='utf-8') as handle:
        json.dump(cards, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    print(f'Patched C2: {len(paragraphs)} paragraphs')


if __name__ == '__main__':
    main()
