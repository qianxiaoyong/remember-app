"""Textbook-aligned example sentences for PEP Grade 5 English, Volume 2 (下册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 人教版五年级下册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1 · Hobbies and daily schedule
    "eat breakfast": [
        ("I usually eat breakfast at seven o'clock.", "我通常七点钟吃早饭。"),
        ("Don't skip breakfast before school.", "上学前别不吃早饭。"),
        ("We eat breakfast together on weekends.", "周末我们一起吃早饭。"),
    ],
    "have … class": [
        ("I have an English class on Monday.", "我星期一有英语课。"),
        ("She has a dancing class after school.", "她放学后有舞蹈课。"),
        ("When do you have art class?", "你什么时候上美术课？"),
    ],
    "play sports": [
        ("We play sports after school every day.", "我们每天放学后做体育运动。"),
        ("Do you like to play sports?", "你喜欢做体育运动吗？"),
        ("Playing sports keeps us healthy.", "做体育运动让我们保持健康。"),
    ],
    "exercise": [
        ("Morning exercise is good for you.", "早操对你有好处。"),
        ("We do exercise in the playground.", "我们在操场上做运动。"),
        ("Take more exercise and you will feel better.", "多运动你会感觉更好。"),
    ],
    "do morning exercises": [
        ("We do morning exercises at school.", "我们在学校做早操。"),
        ("Let's do morning exercises together.", "我们一起做早操吧。"),
        ("I do morning exercises before breakfast.", "我早饭前做早操。"),
    ],
    "eat dinner": [
        ("We eat dinner at six in the evening.", "我们晚上六点钟吃晚饭。"),
        ("I help my mum before we eat dinner.", "吃晚饭前我帮妈妈干活。"),
        ("Don't eat dinner too late.", "别太晚吃晚饭。"),
    ],
    "clean my room": [
        ("I clean my room on Saturday.", "我星期六打扫我的房间。"),
        ("Please clean your room before you go out.", "出门前请打扫你的房间。"),
        ("She cleans her room every week.", "她每周打扫房间。"),
    ],
    "go for a walk": [
        ("Let's go for a walk after dinner.", "晚饭后我们去散步吧。"),
        ("My grandpa goes for a walk every morning.", "我爷爷每天早上散步。"),
        ("We went for a walk in the park.", "我们在公园里散了步。"),
    ],
    "go shopping": [
        ("I go shopping with my mum on Sunday.", "我星期天和妈妈一起去购物。"),
        ("Let's go shopping after school.", "放学后我们去购物吧。"),
        ("She likes to go shopping on weekends.", "她喜欢周末去购物。"),
    ],
    "take a dancing class": [
        ("I take a dancing class on Wednesdays.", "我星期三上舞蹈课。"),
        ("She takes a dancing class after school.", "她放学后上舞蹈课。"),
        ("Do you take a dancing class too?", "你也上舞蹈课吗？"),
    ],
    "a.m.": [
        ("School starts at eight a.m.", "学校上午八点钟开始上课。"),
        ("I get up at six thirty a.m.", "我上午六点半起床。"),
        ("The shop opens at nine a.m.", "商店上午九点钟开门。"),
    ],
    "p.m.": [
        ("We eat dinner at six p.m.", "我们下午六点钟吃晚饭。"),
        ("The class ends at four p.m.", "课程下午四点钟结束。"),
        ("I do my homework at seven p.m.", "我下午七点钟做作业。"),
    ],
    "shop": [
        ("I shop with my mum on Saturday.", "我星期六和妈妈一起购物。"),
        ("Let's shop for a new coat.", "我们去买一件新大衣吧。"),
        ("We shop at the mall on Friday.", "我们星期五去商场购物。"),
    ],
    "go swimming": [
        ("We go swimming in summer.", "我们夏天去游泳。"),
        ("Let's go swimming this afternoon.", "今天下午我们去游泳吧。"),
        ("He goes swimming every weekend.", "他每个周末去游泳。"),
    ],
    "take": [
        ("I take a dancing class on Mondays.", "我星期一上舞蹈课。"),
        ("She will take an English class after school.", "她放学后会上一节英语课。"),
        ("Do you take any art classes?", "你上美术课吗？"),
    ],
    "dancing": [
        ("My hobby is dancing.", "我的爱好是跳舞。"),
        ("She is good at dancing.", "她擅长跳舞。"),
        ("We have a dancing show on Friday.", "我们星期五有舞蹈表演。"),
    ],
    "when": [
        ("When do you usually get up?", "你通常什么时候起床？"),
        ("When does your class start?", "你们几点开始上课？"),
        ("When is your dancing class?", "你的舞蹈课是什么时候？"),
    ],
    "after": [
        ("I do my homework after dinner.", "我晚饭后做作业。"),
        ("We play sports after school.", "我们放学后做运动。"),
        ("Let's meet after the class.", "下课后我们见面吧。"),
    ],
    "start": [
        ("We start school at eight o'clock.", "我们八点开始上课。"),
        ("When does the dancing class start?", "舞蹈课几点开始？"),
        ("Let's start our work now.", "我们现在开始干活吧。"),
    ],
    "usually": [
        ("I usually get up at seven.", "我通常七点钟起床。"),
        ("She usually takes a dancing class on Saturday.", "她通常星期六上舞蹈课。"),
        ("We usually have lunch at school.", "我们通常在学校吃午饭。"),
    ],
    "spain": [
        ("My pen pal lives in Spain.", "我的笔友住在西班牙。"),
        ("Spain is famous for football.", "西班牙以足球闻名。"),
        ("She wants to visit Spain one day.", "她想有一天去西班牙看看。"),
    ],
    "late": [
        ("Don't be late for school.", "上学别迟到。"),
        ("Sorry, I'm late for the class.", "对不起，我上课迟到了。"),
        ("He often goes to bed late.", "他经常很晚才睡觉。"),
    ],
    "why": [
        ("Why are you so busy today?", "你今天为什么这么忙？"),
        ("Why do you like dancing?", "你为什么喜欢跳舞？"),
        ("Why is he late again?", "他怎么又迟到了？"),
    ],
    "work": [
        ("I work hard at school.", "我在学校很努力。"),
        ("She has a lot of work to do.", "她有很多工作要做。"),
        ("Let's work together on this project.", "我们一起做这个项目吧。"),
    ],
    "last": [
        ("I was busy last weekend.", "我上周末很忙。"),
        ("We had a dancing show last Friday.", "我们上星期五有舞蹈表演。"),
        ("Last night I went to bed late.", "昨晚我睡得很晚。"),
    ],
    "sound": [
        ("That sound is very loud.", "那个声音很响。"),
        ("I hear a strange sound.", "我听到一个奇怪的声音。"),
        ("The sound of rain is nice.", "雨声很好听。"),
    ],
    "also": [
        ("I like dancing, and I also like singing.", "我喜欢跳舞，也喜欢唱歌。"),
        ("She can play the piano and also dance well.", "她会弹钢琴，舞也跳得好。"),
        ("We also need to finish our homework.", "我们还需要完成作业。"),
    ],
    "busy": [
        ("I'm very busy on weekdays.", "工作日我很忙。"),
        ("My mum is busy at work today.", "我妈妈今天工作很忙。"),
        ("Don't call me when I'm busy.", "我忙的时候别给我打电话。"),
    ],
    "need": [
        ("I need to take a dancing class.", "我需要上舞蹈课。"),
        ("We need more time for our work.", "我们需要更多时间做功课。"),
        ("Do you need any help?", "你需要帮忙吗？"),
    ],
    "play": [
        ("We will put on a play next month.", "我们下个月要演一出戏。"),
        ("She wrote a short play for our class.", "她为班级写了一个短剧本。"),
        ("The play is about a boy on an island.", "这出戏讲的是一个岛上的男孩。"),
    ],
    "letter": [
        ("I write a letter to my pen pal in Spain.", "我给西班牙的笔友写信。"),
        ("Please read this letter carefully.", "请仔细读这封信。"),
        ("She got a letter from her friend yesterday.", "她昨天收到朋友的一封信。"),
    ],
    "live": [
        ("I live in Beijing with my family.", "我和家人住在北京。"),
        ("Where do you live?", "你住在哪里？"),
        ("They live on a small island.", "他们住在一个小岛上。"),
    ],
    "island": [
        ("Robinson lived on an island.", "鲁滨逊住在一个岛上。"),
        ("The island is far from the city.", "这个岛离城市很远。"),
        ("We took a boat to the island.", "我们乘船去了那个岛。"),
    ],
    "always": [
        ("She always works hard at school.", "她在学校总是很努力。"),
        ("I always take my dancing shoes with me.", "我总是带着舞鞋。"),
        ("He is always late for class.", "他上课总是迟到。"),
    ],
    "cave": [
        ("The boy found a cave on the island.", "男孩在岛上发现了一个洞穴。"),
        ("They stayed in the cave for one night.", "他们在洞穴里待了一晚。"),
        ("The cave is dark and quiet.", "这个洞穴又黑又静。"),
    ],
    "win": [
        ("She wants to win the dancing contest.", "她想赢得舞蹈比赛。"),
        ("Work hard and you can win.", "努力就能赢。"),
        ("I hope we win the game.", "我希望我们赢得比赛。"),
    ],
    # Unit 2 · Seasons
    "spring": [
        ("Spring is warm and green.", "春天温暖又充满绿色。"),
        ("Flowers bloom in spring.", "春天花儿开放。"),
        ("I like spring best.", "我最喜欢春天。"),
    ],
    "summer": [
        ("Summer is hot and sunny.", "夏天又热又晴朗。"),
        ("We go swimming in summer.", "我们夏天去游泳。"),
        ("School ends in summer.", "夏天学校放假。"),
    ],
    "autumn": [
        ("Autumn is cool and beautiful.", "秋天凉爽又美丽。"),
        ("Leaves turn yellow in autumn.", "秋天叶子变黄。"),
        ("We pick apples in autumn.", "我们秋天摘苹果。"),
    ],
    "winter": [
        ("Winter is cold and snowy.", "冬天又冷又多雪。"),
        ("We make a snowman in winter.", "我们冬天堆雪人。"),
        ("I wear a warm coat in winter.", "冬天我穿暖和的大衣。"),
    ],
    "season": [
        ("Spring is a season I like.", "春天是我喜欢的季节。"),
        ("Which season do you like?", "你喜欢哪个季节？"),
        ("Every season is beautiful.", "每个季节都很美。"),
    ],
    "picnic": [
        ("We have a picnic in the park.", "我们在公园里野餐。"),
        ("Bring food for our picnic.", "带上野餐要吃的食物。"),
        ("The picnic was fun.", "这次野餐很有趣。"),
    ],
    "go on a picnic": [
        ("Let's go on a picnic this Sunday.", "这个星期天我们去野餐吧。"),
        ("We went on a picnic in spring.", "我们春天去野餐了。"),
        ("They go on a picnic with their family.", "他们和家人一起去野餐。"),
    ],
    "pick": [
        ("We pick apples in autumn.", "我们秋天摘苹果。"),
        ("Pick the red apples, please.", "请摘那些红苹果。"),
        ("Don't pick flowers in the park.", "别在公园里摘花。"),
    ],
    "pick apples": [
        ("We pick apples on the farm.", "我们在农场摘苹果。"),
        ("Let's pick apples this weekend.", "这个周末我们去摘苹果吧。"),
        ("Picking apples is hard work.", "摘苹果是费力的活。"),
    ],
    "snowman": [
        ("We made a big snowman.", "我们堆了一个大雪人。"),
        ("The snowman has a carrot nose.", "雪人有一个胡萝卜鼻子。"),
        ("Look at our funny snowman!", "看我们有趣的雪人！"),
    ],
    "make a snowman": [
        ("Let's make a snowman in the snow.", "我们在雪地里堆雪人吧。"),
        ("The children make a snowman after school.", "孩子们放学后堆雪人。"),
        ("We can make a snowman when it snows.", "下雪时我们可以堆雪人。"),
    ],
    "which": [
        ("Which season do you like best?", "你最喜欢哪个季节？"),
        ("Which coat is yours?", "哪件大衣是你的？"),
        ("Which month is your birthday in?", "你的生日在哪个月？"),
    ],
    "good job": [
        ("Good job! You finished on time.", "做得好！你按时完成了。"),
        ("The teacher said, \"Good job!\"", "老师说：「做得好！」"),
        ("Good job on your painting.", "你的画画得真好。"),
    ],
    "best": [
        ("Autumn is my favourite season. I like it best.", "秋天是我最喜欢的季节，我最喜欢它。"),
        ("Which season do you like best?", "你最喜欢哪个季节？"),
        ("She is the best at painting in our class.", "她是我们班画画最好的。"),
    ],
    "snow": [
        ("I like snow in winter.", "我喜欢冬天的雪。"),
        ("The snow is white and soft.", "雪又白又软。"),
        ("We can make a snowman after the snow.", "下雪后我们可以堆雪人。"),
    ],
    "because": [
        ("I like winter because I can play in the snow.", "我喜欢冬天，因为我可以在雪里玩。"),
        ("She stays at home because it is snowing.", "她待在家里，因为正在下雪。"),
        ("We paint trees because autumn is beautiful.", "我们画树，因为秋天很美。"),
    ],
    "vacation": [
        ("We have a winter vacation in January.", "我们一月份放寒假。"),
        ("Where did you go on your vacation?", "假期你去哪里了？"),
        ("I read books during my vacation.", "假期里我看书。"),
    ],
    "all": [
        ("I like all the seasons.", "我喜欢所有的季节。"),
        ("All the leaves turn yellow in autumn.", "秋天所有的叶子都变黄了。"),
        ("We all went to see the snow.", "我们都去看雪了。"),
    ],
    "pink": [
        ("The flowers are pink in spring.", "春天花儿是粉红色的。"),
        ("She has a pink coat.", "她有一件粉红色的大衣。"),
        ("I paint the tree with pink and green.", "我用粉色和绿色画这棵树。"),
    ],
    "lovely": [
        ("What lovely pink flowers!", "多么可爱的粉红花朵啊！"),
        ("We had a lovely time in the snow.", "我们在雪地里玩得很开心。"),
        ("The leaves look lovely in autumn.", "秋天的叶子看起来很美丽。"),
    ],
    "leaf": [
        ("A yellow leaf fell from the tree.", "一片黄叶从树上落下来。"),
        ("Look at this red leaf.", "看这片红叶。"),
        ("There is a leaf on my book.", "我的书上有一片叶子。"),
    ],
    "fall": [
        ("Leaves fall from the trees in autumn.", "秋天叶子从树上落下。"),
        ("Don't fall on the snow.", "别在雪地上摔倒。"),
        ("Fall is another word for autumn in America.", "在美国 fall 也表示秋天。"),
    ],
    "paint": [
        ("We paint the four seasons in art class.", "我们在美术课上画四季。"),
        ("She likes to paint trees and snow.", "她喜欢画树和雪。"),
        ("Let's paint a picture of autumn.", "我们画一幅秋天的画吧。"),
    ],
    # Unit 3 · Months and holidays
    "january": [
        ("Winter vacation is usually in January.", "寒假通常在一月份。"),
        ("January is the first month of the year.", "一月是一年的第一个月。"),
        ("It is cold in January.", "一月份很冷。"),
    ],
    "february": [
        ("February comes after January.", "二月在一月之后。"),
        ("We go back to school in February.", "我们二月份开学。"),
        ("February is a short month.", "二月是个短月份。"),
    ],
    "march": [
        ("Spring starts in March.", "春天从三月开始。"),
        ("We plant trees in March.", "我们三月植树。"),
        ("March is my birthday month.", "三月是我的生日月。"),
    ],
    "april": [
        ("It often rains in April.", "四月经常下雨。"),
        ("We have a school trip in April.", "我们四月有学校旅行。"),
        ("April comes before May.", "四月在五月之前。"),
    ],
    "may": [
        ("May Day is on the first of May.", "劳动节在五月一日。"),
        ("The weather is warm in May.", "五月天气暖和。"),
        ("We have a singing contest in May.", "我们五月有歌咏比赛。"),
    ],
    "june": [
        ("Children's Day is in June.", "儿童节在六月。"),
        ("School ends in June.", "我们六月放假。"),
        ("June is hot and sunny.", "六月又热又晴朗。"),
    ],
    "july": [
        ("Summer vacation starts in July.", "暑假从七月开始。"),
        ("It is very hot in July.", "七月非常热。"),
        ("We visit my grandparents in July.", "我们七月去看望祖父母。"),
    ],
    "august": [
        ("We travel in August.", "我们八月去旅行。"),
        ("August is the last month of summer vacation.", "八月是暑假的最后一个月。"),
        ("My birthday is in August.", "我的生日在八月。"),
    ],
    "september": [
        ("School starts again in September.", "我们九月重新开学。"),
        ("September is the first month of autumn.", "九月是秋天的第一个月。"),
        ("Teachers' Day is in September.", "教师节在九月。"),
    ],
    "october": [
        ("National Day is in October.", "国庆节在十月。"),
        ("The weather is cool in October.", "十月天气凉爽。"),
        ("We have a sports meet in October.", "我们十月开运动会。"),
    ],
    "november": [
        ("Thanksgiving is in November in America.", "在美国感恩节在十一月。"),
        ("It gets cold in November.", "十一月天气变冷。"),
        ("We have a few things to do in November.", "十一月我们有几件事要做。"),
    ],
    "december": [
        ("Christmas is in December.", "圣诞节在十二月。"),
        ("December is the last month of the year.", "十二月是一年的最后一个月。"),
        ("It is cold in December.", "十二月很冷。"),
    ],
    "few": [
        ("There are a few things on my desk.", "我桌上有几样东西。"),
        ("Only a few students stay after school.", "只有少数同学放学后留下来。"),
        ("I have a few questions about the trip.", "关于这次旅行我有几个问题。"),
    ],
    "a few": [
        ("I have a few good friends at school.", "我在学校有几个好朋友。"),
        ("We need a few more minutes.", "我们还需要几分钟。"),
        ("There are a few apples on the table.", "桌上有几个苹果。"),
    ],
    "thing": [
        ("Pack the thing you need for the trip.", "把旅行需要的东西装好。"),
        ("What thing do you like best about Christmas?", "圣诞节你最喜欢什么？"),
        ("There is one more thing I want to say.", "还有一件事我想说。"),
    ],
    "meet": [
        ("We will meet at the school gate.", "我们在校门口集合。"),
        ("Let's meet after the contest.", "比赛结束后我们碰面吧。"),
        ("Parents meet the teachers in September.", "九月份家长和老师开会。"),
    ],
    "sports meet": [
        ("We have a sports meet in October.", "我们十月开运动会。"),
        ("Are you ready for the sports meet?", "你准备好参加运动会了吗？"),
        ("Our class won first place at the sports meet.", "我们班在运动会上得了第一名。"),
    ],
    "trip": [
        ("We have a school trip in April.", "我们四月有学校旅行。"),
        ("Our trip to the zoo was fun.", "我们去动物园的旅行很有趣。"),
        ("Don't forget your things for the trip.", "别忘了带旅行用的东西。"),
    ],
    "year": [
        ("There are twelve months in a year.", "一年有十二个月。"),
        ("Happy new year!", "新年快乐！"),
        ("This year we have a singing contest in May.", "今年我们五月有歌咏比赛。"),
    ],
    "plant": [
        ("We plant trees on Tree Planting Day.", "我们在植树节种树。"),
        ("Let's plant flowers in March.", "我们三月种花吧。"),
        ("The students plant ten trees last year.", "学生们去年种了十棵树。"),
    ],
    "contest": [
        ("We have an English contest in May.", "我们五月有英语比赛。"),
        ("She won the singing contest.", "她赢得了歌咏比赛。"),
        ("Are you ready for the contest?", "你准备好参加比赛了吗？"),
    ],
    "labour": [
        ("May Day is also called Labour Day.", "劳动节也叫 Labour Day。"),
        ("People rest on Labour Day.", "劳动节人们休息。"),
        ("We learn about Labour Day in class.", "我们在课上了解劳动节。"),
    ],
    "labour day": [
        ("Labour Day is on May first.", "劳动节在五月一日。"),
        ("We don't go to school on Labour Day.", "劳动节我们不上学。"),
        ("My family goes on a trip on Labour Day.", "劳动节我们全家去旅行。"),
    ],
    "the great wall": [
        ("We visited the Great Wall last year.", "我们去年参观了长城。"),
        ("The Great Wall is very long.", "长城非常长。"),
        ("Many tourists visit the Great Wall.", "许多游客参观长城。"),
    ],
    "national": [
        ("National Day is a special holiday.", "国庆节是一个特别的节日。"),
        ("We watch the national flag on National Day.", "国庆节我们观看国旗。"),
        ("It is a national holiday in October.", "这是十月的全国性假日。"),
    ],
    "national day": [
        ("National Day is on October first.", "国庆节在十月一日。"),
        ("We watch fireworks on National Day.", "国庆节我们看烟花。"),
        ("Happy National Day!", "国庆节快乐！"),
    ],
    "american": [
        ("Thanksgiving is an American holiday.", "感恩节是美国的节日。"),
        ("My friend has an American pen pal.", "我的朋友有一位美国笔友。"),
        ("We learn about American festivals in class.", "我们在课上了解美国节日。"),
    ],
    "thanksgiving": [
        ("Thanksgiving is in November in America.", "在美国感恩节在十一月。"),
        ("Families get together on Thanksgiving.", "感恩节家人团聚。"),
        ("We talk about Thanksgiving in our English class.", "我们在英语课上讲感恩节。"),
    ],
    "christmas": [
        ("Christmas is on the twenty-fifth of December.", "圣诞节在十二月二十五日。"),
        ("We sing songs at Christmas.", "圣诞节我们唱歌。"),
        ("Children love Christmas.", "孩子们喜爱圣诞节。"),
    ],
    "game": [
        ("Let's play a word game.", "我们来玩一个单词游戏吧。"),
        ("We played a riddle game in class.", "我们在课上玩了猜谜游戏。"),
        ("The game was fun.", "这个游戏很有趣。"),
    ],
    "riddle": [
        ("Can you answer this riddle?", "你能猜出这个谜语吗？"),
        ("We ask a riddle at the party.", "我们在聚会上猜谜语。"),
        ("This riddle is about an animal.", "这个谜语是关于一种动物的。"),
    ],
    "act": [
        ("The children act out a story.", "孩子们表演一个故事。"),
        ("We act in a play for Christmas.", "我们为圣诞节排演一出戏。"),
        ("She likes to act on stage.", "她喜欢在舞台上表演。"),
    ],
    "act out": [
        ("Let's act out the story in groups.", "我们分组把故事表演出来吧。"),
        ("The students act out a play in class.", "学生们在课上表演一出短剧。"),
        ("Can you act out this dialogue?", "你能把这段对话表演出来吗？"),
    ],
    "rsvp": [
        ("Please RSVP by Friday.", "请在星期五之前回复是否参加。"),
        ("The invitation says RSVP.", "请柬上写着请赐复。"),
        ("Don't forget to RSVP to the party.", "别忘了回复是否参加聚会。"),
    ],
    "by": [
        ("We finish the work by Friday.", "我们星期五之前完成这项工作。"),
        ("The show is over by six o'clock.", "展览六点钟结束。"),
        ("I read the letter by myself.", "我自己读了这封信。"),
    ],
    # Unit 4 · Festivals and exhibitions
    "first (1st)": [
        ("January is the first month of the year.", "一月是一年的第一个月。"),
        ("She finished first in the race.", "她在比赛中得了第一名。"),
        ("The first of May is Labour Day.", "五月一日是劳动节。"),
    ],
    "second (2nd)": [
        ("February is the second month.", "二月是第二个月。"),
        ("Wait a second, please.", "请等一下。"),
        ("He came second in the contest.", "他在比赛中得了第二名。"),
    ],
    "third (3rd)": [
        ("March is the third month of the year.", "三月是一年的第三个月。"),
        ("Today is the third of April.", "今天是四月三日。"),
        ("She lives on the third floor.", "她住在三楼。"),
    ],
    "fourth (4th)": [
        ("April is the fourth month.", "四月是第四个月。"),
        ("The fourth student is Tom.", "第四个学生是汤姆。"),
        ("We have English on the fourth day.", "第四天我们有英语课。"),
    ],
    "fifth (5th)": [
        ("May is the fifth month of the year.", "五月是一年的第五个月。"),
        ("Her birthday is on the fifth of June.", "她的生日在六月五日。"),
        ("This is my fifth diary.", "这是我的第五本日记。"),
    ],
    "twelfth (12th)": [
        ("December is the twelfth month.", "十二月是第十二个月。"),
        ("Today is the twelfth of March.", "今天是三月十二日。"),
        ("She is in the twelfth grade.", "她上十二年级。"),
    ],
    "twentieth (20th)": [
        ("Today is the twentieth of January.", "今天是一月二十日。"),
        ("The twentieth student raised his hand.", "第二十个学生举了手。"),
        ("We have a test on the twentieth.", "我们二十号有测验。"),
    ],
    "twenty-first (21st)": [
        ("My birthday is on the twenty-first of August.", "我的生日在八月二十一日。"),
        ("The twenty-first page is about festivals.", "第二十一页讲的是节日。"),
        ("She came twenty-first in the race.", "她在比赛中得了第二十一名。"),
    ],
    "twenty-third (23rd)": [
        ("Today is the twenty-third of May.", "今天是五月二十三日。"),
        ("The twenty-third question is easy.", "第二十三题很简单。"),
        ("We leave on the twenty-third.", "我们二十三日出发。"),
    ],
    "thirtieth (30th)": [
        ("Today is the thirtieth of November.", "今天是十一月三十日。"),
        ("June has thirty days, and today is the thirtieth.", "六月有三十天，今天是三十日。"),
        ("The thirtieth student is very tall.", "第三十个学生很高。"),
    ],
    "other": [
        ("Some festivals are special; other festivals are fun too.", "有些节日很特别，其他节日也很有趣。"),
        ("I like this show and the other one.", "我喜欢这个展览，也喜欢另一个。"),
        ("Ask other students about the festival.", "向其他同学问问这个节日。"),
    ],
    "special": [
        ("Mid-Autumn Festival is a special day.", "中秋节是一个特别的日子。"),
        ("We have a special show at school.", "我们在学校有一个特别的展览。"),
        ("This is a special gift for you.", "这是给你的特别礼物。"),
    ],
    "show": [
        ("We visit an art show at the museum.", "我们参观博物馆里的美术展览。"),
        ("There is a photo show in our school.", "我们学校有一个摄影展。"),
        ("Show me your new book, please.", "请给我看看你的新书。"),
    ],
    "festival": [
        ("The Spring Festival is my favourite festival.", "春节是我最喜欢的节日。"),
        ("We learn about a different festival.", "我们了解不同的节日。"),
        ("Every festival has special food.", "每个节日都有特别的食物。"),
    ],
    "kitten": [
        ("The kitten has soft white fur.", "这只小猫有柔软的白毛。"),
        ("Look at the cute kitten in the show.", "看展览里那只可爱的小猫。"),
        ("The kitten makes a little noise.", "小猫发出一点声响。"),
    ],
    "diary": [
        ("I write in my diary every day.", "我每天都写日记。"),
        ("She wrote about the festival in her diary.", "她在日记里写了这个节日。"),
        ("Don't read my diary, please.", "请不要看我的日记。"),
    ],
    "still": [
        ("It is still open. We can go in.", "还开着门，我们可以进去。"),
        ("Please stand still for the photo.", "拍照时请站好别动。"),
        ("The kitten is still sleeping.", "小猫还在睡觉。"),
    ],
    "noise": [
        ("Don't make so much noise.", "别发出这么大的声响。"),
        ("I heard a noise outside.", "我听到外面有响声。"),
        ("The festival was full of music and noise.", "节日里满是音乐和喧闹声。"),
    ],
    "fur": [
        ("The kitten's fur is very soft.", "小猫的毛很软。"),
        ("Brown fur covers the dog.", "棕色的毛覆盖着那只狗。"),
        ("She touched the fur gently.", "她轻轻摸了摸那层毛。"),
    ],
    "open": [
        ("The museum is open from nine to five.", "博物馆九点到五点开放。"),
        ("Is the show still open today?", "展览今天还开放吗？"),
        ("The shop is open on Sunday.", "这家商店星期天营业。"),
    ],
    "walk": [
        ("We walk to the art show.", "我们步行去看美术展览。"),
        ("Let's take a walk after dinner.", "晚饭后我们去散步吧。"),
        ("The kitten can walk now.", "小猫现在会走了。"),
    ],
    # Unit 5 · Possessive pronouns and -ing forms
    "mine": [
        ("This book is mine.", "这本书是我的。"),
        ("The red bag is mine, not yours.", "红书包是我的，不是你的。"),
        ("Is this seat mine?", "这个座位是我的吗？"),
    ],
    "yours": [
        ("Is this pen yours?", "这支笔是你的吗？"),
        ("My bag is blue. Yours is pink.", "我的包是蓝色的，你的是粉红色的。"),
        ("This seat is yours.", "这个座位是你的。"),
    ],
    "his": [
        ("This is his book.", "这是他的书。"),
        ("His dog is sleeping.", "他的狗正在睡觉。"),
        ("The ball is his.", "球是他的。"),
    ],
    "hers": [
        ("The pink coat is hers.", "这件粉红色大衣是她的。"),
        ("This diary is hers.", "这本日记是她的。"),
        ("Is the kitten hers?", "这只小猫是她的吗？"),
    ],
    "theirs": [
        ("The big house is theirs.", "那所大房子是他们的。"),
        ("These seats are theirs.", "这些座位是他们的。"),
        ("The art show is theirs.", "这个美术展览是他们的。"),
    ],
    "ours": [
        ("This classroom is ours.", "这间教室是我们的。"),
        ("The contest prize is ours.", "比赛奖品是我们的。"),
        ("Ours is the team on the left.", "左边那支队伍是我们的。"),
    ],
    "climbing": [
        ("Look! The panda is climbing the tree.", "看！熊猫正在爬树。"),
        ("The cat is climbing up the wall.", "猫正在往墙上爬。"),
    ],
    "eating": [
        ("Look! The panda is eating bamboo.", "看！熊猫正在吃竹子。"),
        ("Don't talk while you are eating.", "吃饭的时候别说话。"),
        ("The cat is eating fish.", "猫正在吃鱼。"),
    ],
    "playing": [
        ("The children are playing in the park.", "孩子们正在公园里玩耍。"),
        ("He is playing football after school.", "他放学后在踢足球。"),
        ("Stop playing and do your homework.", "别玩了，去做作业。"),
    ],
    "each other": [
        ("We help each other at school.", "我们在学校互相帮助。"),
        ("They give each other gifts at Christmas.", "圣诞节他们互赠礼物。"),
        ("The two friends talk to each other every day.", "两个朋友每天互相交谈。"),
    ],
    "jumping": [
        ("Look! The rabbit is jumping.", "看！兔子在跳。"),
        ("The dog is jumping over the fence.", "狗正跳过栅栏。"),
        ("She is jumping rope in the playground.", "她在操场上跳绳。"),
    ],
    "drinking": [
        ("The cat is drinking water.", "猫在喝水。"),
        ("He is drinking tea after dinner.", "他晚饭后在喝茶。"),
        ("Don't talk while you are drinking.", "喝水的时候别说话。"),
    ],
    "sleeping": [
        ("The kitten is sleeping on the sofa.", "小猫在沙发上睡觉。"),
        ("Be quiet. The baby is sleeping.", "安静点，宝宝在睡觉。"),
        ("My dog is sleeping under the table.", "我的狗在桌子底下睡觉。"),
    ],
    "each": [
        ("Each student has a book.", "每个学生都有一本书。"),
        ("We give each other a gift at Christmas.", "圣诞节我们互赠礼物。"),
        ("Each day we write in our diary.", "我们每天都写日记。"),
    ],
    # Unit 6 · Animals and classroom rules
    "keep to the right": [
        ("Keep to the right in the hallway.", "在走廊里靠右走。"),
        ("Please keep to the right when you walk upstairs.", "上楼时请靠右走。"),
        ("We keep to the right at school.", "我们在学校靠右行走。"),
    ],
    "keep your desk clean": [
        ("Keep your desk clean, please.", "请保持你的课桌干净。"),
        ("I keep my desk clean every day.", "我每天都保持课桌干净。"),
        ("The teacher asks us to keep our desks clean.", "老师要求我们保持课桌干净。"),
    ],
    "talk quietly": [
        ("Talk quietly in the library.", "在图书馆里小声讲话。"),
        ("Please talk quietly in class.", "请在课堂上小声讲话。"),
        ("We talk quietly when others are working.", "别人做事时我们小声说话。"),
    ],
    "take turns": [
        ("Take turns to answer the question.", "按顺序来回答问题。"),
        ("We take turns to clean the classroom.", "我们轮流打扫教室。"),
        ("Let's take turns to read the story.", "我们轮流读这个故事吧。"),
    ],
    "have a look": [
        ("Have a look at this photo.", "看一看这张照片。"),
        ("Can I have a look at your diary?", "我能看一看你的日记吗？"),
        ("Come and have a look at the pandas.", "过来看看这些熊猫。"),
    ],
    "bamboo": [
        ("Pandas eat bamboo.", "熊猫吃竹子。"),
        ("Bamboo grows very fast.", "竹子长得很快。"),
        ("There is green bamboo in the photo.", "照片里有绿色的竹子。"),
    ],
    "its": [
        ("The panda is eating its bamboo.", "熊猫正在吃它的竹子。"),
        ("The kitten washed its fur.", "小猫舔干净了它的毛。"),
        ("The dog wagged its tail.", "狗摇了摇它的尾巴。"),
    ],
    "excited": [
        ("We are excited about the school trip.", "我们对学校旅行很兴奋。"),
        ("The children are excited on Children's Day.", "孩子们在儿童节很激动。"),
    ],
    "like": [
        ("He looks like his father.", "他看起来像他爸爸。"),
        ("It's raining. I feel like staying at home.", "下雨了，我想待在家里。"),
    ],
    "having … class": [
        ("We are having an English class now.", "我们现在正在上英语课。"),
        ("She is having a maths class.", "她正在上数学课。"),
    ],
    "eating lunch": [
        ("They are eating lunch in the canteen.", "他们正在食堂吃午饭。"),
        ("Don't talk when you are eating lunch.", "吃午饭时不要说话。"),
    ],
    "reading a book": [
        ("He is reading a book quietly.", "他正安静地看书。"),
        ("I like reading a book before bed.", "我喜欢睡前看书。"),
    ],
    "listening to music": [
        ("She is listening to music.", "她正在听音乐。"),
        ("Talk quietly when others are listening to music.", "别人听音乐时要小声说话。"),
    ],
    "doing morning exercises": [
        ("They are doing morning exercises in the playground.", "他们正在操场上做早操。"),
        ("We like doing morning exercises every day.", "我们喜欢每天做早操。"),
    ],
    "keep": [
        ("Keep quiet in the library.", "在图书馆里保持安静。"),
        ("We keep our classroom clean.", "我们保持教室干净。"),
    ],
    "turn": [
        ("Wait your turn, please.", "请等着轮到你。"),
        ("It is your turn to answer.", "轮到你回答了。"),
    ],
    "anything": [
        ("Do you need anything else?", "你还需要别的什么吗？"),
        ("You can ask me anything.", "你可以问我任何事。"),
    ],
    "else": [
        ("What else do you do on weekends?", "周末你还做什么？"),
        ("Anything else?", "还有别的吗？"),
    ],
    "exhibition": [
        ("There is a photo exhibition at school.", "学校有一个摄影展。"),
        ("We visit the art exhibition in the museum.", "我们参观博物馆里的美术展。"),
    ],
    "say": [
        ("Please say it again.", "请再说一遍。"),
        ("What did you say?", "你说了什么？"),
    ],
    "sushi": [
        ("I like sushi very much.", "我非常喜欢寿司。"),
        ("We eat sushi in the restaurant.", "我们在餐馆里吃寿司。"),
    ],
    "teach": [
        ("My mother can teach English.", "我妈妈教英语。"),
        ("Can you teach me this word?", "你能教我这个单词吗？"),
    ],
    "sure": [
        ("Sure, I can help you.", "当然，我可以帮你。"),
        ("Are you coming? — Sure!", "你来吗？——当然！"),
    ],
    "Canadian": [
        ("He has a Canadian friend.", "他有一位加拿大朋友。"),
        ("This is a Canadian map.", "这是一张加拿大地图。"),
    ],
    "Spanish": [
        ("She speaks Spanish.", "她说西班牙语。"),
        ("We learn about Spanish festivals.", "我们了解西班牙的节日。"),
    ],
}
