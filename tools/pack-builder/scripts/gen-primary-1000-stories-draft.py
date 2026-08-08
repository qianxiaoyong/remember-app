#!/usr/bin/env python3
"""Generate primary-1000-stories C1-C3 draft source data."""
import copy
import json
import os
import shutil

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
OUT = os.path.join(ROOT, 'tools', 'pack-builder', 'source', 'primary-1000-stories')
os.makedirs(os.path.join(OUT, 'assets', 'audio'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'assets', 'images'), exist_ok=True)

src_assets = os.path.join(
    ROOT, 'tools', 'pack-builder', 'source', 'story-test-pack', 'assets'
)
for n in (1, 2, 3):
    shutil.copy2(
        os.path.join(src_assets, 'audio', 'c1.mp3'),
        os.path.join(OUT, 'assets', 'audio', f'c{n}.mp3'),
    )
    shutil.copy2(
        os.path.join(src_assets, 'images', 'c1.png'),
        os.path.join(OUT, 'assets', 'images', f'c{n}.png'),
    )

C1_TIER = {
    'happy': 'mid',
    'marry': 'low',
    'look': 'high',
    'find': 'high',
    'meet': 'mid',
    'many': 'high',
    'old': 'high',
    'small': 'high',
    'big': 'high',
    'beautiful': 'mid',
    'girl': 'mid',
    'come': 'high',
    'rain': 'mid',
    'say': 'high',
    'need': 'low',
    'bed': 'mid',
    'like': 'high',
    'think': 'high',
    'have': 'high',
    'idea': 'low',
    'make': 'high',
    'put': 'high',
    'talk': 'mid',
    'hard': 'low',
    'only': 'high',
    'feel': 'low',
    'soft': 'low',
    'ask': 'high',
    'take': 'high',
    'museum': 'low',
    'now': 'high',
    'not': 'mid',
}

C1_GLOSS = {
    'happy': '高兴的；快乐的',
    'marry': '娶；嫁',
    'look': '看；寻找',
    'find': '找到',
    'meet': '遇见',
    'many': '许多',
    'old': '老的',
    'small': '小的',
    'big': '大的',
    'beautiful': '漂亮的',
    'girl': '女孩',
    'come': '来；来到',
    'rain': '下雨',
    'say': '说',
    'need': '需要',
    'bed': '床',
    'like': '喜欢',
    'think': '想；认为',
    'have': '有',
    'idea': '主意',
    'make': '做；制作',
    'put': '放',
    'talk': '说话',
    'hard': '硬的',
    'only': '只有；仅仅',
    'feel': '感觉',
    'soft': '柔软的',
    'ask': '问',
    'take': '带；拿',
    'museum': '博物馆',
    'now': '现在',
    'not': '不',
}

C1_SIDEBAR = [
    ('happy', 'happy', '/ˈhæpi/', 'adj.', '高兴的；快乐的'),
    ('look', 'look', '/lʊk/', 'v.', '看；寻找'),
    ('find', 'find', '/faɪnd/', 'v.', '找到'),
    ('many', 'many', '/ˈmeni/', 'adj.', '许多'),
    ('old', 'old', '/əʊld/', 'adj.', '老的'),
    ('small', 'small', '/smɔːl/', 'adj.', '小的'),
    ('big', 'big', '/bɪɡ/', 'adj.', '大的'),
    ('come', 'come', '/kʌm/', 'v.', '来；来到'),
    ('say', 'say', '/seɪ/', 'v.', '说'),
    ('like', 'like', '/laɪk/', 'v.', '喜欢'),
    ('think', 'think', '/θɪŋk/', 'v.', '想；认为'),
    ('have', 'have', '/hæv/', 'v.', '有'),
    ('make', 'make', '/meɪk/', 'v.', '做；制作'),
    ('put', 'put', '/pʊt/', 'v.', '放'),
    ('only', 'only', '/ˈəʊnli/', 'adv.', '只有；仅仅'),
    ('ask', 'ask', '/ɑːsk/', 'v.', '问'),
    ('take', 'take', '/teɪk/', 'v.', '带；拿'),
    ('now', 'now', '/naʊ/', 'adv.', '现在'),
    ('not', 'not', '/nɒt/', 'adv.', '不'),
    ('meet', 'meet', '/miːt/', 'v.', '遇见'),
    ('beautiful', 'beautiful', '/ˈbjuːtɪfl/', 'adj.', '漂亮的'),
    ('girl', 'girl', '/ɡɜːl/', 'n.', '女孩'),
    ('rain', 'rain', '/reɪn/', 'v.', '下雨'),
    ('bed', 'bed', '/bed/', 'n.', '床'),
    ('talk', 'talk', '/tɔːk/', 'v.', '说话'),
    ('marry', 'marry', '/ˈmæri/', 'v.', '娶；嫁'),
    ('need', 'need', '/niːd/', 'v.', '需要'),
    ('idea', 'idea', '/aɪˈdɪə/', 'n.', '主意'),
    ('hard', 'hard', '/hɑːd/', 'adj.', '硬的'),
    ('feel', 'feel', '/fiːl/', 'v.', '感觉'),
    ('soft', 'soft', '/sɒft/', 'adj.', '柔软的'),
    ('museum', 'museum', '/mjuːˈziːəm/', 'n.', '博物馆'),
]

with open(
    os.path.join(ROOT, 'tools/pack-builder/source/story-test-pack/cards.json'),
    encoding='utf-8',
) as f:
    c1_src = json.load(f)[0]

c1 = copy.deepcopy(c1_src)
c1['sortOrder'] = 1
c1['content']['lesson']['code'] = 'C1'
c1['content']['lesson']['titleEn'] = 'The Princess and the Pea'
c1['content']['lesson']['titleZh'] = '公主与豌豆'
c1['content']['lesson']['coverImage'] = 'assets/images/c1.png'
c1['content']['lesson']['primaryAudio'] = 'assets/audio/c1.mp3'

for paragraph in c1['content']['story']['paragraphs']:
    paragraph.pop('audioStartMs', None)
    paragraph.pop('audioEndMs', None)
    for run in paragraph['runs']:
        if run['kind'] != 'word':
            continue
        vid = run['vocabId']
        if vid in C1_TIER:
            run['tier'] = C1_TIER[vid]
        if vid in C1_GLOSS:
            run['glossZh'] = C1_GLOSS[vid]

c1['content']['sidebar'] = [
    {
        'vocabId': vid,
        'headword': head,
        'ipa': ipa,
        'pos': pos,
        'definitionZh': defn,
        'tier': C1_TIER[vid],
    }
    for vid, head, ipa, pos, defn in C1_SIDEBAR
]


def text_run(text: str) -> dict:
    return {'kind': 'text', 'text': text}


def word_run(surface: str, vid: str, gloss: str, tier: str) -> dict:
    return {
        'kind': 'word',
        'surface': surface,
        'vocabId': vid,
        'glossZh': gloss,
        'tier': tier,
    }


def build_from_tokens(tokens, translation_zh: str) -> dict:
    runs = []
    for token in tokens:
        if isinstance(token, str):
            runs.append(text_run(token))
        else:
            surface, vid, gloss, tier = token
            runs.append(word_run(surface, vid, gloss, tier))
    return {'runs': runs, 'translationZh': translation_zh}


C2_VOCAB = {
    'sunny': ('mid', '晴朗的', '/ˈsʌni/', 'adj.', '晴朗的'),
    'grass': ('mid', '草', '/ɡrɑːs/', 'n.', '草'),
    'green': ('high', '绿色的', '/ɡriːn/', 'adj.', '绿色的'),
    'sky': ('mid', '天空', '/skaɪ/', 'n.', '天空'),
    'blue': ('high', '蓝色的', '/bluː/', 'adj.', '蓝色的'),
    'jump': ('high', '跳', '/dʒʌmp/', 'v.', '跳'),
    'sing': ('high', '唱', '/sɪŋ/', 'v.', '唱'),
    'song': ('low', '歌曲', '/sɒŋ/', 'n.', '歌曲'),
    'happy': ('mid', '快乐的', '/ˈhæpi/', 'adj.', '快乐的'),
    'see': ('high', '看见', '/siː/', 'v.', '看见'),
    'work': ('high', '工作', '/wɜːk/', 'v.', '工作'),
    'hard': ('low', '辛勤地', '/hɑːd/', 'adv.', '辛勤地；困难地'),
    'find': ('high', '找到', '/faɪnd/', 'v.', '找到'),
    'talk': ('mid', '谈话', '/tɔːk/', 'v.', '谈话'),
    'say': ('high', '说', '/seɪ/', 'v.', '说'),
    'save': ('low', '储存；屯粮', '/seɪv/', 'v.', '储存；屯粮'),
    'come': ('high', '来', '/kʌm/', 'v.', '来'),
    'need': ('low', '需要', '/niːd/', 'v.', '需要'),
    'food': ('low', '食物', '/fuːd/', 'n.', '食物'),
    'change': ('low', '变化', '/tʃeɪndʒ/', 'v.', '变化'),
    'tree': ('mid', '树', '/triː/', 'n.', '树'),
    'cold': ('high', '冷的', '/kəʊld/', 'adj.', '冷的'),
    'hungry': ('mid', '饥饿的', '/ˈhʌŋɡri/', 'adj.', '饥饿的'),
    'know': ('high', '知道', '/nəʊ/', 'v.', '知道'),
}


def w2(surface: str, vid: str):
    tier, gloss, _ipa, _pos, _defn = C2_VOCAB[vid]
    return surface, vid, gloss, tier


c2_paragraphs = [
    build_from_tokens(
        [
            'It is a ',
            w2('sunny', 'sunny'),
            ' summer day. The ',
            w2('grass', 'grass'),
            ' is ',
            w2('green', 'green'),
            '. The ',
            w2('sky', 'sky'),
            ' is ',
            w2('blue', 'blue'),
            '.',
        ],
        '这是一个阳光明媚的夏日。草是绿色的，天空是蓝色的。',
    ),
    build_from_tokens(
        [
            'The Grasshopper is ',
            w2('jumping', 'jump'),
            ' up and down and ',
            w2('singing', 'sing'),
            ' a ',
            w2('song', 'song'),
            '. He is a ',
            w2('happy', 'happy'),
            ' Grasshopper. He is ',
            w2('happy', 'happy'),
            '.',
        ],
        '蚱蜢上下跳跃，唱着歌。他是一只快乐的蚱蜢，非常开心。',
    ),
    build_from_tokens(
        [
            'The Grasshopper ',
            w2('sees', 'see'),
            ' Ant ',
            w2('working', 'work'),
            ' ',
            w2('hard', 'hard'),
            '. She is ',
            w2('finding', 'find'),
            ' corn.',
        ],
        '蚱蜢看见蚂蚁在辛勤工作，正在找玉米。',
    ),
    build_from_tokens(
        [
            '"',
            w2('Come', 'come'),
            ' ',
            w2('talk', 'talk'),
            ' with me, Ant. Let\'s ',
            w2('sing', 'sing'),
            ' a ',
            w2('song', 'song'),
            '!" ',
            w2('says', 'say'),
            ' Grasshopper.',
        ],
        '「来和我聊天吧，蚂蚁。我们唱首歌！」蚱蜢说。',
    ),
    build_from_tokens(
        [
            '"',
            w2('Work', 'work'),
            ', work, work! ',
            w2('Save', 'save'),
            ', save, save! There is no time. Winter is coming!" ',
            w2('says', 'say'),
            ' Ant.',
        ],
        '「工作、工作、工作！储存、储存、储存！没时间了，冬天要来了！」蚂蚁说。',
    ),
    build_from_tokens(
        [
            '"Winter? No! It is a ',
            w2('sunny', 'sunny'),
            ' summer day!" ',
            w2('says', 'say'),
            ' Grasshopper.',
        ],
        '「冬天？不！这是一个阳光明媚的夏日！」蚱蜢说。',
    ),
    build_from_tokens(
        [
            '"',
            w2('Come', 'come'),
            ' ',
            w2('work', 'work'),
            ' with me, Grasshopper. You ',
            w2('need', 'need'),
            ' ',
            w2('food', 'food'),
            '," ',
            w2('says', 'say'),
            ' Ant.',
        ],
        '「来和我一起工作吧，蚱蜢。你需要食物，」蚂蚁说。',
    ),
    build_from_tokens(
        [
            '"',
            w2('Work', 'work'),
            ', work, work!" she ',
            w2('says', 'say'),
            '. "',
            w2('Save', 'save'),
            ', save, save! Winter is coming!" Grasshopper does not ',
            w2('work', 'work'),
            ' with Ant. He does not ',
            w2('save', 'save'),
            ' ',
            w2('food', 'food'),
            ' for winter.',
        ],
        '「工作、工作、工作！」她说。「储存、储存、储存！冬天要来了！」蚱蜢不和蚂蚁一起工作，也不为冬天储存食物。',
    ),
    build_from_tokens(
        [
            'Ant ',
            w2('works', 'work'),
            ' ',
            w2('hard', 'hard'),
            '. She ',
            w2('saves', 'save'),
            ' lots of ',
            w2('food', 'food'),
            '. The ',
            w2('grass', 'grass'),
            ' ',
            w2('changes', 'change'),
            '. The ',
            w2('trees', 'tree'),
            ' ',
            w2('change', 'change'),
            '. "Winter is coming!" ',
            w2('says', 'say'),
            ' Ant.',
        ],
        '蚂蚁辛勤工作，储存了很多食物。草变了，树也变了。「冬天要来了！」蚂蚁说。',
    ),
    build_from_tokens(
        [
            'Winter is ',
            w2('cold', 'cold'),
            '! Grasshopper has no ',
            w2('food', 'food'),
            '. He is ',
            w2('hungry', 'hungry'),
            '. Now Grasshopper ',
            w2('knows', 'know'),
            '. ',
            w2('Work', 'work'),
            ', work, work! ',
            w2('Save', 'save'),
            ', save, save! And you will not be ',
            w2('hungry', 'hungry'),
            '!',
        ],
        '冬天很冷！蚱蜢没有食物，他饿了。现在蚱蜢明白了。工作、工作、工作！储存、储存、储存！你就不会挨饿了！',
    ),
]

c2_sidebar = [
    {
        'vocabId': vid,
        'headword': vid,
        'ipa': ipa,
        'pos': pos,
        'definitionZh': defn,
        'tier': tier,
    }
    for vid, (tier, _gloss, ipa, pos, defn) in C2_VOCAB.items()
]

C3_VOCAB = {
    'get': ('high', '得到', '/ɡet/', 'v.', '得到'),
    'milk': ('mid', '牛奶', '/mɪlk/', 'n.', '牛奶'),
    'put': ('high', '放', '/pʊt/', 'v.', '放'),
    'walk': ('high', '走', '/wɔːk/', 'v.', '走'),
    'home': ('mid', '家', '/həʊm/', 'n.', '家'),
    'talk': ('mid', '谈话', '/tɔːk/', 'v.', '谈话'),
    'make': ('high', '做；制造', '/meɪk/', 'v.', '做；制造'),
    'butter': ('low', '黄油；奶油', '/ˈbʌtə(r)/', 'n.', '黄油；奶油'),
    'sell': ('mid', '卖', '/sel/', 'v.', '卖'),
    'buy': ('high', '买', '/baɪ/', 'v.', '买'),
    'egg': ('mid', '蛋', '/eɡ/', 'n.', '蛋'),
    'chicken': ('mid', '鸡', '/ˈtʃɪkɪn/', 'n.', '鸡'),
    'some': ('high', '一些', '/səm/', 'adj.', '一些'),
    'new': ('high', '新的', '/njuː/', 'adj.', '新的'),
    'look': ('high', '看起来', '/lʊk/', 'v.', '看起来'),
    'good': ('high', '好的', '/ɡʊd/', 'adj.', '好的'),
    'fall': ('high', '落下；摔倒', '/fɔːl/', 'v.', '落下；摔倒'),
    'their': ('high', '他们的', '/ðeə(r)/', 'pron.', '他们的'),
    'ask': ('high', '问', '/ɑːsk/', 'v.', '问'),
    'sad': ('low', '伤心的', '/sæd/', 'adj.', '伤心的'),
    'young': ('mid', '年轻的', '/jʌŋ/', 'adj.', '年轻的'),
    'say': ('high', '说', '/seɪ/', 'v.', '说'),
    'count': ('low', '数；计算', '/kaʊnt/', 'v.', '数；计算'),
}


def w3(surface: str, vid: str):
    tier, gloss, _ipa, _pos, _defn = C3_VOCAB[vid]
    return surface, vid, gloss, tier


c3_paragraphs = [
    build_from_tokens(
        [
            'Two girls ',
            w3('get', 'get'),
            ' milk from their cow. The girls ',
            w3('put', 'put'),
            ' the ',
            w3('milk', 'milk'),
            ' in a pot.',
        ],
        '两个女孩从奶牛那里得到牛奶，把牛奶放进罐子里。',
    ),
    build_from_tokens(
        [
            'They ',
            w3('walk', 'walk'),
            ' ',
            w3('home', 'home'),
            '. As they ',
            w3('walk', 'walk'),
            ', the girls ',
            w3('talk', 'talk'),
            '.',
        ],
        '她们走回家。一路上，女孩们聊着天。',
    ),
    build_from_tokens(
        [
            'The older girl ',
            w3('says', 'say'),
            ', "We can ',
            w3('make', 'make'),
            ' ',
            w3('butter', 'butter'),
            ' with this ',
            w3('milk', 'milk'),
            '."',
        ],
        '姐姐说：「我们可以用这些牛奶做黄油。」',
    ),
    build_from_tokens(
        [
            '"We can ',
            w3('sell', 'sell'),
            ' the ',
            w3('butter', 'butter'),
            ' and ',
            w3('buy', 'buy'),
            ' ',
            w3('eggs', 'egg'),
            '. In time, the ',
            w3('eggs', 'egg'),
            ' will hatch."',
        ],
        '「我们可以卖掉黄油，再买鸡蛋。假以时日，鸡蛋会孵化。」',
    ),
    build_from_tokens(
        [
            '"Then we will have lots of ',
            w3('chickens', 'chicken'),
            '!" "We can ',
            w3('sell', 'sell'),
            ' ',
            w3('chickens', 'chicken'),
            '. Then we can ',
            w3('buy', 'buy'),
            ' ',
            w3('some', 'some'),
            ' ',
            w3('new', 'new'),
            ' clothes."',
        ],
        '「那样我们会有很多鸡！」「我们可以卖鸡，然后买一些新衣服。」',
    ),
    build_from_tokens(
        [
            '"We will ',
            w3('look', 'look'),
            ' ',
            w3('good', 'good'),
            ' in our ',
            w3('new', 'new'),
            ' clothes." The girls are not ',
            w3('looking', 'look'),
            '.',
        ],
        '「我们穿上新衣服会很好看。」女孩们没有在看路。',
    ),
    build_from_tokens(
        [
            'The older girl ',
            w3('falls', 'fall'),
            '. There is no more ',
            w3('milk', 'milk'),
            ' in the pot.',
        ],
        '姐姐摔倒了，罐子里再也没有牛奶了。',
    ),
    build_from_tokens(
        [
            w3('Their', 'their'),
            ' mother ',
            w3('asks', 'ask'),
            ', "What is this?" The girls are ',
            w3('sad', 'sad'),
            '.',
        ],
        '她们的妈妈问：「这是怎么回事？」女孩们很伤心。',
    ),
    build_from_tokens(
        [
            '"We can\'t ',
            w3('sell', 'sell'),
            ' ',
            w3('chickens', 'chicken'),
            '," ',
            w3('says', 'say'),
            ' the older sister.',
        ],
        '「我们不能卖鸡，」姐姐说。',
    ),
    build_from_tokens(
        [
            '"What ',
            w3('chickens', 'chicken'),
            '?" ',
            w3('asks', 'ask'),
            ' their mother.',
        ],
        '「什么鸡？」她们的妈妈问。',
    ),
    build_from_tokens(
        [
            '"The ',
            w3('chickens', 'chicken'),
            ' come from our ',
            w3('eggs', 'egg'),
            '," ',
            w3('says', 'say'),
            ' the ',
            w3('younger', 'young'),
            ' sister.',
        ],
        '「鸡来自我们的鸡蛋，」妹妹说。',
    ),
    build_from_tokens(
        [
            '"What ',
            w3('eggs', 'egg'),
            '?" ',
            w3('asks', 'ask'),
            ' their mother.',
        ],
        '「什么鸡蛋？」她们的妈妈问。',
    ),
    build_from_tokens(
        [
            '"The ',
            w3('eggs', 'egg'),
            ' we will ',
            w3('get', 'get'),
            ' from the ',
            w3('butter', 'butter'),
            '," ',
            w3('says', 'say'),
            ' the ',
            w3('younger', 'young'),
            ' sister.',
        ],
        '「鸡蛋会从黄油里得到，」妹妹说。',
    ),
    build_from_tokens(
        [
            '"We will ',
            w3('make', 'make'),
            ' ',
            w3('butter', 'butter'),
            ' from this ',
            w3('milk', 'milk'),
            '," ',
            w3('says', 'say'),
            ' the older sister.',
        ],
        '「我们会用这些牛奶做黄油，」姐姐说。',
    ),
    build_from_tokens(
        [
            'Their mother ',
            w3('says', 'say'),
            ', "Don\'t ',
            w3('count', 'count'),
            ' your ',
            w3('chickens', 'chicken'),
            ' before they hatch."',
        ],
        '她们的妈妈说：「鸡蛋还没孵，别急着数鸡。」',
    ),
]

c3_sidebar = [
    {
        'vocabId': vid,
        'headword': vid,
        'ipa': ipa,
        'pos': pos,
        'definitionZh': defn,
        'tier': tier,
    }
    for vid, (tier, _gloss, ipa, pos, defn) in C3_VOCAB.items()
]

c2 = {
    'cardType': 'story_reading',
    'sortOrder': 2,
    'content': {
        'lesson': {
            'code': 'C2',
            'titleEn': 'The Ant and the Grasshopper',
            'titleZh': '蚂蚁和蚱蜢',
            'coverImage': 'assets/images/c2.png',
            'primaryAudio': 'assets/audio/c2.mp3',
        },
        'story': {'paragraphs': c2_paragraphs},
        'sidebar': c2_sidebar,
    },
}

c3 = {
    'cardType': 'story_reading',
    'sortOrder': 3,
    'content': {
        'lesson': {
            'code': 'C3',
            'titleEn': 'The Girl and the Pot of Milk',
            'titleZh': '女孩和牛奶罐',
            'coverImage': 'assets/images/c3.png',
            'primaryAudio': 'assets/audio/c3.mp3',
        },
        'story': {'paragraphs': c3_paragraphs},
        'sidebar': c3_sidebar,
    },
}

cards = [c1, c2, c3]

with open(os.path.join(OUT, 'cards.json'), 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)
    f.write('\n')

with open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8') as f:
    json.dump(
        {
            'packId': 'primary-1000-stories',
            'packVersion': '1.0.0',
            'keyId': 'test-v1',
        },
        f,
        ensure_ascii=False,
        indent=2,
    )
    f.write('\n')

with open(os.path.join(OUT, 'lexicon.json'), 'w', encoding='utf-8') as f:
    f.write('[]\n')

print(f'Generated {OUT}')
