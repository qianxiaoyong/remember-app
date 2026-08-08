#!/usr/bin/env python3
"""Generate en-grade3-v2-rj pack source from parsed vocabulary + textbook examples."""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PACK_ID = 'en-grade3-v2-rj'
PACK_VERSION = '1.0.5'
KEY_ID = 'test-v1'
VOCAB_PATH = ROOT / 'tools/pack-builder/cache/grade3-vol2-vocab.json'
OUTPUT_DIR = ROOT / 'tools/pack-builder/source' / PACK_ID
DATA_PATH = Path(__file__).resolve().parent / 'grade3_vol2_examples_data.py'
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from grade3_vol2_mnemonics import INFLECTION_NOTES, mnemonic_for
from pack_tts_config import PACK_TTS_DIALECT

TOKEN_RE = re.compile(r"[a-zA-Z']+")


def load_data_module():
    spec = importlib.util.spec_from_file_location('grade3_vol2_examples_data', DATA_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def slug(value: str) -> str:
    return (
        value.strip()
        .lower()
        .replace(' ', '-')
        .replace("'", '')
        .replace('?', '')
        .replace('.', '')
    )


def tokenize(sentence: str) -> list[str]:
    return [match.group(0).lower().replace('’', "'") for match in TOKEN_RE.finditer(sentence)]


NOUNS = {
    'after', 'bag', 'ball', 'body', 'book', 'books', 'box', 'boy', 'bread', 'breakfast', 'candy',
    'cap', 'car', 'card', 'class', 'classmate', 'computer', 'country', 'dance', 'dog', 'doll',
    'egg', 'eggs', 'eraser', 'face', 'friend', 'friends', 'fruit', 'gift', 'gifts', 'girl', 'leg',
    'legs', 'man', 'map', 'meat', 'milk', 'money', 'morning', 'mouth', 'neighbour', 'noodle',
    'noodles', 'nose', 'paper', 'pen', 'pencil', 'picture', 'piggy bank', 'plate', 'rice', 'ruler',
    'school', 'shelf', 'shelves', 'song', 'soup', 'student', 'tail', 'teacher', 'thing', 'things',
    'time', 'today', 'tongue', 'toy', 'toys', 'vegetable', 'vegetables', 'way', 'ways', 'woman',
    'word', 'words', 'world', 'yuan', 'boat', 'home', 'bank', 'mr', 'uk', 'china', 'canada', 'usa',
}
VERBS = {
    'dance', 'draw', 'eat', 'find', 'go', 'has', 'have', 'hear', 'help', 'keep', 'learn', 'like',
    'listen', 'look', 'love', 'make', 'pay', 'play', 'put', 'say', 'see', 'share', 'sing', 'smell',
    'talk', 'taste', 'touch', 'use', 'want', 'come', 'tell', 'ask', 'order', 'need', 'reuse',
}
ADJECTIVES = {
    'cool', 'english', 'fat', 'healthy', 'long', 'new', 'nice', 'right', 'short', 'slow', 'thin',
    'very', 'yummy', 'colourful', 'old', 'good', 'big', 'small', 'friendly',
}
NUMBERS = {
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
    'nineteen', 'twenty',
}
FUNCTION_POS = {
    'a': 'det.', 'an': 'det.', 'and': 'conj.', 'are': 'v.', 'at': 'prep.', 'from': 'prep.',
    'he': 'pron.', 'her': 'pron.', 'i': 'pron.', 'in': 'prep.', 'is': 'v.', 'it': 'pron.',
    'me': 'pron.', 'much': 'det.', 'my': 'det.', 'of': 'prep.', 'on': 'prep.', 'or': 'conj.',
    'she': 'pron.', 'so': 'adv.', 'that': 'pron.', 'the': 'det.', 'these': 'pron.', 'this': 'pron.',
    'to': 'prep.', 'under': 'prep.', 'we': 'pron.', 'where': 'adv.', 'who': 'pron.', 'you': 'pron.',
    'your': 'det.', 'about': 'prep.', 'all': 'det.', 'back': 'adv.', 'still': 'adv.', 'very': 'adv.',
}
LEXICON_EXTRAS = {
    'a': '一个；一', 'am': '是', 'an': '一个；一', 'and': '和；与', 'are': '是', 'can': '可以',
    'come': '来', 'do': '做', 'does': '做（第三人称单数）', 'for': '为了；给', 'good': '好的',
    'hello': '你好', 'here': '这里', 'how': '怎样；多么', 'i': '我', 'is': '是', 'it': '它',
    "it's": '它是', 'let': '让', "let's": '让我们', 'like': '喜欢', 'many': '许多', 'me': '我',
    'my': '我的', 'new': '新的', 'no': '不', 'not': '不', 'our': '我们的', 'please': '请',
    'some': '一些', 'sure': '当然', 'thank': '谢谢', 'thanks': '谢谢', 'that': '那；那个',
    "that's": '那是', 'the': '这；那（定冠词）', 'their': '他们的', 'them': '他们（宾格）',
    'there': '那里', 'they': '他们', 'this': '这；这个', "they're": '他们是', 'too': '也',
    'two': '二', 'use': '使用', 'want': '想要', 'we': '我们', 'welcome': '欢迎', 'what': '什么',
    "what's": '是什么', 'would': '想要（礼貌）', "you're": '你是', 'your': '你的；你们的',
    'yuan': '元（人民币）', 'three': '三', 'four': '四', 'five': '五', 'six': '六',
    'dogs': '狗（复数）', 'books': '书（复数）', 'friends': '朋友（复数）', 'things': '东西（复数）',
    'grapes': '葡萄（复数）', 'boxes': '盒子（复数）', 'says': '说（第三人称单数）',
    'smile': '微笑', 'smiles': '微笑（复数）', 'mouth': '嘴', 'ways': '方式（复数）',
    'every': '每个', 'day': '天', 'every day': '每天', 'with': '用；和', 'care': '小心；认真',
    'excuse': '原谅', 'problem': '问题', 'often': '经常', 'out': '外面', 'same': '相同的',
    'food': '食物', 'plate': '盘子', 'old': '旧的', 'many': '许多', 'how many': '多少（可数）',
    'how much': '多少（不可数/价格）', 'or': '或者', 'have': '有', 'has': '有（第三人称单数）',
}


def pos_for(base: str, surface: str) -> str | None:
    lower = base.lower()
    if lower in NOUNS:
        return 'n.'
    if lower in VERBS:
        return 'v.'
    if lower in ADJECTIVES:
        return 'adj.'
    if lower in NUMBERS:
        return 'num.'
    return FUNCTION_POS.get(surface.lower()) or FUNCTION_POS.get(lower)


def infer_form_note(surface: str, base: str) -> str | None:
    if surface == base:
        return None
    if surface.endswith('ies') and base.endswith('y'):
        return f'复数形式，原形为 {base}'
    if surface.endswith('es') and base + 'es' == surface:
        return f'复数形式，原形为 {base}'
    if surface.endswith('s') and base + 's' == surface:
        return f'复数或第三人称单数形式，原形为 {base}'
    if surface.endswith("'s"):
        return f'所有格形式，原形为 {base}'
    return f'词形变化，原形为 {base}'


def build_lexicon(cards: list[dict], rows_by_headword: dict[str, dict]) -> list[dict]:
    lexicon: dict[str, dict] = {}

    def add(surface: str, definition: str, *, ipa: str | None = None, form_note: str | None = None, pos: str | None = None):
        key = surface.lower()
        if key in lexicon:
            return
        entry: dict = {
            'surfaceForm': key,
            'displayForm': surface,
            'definitions': [{'text': definition, **({'pos': pos} if pos else {})}],
        }
        if ipa:
            entry['ipa'] = ipa
        if form_note:
            entry['formNote'] = form_note
        lexicon[key] = entry

    for row in rows_by_headword.values():
        head = row['headword']
        if ' ' in head.strip():
            continue
        key = head.lower()
        pos = pos_for(head, key)
        add(key, row['definition_zh'], ipa=row['ipa'], pos=pos)

    for card in cards:
        head = card['content']['prompt']['headword']
        base_row = rows_by_headword.get(head.lower())
        base_def = base_row['definition_zh'] if base_row else head
        base_ipa = base_row['ipa'] if base_row else None
        for example in card['content']['reveal']['examples']:
            for token in tokenize(example['en']):
                key = token.lower()
                if key in lexicon:
                    continue
                if not re.fullmatch(r"[a-zA-Z']+", key):
                    continue
                direct = rows_by_headword.get(key)
                if direct:
                    add(key, direct['definition_zh'], ipa=direct['ipa'], pos=pos_for(direct['headword'], key))
                    continue
                extra = LEXICON_EXTRAS.get(key)
                if extra:
                    add(key, extra, pos=pos_for(key, key))
                    continue
                base = head.lower()
                if key != base:
                    form_note = infer_form_note(key, base)
                    add(key, f'与 {head} 相关的课文词形', form_note=form_note, pos=pos_for(base, key))
                else:
                    add(key, base_def, ipa=base_ipa, pos=pos_for(head, key))

    return sorted(lexicon.values(), key=lambda item: item['surfaceForm'])


def build_cards(rows: list[dict], data) -> list[dict]:
    cards: list[dict] = []
    for index, row in enumerate(rows, start=1):
        key = row['headword'].lower()
        examples = data.EXAMPLES.get(key)
        if not examples:
            raise KeyError(f'missing examples for {row["headword"]}')
        reveal_examples = [
            {'en': en, 'zh': zh, 'audio': f'assets/audio/examples/{slug(row["headword"])}-{example_index + 1}.mp3'}
            for example_index, (en, zh) in enumerate(examples[:3])
        ]
        pos = pos_for(row['headword'], key)
        definition: dict[str, str] = {'text': row['definition_zh']}
        if pos:
            definition['pos'] = pos
        card: dict = {
            'kind': row['kind'],
            'sortOrder': index,
            'content': {
                'prompt': {
                    'headword': row['headword'],
                    'primaryAudio': f'assets/audio/{slug(row["headword"])}.mp3',
                    'phonetic': {'ipa': row['ipa'], 'dialect': PACK_TTS_DIALECT},
                },
                'reveal': {
                    'definitions': [definition],
                    'examples': reveal_examples,
                    'mnemonic': {'kind': 'association', 'text': mnemonic_for(row['headword'], row['definition_zh'], kind=row['kind'])},
                },
            },
        }
        inflection = INFLECTION_NOTES.get(key)
        if inflection:
            card['content']['reveal']['inflectionNote'] = inflection
        cards.append(card)
    return cards


def unit_stats(rows: list[dict]) -> list[dict]:
    stats: dict[int, dict] = {}
    for index, row in enumerate(rows, start=1):
        unit = row['unit']
        bucket = stats.setdefault(unit, {'unit': f'Unit {unit}', 'cardCount': 0, 'wordCount': 0, 'phraseCount': 0})
        bucket['cardCount'] += 1
        if row['kind'] == 'phrase':
            bucket['phraseCount'] += 1
        else:
            bucket['wordCount'] += 1
    return [stats[key] for key in sorted(stats)]


def main() -> None:
    data = load_data_module()
    rows = json.loads(VOCAB_PATH.read_text(encoding='utf-8'))
    rows_by_headword = {row['headword'].lower(): row for row in rows}
    missing = [row['headword'] for row in rows if row['headword'].lower() not in data.EXAMPLES]
    if missing:
        raise SystemExit(f'missing EXAMPLES for: {", ".join(missing)}')

    cards = build_cards(rows, data)
    lexicon = build_lexicon(cards, rows_by_headword)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / 'meta.json').write_text(
        json.dumps({'packId': PACK_ID, 'packVersion': PACK_VERSION, 'keyId': KEY_ID}, ensure_ascii=False, indent=2)
        + '\n',
        encoding='utf-8',
    )
    (OUTPUT_DIR / 'cards.json').write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUTPUT_DIR / 'lexicon.json').write_text(json.dumps(lexicon, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    stats = {
        'packId': PACK_ID,
        'packVersion': PACK_VERSION,
        'cardCount': len(cards),
        'wordCardCount': sum(1 for row in rows if row['kind'] == 'word'),
        'phraseCardCount': sum(1 for row in rows if row['kind'] == 'phrase'),
        'exampleCount': sum(len(card['content']['reveal']['examples']) for card in cards),
        'lexiconEntryCount': len(lexicon),
        'unitStats': unit_stats(rows),
    }
    (OUTPUT_DIR / 'content-stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'generated {len(cards)} cards and {len(lexicon)} lexicon entries at {OUTPUT_DIR}')


if __name__ == '__main__':
    main()
