"""Textbook-aligned example sentences for PEP Grade 4 English, Volume 1 (上册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 人教版四年级上册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1 · Helping at home
    "pe": [
        ("We have PE on Monday.", "我们星期一有体育课。"),
        ("I like PE class.", "我喜欢体育课。"),
    ],
    "job": [
        ("What's your mother's job?", "你妈妈做什么工作？"),
        ("My uncle has a cool job.", "我叔叔的工作很酷。"),
    ],
    "doctor": [
        ("My mother is a doctor.", "我妈妈是一名医生。"),
        ("The doctor is very busy today.", "医生今天很忙。"),
    ],
    "farmer": [
        ("My grandpa is a farmer.", "我爷爷是一名农民。"),
        ("The farmer gets up early.", "这位农民起得很早。"),
    ],
    "nurse": [
        ("She is a nurse in a hospital.", "她是在医院工作的护士。"),
        ("The nurse helps sick people.", "护士帮助生病的人。"),
    ],
    "office worker": [
        ("My aunt is an office worker.", "我阿姨是一名公司职员。"),
        ("The office worker works in a tall building.", "这位公司职员在一栋高楼里工作。"),
    ],
    "factory worker": [
        ("His father is a factory worker.", "他爸爸是一名工厂工人。"),
        ("Factory workers make many things.", "工厂工人制造很多东西。"),
    ],
    "busy": [
        ("Are you busy today?", "你今天忙吗？"),
        ("My parents are always busy.", "我父母总是很忙。"),
    ],
    "tired": [
        ("I'm tired after school.", "放学后我很累。"),
        ("You look tired. Have a rest.", "你看起来累了，休息一下吧。"),
    ],
    "chore": [
        ("I do a chore at home.", "我在家做一项家务。"),
        ("This chore can help our family.", "这项家务可以帮助家人。"),
    ],
    "cook": [
        ("My mum can cook well.", "我妈妈很会做饭。"),
        ("I help Mum cook dinner.", "我帮妈妈做晚饭。"),
    ],
    "clean": [
        ("I clean my room on Sundays.", "我星期天打扫自己的房间。"),
        ("Let's clean the floor together.", "我们一起把地板打扫干净吧。"),
    ],
    "room": [
        ("This is my room.", "这是我的房间。"),
        ("My room is small but tidy.", "我的房间不大，但很整洁。"),
    ],
    "sweep": [
        ("I sweep the floor every day.", "我每天扫地。"),
        ("Can you sweep the floor for me?", "你能帮我扫地吗？"),
    ],
    "floor": [
        ("The floor is very clean now.", "地板现在很干净了。"),
        ("Don't run on the wet floor.", "别在湿滑的地板上跑。"),
    ],
    "together": [
        ("We do chores together.", "我们一起做家务。"),
        ("Let's play together after school.", "放学后我们一起玩吧。"),
    ],
    "look after": [
        ("I look after my little sister.", "我照顾我的小妹妹。"),
        ("Who looks after the baby at home?", "家里谁照顾宝宝？"),
        ("We should look after old people.", "我们应该照顾老人。"),
    ],
    "people": [
        ("Many people work in our community.", "很多人在我们的社区工作。"),
        ("Kind people help each other.", "善良的人互相帮助。"),
    ],
    "child": [
        ("The child is reading a book.", "那个小孩在看书。"),
        ("Every child should help at home.", "每个孩子都应该在家帮忙。"),
    ],
    # Unit 2 · My friends
    "his": [
        ("This is his football.", "这是他的足球。"),
        ("His hair is short and black.", "他的头发又短又黑。"),
    ],
    "strong": [
        ("He is tall and strong.", "他又高又强壮。"),
        ("My brother is very strong.", "我哥哥很强壮。"),
    ],
    "hair": [
        ("She has long hair.", "她留着长发。"),
        ("His hair is curly.", "他的头发是卷的。"),
    ],
    "also": [
        ("He is also kind.", "他也很友好。"),
        ("Mum is also a great cook.", "妈妈也很会做饭。"),
    ],
    "kind": [
        ("She is very kind.", "她非常友好。"),
        ("My best friend is kind to everyone.", "我最好的朋友对每个人都很友好。"),
    ],
    "quiet": [
        ("She is quiet in class.", "她在课堂上很安静。"),
        ("The library is quiet.", "图书馆里很安静。"),
    ],
    "best": [
        ("He is my best friend.", "他是我最好的朋友。"),
        ("This is the best book.", "这是最好的一本书。"),
    ],
    "read": [
        ("I read books every day.", "我每天都看书。"),
        ("She likes to read stories.", "她喜欢读故事。"),
    ],
    "chinese": [
        ("We have Chinese on Tuesday.", "我们星期二有语文课。"),
        ("Can you speak Chinese?", "你会说中文吗？"),
    ],
    "play": [
        ("We play in the playground.", "我们在操场上玩。"),
        ("Let's play a game.", "我们来玩个游戏吧。"),
    ],
    "game": [
        ("This is a fun game.", "这是个有趣的游戏。"),
        ("We play a game after school.", "我们放学后做一个游戏。"),
    ],
    "football": [
        ("He can play football well.", "他足球踢得很好。"),
        ("Let's play football together.", "我们一起踢足球吧。"),
    ],
    "basketball": [
        ("I like basketball.", "我喜欢篮球。"),
        ("They play basketball after school.", "他们放学后打篮球。"),
    ],
    "always": [
        ("She always helps me.", "她总是帮助我。"),
        ("He always gets up early.", "他总是早起。"),
    ],
    # Unit 3 · Places in my community
    "afternoon": [
        ("Good afternoon!", "下午好！"),
        ("We play in the park in the afternoon.", "我们下午在公园玩。"),
    ],
    "there": [
        ("There is a library near my home.", "我家附近有一个图书馆。"),
        ("There are many shops on this street.", "这条街上有很多商店。"),
    ],
    "playground": [
        ("The playground is big.", "操场很大。"),
        ("Children play in the playground.", "孩子们在操场上玩。"),
    ],
    "park": [
        ("Let's go to the park.", "我们去公园吧。"),
        ("There are many trees in the park.", "公园里有很多树。"),
    ],
    "over": [
        ("The shop is over there.", "商店在那边。"),
        ("Look! The hospital is over there.", "看！医院在那边。"),
    ],
    "hospital": [
        ("My aunt works in a hospital.", "我阿姨在一家医院工作。"),
        ("The hospital is near the park.", "医院在公园附近。"),
    ],
    "shop": [
        ("There is a shop on my street.", "我住的街上有家商店。"),
        ("Let's buy some fruit at the shop.", "我们去商店买些水果吧。"),
    ],
    "toilet": [
        ("Excuse me, where is the toilet?", "打扰一下，卫生间在哪里？"),
        ("The toilet is on the left.", "卫生间在左边。"),
    ],
    "bus stop": [
        ("The bus stop is near our school.", "公共汽车站离我们学校很近。"),
        ("We wait at the bus stop.", "我们在公共汽车站等车。"),
    ],
    "library": [
        ("I often read books in the library.", "我经常在图书馆看书。"),
        ("The library is quiet and nice.", "图书馆又安静又舒适。"),
    ],
    "sport": [
        ("I like sport very much.", "我非常喜欢体育运动。"),
        ("We do sport in the playground.", "我们在操场上做运动。"),
    ],
    "walk": [
        ("I walk to school every day.", "我每天都步行去上学。"),
        ("Let's walk to the park.", "我们步行去公园吧。"),
    ],
    "community": [
        ("We live in a nice community.", "我们住在一个很好的社区里。"),
        ("People help each other in our community.", "在我们社区里，人们互相帮助。"),
    ],
    "favourite": [
        ("My favourite place is the library.", "我最喜欢的地方是图书馆。"),
        ("What's your favourite sport?", "你最喜欢的运动是什么？"),
    ],
    "place": [
        ("This is a great place.", "这是个很棒的地方。"),
        ("The park is my favourite place.", "公园是我最喜欢的地方。"),
    ],
    "photo": [
        ("This is a photo of my family.", "这是一张我的家庭照片。"),
        ("I take a photo in the park.", "我在公园里拍了一张照片。"),
    ],
    "story": [
        ("She tells us a funny story.", "她给我们讲了一个有趣的故事。"),
        ("I like this story very much.", "我非常喜欢这个故事。"),
    ],
    "buy": [
        ("I want to buy a new book.", "我想买一本新书。"),
        ("Let's buy some bread.", "我们买些面包吧。"),
    ],
    # Unit 4 · Helping in the community
    "firefighter": [
        ("The firefighter is very brave.", "消防员非常勇敢。"),
        ("A firefighter helps people in danger.", "消防员帮助处于危险中的人。"),
    ],
    "why": [
        ("Why is he a firefighter?", "他为什么当消防员？"),
        ("Why do you like this job?", "你为什么喜欢这份工作？"),
    ],
    "driver": [
        ("My uncle is a bus driver.", "我叔叔是一名公交司机。"),
        ("The driver works hard every day.", "这位司机每天都很辛苦地工作。"),
    ],
    "cleaner": [
        ("The cleaner keeps our school clean.", "清洁工让我们的学校保持干净。"),
        ("She is a street cleaner.", "她是一名街道清洁工。"),
    ],
    "delivery worker": [
        ("The delivery worker is very busy.", "快递员很忙。"),
        ("A delivery worker brings food to our home.", "快递员把食物送到我们家。"),
    ],
    "police officer": [
        ("The police officer helps people.", "警察帮助人们。"),
        ("My neighbour is a police officer.", "我的邻居是一名警察。"),
    ],
    "a lot of": [
        ("She helps a lot of people.", "她帮助很多人。"),
        ("There are a lot of books in the library.", "图书馆里有很多书。"),
    ],
    "now": [
        ("I'm busy now.", "我现在很忙。"),
        ("Let's go home now.", "我们现在回家吧。"),
    ],
    "make the bed": [
        ("I make the bed every morning.", "我每天早上铺床。"),
        ("Please make the bed before you go out.", "出门前请把床整理好。"),
    ],
    "old": [
        ("My grandpa is old but strong.", "我爷爷年纪大了，但很强壮。"),
        ("This is an old photo.", "这是一张旧照片。"),
    ],
    "tell": [
        ("Please tell me your name.", "请告诉我你的名字。"),
        ("Tell me about your job.", "跟我说说你的工作。"),
    ],
    "everyone": [
        ("Everyone is here now.", "大家现在都在这里。"),
        ("Hello, everyone!", "大家好！"),
    ],
    "ms": [
        ("This is Ms Wang, our teacher.", "这是我们的王老师。"),
        ("Good morning, Ms Chen.", "陈老师，早上好。"),
    ],
    # Unit 5 · The weather
    "speak": [
        ("We speak English in class.", "我们在课堂上说英语。"),
        ("Can you speak a little Chinese?", "你会说一点中文吗？"),
    ],
    "weather": [
        ("What's the weather like today?", "今天天气怎么样？"),
        ("The weather is nice today.", "今天天气很好。"),
    ],
    "sunny": [
        ("It's sunny today.", "今天是晴天。"),
        ("We can play outside on sunny days.", "晴天我们可以去外面玩。"),
    ],
    "hot": [
        ("It's hot in summer.", "夏天很热。"),
        ("Sydney is hot today.", "悉尼今天很热。"),
    ],
    "bad": [
        ("The weather is bad today.", "今天天气不好。"),
        ("That's not bad.", "那还不错。"),
    ],
    "cold": [
        ("It's cold in winter.", "冬天很冷。"),
        ("Wear a coat. It's cold outside.", "穿上外套，外面很冷。"),
    ],
    "windy": [
        ("It's windy today.", "今天风很大。"),
        ("We can fly kites on windy days.", "有风的日子我们可以放风筝。"),
    ],
    "cloudy": [
        ("It's cloudy this morning.", "今天早上多云。"),
        ("The sky is cloudy.", "天空阴云密布。"),
    ],
    "rainy": [
        ("It's rainy today.", "今天在下雨。"),
        ("I stay at home on rainy days.", "下雨天我待在家里。"),
    ],
    "snowy": [
        ("It's snowy in Harbin.", "哈尔滨在下雪。"),
        ("We make a snowman on snowy days.", "下雪天我们堆雪人。"),
    ],
    "cool": [
        ("It's cool in autumn.", "秋天很凉爽。"),
        ("The weather is cool today.", "今天天气凉爽。"),
    ],
    "warm": [
        ("It's warm in spring.", "春天很温暖。"),
        ("The sun feels warm.", "阳光暖洋洋的。"),
    ],
    "tomorrow": [
        ("It will rain tomorrow.", "明天会下雨。"),
        ("See you tomorrow.", "明天见。"),
    ],
    "rain": [
        ("The rain comes in spring.", "春天会下雨。"),
        ("Take an umbrella. It may rain.", "带上伞，可能要下雨。"),
    ],
    "closed": [
        ("The shop is closed today.", "商店今天关门了。"),
        ("The library is closed on Monday.", "图书馆星期一闭馆。"),
    ],
    "film": [
        ("Let's watch a film.", "我们去看电影吧。"),
        ("This film is very funny.", "这部电影很有趣。"),
    ],
    "idea": [
        ("That's a good idea!", "那是个好主意！"),
        ("I have an idea.", "我有个主意。"),
    ],
    "fly": [
        ("We fly kites in the park.", "我们在公园放风筝。"),
        ("Birds fly in the sky.", "鸟儿在天空飞翔。"),
    ],
    "kite": [
        ("I have a new kite.", "我有一只新风筝。"),
        ("Let's fly a kite together.", "我们一起放风筝吧。"),
    ],
    "snowman": [
        ("We make a snowman in winter.", "我们在冬天堆雪人。"),
        ("Look at our big snowman!", "看我们的大雪人！"),
    ],
    "fun": [
        ("Flying kites is fun.", "放风筝很有趣。"),
        ("We have a lot of fun.", "我们玩得很开心。"),
    ],
    "their": [
        ("Their classroom is big.", "他们的教室很大。"),
        ("The children love their teacher.", "孩子们很爱他们的老师。"),
    ],
    "swim": [
        ("I can swim.", "我会游泳。"),
        ("We swim in summer.", "我们夏天游泳。"),
    ],
    "sydney": [
        ("Sydney is in Australia.", "悉尼在澳大利亚。"),
        ("What's the weather like in Sydney?", "悉尼的天气怎么样？"),
    ],
    # Unit 6 · Changing for the seasons
    "whose": [
        ("Whose sweater is this?", "这是谁的毛衣？"),
        ("Whose coat is on the chair?", "椅子上的外套是谁的？"),
    ],
    "sweater": [
        ("I wear a sweater in autumn.", "我秋天穿毛衣。"),
        ("This sweater is too small.", "这件毛衣太小了。"),
    ],
    "sock": [
        ("I need a sock.", "我需要一只短袜。"),
        ("This sock is mine.", "这只短袜是我的。"),
    ],
    "mine": [
        ("This book is mine.", "这本书是我的。"),
        ("The red coat is mine.", "这件红色外套是我的。"),
    ],
    "wear": [
        ("I wear a coat in winter.", "我冬天穿大衣。"),
        ("What do you wear today?", "你今天穿什么？"),
    ],
    "shirt": [
        ("He wears a white shirt.", "他穿着一件白衬衫。"),
        ("This shirt is clean.", "这件衬衫很干净。"),
    ],
    "coat": [
        ("Put on your coat.", "穿上你的外套。"),
        ("My coat is warm.", "我的外套很暖和。"),
    ],
    "dress": [
        ("She wears a red dress.", "她穿着一条红色连衣裙。"),
        ("This dress is very pretty.", "这条连衣裙很漂亮。"),
    ],
    "which": [
        ("Which season do you like best?", "你最喜欢哪个季节？"),
        ("Which coat is yours?", "哪件外套是你的？"),
    ],
    "season": [
        ("Spring is my favourite season.", "春天是我最喜欢的季节。"),
        ("There is a season called winter.", "有一个季节叫冬天。"),
    ],
    "winter": [
        ("It's cold in winter.", "冬天很冷。"),
        ("We wear gloves in winter.", "我们冬天戴手套。"),
    ],
    "snow": [
        ("I like snow in winter.", "我喜欢冬天的雪。"),
        ("The snow is white.", "雪是白色的。"),
    ],
    "spring": [
        ("Spring is warm.", "春天很温暖。"),
        ("Flowers come out in spring.", "春天花儿开放。"),
    ],
    "summer": [
        ("Summer is hot.", "夏天很热。"),
        ("We swim in summer.", "我们夏天游泳。"),
    ],
    "autumn": [
        ("Autumn is cool.", "秋天很凉爽。"),
        ("Leaves fall in autumn.", "秋天叶子落下。"),
    ],
    "t-shirt": [
        ("I wear a T-shirt in summer.", "我夏天穿 T 恤衫。"),
        ("This T-shirt is blue.", "这件 T 恤衫是蓝色的。"),
    ],
    "fall": [
        ("Leaves fall from the tree.", "叶子从树上落下来。"),
        ("Watch the snow fall in winter.", "看冬天下雪飘落。"),
    ],
    "leaf": [
        ("The leaf is yellow.", "这片叶子是黄色的。"),
        ("I see a yellow leaf.", "我看到一片黄色的叶子。"),
    ],
    "glove": [
        ("Wear your glove. It's cold.", "戴上手套，天很冷。"),
        ("I lose one glove.", "我丢了一只手套。"),
    ],
    "get together": [
        ("We get together on Spring Festival.", "我们在春节聚会。"),
        ("Let's get together this weekend.", "这周末我们聚一聚吧。"),
        ("Families get together for dinner.", "家人聚在一起吃晚饭。"),
    ],
}
