"""Textbook-aligned example sentences for 闽教版 Grade 5 English, Volume 2 (下册).

Each headword maps to 2–3 (english, chinese) tuples adapted to 闽教版五年级下册
单元话题与句型难度。由内容维护，不用 PDF 自动抽取。
"""

EXAMPLES: dict[str, list[tuple[str, str]]] = {
    # U1
    'was': [
        ('I was in China last summer.', '我去年夏天在中国。'),
        ('She was happy on the tour.', '她在旅行中很开心。'),
        ('It was a beautiful lake.', '那是一个很美的湖。'),
    ],
    'were': [
        ('We were at Sun Moon Lake.', '我们在日月潭。'),
        ('My parents were in my hometown.', '我父母在我的故乡。'),
        ('They were tired after the tour.', '旅行后他们很累。'),
    ],
    'China': [
        ('I went to China with my parent.', '我和家长一起去了中国。'),
        ('Sun Moon Lake is in China.', '日月潭在中国。'),
        ('We took a tour in China.', '我们在中国旅行。'),
    ],
    'went': [
        ('We went to Sun Moon Lake.', '我们去了日月潭。'),
        ('I went to my hometown.', '我回了故乡。'),
        ('They went on a tour in China.', '他们在中国旅行。'),
    ],
    'parent': [
        ('My parent took me to the lake.', '我的家长带我去湖边。'),
        ('I went to China with my parent.', '我和家长一起去了中国。'),
        ('My parent was on the tour with me.', '我的家长和我一起旅行。'),
    ],
    'hometown': [
        ('I went back to my hometown.', '我回了故乡。'),
        ('My hometown has a beautiful lake.', '我故乡有一个美丽的湖。'),
        ('We took a tour near my hometown.', '我们在故乡附近旅行。'),
    ],
    'took': [
        ('We took a tour to Sun Moon Lake.', '我们去日月潭旅行。'),
        ('My parent took many photos.', '我的家长拍了很多照片。'),
        ('I took a boat on the lake.', '我在湖上坐了船。'),
    ],
    'tour': [
        ('We had a tour in China.', '我们在中国旅行。'),
        ('The tour to Sun Moon Lake was fun.', '日月潭之旅很有趣。'),
        ('I went on a tour with my parent.', '我和家长一起旅行。'),
    ],
    'Sun Moon Lake': [
        ('Sun Moon Lake is in China.', '日月潭在中国。'),
        ('We went to Sun Moon Lake last summer.', '我们去年夏天去了日月潭。'),
        ('I swam near Sun Moon Lake.', '我在日月潭附近游泳。'),
    ],
    'lake': [
        ('The lake is very beautiful.', '这个湖非常美。'),
        ('We swam in the lake.', '我们在湖里游泳。'),
        ('Sun Moon Lake is a famous lake.', '日月潭是一个著名的湖。'),
    ],
    'did': [
        ('What did you do on the tour?', '旅行中你做了什么？'),
        ('I did my homework before the trip.', '出发前我做了作业。'),
        ('We did many fun things at the lake.', '我们在湖边做了很多有趣的事。'),
    ],
    'swam': [
        ('I swam in the lake.', '我在湖里游泳。'),
        ('We swam near Sun Moon Lake.', '我们在日月潭附近游泳。'),
        ('She swam with her parent.', '她和家长一起游泳。'),
    ],
    # U2
    'elephant': [
        ('Look at the elephant!', '看那头大象！'),
        ('The elephant is over there.', '大象在那边。'),
        ('We saw a big elephant at the zoo.', '我们在动物园看见一头大象。'),
    ],
    'map': [
        ('Look at the map of the zoo.', '看动物园的地图。'),
        ('The elephant is on the map.', '大象在地图上。'),
        ('We found the hill on the map.', '我们在地图上找到了小山。'),
    ],
    'over there': [
        ('The elephant is over there.', '大象在那边。'),
        ('Look! An animal is over there.', '看！那边有一只动物。'),
        ('The hill is over there, next to the lake.', '小山在那边，紧挨着湖。'),
    ],
    'hill': [
        ('There is a hill in the zoo.', '动物园里有一座小山。'),
        ('We climbed the small hill.', '我们爬了那座小山。'),
        ('The animal lives on the hill.', '动物住在小山上。'),
    ],
    'under': [
        ('The cat is under the tree.', '猫在树下面。'),
        ('We saw animals under the hill.', '我们在小山下面看见了动物。'),
        ('Put the map under the book.', '把地图放在书下面。'),
    ],
    'next to': [
        ('The hill is next to the lake.', '小山紧挨着湖。'),
        ('Sit next to me, please.', '请坐在我旁边。'),
        ('The elephant is next to the gate.', '大象紧挨着大门。'),
    ],
    'animal': [
        ('Look at the animal!', '看那只动物！'),
        ('We saw an animal at the zoo.', '我们在动物园看见很多动物。'),
        ('The elephant is a big animal.', '大象是一种大型动物。'),
    ],
    'saw': [
        ('We saw an elephant at the zoo.', '我们在动物园看见一头大象。'),
        ('I saw a hungry animal over there.', '我在那边看见一只饿的动物。'),
        ('She saw the hill on the map.', '她在地图上看见了小山。'),
    ],
    'hungry': [
        ('The animal is hungry.', '这只动物饿了。'),
        ('I am hungry. Can I eat?', '我饿了。我能吃吗？'),
        ('We were hungry after the tour.', '旅行后我们饿了。'),
    ],
    'ate': [
        ('We ate lunch at the zoo.', '我们在动物园吃了午饭。'),
        ('The elephant ate grass.', '大象吃了草。'),
        ('I ate an apple when I was hungry.', '我饿的时候吃了一个苹果。'),
    ],
    'any': [
        ('Do you have any food?', '你有任何食物吗？'),
        ('Are there any animals over there?', '那边有任何动物吗？'),
        ('I did not see any elephants.', '我没有看见任何大象。'),
    ],
    # U3
    'doctor': [
        ('The doctor is a hero.', '这位医生是英雄。'),
        ('Dr. Li is a good doctor.', '李医生是一位好医生。'),
        ('The doctor serves people every day.', '医生每天为人们服务。'),
    ],
    'search for': [
        ('We search for information about heroes.', '我们搜索关于英雄的信息。'),
        ('Search for Covid-19 news online.', '在网上搜索新冠相关消息。'),
        ('I search for my homework on the internet.', '我在网上查找作业资料。'),
    ],
    'information': [
        ('We need more information.', '我们需要更多信息。'),
        ('This information is about our heroes.', '这条信息是关于我们的英雄的。'),
        ('Search for information about Dr. Zhong.', '搜索关于钟博士的信息。'),
    ],
    'tired': [
        ('The doctors were very tired.', '医生们非常疲倦。'),
        ('I feel tired after work.', '工作后我感到疲倦。'),
        ('She is tired but still at work.', '她很累但仍然在工作。'),
    ],
    'fight': [
        ('Doctors fight Covid-19.', '医生与新冠病毒作斗争。'),
        ('Heroes fight for our country.', '英雄们为祖国战斗。'),
        ('We must fight hard together.', '我们必须一起努力斗争。'),
    ],
    'Covid-19': [
        ('Doctors fight Covid-19.', '医生与新冠病毒作斗争。'),
        ('We learn about Covid-19 at school.', '我们在学校了解新冠病毒。'),
        ('Many heroes helped during Covid-19.', '许多英雄在疫情期间提供了帮助。'),
    ],
    'love': [
        ('We love our heroes.', '我们爱我们的英雄。'),
        ('People love the doctors.', '人们爱这些医生。'),
        ('I love my country.', '我爱我的祖国。'),
    ],
    'people': [
        ('Many people love the heroes.', '许多人爱这些英雄。'),
        ('Doctors serve people.', '医生为人们服务。'),
        ('People clap for the medical team.', '人们为医疗队鼓掌。'),
    ],
    'hero': [
        ('The doctor is a hero.', '这位医生是英雄。'),
        ('We learn about a hero in class.', '我们在课上了解英雄。'),
        ('She is a hero of our time.', '她是我们的时代英雄。'),
    ],
    'award': [
        ('They award the hero a medal.', '他们授予英雄一枚勋章。'),
        ('The doctor got an award.', '这位医生获得了荣誉。'),
        ('She won an award for her work.', '她因工作获奖。'),
    ],
    'Medal of the Republic': [
        ('He got the Medal of the Republic.', '他获得了共和国勋章。'),
        ('The Medal of the Republic is a great honor.', '共和国勋章是极高的荣誉。'),
        ('We learn about the Medal of the Republic.', '我们了解共和国勋章。'),
    ],
    'honor': [
        ('It is a great honor.', '这是极大的荣誉。'),
        ('We honor our heroes.', '我们向英雄致敬。'),
        ('The medal is an honor for the doctor.', '这枚勋章是医生的荣誉。'),
    ],
    'Young Pioneer': [
        ('I am a Young Pioneer.', '我是一名少先队员。'),
        ('Young Pioneers learn from heroes.', '少先队员向英雄学习。'),
        ('Every Young Pioneer should work hard.', '每个少先队员都应该努力。'),
    ],
    'learn': [
        ('We learn from heroes.', '我们向英雄学习。'),
        ('I learn hard at school.', '我在学校努力学习。'),
        ('Young Pioneers learn to serve people.', '少先队员学习为人民服务。'),
    ],
    'hard': [
        ('Doctors work hard.', '医生工作很努力。'),
        ('We must learn hard.', '我们必须努力学习。'),
        ('She fights hard against Covid-19.', '她与新冠病毒顽强斗争。'),
    ],
    'serve': [
        ('Doctors serve people.', '医生为人民服务。'),
        ('Heroes serve our country.', '英雄们为祖国服务。'),
        ('I want to serve people when I grow up.', '我长大后想为人民服务。'),
    ],
    'grow up': [
        ('I want to be a doctor when I grow up.', '我长大后想当医生。'),
        ('Heroes grow up and serve people.', '英雄们长大为人民服务。'),
        ('What do you want to do when you grow up?', '你长大后想做什么？'),
    ],
    'Dr.': [
        ('Dr. Li is a hero.', '李博士是一位英雄。'),
        ('We thank Dr. Zhong.', '我们感谢钟博士。'),
        ('Dr. Wang is still at work.', '王医生仍然在工作。'),
    ],
    'still': [
        ('She is tired but still at work.', '她很累但仍然在工作。'),
        ('The doctor is still in the hospital.', '医生仍在医院。'),
        ('We still love our heroes.', '我们仍然爱我们的英雄。'),
    ],
    'wife': [
        ('The hero and his wife serve people.', '英雄和他的妻子为人民服务。'),
        ('Dr. Li and his wife are both doctors.', '李医生和他的妻子都是医生。'),
        ('His wife is a member of the team.', '他的妻子是团队成员。'),
    ],
    'member': [
        ('She is a member of the team.', '她是团队成员。'),
        ('Every member works hard.', '每个成员都很努力。'),
        ('He is a member of the medical team.', '他是医疗队成员。'),
    ],
    'women': [
        ('Many women are heroes.', '许多妇女是英雄。'),
        ('Women doctors fight Covid-19.', '女医生与新冠病毒作斗争。'),
        ('We honor women heroes.', '我们向女英雄致敬。'),
    ],
    'team': [
        ('The medical team is a hero team.', '医疗队是英雄团队。'),
        ('Every team member works hard.', '每个队员都很努力。'),
        ('Our team won an award.', '我们的团队获奖了。'),
    ],
    # U4
    'spring outing': [
        ('We had a spring outing yesterday.', '我们昨天去春游了。'),
        ('Our spring outing was fun.', '我们的春游很有趣。'),
        ('We climb mountains on the spring outing.', '春游时我们爬山。'),
    ],
    'climb': [
        ('We climb the mountain.', '我们爬山。'),
        ('Can you climb to the top?', '你能爬到顶部吗？'),
        ('I climb the hill on the spring outing.', '春游时我爬小山。'),
    ],
    'mountain': [
        ('The mountain is very high.', '这座山很高。'),
        ('We climb the mountain together.', '我们一起爬山。'),
        ('There are clouds on the mountain top.', '山顶有云。'),
    ],
    'water': [
        ('I need some water.', '我需要一些水。'),
        ('We drink water on the mountain.', '我们在山上喝水。'),
        ('The lake has clean water.', '湖里有干净的水。'),
    ],
    'thirsty': [
        ('I am thirsty after climbing.', '爬山后我渴了。'),
        ('We were thirsty on the mountain.', '我们在山上渴了。'),
        ('Drink water when you are thirsty.', '渴了就喝水。'),
    ],
    'camera': [
        ('I took my camera on the spring outing.', '春游我带了照相机。'),
        ('Take a photo with the camera.', '用照相机拍张照片。'),
        ('She has a new camera.', '她有一台新照相机。'),
    ],
    'sky': [
        ('The sky is blue today.', '今天天空是蓝色的。'),
        ('Look at the clouds in the sky.', '看天空中的云。'),
        ('The sky is beautiful on the mountain.', '山上的天空很美。'),
    ],
    'cloud': [
        ('There is a white cloud in the sky.', '天空中有一朵白云。'),
        ('A cloud is on the mountain top.', '山顶有云。'),
        ('Look at the cloud over there.', '看那边的那朵云。'),
    ],
    'get on': [
        ('We get on the bus at the gate.', '我们在大门处上车。'),
        ('Get on the bus, please.', '请上车。'),
        ('We get on the bus for our spring outing.', '我们上车去春游。'),
    ],
    'gate': [
        ('We meet at the school gate.', '我们在校门口见面。'),
        ('Get on the bus at the gate.', '在大门处上车。'),
        ('The gate of the village is open.', '村口的大门开着。'),
    ],
    'pick': [
        ('We pick flowers in the village.', '我们在村里采花。'),
        ('Pick an apple from the tree.', '从树上摘一个苹果。'),
        ('Do not pick flowers in the park.', '不要在公园里摘花。'),
    ],
    'village': [
        ('We visit a small village.', '我们参观一个小村庄。'),
        ('The village is near the mountain.', '村庄在山附近。'),
        ('There is a farmhouse in the village.', '村里有一间农舍。'),
    ],
    'hard-working': [
        ('The farmers are hard-working.', '农民们很努力。'),
        ('She is a hard-working student.', '她是一名努力的学生。'),
        ('Hard-working people grow good food.', '勤劳的人们种出好粮食。'),
    ],
    'top': [
        ('We climb to the top of the mountain.', '我们爬到山顶。'),
        ('The view from the top is great.', '从顶部看风景很棒。'),
        ('Clouds are on the top of the hill.', '山顶有云。'),
    ],
    'farmhouse': [
        ('We eat a meal at the farmhouse.', '我们在农舍吃了一顿饭。'),
        ('The farmhouse is in the village.', '农舍在村里。'),
        ('The hard-working family lives in the farmhouse.', '这户勤劳的人家住在农舍里。'),
    ],
    'really': [
        ('The spring outing was really fun.', '春游真的很有趣。'),
        ('I am really thirsty.', '我真的渴了。'),
        ('The mountain is really high.', '这座山真的很高。'),
    ],
    'meal': [
        ('We had a big meal at the farmhouse.', '我们在农舍吃了一顿大餐。'),
        ('The meal was really good.', '这顿饭真的很好。'),
        ('We eat a meal after climbing.', '爬山后我们吃了一顿饭。'),
    ],
    # U5
    'Sports Day': [
        ('Today is our Sports Day.', '今天是我们的运动会。'),
        ('We have races on Sports Day.', '运动会上我们有赛跑。'),
        ('Sports Day is busy and fun.', '运动会忙碌又有趣。'),
    ],
    'meter': [
        ('The race is one hundred meter long.', '赛跑是一百米。'),
        ('He ran fifty meter fast.', '他快跑五十米。'),
        ('The long jump is three meter.', '跳远跳了三米。'),
    ],
    'fast': [
        ('Run fast!', '快跑！'),
        ('He runs very fast.', '他跑得很快。'),
        ('She is fast in the race.', '她在赛跑中很快。'),
    ],
    'long jump': [
        ('I try the long jump.', '我尝试跳远。'),
        ('She is good at the long jump.', '她擅长跳远。'),
        ('The long jump is on Sports Day.', '运动会有跳远项目。'),
    ],
    'try': [
        ('Try the high jump!', '试试跳高！'),
        ('I try my best on Sports Day.', '运动会上我尽力而为。'),
        ('Try again if you fall down.', '摔倒了就再试一次。'),
    ],
    'high jump': [
        ('He tries the high jump.', '他尝试跳高。'),
        ('The high jump is difficult.', '跳高很难。'),
        ('We shout for the high jump.', '我们为跳高喊加油。'),
    ],
    'shout': [
        ('We shout for our team.', '我们为自己的队喊加油。'),
        ('Do not shout in class.', '不要在课堂上喊叫。'),
        ('They shout "Go! Go!" on Sports Day.', '运动会上他们喊"加油！加油！"'),
    ],
    'proud': [
        ('I am proud of our team.', '我为我们的队感到自豪。'),
        ('My parent is proud of me.', '我的家长为我感到骄傲。'),
        ('We are proud of the winner.', '我们为获胜者感到自豪。'),
    ],
    'fall down': [
        ('Be careful! Do not fall down.', '小心！别摔倒。'),
        ('He fell down but got up.', '他摔倒了但站了起来。'),
        ('Try again if you fall down.', '摔倒了就再试一次。'),
    ],
    'well': [
        ('She jumps very well.', '她跳得很好。'),
        ('You did well on Sports Day.', '你在运动会上表现得很好。'),
        ('He runs fast and well.', '他跑得又快又好。'),
    ],
    'busy': [
        ('Sports Day is very busy.', '运动会非常忙碌。'),
        ('We are busy on Sports Day.', '运动会那天我们很忙。'),
        ('The teachers are busy today.', '老师们今天很忙。'),
    ],
    'ran': [
        ('I ran fast in the race.', '我在赛跑中跑得很快。'),
        ('He ran one hundred meters.', '他跑了一百米。'),
        ('We ran on the grass.', '我们在草地上跑。'),
    ],
    'grass': [
        ('We ran on the grass.', '我们在草地上跑。'),
        ('Sit on the grass, please.', '请坐在草地上。'),
        ('The grass is green on Sports Day.', '运动会那天草是绿的。'),
    ],
    # U6
    'race': [
        ('The race starts now.', '赛跑现在开始了。'),
        ('I am in the race.', '我参加了赛跑。'),
        ('Who won the race?', '谁赢了赛跑？'),
    ],
    'first': [
        ('She came first in the race.', '她在赛跑中获得第一。'),
        ('I was first on Sports Day.', '运动会上我是第一。'),
        ('First place is great!', '第一名太棒了！'),
    ],
    'second': [
        ('He came second in the race.', '他在赛跑中获得第二。'),
        ('Second is also good.', '第二也很好。'),
        ('She was second on Sports Day.', '运动会上她是第二。'),
    ],
    'third': [
        ('Our team came third.', '我们的队获得第三。'),
        ('Third place is not bad.', '第三名也不错。'),
        ('He finished third in the race.', '他在赛跑中获得第三。'),
    ],
    'drink': [
        ('Drink some water after the race.', '赛跑后喝点水。'),
        ('I drink water when I am thirsty.', '我渴了就喝水。'),
        ('Do not drink too fast.', '别喝太快。'),
    ],
    'sad': [
        ('He is sad because he lost the race.', '他因为输了赛跑而难过。'),
        ('Do not be sad.', '别难过。'),
        ('She looks sad today.', '她今天看起来很难过。'),
    ],
    'cheer up': [
        ('Cheer up! You did well.', '振作起来！你表现得很好。'),
        ('Cheer up! Try again next time.', '振作起来！下次再试。'),
        ('We cheer up our sad friend.', '我们让难过的好友振作起来。'),
    ],
    'only': [
        ('I only came fourth.', '我只获得第四。'),
        ('She is only a little sad.', '她只是有点难过。'),
        ('We have only one race left.', '我们只剩一场赛跑了。'),
    ],
    'fourth': [
        ('He came fourth in the race.', '他在赛跑中获得第四。'),
        ('Fourth is still good.', '第四仍然不错。'),
        ('I was fourth on Sports Day.', '运动会上我是第四。'),
    ],
    'angry': [
        ('Do not be angry.', '别生气。'),
        ('He is angry about the race.', '他对赛跑结果很生气。'),
        ('She looks angry but not sad.', '她看起来生气但并不难过。'),
    ],
    'program': [
        ('The program is on TV tonight.', '今晚电视有这个节目。'),
        ('We watch a program after dinner.', '晚饭后我们看节目。'),
        ('The Sports Day program is fun.', '运动会节目很有趣。'),
    ],
    # U7
    'building': [
        ('Our school building is tall.', '我们的教学楼很高。'),
        ('The building has twelve floors.', '这栋建筑物有十二层。'),
        ('There is a bridge near the building.', '建筑物附近有一座桥。'),
    ],
    'floor': [
        ('Our classroom is on the third floor.', '我们的教室在三楼。'),
        ('Which floor is the living room on?', '客厅在几楼？'),
        ('The building has one floor for our class.', '这栋建筑物有十五层。'),
    ],
    'twelfth': [
        ('My classroom is on the twelfth floor.', '我的教室在第十二层。'),
        ('Twelfth is after eleventh.', '第十二在第十一之后。'),
        ('The twelfth floor has a big window.', '第十二层有一扇大窗。'),
    ],
    'would': [
        ('I would like to visit the river.', '我想去参观那条河。'),
        ('Would you like to see the bridge?', '你想看看那座桥吗？'),
        ('We would like to meet our neighbor.', '我们想见见邻居。'),
    ],
    'living room': [
        ('We watch TV in the living room.', '我们在客厅看电视。'),
        ('The living room is on the second floor.', '客厅在二楼。'),
        ('My grandmother sits in the living room.', '我祖母坐在客厅里。'),
    ],
    'bridge': [
        ('There is a bridge over the river.', '河上有一座桥。'),
        ('We walk on the bridge.', '我们在桥上走。'),
        ('The bridge is near our building.', '桥在我们建筑物附近。'),
    ],
    'also': [
        ('My grandfather also lives here.', '我祖父也住在这里。'),
        ('We also visit our neighbor.', '我们也拜访邻居。'),
        ('She is on the twelfth floor and also on the fifteenth.', '她在第十二层，也在第十五层。'),
    ],
    'fifteenth': [
        ('The fifteenth floor is very high.', '第十五层很高。'),
        ('Fifteenth comes after fourteenth.', '第十五在第十四之后。'),
        ('Our neighbor lives on the fifteenth floor.', '我们的邻居住在第十五层。'),
    ],
    'neighbor': [
        ('Our neighbor is very kind.', '我们的邻居很友好。'),
        ('I visit my neighbor after school.', '放学后我去拜访邻居。'),
        ('The neighbor lives on the fifteenth floor.', '邻居住在第十五层。'),
    ],
    'river': [
        ('There is a river near our building.', '我们建筑物附近有一条河。'),
        ('We walk by the river.', '我们沿着河走。'),
        ('The bridge is over the river.', '桥在河上方。'),
    ],
    'grandmother': [
        ('My grandmother lives with us.', '我祖母和我们住在一起。'),
        ('Grandmother sits in the living room.', '祖母坐在客厅里。'),
        ('I love my grandmother.', '我爱我的祖母。'),
    ],
    'grandfather': [
        ('My grandfather also lives here.', '我祖父也住在这里。'),
        ('Grandfather walks on the bridge.', '祖父在桥上散步。'),
        ('I visit my grandfather every week.', '我每周看望祖父。'),
    ],
    # U8
    'date': [
        ('What is the date today?', '今天是什么日期？'),
        ('Write the date on your book.', '把日期写在你的书上。'),
        ('The date is on the calendar.', '日期在日历上。'),
    ],
    'lucky': [
        ('You are lucky today!', '你今天很幸运！'),
        ('I feel lucky on my birthday.', '生日那天我感到很幸运。'),
        ('Guess my lucky number!', '猜猜我的幸运数字！'),
    ],
    'guess': [
        ('Guess the date!', '猜猜日期！'),
        ('Can you guess the answer?', '你能猜出答案吗？'),
        ('Guess what is on the calendar.', '猜猜日历上是什么。'),
    ],
    'difficult': [
        ('This question is difficult.', '这个问题很难。'),
        ('It is difficult to guess the date.', '猜日期很难。'),
        ('Math is difficult for me.', '数学对我来说很难。'),
    ],
    'calendar': [
        ('Look at the calendar.', '看日历。'),
        ('The date is on the calendar.', '日期在日历上。'),
        ('Circle the date on the calendar.', '在日历上圈出日期。'),
    ],
    'before': [
        ('Wash your hands before dinner.', '晚饭前洗手。'),
        ('Before Sports Day, we practice hard.', '运动会前我们努力练习。'),
        ('Guess before you look at the calendar.', '看日历之前先猜一猜。'),
    ],
    'Mrs.': [
        ('Good morning, Mrs. Wang!', '早上好，王太太！'),
        ('Mrs. Li is our neighbor.', '李夫人是我们的邻居。'),
        ('Say hello to Mrs. Chen.', '向陈太太问好。'),
    ],
}
