/* ============================================================
 *  English Master — 课程与剧情数据 (A1 入门级)
 *  所有内容按 CEFR A1 分级，遵循"可理解输入 + 脚手架式难度"
 * ============================================================ */
(function () {
  window.EM = window.EM || {};

  // ---------- 词汇集 ----------
  // 每个单词: { en, zh, ipa, ex }  ex = 英文例句(含中文)
  const wordSets = [
    {
      id: "greet",
      title: "问候 Greetings",
      emoji: "💬",
      words: [
        { en: "hello", zh: "你好", ipa: "/həˈloʊ/", ex: "Hello! I am a cultivator. (你好！我是一名修士。)" },
        { en: "hi", zh: "嗨", ipa: "/haɪ/", ex: "Hi, my dao companion! (嗨，我的道友！)" },
        { en: "goodbye", zh: "再见", ipa: "/ˌɡʊdˈbaɪ/", ex: "Goodbye, see you on the path! (再见，仙路上见！)" },
        { en: "please", zh: "请", ipa: "/pliːz/", ex: "Spirit water, please. (请给我灵泉。)" },
        { en: "thanks", zh: "谢谢", ipa: "/θæŋks/", ex: "Thanks for your guidance. (谢谢你的指点。)" },
        { en: "sorry", zh: "抱歉", ipa: "/ˈsɒri/", ex: "Sorry, I am late for cultivation. (抱歉，我修炼迟到了。)" },
        { en: "yes", zh: "是", ipa: "/jes/", ex: "Yes, I walk the dao. (是的，我心向大道。)" },
        { en: "no", zh: "不", ipa: "/noʊ/", ex: "No, thank you. (不必了，多谢。)" }
      ]
    },
    {
      id: "numbers",
      title: "数字 Numbers",
      emoji: "🔢",
      words: [
        { en: "one", zh: "一", ipa: "/wʌn/", ex: "I have one ancient scroll. (我有一卷仙典。)" },
        { en: "two", zh: "二", ipa: "/tuː/", ex: "Two spirit foxes. (两只灵狐。)" },
        { en: "three", zh: "三", ipa: "/θriː/", ex: "Three spirit fruits. (三枚灵果。)" },
        { en: "four", zh: "四", ipa: "/fɔːr/", ex: "Four spirit hounds. (四只灵犬。)" },
        { en: "five", zh: "五", ipa: "/faɪv/", ex: "Five spirit eggs. (五枚灵蛋。)" },
        { en: "six", zh: "六", ipa: "/sɪks/", ex: "Six spirit birds. (六只灵鸟。)" },
        { en: "seven", zh: "七", ipa: "/ˈsevn/", ex: "Seven days of cultivation. (七天修行。)" },
        { en: "eight", zh: "八", ipa: "/eɪt/", ex: "Eight spirit brushes. (八支灵笔。)" }
      ]
    },
    {
      id: "colors",
      title: "颜色 Colors",
      emoji: "🎨",
      words: [
        { en: "red", zh: "红色", ipa: "/red/", ex: "A red spirit fruit. (一枚红灵果。)" },
        { en: "blue", zh: "蓝色", ipa: "/bluː/", ex: "The blue sky. (蓝色的苍穹。)" },
        { en: "green", zh: "绿色", ipa: "/ɡriːn/", ex: "Green spirit grass. (绿灵草。)" },
        { en: "yellow", zh: "黄色", ipa: "/ˈjeləʊ/", ex: "A yellow spirit duck. (一只黄灵鸭。)" },
        { en: "black", zh: "黑色", ipa: "/blæk/", ex: "A black spirit cat. (一只黑灵猫。)" },
        { en: "white", zh: "白色", ipa: "/waɪt/", ex: "White spirit milk. (白灵乳。)" },
        { en: "pink", zh: "粉色", ipa: "/pɪŋk/", ex: "A pink spirit flower. (一朵粉灵花。)" },
        { en: "orange", zh: "橙色", ipa: "/ˈɒrɪndʒ/", ex: "Orange spirit juice. (橙灵浆。)" }
      ]
    },
    {
      id: "family",
      title: "家人 Family",
      emoji: "👪",
      words: [
        { en: "mother", zh: "妈妈", ipa: "/ˈmʌðər/", ex: "My mother is gentle. (我的母亲很温柔。)" },
        { en: "father", zh: "爸爸", ipa: "/ˈfɑːðər/", ex: "My father is tall. (我的父亲很高。)" },
        { en: "sister", zh: "姐妹", ipa: "/ˈsɪstər/", ex: "I have a sister-disciple. (我有一个师姐妹。)" },
        { en: "brother", zh: "兄弟", ipa: "/ˈbrʌðər/", ex: "My brother is a young disciple. (我师弟是个小弟子。)" },
        { en: "friend", zh: "朋友", ipa: "/frend/", ex: "You are my fellow cultivator. (你是我的道友。)" },
        { en: "baby", zh: "宝宝", ipa: "/ˈbeɪbi/", ex: "A small spirit child. (一个小灵童。)" },
        { en: "grandfather", zh: "爷爷/外公", ipa: "/ˈɡrænfɑːðər/", ex: "My grandfather is old. (我的祖父年高。)" },
        { en: "grandmother", zh: "奶奶/外婆", ipa: "/ˈɡrænmʌðər/", ex: "My grandmother is happy. (我的祖母很安康。)" }
      ]
    },
    {
      id: "food",
      title: "食物 Food",
      emoji: "🍎",
      words: [
        { en: "water", zh: "水", ipa: "/ˈwɔːtər/", ex: "I drink spirit spring water. (我饮灵泉水。)" },
        { en: "apple", zh: "苹果", ipa: "/ˈæpl/", ex: "A red spirit fruit. (一枚红灵果。)" },
        { en: "rice", zh: "米饭", ipa: "/raɪs/", ex: "I eat spirit rice. (我吃灵米。)" },
        { en: "egg", zh: "鸡蛋", ipa: "/eɡ/", ex: "One spirit egg. (一枚灵蛋。)" },
        { en: "bread", zh: "面包", ipa: "/bred/", ex: "I like spirit bread. (我喜欢灵饼。)" },
        { en: "milk", zh: "牛奶", ipa: "/mɪlk/", ex: "White spirit milk. (白灵乳。)" },
        { en: "tea", zh: "茶", ipa: "/tiː/", ex: "Green spirit tea. (仙茶。)" },
        { en: "banana", zh: "香蕉", ipa: "/bəˈnɑːnə/", ex: "A yellow spirit banana. (一根黄灵蕉。)" }
      ]
    },
    {
      id: "animals",
      title: "动物 Animals",
      emoji: "🐶",
      words: [
        { en: "cat", zh: "猫", ipa: "/kæt/", ex: "A black spirit cat. (一只黑灵猫。)" },
        { en: "dog", zh: "狗", ipa: "/dɒɡ/", ex: "The spirit hound is big. (这只灵犬很大。)" },
        { en: "bird", zh: "鸟", ipa: "/bɜːd/", ex: "A small spirit bird. (一只小灵鸟。)" },
        { en: "fish", zh: "鱼", ipa: "/fɪʃ/", ex: "I see a spirit fish. (我看见一条灵鱼。)" },
        { en: "rabbit", zh: "兔子", ipa: "/ˈræbɪt/", ex: "A white spirit rabbit. (一只白灵兔。)" },
        { en: "cow", zh: "牛", ipa: "/kaʊ/", ex: "The spirit ox is big. (这头灵牛很大。)" },
        { en: "duck", zh: "鸭子", ipa: "/dʌk/", ex: "A yellow spirit duck. (一只黄灵鸭。)" },
        { en: "horse", zh: "马", ipa: "/hɔːrs/", ex: "A big spirit horse. (一匹大灵马。)" }
      ]
    },
    {
      id: "verbs",
      title: "动作 Verbs",
      emoji: "🏃",
      words: [
        { en: "eat", zh: "吃", ipa: "/iːt/", ex: "I eat spirit rice. (我吃灵米。)" },
        { en: "drink", zh: "喝", ipa: "/drɪŋk/", ex: "I drink spirit spring water. (我饮灵泉水。)" },
        { en: "go", zh: "去", ipa: "/ɡoʊ/", ex: "I go to the sect. (我去宗门。)" },
        { en: "see", zh: "看见", ipa: "/siː/", ex: "I see a spirit cat. (我看见一只灵猫。)" },
        { en: "like", zh: "喜欢", ipa: "/laɪk/", ex: "I like spirit fruit. (我喜欢灵果。)" },
        { en: "have", zh: "有", ipa: "/hæv/", ex: "I have an ancient scroll. (我有一卷仙典。)" },
        { en: "want", zh: "想要", ipa: "/wɒnt/", ex: "I want spirit spring water. (我想要灵泉水。)" },
        { en: "play", zh: "玩", ipa: "/pleɪ/", ex: "I play with a spirit fox. (我和灵狐嬉戏。)" }
      ]
    },
    {
      id: "daily",
      title: "日常 Daily",
      emoji: "🏠",
      words: [
        { en: "home", zh: "家", ipa: "/hoʊm/", ex: "I return to my cave. (我回洞府。)" },
        { en: "school", zh: "学校", ipa: "/skuːl/", ex: "I go to the sect. (我去宗门。)" },
        { en: "book", zh: "书", ipa: "/bʊk/", ex: "A red ancient scroll. (一卷红仙典。)" },
        { en: "pen", zh: "笔", ipa: "/pen/", ex: "I have a spirit brush. (我有一支灵笔。)" },
        { en: "sun", zh: "太阳", ipa: "/sʌn/", ex: "The sun is hot. (太阳灼热。)" },
        { en: "moon", zh: "月亮", ipa: "/muːn/", ex: "The moon is pale. (月色清冷。)" },
        { en: "day", zh: "白天/天", ipa: "/deɪ/", ex: "A good cultivation day. (修行顺遂的一日。)" },
        { en: "night", zh: "夜晚", ipa: "/naɪt/", ex: "Good night, little fox! (晚安，小狐！)" }
      ]
    }
  ];

  // ---------- 语法课 (A1) ----------
  // practice: { q(题干), a(正确答案,小写), hint(提示) }
  const grammar = [
    {
      id: "g1",
      title: "人称与 be 动词",
      level: "A1",
      explain:
        "英语用 am / is / are 表示“是”。主语不同，用的词也不同：I 用 am，you/we/they 用 are，he/she/it 用 is。这是最基础的句子骨架。",
      points: [
        { en: "I am a cultivator.", zh: "我是一名修士。" },
        { en: "You are my fellow cultivator.", zh: "你是我的道友。" },
        { en: "He is a disciple of the sect.", zh: "他是宗门的一名弟子。" },
        { en: "She is a spirit fox.", zh: "她是一只灵狐。" },
        { en: "It is a flying sword.", zh: "它是一柄飞剑。" },
        { en: "We are cultivators.", zh: "我们是修士。" },
        { en: "They are disciples.", zh: "他们是弟子。" }
      ],
      practice: [
        { q: "I ___ a cultivator. (我是一名修士。)", a: "am", hint: "I 后面用 am" },
        { q: "She ___ my master. (她是我的师尊。)", a: "is", hint: "She 是第三人称单数，用 is" },
        { q: "They ___ happy. (他们很开心。)", a: "are", hint: "They 是复数，用 are" }
      ]
    },
    {
      id: "g2",
      title: "冠词 a / an / the",
      level: "A1",
      explain:
        "a/an 表示“一个”（泛指），the 表示“这个/那个”（特指）。a 用在辅音音素前，an 用在元音音素前（如 apple, egg, orange）。",
      points: [
        { en: "a spirit fox", zh: "一只灵狐" },
        { en: "an immortal peach", zh: "一枚仙桃" },
        { en: "an azure egg", zh: "一枚青玉蛋" },
        { en: "the ancient scroll", zh: "那卷仙典（特指）" }
      ],
      practice: [
        { q: "I have ___ spirit fox. (我有一只灵狐。)", a: "a", hint: "spirit fox 以辅音 /s/ 开头，用 a" },
        { q: "I eat ___ immortal peach. (我吃一枚仙桃。)", a: "an", hint: "immortal 以元音 /ɪ/ 开头，用 an" },
        { q: "___ sun is hot. (太阳很热。)", a: "the", hint: "世上唯一的太阳，用 the" }
      ]
    },
    {
      id: "g3",
      title: "名词复数 +s",
      level: "A1",
      explain:
        "大多数名词变复数直接加 -s；以 s/x/ch/sh 结尾加 -es；辅音+y 结尾变 ies。先掌握最常见的 +s 规则。",
      points: [
        { en: "one spirit fox to two spirit foxes", zh: "一只灵狐 → 两只灵狐" },
        { en: "one ancient scroll to three ancient scrolls", zh: "一卷仙典 → 三卷仙典" },
        { en: "one spirit hound to four spirit hounds", zh: "一只灵犬 → 四只灵犬" }
      ],
      practice: [
        { q: "I see two ___. (灵狐)", a: "spirit foxes", hint: "spirit fox 直接加 s" },
        { q: "Three red ___. (仙典)", a: "ancient scrolls", hint: "ancient scroll 直接加 s" },
        { q: "Four small ___. (灵犬)", a: "spirit hounds", hint: "spirit hound 直接加 s" }
      ]
    },
    {
      id: "g4",
      title: "一般现在时",
      level: "A1",
      explain:
        "表示经常做的事。主语是 he/she/it 时，动词一般加 -s（如 eats, drinks, plays）；I/you/we/they 用原形。",
      points: [
        { en: "I eat spirit rice.", zh: "我吃灵米。" },
        { en: "He eats spirit rice.", zh: "他吃灵米。" },
        { en: "We cultivate at the sect.", zh: "我们在宗门修炼。" }
      ],
      practice: [
        { q: "I ___ spirit spring water. (喝)", a: "drink", hint: "I 用动词原形" },
        { q: "She ___ a spirit fruit. (吃)", a: "eats", hint: "She 第三人称单数，eat 加 s" },
        { q: "They ___ at the cave. (玩)", a: "play", hint: "They 用原形 play" }
      ]
    },
    {
      id: "g5",
      title: "一般疑问句",
      level: "A1",
      explain:
        "把 am/is/are 或 do/does 提到句首就能变成“是/吗”问句。肯定回答 Yes, 否定回答 No。",
      points: [
        { en: "Are you a cultivator? — Yes, I am.", zh: "你是修士吗？——是的，我是。" },
        { en: "Do you like spirit tea? — No, I don't.", zh: "你喜欢仙茶吗？——不，我不喜欢。" },
        { en: "Is it a flying sword? — Yes, it is.", zh: "它是飞剑吗？——是的。" }
      ],
      practice: [
        { q: "___ you my fellow cultivator? (你是我的道友吗？)", a: "are", hint: "you 搭配 are" },
        { q: "___ she like spirit fruit? (她喜欢灵果吗？)", a: "does", hint: "She 第三人称，用 does" },
        { q: "___ it a spirit fox? (它是一只灵狐吗？)", a: "is", hint: "it 搭配 is" }
      ]
    },
    {
      id: "g6",
      title: "特殊疑问句",
      level: "A1",
      explain:
        "用疑问词开头问具体信息：What(什么) / Where(哪里) / Who(谁) / How(怎样)。结构是 疑问词 + 助动词 + 主语 + 动词。",
      points: [
        { en: "What is your dao name?", zh: "你的道号是什么？" },
        { en: "Where is the ancient scroll?", zh: "仙典在哪里？" },
        { en: "How are you?", zh: "你好吗？" }
      ],
      practice: [
        { q: "___ is your dao name? (你的道号是什么？)", a: "what", hint: "问“什么”用 What" },
        { q: "___ are you? (你好吗？)", a: "how", hint: "问状况用 How" },
        { q: "___ is the spirit fox? (灵狐在哪里？)", a: "where", hint: "问地点用 Where" }
      ]
    },
    {
      id: "g7",
      title: "物主形容词",
      level: "A1",
      explain:
        "表示“我的/你的/他的…”：my / your / his / her / our / their。放在名词前面。",
      points: [
        { en: "my ancient scroll", zh: "我的仙典" },
        { en: "your spirit brush", zh: "你的灵笔" },
        { en: "his spirit fox", zh: "他的灵狐" },
        { en: "her flying sword", zh: "她的飞剑" }
      ],
      practice: [
        { q: "___ dao name is Xuanji. (我的道号是玄机。)", a: "my", hint: "表示“我的”" },
        { q: "___ master is kind. (你的师尊很慈祥。)", a: "your", hint: "表示“你的”" },
        { q: "___ mother is gentle. (他的师娘很温柔。)", a: "his", hint: "表示“他的”" }
      ]
    },
    {
      id: "g8",
      title: "常见形容词",
      level: "A1",
      explain:
        "形容词用来描述名词，放在名词前面，不变形：big/small, happy/sad, new/old, hot/cold。",
      points: [
        { en: "a big spirit hound", zh: "一只大灵犬" },
        { en: "a small spirit fox", zh: "一只小灵狐" },
        { en: "a happy spirit child", zh: "一个开心的灵童" },
        { en: "hot spirit spring", zh: "热的灵泉" }
      ],
      practice: [
        { q: "A ___ spirit fox. (小)", a: "small", hint: "小的 = small" },
        { q: "___ spirit spring. (热)", a: "hot", hint: "热的 = hot" },
        { q: "A ___ ancient scroll. (新)", a: "new", hint: "新的 = new" }
      ]
    },
    {
      id: "g9",
      title: "指示代词 this/that/these/those",
      level: "A1",
      explain:
        "this（这个，近处单数）、that（那个，远处单数）、these（这些，近处复数）、those（那些，远处复数），用来指人或物离说话者的远近。",
      points: [
        { en: "this ancient scroll", zh: "这卷仙典（近处）" },
        { en: "that spirit fox", zh: "那只灵狐（远处）" },
        { en: "these spirit fruits", zh: "这些灵果" },
        { en: "those spirit hounds", zh: "那些灵犬" }
      ],
      practice: [
        { q: "___ is my ancient scroll. (这是我的仙典，近处)", a: "this", hint: "近处单数用 this" },
        { q: "___ are my fellow cultivators. (这些是我的道友)", a: "these", hint: "复数近处用 these" },
        { q: "___ is your spirit brush? (那是你的灵笔吗，远处)", a: "that", hint: "远处单数用 that" }
      ]
    },
    {
      id: "g10",
      title: "人称代词 主格/宾格",
      level: "A1",
      explain:
        "主格做主语：I/you/he/she/it/we/they；宾格做宾语（在动词或介词后）：me/you/him/her/it/us/them。如 I love him.",
      points: [
        { en: "I follow you.", zh: "我追随你。" },
        { en: "He protects me.", zh: "他护佑我。" },
        { en: "We see them.", zh: "我们看见他们。" }
      ],
      practice: [
        { q: "She protects ___. (她护佑我)", a: "me", hint: "protect 后接宾格 me" },
        { q: "We honor ___. (我们敬重他)", a: "him", hint: "honor 后接宾格 him" },
        { q: "They call ___. (他们呼唤我们)", a: "us", hint: "call 后接宾格 us" }
      ]
    },
    {
      id: "g11",
      title: "否定句 not / don't / doesn't",
      level: "A1",
      explain:
        "在 am/is/are 后加 not 表否定；实义动词前加 don't（I/you/we/they）或 doesn't（he/she/it），动词恢复原形。",
      points: [
        { en: "I am not tired.", zh: "我不疲倦。" },
        { en: "He does not like spirit tea.", zh: "他不喜欢仙茶。" },
        { en: "They don't cultivate together.", zh: "他们不一起修炼。" }
      ],
      practice: [
        { q: "I ___ like spirit brew. (我不喜欢仙酿)", a: "don't", hint: "I 用 don't" },
        { q: "She ___ eat spirit meat. (她不吃灵兽肉)", a: "doesn't", hint: "She 用 doesn't" },
        { q: "It is ___ a flying sword. (它不是一柄飞剑)", a: "not", hint: "be 动词后加 not" }
      ]
    },
    {
      id: "g12",
      title: "方位介词 in / on / under",
      level: "A1",
      explain:
        "表示位置：in（在…里）、on（在…上）、under（在…下）、behind（在…后）。",
      points: [
        { en: "The ancient scroll is on the jade desk.", zh: "仙典在玉案上。" },
        { en: "The spirit fox is under the meditation stool.", zh: "灵狐在蒲团下。" },
        { en: "The spirit orb is in the treasure box.", zh: "灵珠在法宝匣里。" }
      ],
      practice: [
        { q: "The jade cup is ___ the table. (玉盏在桌上)", a: "on", hint: "表面之上用 on" },
        { q: "The shoes are ___ the bed. (鞋在玉床下)", a: "under", hint: "下方用 under" },
        { q: "The spirit brush is ___ the pouch. (灵笔在乾坤袋里)", a: "in", hint: "内部用 in" }
      ]
    },
    {
      id: "g13",
      title: "There is / There are",
      level: "A1",
      explain:
        "表示“某处有某物”：单数或不可数用 There is，复数用 There are。否定加 no 或 not any。",
      points: [
        { en: "There is a spirit fox on the stool.", zh: "蒲团上有一只灵狐。" },
        { en: "There are two ancient scrolls on the desk.", zh: "案上有两卷仙典。" },
        { en: "There is some spirit spring in the jade cup.", zh: "玉盏里有些灵泉。" }
      ],
      practice: [
        { q: "___ is a spirit hound in the garden. (灵园里有一只灵犬)", a: "there", hint: "“有”用 There is" },
        { q: "___ are many disciples in the hall. (道场里有很多弟子)", a: "there", hint: "复数用 There are" },
        { q: "___ is some spirit milk in the cup. (杯里有些灵乳)", a: "there", hint: "不可数用 There is" }
      ]
    },
    {
      id: "g14",
      title: "情态动词 can（能力/许可）",
      level: "A1",
      explain:
        "can 表示“能/会”，后接动词原形。否定 can't，疑问把 can 提前。所有人称都用 can，不变形。",
      points: [
        { en: "I can ride the flying sword.", zh: "我会御飞剑。" },
        { en: "She can speak the ancient tongue.", zh: "她会说古仙语。" },
        { en: "Can you guard the gate?", zh: "你能守山门吗？" }
      ],
      practice: [
        { q: "I ___ ride the flying sword. (我会御飞剑)", a: "can", hint: "能力用 can" },
        { q: "He ___ sing the dao chant. (他唱道吟唱得好)", a: "can", hint: "he 也用 can" },
        { q: "___ you open the gate? (你能开山门吗)", a: "can", hint: "疑问 can 提前" }
      ]
    },
    {
      id: "g15",
      title: "have / has（拥有）",
      level: "A1",
      explain:
        "表示“有”：I/you/we/they 用 have，he/she/it 用 has。否定或疑问用 do/does + have。",
      points: [
        { en: "I have a fellow cultivator.", zh: "我有一个道友。" },
        { en: "She has a red storage pouch.", zh: "她有一个红色乾坤袋。" },
        { en: "They have two spirit hounds.", zh: "他们有两只灵犬。" }
      ],
      practice: [
        { q: "He ___ a new flying sword. (他有一柄新飞剑)", a: "has", hint: "He 用 has" },
        { q: "We ___ a big cave dwelling. (我们有一座大洞府)", a: "have", hint: "We 用 have" },
        { q: "She ___ long hair. (她有长发)", a: "has", hint: "She 用 has" }
      ]
    },
    {
      id: "g16",
      title: "颜色与 What color",
      level: "A1",
      explain:
        "颜色词放在名词前，如 a red apple。问颜色用 What color + be + 主语。",
      points: [
        { en: "a red spirit fruit", zh: "一枚红灵果" },
        { en: "a blue sky", zh: "蓝色的苍穹" },
        { en: "What color is your pouch?", zh: "你的乾坤袋是什么颜色？" }
      ],
      practice: [
        { q: "___ color is the sky? (苍穹是什么颜色)", a: "what", hint: "问颜色用 What color" },
        { q: "I have a ___ spirit brush. (我有一支蓝色的灵笔)", a: "blue", hint: "蓝色 = blue" },
        { q: "She wears a ___ robe. (她穿一件红色的仙袍)", a: "red", hint: "红色 = red" }
      ]
    },
    {
      id: "g17",
      title: "like + 名词 / like doing",
      level: "A1",
      explain:
        "like 表示“喜欢”，后接名词或动名词（doing）。He/She 用 likes。问句用 Do/Does you like…?",
      points: [
        { en: "I like spirit fruit.", zh: "我喜欢灵果。" },
        { en: "She likes reading ancient scrolls.", zh: "她喜欢读仙典。" },
        { en: "Do you like spirit tea?", zh: "你喜欢仙茶吗？" }
      ],
      practice: [
        { q: "I ___ spirit music. (我喜欢仙乐)", a: "like", hint: "I 用 like" },
        { q: "He ___ spirit foxes. (他喜欢灵狐)", a: "likes", hint: "He 用 likes" },
        { q: "She ___ dancing. (她喜欢起舞)", a: "likes", hint: "like + doing" }
      ]
    },
    {
      id: "g18",
      title: "数字与年龄 How old",
      level: "A1",
      explain:
        "1–20 为基础数词，20 以上以 -ty 结尾（thirty, forty…）。问年龄用 How old are you? 回答 I am … years old.",
      points: [
        { en: "I am seven years on the path.", zh: "我修行七年了。" },
        { en: "There are twenty disciples.", zh: "有二十名弟子。" },
        { en: "My dao number is 138.", zh: "我的道号编号是 138。" }
      ],
      practice: [
        { q: "How ___ are you on the path? (你修行多少年了)", a: "old", hint: "问修龄用 How old" },
        { q: "I am ___ years on the path. (我修行十年了)", a: "ten", hint: "十 = ten" },
        { q: "There are ___ ancient scrolls. (有十二卷仙典)", a: "twelve", hint: "十二 = twelve" }
      ]
    },
    {
      id: "g19",
      title: "时间表达 What time / 钟点",
      level: "A1",
      explain:
        "问时间用 What time is it? 整点用数字 + o'clock，如 It is three o'clock。具体钟点前用介词 at。",
      points: [
        { en: "What time is it? — It is 3 o'clock.", zh: "几时了？——三时。" },
        { en: "I eat the morning meal at 7.", zh: "我七时用晨膳。" },
        { en: "The cultivation class starts at 9 o'clock.", zh: "九时开始修行课。" }
      ],
      practice: [
        { q: "What ___ is it? (几时了)", a: "time", hint: "问时间用 What time" },
        { q: "We go to the sect ___ 8 o'clock. (我们八时去宗门)", a: "at", hint: "具体时辰前用 at" },
        { q: "It is 6 ___. (六时整)", a: "o'clock", hint: "整时用 o'clock" }
      ]
    },
    {
      id: "g20",
      title: "常见动词短语",
      level: "A1",
      explain:
        "英语常用“动词 + 介词/副词”构成短语：go to school（去上学）、get up（起床）、go home（回家，home 前无 to）。",
      points: [
        { en: "I go to the sect by cloud carriage.", zh: "我乘云车去宗门。" },
        { en: "He gets up at 7.", zh: "他七时起身。" },
        { en: "They return to the cave at 5.", zh: "他们五时回洞府。" }
      ],
      practice: [
        { q: "I ___ to the sect every day. (我每天去宗门)", a: "go", hint: "去宗门用 go to the sect" },
        { q: "She ___ the dao ball after class. (她课后蹴仙球)", a: "plays", hint: "玩球用 play，She 加 s" },
        { q: "He ___ an ancient scroll in the library. (他在藏经阁读一卷仙典)", a: "reads", hint: "读书用 read，He 加 s" }
      ]
    },
    {
      id: "g21",
      title: "现在进行时 be + doing",
      level: "A2",
      explain:
        "表示正在发生的动作：am/is/are + 动词 -ing。如 I am eating. 常与 now（现在）连用。",
      points: [
        { en: "I am reading an ancient scroll now.", zh: "我现在正在读一卷仙典。" },
        { en: "She is watching the cloud sea.", zh: "她正在看云海。" },
        { en: "They are playing the dao ball.", zh: "他们正在蹴仙球。" }
      ],
      practice: [
        { q: "He is ___ a spirit fruit. (他正在吃一枚灵果)", a: "eating", hint: "eat 的 -ing 形式" },
        { q: "We are ___ games. (我们正在行棋)", a: "playing", hint: "play + ing" },
        { q: "I am ___ a letter. (我正在写一封信)", a: "writing", hint: "write 去 e 加 ing" }
      ]
    },
    {
      id: "g22",
      title: "规则动词过去式 -ed",
      level: "A2",
      explain:
        "规则动词过去式加 -ed：help→helped，play→played；以 e 结尾加 -d：live→lived；辅音+y 变 ied：study→studied。",
      points: [
        { en: "I walked to the sect.", zh: "我步行去了宗门。" },
        { en: "She helped her master.", zh: "她协助了师尊。" },
        { en: "He studied the ancient tongue.", zh: "他研习了古仙语。" }
      ],
      practice: [
        { q: "They ___ in the garden yesterday. (他们昨天在灵园玩)", a: "played", hint: "play + ed" },
        { q: "He ___ me last night. (他昨夜护佑了我)", a: "helped", hint: "help + ed" },
        { q: "She ___ the cloud sea after dinner. (她晚饭后看了云海)", a: "watched", hint: "watch + ed" }
      ]
    },
    {
      id: "g23",
      title: "不规则动词过去式（常用）",
      level: "A2",
      explain:
        "很多常用动词过去式不规则，需记忆：go→went, eat→ate, come→came, see→saw, have→had, buy→bought。",
      points: [
        { en: "I went to the spirit zoo.", zh: "我去了灵兽园。" },
        { en: "She ate a spirit cake.", zh: "她吃了一块灵糕。" },
        { en: "He came home late.", zh: "他回洞府很晚。" }
      ],
      practice: [
        { q: "I ___ to the garden yesterday. (我昨天去了灵园)", a: "went", hint: "go 的过去式 went" },
        { q: "We ___ spirit pizza for dinner. (我们晚饭吃了灵披萨)", a: "ate", hint: "eat 的过去式 ate" },
        { q: "She ___ a gift for her fellow cultivator. (她给道友备了一份礼)", a: "bought", hint: "buy 的过去式 bought" }
      ]
    },
    {
      id: "g24",
      title: "一般过去时 疑问/否定 did",
      level: "A2",
      explain:
        "过去时疑问和否定用 did（所有人称）：Did you go? / I didn't go. 后面的动词恢复原形。",
      points: [
        { en: "Did you watch the ceremony?", zh: "你看了那场典礼吗？" },
        { en: "He didn't come to the sect.", zh: "他没来宗门。" },
        { en: "Where did they go?", zh: "他们去哪儿了？" }
      ],
      practice: [
        { q: "___ you finish your meditation? (你做完功课了吗)", a: "did", hint: "过去时疑问用 Did" },
        { q: "She ___ like the spirit meal. (她不喜欢那灵膳)", a: "didn't", hint: "过去时否定 didn't" },
        { q: "Where ___ he go yesterday? (他昨天去哪了)", a: "did", hint: "疑问用 did，动词原形" }
      ]
    },
    {
      id: "g25",
      title: "将来时 will / be going to",
      level: "A2",
      explain:
        "表示将来：will + 动词原形（临时决定）；be going to + 动词（计划或预测）。如 I will help you. / I am going to study.",
      points: [
        { en: "I will call you tomorrow.", zh: "我明日会传音给你。" },
        { en: "She is going to visit the immortal mountain.", zh: "她打算去仙山。" },
        { en: "It is going to rain.", zh: "要落雨了。" }
      ],
      practice: [
        { q: "I ___ help you. (我会帮你)", a: "will", hint: "将来用 will" },
        { q: "He is ___ to buy a new flying sword. (他打算买柄新飞剑)", a: "going", hint: "be going to 表打算" },
        { q: "They ___ travel next week. (他们下周要远游)", a: "will", hint: "将来用 will" }
      ]
    },
    {
      id: "g26",
      title: "形容词比较级",
      level: "A2",
      explain:
        "两者比较用比较级：短词加 -er（tall→taller），多音节用 more + 原级（more beautiful）。than 引出比较对象。",
      points: [
        { en: "He is taller than me.", zh: "他比我高。" },
        { en: "This ancient scroll is bigger.", zh: "这卷仙典更大。" },
        { en: "She is more careful.", zh: "她更细心。" }
      ],
      practice: [
        { q: "Xuanji is ___ than the boy. (玄机比那少年高)", a: "taller", hint: "tall 加 er" },
        { q: "My pouch is ___ than yours. (我的乾坤袋比你的大)", a: "bigger", hint: "big 双写 g 加 er" },
        { q: "The ancient tongue is ___ difficult than math. (古仙语比算术更难)", a: "more", hint: "多音节用 more" }
      ]
    },
    {
      id: "g27",
      title: "形容词最高级",
      level: "A2",
      explain:
        "三者及以上比较用最高级：短词加 -est（tallest），多音节 most + 原级。常加 the。",
      points: [
        { en: "He is the tallest disciple.", zh: "他是最高的弟子。" },
        { en: "This is the best day.", zh: "这是最好的一日。" },
        { en: "She is the most beautiful.", zh: "她是最美的。" }
      ],
      practice: [
        { q: "He is the ___ in the hall. (他是道场里最高的)", a: "tallest", hint: "tall 加 est" },
        { q: "This is the ___ ancient scroll. (这是最大的仙典)", a: "biggest", hint: "big 双写 g 加 est" },
        { q: "She is the ___ disciple. (她是最好的弟子)", a: "best", hint: "good 的最高级 best" }
      ]
    },
    {
      id: "g28",
      title: "副词（方式）",
      level: "A2",
      explain:
        "副词修饰动词，表示方式。多数形容词后加 -ly：quick→quickly, slow→slowly。good 的副词是 well。",
      points: [
        { en: "He rides the sword fast.", zh: "他御剑快。" },
        { en: "She speaks slowly.", zh: "她语速缓。" },
        { en: "He did it well.", zh: "他做得好。" }
      ],
      practice: [
        { q: "She sings ___. (她唱得好)", a: "well", hint: "good 的副词是 well" },
        { q: "They walk ___. (他们走得很慢)", a: "slowly", hint: "slow + ly" },
        { q: "He finished the work ___. (他很快完成了功课)", a: "quickly", hint: "quick + ly" }
      ]
    },
    {
      id: "g29",
      title: "some / any",
      level: "A2",
      explain:
        "some 用于肯定句（一些），any 用于否定或疑问。There is some water. / Do you have any money?",
      points: [
        { en: "I have some fellow cultivators.", zh: "我有一些道友。" },
        { en: "I don't have any spirit stones.", zh: "我没有任何灵石。" },
        { en: "Do you have any questions?", zh: "你有任何疑问吗？" }
      ],
      practice: [
        { q: "There is ___ spirit milk in the jade cup. (玉盏里有些灵乳)", a: "some", hint: "肯定句用 some" },
        { q: "I don't have ___ time. (我没有任何光阴)", a: "any", hint: "否定句用 any" },
        { q: "Do you have ___ fellow cultivators? (你有道友吗)", a: "any", hint: "疑问句用 any" }
      ]
    },
    {
      id: "g30",
      title: "much / many / a lot of",
      level: "A2",
      explain:
        "many 接可数复数，much 接不可数，a lot of 两者皆可。常用于疑问或否定。",
      points: [
        { en: "How many spirit fruit do you have?", zh: "你有多少枚灵果？" },
        { en: "How much spirit spring do you need?", zh: "你需要多少灵泉？" },
        { en: "I have a lot of ancient scrolls.", zh: "我有很多卷仙典。" }
      ],
      practice: [
        { q: "How ___ ancient scrolls are there? (有多少卷仙典)", a: "many", hint: "可数复数用 many" },
        { q: "How ___ spirit spring do you have? (你有多少灵泉)", a: "much", hint: "不可数用 much" },
        { q: "We have ___ of spirit food. (我们有很多灵膳)", a: "a lot", hint: "a lot of 两者皆可" }
      ]
    },
    {
      id: "g31",
      title: "不可数名词",
      level: "A2",
      explain:
        "water, bread, rice, money, information 等不可数，没有复数，不能直接加 a/an，表数量用 some 或 a piece of。",
      points: [
        { en: "I need some spirit spring water.", zh: "我需要一些灵泉之水。" },
        { en: "Can I have a piece of spirit bread?", zh: "我能要一片灵饼吗？" },
        { en: "We have much spirit knowledge.", zh: "我们有很多仙识。" }
      ],
      practice: [
        { q: "Please give me some water from the spring. (请给我一些灵泉之水)", a: "water", hint: "水是不可数名词" },
        { q: "I eat bread every morning in the cave. (我每天在洞府吃饼)", a: "bread", hint: "面包不可数" },
        { q: "This is useful information about the dao. (这是关于大道的有用的仙识)", a: "information", hint: "信息不可数" }
      ]
    },
    {
      id: "g32",
      title: "祈使句",
      level: "A2",
      explain:
        "祈使句表示命令、请求或建议，以动词原形开头，否定加 Don't。如 Open the door. / Don't run.",
      points: [
        { en: "Open the gate.", zh: "打开山门。" },
        { en: "Don't be late.", zh: "不要迟到。" },
        { en: "Please sit on the stool.", zh: "请坐蒲团。" }
      ],
      practice: [
        { q: "___ the gate, please. (请开山门)", a: "open", hint: "祈使句动词原形开头" },
        { q: "___ talk in the hall. (道场中不要说话)", a: "don't", hint: "否定祈使用 Don't" },
        { q: "___ careful! (小心)", a: "be", hint: "be 开头的祈使句" }
      ]
    },
    {
      id: "g33",
      title: "情态动词 should / must",
      level: "A2",
      explain:
        "should 表建议（应该），must 表必须。后接动词原形。否定 shouldn't / mustn't。",
      points: [
        { en: "You should cultivate hard.", zh: "你应当勤修。" },
        { en: "I must go to the sect now.", zh: "我现在必须去宗门了。" },
        { en: "We mustn't be late.", zh: "我们绝不能迟到。" }
      ],
      practice: [
        { q: "You ___ eat more spirit herbs. (你应当多食灵草)", a: "should", hint: "建议用 should" },
        { q: "I ___ finish my meditation. (我必须完成功课)", a: "must", hint: "必须用 must" },
        { q: "He ___ smoke here. (他不该在此地吐纳)", a: "shouldn't", hint: "不应该用 shouldn't" }
      ]
    },
    {
      id: "g34",
      title: "感叹句 What / How",
      level: "A2",
      explain:
        "What + (a/an) + 名词，How + 形容词或副词。如 What a big dog! / How tall he is!",
      points: [
        { en: "What a blessed day!", zh: "多祥瑞的一日！" },
        { en: "How clever the boy is!", zh: "这少年多聪慧！" },
        { en: "What fine spirit food!", zh: "多好的灵膳！" }
      ],
      practice: [
        { q: "___ a big cave! (多大的洞府)", a: "what", hint: "接名词用 What" },
        { q: "___ fast he rides! (他御剑多快)", a: "how", hint: "接副词用 How" },
        { q: "___ a good idea! (多好的妙法)", a: "what", hint: "接名词用 What" }
      ]
    },
    {
      id: "g35",
      title: "连词 and / but / because / so",
      level: "A2",
      explain:
        "连词连接句子：and（并且）、but（但是，转折）、because（因为）、so（所以，结果）。",
      points: [
        { en: "I like tea and spirit herbs.", zh: "我喜欢茶与灵草。" },
        { en: "He is rich but not happy.", zh: "他富有却不快乐。" },
        { en: "I stayed in the cave because it rained.", zh: "我留在洞府因为落雨了。" }
      ],
      practice: [
        { q: "She is tired ___ she is happy. (她累了却开心)", a: "but", hint: "转折用 but" },
        { q: "I cultivate hard ___ I want to ascend. (我勤修因为想飞升)", a: "because", hint: "原因用 because" },
        { q: "He was hungry ___ he ate a lot. (他饿了所以他吃了很多)", a: "so", hint: "结果用 so" }
      ]
    },
    {
      id: "g36",
      title: "频率副词",
      level: "A2",
      explain:
        "always（总是）> often（经常）> sometimes（有时）> never（从不），放在 be 之后、实义动词之前。",
      points: [
        { en: "I always get up early.", zh: "我总是早起。" },
        { en: "He often plays the dao ball.", zh: "他经常蹴仙球。" },
        { en: "We never eat junk food.", zh: "我们从不吃凡俗浊食。" }
      ],
      practice: [
        { q: "She ___ reads scrolls before bed. (她常在睡前读仙典)", a: "often", hint: "经常用 often" },
        { q: "He is ___ late for class. (他上课从不迟到)", a: "never", hint: "从不用 never" },
        { q: "I ___ drink spirit tea in the morning. (我总在晨间饮仙茶)", a: "always", hint: "总是用 always" }
      ]
    },
    {
      id: "g37",
      title: "would like（想要/礼貌请求）",
      level: "A2",
      explain:
        "would like 是 want 的礼貌说法（想要）。Would you like…? 你想…吗？后接名词或 to do。",
      points: [
        { en: "I would like some spirit spring water.", zh: "我想要一些灵泉之水。" },
        { en: "Would you like spirit tea or coffee?", zh: "你想要仙茶还是仙酿？" },
        { en: "She would like to return to the cave.", zh: "她想回洞府。" }
      ],
      practice: [
        { q: "I ___ like a spirit peach. (我想要一枚仙桃)", a: "would", hint: "想要用 would like" },
        { q: "___ you like some spirit cake? (你想要些灵糕吗)", a: "would", hint: "礼貌询问用 Would you like" },
        { q: "He ___ like to sleep. (他想歇息)", a: "would", hint: "would like to do" }
      ]
    },
    {
      id: "g38",
      title: "名词所有格 's",
      level: "A2",
      explain:
        "表示“…的”：单数名词加 's（Tom's book），以 s 结尾的复数加 '（the teachers' room）。",
      points: [
        { en: "This is Xuanji's spirit fox.", zh: "这是玄机的灵狐。" },
        { en: "The disciples' room is clean.", zh: "弟子们的静室很干净。" },
        { en: "My sister's flying sword is new.", zh: "我师姐的飞剑是新的。" }
      ],
      practice: [
        { q: "This is ___ ancient scroll. (这是玛丽的仙典)", a: "mary's", hint: "人名加 's" },
        { q: "The ___ room is clean. (老师们的静室很干净)", a: "teachers'", hint: "以 s 结尾复数加 '" },
        { q: "My ___ dao name is Lily. (我师姐的道号是莉莉)", a: "sister's", hint: "单数名词加 's" }
      ]
    },
    {
      id: "g39",
      title: "反身代词",
      level: "A2",
      explain:
        "反身代词指“自己”：myself, yourself, himself, herself, itself, ourselves, yourselves, themselves。",
      points: [
        { en: "I hurt myself in training.", zh: "我在修炼中伤到了自己。" },
        { en: "He enjoys himself on the path.", zh: "他行路中自得其乐。" },
        { en: "We did it by ourselves.", zh: "我们独自完成了它。" }
      ],
      practice: [
        { q: "She cooked ___ a meal. (她为自己做了一顿灵膳)", a: "herself", hint: "她自己用 herself" },
        { q: "I taught ___ the ancient tongue. (我自学了古仙语)", a: "myself", hint: "我自己用 myself" },
        { q: "They enjoyed ___ at the feast. (他们在宴上玩得尽兴)", a: "themselves", hint: "他们自己用 themselves" }
      ]
    },
    {
      id: "g40",
      title: "过去进行时 was/were + doing",
      level: "A2",
      explain:
        "表示过去某时正在进行的动作：was（单数）/were（复数）+ 动词 -ing。如 I was reading at 8.",
      points: [
        { en: "I was watching the cloud sea at 8 pm.", zh: "晚八时我正在看云海。" },
        { en: "They were playing outside.", zh: "他们正在外面嬉戏。" },
        { en: "What were you doing?", zh: "你当时在做什么？" }
      ],
      practice: [
        { q: "He was ___ an ancient scroll. (他当时正在读一卷仙典)", a: "reading", hint: "read + ing" },
        { q: "We were ___ the dao ball. (我们当时正在蹴仙球)", a: "playing", hint: "play + ing" },
        { q: "I ___ sleeping at noon. (我中午正在歇息)", a: "was", hint: "单数用 was" }
      ]
    },
    {
      id: "g41",
      title: "现在完成时 have/has + done",
      level: "A2",
      explain:
        "表示过去发生、与现在有关的动作：have/has + 过去分词。如 I have eaten. / She has gone.",
      points: [
        { en: "I have finished my meditation.", zh: "我已经做完功课了。" },
        { en: "She has lost her spirit brush.", zh: "她弄丢了灵笔。" },
        { en: "Have you seen my spirit fox?", zh: "你见过我的灵狐吗？" }
      ],
      practice: [
        { q: "I have ___ that ceremony. (我已经看过那场典礼了)", a: "seen", hint: "see 的过去分词 seen" },
        { q: "He has ___ to the immortal mountain. (他去了仙山)", a: "gone", hint: "go 的过去分词 gone" },
        { q: "We have ___ the work. (我们已经完成功课了)", a: "finished", hint: "finish + ed（规则）" }
      ]
    },
    {
      id: "g42",
      title: "真实条件句 if",
      level: "A2",
      explain:
        "if 引导条件“如果…就…”：主句用将来时，if 从句用一般现在时。If it rains, I will stay home.",
      points: [
        { en: "If it rains, we will stay in the cave.", zh: "如果落雨，我们就留在洞府。" },
        { en: "If you cultivate, you will ascend.", zh: "如果你勤修，你便会飞升。" },
        { en: "If he comes, call me.", zh: "如果他来，唤我。" }
      ],
      practice: [
        { q: "If you ___ hard, you will succeed. (如果你勤修，便会成功)", a: "study", hint: "if 从句用一般现在时" },
        { q: "If it ___, we will cancel the trip. (如果落雨，我们便取消行程)", a: "rains", hint: "it 用 rains" },
        { q: "If she ___, please tell me. (如果她来，请告诉我)", a: "comes", hint: "she 用 comes" }
      ]
    },
    {
      id: "g43",
      title: "被动语态（简单）",
      level: "A2",
      explain:
        "被动表示“被…”：be + 过去分词。如 The book is written by Tom. 强调动作的承受者。",
      points: [
        { en: "The ancient tongue is spoken in the sect.", zh: "古仙语在宗门中被传习。" },
        { en: "The letter was written by him.", zh: "这封传书是他写的。" },
        { en: "The window is broken.", zh: "窗棂破了。" }
      ],
      practice: [
        { q: "The spirit cake is ___ by my master. (灵糕是我师尊做的)", a: "made", hint: "make 的过去分词 made" },
        { q: "The cave was ___ last year. (这洞府去年建的)", a: "built", hint: "build 的过去分词 built" },
        { q: "The hall is ___ every day. (道场每日被清扫)", a: "cleaned", hint: "clean + ed" }
      ]
    },
    {
      id: "g44",
      title: "定语从句 who / that",
      level: "A2",
      explain:
        "定语从句修饰名词，who 或 that 指人。The boy who is tall is my brother.",
      points: [
        { en: "The girl who sings well is Lucy.", zh: "唱得好听的少女是露西。" },
        { en: "The man that I met is a healer.", zh: "我遇到的那位道友是医修。" },
        { en: "He is the disciple who won the prize.", zh: "他是夺魁的那名弟子。" }
      ],
      practice: [
        { q: "The boy ___ is playing is my brother. (正在玩耍的少年是我师弟)", a: "who", hint: "指人用 who" },
        { q: "The woman ___ called you is my aunt. (给你传音的那位仙子是我姑姑)", a: "that", hint: "指人也可用 that" },
        { q: "He is the man ___ helped me. (他是护佑我的那位道友)", a: "who", hint: "指人用 who" }
      ]
    },
    {
      id: "g45",
      title: "宾语从句（陈述语序）",
      level: "A2",
      explain:
        "宾语从句用陈述句语序（主语在前）：I know where he is. / Can you tell me what time it is?",
      points: [
        { en: "I know where he cultivates.", zh: "我知道他在何处修炼。" },
        { en: "Please tell me what you like.", zh: "请告诉我你喜欢什么。" },
        { en: "Do you know when the carriage leaves?", zh: "你知道云车几时启程吗？" }
      ],
      practice: [
        { q: "I don't know ___ he is. (我不知道他在何处)", a: "where", hint: "宾语从句用 where" },
        { q: "Can you tell me ___ you want? (你能告诉我你想要什么吗)", a: "what", hint: "用 what 引导" },
        { q: "Do you know ___ she goes? (你知道她去何处吗)", a: "where", hint: "用 where 引导" }
      ]
    }
  ];

  // ---------- 剧情角色扮演 (多剧情) ----------
  // 用户扮演主角，在场景中选择英文回应。正确推进剧情，错误给反馈可重试。
  const stories = [
  {
    id: "s1",
    chapter: 1,
    title: "启程 · 凡人村的召唤",
    emoji: "🏞️",
    intro: "你本是青云镇一名普通少年。一日，云中走来白须老者玄机真人，他说：欲修仙道，先通古仙语（英语）。随我启程，一路以古仙语闯过奇遇，方得大道。",
    recap: "第一卷，修仙之路由此起步。",
    scenes: [
      {
        id: "c1",
        narration: "玄机真人俯身对你说：'Greetings, young one. I am Xuanji.'（你好，我是玄机真人）",
        prompt: "你也用古仙语打招呼并报上姓名，选哪句？",
        choices: [
          { text: "Hello! I am Tom.", ok: true, fb: "玄机真人捋须微笑：'Good. 你已叩开古仙语之门。'" },
          { text: "Goodbye, old man.", ok: false, fb: "他尚未收你为徒，莫急着道别，先用 Hello 问好并自报姓名。" },
          { text: "I am a cat.", ok: false, fb: "你是凡人不是猫，用 I am Tom 自报姓名。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "真人指向村口古松：'This tree spirit sleeps. Wake it with kind words.'（唤醒树灵，说些善意的话）",
        prompt: "你想说'你好，树灵朋友'，选哪句？",
        choices: [
          { text: "Hello, tree spirit friend!", ok: true, fb: "古松微颤，睁开一只眼，似在回应。" },
          { text: "I eat a tree.", ok: false, fb: "不可言吃树，用 Hello 问候树灵。" },
          { text: "Where is the dog?", ok: false, fb: "与树灵无关，用 Hello 打招呼。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "树灵开口：'What is your name?'（你叫什么名字？）",
        prompt: "你用古仙语报上姓名，选哪句？",
        choices: [
          { text: "My name is Tom.", ok: true, fb: "树灵记下你的名，赠你一枚灵珠，记录修行言语。" },
          { text: "I am tree.", ok: false, fb: "你是人，用 My name is Tom 报姓名。" },
          { text: "What is your name?", ok: false, fb: "这是它问你的，你该回答而非反问。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "真人点头：'A spirit bead for you. It remembers your words.'（灵珠赠你，记你言语）",
        prompt: "你谦逊道谢，选哪句？",
        choices: [
          { text: "Thank you, master!", ok: true, fb: "灵珠没入你掌心，微微发烫，认你为主。" },
          { text: "I am sorry.", ok: false, fb: "受赠当谢，用 Thank you。" },
          { text: "Good night.", ok: false, fb: "此时白日当空，用 Thank you 道谢。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "真人引你向镇外大道：'Your journey begins. Follow me.'（旅程开始，随我来）",
        prompt: "你坚定回应'好的，我们走'，选哪句？",
        choices: [
          { text: "OK! Let us go.", ok: true, fb: "你迈出修仙第一步，灵珠轻鸣。🎉 第一卷·启程 完成！" },
          { text: "Goodbye, home.", ok: false, fb: "尚未离别，用 OK! Let us go 起步。" },
          { text: "I am road.", ok: false, fb: "你是行者非路，用 OK! Let us go。" }
        ],
        next: null
      }
    ]
  },
  {
    id: "s2",
    chapter: 2,
    title: "灵剑城 · 青芒觉醒",
    emoji: "⚔️",
    intro: "真人带你来到灵剑城。城中剑冢万千，唯有以古仙语唤醒的剑，才肯认你为主。",
    recap: "上卷你以古仙语唤醒村口树灵，得玄机真人赐下灵珠，正式踏上修仙路。",
    scenes: [
      {
        id: "c1",
        narration: "守城卫士横戟拦道：'Halt! State your name.'（止步！报上名来）",
        prompt: "你以古仙语自报姓名与身份，选哪句？",
        choices: [
          { text: "I am Tom. I am a cultivator.", ok: true, fb: "卫士让路：'Pass, young cultivator.'（通行吧，小修者）" },
          { text: "Goodbye, guard.", ok: false, fb: "尚未通行，先报名，用 I am ... 自陈。" },
          { text: "I eat sword.", ok: false, fb: "莫言吃剑，用 I am ... 自报身份。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "剑铺老匠迎出：'What do you want, little one?'（你想要什么，小友？）",
        prompt: "你想要那柄泛青光的剑，选哪句？",
        choices: [
          { text: "I want the blue sword.", ok: true, fb: "老匠大笑，取剑出匣，青光流转。" },
          { text: "I am sword.", ok: false, fb: "用 I want ... 表达想要，非 I am。" },
          { text: "Goodbye!", ok: false, fb: "尚未得剑，先用 I want 说出所求。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "一旁窜出小白狐，蹭你脚踝：'A friend? Are you my friend?'（朋友？你是我的朋友吗？）",
        prompt: "你温柔应答'是的，我是你的朋友'，选哪句？",
        choices: [
          { text: "Yes, I am your friend.", ok: true, fb: "白狐欢跃绕你三匝，自此名小白，伴你同行。" },
          { text: "I am a fox.", ok: false, fb: "你不是狐，用 Yes, I am your friend 回应。" },
          { text: "No, I am sword.", ok: false, fb: "莫拒灵狐，用 Yes, I am your friend。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "老匠将剑递来：'This sword is Qingmang. Speak to it.'（此剑名青芒，对它言语）",
        prompt: "你举剑轻呼'你好，青芒，我是你的主人'，选哪句？",
        choices: [
          { text: "Hello, Qingmang! I am your master.", ok: true, fb: "剑身青光大盛，悬于你身侧，认主。" },
          { text: "I eat sword.", ok: false, fb: "不可言吃剑，用 Hello 并自称主人。" },
          { text: "Where is sword?", ok: false, fb: "剑已在手，用 Hello 唤醒它。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "青芒剑鸣，老匠颔首：'Well done. The sword obeys the ancient tongue.'（善。剑听古仙语）",
        prompt: "你谢过老匠，选哪句？",
        choices: [
          { text: "Thank you, master smith!", ok: true, fb: "灵剑城一程，你与小白、青芒结缘。🎉 第二卷·灵剑觉醒 完成！" },
          { text: "I am sorry.", ok: false, fb: "当谢老匠，用 Thank you。" },
          { text: "Good night.", ok: false, fb: "用 Thank you 道谢。" }
        ],
        next: null
      }
    ]
  },
  {
    id: "s3",
    chapter: 3,
    title: "云雾山 · 灵兽之伤",
    emoji: "⛰️",
    intro: "你与小白循山道登云雾山。山雾缭绕，忽闻草丛中有低低的鸣声。",
    recap: "上卷你在灵剑城得青芒剑，小白狐认你为友，二者自此随行。",
    scenes: [
      {
        id: "c1",
        narration: "小白竖耳：'Something is hurt. Listen!'（有物受伤，听！）",
        prompt: "你探头细看，说'我看见一只小动物'，选哪句？",
        choices: [
          { text: "I see a small animal.", ok: true, fb: "雾中一只受伤灵鹿望向你，眼神怯怯。" },
          { text: "I am animal.", ok: false, fb: "用 I see ... 表看见，非 I am。" },
          { text: "Animal is red.", ok: false, fb: "先说看见什么，用 I see a small animal。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "灵鹿怯声：'Are you here to help me?'（你是来帮我的吗？）",
        prompt: "你安慰它'是的，我来帮你'，选哪句？",
        choices: [
          { text: "Yes, I will help you.", ok: true, fb: "灵鹿垂首，露出腿上伤口，信任了你。" },
          { text: "I am deer.", ok: false, fb: "你非鹿，用 Yes, I will help you 表相助。" },
          { text: "No, I am cat.", ok: false, fb: "莫拒，用 Yes, I will help you。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "小白叼来草药：'Use this herb. It is good.'（用此草，甚好）",
        prompt: "你想说'这草药是绿色的'，选哪句？",
        choices: [
          { text: "The herb is green.", ok: true, fb: "你以绿草敷伤，灵鹿安然。" },
          { text: "Herb green dog.", ok: false, fb: "用 The herb is green 说明颜色。" },
          { text: "I am green.", ok: false, fb: "言草之色，用 The herb is green。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "灵鹿起身：'Thank you. Take this feather.'（谢你，收此羽）",
        prompt: "你接过灵羽道谢，选哪句？",
        choices: [
          { text: "Thank you, little deer!", ok: true, fb: "灵羽入灵珠，隐隐生光，似有翅膀之纹。" },
          { text: "I am sorry.", ok: false, fb: "当谢灵鹿，用 Thank you。" },
          { text: "Good night.", ok: false, fb: "用 Thank you 道谢。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "山顶云开，真人现身：'You are kind. Kindness is a cultivator power.'（你心存善，善乃修者之力）",
        prompt: "你谦逊回应'我会继续助人'，选哪句？",
        choices: [
          { text: "I will help more people.", ok: true, fb: "云雾山试炼成，灵珠又亮一分。🎉 第三卷·灵兽之伤 完成！" },
          { text: "I am mountain.", ok: false, fb: "你是修者非山，用 I will help more people。" },
          { text: "Goodbye, deer.", ok: false, fb: "未别，用 I will help more people 明志。" }
        ],
        next: null
      }
    ]
  },
  {
    id: "s4",
    chapter: 4,
    title: "幽冥谷 · 迷雾少女",
    emoji: "🌫️",
    intro: "下山忽入幽冥谷，黑雾弥天。雾中传来少女低低的啜泣。",
    recap: "上卷云雾山你救下灵鹿，获赠灵羽，悟得善为修者之力。",
    scenes: [
      {
        id: "c1",
        narration: "雾里少女颤声：'Who are you? Where am I?'（你是谁？我何在？）",
        prompt: "你先自报姓名，选哪句？",
        choices: [
          { text: "I am Tom. I am a cultivator.", ok: true, fb: "少女止泣：'I am Yaoyao.'（我叫阿瑶）" },
          { text: "I am ghost.", ok: false, fb: "莫自称鬼，用 I am ... 报身份。" },
          { text: "Goodbye, girl.", ok: false, fb: "先通名，用 I am ...。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "阿瑶惶然：'What is this place? Is it safe?'（此地何名？可安全否？）",
        prompt: "你宽慰她'这是幽冥谷，我们是安全的'，选哪句？",
        choices: [
          { text: "This is the valley. We are safe.", ok: true, fb: "阿瑶稍安，握紧你衣角。" },
          { text: "I eat valley.", ok: false, fb: "不可言吃谷，用 This is the valley 点明。" },
          { text: "Where is safe?", ok: false, fb: "你当安她心，用 We are safe。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "谷中石扉浮现古纹，阿瑶惊道：'The door! Can you open it?'（那门！你能开吗？）",
        prompt: "你以古仙语试之'我能打开它'，选哪句？",
        choices: [
          { text: "I can open it.", ok: true, fb: "石扉应声而裂，透出微光。" },
          { text: "I am door.", ok: false, fb: "用 I can open it 表能力，非 I am。" },
          { text: "Door is cat.", ok: false, fb: "与门无关，用 I can open it。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "门后现一卷残图，阿瑶低语：'My teacher gave me this. He is Xuanji.'（恩师所赠，他名玄机）",
        prompt: "你惊觉关联，说'玄机真人是我的师父！'，选哪句？",
        choices: [
          { text: "Master Xuanji is my teacher!", ok: true, fb: "阿瑶笑：'So we are from the same sect!'（原是同门！）" },
          { text: "I am Xuanji.", ok: false, fb: "你非真人，用 Master Xuanji is my teacher。" },
          { text: "Teacher is red.", ok: false, fb: "与色无关，用 Master Xuanji is my teacher。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "阿瑶将残图交你：'Take it. Find the gate of immortals.'（收好，寻仙门）",
        prompt: "你收图承诺，选哪句？",
        choices: [
          { text: "OK, I will find it.", ok: true, fb: "幽冥谷迷雾散，残图指往仙门方向。🎉 第四卷·迷雾少女 完成！" },
          { text: "Goodbye, map.", ok: false, fb: "未别，用 OK, I will find it 立誓。" },
          { text: "I am map.", ok: false, fb: "你是持图者非图，用 OK, I will find it。" }
        ],
        next: null
      }
    ]
  },
  {
    id: "s5",
    chapter: 5,
    title: "灵市集 · 仙物交易",
    emoji: "🏪",
    intro: "残图引你与阿瑶、小白至灵市集。百摊琳琅，需以古仙语与商修议价交易。",
    recap: "上卷幽冥谷你结识同门阿瑶，得知玄机真人亦是她恩师，并获残图指往仙门。",
    scenes: [
      {
        id: "c1",
        narration: "摊主笑迎：'Welcome! What do you need?'（欢迎！需何物？）",
        prompt: "你想要一些疗伤丹，选哪句？",
        choices: [
          { text: "I want some healing pills.", ok: true, fb: "摊主取丹于掌，青光莹莹。" },
          { text: "I am pill.", ok: false, fb: "用 I want some ... 表想要，非 I am。" },
          { text: "Goodbye!", ok: false, fb: "未购先叹别，用 I want some healing pills。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "摊主问：'How many pills do you want?'（要几枚？）",
        prompt: "你答'三枚丹药'，选哪句？",
        choices: [
          { text: "Three pills, please.", ok: true, fb: "摊主数出三枚，纳入玉瓶。" },
          { text: "I am three.", ok: false, fb: "表数量用 Three pills，非 I am three。" },
          { text: "Pill is red.", ok: false, fb: "先言数，用 Three pills。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "旁摊卖灵果，阿瑶问：'How much is the spirit fruit?'（灵果几何？）",
        prompt: "你问'它多少钱'，选哪句？",
        choices: [
          { text: "How much is it?", ok: true, fb: "摊主笑：'Ten spirit coins.'（十灵币）" },
          { text: "How many is it?", ok: false, fb: "问价格用 How much，非 How many。" },
          { text: "I eat fruit.", ok: false, fb: "与问价无关，用 How much is it。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "你付币：'Here are ten coins.' 摊主点头：'Good. The fruit is yours.'（好，果归你）",
        prompt: "你接果道谢，选哪句？",
        choices: [
          { text: "Thank you! The fruit is mine.", ok: true, fb: "灵果入囊，以备山行。" },
          { text: "I am coin.", ok: false, fb: "当谢，用 Thank you。" },
          { text: "Good night.", ok: false, fb: "用 Thank you 道谢。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "集将散，小白叼来一盏灯：'A lantern! For the dark road.'（灯！备暗路）",
        prompt: "你赞小白'你真聪明'，选哪句？",
        choices: [
          { text: "You are very smart, Xiaobai!", ok: true, fb: "灵市一程，资粮兼备，直向仙门。🎉 第五卷·仙物交易 完成！" },
          { text: "I am smart.", ok: false, fb: "赞小白，用 You are very smart。" },
          { text: "Lantern is cat.", ok: false, fb: "与猫无关，用 You are very smart。" }
        ],
        next: null
      }
    ]
  },
  {
    id: "s6",
    chapter: 6,
    title: "仙门试炼 · 智慧之关",
    emoji: "🏯",
    intro: "仙门巍峨，守门长老横杖而立：欲入仙门，先过三问，以古仙语答之。",
    recap: "上卷灵市集你备齐丹药灵果与明灯，与阿瑶、小白奔赴仙门。",
    scenes: [
      {
        id: "c1",
        narration: "长老一问：'A good cultivator should help others. Do you?'（善修当助人，你可愿？）",
        prompt: "你答'我应该帮助他人'，选哪句？",
        choices: [
          { text: "I should help others.", ok: true, fb: "长老颔首：'Good.'（善）" },
          { text: "I am help.", ok: false, fb: "用 should 表应当，用 I should help others。" },
          { text: "Goodbye, elder.", ok: false, fb: "未别，用 I should help others。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "长老二问：'You must speak the truth. Can you?'（必言真，你可做到？）",
        prompt: "你答'我必须说真话'，选哪句？",
        choices: [
          { text: "I must tell the truth.", ok: true, fb: "长老目露赞色。" },
          { text: "I can cat.", ok: false, fb: "用 must 表必须，用 I must tell the truth。" },
          { text: "I am truth.", ok: false, fb: "你是言者非真，用 I must tell the truth。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "长老三问：'The gate is heavy. Can you open it alone?'（门重，独力能开否？）",
        prompt: "你答'我能打开它，但我们需要朋友'，选哪句？",
        choices: [
          { text: "I can open it, but we need friends.", ok: true, fb: "长老大笑：'互助者，方入仙门！'" },
          { text: "I am gate.", ok: false, fb: "用 I can open it 表能力，非 I am。" },
          { text: "Gate is heavy cat.", ok: false, fb: "与猫无关，用 I can open it。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "阿瑶、小白齐上前来，长老叹：'See? Together you are strong.'（看，合力则强）",
        prompt: "你谢长老，选哪句？",
        choices: [
          { text: "Thank you, elder. We are together.", ok: true, fb: "仙门缓缓洞开，灵气外溢。" },
          { text: "I am sorry.", ok: false, fb: "当谢，用 Thank you。" },
          { text: "Good night.", ok: false, fb: "用 Thank you 道谢。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "门内灵气扑面，真人竟立于阶上：'I am Xuanji, gatekeeper of this sect.'（吾乃本门守关）",
        prompt: "你惊而礼拜，选哪句？",
        choices: [
          { text: "Master! You are the gatekeeper?", ok: true, fb: "真相揭晓，试炼为引你入门。🎉 第六卷·智慧之关 完成！" },
          { text: "I am Xuanji.", ok: false, fb: "你非真人，用 Master! You are the gatekeeper?" },
          { text: "Goodbye, master.", ok: false, fb: "未别，用 Master! You are the gatekeeper?" }
        ],
        next: null
      }
    ]
  },
  {
    id: "s7",
    chapter: 7,
    title: "登天梯 · 飞升之始",
    emoji: "🌌",
    intro: "真人引你登天梯——九九阶梯直入云霄，每阶需诵古仙语一句，方得升华。",
    recap: "上卷仙门试炼，你以当助、必真、合力三答通过，玄机真人竟是本门守关长老。",
    scenes: [
      {
        id: "c1",
        narration: "第一阶云涌：'Say who you are, in one sentence.'（以一句言汝身）",
        prompt: "你朗声自报，选哪句？",
        choices: [
          { text: "I am Tom, a cultivator of the ancient tongue.", ok: true, fb: "一阶亮，托你而上。" },
          { text: "I am cat.", ok: false, fb: "莫自称猫，用 I am ... a cultivator。" },
          { text: "Goodbye, stair.", ok: false, fb: "未别，用 I am ... 自陈。" }
        ],
        next: "c2"
      },
      {
        id: "c2",
        narration: "第三阶风急，小白惊呼：'Hold on! Are you okay?'（抓紧！可好？）",
        prompt: "你回'我没事，谢谢'，选哪句？",
        choices: [
          { text: "I am fine, thank you.", ok: true, fb: "小白安心，风过阶明。" },
          { text: "I am wind.", ok: false, fb: "你非风，用 I am fine。" },
          { text: "Good night.", ok: false, fb: "用 I am fine, thank you 回应。" }
        ],
        next: "c3"
      },
      {
        id: "c3",
        narration: "第六阶现守关灵：'Only the wise may pass. What do you want?'（唯智者过，汝欲何？）",
        prompt: "你答'我想成为仙人，帮助众人'，选哪句？",
        choices: [
          { text: "I want to be an immortal and help people.", ok: true, fb: "守关灵退避，阶生金光。" },
          { text: "I am immortal.", ok: false, fb: "用 I want to be ... 表志向，非 I am。" },
          { text: "Goodbye, spirit.", ok: false, fb: "未别，用 I want to be an immortal。" }
        ],
        next: "c4"
      },
      {
        id: "c4",
        narration: "顶阶星海荡漾，阿瑶笑：'We did it! Are we friends forever?'（成了！可永为友？）",
        prompt: "你答'是的，我们永远是朋友'，选哪句？",
        choices: [
          { text: "Yes, we are friends forever.", ok: true, fb: "三灵相拥，星海为证。" },
          { text: "I am friend.", ok: false, fb: "用 Yes, we are friends forever 回应。" },
          { text: "No, I am star.", ok: false, fb: "莫拒，用 Yes, we are friends forever。" }
        ],
        next: "c5"
      },
      {
        id: "c5",
        narration: "真人抚须：'The gate of immortals opens. Your journey continues.'（仙门开，路未止）",
        prompt: "你立誓'我会一直学习古仙语'，选哪句？",
        choices: [
          { text: "I will keep learning the ancient tongue.", ok: true, fb: "仙门洞开，你步入新境。🎉 第七卷·登天梯 完成！但修仙之路永无止境——内容持续更新中，更多奇遇即将开启！" },
          { text: "Goodbye, world.", ok: false, fb: "未别，用 I will keep learning。" },
          { text: "I am done.", ok: false, fb: "修无止境，用 I will keep learning。" }
        ],
        next: null
      }
    ]
  }
];



window.EM.data = { wordSets, grammar, stories };
})();
