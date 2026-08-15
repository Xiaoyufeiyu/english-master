/* ============================================================
 *  English Master — 状态 / 学习引擎
 *  多角色存档、本地存储、游戏化(XP/等级/勋章/打卡)、
 *  SRS 间隔重复、每日经验(dailyXP)、排行榜、规则对话导师
 * ============================================================ */
(function () {
  window.EM = window.EM || {};
  const KEY_PROFILES = "em_profiles_v3";
  const KEY_CUR = "em_current_id_v3";

  // ---------- 仙勋定义（修仙主题，分 8 大类） ----------
  // cat 用于勋章墙分组展示
  const BADGES = [
    // 一、灵根初现（单词 / 语法 入门里程碑）
    { id: "first_word", name: "灵根觉醒", desc: "习得第一个仙诀（单词）", icon: "🌱", cat: "灵根初现" },
    { id: "ten_words", name: "初诵仙诀", desc: "累计诵习 10 个仙诀", icon: "📜", cat: "灵根初现" },
    { id: "words100", name: "词海初航", desc: "累计习得 100 词", icon: "💧", cat: "灵根初现" },
    { id: "words500", name: "词库渐丰", desc: "累计习得 500 词", icon: "📚", cat: "灵根初现" },
    { id: "words1000", name: "万卷在胸", desc: "累计习得 1000 词", icon: "📖", cat: "灵根初现" },
    { id: "first_grammar", name: "悟得道则", desc: "初通一节心法（语法）", icon: "📐", cat: "灵根初现" },
    { id: "gram10", name: "道则初成", desc: "修完 10 节心法", icon: "📘", cat: "灵根初现" },
    { id: "gram30", name: "诸法通明", desc: "修完 30 节心法", icon: "📗", cat: "灵根初现" },
    { id: "gram45", name: "万法归一", desc: "修完全部 45 节心法", icon: "🗿", cat: "灵根初现" },

    // 二、试炼心剑（答题 / 复习）
    { id: "quiz10", name: "试炼过关", desc: "历经 10 场试炼（答题）", icon: "🗡️", cat: "试炼心剑" },
    { id: "quiz50", name: "慧剑常悬", desc: "历经 50 场试炼", icon: "⚔️", cat: "试炼心剑" },
    { id: "quiz100", name: "剑心通明", desc: "历经 100 场试炼", icon: "🗡️", cat: "试炼心剑" },
    { id: "review_first", name: "温故知新", desc: "首次温习旧诀（复习）", icon: "🔄", cat: "试炼心剑" },

    // 三、仙途历险（剧情 7 卷 + 全卷通关）
    { id: "story1", name: "初入仙途", desc: "踏入修仙之路剧情", icon: "🎭", cat: "仙途历险" },
    { id: "story_s1", name: "凡人村启程", desc: "通关《启程·凡人村的召唤》", icon: "🏡", cat: "仙途历险" },
    { id: "story_s2", name: "青芒觉醒", desc: "通关《灵剑城·青芒觉醒》", icon: "⚔️", cat: "仙途历险" },
    { id: "story_s3", name: "灵兽之友", desc: "通关《云雾山·灵兽之伤》", icon: "🐾", cat: "仙途历险" },
    { id: "story_s4", name: "迷雾解谜", desc: "通关《幽冥谷·迷雾少女》", icon: "🌫️", cat: "仙途历险" },
    { id: "story_s5", name: "仙市纵横", desc: "通关《灵市集·仙物交易》", icon: "🪙", cat: "仙途历险" },
    { id: "story_s6", name: "智慧通关", desc: "通关《仙门试炼·智慧之关》", icon: "🧠", cat: "仙途历险" },
    { id: "story_s7", name: "登天飞升", desc: "通关《登天梯·飞升之始》", icon: "🪜", cat: "仙途历险" },
    { id: "story_all", name: "仙途圆满", desc: "通关全部 7 卷修仙之路", icon: "🌟", cat: "仙途历险" },

    // 四、勤勉不辍（打卡）
    { id: "streak3", name: "三日筑基", desc: "连续打卡 3 天", icon: "🔥", cat: "勤勉不辍" },
    { id: "streak7", name: "七日不懈", desc: "连续打卡 7 天", icon: "⚡", cat: "勤勉不辍" },
    { id: "streak30", name: "月恒之志", desc: "连续打卡 30 天", icon: "👑", cat: "勤勉不辍" },

    // 五、每日荐修（每日推荐）
    { id: "daily_first", name: "每日荐启", desc: "首次收下每日仙荐", icon: "📅", cat: "每日荐修" },
    { id: "daily7", name: "七日荐修", desc: "累计收下 7 日仙荐", icon: "🗓️", cat: "每日荐修" },

    // 六、境界攀升（等级 / 段位）
    { id: "level2", name: "炼气二层", desc: "达到 2 级", icon: "⭐", cat: "境界攀升" },
    { id: "level5", name: "炼气五层", desc: "达到 5 级", icon: "🌟", cat: "境界攀升" },
    { id: "level10", name: "炼气圆满", desc: "达到 10 级 · 炼气期圆满", icon: "🏆", cat: "境界攀升" },
    { id: "realm_1", name: "筑基期", desc: "踏入筑基期（11 级）", icon: "🌿", cat: "境界攀升" },
    { id: "realm_2", name: "金丹期", desc: "结丹成功（21 级）", icon: "💎", cat: "境界攀升" },
    { id: "realm_3", name: "元婴期", desc: "孕育元婴（31 级）", icon: "👶", cat: "境界攀升" },
    { id: "realm_4", name: "化神期", desc: "化身化神（41 级）", icon: "🌟", cat: "境界攀升" },
    { id: "realm_5", name: "炼虚期", desc: "炼虚合道（51 级）", icon: "🌌", cat: "境界攀升" },
    { id: "realm_6", name: "合体期", desc: "合体大成（61 级）", icon: "🌀", cat: "境界攀升" },
    { id: "realm_7", name: "大乘期", desc: "大乘圆满（71 级）", icon: "🪐", cat: "境界攀升" },
    { id: "realm_8", name: "渡劫期", desc: "渡劫飞升（81 级）", icon: "⚡", cat: "境界攀升" },
    { id: "realm_9", name: "真仙境", desc: "成就真仙（91 级）", icon: "🧚", cat: "境界攀升" },

    // 七、道缘交际（点赞 / 问候）
    { id: "like_first", name: "道缘初结", desc: "收到首位道友的问候", icon: "🤝", cat: "道缘交际" },
    { id: "like10", name: "道友遍天下", desc: "累计收到 10 次道友问候", icon: "🌐", cat: "道缘交际" },

    // 八、至高成就
    { id: "max_level", name: "功成圆满", desc: "登临 100 级 · 真仙境圆满", icon: "🌠", cat: "至高成就" }
  ];

  // ---------- SRS 间隔(天) ----------
  const INTERVALS = [0, 1, 2, 4, 7, 15, 30];

  // ---------- 凡人修仙传 段位体系 ----------
  // 每 10 级为一个大段：1-10 = 炼气期(1层~圆满) …… 91-100 = 真仙境
  const REALMS = [
    "炼气期", "筑基期", "金丹期", "元婴期", "化神期",
    "炼虚期", "合体期", "大乘期", "渡劫期", "真仙境"
  ];
  const MAX_LEVEL = REALMS.length * 10; // 100 级 = 真仙境圆满
  function realmOf(level) {
    const L = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level) || 1));
    const idx = Math.min(Math.floor((L - 1) / 10), REALMS.length - 1);
    const layer = ((L - 1) % 10) + 1;
    const suffix = layer === 10 ? "圆满" : layer + "层";
    return REALMS[idx] + suffix;
  }
  // 返回「大段位」索引（0=炼气期 … 9=真仙境），用于点赞关系的段位差计算
  function realmIndexOf(level) {
    const L = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level) || 1));
    return Math.min(Math.floor((L - 1) / 10), REALMS.length - 1);
  }

  function uid() {
    return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(str, n) {
    const d = new Date(str + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  // ---------- 状态(单个角色) ----------
  function defaultState(name) {
    return {
      id: uid(),
      name: name || "学习者",
      xp: 0,
      level: 1,
      streak: 0,
      lastCheckin: null,
      badges: [],
      words: {},
      grammarDone: {},
      storiesDone: {},
      stats: { wordsLearned: 0, quizzes: 0, correct: 0, studyDays: 0 },
      totalXP: 0,
      dailyXP: 0,
      dailyDate: todayStr(),
      dailyPacks: 0,
      stones: 0,          // 灵石：练习可得，用于仙市兑换道具
      items: {},          // 道具库存：{ freeze: N, ... }（续修仙丹等消耗品）
      greetings: [],
      progress: {}        // 词窟参悟进度：{ setId: 已参悟到的词序 }，用于续修（退出后不从头开始）
    };
  }

  // ---------- 读取所有角色 ----------
  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY_PROFILES);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p) && p.length) return p;
      }
    } catch (e) {}
    return null;
  }

  // ---------- 演示角色（对外演示用，覆盖默认种子） ----------
  // 两名固定修士：韩立(元婴期) / 王婵(金丹期)。
  // 仅当本地无任何存档(loadAll 为空)时作为初始角色；旧版存档因 KEY 升级被自动清除。
  // 仙勋依据已填真实数据自动推导，保证勋章墙与进度完全一致。
  function makeDemoProfile(id, name, level, streak, stones, learnedN, grammarN, storyIds, dailyPacks, hasGreet) {
    const p = defaultState(name);
    p.id = id;
    p.level = level;
    p.xp = Math.round((50 + 25 * level) * 0.45); // 约 45% 进度，进度条更自然
    p.totalXP = p.xp + level * 220;
    p.streak = streak;
    p.stones = stones;
    // 用真实词库预填「已铭仙言」，使洞府复习与首页统计一致
    const all = [];
    (window.EM.data ? window.EM.data.wordSets : []).forEach((set) => {
      set.words.forEach((w) => all.push({ setId: set.id, en: w.en }));
    });
    const n = Math.min(learnedN, all.length);
    for (let i = 0; i < n; i++) {
      const w = all[i];
      p.words[w.setId + ":" + w.en] = { box: i % 5, due: todayStr() };
    }
    p.grammarDone = {};
    for (let i = 1; i <= grammarN; i++) p.grammarDone["g" + i] = true;
    p.storiesDone = {};
    storyIds.forEach((sid) => { p.storiesDone[sid] = true; });
    p.dailyPacks = dailyPacks || 0;
    if (hasGreet) {
      p.greetings = [{ from: "system", fromName: "道友", fromRealm: "筑基期", text: "道友问好", diff: 0, ts: Date.now() }];
    }
    p.stats = {
      wordsLearned: n,
      quizzes: n,
      correct: Math.round(n * 0.85),
      studyDays: streak
    };
    // 依据已填数据自动推导应得仙勋，保证勋章墙与真实进度一致
    const badges = [];
    const gm = Object.keys(p.grammarDone).length;
    const sd = Object.keys(p.storiesDone).length;
    const ridx = realmIndexOf(level);
    const push = (bid) => { if (!badges.includes(bid)) badges.push(bid); };
    if (n >= 1) push("first_word");
    if (n >= 10) push("ten_words");
    if (n >= 100) push("words100");
    if (n >= 500) push("words500");
    if (n >= 1000) push("words1000");
    if (gm >= 1) push("first_grammar");
    if (gm >= 10) push("gram10");
    if (gm >= 30) push("gram30");
    if (gm >= 45) push("gram45");
    if (p.stats.quizzes >= 10) push("quiz10");
    if (p.stats.quizzes >= 50) push("quiz50");
    if (p.stats.quizzes >= 100) push("quiz100");
    if (n >= 1) push("review_first");
    if (sd >= 1) push("story1");
    ["s1", "s2", "s3", "s4", "s5", "s6", "s7"].forEach((s) => { if (p.storiesDone[s]) push("story_" + s); });
    if (sd >= 7) push("story_all");
    if (p.streak >= 3) push("streak3");
    if (p.streak >= 7) push("streak7");
    if (p.streak >= 30) push("streak30");
    if (dailyPacks >= 1) push("daily_first");
    if (dailyPacks >= 7) push("daily7");
    if (level >= 2) push("level2");
    if (level >= 5) push("level5");
    if (level >= 10) push("level10");
    for (let r = 1; r <= ridx; r++) push("realm_" + r);
    if (p.greetings && p.greetings.length >= 1) push("like_first");
    if (p.greetings && p.greetings.length >= 10) push("like10");
    if (level >= MAX_LEVEL) push("max_level");
    p.badges = badges;
    return p;
  }
  function seedProfiles() {
    const hanli = makeDemoProfile(
      "demo_hanli", "韩立", 35, 28, 320, 420, 30,
      ["s1", "s2", "s3", "s4", "s5"], 9, true
    );
    const wangchan = makeDemoProfile(
      "demo_wangchan", "王婵", 25, 16, 180, 260, 10,
      ["s1"], 3, true
    );
    return [hanli, wangchan];
  }

  let profiles = loadAll() || seedProfiles();
  // 兼容/补字段
  profiles.forEach((p) => {
    if (p.dailyXP == null) p.dailyXP = 0;
    if (!p.dailyDate) p.dailyDate = todayStr();
    if (p.dailyPacks == null) p.dailyPacks = 0;
    if (p.stones == null) p.stones = 0;
    if (!p.items) p.items = {};
    if (!p.stats) p.stats = { wordsLearned: 0, quizzes: 0, correct: 0, studyDays: 0 };
    if (!p.words) p.words = {};
    if (!p.grammarDone) p.grammarDone = {};
    if (!p.storiesDone) p.storiesDone = {};
    if (!p.badges) p.badges = [];
    if (!p.greetings) p.greetings = [];
    if (!p.progress) p.progress = {};
  });

  let currentId = localStorage.getItem(KEY_CUR) || (profiles[0] && profiles[0].id);
  let state = profiles.find((p) => p.id === currentId) || profiles[0];
  currentId = state.id;

  // ---------- 变更钩子：任意状态改动后通知前端做云同步/实时上报 ----------
  let changeCbs = [];
  function onChange(cb) { if (typeof cb === "function") changeCbs.push(cb); }
  function emitChange() { for (let i = 0; i < changeCbs.length; i++) { try { changeCbs[i](); } catch (e) {} } }

  function save() {
    try {
      if (state) state.updatedAt = Date.now();
      localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
      localStorage.setItem(KEY_CUR, currentId);
    } catch (e) {}
    emitChange();
  }

  // 应用云端拉取到的完整状态（换设备/刷新后恢复进度，云端为权威）
  // 以云端返回的 id 为准整体接管：覆盖或追加到本地 profiles，并设为当前角色
  function applyRemoteState(obj) {
    if (!obj || !obj.id) return;
    const keys = ["name", "xp", "level", "streak", "lastCheckin", "badges", "words",
      "grammarDone", "storiesDone", "stats", "totalXP", "dailyXP", "dailyDate",
      "dailyPacks", "stones", "items", "greetings", "progress", "updatedAt"];
    const i = profiles.findIndex((p) => p.id === obj.id);
    if (i >= 0) {
      keys.forEach((k) => { if (obj[k] !== undefined) profiles[i][k] = obj[k]; });
      profiles[i].id = obj.id;
    } else {
      const np = {};
      keys.forEach((k) => { if (obj[k] !== undefined) np[k] = obj[k]; });
      np.id = obj.id;
      if (!np.name) np.name = "修士";
      profiles.push(np);
    }
    currentId = obj.id;
    state = profiles.find((p) => p.id === obj.id);
    save();
  }

  // ---------- 每日经验 ----------
  function ensureDaily() {
    const t = todayStr();
    if (state.dailyDate !== t) {
      state.dailyDate = t;
      state.dailyXP = 0;
    }
  }
  function dailyXPOf(p) {
    return p.dailyDate === todayStr() ? (p.dailyXP || 0) : 0;
  }

  // ---------- 游戏化 ----------
  // 合理经验增长：基础 50，随等级线性递增（50 + 25*level）。
  // 早中期升级快、给正反馈；越往后所需经验越多但平缓可控，封顶 100 级。
  function xpForNext(level) {
    return Math.round(50 + 25 * level);
  }
  // 升级回调：state.xp 突破当前段位时由 addXP 触发，供前端播放「突破」提示
  let levelUpCb = null;
  function onLevelUp(cb) { levelUpCb = cb; }
  // 升级循环：自动消费经验跨级；但每到一「大段位圆满」（等级为 10 的倍数）即止步，
  // 须服对应「突破丹」方可破界飞升至下一大段位（圆满之障）。
  function runLevelLoop() {
    while (state.level < MAX_LEVEL && state.xp >= xpForNext(state.level)) {
      if (state.level % 10 === 0) break; // 圆满之障：不可自行破境
      state.xp -= xpForNext(state.level);
      state.level += 1;
      if (state.level >= 2) tryUnlock("level2");
      if (state.level >= 5) tryUnlock("level5");
      if (state.level >= 10) tryUnlock("level10");
      for (let r = 1; r <= REALMS.length - 1; r++) {
        if (state.level >= r * 10 + 1) tryUnlock("realm_" + r);
      }
    }
    if (state.level >= MAX_LEVEL) {
      state.level = MAX_LEVEL;
      state.xp = xpForNext(MAX_LEVEL); // 满级封顶，经验拉满
      tryUnlock("max_level");
    }
  }
  function addXP(n) {
    ensureDaily();
    state.totalXP = (state.totalXP || 0) + n;
    state.dailyXP += n;
    state.xp += n;
    const prevLevel = state.level;
    runLevelLoop();
    if (levelUpCb && state.level > prevLevel) levelUpCb(state.level, prevLevel);
    save();
  }
  // 灵石：练习可得的通用货币，用于仙市兑换道具
  function addStones(n) {
    if (!n) return;
    state.stones = (state.stones || 0) + n;
    save();
  }
  function spendStones(n) {
    if ((state.stones || 0) < n) return false;
    state.stones -= n;
    save();
    return true;
  }
  function tryUnlock(id) {
    return unlockOn(state, id);
  }
  // 在指定角色上解锁勋章（用于道友问候落到接收者本人）
  function unlockOn(p, id) {
    if (!p || !p.badges) return false;
    if (!p.badges.includes(id)) {
      p.badges.push(id);
      save();
      return true;
    }
    return false;
  }
  function newBadges() {
    return state.badges.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);
  }

  // ---------- 单词学习 (SRS) ----------
  function wordId(setId, en) {
    return setId + ":" + en;
  }
  function learnWord(setId, en) {
    const id = wordId(setId, en);
    if (!state.words[id]) {
      state.words[id] = { box: 0, due: todayStr() };
      state.stats.wordsLearned += 1;
      addXP(5);
      addStones(2);
      tryUnlock("first_word");
      if (state.stats.wordsLearned >= 10) tryUnlock("ten_words");
      if (state.stats.wordsLearned >= 100) tryUnlock("words100");
      if (state.stats.wordsLearned >= 500) tryUnlock("words500");
      if (state.stats.wordsLearned >= 1000) tryUnlock("words1000");
      save();
    }
  }
  // 词窟续修：记录已参悟到的词序（0 起），退出后再进可从此处继续
  function setStudyProgress(setId, idx, total) {
    const cur = state.progress[setId] || 0;
    const next = Math.max(cur, Math.min(idx, total || idx));
    if (next !== cur) { state.progress[setId] = next; save(); }
  }
  function getStudyProgress(setId) {
    return state.progress[setId] || 0;
  }
  // quality: 0=again,1=hard,2=good,3=easy
  function reviewWord(setId, en, quality) {
    const id = wordId(setId, en);
    let w = state.words[id];
    if (!w) w = state.words[id] = { box: 0, due: todayStr() };
    if (quality >= 2) {
      w.box = Math.min(w.box + 1, INTERVALS.length - 1);
    } else {
      w.box = 0;
    }
    w.due = addDays(todayStr(), INTERVALS[w.box]);
    tryUnlock("review_first");
    save();
  }
  function dueWords(setId, words) {
    const today = todayStr();
    // 仅已学过的词才进入温故候选；未学的词不出现在复习里
    return words.filter((w) => {
      const wd = state.words[wordId(setId, w.en)];
      return wd && wd.due <= today;
    });
  }

  // ---------- 语法 ----------
  function completeGrammar(id) {
    if (!state.grammarDone[id]) {
      state.grammarDone[id] = true;
      addXP(15);
      addStones(8);
      tryUnlock("first_grammar");
      const g = Object.keys(state.grammarDone).length;
      if (g >= 10) tryUnlock("gram10");
      if (g >= 30) tryUnlock("gram30");
      if (g >= 45) tryUnlock("gram45");
      save();
    }
  }

  // ---------- 剧情 (多剧情) ----------
  function completeStory(storyId) {
    if (!state.storiesDone[storyId]) {
      state.storiesDone[storyId] = true;
      addXP(30);
      addStones(15);
      tryUnlock("story_" + storyId);
      // 修仙之路 7 卷全部通关 → 仙途圆满
      const ALL = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];
      if (ALL.every((x) => state.storiesDone[x])) tryUnlock("story_all");
      save();
    }
  }
  function isStoryDone(id) {
    return !!(state.storiesDone && state.storiesDone[id]);
  }

  // ---------- 测验 ----------
  function recordQuiz(correct) {
    state.stats.quizzes += 1;
    if (correct) state.stats.correct += 1;
    addXP(correct ? 8 : 2);
    if (state.stats.quizzes >= 10) tryUnlock("quiz10");
    if (state.stats.quizzes >= 50) tryUnlock("quiz50");
    if (state.stats.quizzes >= 100) tryUnlock("quiz100");
    addStones(correct ? 3 : 1);
    save();
  }

  // ---------- 打卡 ----------
  function checkIn() {
    const today = todayStr();
    if (state.lastCheckin === today) return { ok: false, already: true };
    const yest = addDays(today, -1);
    let frozen = false;
    if (state.lastCheckin === yest) {
      state.streak += 1;
    } else if (state.lastCheckin && (state.items.freeze || 0) > 0) {
      // 有断日但持有「续修仙丹」：消耗一枚以延续连击
      state.items.freeze -= 1;
      frozen = true;
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.lastCheckin = today;
    state.stats.studyDays += 1;
    addXP(10);
    addStones(5);
    if (state.streak >= 3) tryUnlock("streak3");
    if (state.streak >= 7) tryUnlock("streak7");
    if (state.streak >= 30) tryUnlock("streak30");
    save();
    return { ok: true, streak: state.streak, frozen: frozen };
  }

  // ---------- 角色管理 ----------
  function createProfile(name) {
    const clean = (name || "").trim();
    const p = defaultState(clean || "学习者" + (profiles.length + 1));
    profiles.push(p);
    currentId = p.id;
    state = p;
    save();
    return p;
  }
  function switchProfile(id) {
    const p = profiles.find((x) => x.id === id);
    if (p) {
      currentId = id;
      state = p;
      save();
    }
    return state;
  }
  function renameProfile(id, name) {
    const p = profiles.find((x) => x.id === id);
    if (p) {
      const clean = (name || "").trim();
      if (clean) {
        p.name = clean;
        save();
      }
    }
  }
  function listProfiles() {
    return profiles.slice();
  }
  function currentProfile() {
    return state;
  }
  function leaderboard() {
    return profiles.slice().sort(
      (a, b) => dailyXPOf(b) - dailyXPOf(a) || (b.level - a.level) || (b.xp - a.xp)
    );
  }
  function champion() {
    const lb = leaderboard();
    return lb.length ? lb[0] : null;
  }

  // ---------- 道友问候（本地回退，离线/同设备也适用） ----------
  function receiveGreet(profileId, g) {
    const p = profiles.find((x) => x.id === profileId);
    if (!p) return;
    p.greetings = p.greetings || [];
    p.greetings.push(g);
    if (p.greetings.length > 30) p.greetings = p.greetings.slice(-30);
    // 道缘交际勋章：落到接收者本人
    unlockOn(p, "like_first");
    if (p.greetings.length >= 10) unlockOn(p, "like10");
    save();
  }
  // 收下每日仙荐：累计计数并解锁对应仙勋
  function collectDailyPack() {
    state.dailyPacks = (state.dailyPacks || 0) + 1;
    unlockOn(state, "daily_first");
    if (state.dailyPacks >= 7) unlockOn(state, "daily7");
    save();
  }
  function clearGreet(profileId) {
    const p = profiles.find((x) => x.id === profileId);
    if (p) { p.greetings = []; save(); }
  }
  function greetingsOf(profileId) {
    const p = profiles.find((x) => x.id === profileId);
    return p && p.greetings ? p.greetings.slice() : [];
  }

  // ============================================================
  //  规则对话导师 (入门级) — 应用内置陪练
  // ============================================================
  function tutorReply(raw) {
    const text = (raw || "").trim();
    if (!text) return { reply: "说点什么吧～用英语试试看！(Type something in English 😊)", fb: "" };
    const lower = text.toLowerCase();

    if (/[一-龥]/.test(text)) {
      return {
        reply: "Good try! 但请尽量用英语说哦。比如想说“你好”，可以写成 'Hello!' 或 'Hi, I am ...'。",
        fb: "提示：把想表达的中文先想成最简单的英文单词（hello / thank you / I am ...），再打出来。"
      };
    }
    if (/\bi\b/.test(text) && !/\bI\b/.test(text)) {
      return {
        reply: "Almost! 英语里表示“我”的 I 必须大写：写成 'I am ...' 而不是 'i am ...'。再来一次？",
        fb: "小知识：I 永远大写，这是英语书写规矩。"
      };
    }
    if (/^[a-z]/.test(text)) {
      return {
        reply: "Nice! 不过英文句子的第一个字母要大写，例如 'Hello' 而不是 'hello'。试着改一下？",
        fb: "小知识：句首字母大写 + 句尾加标点(./!?)。"
      };
    }

    const topics = [
      {
        keys: ["hello", "hi", "hey", "good morning", "good afternoon"],
        reply: "Hello! I am your English friend. What is your name? (你好！我是你的英语朋友。你叫什么名字？)",
        fb: "很棒！试着用 'My name is ...' 回答。"
      },
      {
        keys: ["my name is", "i am", "i'm"],
        reply: "Nice to meet you! I am happy to help you learn English. How are you today? (很高兴认识你！我今天能帮你学英语。你今天好吗？)",
        fb: "进阶：用 'I am ...' 描述自己，比如 I am happy / I am a student。"
      },
      {
        keys: ["how are you", "how do you do"],
        reply: "I am great, thank you! And you? (我很好，谢谢！你呢？)",
        fb: "你可以回答 'I am happy / I am fine, thanks'。"
      },
      {
        keys: ["fine", "good", "great", "happy", "ok", "okay"],
        reply: "Wonderful! Do you like apples? (太好了！你喜欢苹果吗？)",
        fb: "试试用 'Yes, I like ...' 或 'No, I don't like ...' 回答。"
      },
      {
        keys: ["yes", "no", "like", "don't like", "do not like"],
        reply: "Good! What do you want to eat? (好！你想吃点什么？)",
        fb: "试试 'I want water / I want an apple'。"
      },
      {
        keys: ["want", "eat", "drink", "water", "apple", "rice", "bread", "milk", "tea"],
        reply: "Yummy! I like food too. What is your favorite color? (好吃！我也喜欢食物。你最喜欢的颜色是什么？)",
        fb: "试试 'My favorite color is red / blue ...'。"
      },
      {
        keys: ["red", "blue", "green", "yellow", "black", "white", "pink", "orange", "color", "colour"],
        reply: "Nice color! How old are you? (好看的颜 色！你几岁了？)",
        fb: "可以回答 'I am ... years old' 或用数字 one~ten。"
      },
      {
        keys: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "old", "years"],
        reply: "Cool! Keep practicing every day. You can do it! (酷！每天坚持练习，你一定可以的！)",
        fb: "你已经能聊不少了，继续加油！想自由聊更多，随时在 WorkBuddy 里找我。"
      },
      {
        keys: ["thank", "thanks", "thank you"],
        reply: "You are welcome! (不客气！)",
        fb: "回应感谢用 'You are welcome'。"
      },
      {
        keys: ["bye", "goodbye", "see you"],
        reply: "Goodbye! Practice again tomorrow. (再见！明天再练哦。)",
        fb: "记得每天来打卡，连续打卡有勋章！"
      }
    ];

    for (const t of topics) {
      if (t.keys.some((k) => lower.includes(k))) {
        return { reply: t.reply, fb: t.fb };
      }
    }

    return {
      reply: "Good try! I heard you. Can you tell me more? Try 'I am ...' or 'I like ...'. (说得不错！你能多说一点吗？试试 'I am ...' 或 'I like ...')",
      fb: "提示：用最简单的词组合——主语(I/you) + be 动词(am/are) + 形容词，或 主语 + 动词(eat/like/go) + 名词。"
    };
  }

  // ---------- 灵石商店（仙市） ----------
  // kind: 'consumable' 入库待自动触发(如续修仙丹)；'instant' 购买即生效；'breakthrough' 破境丹（圆满时服之破界）
  // 突破丹：每个大段位圆满 → 下一大段位 各一丹，名目/符纹(图标)/灵辉(颜色)/价码各异
  const BREAK_META = [
    { name: "筑基破境丹", icon: "💚", color: "#5fd38a", price: 60 },
    { name: "金丹凝元丹", icon: "🟠", color: "#f0a23c", price: 110 },
    { name: "化婴还神丹", icon: "🔴", color: "#ef5d5d", price: 180 },
    { name: "化神洗髓丹", icon: "🟣", color: "#b07de8", price: 270 },
    { name: "炼虚通玄丹", icon: "🔵", color: "#5aa9e6", price: 380 },
    { name: "合体归一丹", icon: "🟤", color: "#c08a4a", price: 520 },
    { name: "大乘渡厄丹", icon: "⚪", color: "#d8dde8", price: 680 },
    { name: "渡劫雷婴丹", icon: "🌩️", color: "#7fd0e0", price: 860 },
    { name: "飞升成仙丹", icon: "🌟", color: "#e8c46a", price: 1100 }
  ];
  const BREAK_PILLS = [];
  for (let r = 0; r < REALMS.length - 1; r++) {
    const m = BREAK_META[r];
    BREAK_PILLS.push({
      id: "break_" + r, name: m.name, icon: m.icon, color: m.color, price: m.price,
      kind: "breakthrough", from: r,
      desc: "自「" + REALMS[r] + "圆满」破境飞升至「" + REALMS[r + 1] + "」所需之丹。经验盈满、服此丹，方可破界。"
    });
  }
  const SHOP_ITEMS = [
    { id: "freeze", name: "续修仙丹", icon: "💊", price: 40, kind: "consumable",
      desc: "错过修炼之日，下次打卡时自动消耗一枚，延续你的连续闭关天数。" },
    { id: "xp50", name: "聚灵丹", icon: "🔮", price: 25, kind: "instant", effect: { xp: 50 },
      desc: "立聚灵气，瞬得 +50 修为。" },
    { id: "xp100", name: "灵蕴丹", icon: "💎", price: 45, kind: "instant", effect: { xp: 100 },
      desc: "灵蕴灌顶，瞬得 +100 修为。" },
    { id: "learn5", name: "悟道卷", icon: "📜", price: 30, kind: "instant", effect: { learn: 5 },
      desc: "悟道卷展开，随机铭刻 5 个未习高频仙言于识海（各 +2 修为）。" },
    { id: "daily", name: "辟谷丹", icon: "🍎", price: 20, kind: "instant", effect: { daily: true },
      desc: "服辟谷丹，免去今日进食之忧，亦可一键领受今日仙谕（若尚未领受，+50 修为）。" }
  ].concat(BREAK_PILLS);

  // 突破丹入库（consumable 同类处理）
  function buyItem(id) {
    const item = SHOP_ITEMS.find((x) => x.id === id);
    if (!item) return { ok: false, reason: "noitem" };
    if ((state.stones || 0) < item.price) return { ok: false, reason: "poor", item };
    spendStones(item.price);
    if (item.kind === "breakthrough" || item.kind === "consumable") {
      state.items[item.id] = (state.items[item.id] || 0) + 1;
      save();
      return { ok: true, item, consumable: true };
    }
    if (item.effect && item.effect.xp) addXP(item.effect.xp);
    save();
    return { ok: true, item };
  }

  // 突破状态：是否处于某大段位圆满（待破境）
  function breakthroughStatus() {
    if (state.level >= MAX_LEVEL) return { capped: true, level: state.level };
    if (state.level % 10 === 0) {
      const r = realmIndexOf(state.level); // 当前大段位索引
      const need = xpForNext(state.level);
      const ready = state.xp >= need;
      return {
        atCap: true, realm: r,
        fromName: REALMS[r], toName: REALMS[r + 1],
        pillId: "break_" + r, need, ready,
        hasPill: (state.items["break_" + r] || 0) > 0
      };
    }
    return { atCap: false, level: state.level };
  }
  // 服突破丹破境：须在「本境圆满」且经验盈满，并持有对应丹
  function useBreakthrough(r) {
    const atLevel = (r + 1) * 10;
    if (state.level >= MAX_LEVEL) return { ok: false, reason: "max" };
    if (state.level !== atLevel) return { ok: false, reason: "not-at-cap" };
    if ((state.items["break_" + r] || 0) < 1) return { ok: false, reason: "no-pill" };
    if (state.xp < xpForNext(state.level)) return { ok: false, reason: "xp-not-full" };
    state.items["break_" + r] -= 1;
    const prev = state.level;
    state.xp -= xpForNext(state.level); // 耗去圆满所需经验
    state.level += 1;                    // 破界：进入下一大段位第一层
    runLevelLoop();                      // 溢出经验带入新境（冲至下一圆满须另丹）
    if (levelUpCb && state.level > prev) levelUpCb(state.level, prev);
    save();
    return { ok: true, level: state.level, realm: realmOf(state.level), from: REALMS[r], to: REALMS[r + 1] };
  }

  // ---------- 公开 API ----------
  window.EM.engine = {
    BADGES,
    REALMS,
    realmOf,
    MAX_LEVEL,
    getState: () => state,
    save,
    onChange,
    applyRemoteState,
    addXP,
    onLevelUp,
    addStones,
    spendStones,
    SHOP_ITEMS,
    buyItem,
    useBreakthrough,
    breakthroughStatus,
    tryUnlock,
    newBadges,
    xpForNext,
    learnWord,
    reviewWord,
    dueWords,
    setStudyProgress,
    getStudyProgress,
    completeGrammar,
    completeStory: (id) => completeStory(id),
    isStoryDone,
    collectDailyPack,
    unlock: (id) => unlockOn(state, id),
    recordQuiz,
    checkIn,
    tutorReply,
    todayStr,
    addDays,
    // 多角色 / 排行榜
    createProfile,
    switchProfile,
    renameProfile,
    listProfiles,
    currentProfile,
    leaderboard,
    champion,
    realmIndexOf,
    receiveGreet,
    clearGreet,
    greetingsOf,
    dailyXPOf,
    dailyXP: () => dailyXPOf(state)
  };
})();
