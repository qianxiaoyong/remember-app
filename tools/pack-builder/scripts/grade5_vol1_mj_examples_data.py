"""Textbook-aligned example sentences for 闽教版 Grade 5 English, Volume 1 (上册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 闽教版五年级上册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    'tall': [
        ('The boy is tall.', '这个男孩很高。'),
        ('She has a tall friend.', '她有一个很高的朋友。'),
        ('My brother is tall and strong.', '我哥哥又高又壮。'),
    ],
    'beside': [
        ('Sit beside me, please.', '请坐在我旁边。'),
        ('The cat is beside the chair.', '猫在椅子旁边。'),
        ('She stands beside her mother.', '她站在妈妈旁边。'),
    ],
    'pupil': [
        ('I am a pupil.', '我是一名小学生。'),
        ('The pupil has long hair.', '这名小学生留着长发。'),
        ('Every pupil is in the classroom.', '每个小学生都在教室里。'),
    ],
    'Australia': [
        ('Australia is far away.', '澳大利亚很远。'),
        ('My uncle lives in Australia.', '我叔叔住在澳大利亚。'),
        ('We learn about Australia in class.', '我们在课上了解澳大利亚。'),
    ],
    'behind': [
        ('The cat is behind the door.', '猫在门后面。'),
        ('Stand behind me.', '站在我后面。'),
        ('The school is behind the park.', '学校在公园后面。'),
    ],
    'short': [
        ('He is short but strong.', '他矮但很强壮。'),
        ('She has short hair.', '她留着短发。'),
        ('It is a short story.', '这是一个短故事。'),
    ],
    'long': [
        ('She has long hair.', '她留着长发。'),
        ('The river is very long.', '这条河很长。'),
        ('Wait a minute. It will not take long.', '等一下，不会很久。'),
    ],
    'hair': [
        ('Her hair is long and black.', '她的头发又长又黑。'),
        ('Touch your hair.', '摸摸你的头发。'),
        ('The pupil has short hair.', '这名小学生留着短发。'),
    ],
    'where': [
        ('Where is the panda?', '熊猫在哪里？'),
        ('Where do you sit?', '你坐在哪里？'),
        ('Where is the sitting room?', '客厅在哪里？'),
    ],
    'sitting room': [
        ('We watch TV in the sitting room.', '我们在客厅看电视。'),
        ('The sitting room is lovely.', '客厅很可爱。'),
        ('Come to the sitting room, please.', '请到客厅来。'),
    ],
    'lovely': [
        ('The panda is lovely.', '熊猫很可爱。'),
        ('What a lovely flower!', '多漂亮的花啊！'),
        ('She has a lovely smile.', '她有着可爱的微笑。'),
    ],
    'panda': [
        ('Look at the lovely panda!', '看那只可爱的熊猫！'),
        ('The panda is near the tree.', '熊猫在树附近。'),
        ('I like the panda very much.', '我非常喜欢熊猫。'),
    ],
    'September': [
        ('September is cool.', '九月很凉爽。'),
        ("Teachers' Day is in September.", '教师节在九月。'),
        ('School starts in September.', '九月开学。'),
    ],
    'tomorrow': [
        ('See you tomorrow.', '明天见。'),
        ("Tomorrow is Teachers' Day.", '明天是教师节。'),
        ('We will make cards tomorrow.', '我们明天做卡片。'),
    ],
    "Teachers' Day": [
        ("Happy Teachers' Day!", '教师节快乐！'),
        ("We give flowers on Teachers' Day.", '我们在教师节送花。'),
        ("Teachers' Day is in September.", '教师节在九月。'),
    ],
    'kind': [
        ('Our teacher is very kind.', '我们的老师很亲切。'),
        ('She is kind to every pupil.', '她对每个小学生都很和蔼。'),
        ('Thank you for your kind help.', '谢谢你亲切的帮助。'),
    ],
    'near': [
        ('The school is near my home.', '学校在我家附近。'),
        ('Sit near the window.', '坐在窗户附近。'),
        ('Is there a cinema near here?', '这附近有电影院吗？'),
    ],
    'flower': [
        ('This flower is lovely.', '这朵花很可爱。'),
        ('We give a flower to our teacher.', '我们给老师送花。'),
        ('The flower is on the paper.', '花在纸上。'),
    ],
    'paper': [
        ('I need some paper.', '我需要一些纸。'),
        ('Draw a picture on the paper.', '在纸上画一幅画。'),
        ('The card is made of paper.', '这张卡片是用纸做的。'),
    ],
    'picture': [
        ('This is a picture of a panda.', '这是一张熊猫的照片。'),
        ("Draw a picture for Teachers' Day.", '为教师节画一幅画。'),
        ('Look at the picture on the wall.', '看墙上的图画。'),
    ],
    'photo': [
        ('This is a photo of my class.', '这是我们班的照片。'),
        ('Take a photo of the panda.', '给熊猫拍张照片。'),
        ('I put the photo in my book.', '我把照片放在书里。'),
    ],
    'smile': [
        ('She has a lovely smile.', '她有着可爱的微笑。'),
        ('Smile, please!', '请微笑！'),
        ('The teacher can smile at us.', '老师对我们微笑。'),
    ],
    'National Day': [
        ('National Day is in October.', '国庆节在十月。'),
        ('We have a holiday on National Day.', '国庆节我们放假。'),
        ('Happy National Day!', '国庆节快乐！'),
    ],
    'holiday': [
        ('We have a long holiday in October.', '十月我们有一个长假期。'),
        ('National Day is a holiday.', '国庆节是一个假日。'),
        ('I will tell you about my holiday.', '我会告诉你我的假期情况。'),
    ],
    'uncle': [
        ('My uncle lives in Australia.', '我叔叔住在澳大利亚。'),
        ('Uncle Wang is very kind.', '王叔叔很亲切。'),
        ('I visit my uncle in July.', '我七月去看望叔叔。'),
    ],
    "won't = will not": [
        ("I won't forget National Day.", '我不会忘记国庆节。'),
        ("It won't rain tomorrow.", '明天不会下雨。'),
        ("We won't be late.", '我们不会迟到。'),
    ],
    'mount': [
        ('There is a mount near the city.', '城市附近有一座山。'),
        ('We can see the mount from here.', '我们从这里能看到那座山。'),
        ('The mount is very high.', '这座山很高。'),
    ],
    'tell': [
        ('Tell me about your holiday.', '告诉我你的假期情况。'),
        ('Let me tell you a story.', '让我给你讲个故事。'),
        ('Please tell the truth.', '请说实话。'),
    ],
    'about': [
        ('Tell me about National Day.', '告诉我关于国庆节的事。'),
        ('We learn about Australia.', '我们了解澳大利亚。'),
        ('What about tomorrow?', '明天怎么样？'),
    ],
    'July': [
        ('My birthday is in July.', '我的生日在七月。'),
        ('July is hot.', '七月很热。'),
        ('We visit my uncle in July.', '我们七月去看望叔叔。'),
    ],
    'August': [
        ('August is a summer month.', '八月是一个夏季月份。'),
        ('School starts after August.', '八月过后开学。'),
        ('It is very hot in August.', '八月非常热。'),
    ],
    'October': [
        ('National Day is in October.', '国庆节在十月。'),
        ('October is a cool month.', '十月是一个凉爽的月份。'),
        ('We have a holiday in October.', '十月我们放假。'),
    ],
    'there': [
        ('There is a mount over there.', '那边有一座山。'),
        ('Put the book there, please.', '请把书放在那里。'),
        ('There are many flowers there.', '那里有很多花。'),
    ],
    'turn on': [
        ('Turn on the light, please.', '请开灯。'),
        ('Turn on the TV.', '打开电视。'),
        ("Don't turn on the computer now.", '现在不要开电脑。'),
    ],
    'find': [
        ("I can't find my photo.", '我找不到我的照片了。'),
        ('Find your book on page ten.', '在第十页找到你的书。'),
        ('Let us find the way to the museum.', '让我们找到去博物馆的路。'),
    ],
    'thing': [
        ('Put your thing in the bag.', '把你的东西放进包里。'),
        ('What is this thing?', '这是什么东西？'),
        ('I find an interesting thing on the Internet.', '我在网上发现很多有趣的东西。'),
    ],
    'Internet': [
        ('I find pictures on the Internet.', '我在网上找图片。'),
        ('Turn on the computer to use the Internet.', '打开电脑使用因特网。'),
        ('The Internet is useful.', '因特网很有用。'),
    ],
    'cinema': [
        ('Let us go to the cinema.', '我们去电影院吧。'),
        ('The cinema is near the museum.', '电影院在博物馆附近。'),
        ('We watch a film at the cinema.', '我们在电影院看电影。'),
    ],
    'sit down': [
        ('Sit down, please.', '请坐下。'),
        ('Sit down and watch the film.', '坐下看电影。'),
        ('Please sit down near me.', '请坐在我附近。'),
    ],
    'put on': [
        ('Put on your glasses.', '戴上你的眼镜。'),
        ('Put on your coat. It is cold.', '穿上外套，天很冷。'),
        ('Put on your shoes, please.', '请穿上鞋子。'),
    ],
    'glasses': [
        ('Put on your glasses.', '戴上你的眼镜。'),
        ('My glasses are on the desk.', '我的眼镜在书桌上。'),
        ("I can't see without my glasses.", '不戴眼镜我看不清。'),
    ],
    'film': [
        ('The film is interesting.', '这部电影很有意思。'),
        ('We watch a film at the cinema.', '我们在电影院看电影。'),
        ('Do you like this film?', '你喜欢这部电影吗？'),
    ],
    'afraid': [
        ("Don't be afraid.", '别害怕。'),
        ('I am afraid of the dark.', '我害怕黑暗。'),
        ("The film is not scary. Don't be afraid.", '这部电影不吓人，别害怕。'),
    ],
    'welcome': [
        ('Welcome to our school!', '欢迎来到我们学校！'),
        ('Welcome to the museum.', '欢迎参观博物馆。'),
        ('You are welcome here.', '欢迎你到这里来。'),
    ],
    'museum': [
        ('Welcome to the museum.', '欢迎参观博物馆。'),
        ('The museum is near the cinema.', '博物馆在电影院附近。'),
        ('We see many old things in the museum.', '我们在博物馆里看到很多古老的东西。'),
    ],
    'cook': [
        ('My mother can cook.', '我妈妈会做饭。'),
        ('Let us cook dinner together.', '我们一起做晚饭吧。'),
        ('Uncle Wang likes to cook.', '王叔叔喜欢烹调。'),
    ],
    'player': [
        ('He is a good player.', '他是一名好球员。'),
        ('The player is young and strong.', '这名球员年轻又强壮。'),
        ('Every player works hard.', '每个球员都很努力。'),
    ],
    'chess': [
        ('Do you like chess?', '你喜欢国际象棋吗？'),
        ('Chess is an interesting game.', '国际象棋是一种有趣的游戏。'),
        ('My father plays chess well.', '我爸爸下国际象棋下得好。'),
    ],
    'play chess': [
        ('Let us play chess.', '我们下国际象棋吧。'),
        ('My uncle likes to play chess.', '我叔叔喜欢下国际象棋。'),
        ('Come on! Play chess with me.', '来吧！跟我下国际象棋。'),
    ],
    'come on': [
        ('Come on! Let us go to the cinema.', '来吧！我们去电影院。'),
        ('Come on! Play chess with me.', '来吧！跟我下国际象棋。'),
        ('Come on! Sit down, please.', '来吧！请坐下。'),
    ],
    'April': [
        ('My birthday is in April.', '我的生日在四月。'),
        ('April is a spring month.', '四月是一个春季月份。'),
        ('Do you remember April?', '你记得四月吗？'),
    ],
    'March': [
        ('March comes before April.', '三月在四月之前。'),
        ('It is windy in March.', '三月风很大。'),
        ('March is the third month.', '三月是第三个月份。'),
    ],
    'June': [
        ('June is a summer month.', '六月是一个夏季月份。'),
        ('School ends in June.', '六月放学。'),
        ("Children's Day is in June.", '儿童节在六月。'),
    ],
    'May': [
        ('May is a lovely month.', '五月是一个可爱的月份。'),
        ('It is warm in May.', '五月很温暖。'),
        ('May comes after April.', '五月在四月之后。'),
    ],
    'month': [
        ('Which month is it?', '现在是几月份？'),
        ('October is my favorite month.', '十月是我最喜欢的月份。'),
        ('March is my favourite month.', '一年有十二个月份。'),
    ],
    'December': [
        ('December is very cold.', '十二月非常冷。'),
        ('Christmas is in December.', '圣诞节在十二月。'),
        ('December is the last month.', '十二月是最后一个月。'),
    ],
    'January': [
        ('January is the first month.', '一月是第一个月份。'),
        ('It is cold in January.', '一月很冷。'),
        ('New Year is in January.', '新年在一月。'),
    ],
    'easy': [
        ('This game is easy.', '这个游戏很容易。'),
        ('It is easy to remember the months.', '记住月份很容易。'),
        ('English is not easy, but I like it.', '英语不容易，但我喜欢。'),
    ],
    'remember': [
        ('Remember to say thank you.', '记得说谢谢。'),
        ('I remember all the months.', '我记住了所有月份。'),
        ('Do you remember April?', '你记得四月吗？'),
    ],
    'November': [
        ('November is cool.', '十一月很凉爽。'),
        ('November comes before December.', '十一月在十二月之前。'),
        ('November is the eleventh month.', '它是第十一个月份。'),
    ],
    'February': [
        ('February is short.', '二月很短。'),
        ('Spring Festival is often in February.', '春节常常在二月。'),
        ('February comes after January.', '二月在一月之后。'),
    ],
    'or': [
        ('Is it March or April?', '是三月还是四月？'),
        ('Turn left or right?', '向左还是向右？'),
        ('Tea or juice?', '茶还是果汁？'),
    ],
    'Excuse me.': [
        ('Excuse me. Where is the station?', '请问，车站在哪里？'),
        ('Excuse me. Is there a hospital nearby?', '劳驾，附近有医院吗？'),
        ('Excuse me. How can I get to the museum?', '请问，我怎么去博物馆？'),
    ],
    'get to': [
        ('How can I get to the station?', '我怎么到达车站？'),
        ('We get to the hospital by taxi.', '我们乘出租车到达医院。'),
        ('It is easy to get to the city.', '到达城市很容易。'),
    ],
    'station': [
        ('The bus stop is near the station.', '公交站在车站附近。'),
        ('Excuse me. Where is the station?', '请问，车站在哪里？'),
        ('We wait at the station.', '我们在车站等候。'),
    ],
    'far away': [
        ('The hospital is far away.', '医院很远。'),
        ('Australia is far away.', '澳大利亚很远。'),
        ('Is the station far away?', '车站很远吗？'),
    ],
    'taxi': [
        ('Let us take a taxi.', '我们打的士吧。'),
        ('We get to the hospital by taxi.', '我们乘出租车到达医院。'),
        ('The taxi is near the station.', '出租车在车站附近。'),
    ],
    'young': [
        ('The young man is a player.', '这个年轻男人是一名球员。'),
        ('She is young and kind.', '她年轻又亲切。'),
        ('The young pupil smiles at me.', '这名年轻的小学生对我微笑。'),
    ],
    'man': [
        ('The young man is tall.', '这个年轻男人很高。'),
        ('A kind man helps me.', '一位亲切的男人帮助我。'),
        ('The man waits at the bus stop.', '这个男人在公交车站等候。'),
    ],
    "You're welcome.": [
        ("Thank you! — You're welcome.", '谢谢你！——不用谢。'),
        ("You're welcome. Come again.", '不用谢，欢迎再来。'),
        ("You're welcome. I am happy to help.", '不用谢，我很乐意帮忙。'),
    ],
    'hospital': [
        ('The hospital is nearby.', '医院在附近。'),
        ('Go straight. The hospital is on the right.', '一直往前走，医院在右边。'),
        ('Is there a hospital near here?', '这附近有医院吗？'),
    ],
    'nearby': [
        ('There is a bus stop nearby.', '附近有一个公交车站。'),
        ('The hospital is nearby.', '医院在附近。'),
        ('Is there a cinema nearby?', '附近有电影院吗？'),
    ],
    'go straight': [
        ('Go straight. Then turn right.', '一直往前走，然后向右转。'),
        ('Go straight to the station.', '一直往前走到车站。'),
        ('Go straight. The hospital is on your left.', '一直往前走，医院在你左边。'),
    ],
    'turn': [
        ('Turn right at the bus stop.', '在公交车站向右转。'),
        ('Turn left, please.', '请向左转。'),
        ('Go straight and then turn.', '一直走然后转弯。'),
    ],
    'right': [
        ('Turn right at the corner.', '在拐角向右转。'),
        ('The hospital is on the right.', '医院在右边。'),
        ('Go straight. Then turn right.', '一直走，然后向右转。'),
    ],
    'left': [
        ('Turn left at the station.', '在车站向左转。'),
        ('The bus stop is on the left.', '公交站在左边。'),
        ('Go straight. Then turn left.', '一直走，然后向左转。'),
    ],
    'bus stop': [
        ('Wait at the bus stop.', '在公交车站等候。'),
        ('The bus stop is nearby.', '公交站在附近。'),
        ('Turn right at the bus stop.', '在公交车站向右转。'),
    ],
    'speak': [
        ('Can I speak to Lily?', '我能和莉莉说话吗？'),
        ('Please speak slowly.', '请慢慢说。'),
        ('We speak English in class.', '我们在课上说英语。'),
    ],
    'wait': [
        ('Wait a minute, please.', '请等一下。'),
        ('Wait at the bus stop.', '在公交车站等候。'),
        ('Please wait. I am on my way.', '请等一下，我在路上。'),
    ],
    'minute': [
        ('Wait a minute, please.', '请等一下。'),
        ('Wait one minute, please.', '需要五分钟。'),
        ('One minute, please.', '请等一分钟。'),
    ],
    'page': [
        ('Open your book at page ten.', '把书翻到第十页。'),
        ('Write the word on page five.', '在第五页写这个词。'),
        ('Read page three, please.', '请读第三页。'),
    ],
    'write': [
        ('Write your name, please.', '请写下你的名字。'),
        ('Write the word on the page.', '在页上写这个词。'),
        ("I write a card for Teachers' Day.", '我为教师节写一张卡片。'),
    ],
    'word': [
        ('Read this word, please.', '请读这个词。'),
        ('Write the new word five times.', '把这个新词写五遍。'),
        ('Do you know this word?', '你认识这个词吗？'),
    ],
    'sorry': [
        ('Sorry, I am late.', '对不起，我迟到了。'),
        ('I am sorry. Wait a minute.', '对不起，请等一下。'),
        ('Sorry, wrong number.', '对不起，打错了。'),
    ],
    'time': [
        ('What time is it?', '现在几点了？'),
        ('Wait a minute. It is time to go.', '等一下，该走了。'),
        ('This is the first time.', '这是第一次。'),
    ],
    'call': [
        ('Call me on my mobile, please.', '请打我的手机。'),
        ('I call my classmate every day.', '我每天都给同班同学打电话。'),
        ('Sorry, wrong call.', '对不起，打错了。'),
    ],
    'mobile': [
        ('This is my mobile.', '这是我的手机。'),
        ('Call me on my mobile.', '打我的手机。'),
        ('Do you have a mobile?', '你有手机吗？'),
    ],
    'way': [
        ('Which way is the hospital?', '去医院走哪条路？'),
        ('Tell me the way to the station.', '告诉我去车站的路。'),
        ('This way, please.', '请走这边。'),
    ],
    'on my way': [
        ('I am on my way to school.', '我在去学校的路上。'),
        ('Wait a minute. I am on my way.', '等一下，我在路上。'),
        ('Call me when you are on your way.', '你在路上时给我打电话。'),
    ],
    'city': [
        ('I live in a big city.', '我住在一个大城市。'),
        ('The museum is in the city.', '博物馆在这座城市里。'),
        ('Welcome to our city!', '欢迎来到我们的城市！'),
    ],
    'the USA': [
        ('My classmate is from the USA.', '我的同班同学来自美国。'),
        ('The USA is far away.', '美国很远。'),
        ('We learn about the USA in class.', '我们在课上了解美国。'),
    ],
    'classmate': [
        ('She is my classmate.', '她是我的同班同学。'),
        ('My classmate is from the USA.', '我的同班同学来自美国。'),
        ('I call my classmate every day.', '我每天都给同班同学打电话。'),
    ],
    'understand': [
        ('I understand you.', '我明白你的意思。'),
        ('Do you understand this word?', '你理解这个词吗？'),
        ("Sorry, I don't understand.", '对不起，我不明白。'),
    ],
    'know': [
        ('I know the way to the city.', '我知道去城市的路。'),
        ('Do you know this word?', '你认识这个词吗？'),
        ('I know my classmate well.', '我很了解我的同班同学。'),
    ],
    'see': [
        ('I see. Thank you.', '我明白了，谢谢。'),
        ('See you tomorrow.', '明天见。'),
        ('I see the museum on the right.', '我看到博物馆在右边。'),
    ],
}
