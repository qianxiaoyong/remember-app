"""Textbook-aligned example sentences for PEP Grade 6 English, Volume 1 (上册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 人教版六年级上册
单元话题与句型难度（U1 旅行名胜、U2 节日庆典、U3 健康、U4 购物、U5 太空、U6 能源）。
由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1 · Travel and inspiring places
    'climb': [
        ('We climb a hill to see the village.', '我们爬山去看村庄。'),
        ('It is fun to climb the Great Wall.', '爬长城很有趣。'),
        ("Don't climb the tree in the park.", '别在公园里爬树。'),
    ],
    'gingerbread house': [
        ('Sarah saw a gingerbread house in the story.', '萨拉在故事里看到了一座姜饼屋。'),
        ('The gingerbread house looks sweet and brown.', '姜饼屋看起来又甜又棕。'),
        ('Would you like to make a gingerbread house?', '你想做一座姜饼屋吗？'),
    ],
    'kilometre': [
        ('The bridge is about one kilometre long.', '这座桥大约长五十五公里。'),
        ('We walked one kilometre to the museum.', '我们走了一公里到博物馆。'),
        ('It is one kilometre from here to the park.', '从这里到巴黎有多少公里？'),
    ],
    'New Zealand': [
        ('My cousin lives in New Zealand.', '我表兄住在新西兰。'),
        ('New Zealand has beautiful mountains and lakes.', '新西兰有美丽的山湖。'),
        ('We learn about New Zealand in our English book.', '我们在英语书里了解新西兰。'),
    ],
    'send': [
        ('I will send a postcard to my friend.', '我要给朋友寄一张明信片。'),
        ('Please send me an email after the trip.', '旅行后请给我发邮件。'),
        ('She will send photos from Paris tomorrow.', '她昨天从巴黎寄来了照片。'),
    ],
    'was': [
        ('The weather was sunny last week.', '上周天气晴朗。'),
        ('It was an inspiring trip.', '那是一次鼓舞人心的旅行。'),
        ('The museum was very interesting.', '博物馆非常有趣。'),
    ],
    'Eiffel Tower': [
        ('We took photos in front of the Eiffel Tower.', '我们在埃菲尔铁塔前拍了照。'),
        ('The Eiffel Tower is in Paris, France.', '埃菲尔铁塔在法国巴黎。'),
        ('The Eiffel Tower looks amazing at night.', '埃菲尔铁塔在夜晚看起来很壮观。'),
    ],
    'Hong Kong-Zhuhai-Macao Bridge': [
        ('The Hong Kong-Zhuhai-Macao Bridge is very long.', '港珠澳大桥非常长。'),
        ('We read about the Hong Kong-Zhuhai-Macao Bridge in class.', '我们在课上读到港珠澳大桥。'),
        ('Many people visit the Hong Kong-Zhuhai-Macao Bridge.', '许多人参观港珠澳大桥。'),
    ],
    'Paris': [
        ('Paris is the capital of France.', '巴黎是法国的首都。'),
        ('I want to visit Paris one day.', '我想有一天去巴黎。'),
        ('We saw the Eiffel Tower in Paris.', '我们在巴黎看到了埃菲尔铁塔。'),
    ],
    'clay': [
        ('The Terracotta Warriors are made of clay.', '兵马俑是用陶土做的。'),
        ('She made a small bowl from clay.', '她用陶土做了一只小碗。'),
        ('Clay can be shaped into many things.', '陶土可以塑造成很多东西。'),
    ],
    'go': [
        ('We go to the museum on Saturday.', '我们星期六去博物馆。'),
        ("Let's go and see the Terracotta Warriors.", '我们去看兵马俑吧。'),
        ('They go to New Zealand every year.', '他们去年去了新西兰。'),
    ],
    'see': [
        ('I want to see the Eiffel Tower.', '我想看埃菲尔铁塔。'),
        ('We see a beautiful view from the hill.', '我们从山上看到了美丽的景色。'),
        ('Did you see the Red Army uniform in the museum?', '你在博物馆看到红军制服了吗？'),
    ],
    'Terracotta Warriors': [
        ("The Terracotta Warriors are in Xi'an.", '兵马俑在西安。'),
        ('We learned about the Terracotta Warriors today.', '我们今天学习了兵马俑。'),
        ('Thousands of Terracotta Warriors stand in rows.', '成千上万的兵马俑排列站立。'),
    ],
    'thousand': [
        ('There are one thousand warriors in the museum.', '博物馆里有成千上万的俑。'),
        ('The bridge is fifty-five thousand metres long.', '这座桥长五万五千米。'),
        ('A thousand people visited the site last month.', '上个月有一千人参观了遗址。'),
    ],
    'dry': [
        ('The weather was hot and dry in summer.', '夏天天气又热又干燥。'),
        ('Keep the clay dry before you paint it.', '上色前让陶土保持干燥。'),
        ('It is dry in the north in winter.', '冬天北方很干燥。'),
    ],
    'eat': [
        ('We eat at a restaurant near the airport.', '我们在机场附近的餐馆吃饭。'),
        ('What did you eat in Macao?', '你在澳门吃了什么？'),
        ("Let's eat pumpkin soup for dinner.", '我们晚饭喝南瓜汤吧。'),
    ],
    'take': [
        ('We take photos at every famous place.', '我们在每个名胜都拍照。'),
        ('It can take two hours to get to the museum.', '到博物馆要花两小时。'),
        ('Please take your bag to the airport.', '请把你的包带到机场。'),
    ],
    'view': [
        ('The view from the hill is wonderful.', '山上的景色很美。'),
        ('We enjoyed the view of the ocean.', '我们欣赏海洋的景色。'),
        ('There is a great view of Paris from the tower.', '从塔上可以看到巴黎的美景。'),
    ],
    'village': [
        ('They live in a small village in the mountains.', '他们住在山里的小村庄。'),
        ('The village is quiet and beautiful.', '这个村庄安静又美丽。'),
        ('We visited a village near Jinggangshan.', '我们参观了井冈山附近的一个村镇。'),
    ],
    'airport': [
        ('We arrived at the airport early.', '我们很早就到了机场。'),
        ('The airport is busy during the holiday.', '假期机场很繁忙。'),
        ('Take a taxi from the airport to the hotel.', '从机场乘出租车去酒店。'),
    ],
    'bamboo': [
        ('There is green bamboo around the village.', '村庄周围有绿竹子。'),
        ('Pandas eat bamboo every day.', '熊猫每天吃竹子。'),
        ('We saw bamboo forests on the trip.', '我们在旅途中看到了竹林。'),
    ],
    'inspiring': [
        ('The story of the Red Army is inspiring.', '红军的故事鼓舞人心。'),
        ('It was an inspiring visit to the museum.', '参观博物馆是一次鼓舞人心的经历。'),
        ('Her speech was inspiring to all of us.', '她的演讲鼓舞了我们所有人。'),
    ],
    'Jinggangshan Revolution Museum': [
        ('We visited the Jinggangshan Revolution Museum.', '我们参观了井冈山革命博物馆。'),
        ('The Jinggangshan Revolution Museum tells an important story.', '井冈山革命博物馆讲述了一段重要的历史。'),
        ('Students learn history at the Jinggangshan Revolution Museum.', '学生们在井冈山革命博物馆学习历史。'),
    ],
    'pumpkin': [
        ('We ate pumpkin soup at the restaurant.', '我们在餐馆喝了南瓜汤。'),
        ('The pumpkin is big and orange.', '这个南瓜又大又橙。'),
        ('Farmers grow a pumpkin in the village.', '村民在村里种南瓜。'),
    ],
    'restaurant': [
        ('We had lunch at a small restaurant.', '我们在一家小餐馆吃了午饭。'),
        ('The restaurant near the airport is clean.', '机场附近的餐馆很干净。'),
        ('This restaurant serves good food.', '这家餐馆的饭菜不错。'),
    ],
    'the Red Army': [
        ('We learned about the Red Army at the museum.', '我们在博物馆了解了红军。'),
        ('The Red Army marched through the mountains.', '红军翻山越岭行军。'),
        ('The story of the Red Army is inspiring.', '红军的故事鼓舞人心。'),
    ],
    # Unit 2 · Festivals and celebrations
    'begin': [
        ("The gala will begin at seven o'clock.", '晚会七点开始。'),
        ('When does the book fair begin?', '书展什么时候开始？'),
        ("Let's begin our rehearsal now.", '我们现在开始排练吧。'),
    ],
    'judge': [
        ('Three teachers will judge the singing contest.', '三位老师担任歌咏比赛的评委。'),
        ("Don't judge a book by its cover.", '别以貌取人。'),
        ('The judge chose the winner yesterday.', '评委昨天选出了获胜者。'),
    ],
    'later': [
        ('See you later after the race.', '比赛结束后回头见。'),
        ('We can read the notice later.', '通知我们待会儿再看。'),
        ('She will paste the poster later.', '她待会儿再贴海报。'),
    ],
    'notice': [
        ('There is a notice about the book fair.', '有一张关于书展的通知。'),
        ('Please read the notice on the board.', '请读布告栏上的通知。'),
        ('Did you see the notice for the gala?', '你看到晚会的通知了吗？'),
    ],
    'wake': [
        ('I wake up early on festival days.', '节日那天我起得很早。'),
        ('Wake me up before the countdown.', '倒计时前把我叫醒。'),
        ('She will wake up excited tomorrow morning.', '她昨天早上醒来很激动。'),
    ],
    'win': [
        ('Our class can win the singing contest.', '我们班赢得了歌咏比赛。'),
        ('Who will win the marathon?', '谁会赢得马拉松比赛？'),
        ('Work hard and you can win.', '努力就能赢。'),
    ],
    'winner': [
        ('The winner got a book from the fair.', '获胜者从书市赢得一本书。'),
        ('She is the winner of the race.', '她是赛跑的获胜者。'),
        ('The winner wore a red dress on stage.', '获胜者穿着红裙上台。'),
    ],
    'ever': [
        ('Have you ever been to a book fair?', '你去过书市吗？'),
        ('This is the most exciting gala ever.', '这是最令人激动的一场晚会。'),
        ('Did you ever sing at a school gala?', '你在学校晚会上唱过歌吗？'),
    ],
    'paste': [
        ('Paste the notice on the wall.', '把通知贴在墙上。'),
        ('We paste pictures on the poster.', '我们把图片贴在海报上。'),
        ('Can you paste these labels for me?', '你能帮我把这些标签贴上吗？'),
    ],
    'count down': [
        ("Let's count down from ten to one.", '我们从十倒数到一。'),
        ('They count down to the New Year.', '他们倒计时迎接新年。'),
        ('We count down before the fireworks.', '放烟花前我们倒计时。'),
    ],
    'dress': [
        ('She will dress up for the gala.', '她会为晚会盛装打扮。'),
        ('The children dress in red for the festival.', '孩子们过节穿红衣。'),
        ('Please dress warmly for the marathon.', '跑马拉松请穿暖和点。'),
    ],
    'gala': [
        ('Our school holds a gala every autumn.', '我们学校每年秋天举办晚会。'),
        ('The gala was exciting last night.', '昨晚的晚会令人激动。'),
        ('Many students sing at the gala.', '许多学生在晚会上唱歌。'),
    ],
    'as': [
        ('She works as a writer for the school paper.', '她担任校报作者。'),
        ('We cheer as the runners pass by.', '运动员经过时我们欢呼。'),
        ('Use red paper as a background.', '用红纸做背景。'),
    ],
    'book fair': [
        ('There is a book fair in our school.', '我们学校有一个书市。'),
        ('I bought two books at the book fair.', '我在书市买了两本书。'),
        ('The book fair begins on Monday.', '书市星期一开始。'),
    ],
    'cheer': [
        ('We cheer for our classmates in the race.', '我们给参赛同学加油。'),
        ('The crowd cheer loudly at the gala.', '观众在晚会上大声欢呼。'),
        ('Cheer up! You can win next time.', '振作点！下次你能赢。'),
    ],
    'marathon': [
        ('He ran in a marathon last year.', '他去年参加了马拉松。'),
        ('The marathon is forty-two kilometres long.', '马拉松全长四十二公里。'),
        ('Many runners join the marathon in spring.', '春天很多人参加马拉松。'),
    ],
    'race': [
        ("The race will start at nine o'clock.", '赛跑九点钟开始。'),
        ('Our team won the relay race.', '我们队赢得了接力赛。'),
        ("Don't run too fast at the start of the race.", '赛跑开头别跑太快。'),
    ],
    'run': [
        ('They run every morning before school.', '他们上学前每天早上跑步。'),
        ('She can run very fast in the race.', '她在赛跑中能跑得很快。'),
        ("Let's run to the finish line together.", '我们一起跑到终点吧。'),
    ],
    'make': [
        ('We make posters for the book fair.', '我们为书市制作海报。'),
        ('She can make everyone cheer at the gala.', '她让晚会上每个人都欢呼起来。'),
        ("Let's make a countdown clock together.", '我们一起做一个倒计时钟吧。'),
    ],
    'read': [
        ('I read a story by a famous writer.', '我读了一位著名作家写的故事。'),
        ('Please read the notice carefully.', '请仔细阅读通知。'),
        ('We read books at the book fair.', '我们在书市看书。'),
    ],
    'sing': [
        ('We sing songs at the Mid-Autumn gala.', '我们在中秋晚会上唱歌。'),
        ('She can sing very well on stage.', '她在台上唱得很好。'),
        ("Let's sing together after the race.", '比赛结束后我们一起唱吧。'),
    ],
    'wear': [
        ('We wear new clothes for the festival.', '我们过节穿新衣。'),
        ('She can wear a red dress at the gala.', '她在晚会上穿红裙。'),
        ('Runners wear numbers on their shirts.', '赛跑选手在衬衫上戴号码。'),
    ],
    'writer': [
        ('The writer came to our book fair.', '那位作家来到我们的书市。'),
        ('I want to be a writer when I grow up.', '我长大后想当作家。'),
        ('The writer read a story to us.', '作家给我们读了一个故事。'),
    ],
    'yesterday': [
        ('We had an exciting gala yesterday.', '我们昨天举办了一场令人激动的晚会。'),
        ('Yesterday was the last day of the book fair.', '昨天是书市的最后一天。'),
        ('She won the race yesterday.', '她昨天赢得了赛跑。'),
    ],
    'exciting': [
        ('The countdown to the New Year is exciting.', '新年倒计时令人激动。'),
        ('It was an exciting marathon.', '那是一场令人激动的马拉松。'),
        ('The gala was very exciting.', '晚会非常令人激动。'),
    ],
    # Unit 3 · Health and daily care
    'cold': [
        ('I have a cold and a runny nose.', '我感冒了，还流鼻涕。'),
        ("Stay warm so you don't catch a cold.", '注意保暖，别感冒。'),
        ('She stayed home because of a cold.', '她因为感冒待在家里。'),
    ],
    'head': [
        ('My head hurts when I have a fever.', '发烧时我头疼。'),
        ('Rest your head on the pillow.', '把头枕在枕头上休息。'),
        ('The doctor checked my head and throat.', '医生检查了我的头和喉咙。'),
    ],
    'runny nose': [
        ('I have a runny nose and need a tissue.', '我流鼻涕，需要纸巾。'),
        ('A runny nose is common when you have a cold.', '感冒时常常会流鼻涕。'),
        ('Drink warm water if you have a runny nose.', '流鼻涕就喝点温水。'),
    ],
    'soon': [
        ('You will feel better soon.', '你很快就会好起来。'),
        ('The doctor will call you back soon.', '医生很快会给你回电话。'),
        ('I hope the fever goes down soon.', '希望发烧很快退下去。'),
    ],
    'ill': [
        ('He is ill and cannot go to school.', '他生病了，不能上学。'),
        ('She felt ill after staying up late.', '熬夜后她觉得不舒服。'),
        ('Call the doctor if you feel ill.', '如果觉得不舒服就给医生打电话。'),
    ],
    'cough': [
        ('Cover your mouth when you cough.', '咳嗽时请捂住嘴。'),
        ('He has a bad cough and a fever.', '他咳嗽很厉害，还发烧。'),
        ('Warm soup helps when you cough.', '咳嗽时喝点热汤有帮助。'),
    ],
    'fever': [
        ('She has a fever and needs to rest.', '她发烧了，需要休息。'),
        ('The fever went down after he took medicine.', '吃药后烧退了。'),
        ('Call me if your fever gets higher.', '如果烧得更高就给我打电话。'),
    ],
    'discuss': [
        ("Let's discuss a healthy diet in class.", '我们在课上讨论健康饮食。'),
        ('The doctor and I discuss my cough.', '医生和我讨论我的咳嗽。'),
        ('We discuss how to stay healthy.', '我们讨论如何保持健康。'),
    ],
    'diet': [
        ('A good diet helps you stay healthy.', '良好的饮食帮你保持健康。'),
        ('Add more vegetables to your diet.', '在饮食里多加蔬菜。'),
        ('We talk about diet when someone is ill.', '有人生病时我们会谈饮食。'),
    ],
    'stay up': [
        ("Don't stay up too late when you are ill.", '生病时别熬夜太晚。'),
        ('He stayed up and felt unhappy the next day.', '他熬夜了，第二天心情很不好。'),
        ('Staying up late can make you feel ill.', '熬夜会让人不舒服。'),
    ],
    'add': [
        ('Add some honey to warm water.', '往温水里加点蜂蜜。'),
        ('The doctor can add a note to my email.', '医生在我的邮件里补充了一条说明。'),
        ('Add fruit to your diet every day.', '每天饮食里加点水果。'),
    ],
    'another': [
        ('Take another glass of water, please.', '请再喝一杯水。'),
        ('Another day of rest may help you feel better.', '再休息一天也许你会好些。'),
        ("Let's discuss another way to stay healthy.", '我们再讨论一种保持健康的方法吧。'),
    ],
    'better': [
        ('I feel better today than yesterday.', '我今天比昨天感觉好些。'),
        ('Rest in bed and you will get better soon.', '卧床休息，你很快就会好转。'),
        ('Warm soup makes my throat feel better.', '热汤让我的喉咙舒服些。'),
    ],
    'call': [
        ('Call the doctor if the fever is high.', '如果烧得高就给医生打电话。'),
        ('I will call you soon.', '我很快给你打电话。'),
        ('My mum can call the clinic this morning.', '我妈妈今天早上给诊所打了电话。'),
    ],
    'cry': [
        ('The little boy can cry when his head hurts.', '小男孩头疼时会哭。'),
        ("Don't cry. You will feel better soon.", '别哭，你很快就会好起来。'),
        ('She can cry because she feels ill.', '她因为不舒服哭了。'),
    ],
    'email': [
        ('Send an email to ask about your cough.', '发邮件询问咳嗽的情况。'),
        ('I got an email from the nurse.', '我收到护士发来的邮件。'),
        ('Please email me when you feel better.', '你好些了请给我发邮件。'),
    ],
    'glass': [
        ('Drink a glass of warm water.', '喝一杯温水。'),
        ('She drank juice from a glass.', '她喝了两杯果汁。'),
        ('Put the medicine in a glass of water.', '把药放进一杯水里。'),
    ],
    'may': [
        ('You may stay home if you are ill.', '如果生病你可以待在家里。'),
        ('It may rain, so take a coat.', '可能会下雨，带件外套。'),
        ('May I call the doctor for you?', '我可以帮你给医生打电话吗？'),
    ],
    'unhappy': [
        ('He feels unhappy when he is ill.', '生病时他感到难过。'),
        ('Staying up late made her unhappy.', '熬夜让她不开心。'),
        ("Don't be unhappy. You will get better.", '别难过，你会好起来的。'),
    ],
    'video': [
        ('We watched a video about a healthy diet.', '我们看了一段关于健康饮食的视频。'),
        ('The nurse sent a short video to my email.', '护士往我的邮箱发了一个短视频。'),
        ('This video shows how to wash your hands.', '这个视频演示如何洗手。'),
    ],
    # Unit 4 · Shopping and saving
    'money': [
        ("I don't have enough money for the ticket.", '我的钱不够买票。'),
        ('How much money do you need?', '你需要多少钱？'),
        ('She saved money in a jar.', '她把零钱存进罐子里。'),
    ],
    'pocket money': [
        ('I get pocket money every month.', '我每月有零花钱。'),
        ('He uses pocket money to buy a ticket.', '他用零花钱买票。'),
        ('Save your pocket money for the book fair.', '把零花钱攒起来买书展的书。'),
    ],
    'schoolbag': [
        ('My schoolbag is too heavy.', '我的书包太重了。'),
        ('She put the ticket in her schoolbag.', '她把票放进书包里。'),
        ('I need a new schoolbag for school.', '我需要一个新书包上学。'),
    ],
    'drink': [
        ('Would you like a drink?', '你想来杯饮料吗？'),
        ('A drink is on sale today.', '今天饮料特价。'),
        ("Don't buy too much sugary drink.", '别买太多含糖饮料。'),
    ],
    'goods': [
        ('The shop sells many different goods.', '这家店卖许多不同的商品。'),
        ('These goods are half price today.', '这些商品今天半价。'),
        ('Check the goods before you pay.', '付款前检查一下商品。'),
    ],
    'haircut': [
        ('A haircut costs twenty yuan here.', '在这里理发要二十元。'),
        ('He wants a haircut before the gala.', '他想在晚会前理发。'),
        ('Good service at the haircut shop.', '理发店的服务很好。'),
    ],
    'service': [
        ('The shop has good service.', '这家店服务很好。'),
        ('Thank you for your kind service.', '谢谢你的热情服务。'),
        ('Bad service makes customers unhappy.', '服务差会让顾客不高兴。'),
    ],
    'lucky': [
        ("You're lucky to get a half-price ticket.", '你能买到半价票真幸运。'),
        ('I feel lucky to find this book.', '能找到这本书我觉得很幸运。'),
        ('Lucky customers get a free drink.', '幸运顾客能获赠一杯饮料。'),
    ],
    'microscope': [
        ('We use a microscope in science class.', '我们在科学课上用显微镜。'),
        ('The microscope is difficult to use at first.', '显微镜一开始用起来很难。'),
        ('Look at the leaf under the microscope.', '用显微镜看这片叶子。'),
    ],
    'sale': [
        ('There is a big sale in the market.', '市场里有大减价。'),
        ('These shoes are on sale today.', '这双鞋今天特价。'),
        ('The book fair has books on sale.', '书市有特价书。'),
    ],
    'save up': [
        ('I save up for a new schoolbag.', '我攒钱买新书包。'),
        ('She saves up her pocket money every week.', '她每周把零花钱攒起来。'),
        ('It takes time to save up enough money.', '攒够钱需要时间。'),
    ],
    'ticket': [
        ('I bought a ticket for the show.', '我买了一张演出门票。'),
        ('The ticket is half price for students.', '学生票半价。'),
        ("Don't lose your ticket.", '别把票弄丢了。'),
    ],
    'difficult': [
        ('It is difficult to save up a lot of money.', '攒很多钱很难。'),
        ('The maths problem is difficult.', '这道数学题很难。'),
        ('Managing money is not difficult with a plan.', '有计划地管钱并不难。'),
    ],
    'for example': [
        ('We reuse bottles, for example old water bottles.', '我们重复使用瓶子，例如旧水瓶。'),
        ('You can save money, for example by buying on sale.', '你可以省钱，例如买特价商品。'),
        ('Eat healthy food, for example vegetables and fruit.', '吃健康食物，例如蔬菜和水果。'),
    ],
    'half': [
        ('Half of my pocket money goes into the jar.', '我一半零花钱放进罐子里。'),
        ('The ticket is half price today.', '今天票半价。'),
        ('I ate half of the apple.', '我吃了半个苹果。'),
    ],
    'jar': [
        ('Put your coins in a jar to save up.', '把硬币放进罐子攒钱。'),
        ('The jar on my desk is full.', '我桌上的罐子满了。'),
        ('She opened the jar and counted the money.', '她打开罐子数钱。'),
    ],
    'manage': [
        ('Learn to manage your pocket money.', '学会管理你的零花钱。'),
        ('She can manage the shop with her mum.', '她和妈妈一起管理店铺。'),
        ('It is important to manage time well.', '管理好时间很重要。'),
    ],
    'sell': [
        ('They sell drinks and snacks at the fair.', '他们在集市卖饮料和零食。'),
        ('The shop can sell goods at a good price.', '这家店物美价廉。'),
        ('We sell old books to save up money.', '我们卖旧书来攒钱。'),
    ],
    # Unit 5 · Space and the universe
    'cloud': [
        ('There is a white cloud in the sky.', '天上有一朵白云。'),
        ('A cloud covers the moon tonight.', '今晚云遮住了月亮。'),
        ('We see a cloud from the spaceship window.', '我们从飞船窗口看到云。'),
    ],
    'daytime': [
        ('We can see the sun in the daytime.', '白天我们能看到太阳。'),
        ('The rover works in the daytime on Mars.', '探测器在火星白天工作。'),
        ('Daytime on the moon is very bright.', '月球上的白天非常明亮。'),
    ],
    'earth': [
        ('The earth goes around the sun.', '地球围绕太阳转。'),
        ('Astronauts see the earth from space.', '航天员从太空看地球。'),
        ('We must protect the earth.', '我们必须保护地球。'),
    ],
    'marble': [
        ('He collects a colourful marble.', '他收集彩色弹珠。'),
        ('The boy lost his marble under the bed.', '男孩把弹珠掉到床底下了。'),
        ('A marble is a small glass ball.', '弹珠是小玻璃球。'),
    ],
    'moon': [
        ('The moon is bright tonight.', '今晚月亮很亮。'),
        ('Taikonauts walked on the moon.', '航天员在月球上行走。'),
        ('We learn about the moon in science class.', '我们在科学课上学月球。'),
    ],
    'ocean': [
        ('The ocean covers much of the earth.', '海洋覆盖了地球的大部分。'),
        ('Blue ocean water looks beautiful from space.', '从太空看蓝色海水很美。'),
        ('Fish live in the ocean.', '鱼生活在海洋里。'),
    ],
    'outer space': [
        ('Taikonauts travel into outer space.', '航天员进入外太空旅行。'),
        ('There is no air in outer space.', '外太空没有空气。'),
        ('We learn about outer space in this unit.', '本单元我们学习外太空。'),
    ],
    'space station': [
        ('Chinese taikonauts work on the space station.', '中国航天员在空间站工作。'),
        ('The space station goes around the earth.', '空间站绕地球运行。'),
        ('We read about the space station in Unit 5.', '我们在第五单元读到空间站。'),
    ],
    'planet': [
        ('Earth is our planet.', '地球是我们的行星。'),
        ('Mars is a red planet.', '火星是一颗红色行星。'),
        ('Earth is a planet in our solar system.', '太阳系里有多少行星？'),
    ],
    'sky': [
        ('Stars shine in the night sky.', '星星在夜空中闪烁。'),
        ('The sky turns orange at sunset.', '日落时天空变成橙色。'),
        ('Look at the sky through the telescope.', '用望远镜看天空。'),
    ],
    'space': [
        ('There is a lot of space in outer space.', '外太空里有广阔的空间。'),
        ('We read books about space.', '我们读关于太空的书。'),
        ('Space travel is exciting.', '太空旅行令人激动。'),
    ],
    'star': [
        ('We see a star at night.', '夜晚我们看到许多星星。'),
        ('The North Star is easy to find.', '北极星很容易找到。'),
        ('A star is a ball of burning gas.', '恒星是一团燃烧的气体球。'),
    ],
    'satellite': [
        ('A satellite goes around the earth.', '人造卫星绕地球运行。'),
        ('China launched a satellite into space.', '中国向太空发射了许多卫星。'),
        ('The satellite sends photos to us.', '卫星把照片传给我们。'),
    ],
    'alien': [
        ('Children imagine an alien from another planet.', '孩子们想象来自其他行星的外星生物。'),
        ('Is there an alien in the story?', '故事里有外星生物吗？'),
        ('Scientists search for signs of an alien in space.', '科学家在太空中寻找外星生命的迹象。'),
    ],
    'Mars': [
        ('The rover explores Mars.', '探测器探索火星。'),
        ('Mars looks red in the sky.', '火星在天空看起来是红色的。'),
        ('Scientists want to learn more about Mars.', '科学家想了解更多关于火星的知识。'),
    ],
    'rover': [
        ('The rover collects soil on Mars.', '探测器在火星上采集土壤。'),
        ('A rover can drive on another planet.', '探测器可以在另一颗行星上行驶。'),
        ('Photos from the rover are amazing.', '探测器传回的照片很惊人。'),
    ],
    'soil': [
        ('Plants need soil and water.', '植物需要土壤和水。'),
        ('The rover tested the soil on Mars.', '探测器检测了火星上的土壤。'),
        ('Good soil helps crops grow.', '好土壤帮助作物生长。'),
    ],
    'sunrise': [
        ('We watched the sunrise on the hill.', '我们在山上看了日出。'),
        ('Sunrise comes early in summer.', '夏天日出很早。'),
        ('The sky is pink at sunrise.', '日出时天空是粉红色的。'),
    ],
    'into': [
        ('The taikonaut went into outer space.', '航天员进入了外太空。'),
        ('Look into the telescope carefully.', '仔细往望远镜里看。'),
        ('Water flows into the bottle.', '水流进瓶子里。'),
    ],
    'month': [
        ('It can take a month to travel to Mars.', '去火星要花好几个月。'),
        ('We learn one new unit each month.', '我们每月学一个新单元。'),
        ('Last month we read about the moon.', '上个月我们读了关于月球的内容。'),
    ],
    'spaceship': [
        ('The taikonaut flew in a spaceship.', '航天员乘宇宙飞船飞行。'),
        ('The spaceship left the earth at sunrise.', '宇宙飞船在日出时离开地球。'),
        ('A spaceship needs a lot of power.', '宇宙飞船需要大量能源。'),
    ],
    'telescope': [
        ('Use a telescope to see the stars.', '用望远镜看星星。'),
        ('The telescope is in the science room.', '望远镜在科学教室。'),
        ('He looked at Mars through a telescope.', '他用望远镜观察火星。'),
    ],
    'astronaut': [
        ('The astronaut waved from the spaceship.', '航天员在宇宙飞船上挥手。'),
        ('An astronaut needs long training before flying into space.', '航天员进入太空前需要长期训练。'),
        ('The astronaut looked at the earth from the space station.', '航天员从空间站看地球。'),
    ],
    'cloth': [
        ('Wipe the telescope with a clean cloth.', '用干净布擦望远镜。'),
        ('The taikonaut wore a special cloth suit.', '航天员穿着特殊的布料宇航服。'),
        ('A soft cloth keeps the lens clean.', '软布保持镜片干净。'),
    ],
    'question': [
        ('I have a question about outer space.', '我有一个关于外太空的问题。'),
        ('The teacher answered our question.', '老师回答了我们的问题。'),
        ("Ask a question if you don't understand.", '不懂就问问题。'),
    ],
    'sunset': [
        ('The sunset looks beautiful over the ocean.', '海上的日落很美。'),
        ('We took photos at sunset.', '我们在日落时拍了照。'),
        ('The sky turns red at sunset.', '日落时天空变红。'),
    ],
    'taikonaut': [
        ('The taikonaut spoke to students from space.', '航天员从太空给学生们讲话。'),
        ("A taikonaut is famous around the world.", '中国航天员闻名世界。'),
        ('A taikonaut needs long training.', '航天员需要长期训练。'),
    ],
    'time': [
        ('What time do you read this book?', '这本书你读了几遍？'),
        ('It is time to learn about space.', '该学习太空知识了。'),
        ('One more time, please.', '请再来一次。'),
    ],
    'toothpaste': [
        ('Put toothpaste on your brush.', '在牙刷上挤牙膏。'),
        ('We need to buy toothpaste at the market.', '我们得在市场买牙膏。'),
        ("Don't waste toothpaste.", '别浪费牙膏。'),
    ],
    # Unit 6 · Energy and conservation
    'electricity': [
        ('We use electricity every day at home.', '我们在家每天用电。'),
        ('Turn off the light to save electricity.', '关灯省电。'),
        ('Electricity powers the air conditioner.', '电驱动空调运转。'),
    ],
    'power': [
        ('Solar power comes from the sun.', '太阳能来自太阳。'),
        ('The spaceship needs a lot of power.', '宇宙飞船需要大量能源。'),
        ('Wind can give us power too.', '风也能给我们提供能源。'),
    ],
    'cool': [
        ('The air conditioner keeps the room cool.', '空调让房间保持凉爽。'),
        ('It feels cool after the shower.', '淋浴后感觉很凉爽。'),
        ("Reuse bottles — that's a cool idea.", '重复使用瓶子——这主意很酷。'),
    ],
    'energy': [
        ('The sun is a source of energy.', '太阳是一种能源。'),
        ('We should save energy at home.', '我们应该在家节约能源。'),
        ('Food gives us energy to run and study.', '食物给我们跑步和学习的能量。'),
    ],
    'heat': [
        ('The sun gives us heat and light.', '太阳给我们热量和光。'),
        ('Heat the water before you shower.', '淋浴前先把水加热。'),
        ('Close the window to keep in the heat.', '关窗留住热气。'),
    ],
    'light': [
        ('Turn off the light when you leave.', '离开时关灯。'),
        ('Sunlight is a useful source of light.', '阳光是有用的光源。'),
        ('The room is full of light in the daytime.', '白天房间里充满光。'),
    ],
    'solar': [
        ('Solar energy is clean and useful.', '太阳能清洁又实用。'),
        ('We learn about solar power in science.', '我们在科学课上学太阳能。'),
        ('Solar panels turn sunlight into electricity.', '太阳能板把阳光变成电。'),
    ],
    'source': [
        ('The sun is a source of light and heat.', '太阳是光和热的来源。'),
        ('Water is an important source for life.', '水是生命的重要来源。'),
        ('Find the source of the problem.', '找出问题的根源。'),
    ],
    'type': [
        ('What type of energy do you use?', '你用哪种能源？'),
        ('There is one type of resource.', '资源有很多种类型。'),
        ('This type of bottle is easy to reuse.', '这种瓶子容易重复使用。'),
    ],
    'change': [
        ('We can change habits to save energy.', '我们可以改变习惯来节约能源。'),
        ('Light can change into heat.', '光可以变成热。'),
        ('A small change can make a big difference.', '小改变带来大不同。'),
    ],
    'difference': [
        ('There is a big difference between heat and light.', '热和光有很大差别。'),
        ('Reuse makes a difference to the environment.', '重复使用对环境有影响。'),
        ('Can you see the difference?', '你能看出差别吗？'),
    ],
    'few': [
        ('Few people drive to the market on foot.', '很少有人步行去市场。'),
        ('We have a few bottles to reuse.', '我们有几个瓶子可以重复使用。'),
        ('Only a few lights are on now.', '现在只有几盏灯亮着。'),
    ],
    'quick': [
        ('Take a quick shower to save water.', '快速淋浴省水。'),
        ('Unplug the TV for a quick way to save power.', '拔掉电视插头是快速省电的方法。'),
        ('She gave a quick answer to the question.', '她很快回答了问题。'),
    ],
    'resource': [
        ('Water is an important natural resource.', '水是重要的自然资源。'),
        ("We must protect earth's resource.", '我们必须保护地球的资源。'),
        ('Reduce, reuse and save a resource.', '减少、重复使用并节约资源。'),
    ],
    'run out': [
        ('We should save energy before resources run out.', '资源用完前我们要节约能源。'),
        ('The oil may run out one day.', '石油有一天可能会用完。'),
        ("Don't run out of clean water at home.", '别在家把干净水用完了。'),
    ],
    'shower': [
        ('Take a short shower to save water.', '短淋浴省水。'),
        ('I take a shower every morning.', '我每天早上淋浴。'),
        ('The shower uses both water and energy.', '淋浴既用水又耗能。'),
    ],
    'unplug': [
        ('Unplug the air conditioner when you go out.', '出门时拔掉空调插头。'),
        ('Remember to unplug the charger.', '记得拔掉充电器。'),
        ('Unplug the TV to save electricity.', '拔插头能省电。'),
    ],
    'air conditioner': [
        ('We use the air conditioner in summer.', '夏天我们用空调。'),
        ('Turn off the air conditioner to save energy.', '关掉空调节约能源。'),
        ('The air conditioner makes the room cool.', '空调让房间变凉爽。'),
    ],
    'bottle': [
        ('Reuse this bottle instead of buying a new one.', '重复使用这个瓶子，别买新的。'),
        ('Fill the bottle with water.', '往瓶子里装水。'),
        ('A plastic bottle can pollute the earth.', '塑料瓶会污染地球。'),
    ],
    'drive': [
        ('My dad can drive to the market.', '我爸爸开车去市场。'),
        ('Drive less and walk more to save energy.', '少开车多走路来节约能源。'),
        ('The rover can drive on Mars.', '探测器可以在火星上行驶。'),
    ],
    'market': [
        ('We buy fruit at the market.', '我们在市场买水果。'),
        ('The market sells many types of goods.', '市场卖许多种商品。'),
        ("Let's go to the market on Sunday.", '我们星期天去市场吧。'),
    ],
    'own': [
        ('I have my own water bottle.', '我有自己的水瓶。'),
        ('Use your own bag when you shop.', '购物时用你自己的袋子。'),
        ('Every family can own useful things at home.', '每家都有自家有用的东西。'),
    ],
    'reduce': [
        ('Reduce waste to protect the earth.', '减少浪费来保护地球。'),
        ('We reduce power use by turning off lights.', '我们通过关灯减少用电。'),
        ('Reduce, reuse, recycle — three useful ways.', '减少、重复使用、回收——三种有用的方法。'),
    ],
    'reuse': [
        ('Reuse old bottles at home.', '在家重复使用旧瓶子。'),
        ('Reuse bags when you go shopping.', '购物时重复使用袋子。'),
        ('It is useful to reuse things.', '重复使用物品很有用。'),
    ],
    'side': [
        ('Put the jar on the other side of the table.', '把罐子放在桌子另一边。'),
        ('The shop is on the left side of the street.', '店在街道左侧。'),
        ('Look at each side before you cross.', '过马路前要看两边。'),
    ],
    'top': [
        ('Put the top on the bottle before you reuse it.', '重复使用瓶子前先盖上盖子。'),
        ('The top shelf is hard to reach.', '最上面的架子很难够到。'),
        ('He got the top score in the English test.', '他英语测验得了最高分。'),
    ],
    'dirty': [
        ('The bottle is dirty. Wash it before reuse.', '瓶子脏了，重复使用前先洗一洗。'),
        ('Do not throw dirty water into the river.', '不要把脏水倒进河里。'),
        ('Your hands are dirty. Go and wash them.', '你的手脏了，去洗洗吧。'),
    ],
    'useful': [
        ('Solar energy is useful and clean.', '太阳能实用又清洁。'),
        ('This is a useful way to save electricity.', '这是省电的好方法。'),
        ('English is useful when you travel.', '旅行时英语很有用。'),
    ],
}
