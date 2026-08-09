"""Textbook-aligned example sentences for 闽教版 Grade 3 English, Volume 1 (上册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 闽教版三年级上册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # U1 greetings / names / school
    'meet': [
        ('Nice to meet you!', '见到你很高兴！'),
        ('I meet my friend at school.', '我在学校遇见我的朋友。'),
        ('Meet my friend, Lily.', '见见我的朋友莉莉。'),
    ],
    'friend': [
        ('She is my friend.', '她是我的朋友。'),
        ('Nice to meet you, my friend.', '很高兴见到你，我的朋友。'),
        ('He is my good friend.', '我们是好朋友。'),
    ],
    'nice': [
        ('Nice to meet you!', '见到你很高兴！'),
        ('You are nice.', '你很友好。'),
        ('Have a nice day!', '祝你度过美好的一天！'),
    ],
    'to': [
        ('Nice to meet you.', '见到你很高兴。'),
        ('Welcome to our school.', '欢迎来到我们学校。'),
        ('Go to school.', '去上学。'),
    ],
    'you': [
        ('How are you?', '你好吗？'),
        ('Nice to meet you.', '见到你很高兴。'),
        ('Thank you.', '谢谢你。'),
    ],
    'in': [
        ('We are in the classroom.', '我们在教室里。'),
        ('I am in Grade Three.', '我在三年级。'),
        ('The cat is in my home.', '猫在我家里。'),
    ],
    'the': [
        ('Open the door, please.', '请开门。'),
        ('The boy is my friend.', '那个男孩是我的朋友。'),
        ('Good morning to the teacher!', '早上好，老师！'),
    ],
    'classroom': [
        ('We are in the classroom.', '我们在教室里。'),
        ('This is our classroom.', '这是我们的教室。'),
        ('The classroom is big.', '教室很大。'),
    ],
    'hello': [
        ('Hello! I am Lily.', '你好！我是莉莉。'),
        ('Hello, boys and girls!', '你们好，同学们！'),
        ('Say hello to your friend.', '向你的朋友问好。'),
    ],
    'boy': [
        ('The boy is my friend.', '那个男孩是我的朋友。'),
        ('Hello, boy!', '你好，男孩！'),
        ('A boy and a girl.', '一个男孩和一个女孩。'),
    ],
    'and': [
        ('A boy and a girl.', '一个男孩和一个女孩。'),
        ('You and I are friends.', '你和我是朋友。'),
        ('An apple and a banana.', '一个苹果和一根香蕉。'),
    ],
    'girl': [
        ('The girl is nice.', '那个女孩很友好。'),
        ('Hello, girl!', '你好，女孩！'),
        ('A boy and a girl.', '一个男孩和一个女孩。'),
    ],
    'I': [
        ('I am Lily.', '我是莉莉。'),
        ('I am fine.', '我很好。'),
        ('I am at school.', '我在学校。'),
    ],
    'am': [
        ('I am Lily.', '我是莉莉。'),
        ('I am fine.', '我很好。'),
        ('I am at home.', '我在家。'),
    ],
    "I'm=I am": [
        ("I'm Lily.", '我是莉莉。'),
        ("I'm fine.", '我很好。'),
        ("I'm at school.", '我在学校。'),
    ],
    'Miss': [
        ('Good morning, Miss!', '早上好，老师！'),
        ('This is Miss Gao.', '这是高老师。'),
        ('Thank you, Miss.', '谢谢你，老师。'),
    ],
    'too': [
        ('Nice to meet you, too.', '我也很高兴见到你。'),
        ('I am fine, too.', '我也很好。'),
        ('Me too.', '我也是。'),
    ],
    'a/an': [
        ('I have an apple.', '我有一个苹果。'),
        ('This is a cat.', '这是一只猫。'),
        ('An egg and a fish.', '一个鸡蛋和一条鱼。'),
    ],
    'apple': [
        ('I have an apple.', '我有一个苹果。'),
        ('The apple is red.', '苹果是红色的。'),
        ('I like this apple.', '我喜欢苹果。'),
    ],
    'banana': [
        ('I have a banana.', '我有一根香蕉。'),
        ('The banana is yellow.', '香蕉是黄色的。'),
        ('I like this banana.', '我喜欢香蕉。'),
    ],
    'what': [
        ("What is your name?", '你叫什么名字？'),
        ('What is this?', '这是什么？'),
        ('What color is it?', '它是什么颜色？'),
    ],
    'is': [
        ('My name is Lily.', '我叫莉莉。'),
        ('This is my cat.', '这是我的猫。'),
        ('It is fine.', '天气很好。'),
    ],
    "what's=what is": [
        ("What's your name?", '你叫什么名字？'),
        ("What's this?", '这是什么？'),
        ("What's that?", '那是什么？'),
    ],
    'your': [
        ("What's your name?", '你叫什么名字？'),
        ('Your cat is cute.', '你的猫很可爱。'),
        ('Open your book, please.', '请打开你的书。'),
    ],
    'name': [
        ("What's your name?", '你叫什么名字？'),
        ('My name is Lily.', '我叫莉莉。'),
        ('Nice name!', '好名字！'),
    ],
    'please': [
        ('Sit down, please.', '请坐下。'),
        ('Open the door, please.', '请开门。'),
        ('Come in, please.', '请进。'),
    ],
    'at': [
        ('I am at school.', '我在学校。'),
        ('Meet me at the gate.', '在校门口见我。'),
        ('I am at home.', '我在家。'),
    ],
    'school': [
        ('Welcome to our school.', '欢迎来到我们学校。'),
        ('I am at school.', '我在学校。'),
        ('I like my school.', '我喜欢我的学校。'),
    ],
    'gate': [
        ('Meet me at the gate.', '在校门口见我。'),
        ('The school gate is big.', '学校大门很大。'),
        ('We are at the gate.', '我们在校门口。'),
    ],
    'hi': [
        ('Hi! I am Tom.', '嗨！我是汤姆。'),
        ('Hi, Lily!', '嗨，莉莉！'),
        ('Hi, boys and girls!', '嗨，同学们！'),
    ],
    'my': [
        ('This is my cat.', '这是我的猫。'),
        ('My name is Lily.', '我叫莉莉。'),
        ('I love my mom.', '我爱我的妈妈。'),
    ],
    'cat': [
        ('This is my cat.', '这是我的猫。'),
        ('The cat is cute.', '猫很可爱。'),
        ('I like my cat.', '我喜欢我的猫。'),
    ],
    'dog': [
        ('This is my dog.', '这是我的狗。'),
        ('The dog says woof.', '狗汪汪叫。'),
        ('I like my dog.', '我喜欢我的狗。'),
    ],
    'how': [
        ('How are you?', '你好吗？'),
        ('How many duck can you see?', '多少只鸭子？'),
        ('How old are you?', '你几岁了？'),
    ],
    'are': [
        ('How are you?', '你好吗？'),
        ('You are my friend.', '你是我的朋友。'),
        ('We are in the classroom.', '我们在教室里。'),
    ],
    'home': [
        ('I am at home.', '我在家。'),
        ('Welcome to my home.', '欢迎来我家。'),
        ('Go home, please.', '请回家吧。'),
    ],
    'good': [
        ('Good morning!', '早上好！'),
        ('Good afternoon!', '下午好！'),
        ('You are a good friend.', '你是一个好朋友。'),
    ],
    'morning': [
        ('Good morning, Miss!', '早上好，老师！'),
        ('Good morning, boys and girls!', '同学们，早上好！'),
        ('I go to school in the morning.', '我早上去上学。'),
    ],
    'mom': [
        ('This is my mom.', '这是我妈妈。'),
        ('I love my mom.', '我爱我的妈妈。'),
        ('My mom is nice.', '我妈妈很好。'),
    ],
    'woof': [
        ('The dog says woof.', '狗汪汪叫。'),
        ('Woof! Woof!', '汪！汪！'),
        ('My dog goes woof.', '我的狗汪汪叫。'),
    ],
    'fine': [
        ('I am fine.', '我很好。'),
        ('I am fine, thank you.', '我很好，谢谢你。'),
        ('It is a fine day.', '今天天气很好。'),
    ],
    'thank': [
        ('Thank you.', '谢谢你。'),
        ('Thank you, Miss.', '谢谢你，老师。'),
        ('Thank you very much.', '非常感谢你。'),
    ],
    'afternoon': [
        ('Good afternoon!', '下午好！'),
        ('Good afternoon, Miss!', '老师，下午好！'),
        ('See you this afternoon.', '今天下午见。'),
    ],
    'egg': [
        ('I have an egg.', '我有一个鸡蛋。'),
        ('The hen has an egg.', '母鸡有一个蛋。'),
        ('An egg and a fish.', '一个鸡蛋和一条鱼。'),
    ],
    'fish': [
        ('I see a fish.', '我看到一条鱼。'),
        ('The fish can swim.', '鱼会游泳。'),
        ('I like fish.', '我喜欢鱼。'),
    ],
    'have': [
        ('I have a cat.', '我有一只猫。'),
        ('I have an apple.', '我有一个苹果。'),
        ('Do you have a pet?', '你有宠物吗？'),
    ],
    'day': [
        ('Have a nice day!', '祝你度过美好的一天！'),
        ('Good day!', '祝你今天愉快！'),
        ('See you another day.', '改天见。'),
    ],
    'street': [
        ('Stop at the red light on the street.', '在大街上的红灯处停下。'),
        ('The street is near our school.', '这条街在我们学校附近。'),
        ('Look both ways on the street.', '在街上要看两边。'),
    ],
    'this': [
        ('This is my cat.', '这是我的猫。'),
        ('This is Lily.', '这是莉莉。'),
        ('This is our classroom.', '这是我们的教室。'),
    ],
    'goodbye': [
        ('Goodbye, Miss!', '再见，老师！'),
        ('Goodbye, my friend.', '再见，我的朋友。'),
        ('Goodbye! See you!', '再见！回头见！'),
    ],
    'bye': [
        ('Bye! See you!', '再见！回头见！'),
        ('Bye, Lily!', '再见，莉莉！'),
        ('Goodbye and bye!', '再见！'),
    ],
    # U2 numbers / park / age
    'hen': [
        ('The hen has an egg.', '母鸡有一个蛋。'),
        ('I see a hen.', '我看到一只母鸡。'),
        ('The hen is on the farm.', '母鸡在农场里。'),
    ],
    'fun': [
        ("Let's play in the park. It is fun!", '我们去公园玩吧。真有趣！'),
        ('School is fun.', '上学很有趣。'),
        ('We have fun together.', '我们一起玩得很开心。'),
    ],
    'number': [
        ('What number is it?', '这是几号？'),
        ('Say the number, please.', '请说出数字。'),
        ('One is a number.', '一是一个数字。'),
    ],
    'let': [
        ('Let us play.', '让我们玩吧。'),
        ('Let me look.', '让我看看。'),
        ('Let us go to the park.', '我们去公园吧。'),
    ],
    'us': [
        ('Let us play.', '让我们玩吧。'),
        ('Come with us.', '跟我们来。'),
        ('Let us go.', '我们走吧。'),
    ],
    "let's=let us": [
        ("Let's play in the park.", '我们去公园玩吧。'),
        ("Let's go.", '我们走吧。'),
        ("Let's count.", '我们来数数吧。'),
    ],
    'play': [
        ("Let's play in the park.", '我们去公园玩吧。'),
        ('Play a game, please.', '请做个游戏。'),
        ('We play after school.', '我们放学后玩。'),
    ],
    'park': [
        ("Let's play in the park.", '我们去公园玩吧。'),
        ('The park is fun.', '公园很好玩。'),
        ('I like the park.', '我喜欢公园。'),
    ],
    'OK': [
        ("OK! Let's go.", '好的！我们走吧。'),
        ('That is OK.', '没关系。'),
        ('OK, thank you.', '好的，谢谢你。'),
    ],
    'one': [
        ('One, two, three!', '一、二、三！'),
        ('I have one kite.', '我有一只风筝。'),
        ('One duck.', '一只鸭子。'),
    ],
    'two': [
        ('One, two, three!', '一、二、三！'),
        ('I have two cats.', '我有两只猫。'),
        ('Two and two is four.', '二加二等于四。'),
    ],
    'three': [
        ('One, two, three!', '一、二、三！'),
        ('I see three ducks.', '我看到三只鸭子。'),
        ('Three lions.', '三头狮子。'),
    ],
    'four': [
        ('Four ducks in the park.', '公园里有四只鸭子。'),
        ('I am four years old.', '我四岁了。'),
        ('Three and one is four.', '三加一等于四。'),
    ],
    'five': [
        ('I am five years old.', '我五岁了。'),
        ('Five ducks.', '五只鸭子。'),
        ('Count to five.', '数到五。'),
    ],
    'six': [
        ('Six ducks in the park.', '公园里有六只鸭子。'),
        ('I am six years old.', '我六岁了。'),
        ('Five and one is six.', '五加一等于六。'),
    ],
    'seven': [
        ('Seven ducks.', '七只鸭子。'),
        ('I am seven years old.', '我七岁了。'),
        ('Count to seven.', '数到七。'),
    ],
    'eight': [
        ('Eight ducks in the park.', '公园里有八只鸭子。'),
        ('I am eight years old.', '我八岁了。'),
        ('Count to eight.', '数到八。'),
    ],
    'nine': [
        ('Nine ducks.', '九只鸭子。'),
        ('I am nine years old.', '我九岁了。'),
        ('Count to nine.', '数到九。'),
    ],
    'ten': [
        ('Ten ducks in the park.', '公园里有十只鸭子。'),
        ('I can count to ten.', '我能数到十。'),
        ('One to ten.', '从一到十。'),
    ],
    'great': [
        ("Great! Let's play.", '太好了！我们玩吧。'),
        ('You are great!', '你真棒！'),
        ('That is great.', '那太好了。'),
    ],
    'ice cream': [
        ('I like ice cream.', '我喜欢冰激凌。'),
        ('How about ice cream?', '来份冰激凌怎么样？'),
        ('The ice cream is great.', '冰激凌真好吃。'),
    ],
    'jacket': [
        ('I have a jacket.', '我有一件夹克。'),
        ('The jacket is blue.', '夹克是蓝色的。'),
        ('Put on your jacket.', '穿上你的夹克。'),
    ],
    'how many': [
        ('How many ducks?', '多少只鸭子？'),
        ('How many kites?', '多少只风筝？'),
        ('How many? Three ducks.', '多少？三只鸭子。'),
    ],
    'duck': [
        ('How many duck can you see?', '你看到多少只鸭子？'),
        ('I see one duck.', '我看到一只鸭子。'),
        ('The duck can swim.', '鸭子会游泳。'),
    ],
    'look': [
        ('Look! Three ducks.', '看！三只鸭子。'),
        ('Look at the kite.', '看那只风筝。'),
        ('Look at me.', '看看我。'),
    ],
    'many': [
        ('How many ducks?', '多少只鸭子？'),
        ('So many ducks!', '这么多鸭子！'),
        ('Many kites in the sky.', '天上有很多风筝。'),
    ],
    'really': [
        ('Really? How many?', '真的吗？多少？'),
        ('That is really great.', '那真棒。'),
        ('I really like it.', '我真的很喜欢。'),
    ],
    'yes': [
        ('Yes, I am fine.', '是的，我很好。'),
        ('Yes, please.', '好的，请。'),
        ('Yes, that is right.', '对，没错。'),
    ],
    'that': [
        ('That is right.', '没错。'),
        ('That is a lion.', '那是一头狮子。'),
        ('Look at that kite.', '看那只风筝。'),
    ],
    "that's=that is": [
        ("That's right.", '没错。'),
        ("That's a lion.", '那是一头狮子。'),
        ("That's great.", '那太好了。'),
    ],
    'right': [
        ('That is right.', '没错。'),
        ('You are right.', '你说得对。'),
        ('Turn right at the light.', '在红绿灯处右转。'),
    ],
    'kite': [
        ('I have a kite.', '我有一只风筝。'),
        ('The kite is in the sky.', '风筝在天上。'),
        ('Look at my kite.', '看看我的风筝。'),
    ],
    'lion': [
        ('That is a lion.', '那是一头狮子。'),
        ('The lion is big.', '狮子很大。'),
        ('I see a lion at the zoo.', '我在动物园看到一头狮子。'),
    ],
    'how old': [
        ('How old are you?', '你几岁了？'),
        ('How old is he?', '他几岁了？'),
        ('How old? I am eight.', '几岁？我八岁。'),
    ],
    'go': [
        ("Let's go to the park.", '我们去公园吧。'),
        ('Let us go.', '我们走吧。'),
        ('Go to school.', '去上学。'),
    ],
    'old': [
        ('How old are you?', '你几岁了？'),
        ('I am eight years old.', '我八岁了。'),
        ('My grandpa is old.', '我爷爷年纪大了。'),
    ],
    'year': [
        ('Happy New Year!', '新年快乐！'),
        ('One year has twelve months.', '一年有十二个月。'),
        ('This year is new.', '今年是新的一年。'),
    ],
    'oh': [
        ('Oh, I see.', '哦，我明白了。'),
        ('Oh, sorry!', '哦，对不起！'),
        ('Oh, how many?', '哦，多少？'),
    ],
    'sorry': [
        ('Oh, sorry!', '哦，对不起！'),
        ('I am sorry.', '对不起。'),
        ('Sorry, Miss.', '对不起，老师。'),
    ],
    'how about': [
        ('How about ice cream?', '来份冰激凌怎么样？'),
        ('How about you?', '你呢？'),
        ('How about a game?', '做个游戏怎么样？'),
    ],
    'yeah': [
        ("Yeah, let's play.", '好啊，我们玩吧。'),
        ('Yeah, that is right.', '对，没错。'),
        ('Yeah, I like it.', '是啊，我喜欢。'),
    ],
    'monkey': [
        ('The monkey is cute.', '猴子很可爱。'),
        ('I see a monkey at the zoo.', '我在动物园看到一只猴子。'),
        ('The monkey can jump.', '猴子会跳。'),
    ],
    'noodle': [
        ('I like this noodle.', '我喜欢面条。'),
        ('How about a noodle?', '来碗面条怎么样？'),
        ('The noodle is yummy.', '面条很好吃。'),
    ],
    'phone': [
        ('This is my phone.', '这是我的电话。'),
        ('Call me on the phone.', '给我打电话。'),
        ('The phone is on the desk.', '电话在课桌上。'),
    ],
    'it': [
        ('It is a cat.', '它是一只猫。'),
        ('What color is it?', '它是什么颜色？'),
        ('It is red.', '它是红色的。'),
    ],
    "it's=it is": [
        ("It's red.", '它是红色的。'),
        ("It's a kite.", '它是一只风筝。'),
        ("It's my pet.", '它是我的宠物。'),
    ],
    'pet': [
        ('It is my pet.', '它是我的宠物。'),
        ('I have a pet cat.', '我有一只宠物猫。'),
        ('My pet is cute.', '我的宠物很可爱。'),
    ],
    'orange': [
        ('It is orange.', '它是橙色的。'),
        ('I have an orange.', '我有一个橙子。'),
        ('The orange is sweet.', '橙子很甜。'),
    ],
    # U3 colors / traffic / school supplies
    'pig': [
        ('The pig is pink.', '猪是粉红色的。'),
        ('I see a pig.', '我看到一头猪。'),
        ('The pig says oink.', '猪哼哼叫。'),
    ],
    'color': [
        ('What color is it?', '它是什么颜色？'),
        ('Color the star red.', '把星星涂成红色。'),
        ('I like this color.', '我喜欢很多颜色。'),
    ],
    'around': [
        ('Look around the classroom.', '看看教室周围。'),
        ('Colors are around us.', '颜色在我们周围。'),
        ('Walk around the park.', '在公园周围走走。'),
    ],
    'green': [
        ('The light is green. Go!', '绿灯。走！'),
        ('The grass is green.', '草是绿色的。'),
        ('I like green.', '我喜欢绿色。'),
    ],
    'on': [
        ('The book is on the desk.', '书在课桌上。'),
        ('Put on your jacket.', '穿上你的夹克。'),
        ('On my way to school.', '在我上学的路上。'),
    ],
    'way': [
        ('On my way to school.', '在我上学的路上。'),
        ('Stop! This way.', '停下！这边走。'),
        ('Which way?', '哪条路？'),
    ],
    'stop': [
        ('Stop at the red light.', '在红灯处停下。'),
        ('Stop! Look!', '停！看！'),
        ('The bus stop is here.', '公交车站在这里。'),
    ],
    'light': [
        ('Stop at the red light.', '在红灯处停下。'),
        ('The light is green.', '灯是绿色的。'),
        ('Turn on the light.', '开灯。'),
    ],
    'red': [
        ('Stop at the red light.', '在红灯处停下。'),
        ('The apple is red.', '苹果是红色的。'),
        ('Color it red.', '把它涂成红色。'),
    ],
    'now': [
        ('Stop now.', '现在停下。'),
        ('Let us play now.', '我们现在玩吧。'),
        ('Go now.', '现在走吧。'),
    ],
    'question': [
        ('I have a question.', '我有一个问题。'),
        ('Answer the question, please.', '请回答问题。'),
        ('What is your question?', '你的问题是什么？'),
    ],
    'rabbit': [
        ('The rabbit is white.', '兔子是白色的。'),
        ('I see a rabbit.', '我看到一只兔子。'),
        ('The rabbit can jump.', '兔子会跳。'),
    ],
    'art': [
        ('We have art class.', '我们有美术课。'),
        ('I like art.', '我喜欢美术。'),
        ('Draw in art class.', '在美术课上画画。'),
    ],
    'class': [
        ('We are in class.', '我们在上课。'),
        ('Art class is fun.', '美术课很有趣。'),
        ('Good morning, class!', '同学们，早上好！'),
    ],
    'game': [
        ('Let us play a game.', '我们做个游戏吧。'),
        ('The game is fun.', '游戏很有趣。'),
        ('Play a game after class.', '下课后做个游戏。'),
    ],
    'blue': [
        ('The sky is blue.', '天空是蓝色的。'),
        ('I have a blue pen.', '我有一支蓝钢笔。'),
        ('Color it blue.', '把它涂成蓝色。'),
    ],
    'yellow': [
        ('The star is yellow.', '星星是黄色的。'),
        ('The banana is yellow.', '香蕉是黄色的。'),
        ('I like yellow.', '我喜欢黄色。'),
    ],
    'wow': [
        ('Wow! So colorful!', '哇！真多彩！'),
        ('Wow! A pink flower!', '哇！一朵粉色的花！'),
        ('Wow! Great!', '哇！太棒了！'),
    ],
    'white': [
        ('The rabbit is white.', '兔子是白色的。'),
        ('I have a white eraser.', '我有一块白色橡皮。'),
        ('Color it white.', '把它涂成白色。'),
    ],
    'pink': [
        ('The pig is pink.', '猪是粉红色的。'),
        ('I like pink.', '我喜欢粉色。'),
        ('A pink flower.', '一朵粉色的花。'),
    ],
    'star': [
        ('Color the star yellow.', '把星星涂成黄色。'),
        ('I draw a star.', '我画一颗星星。'),
        ('The star is yellow.', '星星是黄色的。'),
    ],
    'teacher': [
        ('This is my teacher.', '这是我的老师。'),
        ('The teacher is nice.', '老师很好。'),
        ('Good morning, teacher!', '老师，早上好！'),
    ],
    'show': [
        ('Show me your pen.', '给我看看你的钢笔。'),
        ('Show me your schoolbag.', '给我看看你的书包。'),
        ('Show your ruler, please.', '请拿出你的尺子。'),
    ],
    'me': [
        ('Show me your pen.', '给我看看你的钢笔。'),
        ('Look at me.', '看看我。'),
        ('Give it to me.', '把它给我。'),
    ],
    'schoolbag': [
        ('This is my schoolbag.', '这是我的书包。'),
        ('Put the book in your schoolbag.', '把书放进书包里。'),
        ('My schoolbag is blue.', '我的书包是蓝色的。'),
    ],
    'pencil box': [
        ('This is my pencil box.', '这是我的笔盒。'),
        ('The pen is in the pencil box.', '钢笔在笔盒里。'),
        ('Open your pencil box.', '打开你的笔盒。'),
    ],
    'black': [
        ('I have a black pen.', '我有一支黑色钢笔。'),
        ('The cat is black.', '猫是黑色的。'),
        ('Color it black.', '把它涂成黑色。'),
    ],
    'pen': [
        ('Show me your pen.', '给我看看你的钢笔。'),
        ('I have a black pen.', '我有一支黑色钢笔。'),
        ('The pen is in the pencil box.', '钢笔在笔盒里。'),
    ],
    'pencil': [
        ('I have a pencil.', '我有一支铅笔。'),
        ('Draw with your pencil.', '用铅笔画。'),
        ('The pencil is in the box.', '铅笔在笔盒里。'),
    ],
    'ruler': [
        ('Show your ruler, please.', '请拿出你的尺子。'),
        ('I have a ruler.', '我有一把尺子。'),
        ('Use a ruler to draw.', '用尺子画线。'),
    ],
    'book': [
        ('Open your book, please.', '请打开你的书。'),
        ('This is my English book.', '这是我的英语书。'),
        ('Put the book in your schoolbag.', '把书放进书包里。'),
    ],
    'eraser': [
        ('I have a white eraser.', '我有一块白色橡皮。'),
        ('Use the eraser, please.', '请用橡皮。'),
        ('The eraser is in the box.', '橡皮在笔盒里。'),
    ],
    'umbrella': [
        ('I have an umbrella.', '我有一把雨伞。'),
        ('The umbrella is colorful.', '雨伞很多彩。'),
        ('Take your umbrella.', '带上你的雨伞。'),
    ],
    'violin': [
        ('I play the violin.', '我拉小提琴。'),
        ('The violin is in the art room.', '小提琴在美术室。'),
        ('Listen to the violin.', '听小提琴声。'),
    ],
    'they': [
        ('They are my friends.', '他们是我的朋友。'),
        ('They are colorful.', '它们很多彩。'),
        ('They are in the classroom.', '他们在教室里。'),
    ],
    'colorful': [
        ('Wow! So colorful!', '哇！真多彩！'),
        ('The flowers are colorful.', '花很多彩。'),
        ('A colorful umbrella.', '一把多彩的雨伞。'),
    ],
    'flower': [
        ('A pink flower.', '一朵粉色的花。'),
        ('The flower is colorful.', '这朵花很多彩。'),
        ('I draw a flower.', '我画一朵花。'),
    ],
    'after': [
        ('After class, let us play.', '下课后我们玩吧。'),
        ('After school, I go home.', '放学后我回家。'),
        ('After art class, we draw.', '美术课后我们画画。'),
    ],
    'step': [
        ('Step one: draw a star.', '第一步：画一颗星星。'),
        ('Follow this step.', '按步骤来。'),
        ('Step by step.', '一步一步来。'),
    ],
    'draw': [
        ('Draw a star, please.', '请画一颗星星。'),
        ('I draw in art class.', '我在美术课上画画。'),
        ('Draw with your pencil.', '用铅笔画。'),
    ],
    'cut': [
        ('Cut the paper.', '剪纸。'),
        ('Cut and make a star.', '剪下来做一颗星星。'),
        ('Cut with scissors in art class.', '在美术课上用剪刀剪。'),
    ],
    'make': [
        ('Make a star.', '做一颗星星。'),
        ('Cut and make.', '剪下来做。'),
        ('Make it colorful.', '把它做得多彩一些。'),
    ],
    'window': [
        ('Open the window, please.', '请打开窗户。'),
        ('Look out of the window.', '往窗外看。'),
        ('The window is big.', '窗户很大。'),
    ],
    'X-ray': [
        ('The doctor uses an X-ray.', '医生用X光检查。'),
        ('Look at the X-ray picture.', '看看X光片。'),
        ('X-ray starts with X.', 'X-ray 以 X 开头。'),
    ],
    # U4 family / birthday
    'love': [
        ('I love my family.', '我爱我的家人。'),
        ('I love my mom.', '我爱我的妈妈。'),
        ('We love you.', '我们爱你。'),
    ],
    'family': [
        ('I love my family.', '我爱我的家人。'),
        ('This is my family.', '这是我的家人。'),
        ('My family is big.', '我的家庭很大。'),
    ],
    'father': [
        ('This is my father.', '这是我爸爸。'),
        ('My father is a worker.', '我爸爸是工人。'),
        ('I love my father.', '我爱我的爸爸。'),
    ],
    'brother': [
        ('This is my brother.', '这是我哥哥。'),
        ('My brother is happy.', '我哥哥很开心。'),
        ('I play with my brother.', '我和哥哥一起玩。'),
    ],
    'sister': [
        ('This is my sister.', '这是我姐姐。'),
        ('My sister is cute.', '我妹妹很可爱。'),
        ('I love my sister.', '我爱我的姐姐。'),
    ],
    'welcome': [
        ('Welcome to my home.', '欢迎来我家。'),
        ('Welcome!', '欢迎！'),
        ('Welcome to our school.', '欢迎来到我们学校。'),
    ],
    'mother': [
        ('This is my mother.', '这是我妈妈。'),
        ('My mother is a nurse.', '我妈妈是护士。'),
        ('I love my mother.', '我爱我的妈妈。'),
    ],
    'here': [
        ('Come here, please.', '请过来。'),
        ('Here is my family.', '这是我的家人。'),
        ('I am here.', '我在这里。'),
    ],
    'cake': [
        ('Happy birthday! Here is the cake.', '生日快乐！蛋糕来了。'),
        ('The cake is yummy.', '蛋糕很好吃。'),
        ('Blow out the candles on the cake.', '吹灭蛋糕上的蜡烛。'),
    ],
    'zoo': [
        ('We go to the zoo.', '我们去动物园。'),
        ('I see a lion at the zoo.', '我在动物园看到一头狮子。'),
        ('The zoo is fun.', '动物园很好玩。'),
    ],
    'who': [
        ('Who is he?', '他是谁？'),
        ('Who is she?', '她是谁？'),
        ('Who is your father?', '你爸爸是谁？'),
    ],
    'he': [
        ('Who is he?', '他是谁？'),
        ('He is my father.', '他是我爸爸。'),
        ('He is happy.', '他很开心。'),
    ],
    'happy': [
        ('Happy birthday!', '生日快乐！'),
        ('I am happy.', '我很开心。'),
        ('We are happy.', '我们很开心。'),
    ],
    'birthday': [
        ('Happy birthday!', '生日快乐！'),
        ('Today is my birthday.', '今天是我的生日。'),
        ('Birthday cake and presents.', '生日蛋糕和礼物。'),
    ],
    'we': [
        ('We are a family.', '我们是一家人。'),
        ('We are happy.', '我们很开心。'),
        ('We love you.', '我们爱你。'),
    ],
    'present': [
        ('This is a birthday present.', '这是一份生日礼物。'),
        ('A present for you.', '给你的礼物。'),
        ('Open your present.', '打开你的礼物。'),
    ],
    'for': [
        ('A present for you.', '给你的礼物。'),
        ('This cake is for you.', '这个蛋糕是给你的。'),
        ('This gift is for you.', '祝你生日快乐！'),
    ],
    'grandpa': [
        ('This is my grandpa.', '这是我爷爷。'),
        ('My grandpa is a farmer.', '我爷爷是农民。'),
        ('I love my grandpa.', '我爱我的爷爷。'),
    ],
    'she': [
        ('Who is she?', '她是谁？'),
        ('She is my mother.', '她是我妈妈。'),
        ('She is a nurse.', '她是护士。'),
    ],
    'grandma': [
        ('This is my grandma.', '这是我奶奶。'),
        ('My grandma is kind.', '我奶奶很和蔼。'),
        ('I love my grandma.', '我爱我的奶奶。'),
    ],
    'wish': [
        ('Make a wish!', '许个愿吧！'),
        ('I wish you happy birthday.', '祝你生日快乐。'),
        ('Close your eyes and wish.', '闭上眼睛许愿。'),
    ],
    'blow out': [
        ('Blow out the candle.', '吹灭蜡烛。'),
        ('Blow out the candles on the cake.', '吹灭蛋糕上的蜡烛。'),
        ('Make a wish and blow out.', '许个愿然后吹灭。'),
    ],
    'candle': [
        ('Blow out the candle.', '吹灭蜡烛。'),
        ('There is one candle.', '有一根蜡烛。'),
        ('The candle is on the cake.', '蜡烛在蛋糕上。'),
    ],
    'photo': [
        ('This is a family photo.', '这是一张全家福。'),
        ('Look at the photo.', '看看照片。'),
        ('Take a photo, please.', '请拍张照片。'),
    ],
    'so': [
        ('You are so cute.', '你真可爱。'),
        ('It is so big.', '它这么大。'),
        ('I am so happy.', '我好开心。'),
    ],
    'cute': [
        ('You are so cute.', '你真可爱。'),
        ('The cat is cute.', '猫很可爱。'),
        ('What a cute pet!', '多可爱的宠物啊！'),
    ],
    'doctor': [
        ('My uncle is a doctor.', '我叔叔是医生。'),
        ('The doctor is kind.', '医生很和蔼。'),
        ('I want to be a doctor.', '我想当医生。'),
    ],
    'English': [
        ('This is my English book.', '这是我的英语书。'),
        ('We have English class.', '我们有英语课。'),
        ('I like English.', '我喜欢英语。'),
    ],
    'farmer': [
        ('My grandpa is a farmer.', '我爷爷是农民。'),
        ('The farmer works on the farm.', '农民在农场干活。'),
        ('A farmer and a hen.', '一个农民和一只母鸡。'),
    ],
    'cook': [
        ('My mother is a cook.', '我妈妈是厨师。'),
        ('The cook makes yummy food.', '厨师做好吃的食物。'),
        ('I can cook noodles.', '我会煮面条。'),
    ],
    'uncle': [
        ('My uncle is a doctor.', '我叔叔是医生。'),
        ('This is my uncle.', '这是我叔叔。'),
        ('I love my uncle.', '我爱我的叔叔。'),
    ],
    'worker': [
        ('My father is a worker.', '我爸爸是工人。'),
        ('The worker is at work.', '工人在工作。'),
        ('A worker in our city.', '我们城市的一名工人。'),
    ],
    'aunt': [
        ('This is my aunt.', '这是我阿姨。'),
        ('My aunt is a nurse.', '我阿姨是护士。'),
        ('I love my aunt.', '我爱我的阿姨。'),
    ],
    'nurse': [
        ('My mother is a nurse.', '我妈妈是护士。'),
        ('The nurse is kind.', '护士很和蔼。'),
        ('A nurse in the hospital.', '医院里的一名护士。'),
    ],
    'big': [
        ('My family is big.', '我的家庭很大。'),
        ('The lion is big.', '狮子很大。'),
        ('A big cake.', '一个大蛋糕。'),
    ],
}
