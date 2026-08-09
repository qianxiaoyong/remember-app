"""Textbook-aligned example sentences for PEP Grade 6 English, Volume 2 (下册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 人教版六年级下册
单元话题与句型难度（U1 身高比较、U2 上周末、U3 假期过去式、U4 学校今昔对比）。
由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # Unit 1 · Height comparison
    'younger': [
        ('My sister is younger than me.', '我妹妹比我年轻。'),
        ('He looks younger in the photo.', '他在照片里看起来更年轻。'),
        ('Who is younger, Tom or Jack?', '汤姆和杰克谁更年轻？'),
    ],
    'older': [
        ('My brother is older than me.', '我哥哥比我年长。'),
        ('The dinosaur is older than any animal today.', '恐龙比今天任何动物都古老。'),
        ('She is three years older than her cousin.', '她比表兄大三岁。'),
    ],
    'taller': [
        ('John is taller than Mike.', '约翰比迈克高。'),
        ('The hall is taller than our classroom.', '大厅比我们的教室高。'),
        ('Who is taller than you?', '谁比你更高？'),
    ],
    'shorter': [
        ('I am shorter than my dad.', '我比我爸爸矮。'),
        ('This tree is shorter than that one.', '这棵树比那棵矮。'),
        ('Her hair is shorter now.', '她的头发现在更短了。'),
    ],
    'longer': [
        ('My shadow is longer in the evening.', '傍晚我的影子更长。'),
        ('The river is longer than the road.', '这条河比那条路长。'),
        ('Wait a little longer, please.', '请再等一会儿。'),
    ],
    'thinner': [
        ('The book is thinner than the dictionary.', '这本书比词典薄。'),
        ('She looks thinner after running every day.', '每天跑步后她看起来更瘦。'),
        ('This rope is thinner but still strong.', '这根绳子更细但仍然结实。'),
    ],
    'heavier': [
        ('The bag is heavier than yesterday.', '这个包比昨天更重。'),
        ('An elephant is heavier than a horse.', '大象比马重。'),
        ('How many kilograms? It is five kilograms heavier.', '多少千克？它重了五千克。'),
    ],
    'bigger': [
        ('The dinosaur was bigger than a bus.', '恐龙比公共汽车还大。'),
        ('Our new hall is bigger than the old one.', '我们的新大厅比旧的大。'),
        ('Which box is bigger?', '哪个箱子更大？'),
    ],
    'smaller': [
        ('The mouse is smaller than the cat.', '老鼠比猫小。'),
        ('My shadow looks smaller at noon.', '中午我的影子看起来更小。'),
        ('Choose the smaller one, please.', '请选小一点的那个。'),
    ],
    'stronger': [
        ('He is stronger than he was last year.', '他比去年更强壮。'),
        ('Exercise makes you stronger.', '锻炼让你更强壮。'),
        ('The wind is stronger today.', '今天风更大。'),
    ],
    'dinosaur': [
        ('We saw a dinosaur model in the museum.', '我们在博物馆看到了恐龙模型。'),
        ('The dinosaur lived long ago.', '恐龙生活在很久以前。'),
        ('How tall was the dinosaur?', '那只恐龙有多高？'),
    ],
    'hall': [
        ('We measured the hall together.', '我们一起测量了大厅。'),
        ('The hall is four meters long.', '大厅长四米。'),
        ('Stand in the hall and compare your height.', '站在大厅里比一比身高。'),
    ],
    'meter': [
        ('The hall is one meter tall.', '大厅有一米高。'),
        ('Measure it with a meter stick.', '用米尺量一量。'),
        ('I am one meter and fifty centimeters tall.', '我身高一米五。'),
    ],
    'than': [
        ('I am taller than you.', '我比你高。'),
        ('She is smarter than her brother.', '她比她哥哥聪明。'),
        ('The dinosaur was bigger than a house.', '恐龙比房子还大。'),
    ],
    'both': [
        ('Both of them are taller than me.', '他们两个人都比我高。'),
        ('I like both the red and the blue shirt.', '红色和蓝色两件衬衫我都喜欢。'),
        ('We both measured our shadows.', '我们俩都量了影子。'),
    ],
    'kilogram': [
        ('The bag weighs one kilogram.', '这个包重一千克。'),
        ('Add one kilogram of rice, please.', '请再加一千克大米。'),
        ('How much is one kilogram?', '一千克是多少？'),
    ],
    'countryside': [
        ('My grandparents live in the countryside.', '我的祖父母住在乡村。'),
        ('The countryside is quiet and beautiful.', '乡村安静又美丽。'),
        ('We visited the countryside last summer.', '去年夏天我们去了乡下。'),
    ],
    'lower': [
        ('The sun is lower in the winter sky.', '冬天太阳在天空中更低。'),
        ('Your shadow is lower in the morning.', '早上你的影子更矮。'),
        ('Speak in a lower voice, please.', '请小声一点说话。'),
    ],
    'shadow': [
        ('My shadow is long in the evening.', '傍晚我的影子很长。'),
        ('Look at your shadow on the ground.', '看看地上你的影子。'),
        ('The tree cast a big shadow.', '树投下一大片影子。'),
    ],
    'smarter': [
        ('She is smarter than anyone in our group.', '她比我们组任何人都聪明。'),
        ('Reading makes you smarter.', '阅读让你更聪明。'),
        ('The smarter student answered first.', '更聪明的学生先回答了。'),
    ],
    'become': [
        ('Days become longer in spring.', '春天白天变长。'),
        ('He wants to become a scientist.', '他想成为一名科学家。'),
        ('It will become dark soon.', '天很快就要黑了。'),
    ],
    # Unit 2 · Last weekend
    'cleaned': [
        ('I cleaned my room last weekend.', '上周末我打扫了房间。'),
        ('She cleaned the windows yesterday.', '她昨天擦了窗户。'),
        ('We cleaned the classroom together.', '我们一起打扫了教室。'),
    ],
    'stayed': [
        ('I stayed at home last Sunday.', '上周日我待在家里。'),
        ('They stayed in a hotel for two nights.', '他们在旅馆住了两晚。'),
        ('I stayed with my grandparents.', '我和祖父母待在一起。'),
    ],
    'washed': [
        ('I washed my clothes yesterday.', '昨天我洗了衣服。'),
        ('She washed the dishes after dinner.', '晚饭后她洗了碗。'),
        ('He washed his face before breakfast.', '早饭前他洗了脸。'),
    ],
    'watched': [
        ('We watched a show on TV last night.', '昨晚我们在电视上看了一场演出。'),
        ('I watched a football game yesterday.', '昨天我看了一场足球赛。'),
        ('I watched the magazine programme.', '我看了那本杂志上的节目。'),
    ],
    'had': [
        ('I had a good time last weekend.', '上周末我玩得很开心。'),
        ('She had breakfast at seven.', '她七点钟吃了早饭。'),
        ('We had fun at the park.', '我们在公园玩得很开心。'),
    ],
    'had a cold': [
        ('I had a cold last week.', '上周我感冒了。'),
        ('He had a cold and stayed in bed.', '他感冒了，躺在床上。'),
        ('Did you have a cold yesterday?', '你昨天感冒了吗？'),
    ],
    'slept': [
        ('I slept for ten hours last night.', '昨晚我睡了十个小时。'),
        ('The baby slept all afternoon.', '宝宝整个下午都在睡觉。'),
        ('We slept early because we were tired.', '我们很累，睡得很早。'),
    ],
    'read': [
        ('I read a magazine yesterday.', '昨天我读了一本杂志。'),
        ('She read a story before bed.', '睡前她读了一个故事。'),
        ('Did you read the book last weekend?', '上周末你读那本书了吗？'),
    ],
    'saw': [
        ('I saw a film last Saturday.', '上周六我看了一场电影。'),
        ('We saw many stars in the sky.', '我们在天上看到了许多星星。'),
        ('I saw the show yesterday.', '我昨天看到了那场演出。'),
    ],
    'last': [
        ('Last weekend was very busy.', '上周末非常忙。'),
        ('I visited my aunt last Sunday.', '上周日我去看望了姑妈。'),
        ('What did you do last night?', '昨晚你做了什么？'),
    ],
    'yesterday': [
        ('I washed my clothes yesterday.', '昨天我洗了衣服。'),
        ('Yesterday was Monday.', '昨天是星期一。'),
        ('Did you enjoy the show yesterday?', '你昨天喜欢那场演出吗？'),
    ],
    'before': [
        ('Wash your hands before dinner.', '晚饭前洗手。'),
        ('I had never seen it before.', '我以前从没见过它。'),
        ('Read the magazine before you sleep.', '睡觉前读读杂志。'),
    ],
    'drank': [
        ('I drank some water after running.', '跑步后我喝了些水。'),
        ('She drank tea yesterday morning.', '昨天早上她喝了茶。'),
        ('We drank juice at the party.', '我们在聚会上喝了果汁。'),
    ],
    'show': [
        ('We watched a show on TV.', '我们在电视上看了一场演出。'),
        ('The school show was wonderful.', '学校的演出很精彩。'),
        ('Did you enjoy the show?', '你喜欢那场演出吗？'),
    ],
    'magazine': [
        ('I read an English magazine.', '我读了一本英语杂志。'),
        ('There are many pictures in the magazine.', '杂志里有很多图片。'),
        ('She bought a magazine yesterday.', '她昨天买了一本杂志。'),
    ],
    'better': [
        ('I feel better today.', '今天我感觉好多了。'),
        ('Your English is better than before.', '你的英语比以前更好了。'),
        ('Rest well and you will get better.', '好好休息就会好起来。'),
    ],
    'faster': [
        ('He runs faster than his friend.', '他跑得比朋友快。'),
        ('The cheetah runs faster than any animal.', '猎豹跑得比任何动物都快。'),
        ('Finish your homework faster, please.', '请快点完成作业。'),
    ],
    'hotel': [
        ('We stayed in a hotel last weekend.', '上周末我们住在一家旅馆。'),
        ('The hotel is near the beach.', '旅馆在海滩附近。'),
        ('They fixed the lamp in the hotel room.', '他们修好了旅馆房间里的灯。'),
    ],
    'fixed': [
        ('Dad fixed the broken lamp.', '爸爸修好了坏掉的灯。'),
        ('She fixed her bike yesterday.', '昨天她修好了自行车。'),
        ('I fixed this chair yesterday.', '昨天我修好了这把椅子。'),
    ],
    'broken': [
        ('The lamp is broken.', '灯坏了。'),
        ('My toy is broken.', '我的玩具坏了。'),
        ('We fixed the broken window.', '我们修好了破窗户。'),
    ],
    'lamp': [
        ('Turn on the lamp, please.', '请打开灯。'),
        ('The lamp in the hotel was broken.', '旅馆里的灯坏了。'),
        ('I read a magazine under the lamp.', '我在灯下读杂志。'),
    ],
    'loud': [
        ('The music is too loud.', '音乐太响了。'),
        ('Do not speak so loud in the library.', '别在图书馆这么大声说话。'),
        ('We heard a loud noise last night.', '昨晚我们听到一声巨响。'),
    ],
    'enjoy': [
        ('I enjoy reading magazines.', '我喜欢读杂志。'),
        ('Did you enjoy the show?', '你喜欢那场演出吗？'),
        ('We enjoy staying at the hotel.', '我们喜欢住在旅馆。'),
    ],
    'stay': [
        ('We stay at a hotel when we travel.', '旅行时我们住在旅馆。'),
        ('I want to stay here longer.', '我想在这里多待一会儿。'),
        ('Did you stay at home last weekend?', '上周末你待在家里吗？'),
    ],
    # Unit 3 · Holiday past tense
    'went': [
        ('We went to Turpan last summer.', '去年夏天我们去了吐鲁番。'),
        ('I went camping with my friends.', '我和朋友们去露营了。'),
        ('She went to the beach yesterday.', '她昨天去了海滩。'),
    ],
    'camp': [
        ('We camp by the river in summer.', '夏天我们在河边露营。'),
        ('They went to camp in the mountains.', '他们去山里露营了。'),
        ('We camp with friends in summer.', '夏天我们和朋友一起露营。'),
    ],
    'fish': [
        ('My grandpa likes to fish by the lake.', '我爷爷喜欢在湖边钓鱼。'),
        ('We fish early in the morning.', '我们清晨去钓鱼。'),
        ('Did you fish at the camp?', '你在营地钓鱼了吗？'),
    ],
    'went fishing': [
        ('We went fishing last Sunday.', '上周日我们去钓鱼了。'),
        ('He went fishing with his dad.', '他和爸爸去钓鱼了。'),
        ('They went fishing and caught three fish.', '他们去钓鱼，钓到了三条鱼。'),
    ],
    'went camping': [
        ('We went camping in the mountains last holiday.', '上个假期我们去山里野营了。'),
        ('They went camping by the lake with friends.', '他们和朋友在湖边野营。'),
        ('Last summer my class went camping for two days.', '去年夏天我们班去野营了两天。'),
    ],
    'rode': [
        ('I rode a mule in Turpan.', '我在吐鲁番骑了骡子。'),
        ('She rode a bike to the beach.', '她骑自行车去了海滩。'),
        ('We rode horses at the camp.', '我们在营地骑马了。'),
    ],
    'hurt': [
        ('I hurt my foot on the trip.', '旅行中我伤了脚。'),
        ('He hurt his leg when he fell.', '他摔倒时伤了腿。'),
        ('Does your hand hurt?', '你的手疼吗？'),
    ],
    'ate': [
        ('We ate fresh fruit in Turpan.', '我们在吐鲁番吃了新鲜水果。'),
        ('I ate lunch at the camp.', '我在营地吃了午饭。'),
        ('She ate grapes from the basket.', '她吃了篮子里的葡萄。'),
    ],
    'took': [
        ('I took many pictures at the beach.', '我在海滩拍了很多照片。'),
        ('We took a bus to Turpan.', '我们乘公共汽车去了吐鲁番。'),
        ('She took a gift for her friend.', '她给朋友带了一份礼物。'),
    ],
    'took pictures': [
        ('We took pictures of the mule.', '我们给骡子拍了照。'),
        ('I took pictures at the beach.', '我在海滩拍了照。'),
        ('They took pictures in Turpan.', '他们在吐鲁番拍了照。'),
    ],
    'bought': [
        ('I bought a gift for my mum.', '我给妈妈买了一份礼物。'),
        ('We bought fruit at the market.', '我们在市场买了水果。'),
        ('She bought a basket in Turpan.', '她在吐鲁番买了一个篮子。'),
    ],
    'gift': [
        ('This gift is for you.', '这份礼物是给你的。'),
        ('I bought a gift at the beach shop.', '我在海滩商店买了一份礼物。'),
        ('Thank you for the lovely gift.', '谢谢这份可爱的礼物。'),
    ],
    'fell': [
        ('I fell off the mule.', '我从骡子上摔下来了。'),
        ('He fell on the grass.', '他摔倒在草地上。'),
        ('I fell down on the grass.', '我摔倒在草地上。'),
    ],
    'off': [
        ('I fell off the bike.', '我从自行车上摔下来了。'),
        ('Take off your shoes before you camp.', '露营前脱掉鞋子。'),
        ('The hat fell off his head.', '帽子从他头上掉了下来。'),
    ],
    'mule': [
        ('I rode a mule in Turpan.', '我在吐鲁番骑了骡子。'),
        ('The mule walked slowly up the hill.', '骡子慢慢走上山坡。'),
        ('A mule is strong like a horse.', '骡子像马一样强壮。'),
    ],
    'Turpan': [
        ('Turpan is very hot in summer.', '吐鲁番夏天非常热。'),
        ('We went to Turpan on holiday.', '我们假期去了吐鲁番。'),
        ('Grapes from Turpan are sweet.', '吐鲁番的葡萄很甜。'),
    ],
    'could': [
        ('I could ride a bike when I was six.', '我六岁时就会骑自行车。'),
        ('We could see the beach from the hill.', '我们从山上能看到海滩。'),
        ('Could you help me with the basket?', '你能帮我拿一下篮子吗？'),
    ],
    'till': [
        ('We camped till Sunday.', '我们一直露营到星期天。'),
        ('Wait till I come back.', '等到我回来。'),
        ('I read till late at night.', '我读到深夜。'),
    ],
    'beach': [
        ('We played on the beach all day.', '我们在海滩上玩了一整天。'),
        ('The beach was sunny and warm.', '海滩上阳光充足，很温暖。'),
        ('I took pictures at the beach.', '我在海滩拍了照。'),
    ],
    'basket': [
        ('She carried a basket of grapes.', '她提着一篮葡萄。'),
        ('Put the gift in the basket.', '把礼物放进篮子里。'),
        ('We bought a woven basket in Turpan.', '我们在吐鲁番买了一个编织篮。'),
    ],
    'part': [
        ('I played a small part in the school show.', '我在学校演出里演了一个小角色。'),
        ('This is the best part of the trip.', '这是旅行中最精彩的部分。'),
        ('Everyone did their part well.', '每个人都把自己的角色演好了。'),
    ],
    'licked': [
        ('The dog licked my hand.', '狗舔了我的手。'),
        ('The mule licked the salt.', '骡子舔了盐。'),
        ('He licked the ice cream quickly.', '他很快舔完了冰淇淋。'),
    ],
    'laughed': [
        ('We laughed at the funny story.', '我们被有趣的故事逗笑了。'),
        ('Everyone laughed at the show.', '大家都被演出逗笑了。'),
        ('She laughed till she cried.', '她笑到流泪。'),
    ],
    # Unit 4 · School then vs now
    'dining hall': [
        ('We eat lunch in the dining hall.', '我们在食堂吃午饭。'),
        ('The dining hall is bigger than before.', '食堂比以前大了。'),
        ('There was no dining hall at school long ago.', '很久以前学校没有食堂。'),
    ],
    'grass': [
        ('There is green grass on the playground.', '操场上有绿草。'),
        ('We sat on the grass and talked.', '我们坐在草地上聊天。'),
        ('Do not walk on the grass.', '请勿践踏草坪。'),
    ],
    'gym': [
        ('We have PE class in the gym.', '我们在体育馆上体育课。'),
        ('The gym is on the first floor.', '体育馆在一楼。'),
        ('There was no gym at our school before.', '以前我们学校没有体育馆。'),
    ],
    'ago': [
        ('Long ago, there was no Internet at school.', '很久以前，学校没有网络。'),
        ('I met her two years ago.', '我两年前认识她。'),
        ('Life was different twenty years ago.', '二十年前生活不一样。'),
    ],
    'cycling': [
        ('Cycling is good exercise.', '骑自行车是很好的锻炼。'),
        ('I enjoy cycling after school.', '我喜欢放学后骑自行车。'),
        ('There was no cycling club long ago.', '很久以前没有自行车社团。'),
    ],
    'go cycling': [
        ('We go cycling on Sundays.', '我们星期天去骑自行车。'),
        ('Let us go cycling in the park.', '我们去公园骑自行车吧。'),
        ('He went cycling with his friends yesterday.', '昨天他和朋友去骑自行车了。'),
    ],
    'ice-skate': [
        ('I can ice-skate in winter.', '冬天我会滑冰。'),
        ('We ice-skate on the lake.', '我们在湖上滑冰。'),
        ('She learned to ice-skate last year.', '她去年学会了滑冰。'),
    ],
    'badminton': [
        ('We play badminton in the gym.', '我们在体育馆打羽毛球。'),
        ('Badminton is my favourite sport.', '羽毛球是我最喜欢的运动。'),
        ('There was no badminton class before.', '以前没有羽毛球课。'),
    ],
    'star': [
        ('There was no star player on the team before.', '以前队里没有明星队员。'),
        ('She is a star in our class.', '她是我们班的明星。'),
        ('We see a bright star at night.', '夜晚我们看到一颗明亮的星星。'),
    ],
    'easy': [
        ('The race was easy for him.', '比赛对他来说很容易。'),
        ('It is easy to use the Internet now.', '现在用互联网很容易。'),
        ('English is not easy, but I like it.', '英语不容易，但我喜欢。'),
    ],
    'look up': [
        ('Look up the word in your dictionary.', '在词典里查一下这个单词。'),
        ('I look up new words on the Internet.', '我在网上查阅生词。'),
        ('Can you look up this word for me?', '你能帮我查一下这个词吗？'),
    ],
    'Internet': [
        ('We use the Internet to study now.', '我们现在用互联网学习。'),
        ('There was no Internet at school long ago.', '很久以前学校没有互联网。'),
        ('The Internet makes life different.', '互联网让生活变得不同。'),
    ],
    'different': [
        ('School is different from before.', '学校和以前不同了。'),
        ('We live in a different time now.', '我们现在生活在不同的时代。'),
        ('My life feels different this year.', '今年我的生活感觉不一样了。'),
    ],
    'active': [
        ('She is very active in class.', '她在课堂上很活跃。'),
        ('Stay active and you will feel better.', '保持活跃你会感觉更好。'),
        ('We have more active sports now.', '我们现在有更多活跃的运动项目。'),
    ],
    'race': [
        ('We had a race on the playground.', '我们在操场上进行了赛跑。'),
        ('The cheetah won the race easily.', '猎豹轻松赢得了赛跑。'),
        ('Who won the race yesterday?', '昨天赛跑谁赢了？'),
    ],
    'nothing': [
        ('There was nothing on the grass before.', '以前草地上什么都没有。'),
        ('I thought about nothing but the dream.', '我只想着那个梦。'),
        ('Nothing is impossible if you try.', '只要努力，没有什么不可能。'),
    ],
    'thought': [
        ('I thought school was boring before.', '以前我觉得学校很无聊。'),
        ('She thought the race was easy.', '她觉得赛跑很容易。'),
        ('We thought life was different long ago.', '我们觉得很久以前生活不一样。'),
    ],
    'felt': [
        ('I felt happy after the race.', '赛跑后我感到很开心。'),
        ('He felt tired but active.', '他感到累但很活跃。'),
        ('We felt nothing could stop us.', '我们觉得没有什么能阻挡我们。'),
    ],
    'cheetah': [
        ('The cheetah runs faster than a lion.', '猎豹跑得比狮子快。'),
        ('I read about the cheetah in a magazine.', '我在杂志里读到了猎豹。'),
        ('The cheetah is the fastest animal on land.', '猎豹是陆地上跑得最快的动物。'),
    ],
    'trip': [
        ('Be careful! Do not trip on the grass.', '小心！别在草地上绊倒。'),
        ('I trip over a stone.', '我被石头绊了一下。'),
        ('Do not trip at the race.', '赛跑时别绊倒。'),
    ],
    'woke': [
        ('I woke up early this morning.', '今天早上我醒得很早。'),
        ('She woke from a strange dream.', '她从一场奇怪的梦里醒来。'),
        ('We woke before the sun rose.', '我们在日出前醒了。'),
    ],
    'dream': [
        ('I had a dream about the cheetah.', '我做了一个关于猎豹的梦。'),
        ('She woke up from a bad dream.', '她从噩梦中醒来。'),
        ('Follow your dream and stay active.', '追逐梦想，保持活跃。'),
    ],
}
