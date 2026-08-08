#!/usr/bin/env python3
"""Append C39–C40 story cards with verbatim PDF English and vocabulary marks."""
from __future__ import annotations

import json
import os
import shutil
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from story_auto_marks import auto_marks_for_lesson  # noqa: E402
from story_canonical import (  # noqa: E402
    assert_canonical_paragraph_lengths,
    assert_paragraphs_match_canonical,
    load_canonical,
)
from story_lesson_translations_c39_c40 import TRANSLATIONS  # noqa: E402
from story_patch import build_lesson_paragraphs, sidebar_json  # noqa: E402
from story_sidebar_from_pdf import parse_sidebar  # noqa: E402

ROOT = os.path.join(SCRIPT_DIR, '..', '..', '..')
SOURCE = os.path.join(ROOT, 'tools/pack-builder/source/primary-1000-stories')
CARDS_PATH = os.path.join(SOURCE, 'cards.json')
ASSETS_AUDIO = os.path.join(SOURCE, 'assets/audio')
ASSETS_IMAGES = os.path.join(SOURCE, 'assets/images')

LESSON_META: dict[str, dict] = {
    'C39': {
        'sortOrder': 39,
        'titleEn': "You Can't Make Everybody Happy",
        'titleZh': '你不可能让每个人都开心',
    },
    'C40': {
        'sortOrder': 40,
        'titleEn': 'The Wolf and the Fox',
        'titleZh': '狼和狐狸',
    },
}


def build_card(lesson_code: str, sort_order: int, title_en: str, title_zh: str, paragraphs: list[dict], sidebar: list[dict]) -> dict:
    code_lower = lesson_code.lower()
    return {
        'cardType': 'story_reading',
        'sortOrder': sort_order,
        'content': {
            'lesson': {
                'code': lesson_code,
                'titleEn': title_en,
                'titleZh': title_zh,
                'coverImage': f'assets/images/{code_lower}.png',
                'primaryAudio': f'assets/audio/{code_lower}.mp3',
            },
            'story': {'paragraphs': paragraphs},
            'sidebar': sidebar,
        },
    }


def ensure_placeholder_assets() -> None:
    for sort_order in range(39, 41):
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

    for lesson_code, meta in LESSON_META.items():
        assert_canonical_paragraph_lengths(lesson_code)
        canonical = load_canonical(lesson_code)
        sidebar_rows = parse_sidebar(lesson_code)
        vocab_ids = {row[0] for row in sidebar_rows}
        marks = auto_marks_for_lesson(canonical, vocab_ids)
        translations = TRANSLATIONS[lesson_code]
        if len(canonical) != len(translations):
            raise SystemExit(
                f'{lesson_code}: translation count {len(translations)} != {len(canonical)} paragraphs',
            )
        used_vocab_ids = {vocab_id for paragraph_marks in marks for _surface, vocab_id in paragraph_marks}
        sidebar_rows = [row for row in sidebar_rows if row[0] in used_vocab_ids]
        paragraphs = build_lesson_paragraphs(canonical, marks, translations, sidebar_rows)
        assert_paragraphs_match_canonical(lesson_code, paragraphs)
        by_code[lesson_code] = build_card(
            lesson_code,
            meta['sortOrder'],
            meta['titleEn'],
            meta['titleZh'],
            paragraphs,
            sidebar_json(sidebar_rows),
        )
        print(f'{lesson_code}: {len(paragraphs)} paragraphs, {len(sidebar_rows)} sidebar')

    final_cards = sorted(by_code.values(), key=lambda item: item['sortOrder'])

    with open(CARDS_PATH, 'w', encoding='utf-8') as handle:
        json.dump(final_cards, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    print(f'Wrote {len(final_cards)} cards to {CARDS_PATH}')


if __name__ == '__main__':
    main()
