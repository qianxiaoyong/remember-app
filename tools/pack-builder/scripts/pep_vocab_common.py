#!/usr/bin/env python3
"""Shared vocabulary parsing and pack generation for PEP grade 4–6 textbooks."""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

import pymupdf

from pack_tts_config import PACK_TTS_DIALECT

ROOT = Path(__file__).resolve().parents[3]
SCRIPT_DIR = Path(__file__).resolve().parent

TOKEN_RE = re.compile(r"[a-zA-Z']+")
UNIT_RE = re.compile(r'^Unit\s+(\d+)\s*$')
PAGE_RE = re.compile(r'^p\.\s*(\d+)\s*$')
INLINE_PAGE_RE = re.compile(r'\s+p\.\s*(\d+)\s*$')
ENTRY_START = re.compile(
    r'^\*?\s*(?P<headword>[A-Za-z][A-Za-z\'\-\s\.…()0-9]*?)\s*(?:\uf020)?\s*(?:/|\uf02f)(?P<ipa>(?:[^/\uf02f\n]|[\uf020-\uf07f])+?)(?:/|\uf02f)\s*(?P<rest>.*)$'
)
ENTRY_PHRASE = re.compile(
    r'^\*?\s*(?P<headword>(?:[A-Za-z][A-Za-z\'\-\s\.…()0-9]+|RSVP))\s*(?:\uf020|\s+)(?P<rest>[（\u4e00-\u9fff].*)$'
)
ENTRY_PHRASE_TIGHT = re.compile(
    r'^\*?\s*(?P<headword>[A-Za-z][A-Za-z\'\-\s\.…()0-9]+?)\uf020(?P<rest>[（\u4e00-\u9fff].*)$'
)
ENTRY_HEADWORD_ONLY = re.compile(
    r'^\*?\s*(?P<headword>[A-Za-z][A-Za-z\'\-\s\.…()0-9]+)\s*$'
)
IN_CLASS_RE = re.compile(r'^in\s+class\s+(.+)$', re.IGNORECASE)

# PEP 部分 PDF 用私有区 Unicode（U+F0xx）嵌入 IPA 字体，需映射为标准 IPA。
PEP_PUA_IPA_MAP: dict[str, str] = {
    '\uf020': '',
    '\uf022': '\u02c8',  # ˈ
    '\uf025': '\u02cc',  # ˌ
    '\uf02f': '/',
    '\uf03a': '\u02d0',  # ː
    '\uf033': '\u025c',  # ɜ
    '\uf040': '\u0259',  # ə
    '\uf041': '\u0251',  # ɑ
    '\uf049': '\u026a',  # ɪ
    '\uf04f': '\u0254',  # ɔ
    '\uf051': '\u0252',  # ɒ
    '\uf053': '\u0283',  # ʃ
    '\uf054': '\u03b8',  # θ
    '\uf055': '\u028a',  # ʊ
    '\uf056': '\u028c',  # ʌ
    '\uf05a': '\u0292',  # ʒ
    '\uf04e': '\u014b',  # ŋ
    '\uf07b': '\u00e6',  # æ
}


def normalize_pep_pua_ipa(raw: str) -> str:
    """Convert PEP PDF private-use IPA glyphs to standard Unicode IPA."""
    if not raw:
        return ''
    text = raw.strip()
    if not any(0xF000 <= ord(c) <= 0xF0FF for c in text):
        cleaned = text.strip('/').strip()
        return f'/{cleaned}/' if cleaned else ''
    out: list[str] = []
    for ch in text:
        mapped = PEP_PUA_IPA_MAP.get(ch)
        if mapped is not None:
            if mapped:
                out.append(mapped)
            continue
        code = ord(ch)
        if 0xF000 <= code <= 0xF07E:
            out.append(chr(code - 0xF000))
        elif ch not in '\uf020':
            out.append(ch)
    ipa = ''.join(out).strip()
    ipa = re.sub(r'/+', '/', ipa)
    if not ipa.startswith('/'):
        ipa = f'/{ipa.lstrip("/")}'
    if not ipa.endswith('/'):
        ipa = f'{ipa}/'
    return ipa


def _strip_page_from_rest(rest: str) -> tuple[str, int | None]:
    inline_page = INLINE_PAGE_RE.search(rest)
    if inline_page:
        page = int(inline_page.group(1))
        rest = INLINE_PAGE_RE.sub('', rest).strip()
        return rest, page
    inline_page = re.search(r'[Pp]\.\s*(\d+)\s*$', rest)
    if inline_page:
        page = int(inline_page.group(1))
        rest = rest[: inline_page.start()].strip()
        return rest, page
    return rest, None


def _clean_definition_text(definition: str) -> str:
    definition = definition.replace('*', '').strip()
    definition = re.sub(r'\s+', '', definition)
    definition = definition.replace('\uf020', '')
    return definition.strip('；， ')


@dataclass
class VocabRow:
    unit: int
    headword: str
    ipa: str
    definition_zh: str
    page: int
    kind: str


TESSDATA = Path(r'C:\Program Files\Tesseract-OCR\tessdata')


@dataclass
class PackConfig:
    pack_id: str
    pack_version: str
    pdf_rel: str
    cache_name: str
    vocab_page_indices: list[int] | None = None  # 0-based; None = auto-detect
    use_ocr: bool = False
    ocr_page_indices: list[int] | None = None
    vocab_format: str = 'pep'  # pep | minjiao_unit


PACK_CONFIGS: dict[str, PackConfig] = {
    'en-grade3-v1-rj': PackConfig(
        pack_id='en-grade3-v1-rj',
        pack_version='1.0.4',
        pdf_rel='imports/最新【人教版】3年级英语课本•上册.pdf',
        cache_name='grade3-vol1-vocab.json',
        vocab_page_indices=[87, 88, 89],
    ),
    'en-grade3-v1-mj': PackConfig(
        pack_id='en-grade3-v1-mj',
        pack_version='1.0.3',
        pdf_rel='imports/最新【闽教版】3年级英语课本•上册.pdf',
        cache_name='grade3-vol1-mj-vocab.json',
        vocab_page_indices=[81, 82, 83, 84],
        vocab_format='minjiao_unit',
    ),
    'en-grade3-v2-mj': PackConfig(
        pack_id='en-grade3-v2-mj',
        pack_version='1.0.2',
        pdf_rel='imports/最新【闽教版】3年级英语课本•下册.pdf',
        cache_name='grade3-vol2-mj-vocab.json',
        vocab_page_indices=[79, 80, 81],
        vocab_format='minjiao_unit',
    ),
    'en-grade4-v1-mj': PackConfig(
        pack_id='en-grade4-v1-mj',
        pack_version='1.0.1',
        pdf_rel='imports/最新【闽教版】4年级英语课本•上册.pdf',
        cache_name='grade4-vol1-mj-vocab.json',
        vocab_page_indices=[79, 80, 81],
        vocab_format='minjiao_unit',
    ),
    'en-grade4-v2-mj': PackConfig(
        pack_id='en-grade4-v2-mj',
        pack_version='1.0.1',
        pdf_rel='imports/最新【闽教版】4年级英语课本•下册.pdf',
        cache_name='grade4-vol2-mj-vocab.json',
        vocab_page_indices=[79, 80, 81],
        vocab_format='minjiao_unit',
    ),
    'en-grade5-v1-mj': PackConfig(
        pack_id='en-grade5-v1-mj',
        pack_version='1.0.1',
        pdf_rel='imports/最新【闽教版】5年级英语课本•上册.pdf',
        cache_name='grade5-vol1-mj-vocab.json',
        vocab_page_indices=[42],
        vocab_format='minjiao_unit',
    ),
    'en-grade5-v2-mj': PackConfig(
        pack_id='en-grade5-v2-mj',
        pack_version='1.0.1',
        pdf_rel='imports/最新【闽教版】5年级英语课本•下册.pdf',
        cache_name='grade5-vol2-mj-vocab.json',
        vocab_page_indices=[43],
        vocab_format='minjiao_unit',
    ),
    'en-grade6-v1-mj': PackConfig(
        pack_id='en-grade6-v1-mj',
        pack_version='1.0.1',
        pdf_rel='imports/最新【闽教版】6年级英语课本•上册.pdf',
        cache_name='grade6-vol1-mj-vocab.json',
        vocab_page_indices=[42],
        vocab_format='minjiao_unit',
    ),
    'en-grade6-v2-mj': PackConfig(
        pack_id='en-grade6-v2-mj',
        pack_version='1.0.1',
        pdf_rel='imports/最新【闽教版】6年级英语课本•下册.pdf',
        cache_name='grade6-vol2-mj-vocab.json',
        vocab_page_indices=[43],
        vocab_format='minjiao_unit',
    ),
    'en-grade3-v2-rj': PackConfig(
        pack_id='en-grade3-v2-rj',
        pack_version='1.0.6',
        pdf_rel='imports/最新【人教版】3年级英语课本•下册.pdf',
        cache_name='grade3-vol2-vocab.json',
        vocab_page_indices=[84, 85, 86],
    ),
    'en-grade4-v1-rj': PackConfig(
        pack_id='en-grade4-v1-rj',
        pack_version='1.0.5',
        pdf_rel='imports/最新【人教版】4年级英语课本•上册.pdf',
        cache_name='grade4-vol1-vocab.json',
        vocab_page_indices=[84, 85, 86],
    ),
    'en-grade4-v2-rj': PackConfig(
        pack_id='en-grade4-v2-rj',
        pack_version='1.0.3',
        pdf_rel='imports/最新【人教版】4年级英语课本•下册.pdf',
        cache_name='grade4-vol2-vocab.json',
        vocab_page_indices=[85, 86, 87],
    ),
    'en-grade5-v1-rj': PackConfig(
        pack_id='en-grade5-v1-rj',
        pack_version='1.0.3',
        pdf_rel='imports/最新【人教版】5年级英语课本•上册.pdf',
        cache_name='grade5-vol1-vocab.json',
        use_ocr=True,
        ocr_page_indices=[85, 86, 87],
    ),
    'en-grade5-v2-rj': PackConfig(
        pack_id='en-grade5-v2-rj',
        pack_version='1.0.5',
        pdf_rel='imports/最新【人教版】5年级英语课本•下册.pdf',
        cache_name='grade5-vol2-vocab.json',
        vocab_page_indices=[77, 78, 79],
    ),
    'en-grade6-v1-rj': PackConfig(
        pack_id='en-grade6-v1-rj',
        pack_version='1.0.3',
        pdf_rel='imports/最新【人教版】6年级英语课本•上册.pdf',
        cache_name='grade6-vol1-vocab.json',
        use_ocr=True,
        ocr_page_indices=[86, 87, 88, 89, 90, 91, 92, 93, 94],
    ),
    'en-grade6-v2-rj': PackConfig(
        pack_id='en-grade6-v2-rj',
        pack_version='1.0.3',
        pdf_rel='imports/最新【人教版】6年级英语课本•下册.pdf',
        cache_name='grade6-vol2-vocab.json',
        vocab_page_indices=[59, 60, 61],
    ),
}

KEY_ID = 'test-v1'

NOUNS = {
    'after', 'afternoon', 'age', 'air', 'animal', 'answer', 'apple', 'arm', 'art', 'aunt', 'baby',
    'back', 'bag', 'ball', 'banana', 'bank', 'basket', 'basketball', 'bear', 'bed', 'bedroom',
    'bee', 'beef', 'before', 'bike', 'bird', 'birthday', 'blackboard', 'boat', 'body', 'book',
    'books', 'box', 'boy', 'bread', 'breakfast', 'brother', 'bus', 'business', 'cake', 'call',
    'candy', 'cap', 'car', 'card', 'cat', 'chair', 'chicken', 'child', 'children', 'china',
    'chore', 'city', 'class', 'classmate', 'classroom', 'clock', 'clothes', 'cloud', 'coat',
    'coffee', 'cola', 'colour', 'computer', 'cook', 'cookie', 'cousin', 'country', 'cow', 'dad',
    'dance', 'day', 'dear', 'desk', 'dinner', 'dog', 'doll', 'door', 'dress', 'drink', 'duck',
    'ear', 'egg', 'elephant', 'email', 'english', 'eraser', 'evening', 'exercise', 'eye', 'face',
    'family', 'fan', 'farm', 'farmer', 'father', 'feet', 'film', 'fish', 'floor', 'flower',
    'food', 'foot', 'football', 'friend', 'friends', 'fruit', 'game', 'garden', 'gift', 'gifts',
    'girl', 'glass', 'glasses', 'goat', 'grandfather', 'grandma', 'grandmother', 'grandpa', 'grape',
    'grass', 'ground', 'guitar', 'gym', 'hair', 'hall', 'hand', 'hat', 'head', 'help', 'hill',
    'history', 'hobby', 'home', 'horse', 'hospital', 'hour', 'house', 'ice', 'idea', 'job',
    'juice', 'key', 'kid', 'kind', 'kitchen', 'kite', 'knife', 'lake', 'language', 'leg',
    'lesson', 'letter', 'library', 'light', 'lion', 'list', 'living room', 'lunch', 'mail',
    'man', 'map', 'math', 'maths', 'meal', 'meat', 'member', 'menu', 'milk', 'minute', 'miss',
    'mom', 'money', 'monday', 'monkey', 'month', 'moon', 'morning', 'mother', 'mouth', 'movie',
    'mr', 'mrs', 'mum', 'museum', 'music', 'name', 'neighbour', 'news', 'night', 'noodle',
    'noodles', 'nose', 'note', 'number', 'office', 'oil', 'orange', 'panda', 'paper', 'parent',
    'park', 'party', 'pen', 'pencil', 'people', 'pet', 'phone', 'photo', 'picture', 'pig',
    'piggy bank', 'place', 'plan', 'plane', 'plant', 'plate', 'play', 'player', 'playground',
    'please', 'pork', 'potato', 'problem', 'question', 'rabbit', 'rain', 'reader', 'restaurant',
    'rice', 'right', 'river', 'road', 'room', 'rule', 'ruler', 'salad', 'school', 'schoolbag',
    'science', 'season', 'seat', 'sheep', 'shelf', 'ship', 'shirt', 'shoe', 'shop', 'shorts',
    'sister', 'skirt', 'sleep', 'snake', 'snow', 'sock', 'sofa', 'song', 'soup', 'space',
    'speak', 'sport', 'spring', 'star', 'station', 'story', 'street', 'student', 'subject',
    'sugar', 'summer', 'sun', 'supermarket', 'sweater', 'swim', 'table', 'tail', 'talk', 'tea',
    'teacher', 'team', 'television', 'test', 'thing', 'things', 'ticket', 'time', 'today',
    'tomato', 'tomorrow', 'tongue', 'tooth', 'toy', 'toys', 'train', 'travel', 'tree', 'trip',
    'trousers', 'try', 'tuesday', 'tv', 'uncle', 'vegetable', 'vegetables', 'village', 'visit',
    'waiter', 'wall', 'water', 'way', 'weather', 'week', 'weekend', 'welcome', 'well', 'whale',
    'window', 'windy', 'winter', 'woman', 'word', 'words', 'work', 'world', 'year', 'yesterday',
    'zoo',
}
VERBS = {
    'answer', 'ask', 'be', 'become', 'begin', 'bring', 'build', 'buy', 'call', 'can', 'carry',
    'clean', 'climb', 'close', 'come', 'cook', 'count', 'cry', 'cut', 'dance', 'do', 'draw',
    'drink', 'drive', 'eat', 'enjoy', 'find', 'finish', 'fly', 'get', 'give', 'go', 'grow',
    'guess', 'have', 'hear', 'help', 'hold', 'jump', 'keep', 'know', 'learn', 'leave', 'let',
    'like', 'listen', 'live', 'look', 'love', 'make', 'meet', 'move', 'need', 'open', 'order',
    'paint', 'pay', 'pick', 'plant', 'play', 'put', 'rain', 'read', 'remember', 'ride', 'run',
    'say', 'see', 'sell', 'send', 'share', 'show', 'sing', 'sit', 'sleep', 'smell', 'smile',
    'speak', 'spend', 'stand', 'start', 'stay', 'stop', 'study', 'swim', 'take', 'talk', 'taste',
    'teach', 'tell', 'think', 'touch', 'travel', 'try', 'turn', 'use', 'visit', 'wait', 'walk',
    'want', 'wash', 'watch', 'wear', 'welcome', 'win', 'work', 'write',
}
ADJECTIVES = {
    'active', 'afraid', 'all', 'amazing', 'angry', 'bad', 'beautiful', 'best', 'big', 'black',
    'blue', 'boring', 'busy', 'careful', 'cheap', 'clean', 'clever', 'close', 'cold', 'cool',
    'cute', 'delicious', 'different', 'early', 'easy', 'empty', 'english', 'excited', 'expensive',
    'famous', 'fast', 'fat', 'favourite', 'fine', 'free', 'fresh', 'friendly', 'fun', 'funny',
    'good', 'great', 'green', 'happy', 'hard', 'healthy', 'heavy', 'helpful', 'high', 'hot',
    'hungry', 'important', 'interesting', 'kind', 'late', 'little', 'long', 'lovely', 'lucky',
    'new', 'nice', 'old', 'open', 'popular', 'pretty', 'quiet', 'ready', 'right', 'round',
    'sad', 'safe', 'same', 'short', 'sick', 'slow', 'small', 'smart', 'special', 'strong',
    'sure', 'sweet', 'tall', 'thin', 'tired', 'true', 'useful', 'warm', 'well', 'white',
    'wonderful', 'wrong', 'young', 'yummy',
}
NUMBERS = {
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
    'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
    'hundred', 'thousand', 'first', 'second', 'third',
}
FUNCTION_POS = {
    'a': 'det.', 'an': 'det.', 'and': 'conj.', 'are': 'v.', 'at': 'prep.', 'but': 'conj.',
    'by': 'prep.', 'can': 'v.', 'could': 'v.', 'do': 'v.', 'does': 'v.', 'for': 'prep.',
    'from': 'prep.', 'he': 'pron.', 'her': 'pron.', 'here': 'adv.', 'his': 'det.', 'how': 'adv.',
    'i': 'pron.', 'if': 'conj.', 'in': 'prep.', 'is': 'v.', 'it': 'pron.', 'its': 'det.',
    'me': 'pron.', 'much': 'det.', 'my': 'det.', 'no': 'det.', 'not': 'adv.', 'of': 'prep.',
    'on': 'prep.', 'or': 'conj.', 'our': 'det.', 'out': 'adv.', 'she': 'pron.', 'so': 'adv.',
    'that': 'pron.', 'the': 'det.', 'their': 'det.', 'them': 'pron.', 'there': 'adv.',
    'these': 'pron.', 'they': 'pron.', 'this': 'pron.', 'to': 'prep.', 'too': 'adv.',
    'under': 'prep.', 'up': 'adv.', 'us': 'pron.', 'very': 'adv.', 'we': 'pron.', 'what': 'pron.',
    'when': 'adv.', 'where': 'adv.', 'who': 'pron.', 'why': 'adv.', 'will': 'v.', 'with': 'prep.',
    'would': 'v.', 'you': 'pron.', 'your': 'det.', 'about': 'prep.', 'all': 'det.', 'any': 'det.',
    'as': 'prep.', 'because': 'conj.', 'before': 'prep.', 'after': 'prep.', 'also': 'adv.',
    'always': 'adv.', 'back': 'adv.', 'both': 'det.', 'each': 'det.', 'every': 'det.',
    'into': 'prep.', 'just': 'adv.', 'many': 'det.', 'more': 'det.', 'most': 'det.',
    'must': 'v.', 'never': 'adv.', 'now': 'adv.', 'off': 'adv.', 'often': 'adv.', 'only': 'adv.',
    'over': 'prep.', 'please': 'int.', 'some': 'det.', 'still': 'adv.', 'than': 'conj.',
    'then': 'adv.', 'today': 'adv.', 'tomorrow': 'adv.', 'usually': 'adv.', 'was': 'v.',
    'were': 'v.', 'yes': 'int.', 'yet': 'adv.', 'yesterday': 'adv.',
}

LEXICON_EXTRAS: dict[str, str] = {
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
    'three': '三', 'four': '四', 'five': '五', 'six': '六', 'with': '用；和', 'care': '小心；认真',
    'every': '每个', 'day': '天', 'every day': '每天', 'out': '外面', 'same': '相同的',
    'food': '食物', 'old': '旧的', 'or': '或者', 'have': '有', 'has': '有（第三人称单数）',
    'how many': '多少（可数）', 'how much': '多少（不可数/价格）', 'excuse': '原谅',
    'problem': '问题', 'often': '经常', 'look at': '看', 'listen to': '听', 'go to': '去',
    'get up': '起床', 'go home': '回家', 'watch tv': '看电视', 'play football': '踢足球',
    'take photos': '拍照', 'do homework': '做作业', 'on foot': '步行', 'by bus': '乘公共汽车',
    'by bike': '骑自行车', 'by car': '乘小汽车', 'by train': '乘火车', 'by plane': '乘飞机',
    'dogs': '狗（复数）', 'books': '书（复数）', 'friends': '朋友（复数）', 'things': '东西（复数）',
    'boxes': '盒子（复数）', 'says': '说（第三人称单数）', 'children': '孩子们', 'feet': '脚（复数）',
    'teeth': '牙齿（复数）', 'men': '男人们', 'women': '女人们', 'people': '人们',
    'went': '去（过去式）', 'did': '做（过去式）', 'was': '是（过去式）', 'were': '是（过去式复数）',
    'had': '有（过去式）', 'made': '制作（过去式）', 'said': '说（过去式）', 'took': '拿（过去式）',
    'came': '来（过去式）', 'saw': '看见（过去式）', 'got': '得到（过去式）', 'found': '找到（过去式）',
    'gave': '给（过去式）', 'told': '告诉（过去式）', 'asked': '问（过去式）', 'played': '玩（过去式）',
    'liked': '喜欢（过去式）', 'loved': '喜爱（过去式）', 'helped': '帮助（过去式）',
    'looked': '看（过去式）', 'listened': '听（过去式）', 'talked': '说话（过去式）',
    'walked': '走（过去式）', 'worked': '工作（过去式）', 'studied': '学习（过去式）',
    'learned': '学习（过去式）', 'learnt': '学习（过去式）', 'lived': '居住（过去式）',
    'visited': '参观（过去式）', 'goes': '去（第三人称单数）',
}


def normalize_headword(raw: str) -> str:
    return ' '.join(raw.replace('*', '').split())


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


def parse_appendix_text(text: str) -> list[VocabRow]:
    rows: list[VocabRow] = []
    unit = 1
    headword: str | None = None
    ipa: str | None = None
    zh_parts: list[str] = []
    page: int | None = None
    pending_headword: str | None = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line in {'Appendix 2', 'Appendix 3', 'Words in each unit', '单 元 词 汇 表'}:
            continue
        if line.isdigit() and len(line) <= 3:
            continue
        if line.startswith('注：') or '黑体词' in line:
            continue

        unit_match = UNIT_RE.match(line)
        if unit_match:
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            pending_headword = None
            unit = int(unit_match.group(1))
            continue

        page_match = PAGE_RE.match(line)
        if page_match:
            page = int(page_match.group(1))
            if pending_headword and zh_parts:
                headword = pending_headword
                pending_headword = None
                headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            else:
                headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            continue

        entry_match = ENTRY_START.match(line)
        if entry_match:
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            headword = normalize_headword(entry_match.group('headword'))
            ipa = normalize_pep_pua_ipa(entry_match.group('ipa'))
            rest = entry_match.group('rest').strip().replace('*', '')
            rest, inline_page = _strip_page_from_rest(rest)
            if inline_page is not None:
                page = inline_page
            if headword.lower() == 'in' and rest.lower().startswith('class'):
                in_class = IN_CLASS_RE.match(rest)
                headword = 'in class'
                ipa = '/ɪn klɑːs/'
                zh_parts = [in_class.group(1).strip()] if in_class else ['在课堂上']
                continue
            zh_parts = [rest] if rest else []
            continue

        phrase_match = ENTRY_PHRASE.match(line) or ENTRY_PHRASE_TIGHT.match(line)
        if phrase_match and not line.strip().startswith('Unit'):
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            pending_headword = None
            headword = normalize_headword(phrase_match.group('headword'))
            ipa = None
            rest = phrase_match.group('rest').strip().replace('*', '')
            rest, inline_page = _strip_page_from_rest(rest)
            if inline_page is not None:
                page = inline_page
            zh_parts = [rest] if rest else []
            continue

        headword_only = ENTRY_HEADWORD_ONLY.match(line)
        if headword_only and not any('\u4e00' <= c <= '\u9fff' for c in line):
            headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            pending_headword = normalize_headword(headword_only.group('headword'))
            ipa = None
            zh_parts = []
            continue

        if pending_headword and re.search(r'[\u4e00-\u9fff（]', line):
            cleaned = line.replace('*', '').strip()
            rest, inline_page = _strip_page_from_rest(cleaned)
            if inline_page is not None:
                page = inline_page
            if rest:
                zh_parts.append(rest)
            if page is not None:
                headword = pending_headword
                pending_headword = None
                headword, ipa, zh_parts, page = flush_entry(unit, headword, ipa, zh_parts, page, rows)
            continue

        if headword:
            cleaned = line.replace('*', '').strip()
            if cleaned:
                zh_parts.append(cleaned)

    flush_entry(unit, headword, ipa, zh_parts, page, rows)

    fixed: list[VocabRow] = []
    for row in rows:
        if row.headword.lower() == 'in' and row.definition_zh == 'class在课堂上':
            continue
        fixed.append(row)
    return fixed


def flush_entry(
    unit: int,
    headword: str | None,
    ipa: str | None,
    zh_parts: list[str],
    page: int | None,
    rows: list[VocabRow],
) -> tuple[str | None, str | None, list[str], int | None]:
    if headword and page is not None:
        definition = _clean_definition_text(''.join(zh_parts))
        if not definition:
            return None, None, [], None
        kind = 'phrase' if ' ' in headword.strip() else 'word'
        ipa_value = normalize_pep_pua_ipa(ipa) if ipa else ''
        rows.append(
            VocabRow(
                unit=unit,
                headword=headword.strip(),
                ipa=ipa_value,
                definition_zh=definition,
                page=page,
                kind=kind,
            )
        )
    return None, None, [], None


INLINE_PAGE_OCR = re.compile(r'[Pp][p.]?\s*-?\s*(\d+)\s*$')
ENTRY_START_OCR = re.compile(
    r'^\*?(?P<headword>[A-Za-z][A-Za-z\'\-\s]*?)\s*/(?P<ipa>[^/]+)/\s*(?P<rest>.*)$'
)


def clean_ocr_definition(raw: str) -> str:
    text = raw.strip().replace('*', '')
    text = re.sub(r'[Pp][p.]?\s*-?\s*\d+\s*$', '', text).strip()
    text = re.sub(r'^[#@\d\s]+', '', text)
    text = re.sub(r'\s+', '', text)
    return text


def extract_page_from_text(text: str) -> int | None:
    match = INLINE_PAGE_OCR.search(text.strip())
    if match:
        return int(match.group(1))
    match = PAGE_RE.match(text.strip())
    if match:
        return int(match.group(1))
    return None


def parse_appendix_ocr_text(text: str) -> list[VocabRow]:
    if 'Appendix 3' in text:
        text = text.split('Appendix 3')[0]
    rows: list[VocabRow] = []
    unit = 1
    headword: str | None = None
    ipa: str | None = None
    zh_parts: list[str] = []
    page: int | None = None

    def flush() -> None:
        nonlocal headword, ipa, zh_parts, page
        if headword and ipa:
            if page is None and zh_parts:
                page = extract_page_from_text(zh_parts[-1])
                if page is not None:
                    zh_parts[-1] = INLINE_PAGE_OCR.sub('', zh_parts[-1]).strip()
            definition = clean_ocr_definition(''.join(zh_parts))
            if definition and page is not None:
                kind = 'phrase' if ' ' in headword.strip() else 'word'
                ipa_clean = ipa.strip().strip("'‘’")
                if not ipa_clean.startswith('/'):
                    ipa_clean = f'/{ipa_clean}/'
                rows.append(
                    VocabRow(
                        unit=unit,
                        headword=headword.strip(),
                        ipa=ipa_clean,
                        definition_zh=definition,
                        page=page,
                        kind=kind,
                    )
                )
        headword, ipa, zh_parts, page = None, None, [], None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith('Appendix') or line in {'Words in each unit', '单元词汇表', 'Ee', 'Cas'}:
            continue
        if '义务教育英语课程标准' in line or '二级词' in line or '黑体词' in line:
            continue
        if line.isdigit() and len(line) <= 3:
            continue

        unit_match = UNIT_RE.match(line) or re.match(r'^unit\s+(\d+)\s*$', line, re.I)
        if unit_match:
            flush()
            unit = int(unit_match.group(1))
            continue

        standalone_page = extract_page_from_text(line)
        if standalone_page is not None and PAGE_RE.match(line):
            page = standalone_page
            flush()
            continue

        entry_match = ENTRY_START_OCR.match(line.replace('‘', "'").replace('’', "'"))
        if entry_match:
            flush()
            headword = normalize_headword(entry_match.group('headword'))
            ipa = entry_match.group('ipa')
            rest = entry_match.group('rest').strip()
            inline_page = extract_page_from_text(rest)
            if inline_page is not None:
                page = inline_page
                rest = INLINE_PAGE_OCR.sub('', rest).strip()
            if rest:
                zh_parts = [rest]
            continue

        if headword:
            inline_page = extract_page_from_text(line)
            if inline_page is not None:
                cleaned = INLINE_PAGE_OCR.sub('', line).strip()
                if cleaned:
                    zh_parts.append(cleaned)
                page = inline_page
                flush()
            else:
                cleaned = line.replace('*', '').strip()
                if cleaned and not cleaned.isdigit():
                    zh_parts.append(cleaned)

    flush()
    return rows


def pdf_has_extractable_text(doc: pymupdf.Document) -> bool:
    for index in range(doc.page_count):
        if doc[index].get_text().strip():
            return True
    return False


def ocr_pdf_pages(doc: pymupdf.Document, page_indices: list[int]) -> str:
    if not TESSDATA.exists():
        raise SystemExit(f'Tesseract tessdata not found at {TESSDATA}')
    chunks: list[str] = []
    matrix = pymupdf.Matrix(2, 2)
    for index in page_indices:
        page = doc[index]
        rect = page.rect
        mid_x = (rect.x0 + rect.x1) / 2
        clips = [
            pymupdf.Rect(rect.x0, rect.y0, mid_x, rect.y1),
            pymupdf.Rect(mid_x, rect.y0, rect.x1, rect.y1),
        ]
        page_chunks: list[str] = []
        for clip in clips:
            pix = page.get_pixmap(matrix=matrix, clip=clip)
            temp = pymupdf.open()
            temp_page = temp.new_page(width=pix.width, height=pix.height)
            temp_page.insert_image(temp_page.rect, pixmap=pix)
            textpage_obj = temp_page.get_textpage_ocr(language='eng+chi_sim', tessdata=str(TESSDATA))
            page_chunks.append(textpage_obj.extractText())
            temp.close()
        chunks.append('\n'.join(page_chunks))
    return '\n'.join(chunks)


def detect_vocab_page_indices(doc: pymupdf.Document) -> list[int]:
    indices: list[int] = []
    for index in range(doc.page_count):
        text = doc[index].get_text()
        if 'Words in each unit' in text or '单元词汇表' in text:
            indices.append(index)
    if indices:
        return indices
    for index in range(max(0, doc.page_count - 20), doc.page_count):
        text = doc[index].get_text()
        if 'Unit 1' in text and re.search(r'/\S+/', text) and 'p.' in text:
            indices.append(index)
    return indices


def _clean_minjiao_line(raw: str) -> str:
    return raw.strip().replace('\u00a0', ' ').replace('\u2002', ' ').replace('\u2019', "'")


def minjiao_kind(headword: str) -> str:
    hw = headword.strip()
    if ' ' in hw or '=' in hw or hw.lower() == 'a/an':
        return 'phrase'
    return 'word'


def parse_minjiao_unit_text(text: str) -> list[VocabRow]:
    """Parse 闽教版 Words and Expressions unit tables (headword + 中文, no IPA)."""
    rows: list[VocabRow] = []
    unit = 1
    pending_headword: str | None = None
    pending_zh: list[str] = []

    def flush() -> None:
        nonlocal pending_headword, pending_zh
        if pending_headword and pending_zh:
            zh = ''.join(pending_zh).replace('\u3000', '').strip()
            rows.append(
                VocabRow(
                    unit=unit,
                    headword=pending_headword,
                    ipa='',
                    definition_zh=zh,
                    page=unit * 10,
                    kind=minjiao_kind(pending_headword),
                )
            )
        pending_headword = None
        pending_zh = []

    for raw_line in text.splitlines():
        line = _clean_minjiao_line(raw_line)
        if not line or (line.isdigit() and len(line) <= 3):
            continue
        if line.startswith('注：') or '黑体词' in line or '课程标准' in line or line.startswith('Words'):
            continue
        if line == 'Story Time' or line.startswith('Story Time'):
            continue

        unit_match = re.match(r'^Unit\s+(\d+)', line, re.IGNORECASE)
        if unit_match:
            flush()
            unit = int(unit_match.group(1))
            continue

        if pending_headword and re.match(r'^[\u4e00-\u9fff（）；，、\s…\.]+$', line):
            pending_zh.append(line)
            continue

        xray_match = re.match(r'^(X-ray)\s+(.+)$', line)
        if xray_match:
            flush()
            pending_headword = xray_match.group(1)
            pending_zh = [xray_match.group(2).replace('X 光', 'X光').strip()]
            continue

        split_match = re.split(r'\s{2,}', line, maxsplit=1)
        if len(split_match) == 2 and re.search(r'[\u4e00-\u9fff]', split_match[1]):
            headword = split_match[0].strip()
            rest = split_match[1].strip()
            if headword.lower().startswith('unit'):
                continue
            flush()
            pending_headword = headword
            pending_zh = [rest]
            continue

        entry_match = re.match(r"^([A-Za-z0-9][A-Za-z0-9'\-/=(). ]*?)\s{1,}(.+)$", line)
        if entry_match:
            headword = entry_match.group(1).strip()
            rest = entry_match.group(2).strip()
            if headword.lower() in {'unit', 'story'}:
                continue
            flush()
            pending_headword = headword
            pending_zh = [rest]

    flush()
    return rows


def parse_vocab(config: PackConfig) -> list[dict]:
    pdf_path = ROOT / config.pdf_rel
    doc = pymupdf.open(pdf_path)
    use_ocr = config.use_ocr or not pdf_has_extractable_text(doc)
    if use_ocr:
        page_indices = config.ocr_page_indices
        if not page_indices:
            raise SystemExit(f'OCR pages not configured for {config.pack_id}')
        appendix_text = ocr_pdf_pages(doc, page_indices)
        ocr_cache = ROOT / 'tools/pack-builder/cache' / config.cache_name.replace('.json', '-ocr.txt')
        ocr_cache.write_text(appendix_text, encoding='utf-8')
        rows = parse_appendix_ocr_text(appendix_text)
    else:
        page_indices = config.vocab_page_indices if config.vocab_page_indices is not None else detect_vocab_page_indices(doc)
        if not page_indices:
            raise SystemExit(f'no vocabulary pages found in {pdf_path}')
        chunks = [doc[index].get_text() for index in page_indices]
        appendix_text = '\n'.join(chunks)
        if config.vocab_format == 'minjiao_unit':
            rows = parse_minjiao_unit_text(appendix_text)
        else:
            rows = parse_appendix_text(appendix_text)
    seen_headwords: dict[str, VocabRow] = {}
    for row in rows:
        key = row.headword.lower()
        existing = seen_headwords.get(key)
        if existing is None:
            seen_headwords[key] = row
            continue
        if row.definition_zh and row.definition_zh not in existing.definition_zh:
            merged = existing.definition_zh
            if merged and row.definition_zh:
                existing.definition_zh = f'{merged}；{row.definition_zh}'
            elif row.definition_zh:
                existing.definition_zh = row.definition_zh
    rows = list(seen_headwords.values())
    for row in rows:
        if row.ipa:
            row.ipa = normalize_pep_pua_ipa(row.ipa)
    cache_path = ROOT / 'tools/pack-builder/cache' / config.cache_name
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    payload = [asdict(row) for row in rows]
    cache_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    return payload


def default_examples(headword: str, definition_zh: str) -> list[tuple[str, str]]:
    key = headword.lower()
    short = definition_zh.split('；')[0].split('，')[0]
    if ' ' in headword.strip():
        return [
            (f'We use "{headword}" in class.', f'我们在课堂上会用到 "{headword}"。'),
            (f'Remember the phrase: {headword}.', f'记住短语：{headword}（{short}）。'),
        ]
    return [
        (f'This is {headword}.', f'这是 {short}（{headword}）。'),
        (f'I know the word {headword}.', f'我认识单词 {headword}。'),
        (f'We learn {headword} in English class.', f'我们在英语课上学 {headword}。'),
    ]


def semantic_mnemonic(headword: str, definition_zh: str, *, kind: str) -> str:
    short = definition_zh.split('；')[0].split('，')[0]
    if kind == 'phrase':
        return f'语义联想：把「{short}」和短语 {headword} 配对记忆。'
    return f'语义联想：把「{short}」和英文 {headword} 配对记忆。'


SOUND_MNEMONICS: dict[str, str] = {
    'see': 'see 读起来接近「西/si」，I see birds 我看见鸟。',
    'he': 'he 读起来接近「嘿/hi」，He is my friend 他是我的朋友。',
    'she': 'she 读起来接近「嘘/she」，She is very nice 她非常友好。',
    'who': 'who 读起来接近「胡/hu」，Who is that girl 那个女孩是谁。',
    'tea': 'tea 读起来接近「茶」，Would you like some tea? 你想喝茶吗？',
    'bee': 'bee 读起来接近「比/bi」，The bee is busy 蜜蜂很忙。',
    'key': 'key 读起来接近「ki」，This is my key 这是我的钥匙。',
}


INFLECTION_NOTES: dict[str, str] = {
    'child': '复数 children',
    'foot': '复数 feet',
    'tooth': '复数 teeth',
    'man': '复数 men',
    'woman': '复数 women',
    'mouse': '复数 mice',
    'goose': '复数 geese',
    'person': '复数 people',
    'leaf': '复数 leaves',
    'knife': '复数 knives',
    'life': '复数 lives',
    'wife': '复数 wives',
    'potato': '复数 potatoes',
    'tomato': '复数 tomatoes',
    'hero': '复数 heroes',
    'photo': '复数 photos',
    'piano': '复数 pianos',
    'radio': '复数 radios',
    'zoo': '复数 zoos',
    'has': '第三人称单数 have',
    'goes': '第三人称单数 go',
    'does': '第三人称单数 do',
    'is': 'be 动词第三人称单数',
    'are': 'be 动词复数形式',
    'was': 'be 动词过去式（单数）',
    'were': 'be 动词过去式（复数）',
}


def mnemonic_for(headword: str, definition_zh: str, *, kind: str) -> str:
    key = headword.lower()
    parts: list[str] = []
    if key in SOUND_MNEMONICS:
        parts.append(f'谐音联想：{SOUND_MNEMONICS[key]}')
    secondary = semantic_mnemonic(headword, definition_zh, kind=kind)
    if parts:
        if secondary not in parts[0]:
            parts.append(secondary)
    else:
        parts.append(secondary)
    return parts[0] if len(parts) == 1 else '\n'.join(parts)


def is_valid_lexicon_surface(surface: str) -> bool:
    return bool(re.fullmatch(r"[a-zA-Z']+", surface))


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
        if not is_valid_lexicon_surface(key):
            continue
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


def clean_definition_zh(text: str) -> str:
    """Remove PDF-inline inflection markers; those belong in inflectionNote."""
    cleaned = re.sub(r'（复数[^）]*）', '', text)
    cleaned = re.sub(r'\(复数[^)]*\)', '', cleaned)
    cleaned = re.sub(r'（[^）]*mice[^）]*）', '', cleaned)
    return cleaned.strip('；， ')


def build_cards(
    rows: list[dict],
    examples_map: dict[str, list[tuple[str, str]]],
    *,
    mnemonic_for_fn=mnemonic_for,
    inflection_notes: dict[str, str] | None = None,
    definition_overrides: dict[str, str] | None = None,
    pos_overrides: dict[str, str] | None = None,
    ipa_overrides: dict[str, str] | None = None,
) -> list[dict]:
    notes = inflection_notes if inflection_notes is not None else INFLECTION_NOTES
    overrides = definition_overrides or {}
    pos_fix = pos_overrides or {}
    ipa_fix = ipa_overrides or {}
    cards: list[dict] = []
    for index, row in enumerate(rows, start=1):
        key = row['headword'].lower()
        examples = examples_map.get(key) or default_examples(row['headword'], row['definition_zh'])
        reveal_examples = [
            {'en': en, 'zh': zh, 'audio': f'assets/audio/examples/{slug(row["headword"])}-{example_index + 1}.mp3'}
            for example_index, (en, zh) in enumerate(examples[:3])
        ]
        pos = pos_fix.get(key) or pos_for(row['headword'], key)
        definition_text = overrides.get(key) or clean_definition_zh(row['definition_zh'])
        definition: dict[str, str] = {'text': definition_text}
        if pos:
            definition['pos'] = pos
        card: dict = {
            'kind': row['kind'],
            'sortOrder': index,
            'content': {
                'prompt': {
                    'headword': row['headword'],
                    'primaryAudio': f'assets/audio/{slug(row["headword"])}.mp3',
                },
                'reveal': {
                    'definitions': [definition],
                    'examples': reveal_examples,
                    'mnemonic': {
                        'kind': 'association',
                        'text': mnemonic_for_fn(row['headword'], definition_text, kind=row['kind']),
                    },
                },
            },
        }
        ipa = ipa_fix.get(key) if key in ipa_fix else row.get('ipa')
        if ipa:
            card['content']['prompt']['phonetic'] = {
                'ipa': ipa,
                'dialect': PACK_TTS_DIALECT,
            }
        inflection = notes.get(key)
        if inflection:
            card['content']['reveal']['inflectionNote'] = inflection
        cards.append(card)
    return cards


def unit_stats(rows: list[dict]) -> list[dict]:
    stats: dict[int, dict] = {}
    for row in rows:
        unit = row['unit']
        bucket = stats.setdefault(unit, {'unit': f'Unit {unit}', 'cardCount': 0, 'wordCount': 0, 'phraseCount': 0})
        bucket['cardCount'] += 1
        if row['kind'] == 'phrase':
            bucket['phraseCount'] += 1
        else:
            bucket['wordCount'] += 1
    return [stats[key] for key in sorted(stats)]


def generate_pack_source(
    config: PackConfig,
    examples_map: dict[str, list[tuple[str, str]]] | None = None,
    *,
    mnemonic_for_fn=mnemonic_for,
    inflection_notes: dict[str, str] | None = None,
    definition_overrides: dict[str, str] | None = None,
    pos_overrides: dict[str, str] | None = None,
    ipa_overrides: dict[str, str] | None = None,
    vocab_fixes_fn=None,
) -> Path:
    cache_path = ROOT / 'tools/pack-builder/cache' / config.cache_name
    if not cache_path.exists():
        parse_vocab(config)
    rows = json.loads(cache_path.read_text(encoding='utf-8'))
    if vocab_fixes_fn is not None:
        rows = vocab_fixes_fn(rows)
    rows_by_headword = {row['headword'].lower(): row for row in rows}
    examples = examples_map or {}
    for row in rows:
        key = row['headword'].lower()
        if key not in examples:
            examples[key] = default_examples(row['headword'], row['definition_zh'])

    cards = build_cards(
        rows,
        examples,
        mnemonic_for_fn=mnemonic_for_fn,
        inflection_notes=inflection_notes,
        definition_overrides=definition_overrides,
        pos_overrides=pos_overrides,
        ipa_overrides=ipa_overrides,
    )
    lexicon = build_lexicon(cards, rows_by_headword)
    output_dir = ROOT / 'tools/pack-builder/source' / config.pack_id
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / 'meta.json').write_text(
        json.dumps({'packId': config.pack_id, 'packVersion': config.pack_version, 'keyId': KEY_ID}, ensure_ascii=False, indent=2)
        + '\n',
        encoding='utf-8',
    )
    (output_dir / 'cards.json').write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (output_dir / 'lexicon.json').write_text(json.dumps(lexicon, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    stats = {
        'packId': config.pack_id,
        'packVersion': config.pack_version,
        'cardCount': len(cards),
        'wordCardCount': sum(1 for row in rows if row['kind'] == 'word'),
        'phraseCardCount': sum(1 for row in rows if row['kind'] == 'phrase'),
        'exampleCount': sum(len(card['content']['reveal']['examples']) for card in cards),
        'lexiconEntryCount': len(lexicon),
        'unitStats': unit_stats(rows),
    }
    (output_dir / 'content-stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return output_dir
