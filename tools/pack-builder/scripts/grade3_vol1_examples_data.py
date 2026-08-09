"""Textbook-aligned example sentences for PEP Grade 3 English, Volume 1 (上册).

Each headword maps to 2–3 (english, chinese) tuples drawn from or adapted to
unit dialogue in 人教版三年级上册.
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1
    "name": [
        ("What's your name?", "你叫什么名字？"),
        ("My name is Amy.", "我叫艾米。"),
        ("I know your name.", "我知道你的名字。"),
    ],
    "nice": [
        ("Nice to meet you!", "见到你很高兴！"),
        ("You are nice.", "你很友好。"),
        ("She is very nice.", "她非常友好。"),
    ],
    "ear": [
        ("Touch your ear.", "摸摸你的耳朵。"),
        ("This is my ear.", "这是我的耳朵。"),
        ("My ear helps me hear.", "我的耳朵帮我听。"),
    ],
    "hand": [
        ("Wave your hand.", "挥挥你的手。"),
        ("Give me your hand.", "把你的手给我。"),
        ("Touch with your hand.", "用手触摸。"),
    ],
    "eye": [
        ("Look at my eye.", "看着我的眼睛。"),
        ("This is my eye.", "这是我的眼睛。"),
        ("Look with your eye.", "用眼睛看。"),
    ],
    "mouth": [
        ("Point to your mouth.", "指指你的嘴。"),
        ("Open your mouth.", "张开你的嘴。"),
        ("Smile with your mouth.", "用嘴微笑。"),
    ],
    "arm": [
        ("Wave your arm.", "挥挥你的胳膊。"),
        ("I hurt my arm.", "我的胳膊受伤了。"),
        ("Raise your arm.", "举起你的胳膊。"),
    ],
    "can": [
        ("I can help you.", "我能帮助你。"),
        ("Can you share?", "你会分享吗？"),
        ("I can listen.", "我会倾听。"),
    ],
    "share": [
        ("We share our toys.", "我们分享我们的玩具。"),
        ("Let's share the cake.", "我们一起分享蛋糕吧。"),
        ("I share with my friend.", "我和朋友分享。"),
    ],
    "smile": [
        ("Please smile.", "请微笑。"),
        ("She has a big smile.", "她笑得很开心。"),
        ("Smile at your friend.", "对你的朋友微笑。"),
    ],
    "listen": [
        ("Listen to me.", "听我说。"),
        ("Listen with care.", "认真倾听。"),
        ("I listen to my teacher.", "我听老师的话。"),
    ],
    "help": [
        ("I can help you.", "我能帮助你。"),
        ("Can I help you?", "我能帮助你吗？"),
        ("We help each other.", "我们互相帮助。"),
    ],
    "say": [
        ("Say hello.", "说你好。"),
        ("Say your name.", "说出你的名字。"),
        ("What did you say?", "你说什么？"),
    ],
    "friend": [
        ("She is my friend.", "她是我的朋友。"),
        ("Nice to meet you, my new friend.", "很高兴见到你，我的新朋友。"),
        ("He is my good friend.", "他是我的好朋友。"),
    ],
    "good": [
        ("You are a good friend.", "你是一个好朋友。"),
        ("Good morning!", "早上好！"),
        ("That is good.", "那很好。"),
    ],
    "what's your name?": [
        ("What's your name?", "你叫什么名字？"),
        ("Hello! What's your name?", "你好！你叫什么名字？"),
        ("What's your name? My name is Mike.", "你叫什么名字？我叫迈克。"),
    ],
    "nice to meet you.": [
        ("Nice to meet you!", "见到你很高兴！"),
        ("Nice to meet you, Amy.", "很高兴见到你，艾米。"),
        ("Nice to meet you, too.", "我也很高兴见到你。"),
    ],
    # Unit 2
    "mum": [
        ("This is my mum.", "这是我妈妈。"),
        ("My mum is kind.", "我妈妈很和蔼。"),
        ("I love my mum.", "我爱我的妈妈。"),
    ],
    "dad": [
        ("This is my dad.", "这是我爸爸。"),
        ("My dad is tall.", "我爸爸很高。"),
        ("I love my dad.", "我爱我的爸爸。"),
    ],
    "grandma": [
        ("My grandma is kind.", "我的奶奶很和蔼。"),
        ("This is my grandma.", "这是我的奶奶。"),
        ("I visit my grandma.", "我去看望奶奶。"),
    ],
    "grandpa": [
        ("My grandpa is kind.", "我的爷爷很和蔼。"),
        ("This is my grandpa.", "这是我的爷爷。"),
        ("I visit my grandpa.", "我去看望爷爷。"),
    ],
    "grandfather": [
        ("My grandfather is here.", "我的爷爷在这里。"),
        ("This is my grandfather.", "这是我的爷爷。"),
        ("My grandfather is old.", "我的爷爷年纪大了。"),
    ],
    "grandmother": [
        ("My grandmother is here.", "我的奶奶在这里。"),
        ("This is my grandmother.", "这是我的奶奶。"),
        ("My grandmother is kind.", "我的奶奶很和蔼。"),
    ],
    "mother": [
        ("This is my mother.", "这是我妈妈。"),
        ("My mother is nice.", "我妈妈很好。"),
        ("I love my mother.", "我爱我的妈妈。"),
    ],
    "father": [
        ("This is my father.", "这是我爸爸。"),
        ("My father is big.", "我爸爸很高大。"),
        ("I love my father.", "我爱我的爸爸。"),
    ],
    "me": [
        ("Look at me.", "看看我。"),
        ("This is me.", "这是我。"),
        ("Give it to me.", "把它给我。"),
    ],
    "sister": [
        ("This is my sister.", "这是我姐姐。"),
        ("My sister is small.", "我妹妹很小。"),
        ("I play with my sister.", "我和妹妹一起玩。"),
    ],
    "family": [
        ("I love my family.", "我爱我的家人。"),
        ("This is my family.", "这是我的家人。"),
        ("My family is big.", "我的家庭很大。"),
    ],
    "have": [
        ("I have a book.", "我有一本书。"),
        ("I have a big family.", "我有一个大家庭。"),
        ("Do you have a pet?", "你有宠物吗？"),
    ],
    "big": [
        ("It is a big family.", "这是一个大家庭。"),
        ("The elephant is big.", "大象很大。"),
        ("My brother is big.", "我哥哥长大了。"),
    ],
    "cousin": [
        ("My cousin is here.", "我的堂（表）兄弟姐妹在这里。"),
        ("This is my cousin.", "这是我的堂（表）兄弟姐妹。"),
        ("I play with my cousin.", "我和堂（表）兄弟姐妹一起玩。"),
    ],
    "brother": [
        ("This is my brother.", "这是我哥哥。"),
        ("My brother is tall.", "我哥哥很高。"),
        ("I love my brother.", "我爱我的哥哥。"),
    ],
    "baby": [
        ("The baby is small.", "婴儿很小。"),
        ("The baby is cute.", "婴儿很可爱。"),
        ("Look at the baby.", "看看这个婴儿。"),
    ],
    "uncle": [
        ("This is my uncle.", "这是我叔叔。"),
        ("My uncle is kind.", "我叔叔很和蔼。"),
        ("I visit my uncle.", "我去看望叔叔。"),
    ],
    "aunt": [
        ("This is my aunt.", "这是我阿姨。"),
        ("My aunt is nice.", "我阿姨很好。"),
        ("I visit my aunt.", "我去看望阿姨。"),
    ],
    "small": [
        ("The baby is small.", "婴儿很小。"),
        ("It is a small dog.", "它是一只小狗。"),
        ("My sister is small.", "我妹妹还小。"),
    ],
    "this is my family.": [
        ("This is my family.", "这是我的家人。"),
        ("This is my family photo.", "这是我的全家福。"),
        ("This is my family. I love them.", "这是我的家人。我爱他们。"),
    ],
    # Unit 3
    "like": [
        ("I like my pet.", "我喜欢我的宠物。"),
        ("I like animals.", "我喜欢动物。"),
        ("Do you like dogs?", "你喜欢狗吗？"),
    ],
    "dog": [
        ("I like my dog.", "我喜欢我的狗。"),
        ("A dog says \"woof\".", "狗发出“汪汪”声。"),
        ("The dog is cute.", "这只狗很可爱。"),
    ],
    "pet": [
        ("This is my pet.", "这是我的宠物。"),
        ("I have a pet dog.", "我有一只宠物狗。"),
        ("My pet is cute.", "我的宠物很可爱。"),
    ],
    "cat": [
        ("The cat is cute.", "猫很可爱。"),
        ("A cat says \"meow\".", "猫发出“喵喵”声。"),
        ("I like my cat.", "我喜欢我的猫。"),
    ],
    "fish": [
        ("I see a fish.", "我看到一条鱼。"),
        ("I see two fish.", "我看到两条鱼。"),
        ("The fish can swim.", "鱼会游泳。"),
    ],
    "bird": [
        ("The bird can fly.", "鸟会飞。"),
        ("I see one bird.", "我看到一只鸟。"),
        ("The bird is in the tree.", "鸟在树上。"),
    ],
    "rabbit": [
        ("The rabbit is cute.", "兔子很可爱。"),
        ("I see a rabbit.", "我看到一只兔子。"),
        ("The rabbit can jump.", "兔子会跳。"),
    ],
    "go": [
        ("Let's go.", "我们走吧。"),
        ("Let's go to the zoo.", "我们去动物园吧。"),
        ("We go to school.", "我们去上学。"),
    ],
    "zoo": [
        ("We go to the zoo.", "我们去动物园。"),
        ("I like the zoo.", "我喜欢动物园。"),
        ("The zoo has many animals.", "动物园里有很多动物。"),
    ],
    "fox": [
        ("The fox is fast.", "狐狸跑得很快。"),
        ("I see a fox.", "我看到一只狐狸。"),
        ("The fox is clever.", "狐狸很聪明。"),
    ],
    "miss": [
        ("Miss White is kind.", "怀特老师很和蔼。"),
        ("Good morning, Miss White.", "早上好，怀特老师。"),
        ("Miss, can I help?", "老师，我能帮忙吗？"),
    ],
    "panda": [
        ("The panda is cute.", "熊猫很可爱。"),
        ("I see a panda.", "我看到一只大熊猫。"),
        ("The panda eats bamboo.", "大熊猫吃竹子。"),
    ],
    "red panda": [
        ("I see a red panda.", "我看到一只小熊猫。"),
        ("The red panda is cute.", "小熊猫很可爱。"),
        ("The red panda is fast.", "小熊猫跑得很快。"),
    ],
    "cute": [
        ("The monkey is cute.", "猴子很可爱。"),
        ("The cat is cute.", "猫很可爱。"),
        ("What a cute pet!", "多可爱的宠物啊！"),
    ],
    "monkey": [
        ("The monkey can jump.", "猴子会跳。"),
        ("I see a monkey.", "我看到一只猴子。"),
        ("The monkey is cute.", "猴子很可爱。"),
    ],
    "tiger": [
        ("The tiger is big.", "老虎很大。"),
        ("I see a tiger.", "我看到一只老虎。"),
        ("The tiger is strong.", "老虎很强壮。"),
    ],
    "elephant": [
        ("The elephant is big.", "大象很大。"),
        ("I see an elephant.", "我看到一头大象。"),
        ("The elephant has a long nose.", "大象有长鼻子。"),
    ],
    "lion": [
        ("The lion is strong.", "狮子很强壮。"),
        ("I see a lion.", "我看到一头狮子。"),
        ("The lion is big.", "狮子很大。"),
    ],
    "animal": [
        ("A dog is an animal.", "狗是一种动物。"),
        ("I like this animal.", "我喜欢这种动物。"),
        ("An animal lives in the zoo.", "动物住在动物园里。"),
    ],
    "giraffe": [
        ("The giraffe is tall.", "长颈鹿很高。"),
        ("I see a giraffe.", "我看到一只长颈鹿。"),
        ("The giraffe has a long neck.", "长颈鹿有长脖子。"),
    ],
    "tall": [
        ("The giraffe is tall.", "长颈鹿很高。"),
        ("My father is tall.", "我爸爸很高。"),
        ("The tree is tall.", "这棵树很高。"),
    ],
    "fast": [
        ("The fox is fast.", "狐狸跑得很快。"),
        ("The red panda is fast.", "小熊猫跑得很快。"),
        ("Run fast!", "快跑！"),
    ],
    "i like animals.": [
        ("I like animals.", "我喜欢动物。"),
        ("I like animals. Do you?", "我喜欢动物。你呢？"),
        ("I like animals. Let's go to the zoo.", "我喜欢动物。我们去动物园吧。"),
    ],
    "let's play a game.": [
        ("Let's play a game.", "我们一起玩游戏吧。"),
        ("Let's play a game together.", "我们一起玩游戏吧。"),
        ("Let's play a game after class.", "下课后我们一起玩游戏吧。"),
    ],
    # Unit 4
    "apple": [
        ("I eat an apple.", "我吃一个苹果。"),
        ("The apple is red.", "苹果是红色的。"),
        ("I like this apple.", "我喜欢这个苹果。"),
    ],
    "banana": [
        ("I like a banana.", "我喜欢香蕉。"),
        ("The banana is yellow.", "香蕉是黄色的。"),
        ("I eat a banana.", "我吃一根香蕉。"),
    ],
    "farm": [
        ("This is a farm.", "这是一个农场。"),
        ("We visit a farm.", "我们参观农场。"),
        ("The farm has trees.", "农场里有树。"),
    ],
    "air": [
        ("Plants give us air.", "植物给我们空气。"),
        ("We need clean air.", "我们需要干净的空气。"),
        ("The air is fresh.", "空气很清新。"),
    ],
    "orange": [
        ("I eat an orange.", "我吃一个橙子。"),
        ("The orange is sweet.", "橙子很甜。"),
        ("I like this orange.", "我喜欢这个橙子。"),
    ],
    "grape": [
        ("I eat a grape.", "我吃一颗葡萄。"),
        ("The grape is purple.", "葡萄是紫色的。"),
        ("I like this grape.", "我喜欢这颗葡萄。"),
    ],
    "school": [
        ("I go to school.", "我去上学。"),
        ("This is our school garden.", "这是我们的学校花园。"),
        ("I like my school.", "我喜欢我的学校。"),
    ],
    "garden": [
        ("This is a garden.", "这是一个花园。"),
        ("We have a school garden.", "我们有一个学校花园。"),
        ("The garden is beautiful.", "花园很漂亮。"),
    ],
    "need": [
        ("Plants need water.", "植物需要水。"),
        ("Plants need the sun.", "植物需要阳光。"),
        ("We need air.", "我们需要空气。"),
    ],
    "water": [
        ("I water the plant.", "我给植物浇水。"),
        ("Plants need water.", "植物需要水。"),
        ("I can water my plants.", "我会给我的植物浇水。"),
    ],
    "flower": [
        ("The flower is beautiful.", "这朵花很漂亮。"),
        ("I see a flower.", "我看到一朵花。"),
        ("The flower is pink.", "这朵花是粉色的。"),
    ],
    "grass": [
        ("The grass is green.", "草是绿色的。"),
        ("I see green grass.", "我看到绿色的草。"),
        ("We sit on the grass.", "我们坐在草地上。"),
    ],
    "plant": [
        ("I see a plant.", "我看到一株植物。"),
        ("I can water the plant.", "我会给这株植物浇水。"),
        ("The plant needs the sun.", "植物需要阳光。"),
    ],
    "new": [
        ("This is my new book.", "这是我的新书。"),
        ("We have a new friend.", "我们有一个新朋友。"),
        ("The plant is new.", "这株植物是新种的。"),
    ],
    "tree": [
        ("The tree is tall.", "这棵树很高。"),
        ("I see a tree.", "我看到一棵树。"),
        ("I climb the tree.", "我爬树。"),
    ],
    "sun": [
        ("Plants need the sun.", "植物需要阳光。"),
        ("The sun is yellow.", "太阳是黄色的。"),
        ("The sun is hot.", "太阳很热。"),
    ],
    "give": [
        ("Plants give us air.", "植物给我们空气。"),
        ("Trees give us air.", "树给我们空气。"),
        ("Give me a flower.", "给我一朵花。"),
    ],
    "them": [
        ("I can help them.", "我能帮助他们。"),
        ("I water them.", "我给它们浇水。"),
        ("We love them.", "我们爱他们。"),
    ],
    # Unit 5
    "colour": [
        ("What colour is it?", "它是什么颜色？"),
        ("I like this colour.", "我喜欢这种颜色。"),
        ("This colour is red.", "这种颜色是红色的。"),
    ],
    "green": [
        ("The grass is green.", "草是绿色的。"),
        ("I see green plants.", "我看到绿色的植物。"),
        ("Green and blue make purple.", "绿色和蓝色混合成紫色。"),
    ],
    "red": [
        ("The apple is red.", "苹果是红色的。"),
        ("I see a red flower.", "我看到一朵红色的花。"),
        ("Red and yellow make orange.", "红色和黄色混合成橙色。"),
    ],
    "blue": [
        ("The sky is blue.", "天空是蓝色的。"),
        ("I have a blue book.", "我有一本蓝色的书。"),
        ("Blue and yellow make green.", "蓝色和黄色混合成绿色。"),
    ],
    "make": [
        ("Colours make a rainbow.", "颜色组成彩虹。"),
        ("Red and yellow make orange.", "红色和黄色混合成橙色。"),
        ("Let's make a card.", "我们做一张卡片吧。"),
    ],
    "purple": [
        ("The flower is purple.", "这朵花是紫色的。"),
        ("I like purple.", "我喜欢紫色。"),
        ("Green and blue make purple.", "绿色和蓝色混合成紫色。"),
    ],
    "brown": [
        ("The bear is brown.", "熊是棕色的。"),
        ("I see a brown dog.", "我看到一只棕色的狗。"),
        ("The tree is brown.", "树是棕色的。"),
    ],
    "bear": [
        ("The bear is big.", "熊很大。"),
        ("The bear is brown.", "熊是棕色的。"),
        ("I see a bear.", "我看到一只熊。"),
    ],
    "yellow": [
        ("The sun is yellow.", "太阳是黄色的。"),
        ("The banana is yellow.", "香蕉是黄色的。"),
        ("I like yellow.", "我喜欢黄色。"),
    ],
    "duck": [
        ("The duck can swim.", "鸭子会游泳。"),
        ("I see one duck.", "我看到一只鸭子。"),
        ("The duck is on the sea.", "鸭子在大海上。"),
    ],
    "sea": [
        ("I see the sea.", "我看到了大海。"),
        ("The duck is on the sea.", "鸭子在大海上。"),
        ("The sea is blue.", "大海是蓝色的。"),
    ],
    "some": [
        ("I have some apples.", "我有一些苹果。"),
        ("I eat some grapes.", "我吃一些葡萄。"),
        ("Can I have some water?", "我能喝点水吗？"),
    ],
    "pink": [
        ("The flower is pink.", "这朵花是粉色的。"),
        ("I like pink.", "我喜欢粉色。"),
        ("I draw a pink flower.", "我画一朵粉色的花。"),
    ],
    "draw": [
        ("I can draw a tree.", "我会画一棵树。"),
        ("Let's draw a rainbow.", "我们画一条彩虹吧。"),
        ("I draw with my pencil.", "我用铅笔画。"),
    ],
    "white": [
        ("The cloud is white.", "云是白色的。"),
        ("I see a white flower.", "我看到一朵白色的花。"),
        ("White and black make grey.", "白色和黑色混合成灰色。"),
    ],
    "black": [
        ("The cat is black.", "猫是黑色的。"),
        ("I see a black dog.", "我看到一只黑色的狗。"),
        ("I like black.", "我喜欢黑色。"),
    ],
    # Unit 6
    "old": [
        ("How old are you?", "你几岁了？"),
        ("I am five years old.", "我五岁了。"),
        ("My grandpa is old.", "我爷爷年纪大了。"),
    ],
    "five": [
        ("I am five years old.", "我五岁了。"),
        ("I have five books.", "我有五本书。"),
        ("Count to five.", "数到五。"),
    ],
    "year": [
        ("Happy New Year!", "新年快乐！"),
        ("One year has twelve months.", "一年有十二个月。"),
        ("This year is new.", "今年是新的一年。"),
    ],
    "one": [
        ("I have one book.", "我有一本书。"),
        ("One, two, three!", "一、二、三！"),
        ("I see one bird.", "我看到一只鸟。"),
    ],
    "two": [
        ("I have two books.", "我有两本书。"),
        ("I have two eyes.", "我有两只眼睛。"),
        ("One and one is two.", "一加一等于二。"),
    ],
    "three": [
        ("I see three birds.", "我看到三只鸟。"),
        ("One, two, three!", "一、二、三！"),
        ("It is three o'clock.", "现在是三点整。"),
    ],
    "four": [
        ("I see four fish.", "我看到四条鱼。"),
        ("Three and one is four.", "三加一等于四。"),
        ("I have four apples.", "我有四个苹果。"),
    ],
    "ten": [
        ("I can count to ten.", "我能数到十。"),
        ("Ten ducks on the sea.", "海上有十只鸭子。"),
        ("One to ten, let's count.", "从一数到十，我们来数数。"),
    ],
    "six": [
        ("I see six apples.", "我看到六个苹果。"),
        ("Five and one is six.", "五加一等于六。"),
        ("Count to six.", "数到六。"),
    ],
    "seven": [
        ("I see seven ducks.", "我看到七只鸭子。"),
        ("Six and one is seven.", "六加一等于七。"),
        ("Count to seven.", "数到七。"),
    ],
    "eight": [
        ("I see eight flowers.", "我看到八朵花。"),
        ("Seven and one is eight.", "七加一等于八。"),
        ("Count to eight.", "数到八。"),
    ],
    "nine": [
        ("I see nine trees.", "我看到九棵树。"),
        ("Eight and one is nine.", "八加一等于九。"),
        ("Count to nine.", "数到九。"),
    ],
    "o'clock": [
        ("It is three o'clock.", "现在是三点整。"),
        ("It is five o'clock.", "现在是五点整。"),
        ("What time is it? It is ten o'clock.", "几点了？现在是十点整。"),
    ],
    "cut": [
        ("Cut the cake.", "切蛋糕。"),
        ("Let's cut the cake.", "我们来切蛋糕吧。"),
        ("Cut it into five pieces.", "把它切成五块。"),
    ],
    "eat": [
        ("I eat cake.", "我吃蛋糕。"),
        ("Let's eat the cake.", "我们吃蛋糕吧。"),
        ("I eat an apple.", "我吃一个苹果。"),
    ],
    "cake": [
        ("I like cake.", "我喜欢蛋糕。"),
        ("Cut the cake.", "切蛋糕。"),
        ("The cake is yummy.", "蛋糕很好吃。"),
    ],
    "how old are you?": [
        ("How old are you?", "你几岁了？"),
        ("How old are you? I am five.", "你几岁了？我五岁。"),
        ("How old are you, Mike?", "迈克，你几岁了？"),
    ],
}
