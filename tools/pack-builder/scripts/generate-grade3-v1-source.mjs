import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const packId = 'en-grade3-v1-rj';
const outputDir = join(process.cwd(), 'tools', 'pack-builder', 'source', packId);
const rows = `
name|名字|I know your name.
nice|令人愉快的；友好的|You are nice.
ear|耳朵|Touch your ear.
hand|手|Wave your hand.
eye|眼睛|Look into my eyes.
mouth|嘴|Point to your mouth.
arm|胳膊|Wave your arm.
can|可以|I can help you.
share|分享|We share our toys.
smile|微笑；笑|Please smile.
listen|听；倾听|Listen to me.
help|帮助|I can help you.
say|说；讲|Say hello.
friend|朋友|She is my friend.
good|好的|You are a good friend.
mum|妈妈|This is my mum.
dad|爸爸；爹爹|This is my dad.
grandma|奶奶；姥姥|My grandma is kind.
grandpa|爷爷；姥爷|My grandpa is kind.
grandfather|祖父；爷爷；姥爷；外公|My grandfather is here.
grandmother|祖母；奶奶；姥姥；外婆|My grandmother is here.
mother|母亲；妈妈|This is my mother.
father|父亲；爸爸|This is my father.
me|我|Look at me.
sister|姐；妹|This is my sister.
family|家；家庭|I love my family.
have|有|I have a book.
big|大的|It is a big family.
cousin|堂（表）兄弟；堂（表）姐妹|My cousin is here.
brother|哥；弟|This is my brother.
baby|婴儿|The baby is small.
uncle|伯父；叔父；舅父；姑父|This is my uncle.
aunt|伯母；婶母；舅母；姑母；姨母|This is my aunt.
small|小的|The baby is small.
like|喜欢|I like my pet.
dog|狗|I like my dog.
pet|宠物|This is my pet.
cat|猫|The cat is cute.
fish|鱼；鱼肉|I see a fish.
bird|鸟|The bird can fly.
rabbit|兔|The rabbit is cute.
go|去；走|Let us go.
zoo|动物园|We go to the zoo.
fox|狐狸|The fox is fast.
Miss|对女教师的称呼；老师；女士|Miss White is kind.
panda|大熊猫|The panda is cute.
red panda|小熊猫|I see a red panda.
cute|可爱的|The monkey is cute.
monkey|猴子|The monkey can jump.
tiger|老虎|The tiger is big.
elephant|大象|The elephant is big.
lion|狮子|The lion is strong.
animal|动物|A dog is an animal.
giraffe|长颈鹿|The giraffe is tall.
tall|高的|The giraffe is tall.
fast|快的|The fox is fast.
apple|苹果|I eat an apple.
banana|香蕉|I like a banana.
farm|农场|This is a farm.
air|空气|Plants give us air.
orange|橙子；柑橘|I eat an orange.
grape|葡萄|I like grapes.
school|学校|I go to school.
garden|花园|This is a garden.
need|需要|Plants need water.
water|给……浇水；水|I water the plant.
flower|花；花朵|The flower is beautiful.
grass|草；草地|The grass is green.
plant|种植；植物|I see a plant.
new|新的|This is my new book.
tree|树|The tree is tall.
sun|阳光；太阳|Plants need the sun.
give|给|Plants give us air.
them|它们；他们；她们|I can help them.
colour|颜色|What colour is it?
green|绿色；绿色的|The grass is green.
red|红色；红色的|The apple is red.
blue|蓝色；蓝色的|The sky is blue.
make|使出现；做|Colours make a rainbow.
purple|紫色；紫色的|The flower is purple.
brown|棕色；棕色的|The bear is brown.
bear|熊|The bear is big.
yellow|黄色；黄色的|The sun is yellow.
duck|鸭|The duck can swim.
sea|海；海洋|I see the sea.
some|一些|I have some apples.
pink|粉色；粉色的|The flower is pink.
draw|画|I can draw a tree.
white|白色；白色的|The cloud is white.
black|黑色；黑色的|The cat is black.
old|多少岁；年纪；旧的|How old are you?
five|五|I am five years old.
year|年纪；年|I am five years old.
one|一|I have one book.
two|二|I have two books.
three|三|I see three birds.
four|四|I see four fish.
ten|十|I can count to ten.
six|六|I see six apples.
seven|七|I see seven ducks.
eight|八|I see eight flowers.
nine|九|I see nine trees.
o'clock|（表示整点）……点钟|It is three o'clock.
cut|切块|Cut the cake.
eat|吃|I eat cake.
cake|蛋糕|I like cake.
What's your name?|你叫什么名字？|What's your name?
Nice to meet you.|很高兴见到你。|Nice to meet you.
Let's play a game.|我们一起玩游戏吧。|Let's play a game.
This is my family.|这是我的家人。|This is my family.
How old are you?|你几岁？|How old are you?
I like animals.|我喜欢动物。|I like animals.
`.trim().split('\n').map((line) => {
  const [headword, zh, exampleEn] = line.split('|');
  return { headword, zh, exampleEn, kind: headword.includes(' ') || headword.includes('?') || headword.endsWith('.') ? 'phrase' : 'word' };
});

const ipa = new Map(Object.entries({
  name:'/neɪm/', nice:'/naɪs/', ear:'/ɪr/', hand:'/hænd/', eye:'/aɪ/', mouth:'/maʊθ/', arm:'/ɑr m/', can:'/kæn/', share:'/ʃer/', smile:'/smaɪl/', listen:'/ˈlɪsən/', help:'/help/', say:'/seɪ/', friend:'/frend/', good:'/ɡʊd/', mum:'/mʌm/', dad:'/dæd/', grandma:'/ˈɡrænˌmɑ/', grandpa:'/ˈɡrænˌpɑ/', grandfather:'/ˈɡrænˌfɑðər/', grandmother:'/ˈɡrænˌmʌðər/', mother:'/ˈmʌðər/', father:'/ˈfɑðər/', me:'/miː/', sister:'/ˈsɪstər/', family:'/ˈfæməli/', have:'/hæv/', big:'/bɪɡ/', cousin:'/ˈkʌzən/', brother:'/ˈbrʌðər/', baby:'/ˈbeɪbi/', uncle:'/ˈʌŋkəl/', aunt:'/ænt/', small:'/smɔl/', like:'/laɪk/', dog:'/dɔɡ/', pet:'/pet/', cat:'/kæt/', fish:'/fɪʃ/', bird:'/bɜrd/', rabbit:'/ˈræbɪt/', go:'/ɡoʊ/', zoo:'/zuː/', fox:'/fɑks/', Miss:'/mɪs/', panda:'/ˈpændə/', 'red panda':'/red ˈpændə/', cute:'/kjuːt/', monkey:'/ˈmʌŋki/', tiger:'/ˈtaɪɡər/', elephant:'/ˈeləfənt/', lion:'/ˈlaɪən/', animal:'/ˈænəməl/', giraffe:'/dʒəˈræf/', tall:'/tɔl/', fast:'/fæst/', apple:'/ˈæpəl/', banana:'/bəˈnænə/', farm:'/fɑrm/', air:'/er/', orange:'/ˈɔrɪndʒ/', grape:'/ɡreɪp/', school:'/skuːl/', garden:'/ˈɡɑrdən/', need:'/niːd/', water:'/ˈwɔtər/', flower:'/ˈflaʊər/', grass:'/ɡræs/', plant:'/plænt/', new:'/nuː/', tree:'/triː/', sun:'/sʌn/', give:'/ɡɪv/', them:'/ðəm/', colour:'/ˈkʌlər/', green:'/ɡriːn/', red:'/red/', blue:'/bluː/', make:'/meɪk/', purple:'/ˈpɜrpəl/', brown:'/braʊn/', bear:'/ber/', yellow:'/ˈjeloʊ/', duck:'/dʌk/', sea:'/siː/', some:'/sʌm/', pink:'/pɪŋk/', draw:'/drɔ/', white:'/waɪt/', black:'/blæk/', old:'/oʊld/', five:'/faɪv/', year:'/jɪr/', one:'/wʌn/', two:'/tuː/', three:'/θriː/', four:'/fɔr/', ten:'/ten/', six:'/sɪks/', seven:'/ˈsevən/', eight:'/eɪt/', nine:'/naɪn/', "o'clock":'/əˈklɑk/', cut:'/kʌt/', eat:'/iːt/', cake:'/keɪk/', "What's your name?":'/wʌts jʊr neɪm/', 'Nice to meet you.':'/naɪs tə miːt juː/', "Let's play a game.":'/lets pleɪ ə ɡeɪm/', 'This is my family.':'/ðɪs ɪz maɪ ˈfæməli/', 'How old are you?':'/haʊ oʊld ɑr juː/', 'I like animals.':'/aɪ laɪk ˈænəməlz/'
}));
ipa.set('arm', '/ɑrm/');
const extraExamples = {
  name: [['Nice to meet you.', '很高兴见到你。']], can: [['Can you help me?', '你能帮助我吗？'], ['I can listen.', '我会倾听。']], friend: [['Nice to meet you, my new friend.', '很高兴见到你，我的新朋友。']], family: [['My family and I are happy.', '我和我的家人很开心。']], have: [['I have a big family.', '我有一个大家庭。']], like: [['I like my animal friends.', '我喜欢我的动物朋友。']], dog: [['A dog says “woof”.', '狗发出“汪汪”声。']], cat: [['A cat says “meow”.', '猫发出“喵喵”声。']], zoo: [['Let’s go to the zoo.', '我们去动物园吧。']], panda: [['The red panda is cute.', '小熊猫很可爱。']], plant: [['I can water my plants.', '我会给我的植物浇水。'], ['Plants can help me grow.', '植物能帮助我成长。']], water: [['Plants need water.', '植物需要水。']], colour: [['What colour is it?', '它是什么颜色？'], ['Colours from the rainbow can show feelings.', '彩虹的颜色可以表达情感。']], red: [['Red and yellow make green.', '红色和黄色混合成绿色。']], old: [['How old are you, my friend?', '我的朋友，你几岁？']], five: [['I can count up from one to ten.', '我可以从一数到十。']], cut: [['Cut the cake.', '切蛋糕。']]
};
const inflections = new Map(Object.entries({ name:'复数 names', hand:'复数 hands', eye:'复数 eyes', ear:'复数 ears', mouth:'复数 mouths', arm:'复数 arms', friend:'复数 friends', mum:'复数 mums', dad:'复数 dads', grandma:'复数 grandmas', grandpa:'复数 grandpas', mother:'复数 mothers', father:'复数 fathers', sister:'复数 sisters', family:'复数 families', have:'第三人称单数 has', cousin:'复数 cousins', brother:'复数 brothers', baby:'复数 babies', uncle:'复数 uncles', aunt:'复数 aunts', dog:'复数 dogs', pet:'复数 pets', cat:'复数 cats', fish:'复数 fish（形式不变）', bird:'复数 birds', rabbit:'复数 rabbits', go:'第三人称单数 goes', zoo:'复数 zoos', fox:'复数 foxes', panda:'复数 pandas', monkey:'复数 monkeys', tiger:'复数 tigers', elephant:'复数 elephants', lion:'复数 lions', animal:'复数 animals', giraffe:'复数 giraffes', apple:'复数 apples', banana:'复数 bananas', orange:'复数 oranges', grape:'复数 grapes', school:'复数 schools', garden:'复数 gardens', flower:'复数 flowers', plant:'复数 plants', tree:'复数 trees', give:'第三人称单数 gives', colour:'复数 colours', make:'第三人称单数 makes', bear:'复数 bears', duck:'复数 ducks', draw:'第三人称单数 draws', cut:'第三人称单数 cuts', eat:'第三人称单数 eats', cake:'复数 cakes' }));
const adjectives = new Set(['nice', 'good', 'big', 'small', 'cute', 'tall', 'fast', 'new', 'green', 'red', 'blue', 'purple', 'brown', 'yellow', 'pink', 'white', 'black', 'old']);
const verbs = new Set(['share', 'smile', 'listen', 'help', 'say', 'have', 'like', 'go', 'need', 'water', 'give', 'make', 'draw', 'cut', 'eat']);
const numberWords = new Set(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
const noExtraExample = new Set(['ear', 'eye', 'mouth', 'arm', 'can', 'me', 'them', 'some', "o'clock", 'year']);
const rootMnemonics = new Map(Object.entries({
  grandfather: '拆词联想：grand 表示祖辈的，father 是爸爸，grandfather 就是爷爷或外公。',
  grandmother: '拆词联想：grand 表示祖辈的，mother 是妈妈，grandmother 就是奶奶或外婆。',
  'red panda': '拆词联想：red 是红色，panda 是熊猫，red panda 就是小熊猫。',
}));
const soundMnemonics = new Map(Object.entries({
  nice: '谐音联想：nice 读起来像“奈斯”，夸别人“真不错”。',
  eye: '谐音联想：eye 读起来像字母 I，也可以联想到“爱”要用眼睛看。',
  ear: '谐音联想：ear 读起来像“耳”，ear 就是耳朵。',
  two: '谐音联想：two 读起来像“兔”，可以想成两只兔子。',
  four: '谐音联想：four 读起来像“佛”，想象四个小和尚。',
}));
const soundMnemonicsExtra = new Map(Object.entries({
  name:'谐音联想：name 像“内姆”，想象第一次见面先问名字。', hand:'谐音联想：hand 像“汉德”，汉德伸出手和朋友打招呼。', arm:'谐音联想：arm 像“阿姆”，阿姆挥动胳膊说 Hello。', can:'谐音联想：can 像“看”，想一看就能做到，can 表示可以。', share:'谐音联想：share 像“谢尔”，谢尔把玩具分给朋友分享。', smile:'谐音联想：smile 像“斯迈尔”，斯迈尔总是笑着。', listen:'谐音联想：listen 像“立身”，先站好、安静下来再倾听。', help:'谐音联想：help 像“嗨lp”，遇到困难喊 help 求助。', say:'谐音联想：say 像“谁”，先说 Hello 再问“谁是你的朋友”。', friend:'谐音联想：friend 像“弗伦德”，弗伦德就是一起玩的朋友。', good:'谐音联想：good 像“顾得”，顾得把事情做得很好。', mum:'谐音联想：mum 像“妈妈的 mum”，看到妈妈就想起 mum。', dad:'谐音联想：dad 像“爸爸的 dad”，看到爸爸就想起 dad。', me:'谐音联想：me 像“米”，我吃米饭，所以 me 是我。', have:'谐音联想：have 像“哈夫”，哈夫有一本书，have 表示有。', big:'谐音联想：big 像“比格”，想象一只比格犬长得很大。', cousin:'谐音联想：cousin 像“靠心”，堂表兄弟姐妹之间要互相关心。', baby:'谐音联想：baby 像“贝比”，贝比是一个可爱的小婴儿。', uncle:'谐音联想：uncle 像“安口”，安口叔叔正在门口等你。', aunt:'谐音联想：aunt 像“安特”，安特阿姨给你一个拥抱。', small:'谐音联想：small 像“思猫”，想象一只小猫小小的。', like:'谐音联想：like 像“莱克”，莱克喜欢动物朋友。', dog:'谐音联想：dog 像“逗个”，逗逗小狗，它就开心地摇尾巴。', pet:'谐音联想：pet 像“佩特”，佩特抱着自己的宠物。', cat:'谐音联想：cat 像“凯特”，凯特家的小猫喵喵叫。', fish:'谐音联想：fish 像“飞时”，鱼儿在水里游得像飞一样。', bird:'谐音联想：bird 像“伯德”，伯德看见小鸟飞过天空。', rabbit:'谐音联想：rabbit 像“拉比特”，拉比特是一只竖着长耳朵的兔子。', go:'谐音联想：go 像“够”，准备好了就说 go，出发吧。', zoo:'谐音联想：zoo 像“租”，租一辆车去动物园。', fox:'谐音联想：fox 像“福克斯”，福克斯是一只跑得很快的狐狸。', Miss:'谐音联想：Miss 像“miss”，想念老师时就会想到 Miss。', panda:'谐音联想：panda 像“胖达”，胖达就是圆滚滚的大熊猫。', cute:'谐音联想：cute 像“Q特”，Q特的小动物特别可爱。', monkey:'谐音联想：monkey 像“忙key”，猴子忙着找 key，monkey 是猴子。', tiger:'谐音联想：tiger 像“泰格”，泰格是一只威风的大老虎。', elephant:'谐音联想：elephant 像“爱乐分特”，爱乐分特是一头快乐的大象。', lion:'谐音联想：lion 像“来恩”，来恩狮子张嘴大吼。', giraffe:'谐音联想：giraffe 像“吉拉夫”，吉拉夫伸长脖子吃树叶。', tall:'谐音联想：tall 像“淘”，淘气的长颈鹿长得很高。', fast:'谐音联想：fast 像“发斯特”，发斯特狐狸跑得特别快。', apple:'谐音联想：apple 像“爱破”，爱吃苹果就把它咬破一口。', banana:'谐音联想：banana 像“吧拿拿”，看到弯弯的香蕉就“吧拿拿”起来。', farm:'谐音联想：farm 像“发木”，农场里有树木和植物。', air:'谐音联想：air 像“爱儿”，植物给爱儿送来新鲜空气。', grape:'谐音联想：grape 像“格瑞普”，格瑞普摘下一串葡萄。', school:'谐音联想：school 像“思酷”，在学校学习新知识很酷。', garden:'谐音联想：garden 像“嘎登”，嘎登走进花园看花。', need:'谐音联想：need 像“你得”，植物需要水，你得给它浇水。', water:'谐音联想：water 像“沃特”，沃特拿水壶给植物浇水。', flower:'谐音联想：flower 像“弗劳尔”，弗劳尔闻到花朵的香味。', grass:'谐音联想：grass 像“格拉斯”，格拉斯坐在绿色草地上。', plant:'谐音联想：plant 像“普兰特”，普兰特种下一株植物。', new:'谐音联想：new 像“牛”，一头牛戴着新帽子。', tree:'谐音联想：tree 像“吹”，对着大树吹一口气。', sun:'谐音联想：sun 像“三”，太阳升起时可以数“三”下。', give:'谐音联想：give 像“给我”，朋友说 give me 时就是让我给他。', them:'谐音联想：them 像“森”，森林里的小动物需要我们帮助。', colour:'谐音联想：colour 像“卡勒”，卡勒拿出彩笔画颜色。', green:'谐音联想：green 像“格林”，格林穿着绿色衣服。', red:'谐音联想：red 像“瑞德”，瑞德拿着一面红旗。', blue:'谐音联想：blue 像“布鲁”，布鲁望着蓝色的天空。', make:'谐音联想：make 像“美克”，美克用颜色做出一条彩虹。', purple:'谐音联想：purple 像“珀普”，珀普画了一朵紫色的花。', brown:'谐音联想：brown 像“布朗”，布朗熊是棕色的。', bear:'谐音联想：bear 像“贝尔”，贝尔熊背着一个小包。', yellow:'谐音联想：yellow 像“耶楼”，黄色的太阳照亮楼房。', duck:'谐音联想：duck 像“达克”，达克鸭子在水里游泳。', sea:'谐音联想：sea 像“西”，向西走就能看到大海。', some:'谐音联想：some 像“三姆”，三姆拿来一些苹果。', pink:'谐音联想：pink 像“平克”，平克画了一朵粉色的花。', draw:'谐音联想：draw 像“卓”，卓拿起画笔画画。', white:'谐音联想：white 像“怀特”，怀特穿着白色衣服。', black:'谐音联想：black 像“布莱克”，布莱克家的猫是黑色的。', old:'谐音联想：old 像“欧的”，问年龄时说 How old are you。', year:'谐音联想：year 像“一儿”，一儿就是一年。', one:'谐音联想：one 像“万”，数数时先从 one 开始。', three:'谐音联想：three 像“思瑞”，思瑞数到三只小鸟。', ten:'谐音联想：ten 像“天”，从一数到十，数字连到天。', six:'谐音联想：six 像“six”，想象六只小鸭子排队。', seven:'谐音联想：seven 像“赛文”，赛文数出七朵花。', eight:'谐音联想：eight 像“诶特”，诶特看到八棵树。', nine:'谐音联想：nine 像“奈恩”，奈恩数出九个苹果。', "o'clock":'谐音联想：o\'clock 像“哦克洛克”，钟表到整点会说哦。', cut:'谐音联想：cut 像“卡特”，卡特拿刀切蛋糕。', eat:'谐音联想：eat 像“一特”，一特张嘴吃蛋糕。', cake:'谐音联想：cake 像“开克”，开开心心切蛋糕。'
}));
const imageMnemonics = new Map(Object.entries({
  hand: '形象联想：想象挥手说 Hello 的画面，hand 就是手。',
  mouth: '形象联想：想象用嘴巴说话、唱歌，mouth 就是嘴。',
  arm: '形象联想：想象挥动手臂和朋友打招呼，arm 就是胳膊。',
  dog: '形象联想：想象一只小狗摇尾巴并发出 woof 的声音。',
  cat: '形象联想：想象一只小猫喵喵叫，cat 就是猫。',
  rabbit: '形象联想：想象一只兔子竖着长耳朵跳来跳去。',
  giraffe: '形象联想：想象长颈鹿伸长脖子吃树叶，giraffe 就是长颈鹿。',
  rainbow: '形象联想：想象雨后天空出现红橙黄绿蓝紫的彩虹。',
  apple: '形象联想：想象一颗红苹果，apple 就是苹果。',
  banana: '形象联想：想象一根弯弯的香蕉，banana 就是香蕉。',
  tree: '形象联想：想象一棵高高的树，tree 就是树。',
  flower: '形象联想：想象花园里盛开的花朵，flower 就是花。',
  cake: '形象联想：想象生日会上香甜的蛋糕，cake 就是蛋糕。',
}));
const semanticMnemonics = new Map(Object.entries({
  name: '语义联想：第一次见面先问 name，name 就是名字。', friend: '语义联想：一起玩、一起分享的人就是 friend，朋友。', family: '语义联想：mum、dad、brother、sister 组成 family，家庭。',
  share: '语义联想：把玩具分给朋友一起用，就是 share，分享。', smile: '语义联想：开心时嘴角上扬，就是 smile，微笑。', listen: '语义联想：老师说话时要认真听，就是 listen，倾听。', help: '语义联想：朋友需要时伸手帮忙，就是 help，帮助。',
  like: '语义联想：喜欢动物或颜色时可以说 like，喜欢。', pet: '语义联想：家里养的小动物就是 pet，宠物。', zoo: '语义联想：可以看到很多动物的地方是 zoo，动物园。', plant: '语义联想：需要阳光和水、会生长的绿色朋友是 plant，植物。', water: '语义联想：给植物浇水就是 water，water 也表示水。', colour: '语义联想：red、blue、green 都是 colour，颜色。', old: '语义联想：问年龄时说 How old are you，old 表示年龄。',
  "What's your name?": '语义联想：第一次认识朋友时，用这句话询问名字。', 'Nice to meet you.': '语义联想：第一次见面握手时，用这句话表示高兴认识对方。', "Let's play a game.": '语义联想：邀请朋友一起玩时，就说这句话。', 'This is my family.': '语义联想：介绍家人照片时，用这句话开头。', 'How old are you?': '语义联想：想知道朋友几岁，就用这句话提问。', 'I like animals.': '语义联想：表达对动物的喜爱，就说这句话。',
}));
function mnemonicFor(row) {
  if (rootMnemonics.has(row.headword)) return rootMnemonics.get(row.headword);
  if (soundMnemonics.has(row.headword)) return soundMnemonics.get(row.headword);
  if (soundMnemonicsExtra.has(row.headword)) return soundMnemonicsExtra.get(row.headword);
  if (imageMnemonics.has(row.headword)) return imageMnemonics.get(row.headword);
  if (semanticMnemonics.has(row.headword)) return semanticMnemonics.get(row.headword);
  if (numberWords.has(row.headword)) return `形象联想：想象${row.zh}个${row.headword === 'one' ? '苹果' : '小动物'}，边数边记住它。`;
  if (adjectives.has(row.headword)) return `语义联想：看到“${row.zh}”的事物时，就想到 ${row.headword}。`;
  return `语义联想：把“${row.zh}”和英文 ${row.headword} 配对记忆。`;
}
const baseTranslations = new Map(Object.entries({
  name:'我知道你的名字。', nice:'你很友好。', ear:'摸摸你的耳朵。', hand:'挥挥你的手。', eye:'看着我的眼睛。', mouth:'指指你的嘴。', arm:'挥挥你的胳膊。', can:'我能帮助你。', share:'我们分享我们的玩具。', smile:'请微笑。', listen:'听我说。', help:'我能帮助你。', say:'说你好。', friend:'她是我的朋友。', good:'你是一个好朋友。', mum:'这是我妈妈。', dad:'这是我爸爸。', grandma:'我的奶奶很和蔼。', grandpa:'我的爷爷很和蔼。', grandfather:'我的爷爷在这里。', grandmother:'我的奶奶在这里。', mother:'这是我妈妈。', father:'这是我爸爸。', me:'看看我。', sister:'这是我姐姐。', family:'我爱我的家人。', have:'我有一本书。', big:'这是一个大家庭。', cousin:'我的堂（表）兄弟姐妹在这里。', brother:'这是我哥哥。', baby:'婴儿很小。', uncle:'这是我叔叔。', aunt:'这是我阿姨。', small:'婴儿很小。', like:'我喜欢我的宠物。', dog:'我喜欢我的狗。', pet:'这是我的宠物。', cat:'猫很可爱。', fish:'我看到一条鱼。', bird:'鸟会飞。', rabbit:'兔子很可爱。', go:'我们走吧。', zoo:'我们去动物园。', fox:'狐狸跑得很快。', Miss:'怀特老师很和蔼。', panda:'熊猫很可爱。', 'red panda':'我看到一只小熊猫。', cute:'猴子很可爱。', monkey:'猴子会跳。', tiger:'老虎很大。', elephant:'大象很大。', lion:'狮子很强壮。', animal:'狗是一种动物。', giraffe:'长颈鹿很高。', tall:'长颈鹿很高。', fast:'狐狸跑得很快。', apple:'我吃一个苹果。', banana:'我喜欢香蕉。', farm:'这是一个农场。', air:'植物给我们空气。', orange:'我吃一个橙子。', grape:'我喜欢葡萄。', school:'我去上学。', garden:'这是一个花园。', need:'植物需要水。', water:'我给植物浇水。', flower:'这朵花很漂亮。', grass:'草是绿色的。', plant:'我看到一株植物。', new:'这是我的新书。', tree:'这棵树很高。', sun:'植物需要阳光。', give:'植物给我们空气。', them:'我能帮助他们。', colour:'它是什么颜色？', green:'草是绿色的。', red:'苹果是红色的。', blue:'天空是蓝色的。', make:'颜色组成彩虹。', purple:'这朵花是紫色的。', brown:'熊是棕色的。', bear:'熊很大。', yellow:'太阳是黄色的。', duck:'鸭子会游泳。', sea:'我看到了大海。', some:'我有一些苹果。', pink:'这朵花是粉色的。', draw:'我会画一棵树。', white:'云是白色的。', black:'猫是黑色的。', old:'你几岁？', five:'我五岁。', year:'我五岁。', one:'我有一本书。', two:'我有两本书。', three:'我看到三只鸟。', four:'我看到四条鱼。', ten:'我能数到十。', six:'我看到六个苹果。', seven:'我看到七只鸭子。', eight:'我看到八朵花。', nine:'我看到九棵树。', "o'clock":'现在是三点整。', cut:'切蛋糕。', eat:'我吃蛋糕。', cake:'我喜欢蛋糕。', "What's your name?":'你叫什么名字？', 'Nice to meet you.':'很高兴见到你。', "Let's play a game.":'我们一起玩游戏吧。', 'This is my family.':'这是我的家人。', 'How old are you?':'你几岁？', 'I like animals.':'我喜欢动物。'
}));
const lexiconExtras = new Map(Object.entries({
  a:'一个；一', am:'是', an:'一个；一', and:'和；与', are:'是', at:'在', beautiful:'漂亮的', book:'书', books:'书（复数）', cloud:'云', count:'数数', feelings:'感受', fly:'飞', from:'从；来自', game:'游戏', grow:'生长', happy:'开心的', hello:'你好', here:'这里', how:'怎样；多么', i:'我', into:'进入；到……里面', is:'是', it:'它', jump:'跳', kind:'友善的；和蔼的', know:'知道', let:'让', look:'看', love:'爱', meet:'遇见；见面', meow:'喵喵（猫叫声）', my:'我的', our:'我们的', play:'玩', please:'请', point:'指；指向', rainbow:'彩虹', says:'说（say 的第三人称单数）', see:'看见', she:'她', show:'展示；给……看', sky:'天空', strong:'强壮的', swim:'游泳', the:'这；那（定冠词）', this:'这；这个', to:'向；到', touch:'触摸', toys:'玩具（复数）', up:'向上', us:'我们（宾格）', wave:'挥动', we:'我们', what:'什么', woof:'汪汪（狗叫声）', you:'你；你们', your:'你的；你们的', "what's":'是什么；叫什么', "let's":'让我们', "o'clock":'……点钟'
}));
const lexiconIpaExtras = new Map(Object.entries({ a:'/ə/', am:'/æm/', an:'/ən/', and:'/ænd/', are:'/ɑr/', at:'/æt/', beautiful:'/ˈbjuːtəfəl/', book:'/bʊk/', books:'/bʊks/', cloud:'/klaʊd/', count:'/kaʊnt/', feelings:'/ˈfiːlɪŋz/', fly:'/flaɪ/', from:'/frəm/', game:'/ɡeɪm/', grow:'/ɡroʊ/', happy:'/ˈhæpi/', hello:'/həˈloʊ/', here:'/hɪr/', how:'/haʊ/', i:'/aɪ/', into:'/ˈɪntuː/', is:'/ɪz/', it:'/ɪt/', jump:'/dʒʌmp/', kind:'/kaɪnd/', know:'/noʊ/', let:'/let/', look:'/lʊk/', love:'/lʌv/', meet:'/miːt/', meow:'/miˈaʊ/', miss:'/mɪs/', my:'/maɪ/', our:'/aʊr/', play:'/pleɪ/', please:'/pliːz/', point:'/pɔɪnt/', rainbow:'/ˈreɪnboʊ/', says:'/sez/', see:'/siː/', she:'/ʃiː/', show:'/ʃoʊ/', sky:'/skaɪ/', strong:'/strɔŋ/', swim:'/swɪm/', the:'/ðə/', this:'/ðɪs/', to:'/tuː/', touch:'/tʌtʃ/', toys:'/tɔɪz/', up:'/ʌp/', us:'/ʌs/', wave:'/weɪv/', we:'/wiː/', what:'/wʌt/', woof:'/wʊf/', you:'/juː/', your:'/jʊr/', "what's":'/wʌts/', "let's":'/lets/' }));
const nounWords = new Set(['air','animal','animals','aunt','apple','apples','arm','baby','banana','bear','bird','book','books','brother','cake','cat','cloud','colour','colours','cousin','dad','dog','duck','ear','elephant','eye','family','farm','father','feelings','fish','flower','fox','friend','game','garden','giraffe','grandfather','grandma','grandmother','grandpa','grape','grass','hand','lion','miss','mouth','monkey','mother','mum','name','orange','panda','pet','plant','rabbit','rainbow','school','sea','sister','sky','sun','tiger','tree','toys','uncle','year','years','zoo']);
const verbWords = new Set(['am','are','can','count','cut','draw','eat','fly','give','go','grow','have','help','jump','know','like','listen','look','love','make','meet','need','play','point','say','see','share','show','smile','swim','touch','water','wave']);
const adjectiveWords = new Set(['beautiful','big','black','blue','brown','cute','fast','good','green','happy','kind','new','nice','old','pink','purple','red','small','strong','tall','white','yellow']);
const functionPos = new Map(Object.entries({ a:'det.', am:'v.', an:'det.', and:'conj.', are:'v.', at:'prep.', from:'prep.', here:'adv.', how:'adv.', i:'pron.', into:'prep.', is:'v.', it:'pron.', let:'v.', "let's":'phr.', me:'pron.', my:'det.', our:'det.', please:'adv.', says:'v.', she:'pron.', some:'det.', the:'det.', them:'pron.', this:'pron.', to:'prep.', up:'adv.', us:'pron.', we:'pron.', what:'pron.', "what's":'phr.', you:'pron.', your:'det.', hello:'interj.', woof:'interj.', meow:'interj.', "o'clock":'n.' }));
function inferLexiconEntry(surfaceForm, rowByHeadword) {
  const direct = rowByHeadword.get(surfaceForm);
  let base = surfaceForm;
  let formNote;
  if (!direct && surfaceForm.endsWith('ies') && rowByHeadword.has(`${surfaceForm.slice(0, -3)}y`)) { base = `${surfaceForm.slice(0, -3)}y`; formNote = `复数形式，原形为 ${base}`; }
  else if (!direct && surfaceForm.endsWith('es') && rowByHeadword.has(surfaceForm.slice(0, -2))) { base = surfaceForm.slice(0, -2); formNote = `复数形式，原形为 ${base}`; }
  else if (!direct && surfaceForm.endsWith('s') && rowByHeadword.has(surfaceForm.slice(0, -1))) { base = surfaceForm.slice(0, -1); formNote = `复数或第三人称单数形式，原形为 ${base}`; }
  const row = rowByHeadword.get(base);
  const text = direct?.zh ?? lexiconExtras.get(surfaceForm) ?? row?.zh ?? `与 ${base} 相关的课文词形`;
  const pos = nounWords.has(base) ? 'n.' : verbWords.has(base) ? 'v.' : adjectiveWords.has(base) ? 'adj.' : numberWords.has(base) ? 'num.' : functionPos.get(surfaceForm) ?? functionPos.get(base);
  const pronunciation = ipa.get(base) ?? ipa.get(base[0]?.toUpperCase() + base.slice(1)) ?? lexiconIpaExtras.get(surfaceForm) ?? lexiconIpaExtras.get(base);
  return { surfaceForm, displayForm: surfaceForm, definitions: [{ text, ...(pos ? { pos } : {}) }], ...(pronunciation ? { ipa: pronunciation } : {}), ...(formNote ? { formNote } : {}) };
}
const adjectiveExampleZh = new Map(Object.entries({ nice:'它很好。', good:'它很好。', big:'它很大。', small:'它很小。', cute:'它很可爱。', tall:'它很高。', fast:'它很快。', new:'它是新的。', green:'它是绿色的。', red:'它是红色的。', blue:'它是蓝色的。', purple:'它是紫色的。', brown:'它是棕色的。', yellow:'它是黄色的。', pink:'它是粉色的。', white:'它是白色的。', black:'它是黑色的。', old:'它很旧。' }));
const animalMeasureZh = new Map(Object.entries({ rabbit:'兔子', dog:'狗', cat:'猫', bird:'鸟', fish:'鱼', fox:'狐狸', panda:'熊猫', 'red panda':'小熊猫', monkey:'猴子', tiger:'老虎', elephant:'大象', lion:'狮子', giraffe:'长颈鹿', bear:'熊', duck:'鸭子' }));
function defaultExtraExample(row) {
  if (row.kind !== 'word' || noExtraExample.has(row.headword)) return null;
  if (adjectives.has(row.headword)) return { en: `It is ${row.headword}.`, zh: adjectiveExampleZh.get(row.headword) ?? `它是${row.zh}。` };
  if (verbs.has(row.headword)) return { en: `I can ${row.headword}.`, zh: `我会${row.zh}。` };
  if (numberWords.has(row.headword)) return { en: `I see ${row.headword} apples.`, zh: `我看到${row.zh}个苹果。` };
  if (row.headword === 'fish') return { en: 'I see two fish.', zh: '我看到两条鱼。' };
  if (row.headword === 'air' || row.headword === 'grass' || row.headword === 'sea') return { en: `I like the ${row.headword}.`, zh: `我喜欢${row.zh}。` };
  return { en: `I see a ${row.headword}.`, zh: animalMeasureZh.has(row.headword) ? `我看到一只${animalMeasureZh.get(row.headword)}。` : `我看到一个${row.zh.split('；')[0]}。` };
}
const slug = (value) => value.trim().toLowerCase().replaceAll(' ', '-').replaceAll(/[^a-z0-9-]/g, '');
const tokenise = (value) => [...value.toLowerCase().replaceAll('’', "'").matchAll(/[a-zA-Z']+/g)].map(([token]) => token);
const cards = rows.map((row, index) => {
  const examples = [{ en: row.exampleEn, zh: baseTranslations.get(row.headword) ?? row.zh }, ...(extraExamples[row.headword] ?? []).map(([en, zh]) => ({ en, zh })), ...(defaultExtraExample(row) ? [defaultExtraExample(row)] : [])].slice(0, extraExamples[row.headword] ? 3 : 2);
  return { kind: row.kind, sortOrder: index + 1, content: { prompt: { headword: row.headword, primaryAudio: `assets/audio/${slug(row.headword)}.mp3`, phonetic: { ipa: ipa.get(row.headword), dialect: 'us' } }, reveal: { definitions: [{ text: row.zh }], examples: examples.map((example, exampleIndex) => ({ ...example, audio: `assets/audio/examples/${slug(row.headword)}-${exampleIndex + 1}.mp3` })), mnemonic: { kind: 'association', text: mnemonicFor(row) }, ...(inflections.has(row.headword) ? { inflectionNote: inflections.get(row.headword) } : {}) } } };
});
const lexicon = new Map();
const rowByHeadword = new Map(rows.filter(({ kind }) => kind === 'word').map((row) => [row.headword.toLowerCase(), row]));
for (const card of cards) for (const example of card.content.reveal.examples) for (const surfaceForm of tokenise(example.en)) if (!lexicon.has(surfaceForm)) lexicon.set(surfaceForm, inferLexiconEntry(surfaceForm, rowByHeadword));
for (const row of rows.filter(({ kind }) => kind === 'word')) { const surfaceForm = row.headword.toLowerCase(); if (!lexicon.has(surfaceForm)) lexicon.set(surfaceForm, inferLexiconEntry(surfaceForm, rowByHeadword)); }
const phraseUnits = new Map([['What\'s your name?', 'Unit 1'], ['Nice to meet you.', 'Unit 1'], ["Let's play a game.", 'Unit 1'], ['This is my family.', 'Unit 2'], ['I like animals.', 'Unit 3'], ['How old are you?', 'Unit 6']]);
const unitForCard = (card, index) => phraseUnits.get(card.content.prompt.headword) ?? (index < 15 ? 'Unit 1' : index < 34 ? 'Unit 2' : index < 56 ? 'Unit 3' : index < 75 ? 'Unit 4' : index < 90 ? 'Unit 5' : 'Unit 6');
const unitStats = [...new Set(cards.map((card, index) => unitForCard(card, index)))].map((unit) => {
  const unitCards = cards.filter((card, index) => unitForCard(card, index) === unit);
  return { unit, cardCount: unitCards.length, wordCount: unitCards.filter(({ kind }) => kind === 'word').length, phraseCount: unitCards.filter(({ kind }) => kind === 'phrase').length };
});
const tokenFrequency = {};
const tokenCardLinks = {};
for (const card of cards) for (const example of card.content.reveal.examples) for (const token of tokenise(example.en)) { tokenFrequency[token] = (tokenFrequency[token] ?? 0) + 1; tokenCardLinks[token] = [...new Set([...(tokenCardLinks[token] ?? []), card.content.prompt.headword])]; }

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'meta.json'), `${JSON.stringify({ packId, packVersion: '1.0.4', keyId: 'test-v1' }, null, 2)}\n`);
writeFileSync(join(outputDir, 'cards.json'), `${JSON.stringify(cards, null, 2)}\n`);
writeFileSync(join(outputDir, 'lexicon.json'), `${JSON.stringify([...lexicon.values()].sort((a, b) => a.surfaceForm.localeCompare(b.surfaceForm)), null, 2)}\n`);
writeFileSync(join(outputDir, 'content-stats.json'), `${JSON.stringify({ packId, packVersion: '1.0.4', cardCount: cards.length, wordCardCount: cards.filter(({ kind }) => kind === 'word').length, phraseCardCount: cards.filter(({ kind }) => kind === 'phrase').length, exampleCount: cards.reduce((total, card) => total + card.content.reveal.examples.length, 0), uniqueExampleTokenCount: Object.keys(tokenFrequency).length, lexiconEntryCount: lexicon.size, lexiconEntriesWithPartOfSpeech: [...lexicon.values()].filter((entry) => entry.definitions.some((definition) => definition.pos)).length, lexiconEntriesWithIpa: [...lexicon.values()].filter((entry) => entry.ipa).length, lexiconEntriesWithFormNote: [...lexicon.values()].filter((entry) => entry.formNote).length, mnemonicCount: cards.filter((card) => card.content.reveal.mnemonic).length, unitStats, tokenFrequency, tokenCardLinks }, null, 2)}\n`);
console.log(`generated ${cards.length} cards and ${lexicon.size} lexicon entries at ${outputDir}`);
