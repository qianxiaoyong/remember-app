"""Textbook-aligned example sentences for PEP Grade 3 English, Volume 2 (下册).

Each headword maps to 2–3 (english, chinese) tuples drawn from or adapted to
unit dialogue in 人教版三年级下册.
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1
    "where": [
        ("Where are you from?", "你来自哪里？"),
        ("Where is my map?", "我的地图在哪里？"),
    ],
    "from": [
        ("I'm from the UK.", "我来自英国。"),
        ("I'm from Shandong, China.", "我来自中国山东。"),
        ("He is from Canada.", "他来自加拿大。"),
    ],
    "about": [
        ("It's about four o'clock.", "现在大约四点了。"),
        ("Tell me about your teacher.", "跟我说说你的老师。"),
    ],
    "today": [
        ("We have two new friends today.", "我们今天有两个新朋友。"),
        ("What do we learn today?", "我们今天学什么？"),
    ],
    "teacher": [
        ("Miss White is my English teacher.", "怀特老师是我的英语老师。"),
        ("My teacher is very nice.", "我的老师非常好。"),
    ],
    "student": [
        ("I am a student.", "我是一名学生。"),
        ("She is a good student.", "她是一名好学生。"),
    ],
    "after": [
        ("After you!", "您先请！"),
        ("Come after me.", "跟我来。"),
    ],
    "who": [
        ("Who is that girl?", "那个女孩是谁？"),
        ("Who is your English teacher?", "谁是你的英语老师？"),
    ],
    "girl": [
        ("Who's that girl?", "那个女孩是谁？"),
        ("The girl is my neighbour.", "那个女孩是我的邻居。"),
    ],
    "neighbour": [
        ("That's our new neighbour, Amy.", "那是我们的新邻居艾米。"),
        ("The boy is my neighbour.", "那个男孩是我的邻居。"),
    ],
    "boy": [
        ("The boy is my neighbour.", "那个男孩是我的邻居。"),
        ("That boy is from the USA.", "那个男孩来自美国。"),
    ],
    "woman": [
        ("The woman is my neighbour.", "那位女士是我的邻居。"),
        ("That woman is very nice.", "那位女士非常好。"),
    ],
    "man": [
        ("The man is my neighbour.", "那位男士是我的邻居。"),
        ("That man is my teacher.", "那位男士是我的老师。"),
    ],
    "mr": [
        ("Mr Jones is my teacher.", "琼斯先生是我的老师。"),
        ("Good morning, Mr White.", "早上好，怀特先生。"),
    ],
    "classmate": [
        ("Mike is my classmate.", "迈克是我的同班同学。"),
        ("Amy is my new classmate.", "艾米是我的新同学。"),
    ],
    "he": [
        ("He is from Canada.", "他来自加拿大。"),
        ("He is my classmate.", "他是我的同班同学。"),
    ],
    "english": [
        ("Miss White is my English teacher.", "怀特老师是我的英语老师。"),
        ("We have an English class today.", "我们今天有一节英语课。"),
    ],
    "she": [
        ("She is very nice.", "她非常好。"),
        ("She is my English teacher.", "她是我的英语老师。"),
    ],
    "very": [
        ("She is very nice.", "她非常好。"),
        ("The dog is very slow.", "这只狗很慢。"),
    ],
    "uk": [
        ("I'm from the UK.", "我来自英国。"),
        ("My friend is from the UK.", "我的朋友来自英国。"),
    ],
    "china": [
        ("I'm from Shandong, China.", "我来自中国山东。"),
        ("China is a big country.", "中国是一个大国。"),
    ],
    "canada": [
        ("He is from Canada.", "他来自加拿大。"),
        ("My classmate is from Canada.", "我的同学来自加拿大。"),
    ],
    "usa": [
        ("I'm from the USA.", "我来自美国。"),
        ("She is from the USA.", "她来自美国。"),
    ],
    # Unit 2
    "has": [
        ("It has a long body and short legs.", "它有长长的身体和短短的腿。"),
        ("The dog has a short tail.", "这只狗有一条短尾巴。"),
    ],
    "long": [
        ("It has a long body and short legs.", "它有长长的身体和短短的腿。"),
        ("The snake is very long.", "这条蛇很长。"),
    ],
    "body": [
        ("It has a long body and short legs.", "它有长长的身体和短短的腿。"),
        ("Our mouth, face and body can all talk.", "我们的嘴、脸和身体都能表达。"),
    ],
    "short": [
        ("It has a long body and short legs.", "它有长长的身体和短短的腿。"),
        ("The dog has a short tail.", "这只狗有一条短尾巴。"),
    ],
    "leg": [
        ("Touch your leg.", "摸摸你的腿。"),
        ("My leg is strong.", "我的腿很有力。"),
    ],
    "right": [
        ("That's right!", "没错！"),
        ("You are right.", "你说得对。"),
    ],
    "fat": [
        ("The dog is fat.", "这只狗很胖。"),
        ("It is a fat cat.", "它是一只胖猫。"),
    ],
    "thin": [
        ("The cat is thin.", "这只猫很瘦。"),
        ("The monkey is thin.", "这只猴子很瘦。"),
    ],
    "slow": [
        ("The turtle is slow.", "这只乌龟很慢。"),
        ("The dog is very slow.", "这只狗很慢。"),
    ],
    "love": [
        ("I love my dog.", "我爱我的狗。"),
        ("Dogs are friendly. I love dogs.", "狗很友好。我爱狗。"),
    ],
    "tail": [
        ("The dog has a short tail.", "这只狗有一条短尾巴。"),
        ("Look at its long tail.", "看它的长尾巴。"),
    ],
    "her": [
        ("I often make her gifts.", "我经常给她做礼物。"),
        ("This is her card.", "这是她的卡片。"),
    ],
    "gift": [
        ("I make a gift for her.", "我给她做一份礼物。"),
        ("This gift is for you.", "这份礼物是给你的。"),
    ],
    "picture": [
        ("Draw a picture.", "画一幅画。"),
        ("This is a nice picture.", "这是一幅好看的画。"),
    ],
    "card": [
        ("Make a card.", "做一张卡片。"),
        ("I make a card for Mum.", "我给妈妈做一张卡片。"),
    ],
    "sing": [
        ("Sing a song.", "唱一首歌。"),
        ("We sing together.", "我们一起唱歌。"),
    ],
    "dance": [
        ("Dance together.", "一起跳舞。"),
        ("Let's sing and dance.", "我们唱歌跳舞吧。"),
    ],
    "face": [
        ("Our mouth, face and body can all talk.", "我们的嘴、脸和身体都能表达。"),
        ("She has a happy face.", "她有一张开心的脸。"),
    ],
    "all": [
        ("Our mouth, face and body can all talk.", "我们的嘴、脸和身体都能表达。"),
        ("We can all sing and dance.", "我们都能唱歌跳舞。"),
    ],
    "so": [
        ("A smile can say so much!", "一个微笑能表达这么多！"),
        ("The dog is so friendly.", "这只狗真友好。"),
    ],
    "talk": [
        ("Our mouth, face and body can all talk.", "我们的嘴、脸和身体都能表达。"),
        ("We talk in English.", "我们用英语说话。"),
    ],
    "song": [
        ("Sing a song.", "唱一首歌。"),
        ("This is a nice song.", "这是一首好听的歌。"),
    ],
    "or": [
        ("Six yuan, or three for seventeen yuan.", "六元，或者三个十七元。"),
        ("Sing or dance?", "唱歌还是跳舞？"),
    ],
    "much": [
        ("A smile can say so much!", "一个微笑能表达这么多！"),
        ("Thank you very much!", "非常感谢！"),
    ],
    # Unit 3
    "eraser": [
        ("Can I use your eraser, please?", "请问我能用你的橡皮吗？"),
        ("Here is your eraser.", "这是你的橡皮。"),
    ],
    "find": [
        ("I can't find my ruler.", "我找不到我的直尺了。"),
        ("Can you find my pen?", "你能找到我的钢笔吗？"),
    ],
    "ruler": [
        ("I can't find my ruler.", "我找不到我的直尺了。"),
        ("This is my ruler.", "这是我的直尺。"),
    ],
    "pen": [
        ("Can you find my pen?", "你能找到我的钢笔吗？"),
        ("I have a blue pen.", "我有一支蓝色的钢笔。"),
    ],
    "pencil": [
        ("This is my pencil.", "这是我的铅笔。"),
        ("I write with my pencil.", "我用铅笔写字。"),
    ],
    "book": [
        ("Open your book.", "打开你的书。"),
        ("This is my book.", "这是我的书。"),
    ],
    "bag": [
        ("My bag is on the desk.", "我的包在课桌上。"),
        ("How much is this bag?", "这个包多少钱？"),
    ],
    "paper": [
        ("I can use paper, pencils, books and computers to learn.", "我可以用纸、铅笔、书和电脑来学习。"),
        ("I need some paper.", "我需要一些纸。"),
    ],
    "these": [
        ("What are these?", "这些是什么？"),
        ("These are grapes.", "这些是葡萄。"),
    ],
    "see": [
        ("I see and hear in class.", "我在课堂上能看能听。"),
        ("I can see the grapes.", "我能看见这些葡萄。"),
    ],
    "smell": [
        ("I smell with my nose.", "我用鼻子闻。"),
        ("I can smell the flowers.", "我能闻到花的香味。"),
    ],
    "taste": [
        ("I taste with my tongue.", "我用舌头尝。"),
        ("I taste the juice.", "我尝一尝果汁。"),
    ],
    "hear": [
        ("I see and hear in class.", "我在课堂上能看能听。"),
        ("I can hear the song.", "我能听到这首歌。"),
    ],
    "touch": [
        ("I touch with my hands.", "我用手触摸。"),
        ("Don't touch it!", "别碰它！"),
    ],
    "learn": [
        ("I can use paper, pencils, books and computers to learn.", "我可以用纸、铅笔、书和电脑来学习。"),
        ("We learn in class.", "我们在课堂上学习。"),
    ],
    "nose": [
        ("I smell with my nose.", "我用鼻子闻。"),
        ("Touch your nose.", "摸摸你的鼻子。"),
    ],
    "tongue": [
        ("I taste with my tongue.", "我用舌头尝。"),
        ("The tongue helps us taste.", "舌头帮我们尝味道。"),
    ],
    "class": [
        ("I see and hear in class.", "我在课堂上能看能听。"),
        ("We have English class today.", "我们今天有英语课。"),
    ],
    "in class": [
        ("I see and hear in class.", "我在课堂上能看能听。"),
        ("Be quiet in class.", "在课堂上要保持安静。"),
    ],
    "computer": [
        ("We have a computer in class.", "我们课堂上有一台电脑。"),
        ("I use the computer.", "我使用电脑。"),
    ],
    # Unit 4
    "breakfast": [
        ("I'd like some bread and eggs for breakfast, please.", "早餐请给我一些面包和鸡蛋。"),
        ("Breakfast time!", "早餐时间到了！"),
    ],
    "time": [
        ("Breakfast time!", "早餐时间到了！"),
        ("It's time for breakfast.", "该吃早餐了。"),
    ],
    "bread": [
        ("I'd like some bread and eggs, please.", "请给我一些面包和鸡蛋。"),
        ("Have some bread.", "吃一些面包吧。"),
    ],
    "egg": [
        ("I have an egg for breakfast.", "我早餐吃一个鸡蛋。"),
        ("I'd like an egg, please.", "请给我一个鸡蛋。"),
    ],
    "milk": [
        ("Have some milk too.", "也喝一些牛奶吧。"),
        ("I like milk.", "我喜欢牛奶。"),
    ],
    "noodle": [
        ("I'd like a bowl of noodle.", "请给我一碗面条。"),
        ("This noodle is yummy.", "这碗面条很好吃。"),
    ],
    "juice": [
        ("Would you like some juice?", "你想要一些果汁吗？"),
        ("The juice is yummy.", "果汁很好喝。"),
    ],
    "rice": [
        ("Would you like some rice and meat?", "你想要一些米饭和肉吗？"),
        ("Eat some rice every day!", "每天吃一些米饭！"),
    ],
    "meat": [
        ("Would you like some rice and meat?", "你想要一些米饭和肉吗？"),
        ("Eat some meat every day!", "每天吃一些肉！"),
    ],
    "vegetable": [
        ("Eat a vegetable every day!", "每天吃一种蔬菜！"),
        ("This vegetable is green.", "这种蔬菜是绿色的。"),
    ],
    "healthy": [
        ("This is my healthy plate.", "这是我的健康餐盘。"),
        ("Fruit and vegetables are colourful and healthy.", "水果和蔬菜五彩缤纷，有益健康。"),
    ],
    "plate": [
        ("This is my healthy plate.", "这是我的健康餐盘。"),
        ("Put the bread on the plate.", "把面包放在盘子上。"),
    ],
    "soup": [
        ("I'd like some soup, please.", "请给我一些汤。"),
        ("The soup is hot.", "汤很烫。"),
    ],
    "fruit": [
        ("Fruit and vegetables are colourful and healthy.", "水果和蔬菜五彩缤纷，有益健康。"),
        ("I like fruit.", "我喜欢水果。"),
    ],
    "colourful": [
        ("Fruit and vegetables are colourful and healthy.", "水果和蔬菜五彩缤纷，有益健康。"),
        ("The plate is colourful.", "这个盘子色彩缤纷。"),
    ],
    "candy": [
        ("Candy and cake are yummy.", "糖果和蛋糕很好吃。"),
        ("Don't eat too much candy.", "不要吃太多糖果。"),
    ],
    "yummy": [
        ("Candy and cake are yummy.", "糖果和蛋糕很好吃。"),
        ("The noodles are yummy.", "面条很好吃。"),
    ],
    # Unit 5
    "at": [
        ("Look at my boat.", "看看我的小船。"),
        ("I'm at home.", "我在家。"),
    ],
    "boat": [
        ("This boat is cool.", "这只小船真酷。"),
        ("Look at my boat.", "看看我的小船。"),
    ],
    "cool": [
        ("This boat is cool.", "这只小船真酷。"),
        ("Your doll is cool.", "你的玩偶真酷。"),
    ],
    "keep": [
        ("You can keep it.", "你可以留着它。"),
        ("Keep your room tidy.", "保持你的房间整洁。"),
    ],
    "home": [
        ("I'm at home.", "我在家。"),
        ("Let's go home.", "我们回家吧。"),
    ],
    "ball": [
        ("Put your books under the ball.", "把你的书放在球下面。"),
        ("The ball is on the shelf.", "球在架子上。"),
    ],
    "doll": [
        ("This is my doll.", "这是我的玩偶。"),
        ("Your doll is cool.", "你的玩偶真酷。"),
    ],
    "car": [
        ("This is my toy car.", "这是我的玩具小汽车。"),
        ("The car is in the box.", "小汽车在盒子里。"),
    ],
    "on": [
        ("Is it on the shelf?", "它在架子上吗？"),
        ("The ball is on the shelf.", "球在架子上。"),
    ],
    "shelf": [
        ("Is it on the shelf?", "它在架子上吗？"),
        ("The doll is on the shelf.", "玩偶在架子上。"),
    ],
    "in": [
        ("It's in the box.", "它在盒子里。"),
        ("The car is in the box.", "小汽车在盒子里。"),
    ],
    "box": [
        ("It's in the box.", "它在盒子里。"),
        ("It's under the box.", "它在盒子下面。"),
    ],
    "cap": [
        ("My cap is on the shelf.", "我的帽子在架子上。"),
        ("Put your cap in the box.", "把你的帽子放进盒子里。"),
    ],
    "map": [
        ("Where is my map?", "我的地图在哪里？"),
        ("The map is under the box.", "地图在盒子下面。"),
    ],
    "under": [
        ("It's under the box.", "它在盒子下面。"),
        ("Put your books under the ball.", "把你的书放在球下面。"),
    ],
    "still": [
        ("I still can't find my map.", "我还是找不到我的地图。"),
        ("It is still in the box.", "它还在盒子里。"),
    ],
    "put": [
        ("Put your books under the ball.", "把你的书放在球下面。"),
        ("Put your cap in the box.", "把你的帽子放进盒子里。"),
    ],
    # Unit 6
    "fifteen": [
        ("We have fifteen books.", "我们有十五本书。"),
        ("How many books do we have? We have fifteen books.", "我们有多少本书？我们有十五本书。"),
    ],
    "twelve": [
        ("We have twelve pencils.", "我们有十二支铅笔。"),
        ("I can count to twelve.", "我能数到十二。"),
    ],
    "fourteen": [
        ("We have fourteen rulers.", "我们有十四把直尺。"),
        ("Fourteen and one is fifteen.", "十四加一等于十五。"),
    ],
    "thirteen": [
        ("We have thirteen pens.", "我们有十三支钢笔。"),
        ("Thirteen comes after twelve.", "十三在十二后面。"),
    ],
    "eleven": [
        ("We have eleven books.", "我们有十一本书。"),
        ("Eleven comes before twelve.", "十一在十二前面。"),
    ],
    "twenty": [
        ("It's twenty yuan.", "二十元。"),
        ("How much is this bag? It's twenty yuan.", "这个包多少钱？二十元。"),
    ],
    "seventeen": [
        ("Six yuan, or three for seventeen yuan.", "六元，或者三个十七元。"),
        ("It is seventeen yuan.", "十七元。"),
    ],
    "sixteen": [
        ("It is sixteen yuan.", "十六元。"),
        ("Sixteen and one is seventeen.", "十六加一等于十七。"),
    ],
    "eighteen": [
        ("It is eighteen yuan.", "十八元。"),
        ("Eighteen comes after seventeen.", "十八在十七后面。"),
    ],
    "nineteen": [
        ("It is nineteen yuan.", "十九元。"),
        ("Nineteen and one is twenty.", "十九加一等于二十。"),
    ],
    "piggy bank": [
        ("Put the money in your piggy bank.", "把钱放进你的储钱罐。"),
        ("My piggy bank is full.", "我的储钱罐满了。"),
    ],
    "pay": [
        ("How much do I pay?", "我要付多少钱？"),
        ("I pay twenty yuan.", "我付二十元。"),
    ],
    "back": [
        ("Come back!", "回来！"),
        ("Give me back my book.", "把我的书还给我。"),
    ],
}
