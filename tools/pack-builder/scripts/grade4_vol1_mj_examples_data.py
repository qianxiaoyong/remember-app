"""Textbook-aligned example sentences for 闽教版 Grade 4 English, Volume 1 (上册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 闽教版四年级上册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # U1 school, city
    'blackboard': [
        ('Look at the blackboard.', '看黑板。'),
        ('The blackboard is clean.', '黑板很干净。'),
        ('Write on the blackboard, please.', '请在黑板上写字。'),
    ],
    'bright': [
        ('The classroom is bright.', '教室很明亮。'),
        ('It is a bright day.', '今天是明亮的一天。'),
        ('The light is very bright.', '灯很亮。'),
    ],
    'card': [
        ('This is my card.', '这是我的卡片。'),
        ('I have a new card.', '我有一张新卡片。'),
        ('Give me a card, please.', '请给我一张卡片。'),
    ],
    'cinema': [
        ('There is a cinema in the city.', '城市里有一家电影院。'),
        ('We go to the cinema on Sunday.', '我们星期天去电影院。'),
        ('The cinema is near the library.', '电影院在图书馆附近。'),
    ],
    'city': [
        ('I live in a big city.', '我住在一个大城市。'),
        ('The city is beautiful.', '这座城市很美丽。'),
        ('There is a library in the city.', '城市里有一座图书馆。'),
    ],
    'classmate': [
        ('She is my classmate.', '她是我的同班同学。'),
        ('My classmate is a new student.', '我的同班同学是新学生。'),
        ('I talk with my classmate.', '我和我的同班同学说话。'),
    ],
    'clean': [
        ('The desk is clean.', '书桌很干净。'),
        ('We clean the classroom.', '我们打扫教室。'),
        ('Keep your desk clean.', '保持你的书桌干净。'),
    ],
    'cold': [
        ('It is cold today.', '今天很冷。'),
        ('The ice is cold.', '冰是冷的。'),
        ('Put on your coat. It is cold.', '穿上外套，天很冷。'),
    ],
    'come': [
        ('Come here, please.', '请过来。'),
        ('Come to my desk.', '到我的书桌来。'),
        ('Come and see the new student.', '过来看看新同学。'),
    ],
    'computer': [
        ('This is a new computer.', '这是一台新电脑。'),
        ('We use a computer in IT class.', '我们在信息技术课上用电脑。'),
        ('The computer is on the desk.', '电脑在书桌上。'),
    ],
    'cousin': [
        ('This is my cousin.', '这是我的表（堂）兄弟姐妹。'),
        ('My cousin is a student.', '我的表（堂）兄弟姐妹是一名学生。'),
        ('I play with my cousin.', '我和我的表（堂）兄弟姐妹一起玩。'),
    ],
    'cow': [
        ('The cow is on the farm.', '奶牛在农场里。'),
        ('Look at the big cow.', '看那头大奶牛。'),
        ('The cow eats grass.', '奶牛吃草。'),
    ],
    'dance': [
        ('I can dance.', '我会跳舞。'),
        ('We dance in the gym.', '我们在体育馆里跳舞。'),
        ('She likes to dance.', '她喜欢跳舞。'),
    ],
    'desk': [
        ('This is my desk.', '这是我的书桌。'),
        ('Put your book on the desk.', '把你的书放在书桌上。'),
        ('The desk is near the window.', '书桌在窗户旁边。'),
    ],
    'grade': [
        ('I am in Grade Four.', '我在四年级。'),
        ('Which grade are you in?', '你在几年级？'),
        ('We are in the same grade.', '我们在同一个年级。'),
    ],
    'ice': [
        ('The ice is cold.', '冰是冷的。'),
        ('There is ice in the cup.', '杯子里有冰。'),
        ('Be careful! The ice is slippery.', '小心！冰很滑。'),
    ],
    'IT（=（Information Technology）': [
        ('We have IT class today.', '我们今天有信息技术课。'),
        ('I learn IT at school.', '我在学校学信息技术。'),
        ('IT is interesting.', '信息技术很有意思。'),
    ],
    'library': [
        ('The library is quiet.', '图书馆很安静。'),
        ('We read books in the library.', '我们在图书馆里看书。'),
        ('There is a library in our city.', '我们城市里有一座图书馆。'),
    ],
    'Ms.': [
        ('Good morning, Ms. Wang!', '早上好，王女士！'),
        ('This is Ms. Li.', '这是李女士。'),
        ('Thank you, Ms. Chen.', '谢谢你，陈女士。'),
    ],
    'new': [
        ('She is a new student.', '她是一名新学生。'),
        ('This is my new computer.', '这是我的新电脑。'),
        ('We have a new classmate.', '我们有一位新同学。'),
    ],
    'same': [
        ('We are in the same grade.', '我们在同一个年级。'),
        ('We go to the same school.', '我们上同一所学校。'),
        ('My desk is the same as yours.', '我的书桌和你的一样。'),
    ],
    'sing': [
        ('I can sing a song.', '我会唱一首歌。'),
        ('We sing in music class.', '我们在音乐课上唱歌。'),
        ('She likes to sing.', '她喜欢唱歌。'),
    ],
    'student': [
        ('I am a student.', '我是一名学生。'),
        ('She is a new student.', '她是一名新学生。'),
        ('The student is in the library.', '这名学生在图书馆里。'),
    ],
    'there': [
        ('There is a library in the city.', '城市里有一座图书馆。'),
        ('There are many students here.', '这里有很多学生。'),
        ('Look! There is a new computer.', '看！有一台新电脑。'),
    ],
    'which': [
        ('Which grade are you in?', '你在几年级？'),
        ('Which desk is yours?', '哪张书桌是你的？'),
        ('Which city do you live in?', '你住在哪个城市？'),
    ],
    # U2 daily life, chores
    'age': [
        ('How old are you? What is your age?', '你多大了？你的年龄是多少？'),
        ('She is my age.', '她和我同龄。'),
        ('At my age, I can sweep the floor.', '在我这个年纪，我会扫地。'),
    ],
    'ball': [
        ('This is a ball.', '这是一个足球。'),
        ('Kick the ball, please.', '请踢球。'),
        ('The ball is in the garden.', '球在花园里。'),
    ],
    'bus': [
        ('I go to school by bus.', '我乘公共汽车上学。'),
        ('The bus is full.', '公共汽车满了。'),
        ('Wait for the bus here.', '在这里等公共汽车。'),
    ],
    'car': [
        ('This is a red car.', '这是一辆红色的小汽车。'),
        ('My father has a car.', '我爸爸有一辆小汽车。'),
        ('Get into the car.', '上车。'),
    ],
    'chore': [
        ('I do a chore at home.', '我在家做家务。'),
        ('Sweeping is a chore.', '扫地是一项家务。'),
        ('My daily chore is to wash the floor.', '我的日常家务是洗地板。'),
    ],
    'daily': [
        ('This is my daily life.', '这是我的日常生活。'),
        ('I do daily chores at home.', '我在家做日常家务。'),
        ('We talk about daily life.', '我们谈论日常生活。'),
    ],
    'floor': [
        ('Sweep the floor, please.', '请扫地。'),
        ('The floor is clean now.', '地板现在很干净了。'),
        ('Wash the floor after dinner.', '晚饭后洗地板。'),
    ],
    'football': [
        ('I like football.', '我喜欢足球。'),
        ('We play football in the gym.', '我们在体育馆里踢足球。'),
        ('Kick the football!', '踢足球！'),
    ],
    'full': [
        ('The bus is full.', '公共汽车满了。'),
        ('I am full after dinner.', '晚饭后我吃饱了。'),
        ('The garden is full of flowers.', '花园里开满了花。'),
    ],
    'garden': [
        ('We have a small garden.', '我们有一个小花园。'),
        ('The ball is in the garden.', '球在花园里。'),
        ('I pick up leaves in the garden.', '我在花园里捡落叶。'),
    ],
    'get': [
        ('Get up early, please.', '请早起。'),
        ('I get into the bus.', '我上了公共汽车。'),
        ('Get your ball from the garden.', '从花园里拿你的球。'),
    ],
    'get up': [
        ('I get up at six.', '我六点起床。'),
        ('Get up! It is time for school.', '起床！该上学了。'),
        ('She gets up early every day.', '她每天早起。'),
    ],
    'gym': [
        ('We play football in the gym.', '我们在体育馆里踢足球。'),
        ('The gym is big.', '体育馆很大。'),
        ('Come to the gym after school.', '放学后到体育馆来。'),
    ],
    'hand': [
        ('Wash your hand, please.', '请洗手。'),
        ('Raise your hand.', '举手。'),
        ('She has a ball in her hand.', '她手里有一个球。'),
    ],
    'has': [
        ('She has a new computer.', '她有一台新电脑。'),
        ('He has breakfast at seven.', '他七点吃早餐。'),
        ('My classmate has a pet dog.', '我的同班同学有一只宠物狗。'),
    ],
    'her': [
        ('This is her house.', '这是她的房子。'),
        ('Her age is ten.', '她十岁。'),
        ('Wash her hands, please.', '请洗她的手。'),
    ],
    'house': [
        ('This is my house.', '这是我的房子。'),
        ('We sweep the floor in the house.', '我们在房子里扫地。'),
        ('Her house has a garden.', '她的房子有一个花园。'),
    ],
    'into': [
        ('Get into the car.', '上车。'),
        ('Go into the house.', '进屋里去。'),
        ('Put the ball into the box.', '把球放进盒子里。'),
    ],
    'life': [
        ('This is my daily life.', '这是我的日常生活。'),
        ('School life is wonderful.', '学校生活很棒。'),
        ('We talk about life at home.', '我们谈论在家的生活。'),
    ],
    'often': [
        ('I often get up early.', '我经常早起。'),
        ('She often sweeps the floor.', '她经常扫地。'),
        ('We often talk after school.', '我们经常放学后聊天。'),
    ],
    'pick up': [
        ('Pick up your ball, please.', '请捡起你的球。'),
        ('I pick up toys in my room.', '我在房间里收拾玩具。'),
        ('Pick up the books from the floor.', '把书从地板上捡起来。'),
    ],
    'sometimes': [
        ('I sometimes wash the floor.', '我有时洗地板。'),
        ('She sometimes talks with her cousin.', '她有时和表（堂）兄弟姐妹说话。'),
        ('Sometimes we play in the garden.', '有时我们在花园里玩。'),
    ],
    'sweep': [
        ('I sweep the floor every day.', '我每天扫地。'),
        ('Sweep the floor, please.', '请扫地。'),
        ('She can sweep the floor after dinner.', '她晚饭后打扫房子。'),
    ],
    'talk': [
        ('We talk about daily life.', '我们谈论日常生活。'),
        ('Talk quietly, please.', '请小声说话。'),
        ('I talk with my classmate.', '我和我的同班同学说话。'),
    ],
    'toilet': [
        ('Where is the toilet?', '卫生间在哪里？'),
        ('Wash your hands in the toilet.', '在卫生间里洗手。'),
        ('The toilet is clean.', '卫生间很干净。'),
    ],
    'wash': [
        ('Wash your hands, please.', '请洗手。'),
        ('I wash the floor on Sunday.', '我星期天洗地板。'),
        ('She can wash her face every morning.', '她每天早上洗脸。'),
    ],
    'when': [
        ('When do you get up?', '你什么时候起床？'),
        ('When do you go to school?', '你什么时候上学？'),
        ('When is your birthday?', '你的生日是什么时候？'),
    ],
    # U3 hobbies
    'a lot': [
        ('I like music a lot.', '我非常喜欢音乐。'),
        ('She collects a lot of stamps.', '她收集很多邮票。'),
        ('Thanks a lot!', '非常感谢！'),
    ],
    'also': [
        ('I also like basketball.', '我也喜欢篮球。'),
        ('She also listens to music.', '她也听音乐。'),
        ('He also learns kung fu.', '他也学功夫。'),
    ],
    'basketball': [
        ('I like basketball.', '我喜欢篮球。'),
        ('We play basketball in the gym.', '我们在体育馆里打篮球。'),
        ('Basketball is interesting.', '篮球很有意思。'),
    ],
    'China': [
        ('I am from China.', '我来自中国。'),
        ('China is a big country.', '中国是一个大国。'),
        ('Peking opera is from China.', '京剧来自中国。'),
    ],
    'collect': [
        ('I collect a stamp.', '我收集邮票。'),
        ('She can collect many thing at school.', '她收集很多东西。'),
        ('Do you collect stamps?', '你收集邮票吗？'),
    ],
    'from': [
        ('I am from China.', '我来自中国。'),
        ('This song is from my classmate.', '这首歌来自我的同班同学。'),
        ('Peking opera is from China.', '京剧来自中国。'),
    ],
    "he's=he is": [
        ("He's my classmate.", '他是我的同班同学。'),
        ("He's from China.", '他来自中国。'),
        ("He's ten years old.", '他十岁了。'),
    ],
    'hobby': [
        ('My hobby is music.', '我的爱好是音乐。'),
        ('What is your hobby?', '你的爱好是什么？'),
        ('Collecting stamps is her hobby.', '收集邮票是她的爱好。'),
    ],
    'interesting': [
        ('IT is interesting.', '信息技术很有意思。'),
        ('This book is interesting.', '这本书很有意思。'),
        ('Peking opera is interesting.', '京剧很有意思。'),
    ],
    'kung fu': [
        ('He learns kung fu.', '他学功夫。'),
        ('Kung fu is from China.', '功夫来自中国。'),
        ('Kung fu is wonderful.', '功夫棒极了。'),
    ],
    'lake': [
        ('There is a lake near the city.', '城市附近有一个湖。'),
        ('The lake is beautiful.', '这个湖很美丽。'),
        ('We see a lake on the map.', '我们在地图上看到一座湖。'),
    ],
    'learn': [
        ('I learn English at school.', '我在学校学英语。'),
        ('We learn kung fu in class.', '她学功夫。'),
        ('We learn IT in class.', '我们在课上学信息技术。'),
    ],
    'listen': [
        ('Listen to the music, please.', '请听音乐。'),
        ('I listen to songs every day.', '我每天听歌曲。'),
        ('Listen! She is singing.', '听！她在唱歌。'),
    ],
    'music': [
        ('I like music.', '我喜欢音乐。'),
        ('We listen to music in class.', '我们在课上听音乐。'),
        ('Music is my hobby.', '音乐是我的爱好。'),
    ],
    'Peking opera': [
        ('Peking opera is from China.', '京剧来自中国。'),
        ('I learn about Peking opera.', '我了解京剧。'),
        ('Peking opera is wonderful.', '京剧棒极了。'),
    ],
    'ping-pong': [
        ('I like ping-pong.', '我喜欢乒乓球。'),
        ('We play ping-pong in the gym.', '我们在体育馆里打乒乓球。'),
        ('Ping-pong is interesting.', '乒乓球很有意思。'),
    ],
    'song': [
        ('I sing a song.', '我唱一首歌。'),
        ('This song is wonderful.', '这首歌棒极了。'),
        ('Listen to this song.', '听这首歌。'),
    ],
    'stamp': [
        ('I collect a stamp.', '我收集一枚邮票。'),
        ('This stamp is from China.', '这张邮票来自中国。'),
        ('She has a stamp in her book.', '她有很多邮票。'),
    ],
    'tail': [
        ('The dog has a long tail.', '狗有一条长尾巴。'),
        ('Look at its tail.', '看它的尾巴。'),
        ('The cat wags its tail.', '猫摇尾巴。'),
    ],
    'their': [
        ('This is their hobby.', '这是他们的爱好。'),
        ('Their stamps are wonderful.', '他们的邮票棒极了。'),
        ('They listen to their music.', '他们听他们的音乐。'),
    ],
    "they're=they are": [
        ("They're from China.", '他们来自中国。'),
        ("They're my classmates.", '他们是我的同班同学。'),
        ("They're collecting stamps.", '他们在收集邮票。'),
    ],
    'thing': [
        ('I collect one thing I like.', '我收集很多东西。'),
        ('What is this thing?', '这是什么东西？'),
        ('Music is a wonderful thing.', '音乐是很棒的东西。'),
    ],
    'tree': [
        ('There is a tree in the garden.', '花园里有一棵树。'),
        ('The tree is tall.', '这棵树很高。'),
        ('Birds sing in the tree.', '鸟在树上唱歌。'),
    ],
    'wonderful': [
        ('The song is wonderful.', '这首歌棒极了。'),
        ('What a wonderful hobby!', '多棒的爱好啊！'),
        ('School life is wonderful.', '学校生活棒极了。'),
    ],
    # U4 festivals
    'any': [
        ('Do you have any stamps?', '你有邮票吗？'),
        ('Is there any mooncake left?', '还有月饼吗？'),
        ('You can try any dumpling.', '你可以尝任何饺子。'),
    ],
    'before': [
        ('Wash your hands before dinner.', '晚饭前洗手。'),
        ('Before the festival, we put up lanterns.', '节日前，我们挂灯笼。'),
        ('Say hello before you go.', '走之前打个招呼。'),
    ],
    'best': [
        ('Spring Festival is the best festival.', '春节是最好的节日。'),
        ('I wish you the best luck.', '我祝你最好的运气。'),
        ('This is my best mooncake.', '这是我最好的月饼。'),
    ],
    'boat': [
        ('We race in a boat.', '我们坐船比赛。'),
        ('The boat is on the lake.', '小船在湖上。'),
        ('Dragon Boat Festival has boat races.', '端午节有赛龙舟。'),
    ],
    'buy': [
        ('We buy dumplings before the festival.', '节日前我们买饺子。'),
        ('I want to buy a lantern.', '我想买一个灯笼。'),
        ('Buy some mooncakes, please.', '请买一些月饼。'),
    ],
    'Christmas': [
        ('Merry Christmas!', '圣诞快乐！'),
        ('We say Merry Christmas in December.', '我们在十二月说圣诞快乐。'),
        ('Christmas is a festival.', '圣诞节是一个节日。'),
    ],
    'dragon': [
        ('The dragon is on the boat.', '龙在船上。'),
        ('We see a dragon at the fair.', '我们在庙会上看到一条龙。'),
        ('The dragon dance is wonderful.', '舞龙棒极了。'),
    ],
    'Dragon Boat Festival': [
        ('Dragon Boat Festival is in summer.', '端午节在夏天。'),
        ('We have boat races at Dragon Boat Festival.', '端午节我们有赛龙舟。'),
        ('I like Dragon Boat Festival.', '我喜欢端午节。'),
    ],
    'dumpling': [
        ('We eat a dumpling at Spring Festival.', '春节我们吃饺子。'),
        ('The dumpling is yummy.', '饺子很好吃。'),
        ('Buy a dumpling, please.', '请买一些饺子。'),
    ],
    'else': [
        ('What else do you want?', '你还想要别的什么？'),
        ('Anything else?', '还要别的吗？'),
        ('Who else is coming?', '还有谁要来？'),
    ],
    'fair': [
        ('We go to the fair at the festival.', '节日期间我们去庙会。'),
        ('The fair is fun.', '庙会很好玩。'),
        ('There are lanterns at the fair.', '庙会上有灯笼。'),
    ],
    'festival': [
        ('Spring Festival is my favorite festival.', '春节是我最喜欢的节日。'),
        ('We have a festival in China.', '在中国我们有很多节日。'),
        ('What festival do you like?', '你喜欢什么节日？'),
    ],
    'gala': [
        ('We watch the Spring Festival gala on TV.', '我们在电视上看春节联欢晚会。'),
        ('The gala is wonderful.', '晚会棒极了。'),
        ('Join the school gala.', '参加学校庆典。'),
    ],
    'hope': [
        ('I hope you have good luck.', '我希望你好运。'),
        ('We hope for a happy festival.', '我们盼望一个快乐的节日。'),
        ('I hope to join the race.', '我希望参加比赛。'),
    ],
    'join': [
        ('Join us at the fair.', '来庙会和我们一起吧。'),
        ('I want to join the race.', '我想参加比赛。'),
        ('Join the Spring Festival gala.', '参加春节联欢晚会。'),
    ],
    'lantern': [
        ('Put up a red lantern.', '挂一个红灯笼。'),
        ('The lantern is beautiful.', '灯笼很漂亮。'),
        ('We see lanterns at Lantern Festival.', '元宵节我们看到灯笼。'),
    ],
    'Lantern Festival': [
        ('Lantern Festival is after Spring Festival.', '元宵节在春节之后。'),
        ('We eat yuanxiao at Lantern Festival.', '元宵节我们吃元宵。'),
        ('I like Lantern Festival.', '我喜欢元宵节。'),
    ],
    'luck': [
        ('Good luck!', '祝你好运！'),
        ('I hope you have good luck.', '我希望你好运。'),
        ('Red means luck at Spring Festival.', '春节时红色代表好运。'),
    ],
    'lucky': [
        ('You are lucky!', '你很幸运！'),
        ('The lucky money is in the red bag.', '压岁钱在红包里。'),
        ('I feel lucky today.', '我今天觉得很幸运。'),
    ],
    'map': [
        ('Look at the map of China.', '看中国地图。'),
        ('There is a lake on the map.', '地图上有一座湖。'),
        ('Show me the map, please.', '请给我看看地图。'),
    ],
    'merry': [
        ('Merry Christmas!', '圣诞快乐！'),
        ('We say Merry Christmas to them.', '我们对他们说圣诞快乐。'),
        ('Have a merry festival!', '祝你节日快乐！'),
    ],
    'Mid-Autumn Festival': [
        ('Mid-Autumn Festival is in autumn.', '中秋节在秋天。'),
        ('We eat mooncakes at Mid-Autumn Festival.', '中秋节我们吃月饼。'),
        ('The moon is bright at Mid-Autumn Festival.', '中秋节的月亮很明亮。'),
    ],
    'money': [
        ('I get lucky money at Spring Festival.', '春节我收到压岁钱。'),
        ('Save your money.', '存好你的钱。'),
        ('How much money do you have?', '你有多少钱？'),
    ],
    'moon': [
        ('Look at the moon tonight.', '看今晚的月亮。'),
        ('The moon is bright.', '月亮很明亮。'),
        ('We watch the moon at Mid-Autumn Festival.', '中秋节我们赏月。'),
    ],
    'mooncake': [
        ('I eat a mooncake.', '我吃一个月饼。'),
        ('The mooncake is sweet.', '月饼是甜的。'),
        ('Buy a mooncake for Mid-Autumn Festival.', '为中秋节买月饼。'),
    ],
    'put up': [
        ('Put up the lanterns, please.', '请挂灯笼。'),
        ('We put up red paper before Spring Festival.', '春节前我们贴红纸。'),
        ('Put up the map on the wall.', '把地图贴在墙上。'),
    ],
    'quiet': [
        ('Be quiet in the library.', '在图书馆里请安静。'),
        ('The classroom is quiet now.', '教室现在很安静。'),
        ('Please keep quiet.', '请保持安静。'),
    ],
    'race': [
        ('We have a boat race.', '我们有赛龙舟。'),
        ('Join the race, please.', '请参加比赛。'),
        ('The race is exciting.', '比赛很激动人心。'),
    ],
    'riddle': [
        ('Guess the riddle!', '猜谜语！'),
        ('I like a riddle at Lantern Festival.', '元宵节我喜欢谜语。'),
        ('This riddle is fun.', '这个谜语很好玩。'),
    ],
    'say': [
        ('Say Merry Christmas!', '说圣诞快乐！'),
        ('What did you say?', '你说什么？'),
        ('Say thank you to them.', '对他们说谢谢。'),
    ],
    'sleep': [
        ('I sleep at nine.', '我九点睡觉。'),
        ('Go to sleep early.', '早点睡觉。'),
        ('The baby can sleep now.', '宝宝在睡觉。'),
    ],
    'Spring Festival': [
        ('Spring Festival is the best festival.', '春节是最好的节日。'),
        ('We eat dumplings at Spring Festival.', '春节我们吃饺子。'),
        ('Happy Spring Festival!', '春节快乐！'),
    ],
    'them': [
        ('Give them lucky money.', '给他们压岁钱。'),
        ('I say hello to them.', '我向他们问好。'),
        ('Join them at the fair.', '去庙会和他们会合。'),
    ],
    'try': [
        ('Try a mooncake, please.', '请尝一个月饼。'),
        ('I want to try ping-pong.', '我想试试乒乓球。'),
        ('Try your best!', '尽你最大的努力！'),
    ],
    'yours': [
        ('Is this desk yours?', '这张书桌是你的吗？'),
        ('Happy Spring Festival! Yours, Li Ming.', '春节快乐！你的，李明。'),
        ('Which ball is yours?', '哪个球是你的？'),
    ],
}
