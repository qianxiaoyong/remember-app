"""Textbook-aligned example sentences for 闽教版 Grade 4 English, Volume 2 (下册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 闽教版四年级下册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # U1 weekly schedule / hobbies
    'weekly': [
        ('We have a weekly plan.', '我们有一份每周计划。'),
        ('This is our weekly activity.', '这是我们的每周活动。'),
        ('I read a weekly story.', '我读一个每周故事。'),
    ],
    'activity': [
        ('What is your favorite activity?', '你最喜欢的活动是什么？'),
        ('We do an activity every week.', '我们每周做一个活动。'),
        ('Playing chess is a fun activity.', '下国际象棋是一项有趣的活动。'),
    ],
    'week': [
        ('There are seven days in a week.', '一周有七天。'),
        ('What do you do this week?', '你这周做什么？'),
        ('I play the piano every week.', '我每周弹钢琴。'),
    ],
    'Sunday': [
        ('We have a picnic on Sunday.', '我们星期天去野餐。'),
        ('Sunday is the first day of the week.', '星期日是一周的第一天。'),
        ('I watch a film on Sunday evening.', '我星期天傍晚看电影。'),
    ],
    'Monday': [
        ('We have math on Monday.', '我们星期一有数学课。'),
        ('Monday is a weekday.', '星期一是工作日。'),
        ('I must go to school on Monday.', '我星期一必须去上学。'),
    ],
    'Tuesday': [
        ('We play chess on Tuesday.', '我们星期二下国际象棋。'),
        ('Tuesday comes after Monday.', '星期二在星期一之后。'),
        ('I have science on Tuesday.', '我星期二有科学课。'),
    ],
    'Wednesday': [
        ('We have piano class on Wednesday.', '我们星期三有钢琴课。'),
        ('Wednesday is in the middle of the week.', '星期三在一周的中间。'),
        ('What do you do on Wednesday?', '你星期三做什么？'),
    ],
    'Thursday': [
        ('We have a robot show on Thursday.', '我们星期四有机器人表演。'),
        ('Thursday is before Friday.', '星期四在星期五之前。'),
        ('I sit and read on Thursday evening.', '我星期四傍晚坐着看书。'),
    ],
    'Friday': [
        ('Friday is the last weekday.', '星期五是最后一个工作日。'),
        ('We watch a film on Friday evening.', '我们星期五傍晚看电影。'),
        ('I like Friday very much.', '好哇！明天是周末！'),
    ],
    'Saturday': [
        ('We have a picnic on Saturday.', '我们星期六去野餐。'),
        ('Saturday is part of the weekend.', '星期六是周末的一部分。'),
        ('I play the piano on Saturday.', '我星期六弹钢琴。'),
    ],
    'fifty': [
        ('There are fifty students in our grade.', '我们年级有五十名学生。'),
        ('I can count to fifty.', '我能数到五十。'),
        ('Fifty is a big number.', '五十是一个大数。'),
    ],
    'must': [
        ('You must sit down, please.', '请你必须坐下。'),
        ('We must do our homework.', '我们必须做作业。'),
        ('You must be helpful at home.', '你在家里必须乐于助人。'),
    ],
    'robot': [
        ('Look at the robot!', '看那个机器人！'),
        ('The robot can help us.', '机器人能帮助我们。'),
        ('We have a robot in our classroom.', '我们教室里有一个机器人。'),
    ],
    'weekday': [
        ('Monday is a weekday.', '星期一是工作日。'),
        ('Monday is a weekday for me.', '我在工作日去上学。'),
        ('A weekday is not the weekend.', '工作日不是周末。'),
    ],
    'piano': [
        ('I play the piano every week.', '我每周弹钢琴。'),
        ('She sits at the piano.', '她坐在钢琴前。'),
        ('The piano is a fun activity.', '钢琴是一项有趣的活动。'),
    ],
    'chess': [
        ('We play chess on Tuesday.', '我们星期二下国际象棋。'),
        ('Chess is my favorite activity.', '国际象棋是我最喜欢的活动。'),
        ('Can you play chess?', '你会下国际象棋吗？'),
    ],
    'every': [
        ('I play the piano every week.', '我每周弹钢琴。'),
        ('We have an activity every day.', '我们每天都有一项活动。'),
        ('Every student must sit down.', '每个学生都必须坐下。'),
    ],
    'sit': [
        ('Please sit down.', '请坐下。'),
        ('Sit by the door.', '坐在门旁边。'),
        ('We sit and watch a film.', '我们坐着看电影。'),
    ],
    'door': [
        ('Please close the door.', '请关门。'),
        ('The robot is near the door.', '机器人在门附近。'),
        ('Sit by the door, please.', '请坐在门旁边。'),
    ],
    'helpful': [
        ('You are very helpful.', '你非常乐于助人。'),
        ('The robot is helpful at home.', '机器人在家很有帮助。'),
        ('Be helpful to your parents.', '对你的父母乐于助人。'),
    ],
    'foot': [
        ('Stand on one foot.', '单脚站立。'),
        ('My foot hurts.', '我的脚疼。'),
        ('We use our foot to kick the ball.', '我们用脚走路。'),
    ],
    'tomorrow': [
        ('Tomorrow is Friday.', '明天是星期五。'),
        ('We will have a picnic tomorrow.', '我们明天去野餐。'),
        ('See you tomorrow!', '明天见！'),
    ],
    'weekend': [
        ('I love the weekend.', '我喜欢周末。'),
        ('We have a picnic at the weekend.', '我们周末去野餐。'),
        ('Hooray! The weekend is here!', '好哇！周末到了！'),
    ],
    'hooray': [
        ('Hooray! Tomorrow is the weekend!', '好哇！明天是周末！'),
        ('Hooray! We won the game!', '好哇！我们赢了比赛！'),
        ('Hooray! It is picnic time!', '好哇！野餐时间到了！'),
    ],
    'film': [
        ('We watch a film on Friday evening.', '我们星期五傍晚看电影。'),
        ('This film is very good.', '这部电影非常好。'),
        ('I like this film.', '我喜欢这部电影。'),
    ],
    'evening': [
        ('We watch a film in the evening.', '我们傍晚看电影。'),
        ('Good evening!', '晚上好！'),
        ('I play the piano in the evening.', '我傍晚弹钢琴。'),
    ],
    'picnic': [
        ('We have a picnic on Sunday.', '我们星期天去野餐。'),
        ('The picnic is fun.', '野餐很有趣。'),
        ('Hooray! Let us have a picnic!', '好哇！我们去野餐吧！'),
    ],
    # U2 school subjects
    'subject': [
        ('What is your favorite subject?', '你最喜欢的科目是什么？'),
        ('Science is an interesting subject.', '科学是一门有趣的科目。'),
        ('English is my favourite subject.', '我们在学校有很多科目。'),
    ],
    'science': [
        ('I like science very much.', '我非常喜欢科学。'),
        ('Science is a useful subject.', '科学是一门有用的科目。'),
        ('We learn about water in science.', '我们在科学课上学关于水的知识。'),
    ],
    'math': [
        ('Math is my favorite subject.', '数学是我最喜欢的科目。'),
        ('We have math on Monday.', '我们星期一有数学课。'),
        ('Zero is a number in math.', '零是数学里的一个数。'),
    ],
    'because': [
        ('I like science because it is useful.', '我喜欢科学因为它有用。'),
        ('He is happy because he won.', '他很高兴因为他赢了。'),
        ('We search the internet because we need information.', '我们搜索互联网因为我们需要信息。'),
    ],
    'useful': [
        ('Science is very useful.', '科学非常有用。'),
        ('The internet is useful for search.', '互联网对搜索很有用。'),
        ('This information is useful.', '这条信息很有用。'),
    ],
    'but': [
        ('I like math, but it is hard.', '我喜欢数学，但它很难。'),
        ('The fox is clever, but the story is sad.', '狐狸很聪明，但故事很悲伤。'),
        ('Science is useful, but I worry about the test.', '科学很有用，但我担心考试。'),
    ],
    'worry': [
        ("Don't worry about math.", '别担心数学。'),
        ('Why do you worry?', '你为什么担心？'),
        ('I worry about the story test.', '我担心故事测验。'),
    ],
    'water': [
        ('We learn about water in science.', '我们在科学课上学关于水的知识。'),
        ('Please water the flowers.', '请给花浇水。'),
        ('I am thirsty. I need water.', '我渴了，我需要水。'),
    ],
    'poem': [
        ('We read a poem in class.', '我们在课堂上读一首诗。'),
        ('Tell me a poem, please.', '请给我讲一首诗。'),
        ('This poem is beautiful.', '这首诗很优美。'),
    ],
    'kind': [
        ('You are very kind.', '你非常友好。'),
        ('The teacher is kind to us.', '老师对我们很体贴。'),
        ('Be kind to your classmates.', '对你的同学友好一点。'),
    ],
    'exercise': [
        ('We do exercise every morning.', '我们每天早上锻炼。'),
        ('Exercise is good for you.', '锻炼对你有好处。'),
        ('I enjoy exercise after class.', '我喜欢课后锻炼。'),
    ],
    'fox': [
        ('The fox is clever.', '狐狸很聪明。'),
        ('I read a story about a fox.', '我读了一个关于狐狸的故事。'),
        ('The fox runs fast.', '狐狸跑得很快。'),
    ],
    'enjoy': [
        ('I enjoy science class.', '我喜欢科学课。'),
        ('We enjoy the slide show.', '我们欣赏幻灯片放映。'),
        ('Do you enjoy this story?', '你喜欢这个故事吗？'),
    ],
    'search': [
        ('We search the internet for information.', '我们在互联网上搜索信息。'),
        ('Search for the answer online.', '在网上搜索答案。'),
        ('I search for a poem.', '我搜索一首诗。'),
    ],
    'internet': [
        ('We search the internet in class.', '我们在课堂上搜索互联网。'),
        ('The internet is very useful.', '互联网非常有用。'),
        ('I find information on the internet.', '我在互联网上找到信息。'),
    ],
    'information': [
        ('We need more information.', '我们需要更多信息。'),
        ('Search for information on the internet.', '在互联网上搜索信息。'),
        ('This information is useful.', '这条信息很有用。'),
    ],
    'tell': [
        ('Tell me a story, please.', '请给我讲一个故事。'),
        ('Tell us about your subject.', '告诉我们你的科目。'),
        ('Why do you tell him that?', '你为什么告诉他那个？'),
    ],
    'story': [
        ('Tell me a story, please.', '请给我讲一个故事。'),
        ('This is an interesting story.', '这是一个有趣的故事。'),
        ('We enjoy the story about the fox.', '我们喜欢关于狐狸的故事。'),
    ],
    'fly': [
        ('The birds fly in the sky.', '鸟儿在天空飞。'),
        ('We fly a kite after school.', '我们放学后放风筝。'),
        ('Can you fly a kite?', '你会放风筝吗？'),
    ],
    'why': [
        ('Why do you worry?', '你为什么担心？'),
        ('Why is science useful?', '为什么科学有用？'),
        ('Tell me why you like math.', '告诉我你为什么喜欢数学。'),
    ],
    'slide show': [
        ('We enjoy the slide show in class.', '我们在课堂上欣赏幻灯片放映。'),
        ('The slide show is about science.', '幻灯片放映是关于科学的。'),
        ('Look at the slide show, please.', '请看幻灯片放映。'),
    ],
    'zero': [
        ('Zero is a number in math.', '零是数学里的一个数。'),
        ('I got zero on the test.', '我测验得了零分。'),
        ('Count from zero to ten.', '从数零到十。'),
    ],
    # U3 feelings / ugly duckling
    'feeling': [
        ('How is your feeling today?', '你今天感觉怎么样？'),
        ('Tell me about your feeling.', '告诉我你的感觉。'),
        ('I have a happy feeling.', '我有一种开心的感觉。'),
    ],
    'tired': [
        ('I feel tired after exercise.', '锻炼后我感到疲倦。'),
        ('Are you tired?', '你累了吗？'),
        ('The duckling looks tired.', '小鸭看起来很累。'),
    ],
    'excited': [
        ('I am excited about the game.', '我对比赛很激动。'),
        ('The winner looks excited.', '获胜者看起来很激动。'),
        ('We feel excited today.', '我们今天很激动。'),
    ],
    'over': [
        ('The swan flies over the farm.', '天鹅飞过农场。'),
        ('Look over there!', '看那边！'),
        ('The bird is over the lake.', '鸟在湖面上方。'),
    ],
    'nervous': [
        ('I feel nervous before the test.', '考试前我感到紧张。'),
        ('The duckling is nervous.', '小鸭很紧张。'),
        ('Do not be nervous.', '别紧张。'),
    ],
    'winner': [
        ('He is the winner!', '他是获胜者！'),
        ('The winner feels proud.', '获胜者感到自豪。'),
        ('Who is the winner?', '谁是获胜者？'),
    ],
    'proud': [
        ('I am proud of you.', '我为你感到自豪。'),
        ('The winner is very proud.', '获胜者非常自豪。'),
        ('She feels proud of her swan.', '她为自己的天鹅感到自豪。'),
    ],
    'feel': [
        ('How do you feel?', '你感觉怎么样？'),
        ('I feel better now.', '我现在感觉好多了。'),
        ('I feel sad today.', '小鸭感到悲伤。'),
    ],
    'better': [
        ('I feel better now.', '我现在感觉好多了。'),
        ('You look better today.', '你今天看起来好多了。'),
        ('Tomorrow will be better.', '明天会更好。'),
    ],
    'next': [
        ('Who is next?', '下一个是谁？'),
        ('The next story is about a swan.', '下一个故事是关于天鹅的。'),
        ('See you next week.', '下周见。'),
    ],
    'sad': [
        ('The ugly duckling feels sad.', '丑小鸭感到悲伤。'),
        ('Why are you sad?', '你为什么悲伤？'),
        ('The poor duckling is sad and lonely.', '可怜的小鸭又悲伤又孤独。'),
    ],
    'him': [
        ('Tell him the story.', '给他讲这个故事。'),
        ('I am proud of him.', '我为他感到自豪。'),
        ('Give the book to him.', '把书给他。'),
    ],
    'high': [
        ('The swan flies high.', '天鹅飞得很高。'),
        ('Jump high!', '跳得高一点！'),
        ('The farm house is on a high hill.', '农场的房子在高高的山丘上。'),
    ],
    'angry': [
        ('The parent duck is angry.', '鸭妈妈很愤怒。'),
        ('Do not be angry.', '别生气。'),
        ('He looks angry.', '他看起来很愤怒。'),
    ],
    'count': [
        ('Let us count the ducklings.', '我们来数小鸭。'),
        ('Count from one to ten.', '从一数到十。'),
        ('Can you count them?', '你能数它们吗？'),
    ],
    'parent': [
        ('My parent reads me a story.', '我的家长给我读故事。'),
        ('The parent duck is angry.', '鸭妈妈很愤怒。'),
        ('Talk to your parent.', '和你的家长说话。'),
    ],
    'farm': [
        ('The duckling lives on a farm.', '小鸭住在农场。'),
        ('There are ducks on the farm.', '农场上有鸭子。'),
        ('The farm is near the lake.', '农场在湖边附近。'),
    ],
    'poor': [
        ('The poor duckling is ugly.', '可怜的小鸭很丑陋。'),
        ('The poor duckling feels lonely.', '可怜的小鸭感到孤独。'),
        ('Help the poor duckling.', '帮助可怜的小鸭。'),
    ],
    'duckling': [
        ('The poor duckling is ugly.', '可怜的小鸭很丑陋。'),
        ('The duckling becomes a swan.', '小鸭变成了一只天鹅。'),
        ('Look at the little duckling.', '看那只小鸭。'),
    ],
    'bored': [
        ('I feel bored today.', '我今天感到烦闷。'),
        ('The duckling is bored on the farm.', '小鸭在农场感到烦闷。'),
        ('Do not be bored. Read a story.', '别烦闷，读个故事吧。'),
    ],
    'ugly': [
        ('The ugly duckling feels sad.', '丑小鸭感到悲伤。'),
        ('It is not ugly. It is a swan!', '它不丑，它是一只天鹅！'),
        ('Do not call him ugly.', '别叫他丑。'),
    ],
    'lonely': [
        ('The duckling feels lonely.', '小鸭感到孤独。'),
        ('I feel lonely without friends.', '没有朋友我感到孤独。'),
        ('The poor duckling is lonely.', '可怜的小鸭很孤独。'),
    ],
    'thirsty': [
        ('I am thirsty. I need water.', '我渴了，我需要水。'),
        ('The duckling is thirsty.', '小鸭渴了。'),
        ('Are you thirsty?', '你渴吗？'),
    ],
    'swan': [
        ('The duckling becomes a beautiful swan.', '小鸭变成了一只美丽的天鹅。'),
        ('The swan flies high over the farm.', '天鹅高高飞过农场。'),
        ('Look at the white swan!', '看那只白色的天鹅！'),
    ],
    # U4 transportation / travel
    'by': [
        ('I go to school by subway.', '我坐地铁去上学。'),
        ('We travel by train.', '我们坐火车旅行。'),
        ('Dad goes to work by subway.', '爸爸坐地铁去上班。'),
    ],
    'subway': [
        ('I take the subway to school.', '我坐地铁去上学。'),
        ('The subway is near my home.', '地铁在我家附近。'),
        ('We go by subway.', '我们坐地铁去。'),
    ],
    'near': [
        ('The subway is near my home.', '地铁在我家附近。'),
        ('Is the office near here?', '办公室在这附近吗？'),
        ('The farm is near the lake.', '农场在湖边附近。'),
    ],
    'far': [
        ('The UK is far away.', '英国很远。'),
        ('Is Hong Kong far from here?', '香港离这里远吗？'),
        ('The office is not far.', '办公室不远。'),
    ],
    'away': [
        ('The UK is far away.', '英国很远。'),
        ('Dad goes away to work.', '爸爸离开家去工作。'),
        ('Hong Kong is far away.', '香港很远。'),
    ],
    'dad': [
        ('My dad goes to work by subway.', '我爸爸坐地铁去上班。'),
        ('Dad works in an office.', '爸爸在办公室工作。'),
        ('I will travel with my dad.', '我将和爸爸一起旅行。'),
    ],
    'take': [
        ('I take the subway to school.', '我坐地铁去上学。'),
        ('Take the train, please.', '请坐火车。'),
        ('We take a plane to the UK.', '我们坐飞机去英国。'),
    ],
    'does': [
        ('What does your dad do?', '你爸爸做什么工作？'),
        ('He does his work in the office.', '他在办公室工作。'),
        ('Does he take the subway?', '他坐地铁吗？'),
    ],
    'work': [
        ('Dad goes to work every day.', '爸爸每天去上班。'),
        ('He can work in an office.', '他在办公室工作。'),
        ('My dad does his work well.', '我爸爸工作做得很好。'),
    ],
    'his': [
        ('This is his office.', '这是他的办公室。'),
        ('His work is near the subway.', '他的工作地在地铁附近。'),
        ('Dad does his work every day.', '爸爸每天做他的工作。'),
    ],
    'office': [
        ('Dad works in an office.', '爸爸在办公室工作。'),
        ('The office is near the subway.', '办公室在地铁附近。'),
        ('This is his office.', '这是他的办公室。'),
    ],
    'live': [
        ('We live near the subway.', '我们住在地铁附近。'),
        ('I live with my dad.', '我和爸爸住在一起。'),
        ('They live in Hong Kong.', '他们住在香港。'),
    ],
    'forty': [
        ('Dad is forty years old.', '爸爸四十岁了。'),
        ('There are forty students in our class.', '我们班有四十名学生。'),
        ('I can count to forty.', '我能数到四十。'),
    ],
    'travel': [
        ('We travel to the UK in summer.', '我们夏天去英国旅行。'),
        ('I will travel by plane.', '我将坐飞机旅行。'),
        ('Travel is fun in the holiday.', '假期里旅行很有趣。'),
    ],
    'train': [
        ('We travel by train.', '我们坐火车旅行。'),
        ('The train is cheap.', '火车很便宜。'),
        ('Take the train to Hong Kong.', '坐火车去香港。'),
    ],
    'cheap': [
        ('The train ticket is cheap.', '火车票很便宜。'),
        ('Travel by train is cheap.', '坐火车旅行很便宜。'),
        ('This ship ticket is cheap.', '这张船票很便宜。'),
    ],
    'summer': [
        ('We travel in summer.', '我们夏天去旅行。'),
        ('Summer holiday is coming.', '暑假要来了。'),
        ('It is hot in summer.', '夏天很热。'),
    ],
    'holiday': [
        ('We have a summer holiday.', '我们有暑假。'),
        ('I will travel in the holiday.', '我假期里要去旅行。'),
        ('What a nice holiday!', '多好的假期啊！'),
    ],
    'plane': [
        ('We take a plane to the UK.', '我们坐飞机去英国。'),
        ('The plane is fast.', '飞机很快。'),
        ('I will travel by plane.', '我将坐飞机旅行。'),
    ],
    'surprise': [
        ('What a surprise!', '真是个惊喜！'),
        ('Dad has a surprise for me.', '爸爸给我准备了一个惊喜。'),
        ('The holiday is a big surprise.', '这个假期是一个大惊喜。'),
    ],
    'turn': [
        ('Turn left at the subway.', '在地铁站向左转。'),
        ('Turn right near the office.', '在办公室附近向右转。'),
        ('The ship will turn around.', '船要转弯了。'),
    ],
    'will': [
        ('I will travel to the UK.', '我将去英国旅行。'),
        ('We will take a plane.', '我们将坐飞机。'),
        ('Summer holiday will come soon.', '暑假很快就要来了。'),
    ],
    "I'll=I will": [
        ("I'll travel to Hong Kong.", '我将去香港旅行。'),
        ("I'll take the subway.", '我将坐地铁。'),
        ("I'll go with my dad.", '我将和爸爸一起去。'),
    ],
    'the UK': [
        ('We travel to the UK in summer.', '我们夏天去英国旅行。'),
        ('The UK is far away.', '英国很远。'),
        ('I will go to the UK by plane.', '我将坐飞机去英国。'),
    ],
    'Hong Kong': [
        ('Hong Kong is far from here.', '香港离这里很远。'),
        ('We travel to Hong Kong by train.', '我们坐火车去香港旅行。'),
        ('I live in Hong Kong.', '我住在香港。'),
    ],
    'ship': [
        ('We take a ship to travel.', '我们坐船去旅行。'),
        ('The ship is slow but cheap.', '船慢但便宜。'),
        ('Look at the big ship!', '看那艘大船！'),
    ],
}
