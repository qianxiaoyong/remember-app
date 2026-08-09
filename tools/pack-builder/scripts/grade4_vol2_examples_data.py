"""Textbook-aligned example sentences for PEP Grade 4 English, Volume 2 (下册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 人教版四年级下册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1 · School rules
    "sorry": [
        ("I'm sorry I'm late.", "对不起，我迟到了。"),
        ("Sorry, I don't understand.", "对不起，我不明白。"),
    ],
    "hurry up": [
        ("Hurry up! Class is starting.", "快点！要上课了。"),
        ("Hurry up, or you'll be late.", "快点，不然你要迟到了。"),
    ],
    "late": [
        ("Don't be late for class.", "上课别迟到。"),
        ("Sorry, I'm late today.", "对不起，我今天迟到了。"),
    ],
    "class": [
        ("We have English class in the morning.", "我们上午有英语课。"),
        ("Please be quiet in class.", "请在课堂上保持安静。"),
    ],
    "ready": [
        ("Are you ready for class?", "你准备好上课了吗？"),
        ("I'm ready. Let's go.", "我准备好了，我们走吧。"),
    ],
    "rule": [
        ("Follow this classroom rule.", "遵守这条课堂规则。"),
        ("This is an important rule.", "这是一条重要的规则。"),
    ],
    "classroom": [
        ("Our classroom is big and bright.", "我们的教室又大又明亮。"),
        ("Please keep the classroom tidy.", "请保持教室整洁。"),
    ],
    "turn off": [
        ("Please turn off the light.", "请关灯。"),
        ("Turn off the fan, please.", "请把风扇关掉。"),
    ],
    "light": [
        ("Turn on the light, please.", "请开灯。"),
        ("The classroom light is too bright.", "教室的灯太亮了。"),
    ],
    "blackboard": [
        ("The teacher writes on the blackboard.", "老师在黑板上写字。"),
        ("Look at the blackboard, please.", "请看黑板。"),
    ],
    "desk": [
        ("Put your books on the desk.", "把书放在课桌上。"),
        ("My desk is near the window.", "我的课桌在窗户旁边。"),
    ],
    "chair": [
        ("Please sit on your chair.", "请坐在你的椅子上。"),
        ("The chair is next to the desk.", "椅子在课桌旁边。"),
    ],
    "tidy": [
        ("Keep your desk tidy.", "保持课桌整洁。"),
        ("Let's tidy the classroom together.", "我们一起把教室整理干净吧。"),
    ],
    "music": [
        ("We have music class on Friday.", "我们星期五有音乐课。"),
        ("I like music very much.", "我非常喜欢音乐。"),
    ],
    "door": [
        ("Please close the door.", "请关门。"),
        ("The door is open.", "门开着。"),
    ],
    "window": [
        ("Open the window, please.", "请打开窗户。"),
        ("My desk is by the window.", "我的课桌在窗户边。"),
    ],
    "fan": [
        ("Turn on the fan. It's hot.", "打开风扇，天很热。"),
        ("The fan is on the wall.", "风扇在墙上。"),
    ],
    "when": [
        ("When do we have music class?", "我们什么时候上音乐课？"),
        ("When you are ready, raise your hand.", "准备好了就举手。"),
    ],
    "understand": [
        ("Do you understand the rule?", "你明白这条规则吗？"),
        ("I don't understand. Can you help me?", "我不明白，你能帮帮我吗？"),
    ],
    "wall": [
        ("There is a fan on the wall.", "墙上有一台风扇。"),
        ("Don't write on the wall.", "别在墙上乱写。"),
    ],
    "newspaper": [
        ("I read a newspaper at home.", "我在家看报纸。"),
        ("There is a newspaper on the desk.", "课桌上有一份报纸。"),
    ],
    "hand out": [
        ("Please hand out the workbooks.", "请把练习册发下去。"),
        ("The teacher hands out the books.", "老师把书发给大家。"),
    ],
    "workbook": [
        ("Open your workbook, please.", "请打开你的练习册。"),
        ("Write the words in your workbook.", "把单词写在你的练习册里。"),
    ],
    # Unit 2 · Home rules
    "watch": [
        ("Don't watch TV too late.", "别太晚看电视。"),
        ("I watch TV after dinner.", "我晚饭后看电视。"),
    ],
    "TV": [
        ("Turn off the TV, please.", "请关掉电视。"),
        ("We watch TV in the living room.", "我们在客厅看电视。"),
    ],
    "tv": [
        ("Turn off the TV, please.", "请关掉电视。"),
        ("We watch TV in the living room.", "我们在客厅看电视。"),
    ],
    "homework": [
        ("Do your homework first.", "先做作业。"),
        ("I finish my homework before dinner.", "我晚饭前完成作业。"),
    ],
    "first": [
        ("Do your homework first.", "先做作业。"),
        ("First, wash your hands.", "先洗手。"),
    ],
    "wet": [
        ("The floor is wet. Don't run.", "地板是湿的，别跑。"),
        ("My hair is wet after a shower.", "洗完澡后头发是湿的。"),
    ],
    "run": [
        ("Don't run in the house.", "别在屋里跑。"),
        ("Don't run on the wet floor.", "别在湿滑的地板上跑。"),
    ],
    "living room": [
        ("We watch TV in the living room.", "我们在客厅看电视。"),
        ("The living room is big and bright.", "客厅又大又明亮。"),
    ],
    "safe": [
        ("It's safe to wait here.", "在这里等很安全。"),
        ("Follow the rules to stay safe.", "遵守规则才能安全。"),
    ],
    "word": [
        ("Write the new word five times.", "把新单词写五遍。"),
        ("I learn a new word every day.", "我每天学一个新单词。"),
    ],
    "wash": [
        ("Wash your hands before dinner.", "晚饭前洗手。"),
        ("I wash my face every morning.", "我每天早上洗脸。"),
    ],
    "helpful": [
        ("You are very helpful at home.", "你在家里很帮忙。"),
        ("It's helpful to tidy your room.", "整理房间很有帮助。"),
    ],
    "loud": [
        ("Don't talk so loud at home.", "别在家里这么大声说话。"),
        ("The music is too loud.", "音乐声太大了。"),
    ],
    "sleep": [
        ("Go to sleep early.", "早点睡觉。"),
        ("I sleep in my bedroom.", "我在卧室睡觉。"),
    ],
    "bedroom": [
        ("This is my bedroom.", "这是我的卧室。"),
        ("Keep your bedroom tidy.", "保持卧室整洁。"),
    ],
    "kitchen": [
        ("Mum is cooking in the kitchen.", "妈妈在厨房做饭。"),
        ("Don't run in the kitchen.", "别在厨房跑。"),
    ],
    "study": [
        ("I do my homework in the study.", "我在书房做作业。"),
        ("The study is quiet.", "书房很安静。"),
    ],
    "bathroom": [
        ("Wash your hands in the bathroom.", "在卫生间洗手。"),
        ("The bathroom is next to my bedroom.", "卫生间在我卧室旁边。"),
    ],
    "think": [
        ("I think this rule is good.", "我觉得这条规则很好。"),
        ("Think before you answer.", "回答前先想一想。"),
    ],
    "work": [
        ("My parents work hard every day.", "我父母每天都很努力工作。"),
        ("I work on my homework after school.", "放学后我做作业。"),
    ],
    "hard": [
        ("Work hard and you will do well.", "努力学习就会进步。"),
        ("My parents work hard for our family.", "父母为家庭辛苦工作。"),
    ],
    "follow": [
        ("Follow the rules at home.", "在家遵守规则。"),
        ("Please follow me.", "请跟我来。"),
    ],
    "feel": [
        ("I feel tired after school.", "放学后我觉得很累。"),
        ("How do you feel today?", "你今天感觉怎么样？"),
    ],
    # Unit 3 · Time
    "over": [
        ("School is over at four o'clock.", "学校四点钟放学。"),
        ("Class is over. Let's go home.", "下课了，我们回家吧。"),
    ],
    "kid": [
        ("The kid is reading a book.", "那个小孩在看书。"),
        ("Every kid should follow the rules.", "每个孩子都应该遵守规则。"),
    ],
    "dinner": [
        ("We have dinner at six o'clock.", "我们六点钟吃晚饭。"),
        ("What's for dinner tonight?", "今晚晚饭吃什么？"),
    ],
    "art": [
        ("We have art class on Wednesday.", "我们星期三有美术课。"),
        ("I like art class very much.", "我非常喜欢美术课。"),
    ],
    "lunch": [
        ("We have lunch at school.", "我们在学校吃午饭。"),
        ("It's time for lunch.", "该吃午饭了。"),
    ],
    "maths": [
        ("We have maths in the morning.", "我们上午有数学课。"),
        ("I like maths class.", "我喜欢数学课。"),
    ],
    "get up": [
        ("I get up at seven o'clock.", "我七点钟起床。"),
        ("When do you get up every day?", "你每天几点起床？"),
    ],
    "go to school": [
        ("I go to school at eight o'clock.", "我八点钟去上学。"),
        ("We go to school from Monday to Friday.", "我们周一到周五上学。"),
    ],
    "go home": [
        ("We go home at four o'clock.", "我们四点钟回家。"),
        ("Let's go home after school.", "放学后我们回家吧。"),
    ],
    "go to bed": [
        ("I go to bed at nine o'clock.", "我九点钟上床睡觉。"),
        ("Go to bed early. You have school tomorrow.", "早点睡，明天还要上学。"),
    ],
    "want": [
        ("I want to play after school.", "我想放学后玩。"),
        ("What do you want for lunch?", "午饭你想吃什么？"),
    ],
    "clock": [
        ("Look at the clock. It's eight o'clock.", "看钟，八点了。"),
        ("There is a clock on the wall.", "墙上有一个钟。"),
    ],
    "just": [
        ("It's just seven o'clock.", "现在才七点钟。"),
        ("Just a minute, please.", "请等一下。"),
    ],
    "minute": [
        ("Wait a minute, please.", "请等一分钟。"),
        ("One minute is sixty seconds.", "一分钟是六十秒。"),
    ],
    # Unit 4 · Shopping
    "trousers": [
        ("These trousers are too long.", "这条裤子太长了。"),
        ("I want a pair of trousers.", "我想要一条裤子。"),
    ],
    "clothes": [
        ("These clothes are very nice.", "这些衣服很漂亮。"),
        ("I need some new clothes.", "我需要一些新衣服。"),
    ],
    "those": [
        ("Those shorts are cheap.", "那条短裤很便宜。"),
        ("I like those shoes.", "我喜欢那双鞋。"),
    ],
    "shorts": [
        ("I wear shorts in summer.", "我夏天穿短裤。"),
        ("These shorts are too small.", "这条短裤太小了。"),
    ],
    "jacket": [
        ("This jacket is beautiful.", "这件夹克很漂亮。"),
        ("I want to buy a new jacket.", "我想买一件新夹克。"),
    ],
    "skirt": [
        ("She wears a red skirt.", "她穿着一条红色短裙。"),
        ("This skirt is too expensive.", "这条短裙太贵了。"),
    ],
    "dear": [
        ("Dear Mum, I love you.", "亲爱的妈妈，我爱你。"),
        ("The shoes are too dear.", "这双鞋太贵了。"),
    ],
    "expensive": [
        ("This jacket is too expensive.", "这件夹克太贵了。"),
        ("I don't like expensive clothes.", "我不喜欢贵的衣服。"),
    ],
    "take": [
        ("I'll take this hat, please.", "我要这顶帽子。"),
        ("Take your size and try them on.", "拿你的尺码试穿一下。"),
    ],
    "cheap": [
        ("These shorts are cheap.", "这条短裤很便宜。"),
        ("I like cheap and nice clothes.", "我喜欢又便宜又好看的衣服。"),
    ],
    "shoe": [
        ("This shoe is size 36.", "这只鞋是 36 码。"),
        ("I need a shoe.", "我需要一只鞋。"),
    ],
    "beautiful": [
        ("This skirt is beautiful.", "这条短裙很漂亮。"),
        ("What a beautiful hat!", "多漂亮的帽子啊！"),
    ],
    "hat": [
        ("I want to buy a hat.", "我想买一顶帽子。"),
        ("This hat is too large.", "这顶帽子太大了。"),
    ],
    "sunglasses": [
        ("These sunglasses are free today.", "这副太阳镜今天免费。"),
        ("I wear sunglasses on sunny days.", "晴天我戴太阳镜。"),
    ],
    "free": [
        ("These sunglasses are free.", "这副太阳镜是免费的。"),
        ("Is this hat free?", "这顶帽子免费吗？"),
    ],
    "large": [
        ("This jacket is too large for me.", "这件夹克我穿太大了。"),
        ("Do you have a large size?", "有大号的吗？"),
    ],
    "size": [
        ("What size do you wear?", "你穿多大码？"),
        ("These shoes are the right size.", "这双鞋尺码正好。"),
    ],
    "list": [
        ("Make a shopping list first.", "先列一张购物清单。"),
        ("What's on your list?", "你的清单上有什么？"),
    ],
    "try on": [
        ("Can I try on this jacket?", "我可以试穿这件夹克吗？"),
        ("Try on these shoes, please.", "请试穿这双鞋。"),
    ],
    "any": [
        ("Do you have any cheap hats?", "有便宜的帽子吗？"),
        ("You can try any size.", "你可以试任何尺码。"),
    ],
    # Unit 5 · Farm
    "cow": [
        ("The cow gives us milk.", "奶牛给我们产奶。"),
        ("There is a cow on the farm.", "农场里有一头奶牛。"),
    ],
    "horse": [
        ("The horse runs fast.", "马跑得很快。"),
        ("I see a horse on the farm.", "我在农场看见一匹马。"),
    ],
    "sheep": [
        ("There are many sheep on the farm.", "农场里有很多绵羊。"),
        ("The sheep eat grass.", "绵羊在吃草。"),
    ],
    "pig": [
        ("The pig is pink and fat.", "猪是粉红色、胖胖的。"),
        ("We feed the pig every day.", "我们每天喂猪。"),
    ],
    "chicken": [
        ("The chicken lays eggs.", "鸡会下蛋。"),
        ("We have a chicken on the farm.", "我们农场里有一只鸡。"),
    ],
    "tomato": [
        ("I like tomato soup.", "我喜欢番茄汤。"),
        ("This tomato is red and big.", "这个番茄又红又大。"),
    ],
    "bee": [
        ("The bee makes honey.", "蜜蜂酿蜜。"),
        ("Don't touch the bee.", "别碰蜜蜂。"),
    ],
    "mouse": [
        ("The mouse is small.", "老鼠很小。"),
        ("I see a mouse in the field.", "我在田地里看见一只老鼠。"),
    ],
    "carrot": [
        ("Rabbits like a carrot.", "兔子喜欢胡萝卜。"),
        ("This carrot is long and orange.", "这根胡萝卜又长又橙。"),
    ],
    "potato": [
        ("We grow a potato on the farm.", "我们在农场种土豆。"),
        ("I'd like some potato chips.", "我想要一些薯片。"),
    ],
    "green bean": [
        ("We pick green beans in the garden.", "我们在菜园里摘四季豆。"),
        ("Green beans are good for you.", "四季豆对你有好处。"),
    ],
    "can": [
        ("There is a can on the table.", "桌上有一个金属罐。"),
        ("Put the beans in a can.", "把豆子放进罐子里。"),
    ],
    "a box of": [
        ("I want a box of tomatoes.", "我想要一盒西红柿。"),
        ("She buys a box of crayons.", "她买了一盒蜡笔。"),
    ],
    # Unit 6 · Table manners
    "feed": [
        ("We feed the chickens every morning.", "我们每天早上喂鸡。"),
        ("Don't feed the animals here.", "别在这里喂动物。"),
    ],
    "pass": [
        ("Pass me the spoon, please.", "请把勺子递给我。"),
        ("Can you pass the bowl?", "你能把碗递过来吗？"),
    ],
    "pick": [
        ("Pick up your chopsticks.", "拿起你的筷子。"),
        ("We pick vegetables on the farm.", "我们在农场摘蔬菜。"),
    ],
    "milk": [
        ("I'd like a glass of milk.", "我想要一杯牛奶。"),
        ("The milk is fresh.", "牛奶很新鲜。"),
    ],
    "knife": [
        ("Use a knife and fork, please.", "请用刀叉。"),
        ("The knife is on the right.", "刀在右边。"),
    ],
    "fork": [
        ("Pass me the fork, please.", "请把叉子递给我。"),
        ("I eat salad with a fork.", "我用叉子吃沙拉。"),
    ],
    "chopstick": [
        ("Can you use a chopstick?", "你会用筷子吗？"),
        ("Pick up your chopstick before dinner.", "吃饭前拿起筷子。"),
    ],
    "waste": [
        ("Don't waste food.", "别浪费食物。"),
        ("It's wrong to waste water.", "浪费水是不对的。"),
    ],
    "food": [
        ("The food is delicious.", "食物很美味。"),
        ("Don't waste food at dinner.", "吃饭时别浪费食物。"),
    ],
    "delicious": [
        ("This salad is delicious.", "这份沙拉很好吃。"),
        ("What delicious food!", "多好吃的食物啊！"),
    ],
    "clear the table": [
        ("Please clear the table after dinner.", "晚饭后请收拾餐桌。"),
        ("I clear the table every evening.", "我每天晚上收拾餐桌。"),
    ],
    "set the table": [
        ("Please set the table for dinner.", "请摆好餐桌准备吃晚饭。"),
        ("She sets the table every evening.", "她每天晚上摆餐具。"),
    ],
    "bowl": [
        ("Pass me a bowl, please.", "请递给我一个碗。"),
        ("I eat soup from a bowl.", "我用碗喝汤。"),
    ],
    "spoon": [
        ("Use a spoon for soup.", "喝汤用勺子。"),
        ("Pass me the spoon, please.", "请把勺子递给我。"),
    ],
    "supermarket": [
        ("We buy food at the supermarket.", "我们在超市买食物。"),
        ("The supermarket is near my home.", "超市在我家附近。"),
    ],
    "herself": [
        ("She makes salad herself.", "她自己做沙拉。"),
        ("Mum cooks dinner herself today.", "妈妈今天自己做晚饭。"),
    ],
    "week": [
        ("We go to the supermarket once a week.", "我们每周去超市一次。"),
        ("I have art class twice a week.", "我每周上两次美术课。"),
    ],
    "salad": [
        ("I'd like some salad, please.", "请给我一些沙拉。"),
        ("This salad is fresh and delicious.", "这份沙拉新鲜又好吃。"),
    ],
}
