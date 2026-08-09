"""Mnemonics and inflection notes for PEP Grade 4 English, Volume 2 (下册).

谐音规则与 en-grade3-v2-rj 一致：仅真实谐音，不硬凑；优先语义/形象/拆词联想。
"""

from __future__ import annotations

# 谐音联想：仅 headword 与中文读音确有相似处才写。
SOUND_MNEMONICS: dict[str, str] = {
    'bee': 'bee 听音像「比」，蜜蜂嗡嗡比着谁采蜜快。',
    'dear': 'Dear 写信开头像叫「爹啊」，dear 是亲爱的；也指贵的。',
    'door': 'door 门，音近「多」，多问一句 door 在哪。',
    'fan': 'fan 风扇，音近「番」，夏天多开几番 fan 才凉快。',
    'hat': 'hat 帽子，音近「害特」，大太阳下戴 hat 才不「害」怕晒。',
    'shoe': 'shoe 鞋，音近「舒」，穿 shoe 走路才舒服。',
    'free': 'free 免费，音近「飞」，免费的东西像飞来的好事。',
    'cow': 'cow 奶牛，音近「考」，农场里的 cow 考你认不认识它。',
    'bowl': 'bowl 碗，音近「抱」，双手 bowl 着碗喝汤。',
    'week': 'week 星期，音近「喂克」，一周 week 喂饱七天。',
}

ROOT_MNEMONICS: dict[str, str] = {
    'hurry up': 'hurry 赶快 + up 向上，hurry up 是快点、赶快。',
    'turn off': 'turn 转 + off 关，turn off 是关掉（灯、风扇等）。',
    'living room': 'living 生活 + room 房间，living room 是客厅。',
    'get up': 'get 起来 + up 向上，get up 是起床。',
    'go to school': 'go 去 + to school 学校，go to school 是上学。',
    'go home': 'go 去 + home 家，go home 是回家。',
    'go to bed': 'go 去 + to bed 床，go to bed 是上床睡觉。',
    'try on': 'try 试 + on 穿上，try on 是试穿。',
    'a box of': 'a box 一盒 + of ……的，a box of 是一盒、一箱。',
    'clear the table': 'clear 清理 + the table 餐桌，clear the table 是收拾餐桌。',
    'set the table': 'set 摆放 + the table 餐桌，set the table 是摆餐具。',
    'classroom': 'class 课 + room 房间，classroom 是教室。',
    'blackboard': 'black 黑 + board 板，blackboard 是黑板。',
    'workbook': 'work 练习 + book 书，workbook 是练习册。',
    'newspaper': 'news 新闻 + paper 纸，newspaper 是报纸。',
    'hand out': 'hand 手 + out 出去，hand out 是分发、发下去。',
    'homework': 'home 家 + work 工作，homework 是家庭作业。',
    'bedroom': 'bed 床 + room 房间，bedroom 是卧室。',
    'kitchen': 'kit 成套器具 + chen 音近，kitchen 是厨房。',
    'bathroom': 'bath 洗澡 + room 房间，bathroom 是卫生间。',
    'sunglasses': 'sun 太阳 + glasses 眼镜，sunglasses 是太阳镜。',
    'green bean': 'green 绿 + bean 豆，green bean 是四季豆。',
    'supermarket': 'super 超级 + market 市场，supermarket 是超市。',
    'chopstick': 'chop 砍 + stick 棍，chopstick 是筷子。',
    'helpful': 'help 帮助 + ful，helpful 是有帮助的。',
    'beautiful': 'beauty 美 + ful，beautiful 是美丽的。',
    'delicious': 'delight 愉悦 + ous，delicious 是美味的。',
    'understand': 'under 在…下 + stand 站，understand 是理解、明白。',
    'herself': 'her 她 + self 自己，herself 是她自己。',
}

IMAGE_MNEMONICS: dict[str, str] = {
    'classroom': '想象 classroom 里有课桌、椅子和黑板。',
    'blackboard': '想象 blackboard 上写着白色粉笔字。',
    'desk': '想象 desk 课桌上放着课本和铅笔盒。',
    'chair': '想象 chair 椅子摆在课桌旁边。',
    'door': '想象 push 或 pull door 门进出教室。',
    'window': '想象 window 窗外有阳光照进来。',
    'fan': '想象 fan 风扇在墙上呼呼转。',
    'wall': '想象 wall 墙上挂着钟和风扇。',
    'newspaper': '想象 newspaper 报纸上有大字标题。',
    'workbook': '想象 workbook 练习册里要写字做题。',
    'TV': '想象 TV 电视屏幕在客厅亮着。',
    'tv': '想象 TV 电视屏幕在客厅亮着。',
    'living room': '想象 living room 客厅里有沙发和电视。',
    'bedroom': '想象 bedroom 里有一张床和衣柜。',
    'kitchen': '想象 kitchen 厨房里 Mum 在做饭。',
    'bathroom': '想象 bathroom 里有洗手池和镜子。',
    'clock': '想象 clock 钟表指针指向上课时间。',
    'trousers': '想象 trousers 长裤从腰穿到脚。',
    'shorts': '想象 shorts 短裤到膝盖上面。',
    'jacket': '想象 jacket 夹克外套扣上扣子。',
    'skirt': '想象 skirt 短裙随风轻轻摆。',
    'shoe': '想象 shoe 鞋子穿在脚上走路。',
    'hat': '想象 hat 帽子戴在头上遮阳。',
    'sunglasses': '想象 sunglasses 太阳镜挡住阳光。',
    'cow': '想象 cow 奶牛在农场里吃草。',
    'horse': '想象 horse 马在田野里奔跑。',
    'sheep': '想象 sheep 绵羊身上毛茸茸的。',
    'pig': '想象 pig 猪在猪圈里哼哼叫。',
    'chicken': '想象 chicken 鸡在鸡窝里下蛋。',
    'tomato': '想象 tomato 番茄又红又圆。',
    'carrot': '想象 carrot 胡萝卜是橙色的长条。',
    'potato': '想象 potato 土豆埋在土里挖出来。',
    'mouse': '想象 mouse 老鼠小小一只跑得快。',
    'knife': '想象 knife 刀和 fork 叉一起摆在桌上。',
    'fork': '想象 fork 叉子叉起沙拉。',
    'bowl': '想象 bowl 碗里盛着热汤。',
    'spoon': '想象 spoon 勺子舀起一勺汤。',
    'salad': '想象 salad 沙拉里有蔬菜颜色丰富。',
    'supermarket': '想象 supermarket 超市货架上摆满商品。',
}

SEMANTIC_MNEMONICS: dict[str, str] = {
    # Unit 1
    'sorry': "I'm sorry. sorry 表示对不起、抱歉。",
    'late': "Don't be late. late 是迟到、晚的。",
    'class': 'We have English class. class 是课、班级。',
    'ready': 'Are you ready? ready 是准备好的。',
    'rule': 'Follow the rules. rule 是规则、规章。',
    'light': 'Turn on the light. light 是灯、灯光。',
    'tidy': 'Keep your desk tidy. tidy 是整洁的；整理。',
    'music': 'We have music class. music 是音乐。',
    'when': 'When do we have class? when 是什么时候。',
    'understand': 'Do you understand? understand 是理解、明白。',
    'hand out': 'Hand out the books. hand out 是分发。',
    # Unit 2
    'watch': "Don't watch TV too late. watch 是观看。",
    'first': 'Do homework first. first 是第一、首先。',
    'wet': 'The floor is wet. wet 是湿的、潮的。',
    'run': "Don't run in the house. run 是跑。",
    'safe': "It's safe here. safe 是安全的。",
    'word': 'Write the new word. word 是单词。',
    'wash': 'Wash your hands. wash 是洗。',
    'loud': "Don't talk so loud. loud 是大声的。",
    'sleep': 'Go to sleep early. sleep 是睡觉。',
    'study': 'I do homework in the study. study 是书房；也可作学习。',
    'think': 'Think before you answer. think 是认为、思考。',
    'work': 'My parents work hard. work 是工作；也可作动词。',
    'hard': 'Work hard. hard 是努力地；困难的。',
    'follow': 'Follow the rules. follow 是遵循、跟随。',
    'feel': 'How do you feel? feel 是觉得、感到。',
    # Unit 3
    'over': 'School is over. over 可表示结束、完了。',
    'kid': 'The kid is reading. kid 是小孩、儿童。',
    'dinner': 'We have dinner at six. dinner 是正餐、晚饭。',
    'art': 'We have art class. art 是美术、艺术。',
    'lunch': "It's time for lunch. lunch 是午餐。",
    'maths': 'We have maths in the morning. maths 是数学。',
    # Unit 4
    'trousers': 'These trousers are too long. trousers 是裤子。',
    'clothes': 'These clothes are nice. clothes 是衣服、服装。',
    'those': 'Those shorts are cheap. those 是那些。',
    'shorts': 'I wear shorts in summer. shorts 是短裤。',
    'jacket': 'This jacket is beautiful. jacket 是夹克衫。',
    'skirt': 'She wears a red skirt. skirt 是女式短裙。',
    'expensive': 'This jacket is too expensive. expensive 是昂贵的。',
    'dear': 'Dear Mum, this hat is for you. dear 是亲爱的（也可指贵的）。',
    'free': 'These sunglasses are free. free 是免费的。',
    'tv': 'We watch TV in the living room. TV 是电视。',
    'cheap': 'These shorts are cheap. cheap 是便宜的。',
    'large': 'This jacket is too large. large 是大的。',
    'size': 'What size do you wear? size 是尺码、尺寸。',
    'list': 'Make a shopping list. list 是清单、列表。',
    'any': 'Do you have any hats? any 是任何的、一些。',
    'want': 'I want to play. want 是想要。',
    'just': "It's just seven o'clock. just 是正好、仅仅。",
    'minute': 'Wait a minute. minute 是分钟。',
    # Unit 5
    'bee': 'The bee makes honey. bee 是蜜蜂。',
    'can': 'There is a can on the table. can 这里是金属罐。',
    # Unit 6
    'feed': 'We feed the chickens. feed 是喂养、饲养。',
    'pass': 'Pass me the spoon. pass 是给、递、传递。',
    'pick': 'Pick up your chopsticks. pick 是摘、拾、选。',
    'milk': "I'd like a glass of milk. milk 是牛奶；也可作动词挤奶。",
    'waste': "Don't waste food. waste 是浪费。",
    'food': 'The food is delicious. food 是食物。',
    'set': 'Set the table for dinner. set 这里指摆放餐具。',
    'week': 'We go once a week. week 是星期、周。',
}

INFLECTION_NOTES: dict[str, str] = {
    # 名词复数
    'class': '复数 classes',
    'rule': '复数 rules',
    'desk': '复数 desks',
    'chair': '复数 chairs',
    'door': '复数 doors',
    'window': '复数 windows',
    'fan': '复数 fans',
    'wall': '复数 walls',
    'workbook': '复数 workbooks',
    'word': '复数 words',
    'minute': '复数 minutes',
    'trousers': '通常用复数形式',
    'clothes': '通常用复数形式',
    'shorts': '通常用复数形式',
    'shoe': '复数 shoes',
    'knife': '复数 knives',
    'chopstick': '复数 chopsticks',
    'tomato': '复数 tomatoes',
    'potato': '复数 potatoes',
    'mouse': '复数 mice',
    'sheep': '单复数同形 sheep',
    'chicken': '复数 chickens（作「鸡」）；鸡肉不可数',
    'cow': '复数 cows',
    'horse': '复数 horses',
    'pig': '复数 pigs',
    'bee': '复数 bees',
    'carrot': '复数 carrots',
    'bowl': '复数 bowls',
    'spoon': '复数 spoons',
    'fork': '复数 forks',
    'week': '复数 weeks',
    'kid': '复数 kids',
    # 动词
    'tidy': '第三人称单数 tidies；过去式 tidied',
    'understand': '第三人称单数 understands；过去式 understood',
    'watch': '第三人称单数 watches；过去式 watched',
    'run': '第三人称单数 runs；过去式 ran',
    'wash': '第三人称单数 washes；过去式 washed',
    'sleep': '第三人称单数 sleeps；过去式 slept',
    'think': '第三人称单数 thinks；过去式 thought',
    'work': '第三人称单数 works；过去式 worked',
    'follow': '第三人称单数 follows；过去式 followed',
    'feel': '第三人称单数 feels；过去式 felt',
    'want': '第三人称单数 wants；过去式 wanted',
    'take': '第三人称单数 takes；过去式 took',
    'feed': '第三人称单数 feeds；过去式 fed',
    'pass': '第三人称单数 passes；过去式 passed',
    'pick': '第三人称单数 picks；过去式 picked',
    'milk': '第三人称单数 milks；过去式 milked（作动词挤奶）',
    'waste': '第三人称单数 wastes；过去式 wasted',
}

DEFINITION_OVERRIDES: dict[str, str] = {
    'milk': '挤奶；牛奶',
    'mouse': '老鼠',
    'can': '金属罐',
    'chopstick': '筷子',
}

IPA_OVERRIDES: dict[str, str] = {
    'get up': '/ɡet ʌp/',
    'go to school': '/ɡəʊ tə skuːl/',
    'go home': '/ɡəʊ həʊm/',
    'go to bed': '/ɡəʊ tə bed/',
    'a box of': '/ə bɒks əv/',
    'clear the table': '/klɪə(r) ðə ˈteɪbl/',
    'hand out': '/hænd aʊt/',
    'green bean': '/ɡriːn biːn/',
    'hurry up': '/ˈhʌri ʌp/',
    'turn off': '/tɜːn ɒf/',
    'living room': '/ˈlɪvɪŋ ruːm/',
    'try on': '/traɪ ɒn/',
    'set the table': '/set ðə ˈteɪbl/',
}

# PDF 词表与通用 pos 推断冲突时的修正（如 can 名词罐 vs 情态动词）
POS_OVERRIDES: dict[str, str] = {
    'can': 'n.',
    'hurry up': 'v. phrase',
    'turn off': 'v. phrase',
    'try on': 'v. phrase',
    'set the table': 'v. phrase',
    'clear the table': 'v. phrase',
    'get up': 'v. phrase',
    'go to school': 'v. phrase',
    'go home': 'v. phrase',
    'go to bed': 'v. phrase',
    'a box of': 'prep. phrase',
    'hand out': 'v. phrase',
    'living room': 'n. phrase',
}


def _secondary_mnemonic(key: str, headword: str, definition_zh: str, *, kind: str) -> str | None:
    if key in ROOT_MNEMONICS:
        return f'拆词联想：{ROOT_MNEMONICS[key]}'
    if key in IMAGE_MNEMONICS:
        return f'形象联想：{IMAGE_MNEMONICS[key]}'
    if key in SEMANTIC_MNEMONICS:
        return f'语义联想：{SEMANTIC_MNEMONICS[key]}'

    short = definition_zh.split('；')[0].split('，')[0].strip()
    if kind == 'phrase':
        return f'语义联想：{headword} 表示「{short}」，在课文对话里反复出现。'
    return f'语义联想：{headword} 表示「{short}」，结合本课例句记忆。'


def mnemonic_for(headword: str, definition_zh: str, *, kind: str) -> str:
    key = headword.lower()
    parts: list[str] = []

    if key in SOUND_MNEMONICS:
        parts.append(f'谐音联想：{SOUND_MNEMONICS[key]}')

    secondary = _secondary_mnemonic(key, headword, definition_zh, kind=kind)
    if secondary:
        if parts:
            if secondary not in parts[0]:
                parts.append(secondary)
        else:
            parts.append(secondary)

    return parts[0] if len(parts) == 1 else '\n'.join(parts)
