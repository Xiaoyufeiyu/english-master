# -*- coding: utf-8 -*-
"""把 data.js 中的例句改为修仙体系风格。
- 8 个主题词集的 ex 字段（按单词 en 匹配）
- 45 课语法的 points / practice 例句（保留 explain 与正确答案 a）
不改动 stories / bulkwords（运行时拼接）。
"""
import re, io, sys

PATH = "assets/data.js"

# ---------- 1) 主题词集例句（en -> 修仙风格 ex） ----------
WORD_EX = {
    "hello": "Hello! I am a cultivator. (你好！我是一名修士。)",
    "hi": "Hi, my dao companion! (嗨，我的道友！)",
    "goodbye": "Goodbye, see you on the path! (再见，仙路上见！)",
    "please": "Spirit water, please. (请给我灵泉。)",
    "thanks": "Thanks for your guidance. (谢谢你的指点。)",
    "sorry": "Sorry, I am late for cultivation. (抱歉，我修炼迟到了。)",
    "yes": "Yes, I walk the dao. (是的，我心向大道。)",
    "no": "No, thank you. (不必了，多谢。)",
    "one": "I have one ancient scroll. (我有一卷仙典。)",
    "two": "Two spirit foxes. (两只灵狐。)",
    "three": "Three spirit fruits. (三枚灵果。)",
    "four": "Four spirit hounds. (四只灵犬。)",
    "five": "Five spirit eggs. (五枚灵蛋。)",
    "six": "Six spirit birds. (六只灵鸟。)",
    "seven": "Seven days of cultivation. (七天修行。)",
    "eight": "Eight spirit brushes. (八支灵笔。)",
    "red": "A red spirit fruit. (一枚红灵果。)",
    "blue": "The blue sky. (蓝色的苍穹。)",
    "green": "Green spirit grass. (绿灵草。)",
    "yellow": "A yellow spirit duck. (一只黄灵鸭。)",
    "black": "A black spirit cat. (一只黑灵猫。)",
    "white": "White spirit milk. (白灵乳。)",
    "pink": "A pink spirit flower. (一朵粉灵花。)",
    "orange": "Orange spirit juice. (橙灵浆。)",
    "mother": "My mother is gentle. (我的母亲很温柔。)",
    "father": "My father is tall. (我的父亲很高。)",
    "sister": "I have a sister-disciple. (我有一个师姐妹。)",
    "brother": "My brother is a young disciple. (我师弟是个小弟子。)",
    "friend": "You are my fellow cultivator. (你是我的道友。)",
    "baby": "A small spirit child. (一个小灵童。)",
    "grandfather": "My grandfather is old. (我的祖父年高。)",
    "grandmother": "My grandmother is happy. (我的祖母很安康。)",
    "water": "I drink spirit spring water. (我饮灵泉水。)",
    "apple": "A red spirit fruit. (一枚红灵果。)",
    "rice": "I eat spirit rice. (我吃灵米。)",
    "egg": "One spirit egg. (一枚灵蛋。)",
    "bread": "I like spirit bread. (我喜欢灵饼。)",
    "milk": "White spirit milk. (白灵乳。)",
    "tea": "Green spirit tea. (仙茶。)",
    "banana": "A yellow spirit banana. (一根黄灵蕉。)",
    "cat": "A black spirit cat. (一只黑灵猫。)",
    "dog": "The spirit hound is big. (这只灵犬很大。)",
    "bird": "A small spirit bird. (一只小灵鸟。)",
    "fish": "I see a spirit fish. (我看见一条灵鱼。)",
    "rabbit": "A white spirit rabbit. (一只白灵兔。)",
    "cow": "The spirit ox is big. (这头灵牛很大。)",
    "duck": "A yellow spirit duck. (一只黄灵鸭。)",
    "horse": "A big spirit horse. (一匹大灵马。)",
    "eat": "I eat spirit rice. (我吃灵米。)",
    "drink": "I drink spirit spring water. (我饮灵泉水。)",
    "go": "I go to the sect. (我去宗门。)",
    "see": "I see a spirit cat. (我看见一只灵猫。)",
    "like": "I like spirit fruit. (我喜欢灵果。)",
    "have": "I have an ancient scroll. (我有一卷仙典。)",
    "want": "I want spirit spring water. (我想要灵泉水。)",
    "play": "I play with a spirit fox. (我和灵狐嬉戏。)",
    "home": "I return to my cave. (我回洞府。)",
    "school": "I go to the sect. (我去宗门。)",
    "book": "A red ancient scroll. (一卷红仙典。)",
    "pen": "I have a spirit brush. (我有一支灵笔。)",
    "sun": "The sun is hot. (太阳灼热。)",
    "moon": "The moon is pale. (月色清冷。)",
    "day": "A good cultivation day. (修行顺遂的一日。)",
    "night": "Good night, little fox! (晚安，小狐！)",
}

# ---------- 2) 语法例句（points=[en,zh], practice=[q,a,hint]） ----------
# 保留原 explain 与正确答案 a；只把例句内容改为修仙语境。
GRAMMAR = {
"g1": ([
    ["I am a cultivator.", "我是一名修士。"],
    ["You are my fellow cultivator.", "你是我的道友。"],
    ["He is a disciple of the sect.", "他是宗门的一名弟子。"],
    ["She is a spirit fox.", "她是一只灵狐。"],
    ["It is a flying sword.", "它是一柄飞剑。"],
    ["We are cultivators.", "我们是修士。"],
    ["They are disciples.", "他们是弟子。"],
], [
    ["I ___ a cultivator. (我是一名修士。)", "am", "I 后面用 am"],
    ["She ___ my master. (她是我的师尊。)", "is", "She 是第三人称单数，用 is"],
    ["They ___ happy. (他们很开心。)", "are", "They 是复数，用 are"],
]),
"g2": ([
    ["a spirit fox", "一只灵狐"],
    ["an immortal peach", "一枚仙桃"],
    ["an azure egg", "一枚青玉蛋"],
    ["the ancient scroll", "那卷仙典（特指）"],
], [
    ["I have ___ spirit fox. (我有一只灵狐。)", "a", "spirit fox 以辅音 /s/ 开头，用 a"],
    ["I eat ___ immortal peach. (我吃一枚仙桃。)", "an", "immortal 以元音 /ɪ/ 开头，用 an"],
    ["___ sun is hot. (太阳很热。)", "the", "世上唯一的太阳，用 the"],
]),
"g3": ([
    ["one spirit fox to two spirit foxes", "一只灵狐 → 两只灵狐"],
    ["one ancient scroll to three ancient scrolls", "一卷仙典 → 三卷仙典"],
    ["one spirit hound to four spirit hounds", "一只灵犬 → 四只灵犬"],
], [
    ["I see two ___. (灵狐)", "spirit foxes", "spirit fox 直接加 s"],
    ["Three red ___. (仙典)", "ancient scrolls", "ancient scroll 直接加 s"],
    ["Four small ___. (灵犬)", "spirit hounds", "spirit hound 直接加 s"],
]),
"g4": ([
    ["I eat spirit rice.", "我吃灵米。"],
    ["He eats spirit rice.", "他吃灵米。"],
    ["We cultivate at the sect.", "我们在宗门修炼。"],
], [
    ["I ___ spirit spring water. (喝)", "drink", "I 用动词原形"],
    ["She ___ a spirit fruit. (吃)", "eats", "She 第三人称单数，eat 加 s"],
    ["They ___ at the cave. (玩)", "play", "They 用原形 play"],
]),
"g5": ([
    ["Are you a cultivator? — Yes, I am.", "你是修士吗？——是的，我是。"],
    ["Do you like spirit tea? — No, I don't.", "你喜欢仙茶吗？——不，我不喜欢。"],
    ["Is it a flying sword? — Yes, it is.", "它是飞剑吗？——是的。"],
], [
    ["___ you my fellow cultivator? (你是我的道友吗？)", "are", "you 搭配 are"],
    ["___ she like spirit fruit? (她喜欢灵果吗？)", "does", "She 第三人称，用 does"],
    ["___ it a spirit fox? (它是一只灵狐吗？)", "is", "it 搭配 is"],
]),
"g6": ([
    ["What is your dao name?", "你的道号是什么？"],
    ["Where is the ancient scroll?", "仙典在哪里？"],
    ["How are you?", "你好吗？"],
], [
    ["___ is your dao name? (你的道号是什么？)", "what", "问“什么”用 What"],
    ["___ are you? (你好吗？)", "how", "问状况用 How"],
    ["___ is the spirit fox? (灵狐在哪里？)", "where", "问地点用 Where"],
]),
"g7": ([
    ["my ancient scroll", "我的仙典"],
    ["your spirit brush", "你的灵笔"],
    ["his spirit fox", "他的灵狐"],
    ["her flying sword", "她的飞剑"],
], [
    ["___ dao name is Xuanji. (我的道号是玄机。)", "my", "表示“我的”"],
    ["___ master is kind. (你的师尊很慈祥。)", "your", "表示“你的”"],
    ["___ mother is gentle. (他的师娘很温柔。)", "his", "表示“他的”"],
]),
"g8": ([
    ["a big spirit hound", "一只大灵犬"],
    ["a small spirit fox", "一只小灵狐"],
    ["a happy spirit child", "一个开心的灵童"],
    ["hot spirit spring", "热的灵泉"],
], [
    ["A ___ spirit fox. (小)", "small", "小的 = small"],
    ["___ spirit spring. (热)", "hot", "热的 = hot"],
    ["A ___ ancient scroll. (新)", "new", "新的 = new"],
]),
"g9": ([
    ["this ancient scroll", "这卷仙典（近处）"],
    ["that spirit fox", "那只灵狐（远处）"],
    ["these spirit fruits", "这些灵果"],
    ["those spirit hounds", "那些灵犬"],
], [
    ["___ is my ancient scroll. (这是我的仙典，近处)", "this", "近处单数用 this"],
    ["___ are my fellow cultivators. (这些是我的道友)", "these", "复数近处用 these"],
    ["___ is your spirit brush? (那是你的灵笔吗，远处)", "that", "远处单数用 that"],
]),
"g10": ([
    ["I follow you.", "我追随你。"],
    ["He protects me.", "他护佑我。"],
    ["We see them.", "我们看见他们。"],
], [
    ["She protects ___. (她护佑我)", "me", "protect 后接宾格 me"],
    ["We honor ___. (我们敬重他)", "him", "honor 后接宾格 him"],
    ["They call ___. (他们呼唤我们)", "us", "call 后接宾格 us"],
]),
"g11": ([
    ["I am not tired.", "我不疲倦。"],
    ["He does not like spirit tea.", "他不喜欢仙茶。"],
    ["They don't cultivate together.", "他们不一起修炼。"],
], [
    ["I ___ like spirit brew. (我不喜欢仙酿)", "don't", "I 用 don't"],
    ["She ___ eat spirit meat. (她不吃灵兽肉)", "doesn't", "She 用 doesn't"],
    ["It is ___ a flying sword. (它不是一柄飞剑)", "not", "be 动词后加 not"],
]),
"g12": ([
    ["The ancient scroll is on the jade desk.", "仙典在玉案上。"],
    ["The spirit fox is under the meditation stool.", "灵狐在蒲团下。"],
    ["The spirit orb is in the treasure box.", "灵珠在法宝匣里。"],
], [
    ["The jade cup is ___ the table. (玉盏在桌上)", "on", "表面之上用 on"],
    ["The shoes are ___ the bed. (鞋在玉床下)", "under", "下方用 under"],
    ["The spirit brush is ___ the pouch. (灵笔在乾坤袋里)", "in", "内部用 in"],
]),
"g13": ([
    ["There is a spirit fox on the stool.", "蒲团上有一只灵狐。"],
    ["There are two ancient scrolls on the desk.", "案上有两卷仙典。"],
    ["There is some spirit spring in the jade cup.", "玉盏里有些灵泉。"],
], [
    ["___ is a spirit hound in the garden. (灵园里有一只灵犬)", "there", "“有”用 There is"],
    ["___ are many disciples in the hall. (道场里有很多弟子)", "there", "复数用 There are"],
    ["___ is some spirit milk in the cup. (杯里有些灵乳)", "there", "不可数用 There is"],
]),
"g14": ([
    ["I can ride the flying sword.", "我会御飞剑。"],
    ["She can speak the ancient tongue.", "她会说古仙语。"],
    ["Can you guard the gate?", "你能守山门吗？"],
], [
    ["I ___ ride the flying sword. (我会御飞剑)", "can", "能力用 can"],
    ["He ___ sing the dao chant. (他唱道吟唱得好)", "can", "he 也用 can"],
    ["___ you open the gate? (你能开山门吗)", "can", "疑问 can 提前"],
]),
"g15": ([
    ["I have a fellow cultivator.", "我有一个道友。"],
    ["She has a red storage pouch.", "她有一个红色乾坤袋。"],
    ["They have two spirit hounds.", "他们有两只灵犬。"],
], [
    ["He ___ a new flying sword. (他有一柄新飞剑)", "has", "He 用 has"],
    ["We ___ a big cave dwelling. (我们有一座大洞府)", "have", "We 用 have"],
    ["She ___ long hair. (她有长发)", "has", "She 用 has"],
]),
"g16": ([
    ["a red spirit fruit", "一枚红灵果"],
    ["a blue sky", "蓝色的苍穹"],
    ["What color is your pouch?", "你的乾坤袋是什么颜色？"],
], [
    ["___ color is the sky? (苍穹是什么颜色)", "what", "问颜色用 What color"],
    ["I have a ___ spirit brush. (我有一支蓝色的灵笔)", "blue", "蓝色 = blue"],
    ["She wears a ___ robe. (她穿一件红色的仙袍)", "red", "红色 = red"],
]),
"g17": ([
    ["I like spirit fruit.", "我喜欢灵果。"],
    ["She likes reading ancient scrolls.", "她喜欢读仙典。"],
    ["Do you like spirit tea?", "你喜欢仙茶吗？"],
], [
    ["I ___ spirit music. (我喜欢仙乐)", "like", "I 用 like"],
    ["He ___ spirit foxes. (他喜欢灵狐)", "likes", "He 用 likes"],
    ["She ___ dancing. (她喜欢起舞)", "likes", "like + doing"],
]),
"g18": ([
    ["I am seven years on the path.", "我修行七年了。"],
    ["There are twenty disciples.", "有二十名弟子。"],
    ["My dao number is 138.", "我的道号编号是 138。"],
], [
    ["How ___ are you on the path? (你修行多少年了)", "old", "问修龄用 How old"],
    ["I am ___ years on the path. (我修行十年了)", "ten", "十 = ten"],
    ["There are ___ ancient scrolls. (有十二卷仙典)", "twelve", "十二 = twelve"],
]),
"g19": ([
    ["What time is it? — It is 3 o'clock.", "几时了？——三时。"],
    ["I eat the morning meal at 7.", "我七时用晨膳。"],
    ["The cultivation class starts at 9 o'clock.", "九时开始修行课。"],
], [
    ["What ___ is it? (几时了)", "time", "问时间用 What time"],
    ["We go to the sect ___ 8 o'clock. (我们八时去宗门)", "at", "具体时辰前用 at"],
    ["It is 6 ___. (六时整)", "o'clock", "整时用 o'clock"],
]),
"g20": ([
    ["I go to the sect by cloud carriage.", "我乘云车去宗门。"],
    ["He gets up at 7.", "他七时起身。"],
    ["They return to the cave at 5.", "他们五时回洞府。"],
], [
    ["I ___ to the sect every day. (我每天去宗门)", "go", "去宗门用 go to the sect"],
    ["She ___ the dao ball after class. (她课后蹴仙球)", "plays", "玩球用 play，She 加 s"],
    ["He ___ an ancient scroll in the library. (他在藏经阁读一卷仙典)", "reads", "读书用 read，He 加 s"],
]),
"g21": ([
    ["I am reading an ancient scroll now.", "我现在正在读一卷仙典。"],
    ["She is watching the cloud sea.", "她正在看云海。"],
    ["They are playing the dao ball.", "他们正在蹴仙球。"],
], [
    ["He is ___ a spirit fruit. (他正在吃一枚灵果)", "eating", "eat 的 -ing 形式"],
    ["We are ___ games. (我们正在行棋)", "playing", "play + ing"],
    ["I am ___ a letter. (我正在写一封信)", "writing", "write 去 e 加 ing"],
]),
"g22": ([
    ["I walked to the sect.", "我步行去了宗门。"],
    ["She helped her master.", "她协助了师尊。"],
    ["He studied the ancient tongue.", "他研习了古仙语。"],
], [
    ["They ___ in the garden yesterday. (他们昨天在灵园玩)", "played", "play + ed"],
    ["He ___ me last night. (他昨夜护佑了我)", "helped", "help + ed"],
    ["She ___ the cloud sea after dinner. (她晚饭后看了云海)", "watched", "watch + ed"],
]),
"g23": ([
    ["I went to the spirit zoo.", "我去了灵兽园。"],
    ["She ate a spirit cake.", "她吃了一块灵糕。"],
    ["He came home late.", "他回洞府很晚。"],
], [
    ["I ___ to the garden yesterday. (我昨天去了灵园)", "went", "go 的过去式 went"],
    ["We ___ spirit pizza for dinner. (我们晚饭吃了灵披萨)", "ate", "eat 的过去式 ate"],
    ["She ___ a gift for her fellow cultivator. (她给道友备了一份礼)", "bought", "buy 的过去式 bought"],
]),
"g24": ([
    ["Did you watch the ceremony?", "你看了那场典礼吗？"],
    ["He didn't come to the sect.", "他没来宗门。"],
    ["Where did they go?", "他们去哪儿了？"],
], [
    ["___ you finish your meditation? (你做完功课了吗)", "did", "过去时疑问用 Did"],
    ["She ___ like the spirit meal. (她不喜欢那灵膳)", "didn't", "过去时否定 didn't"],
    ["Where ___ he go yesterday? (他昨天去哪了)", "did", "疑问用 did，动词原形"],
]),
"g25": ([
    ["I will call you tomorrow.", "我明日会传音给你。"],
    ["She is going to visit the immortal mountain.", "她打算去仙山。"],
    ["It is going to rain.", "要落雨了。"],
], [
    ["I ___ help you. (我会帮你)", "will", "将来用 will"],
    ["He is ___ to buy a new flying sword. (他打算买柄新飞剑)", "going", "be going to 表打算"],
    ["They ___ travel next week. (他们下周要远游)", "will", "将来用 will"],
]),
"g26": ([
    ["He is taller than me.", "他比我高。"],
    ["This ancient scroll is bigger.", "这卷仙典更大。"],
    ["She is more careful.", "她更细心。"],
], [
    ["Xuanji is ___ than the boy. (玄机比那少年高)", "taller", "tall 加 er"],
    ["My pouch is ___ than yours. (我的乾坤袋比你的大)", "bigger", "big 双写 g 加 er"],
    ["The ancient tongue is ___ difficult than math. (古仙语比算术更难)", "more", "多音节用 more"],
]),
"g27": ([
    ["He is the tallest disciple.", "他是最高的弟子。"],
    ["This is the best day.", "这是最好的一日。"],
    ["She is the most beautiful.", "她是最美的。"],
], [
    ["He is the ___ in the hall. (他是道场里最高的)", "tallest", "tall 加 est"],
    ["This is the ___ ancient scroll. (这是最大的仙典)", "biggest", "big 双写 g 加 est"],
    ["She is the ___ disciple. (她是最好的弟子)", "best", "good 的最高级 best"],
]),
"g28": ([
    ["He rides the sword fast.", "他御剑快。"],
    ["She speaks slowly.", "她语速缓。"],
    ["He did it well.", "他做得好。"],
], [
    ["She sings ___. (她唱得好)", "well", "good 的副词是 well"],
    ["They walk ___. (他们走得很慢)", "slowly", "slow + ly"],
    ["He finished the work ___. (他很快完成了功课)", "quickly", "quick + ly"],
]),
"g29": ([
    ["I have some fellow cultivators.", "我有一些道友。"],
    ["I don't have any spirit stones.", "我没有任何灵石。"],
    ["Do you have any questions?", "你有任何疑问吗？"],
], [
    ["There is ___ spirit milk in the jade cup. (玉盏里有些灵乳)", "some", "肯定句用 some"],
    ["I don't have ___ time. (我没有任何光阴)", "any", "否定句用 any"],
    ["Do you have ___ fellow cultivators? (你有道友吗)", "any", "疑问句用 any"],
]),
"g30": ([
    ["How many spirit fruit do you have?", "你有多少枚灵果？"],
    ["How much spirit spring do you need?", "你需要多少灵泉？"],
    ["I have a lot of ancient scrolls.", "我有很多卷仙典。"],
], [
    ["How ___ ancient scrolls are there? (有多少卷仙典)", "many", "可数复数用 many"],
    ["How ___ spirit spring do you have? (你有多少灵泉)", "much", "不可数用 much"],
    ["We have ___ of spirit food. (我们有很多灵膳)", "a lot", "a lot of 两者皆可"],
]),
"g31": ([
    ["I need some spirit spring water.", "我需要一些灵泉之水。"],
    ["Can I have a piece of spirit bread?", "我能要一片灵饼吗？"],
    ["We have much spirit knowledge.", "我们有很多仙识。"],
], [
    ["Please give me some water from the spring. (请给我一些灵泉之水)", "water", "水是不可数名词"],
    ["I eat bread every morning in the cave. (我每天在洞府吃饼)", "bread", "面包不可数"],
    ["This is useful information about the dao. (这是关于大道的有用的仙识)", "information", "信息不可数"],
]),
"g32": ([
    ["Open the gate.", "打开山门。"],
    ["Don't be late.", "不要迟到。"],
    ["Please sit on the stool.", "请坐蒲团。"],
], [
    ["___ the gate, please. (请开山门)", "open", "祈使句动词原形开头"],
    ["___ talk in the hall. (道场中不要说话)", "don't", "否定祈使用 Don't"],
    ["___ careful! (小心)", "be", "be 开头的祈使句"],
]),
"g33": ([
    ["You should cultivate hard.", "你应当勤修。"],
    ["I must go to the sect now.", "我现在必须去宗门了。"],
    ["We mustn't be late.", "我们绝不能迟到。"],
], [
    ["You ___ eat more spirit herbs. (你应当多食灵草)", "should", "建议用 should"],
    ["I ___ finish my meditation. (我必须完成功课)", "must", "必须用 must"],
    ["He ___ smoke here. (他不该在此地吐纳)", "shouldn't", "不应该用 shouldn't"],
]),
"g34": ([
    ["What a blessed day!", "多祥瑞的一日！"],
    ["How clever the boy is!", "这少年多聪慧！"],
    ["What fine spirit food!", "多好的灵膳！"],
], [
    ["___ a big cave! (多大的洞府)", "what", "接名词用 What"],
    ["___ fast he rides! (他御剑多快)", "how", "接副词用 How"],
    ["___ a good idea! (多好的妙法)", "what", "接名词用 What"],
]),
"g35": ([
    ["I like tea and spirit herbs.", "我喜欢茶与灵草。"],
    ["He is rich but not happy.", "他富有却不快乐。"],
    ["I stayed in the cave because it rained.", "我留在洞府因为落雨了。"],
], [
    ["She is tired ___ she is happy. (她累了却开心)", "but", "转折用 but"],
    ["I cultivate hard ___ I want to ascend. (我勤修因为想飞升)", "because", "原因用 because"],
    ["He was hungry ___ he ate a lot. (他饿了所以他吃了很多)", "so", "结果用 so"],
]),
"g36": ([
    ["I always get up early.", "我总是早起。"],
    ["He often plays the dao ball.", "他经常蹴仙球。"],
    ["We never eat junk food.", "我们从不吃凡俗浊食。"],
], [
    ["She ___ reads scrolls before bed. (她常在睡前读仙典)", "often", "经常用 often"],
    ["He is ___ late for class. (他上课从不迟到)", "never", "从不用 never"],
    ["I ___ drink spirit tea in the morning. (我总在晨间饮仙茶)", "always", "总是用 always"],
]),
"g37": ([
    ["I would like some spirit spring water.", "我想要一些灵泉之水。"],
    ["Would you like spirit tea or coffee?", "你想要仙茶还是仙酿？"],
    ["She would like to return to the cave.", "她想回洞府。"],
], [
    ["I ___ like a spirit peach. (我想要一枚仙桃)", "would", "想要用 would like"],
    ["___ you like some spirit cake? (你想要些灵糕吗)", "would", "礼貌询问用 Would you like"],
    ["He ___ like to sleep. (他想歇息)", "would", "would like to do"],
]),
"g38": ([
    ["This is Xuanji's spirit fox.", "这是玄机的灵狐。"],
    ["The disciples' room is clean.", "弟子们的静室很干净。"],
    ["My sister's flying sword is new.", "我师姐的飞剑是新的。"],
], [
    ["This is ___ ancient scroll. (这是玛丽的仙典)", "mary's", "人名加 's"],
    ["The ___ room is clean. (老师们的静室很干净)", "teachers'", "以 s 结尾复数加 '"],
    ["My ___ dao name is Lily. (我师姐的道号是莉莉)", "sister's", "单数名词加 's"],
]),
"g39": ([
    ["I hurt myself in training.", "我在修炼中伤到了自己。"],
    ["He enjoys himself on the path.", "他行路中自得其乐。"],
    ["We did it by ourselves.", "我们独自完成了它。"],
], [
    ["She cooked ___ a meal. (她为自己做了一顿灵膳)", "herself", "她自己用 herself"],
    ["I taught ___ the ancient tongue. (我自学了古仙语)", "myself", "我自己用 myself"],
    ["They enjoyed ___ at the feast. (他们在宴上玩得尽兴)", "themselves", "他们自己用 themselves"],
]),
"g40": ([
    ["I was watching the cloud sea at 8 pm.", "晚八时我正在看云海。"],
    ["They were playing outside.", "他们正在外面嬉戏。"],
    ["What were you doing?", "你当时在做什么？"],
], [
    ["He was ___ an ancient scroll. (他当时正在读一卷仙典)", "reading", "read + ing"],
    ["We were ___ the dao ball. (我们当时正在蹴仙球)", "playing", "play + ing"],
    ["I ___ sleeping at noon. (我中午正在歇息)", "was", "单数用 was"],
]),
"g41": ([
    ["I have finished my meditation.", "我已经做完功课了。"],
    ["She has lost her spirit brush.", "她弄丢了灵笔。"],
    ["Have you seen my spirit fox?", "你见过我的灵狐吗？"],
], [
    ["I have ___ that ceremony. (我已经看过那场典礼了)", "seen", "see 的过去分词 seen"],
    ["He has ___ to the immortal mountain. (他去了仙山)", "gone", "go 的过去分词 gone"],
    ["We have ___ the work. (我们已经完成功课了)", "finished", "finish + ed（规则）"],
]),
"g42": ([
    ["If it rains, we will stay in the cave.", "如果落雨，我们就留在洞府。"],
    ["If you cultivate, you will ascend.", "如果你勤修，你便会飞升。"],
    ["If he comes, call me.", "如果他来，唤我。"],
], [
    ["If you ___ hard, you will succeed. (如果你勤修，便会成功)", "study", "if 从句用一般现在时"],
    ["If it ___, we will cancel the trip. (如果落雨，我们便取消行程)", "rains", "it 用 rains"],
    ["If she ___, please tell me. (如果她来，请告诉我)", "comes", "she 用 comes"],
]),
"g43": ([
    ["The ancient tongue is spoken in the sect.", "古仙语在宗门中被传习。"],
    ["The letter was written by him.", "这封传书是他写的。"],
    ["The window is broken.", "窗棂破了。"],
], [
    ["The spirit cake is ___ by my master. (灵糕是我师尊做的)", "made", "make 的过去分词 made"],
    ["The cave was ___ last year. (这洞府去年建的)", "built", "build 的过去分词 built"],
    ["The hall is ___ every day. (道场每日被清扫)", "cleaned", "clean + ed"],
]),
"g44": ([
    ["The girl who sings well is Lucy.", "唱得好听的少女是露西。"],
    ["The man that I met is a healer.", "我遇到的那位道友是医修。"],
    ["He is the disciple who won the prize.", "他是夺魁的那名弟子。"],
], [
    ["The boy ___ is playing is my brother. (正在玩耍的少年是我师弟)", "who", "指人用 who"],
    ["The woman ___ called you is my aunt. (给你传音的那位仙子是我姑姑)", "that", "指人也可用 that"],
    ["He is the man ___ helped me. (他是护佑我的那位道友)", "who", "指人用 who"],
]),
"g45": ([
    ["I know where he cultivates.", "我知道他在何处修炼。"],
    ["Please tell me what you like.", "请告诉我你喜欢什么。"],
    ["Do you know when the carriage leaves?", "你知道云车几时启程吗？"],
], [
    ["I don't know ___ he is. (我不知道他在何处)", "where", "宾语从句用 where"],
    ["Can you tell me ___ you want? (你能告诉我你想要什么吗)", "what", "用 what 引导"],
    ["Do you know ___ she goes? (你知道她去何处吗)", "where", "用 where 引导"],
]),
}

def serialize_points(pts):
    out = []
    for en, zh in pts:
        out.append('        { en: "%s", zh: "%s" }' % (en, zh))
    return "[\n" + ",\n".join(out) + "\n      ]"

def serialize_practice(prac):
    out = []
    for q, a, hint in prac:
        out.append('        { q: "%s", a: "%s", hint: "%s" }' % (q, a, hint))
    return "[\n" + ",\n".join(out) + "\n      ]"

def replace_first_array(block, key, replacement):
    """在 block 内找到第一个 `key: [` 数组并整体替换为 replacement。"""
    idx = block.find(key + ": [")
    if idx < 0:
        raise SystemExit("找不到 " + key)
    ob = block.index("[", idx)
    depth = 0
    i = ob
    while i < len(block):
        if block[i] == "[":
            depth += 1
        elif block[i] == "]":
            depth -= 1
            if depth == 0:
                cb = i
                break
        i += 1
    return block[:ob] + replacement + block[cb + 1:]

def lesson_block(src, gid):
    """返回 (lesson 对象起始下标, 结束下标+1) 通过括号匹配定位。"""
    idpos = src.index('id: "%s",' % gid)
    brace_start = src.rfind("{", 0, idpos)
    depth = 0
    i = brace_start
    while i < len(src):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                return brace_start, i + 1
        i += 1
    raise SystemExit("lesson 括号不匹配: " + gid)

with io.open(PATH, "r", encoding="utf-8") as f:
    src = f.read()

# ---- 2a) 替换主题词 ex ----
for en, ex in WORD_EX.items():
    pat = re.compile(r'(\{ en: "' + re.escape(en) + r'"[^}]*?ex: )"[^"]*"')
    new_src, n = pat.subn(r'\1"' + ex + '"', src, count=1)
    if n == 0:
        sys.stderr.write("WARN 未替换 ex: %s\n" % en)
    src = new_src

# ---- 2b) 替换语法 points / practice（限定在单个 lesson 对象内） ----
for gid in sorted(GRAMMAR.keys(), key=lambda x: int(x[1:])):
    if gid not in GRAMMAR:
        continue
    pts, prac = GRAMMAR[gid]
    s, e = lesson_block(src, gid)
    block = src[s:e]
    newblock = replace_first_array(block, "points", serialize_points(pts))
    newblock = replace_first_array(newblock, "practice", serialize_practice(prac))
    src = src[:s] + newblock + src[e:]

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print("OK 已重写 %d 个主题词 ex 与 %d 课语法例句" % (len(WORD_EX), len(GRAMMAR)))
