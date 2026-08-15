/* ============================================================
 *  English Master — 单页应用控制器
 * ============================================================ */
(function () {
  const EM = window.EM;
  const data = EM.data;
  // 合并批量核心词库（由 assets/bulkwords.js 提供，按词频打包）
  if (window.EM.bulkSets && window.EM.bulkSets.length) {
    data.wordSets = data.wordSets.concat(window.EM.bulkSets);
  }
  const eng = EM.engine;

  // 突破提示：state.xp 真正跨过当前级所需时触发（升级逻辑在引擎内完成）
  eng.onLevelUp((newLevel, oldLevel) => {
    const realm = eng.realmOf(newLevel);
    const crossedRealm = Math.floor(newLevel / 10) !== Math.floor(oldLevel / 10);
    if (newLevel >= eng.MAX_LEVEL) {
      toast("🌟 功成圆满！你已登临「真仙境」之巅！");
    } else if (crossedRealm) {
      toast("⚡ 突破大境界！晋升至「" + realm + "」！");
    } else {
      toast("✨ 修为突破！晋升至 " + realm + " Lv." + newLevel);
    }
    refreshHeader();
  });

  // 全局词典索引（用于例句点词查义 / 音标）
  const dictIndex = {};
  (function buildIndex() {
    data.wordSets.forEach((set) => set.words.forEach((w) => {
      const k = (w.en || "").toLowerCase();
      if (k && !dictIndex[k]) dictIndex[k] = { en: w.en, zh: w.zh, ipa: w.ipa || "" };
    }));
  })();

  const $ = (s, r) => (r || document).querySelector(s);
  const view = $("#view");
  let current = "home";

  // 临时状态
  let study = null; // { setId, phase:'learn'|'quiz', quiz:{words,i,score} }
  let review = null; // { quiz:{words,i,score} }
  let story = { idx: 0, finished: false, log: [], started: false };
  let currentStoryId = null;
  let tutorMsgs = [
    { who: "bot", text: "Hi! I am your English friend. 试着用英语和我打招呼吧，比如打 'Hello!' 😊", fb: "想练真实自由对话？随时在 WorkBuddy 对话框里找我(导师)聊。" }
  ];

  // 跨设备全局排行榜（来自后端；null 表示尚未连上服务器）
  let globalBoard = null;
  let lastSync = 0;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function refreshHeader() {
    const s = eng.getState();
    $("#hdr-level").innerHTML = esc(eng.realmOf(s.level)) + ' <small class="lv">Lv.' + s.level + "</small>";
    // 真实「修为」进度：用驱动突破的 state.xp，而非每日经验 dailyXP
    const need = eng.xpForNext(s.level);
    const pct = Math.max(0, Math.min(100, Math.round((s.xp / need) * 100)));
    const bs = eng.breakthroughStatus();
    let breakTag = "";
    if (bs.atCap) {
      breakTag = ' <span class="break-tag">' + (bs.ready ? "圆满·待破境" : "圆满") + "</span>";
    }
    $("#hdr-xp").innerHTML = s.xp + ' / ' + need +
      '<div class="xpbar"><i style="width:' + pct + '%"></i></div>' + breakTag;
    const hs = $("#hdr-stones");
    if (hs) hs.textContent = (s.stones || 0) + " 💎";
    const cn = $("#cur-name");
    if (cn) cn.textContent = s.name;
    updateChampion();
    // 节流上报当前角色到后端（跨设备同步）
    const now = Date.now();
    if (now - lastSync > 2000) {
      lastSync = now;
      syncNow();
    }
  }

  // ---------- 榜首横幅 ----------
  function updateChampion() {
    const b = $("#champion-banner");
    if (!b) return;
    let champ = null;
    if (globalBoard && globalBoard.length) {
      const c = globalBoard[0];
      champ = { name: c.name, todayXP: c.todayXP, level: c.level };
    } else {
      const c = eng.champion();
      if (c) champ = { name: c.name, todayXP: eng.dailyXPOf(c), level: c.level };
    }
    if (!champ) {
      b.textContent = "还没有修士入榜，点击「创建角色」开启你的修仙之旅吧！";
      updateLoser();
      return;
    }
    const tag = esc(champ.name) + "（" + esc(eng.realmOf(champ.level)) + "）";
    if (champ.todayXP > 0) {
      b.innerHTML = "🔥 今日修炼最夯：<b>" + tag + "</b> 🔥 今日已获得 " + champ.todayXP + " 修为";
    } else {
      b.innerHTML = "🔥 今日修炼最夯：<b>" + tag + "</b>（今日尚未潜心修炼，快去冲榜！）";
    }
    updateLoser();
  }

  // ---------- 末位横幅 ----------
  function getFullBoard() {
    if (globalBoard && globalBoard.length) return globalBoard;
    return eng.leaderboard().map((p) => ({
      id: p.id, name: p.name, level: p.level, streak: p.streak, todayXP: eng.dailyXPOf(p)
    }));
  }
  function updateLoser() {
    const b = $("#loser-banner");
    if (!b) return;
    const board = getFullBoard();
    // 少于 2 人时末位没有意义，隐藏横幅
    if (!board || board.length < 2) {
      b.style.display = "none";
      return;
    }
    b.style.display = "";
    const last = board[board.length - 1];
    const tag = esc(last.name) + "（" + esc(eng.realmOf(last.level)) + "）";
    if (last.todayXP > 0) {
      b.innerHTML = "🐢 今日修炼最拉：<b>" + tag + "</b> · 今日仅 " + last.todayXP + " 修为";
    } else {
      b.innerHTML = "🐢 今日修炼最拉：<b>" + tag + "</b>（今日尚未修炼，加把劲！）";
    }
  }

  // ---------- 点赞 / 道友问候（修仙段位关系） ----------
  const likedSet = (function () {
    try { return new Set(JSON.parse(localStorage.getItem("em_liked_v1") || "[]")); } catch (e) { return new Set(); }
  })();
  function persistLiked() {
    try { localStorage.setItem("em_liked_v1", JSON.stringify(Array.from(likedSet))); } catch (e) {}
  }
  function relationLabel(diff) {
    if (diff === 0) return "道友问好";
    if (diff === -1) return "小辈请安";
    if (diff <= -2) return "晚辈请安";
    if (diff === 1) return "前辈赞赏";
    return "老前辈赞赏";
  }
  function greetEmoji(diff) {
    if (diff === 0) return "🙋";
    if (diff === -1) return "🙇";
    if (diff <= -2) return "🙇🙇";
    if (diff === 1) return "👍";
    return "👏";
  }
  function realmIndexOf(level) {
    const L = Math.min(eng.MAX_LEVEL, Math.max(1, Math.floor(level) || 1));
    return Math.min(Math.floor((L - 1) / 10), eng.REALMS.length - 1);
  }
  // 接收方视角文案（未转义，展示时统一 esc）：某某（段位）道友问好…
  function buildGreetText(fromName, fromLevel, diff) {
    return fromName + "（" + eng.realmOf(fromLevel) + "）" + relationLabel(diff);
  }
  function doLike(toId) {
    const from = eng.currentProfile();
    if (toId === from.id) return;
    const toEntry = (globalBoard && globalBoard.length) ? globalBoard.find((p) => p.id === toId) : null;
    const localTo = eng.listProfiles().find((p) => p.id === toId);
    const toName = localTo ? localTo.name : (toEntry ? toEntry.name : toId);
    const toLevel = localTo ? localTo.level : (toEntry ? toEntry.level : 1);
    const diff = realmIndexOf(from.level) - realmIndexOf(toLevel);
    if (likedSet.has(toId)) { toast("已经给「" + toName + "」点过赞啦～"); return; }
    likedSet.add(toId); persistLiked();
    const text = buildGreetText(from.name, from.level, diff);
    // 本地回退：同设备的角色也能收到（离线/无服务器时生效）
    if (localTo) eng.receiveGreet(toId, { fromName: from.name, fromRealm: eng.realmOf(from.level), text: text, diff: diff, ts: Date.now() });
    fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: from.id, to: toId })
    })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.ok) toast(greetEmoji(diff) + " 你向「" + toName + "」送出问候：" + relationLabel(diff));
        else toast("对方还没连入榜单，问候已记在本地");
        if (current === "rank") renderRank();
      })
      .catch(() => { toast("💌 已记录本地问候（离线模式）"); if (current === "rank") renderRank(); });
  }
  function clearGreet() {
    const me = eng.currentProfile().id;
    eng.clearGreet(me);
    fetch("/api/greet-clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: me })
    })
      .catch(() => {})
      .finally(() => { lastGreetCount = 0; if (current === "home") renderHome(); if (current === "rank") renderRank(); });
  }
  function myGreetings() {
    const me = eng.currentProfile().id;
    if (globalBoard && globalBoard.length) {
      const e = globalBoard.find((p) => p.id === me);
      if (e && e.greetings && e.greetings.length) return e.greetings;
    }
    return eng.greetingsOf(me);
  }
  // 把单条问候渲染成修仙小说风格的「传书」卷轴
  function greetNovel(g) {
    const who = esc(g.text); // 已是 “名字（段位）关系” 形式
    const d = g.diff || 0;
    let title, scene;
    if (d === 0) {
      title = "📜 同道传书";
      scene = "一道流光掠过山门，落于你掌心，化作一枚玉简。你以神识探入，乃同道修士 <b>" + who + "</b> 的问好：「久闻道友修行勤勉，特来问好。愿共参仙道，同登长生。」";
    } else if (d === -1) {
      title = "📜 晚辈请安";
      scene = "山门外一童子躬身行礼，奉上师尊手谕：「家师 <b>" + who + "</b> 命晚辈向您请安，言道前辈道行高深，望多多指点。」";
    } else if (d <= -2) {
      title = "📜 后辈叩首";
      scene = "云阶之下，一名后辈修士长揖及地，朗声道：「晚辈 <b>" + who + "</b> 久仰前辈威名，今特来叩首请安，愿聆教诲。」";
    } else if (d === 1) {
      title = "✨ 前辈赞赏";
      scene = "天际祥云垂落，一尊前辈虚影含笑颔首：「后起之秀 <b>" + who + "</b> 于云端见你修行刻苦、心性坚韧，甚为赞赏，赠你一句『善』字真言。」";
    } else {
      title = "🌟 老祖赞许";
      scene = "一道浩荡仙音自九霄传来，德高望重的 <b>" + who + "</b> 老前辈显化法相，朗声赞许：「此子可造之材，老夫甚喜！望勤修不辍。」";
    }
    return '<div class="greet-scroll">' +
      '<div class="greet-scroll-title">' + title + '</div>' +
      '<div class="greet-scroll-body">' + scene + '</div>' +
      '</div>';
  }
  // 弹窗：以修仙小说卷轴呈现仙门来讯
  function openGreetModal(list) {
    const gs = list && list.length ? list : myGreetings();
    if (!gs || !gs.length) { toast("暂无仙门来讯～"); return; }
    const scrolls = gs.slice().reverse().map(greetNovel).join("");
    openModal(
      '<div class="greet-modal-head">📜 仙门来讯 · 飞剑传书</div>' +
      '<div class="greet-scrolls">' + scrolls + '</div>' +
      '<div class="greet-modal-actions">' +
      '<button class="btn full accent" data-action="modal-close">📜 收下入册</button>' +
      (current === "home" || current === "rank"
        ? '<button class="btn full ghost" data-action="greet-clear" style="margin-top:8px">🗑 尽数焚去</button>'
        : "") +
      '</div>'
    );
  }
  function renderGreetCard() {
    const gs = myGreetings();
    if (!gs || !gs.length) return "";
    return '<div class="card greet-card">' +
      '<h2>💌 仙门来讯（' + gs.length + '）</h2>' +
      '<p class="muted">有 ' + gs.length + ' 封飞剑传书落入你掌心，展开可见道友问好、晚辈请安或前辈赞赏。</p>' +
      '<button class="btn full" data-action="open-greet">📜 展卷阅读来讯</button>' +
      '<button class="btn full ghost" data-action="greet-clear" style="margin-top:8px">🗑 尽数焚去</button>' +
      '</div>';
  }
  // 突破提示：处于某大段位圆满且经验满时，提示需服突破丹破界
  function renderBreakBanner() {
    const bs = eng.breakthroughStatus();
    if (bs.capped) return "";
    if (!bs.atCap) return "";
    if (bs.ready) {
      if (bs.hasPill) {
        return '<div class="card break-banner break-ready">⚡ 你已至 <b>' + bs.fromName + '圆满</b>，经验盈满！储物袋中已有『' + bs.toName + '』之突破丹，前往仙市 <b>服丹破境</b> 即可飞升。</div>';
      }
      return '<div class="card break-banner break-ready">⚡ 你已至 <b>' + bs.fromName + '圆满</b>，经验盈满！尚缺『' + bs.toName + '』之突破丹——前往仙市兑换，方可破界飞升。</div>';
    }
    return '<div class="card break-banner">⚡ 你已至 <b>' + bs.fromName + '圆满</b>。继续修炼攒满经验，再购对应突破丹，方可破界飞升『' + bs.toName + '』。</div>';
  }

  // ---------- 跨设备 / 云端实时同步 ----------
  function syncNow() {
    const s = eng.getState();
    fetch("/api/save", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    })
      .then((r) => r.json())
      .then((d) => { if (d && d.list) { globalBoard = d.list; afterBoard(); } })
      .catch(() => { /* 离线：保留本地榜单 */ });
  }
  function refreshBoard() {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { if (d && d.list) { globalBoard = d.list; afterBoard(); } })
      .catch(() => { /* 离线：保留本地榜单 */ });
  }
  let greetInit = false;
  let lastGreetCount = 0;
  function afterBoard() {
    updateChampion();
    const gs = myGreetings();
    const n = (gs && gs.length) || 0;
    if (!greetInit) { lastGreetCount = n; greetInit = true; }
    else if (n > lastGreetCount) {
      const fresh = gs.slice(lastGreetCount);
      toast("💌 你收到 " + (n - lastGreetCount) + " 封新的仙门来讯！展开飞剑传书看看～");
      setTimeout(() => openGreetModal(fresh), 700);
    }
    lastGreetCount = n;
    if (current === "rank") renderRank();
    if (current === "home") renderHome();
  }

  // ---------- 弹窗 ----------
  function openModal(html) {
    const box = $("#modal-box");
    box.innerHTML = html;
    $("#modal").classList.remove("hidden");
  }
  function closeModal() {
    $("#modal").classList.add("hidden");
  }

  // ---------- 创建角色 ----------
  function createChar() {
    openModal(
      '<h2>🧑‍🎓 创建角色</h2>' +
      '<p class="muted">给你的英语学习者起个名字，开启学习旅程！</p>' +
      '<input id="char-name" placeholder="例如：小明 / Lucy / 英语小王子" maxlength="12" ' +
      'style="width:100%;padding:11px 14px;border:1px solid var(--line);border-radius:12px;font-size:15px" ' +
      'onkeydown="if(event.key===\'Enter\')EM_app.createCharConfirm()" />' +
      '<div id="char-err" class="muted" style="color:var(--bad);margin-top:6px"></div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button class="btn full" data-action="char-confirm">✅ 创建并开始</button>' +
      '<button class="btn full ghost" data-action="modal-close">取消</button>' +
      '</div>'
    );
    setTimeout(() => { const i = $("#char-name"); if (i) i.focus(); }, 50);
  }
  function createCharConfirm() {
    const i = $("#char-name");
    const name = (i.value || "").trim();
    if (!name) { $("#char-err").textContent = "名字不能为空哦～"; return; }
    eng.createProfile(name);
    closeModal();
    toast("🎉 角色「" + name + "」已创建，开始学习吧！");
    refreshHeader();
    render();
  }

  // ---------- 切换 / 改名 ----------
  function switchChar() {
    const ps = eng.listProfiles();
    const cur = eng.currentProfile().id;
    const rows = ps.map((p) => {
      const d = eng.dailyXPOf(p);
      const me = p.id === cur ? ' style="border-color:var(--brand);background:var(--brand-soft)"' : "";
      return '<div class="char-row"' + me + '>' +
        '<div style="flex:1"><b>' + esc(p.name) + '</b>' + (p.id === cur ? ' <span class="muted">(当前)</span>' : '') +
        '<div class="muted">' + esc(eng.realmOf(p.level)) + ' · 今日 +' + d + ' · 连签 ' + p.streak + '🔥</div></div>' +
        '<button class="btn sm" data-action="char-pick" data-id="' + p.id + '">' + (p.id === cur ? "使用中" : "切换") + '</button>' +
        '<button class="btn sm ghost" data-action="char-rename" data-id="' + p.id + '">✎改名</button>' +
        '</div>';
    }).join("");
    openModal(
      '<h2>🧑‍🎓 选择 / 切换角色</h2>' +
      '<div class="char-list">' + rows + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button class="btn full accent" data-action="create-char">➕ 新建角色</button>' +
      '<button class="btn full ghost" data-action="modal-close">关闭</button>' +
      '</div>'
    );
  }
  function pickChar(id) {
    eng.switchProfile(id);
    closeModal();
    toast("已切换到 " + eng.currentProfile().name);
    refreshHeader();
    render();
  }
  function renameChar(id) {
    const p = eng.listProfiles().find((x) => x.id === id);
    if (!p) return;
    openModal(
      '<h2>✎ 改名</h2>' +
      '<input id="rename-input" value="' + esc(p.name) + '" maxlength="12" ' +
      'style="width:100%;padding:11px 14px;border:1px solid var(--line);border-radius:12px;font-size:15px" ' +
      'onkeydown="if(event.key===\'Enter\')EM_app.renameConfirm(\'' + p.id + '\')" />' +
      '<div id="rename-err" class="muted" style="color:var(--bad);margin-top:6px"></div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button class="btn full" data-action="rename-confirm" data-id="' + p.id + '">保存</button>' +
      '<button class="btn full ghost" data-action="switch-char">返回</button>' +
      '</div>'
    );
    setTimeout(() => { const i = $("#rename-input"); if (i) { i.focus(); i.select(); } }, 50);
  }
  function renameConfirm(id) {
    const i = $("#rename-input");
    const name = (i.value || "").trim();
    if (!name) { $("#rename-err").textContent = "名字不能为空"; return; }
    eng.renameProfile(id, name);
    closeModal();
    toast("已改名为 " + name);
    refreshHeader();
    render();
  }

  // ---------- 路由 ----------
  function go(v) {
    current = v;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === v));
    render();
    refreshHeader();
  }

  function render() {
    if (current === "home") renderHome();
    else if (current === "words") renderWords();
    else if (current === "grammar") renderGrammar();
    else if (current === "story") renderStory();
    else if (current === "tutor") renderTutor();
    else if (current === "checkin") renderCheckin();
    else if (current === "daily") renderDaily();
    else if (current === "shop") renderShop();
    else if (current === "rank") renderRank();
  }

  // ---------- 排行榜 ----------
  function renderRank() {
    const curId = eng.currentProfile().id;
    const board = (globalBoard && globalBoard.length)
      ? globalBoard
      : eng.leaderboard().map((p) => ({
          id: p.id, name: p.name, level: p.level, streak: p.streak, todayXP: eng.dailyXPOf(p)
        }));
    const medals = ["🥇", "🥈", "🥉"];
    const rows = board.map((p, i) => {
      const medal = medals[i] || "#" + (i + 1);
      const me = p.id === curId ? " me" : "";
      const liked = likedSet.has(p.id);
      const likeBtn = p.id === curId ? "" :
        '<button class="btn sm like-btn ' + (liked ? "liked" : "") + '" data-action="like" data-id="' + p.id + '"' + (liked ? " disabled" : "") + '>' +
        (liked ? "✅ 已赞" : "👍 点赞") + "</button>";
      const likeCnt = p.likes ? ' <span class="muted">❤' + p.likes + "</span>" : "";
      return '<div class="rank-row' + me + '">' +
        '<div class="rank-no">' + medal + '</div>' +
        '<div class="rank-name"><b>' + esc(p.name) + '</b>' + (p.id === curId ? ' <span class="muted">(你)</span>' : '') +
        '<div class="muted">' + esc(eng.realmOf(p.level)) + ' · 连签 ' + p.streak + '🔥</div></div>' +
        '<div class="rank-xp">今日 <b>+' + p.todayXP + '</b></div>' +
        '<div class="rank-act">' + likeBtn + likeCnt + '</div>' +
        '</div>';
    }).join("");
    const online = globalBoard && globalBoard.length;
    view.innerHTML =
      '<h2>🏆 今日修炼排行榜' + (online ? '（跨设备）' : '') + '</h2>' +
      '<p class="muted">按「今日获得修为」' + (online ? '全球' : '本机') + '排名，每日子时自动刷新。勤修冲榜，成为当前修炼最猛之人！' +
      (online ? '' : '（未连上服务器，显示本机角色；用服务器地址打开即可跨设备比拼）') + '</p>' +
      '<p class="muted">💡 点「👍 点赞」向道友问好：同段位称「道友问好」，低你一段称「小辈请安」，高你一段称「前辈赞赏」，对方会在主页收到你的问候！</p>' +
      '<div class="card">' + (rows || '<p class="muted">还没有角色，点击「创建角色」开始吧～</p>') + '</div>' +
      '<button class="btn full ghost" data-action="go-home">返回首页</button>';
  }

  // ---------- 首页 ----------
  function renderHome() {
    const s = eng.getState();
    const totalWords = data.wordSets.reduce((n, x) => n + x.words.length, 0);
    const learned = s.stats.wordsLearned;
    const gramDone = Object.keys(s.grammarDone).length;
    const due = allDueCount();

    const gotCount = eng.BADGES.filter((b) => s.badges.includes(b.id)).length;
    const totalCount = eng.BADGES.length;
    const pct = Math.round((gotCount / totalCount) * 100);
    // 按 cat 分组展示仙勋墙
    const order = ["灵根初现", "试炼心剑", "仙途历险", "勤勉不辍", "每日荐修", "境界攀升", "道缘交际", "至高成就"];
    const groups = {};
    eng.BADGES.forEach((b) => { (groups[b.cat] = groups[b.cat] || []).push(b); });
    const badgeHtml = order.filter((c) => groups[c]).map((c) => {
      const items = groups[c].map((b) => {
        const got = s.badges.includes(b.id);
        return `<div class="badge ${got ? "" : "locked"}" title="${esc(b.desc)}"><div class="ico">${b.icon}</div><div class="bn">${b.name}</div></div>`;
      }).join("");
      const gc = groups[c].filter((b) => s.badges.includes(b.id)).length;
      return `<div class="badge-group"><div class="badge-group-h"><span>${c}</span><span class="muted">${gc}/${groups[c].length}</span></div><div class="grid grid-4">${items}</div></div>`;
    }).join("");

    view.innerHTML = `
      <div class="card">
        <h2>👋 欢迎回来，未来的修仙英语大能！</h2>
        <p class="muted">每日潜心修炼十息，依「可理解输入 + 间隔重复」稳步登阶。先通词藏与心法，再入剧情历练，终与导师论道。</p>
        <div class="grid grid-3" style="margin-top:12px">
          <div class="card" style="margin:0"><div class="muted">词藏</div><div class="en" style="font-size:22px">${learned}/${totalWords}</div><div class="muted">已拾仙言</div></div>
          <div class="card" style="margin:0"><div class="muted">心法</div><div class="en" style="font-size:22px">${gramDone}/${data.grammar.length}</div><div class="muted">已修诀法</div></div>
          <div class="card" style="margin:0"><div class="muted">试剑命中率</div><div class="en" style="font-size:22px">${rate()}</div><div class="muted">${s.stats.quizzes} 次试剑</div></div>
        </div>
        ${due > 0 ? `<div class="notice" style="margin-top:12px">🔁 今日有 <b>${due}</b> 道仙言待温故（间隔重复）。<button class="btn sm ghost" data-action="open-review">去温故</button></div>` : `<div class="notice" style="margin-top:12px">✅ 暂无待温故仙言，识海澄明！</div>`}
      </div>

      ${renderGreetCard()}

      ${renderBreakBanner()}

      <div class="card">
        <h2>🗺️ 今日修程 · 登仙之路</h2>
        <p class="muted" style="margin:6px 0 14px">循此五步进境，日拱一卒，自炼气直至真仙。每证一步，皆攒修行功德。</p>
        <div class="route">
          <div class="route-step">
            <div class="route-no">壹</div>
            <div class="route-ico">🗿</div>
            <div class="route-body">
              <div class="route-title">词藏 · 拾取仙言</div>
              <div class="route-desc">开启今日<b>词藏</b>，自词海拾取一组未习古仙语，铭于识海。</div>
              <button class="btn sm" data-action="go-words">入词藏</button>
            </div>
          </div>
          <div class="route-step">
            <div class="route-no">贰</div>
            <div class="route-ico">📿</div>
            <div class="route-body">
              <div class="route-title">心法 · 修习一诀</div>
              <div class="route-desc">研习一部<b>心法</b>（语法），明悟仙言之理法枢机。</div>
              <button class="btn sm ghost" data-action="go-grammar">修心法</button>
            </div>
          </div>
          <div class="route-step">
            <div class="route-no">叁</div>
            <div class="route-ico">🏯</div>
            <div class="route-body">
              <div class="route-title">秘境 · 历练试炼</div>
              <div class="route-desc">踏入修仙之路<b>秘境</b>，于剧情闯关之中炼心证道。</div>
              <button class="btn sm accent" data-action="go-story">入秘境</button>
            </div>
          </div>
          <div class="route-step">
            <div class="route-no">肆</div>
            <div class="route-ico">☯️</div>
            <div class="route-body">
              <div class="route-title">论道 · 仙师陪练</div>
              <div class="route-desc">与仙师<b>论道</b>，于对话交锋间打磨口语真火。</div>
              <button class="btn sm" data-action="go-tutor">去论道</button>
            </div>
          </div>
          <div class="route-step">
            <div class="route-no">伍</div>
            <div class="route-ico">📜</div>
            <div class="route-body">
              <div class="route-title">仙谕 · 每日荐学</div>
              <div class="route-desc">领受今日<b>仙谕</b>，串记十词入魂，功德自显。</div>
              <button class="btn sm" data-action="go-daily">领仙谕</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🏅 我的仙勋墙</h2>
        <div class="badge-progress">
          <div class="badge-progress-bar"><div class="badge-progress-fill" style="width:${pct}%"></div></div>
          <div class="badge-progress-txt">已获 <b>${gotCount}</b> / 共 ${totalCount} 枚仙勋 · 灵蕴 ${pct}%</div>
        </div>
        ${badgeHtml}
      </div>
    `;
  }
  function rate() {
    const s = eng.getState();
    if (!s.stats.quizzes) return "—";
    return Math.round((s.stats.correct / s.stats.quizzes) * 100) + "%";
  }
  function allDueCount() {
    let n = 0;
    data.wordSets.forEach((set) => {
      n += eng.dueWords(set.id, set.words).length;
    });
    return n;
  }
  function allWords() {
    const r = [];
    data.wordSets.forEach((set) => set.words.forEach((w) => r.push(Object.assign({ setId: set.id }, w))));
    return r;
  }
  // 仅返回已铭刻（学过）的仙言，用于「温故」复习
  function learnedWords() {
    const learned = eng.getState().words || {};
    return allWords().filter((w) => learned[w.setId + ":" + w.en]);
  }

  // ---------- 单词 ----------
  function renderWords() {
    const s = eng.getState();
    const cards = data.wordSets.map((set) => {
      const learned = set.words.filter((w) => s.words[set.id + ":" + w.en]).length;
      const prog = eng.getStudyProgress(set.id);
      const resuming = prog > 0 && prog < set.words.length;
      const btn = resuming
        ? `<button class="btn sm accent" data-action="open-set" data-set="${set.id}">⏩ 续修 (${prog}/${set.words.length})</button>`
        : `<button class="btn sm" data-action="open-set" data-set="${set.id}">入藏参悟</button>`;
      const resumeTag = resuming ? `<div class="muted" style="margin-top:6px">上次参悟至第 ${prog} 言，可续修</div>` : "";
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3>${set.emoji} ${set.title}</h3>
          <span class="muted">${learned}/${set.words.length}</span>
        </div>
        <div class="bar" style="margin:8px 0"><i style="width:${learned ? (learned / set.words.length) * 100 : 0}%"></i></div>
        ${btn}
        ${resumeTag}
      </div>`;
    }).join("");
    view.innerHTML = `<h2>🗿 词藏 · 拾取仙言（主题词窟 + 核心词库 共 ${data.wordSets.length} 处）</h2><p class="muted">核心词库按仙语现世之频分为多处词窟，自最高频处起手参悟最见成效。点「入藏参悟」逐卷翻卡，将古仙语铭于识海；中途退出后会记住进度，下次可「续修」。</p><div class="grid grid-2">${cards}</div>`;
  }

  function openSet(setId) {
    const set = data.wordSets.find((x) => x.id === setId);
    let idx = eng.getStudyProgress(setId);
    if (idx >= set.words.length) idx = 0; // 已参悟完毕，重头再修
    study = { setId, phase: "learn", idx, learnedThisRun: 0, quiz: null, resumed: idx > 0 };
    if (study.resumed) toast("⏩ 续修：自第 " + (idx + 1) + " 言继续参悟");
    renderStudy(set);
  }

  function renderStudy(set) {
    if (study.phase === "quiz") {
      renderQuiz(study.quiz, "go-words", "试剑台");
      return;
    }
    const total = set.words.length;
    if (study.idx >= total) {
      view.innerHTML = `
        <div class="card" style="text-align:center">
          <div class="streak-big">🎉</div>
          <h2>此卷仙言已尽数参悟！</h2>
          <p class="muted">这一处词窟共 ${total} 言，本次新铭 <b>${study.learnedThisRun}</b> 道仙言于识海。</p>
          <button class="btn full accent" data-action="start-quiz">🗡 入试剑台巩固</button>
          <button class="btn full ghost" data-action="go-words" style="margin-top:8px">← 返回词藏</button>
        </div>`;
      return;
    }
    const w = set.words[study.idx];
    const done = !!eng.getState().words[study.setId + ":" + w.en];
    view.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center" class="muted">
          <span>${set.emoji} ${set.title}${study.resumed ? ' <span class="pill">续修中</span>' : ''}</span><span>${study.idx + 1} / ${total}</span>
        </div>
        <div class="flash" style="margin:16px 0;padding:26px;text-align:center">
          <div class="word" style="font-size:30px">${esc(w.en)}</div>
          <div class="ipa">${esc(w.ipa || "")}</div>
          <div class="meta" id="meta-0" style="display:none;margin-top:10px">
            <div class="ex" style="font-size:18px">${esc(w.zh)}</div>
            ${w.ex ? '<div class="ex muted" style="margin-top:6px">' + clickable(w.ex) + '</div>' : ''}
          </div>
        </div>
        <button class="btn sm ghost" data-action="flip" data-i="0">显化释义</button>
        <button class="btn full accent" data-action="learn-next" data-learned="1" style="margin-top:8px">✅ 此言已铭识海 (+5 · +2💎)</button>
        <button class="btn full ghost" data-action="learn-next" data-learned="0">⏭ 下一言</button>
        <button class="btn full" data-action="start-quiz" style="margin-top:8px">🗡 入试剑台</button>
        <button class="btn full" data-action="go-words">← 返回词藏</button>
      </div>`;
  }

  function startQuiz() {
    const set = data.wordSets.find((x) => x.id === study.setId);
    study.quiz = { words: shuffle(set.words.map((w) => Object.assign({ setId: set.id }, w))), i: 0, score: 0 };
    study.phase = "quiz";
    renderStudy(set);
  }

  // ---------- 通用测验 (MCQ) ----------
  function renderQuiz(q, backAction, title) {
    if (q.i >= q.words.length) {
      const pct = Math.round((q.score / q.words.length) * 100);
      view.innerHTML = `
        <div class="card" style="text-align:center">
          <h2>🎉 试剑功成！</h2>
          <div class="streak-big">${pct}%</div>
          <p class="muted">本次试剑 ${q.score}/${q.words.length} 道，皆中其的</p>
          <button class="btn full" data-action="${backAction}">归</button>
        </div>`;
      return;
    }
    const w = q.words[q.i];
    const others = allWords().filter((x) => x.zh !== w.zh).map((x) => x.zh);
    const opts = shuffle([w.zh].concat(sample(others, 3)));
    const optsHtml = opts.map((o, k) => `<button class="choice" data-action="quiz-answer" data-set="${w.setId}" data-en="${esc(w.en)}" data-ans="${esc(o)}" data-correct="${o === w.zh ? 1 : 0}">${esc(o)}</button>`).join("");
    view.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between" class="muted"><span>${title}</span><span>${q.i + 1}/${q.words.length}</span></div>
        <div class="flash" style="margin:12px 0">
          <div class="word">${esc(w.en)}</div>
          <div class="ipa">${esc(w.ipa || "")}</div>
        </div>
        <p class="muted">此仙言在古仙语中作何解？</p>
        ${optsHtml}
        <button class="btn full ghost" data-action="${backAction}" style="margin-top:10px">← 退出试剑台</button>
      </div>`;
  }

  function onQuizAnswer(el, backAction, title, qRef) {
    const correct = el.dataset.correct === "1";
    eng.recordQuiz(correct);
    if (correct) qRef.score += 1;
    // 视觉反馈
    document.querySelectorAll('.choice[data-action="quiz-answer"]').forEach((c) => {
      c.disabled = true;
      if (c.dataset.correct === "1") c.classList.add("ok");
      else if (c === el) c.classList.add("no");
    });
    toast(correct ? "✅ 一剑中的！+8 XP · +3 💎" : "❌ 剑走偏锋，已记入温故录 · +1 💎");
    setTimeout(() => { qRef.i += 1; renderQuiz(qRef, backAction, title); refreshHeader(); }, 700);
  }

  // ---------- 语法 ----------
  function renderGrammar() {
    const s = eng.getState();
    const cards = data.grammar.map((g) => {
      const done = s.grammarDone[g.id];
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3>${g.title} <span class="muted">· ${g.level}</span></h3>
          ${done ? '<span class="en">✓ 已学</span>' : ""}
        </div>
        <button class="btn sm" data-action="grammar-open" data-id="${g.id}">${done ? "重温" : "始修"}</button>
      </div>`;
    }).join("");
    view.innerHTML = `<h2>📿 心法 · 修习一诀（共 ${data.grammar.length} 部 · A1–A2）</h2><div class="grid grid-2">${cards}</div>`;
  }

  function grammarOpen(id) {
    const g = data.grammar.find((x) => x.id === id);
    const points = g.points.map((p) => `<div style="margin:6px 0"><span class="en">${esc(p.en)}</span> — ${esc(p.zh)}</div>`).join("");
    const prac = g.practice.map((p, i) => `
      <div class="card" style="margin:10px 0">
        <div>${esc(p.q)}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input id="gp-${i}" placeholder="凝诀填入仙言…" style="flex:1;padding:9px 12px;border:1px solid var(--line);border-radius:10px" />
          <button class="btn sm" data-action="grammar-check" data-id="${g.id}" data-idx="${i}">检查</button>
        </div>
        <div id="gpr-${i}"></div>
      </div>`).join("");
    view.innerHTML = `
      <div class="card">
        <h2>${g.title}</h2>
        <p>${esc(g.explain)}</p>
        <h3>📜 心诀示例</h3>
        ${points}
        <h3>🖋 运诀演练（填空）</h3>
        ${prac}
        <button class="btn full accent" data-action="grammar-done" data-id="${g.id}">✅ 此诀已成（+15 XP）</button>
        <button class="btn full ghost" data-action="go-grammar" style="margin-top:8px">← 返回心法</button>
      </div>`;
  }

  function grammarCheck(id, idx) {
    const g = data.grammar.find((x) => x.id === id);
    const inp = $("#gp-" + idx);
    const val = (inp.value || "").trim().toLowerCase().replace(/\s+/g, " ");
    const ans = g.practice[idx].a.toLowerCase();
    const box = $("#gpr-" + idx);
    if (val === ans) {
      box.innerHTML = `<div class="choice ok" style="margin:0">✅ 诀法无误！</div>`;
      eng.recordQuiz(true);
      toast("✅ 诀法无误！");
    } else {
      box.innerHTML = `<div class="choice no" style="margin:0">❌ 正解：<b>${esc(g.practice[idx].a)}</b> ｜ 心诀：${esc(g.practice[idx].hint)}</div>`;
      eng.recordQuiz(false);
      toast("❌ 再参参心诀");
    }
    refreshHeader();
  }

  // ---------- 剧情 (多剧情) ----------
  function getStory(id) {
    return data.stories.find((x) => x.id === id);
  }
  function renderStory() {
    if (!currentStoryId) { renderStoryList(); return; }
    const def = getStory(currentStoryId);
    const idx = data.stories.findIndex((x) => x.id === def.id);
    const isLast = idx === data.stories.length - 1;
    const chap = def.chapter || (idx + 1);
    if (story.finished) {
      view.innerHTML = `
        <div class="card" style="text-align:center">
          <div class="streak-big">🎉</div>
          <h2>《修仙之路·第${chap}卷 ${esc(def.title)}》通关！</h2>
          <p class="muted">你用古仙语完成了这场冒险，太棒了！</p>
          ${isLast
            ? '<div class="notice" style="margin:10px 0">📜 <b>内容持续更新中……</b>《修仙之路》并未终结，仙界篇、秘境篇等更多奇遇即将开启，敬请期待！</div>'
            : '<p class="muted">下一卷已在路上，集齐七卷可窥仙门全貌。</p>'}
          <button class="btn full" data-action="story-restart">🔁 再玩一次</button>
          <button class="btn full ghost" data-action="story-list" style="margin-top:8px">← 返回修仙之路总览</button>
        </div>`;
      return;
    }
    if (!story.started) {
      view.innerHTML = `
        <div class="card">
          <h2>第${chap}卷 · ${def.emoji} ${esc(def.title)}</h2>
          ${def.recap ? '<p class="muted" style="color:var(--brand)">🪷 前情提要：' + esc(def.recap) + '</p>' : ""}
          <p>${esc(def.intro)}</p>
          <button class="btn full accent" data-action="story-start">▶ 开始闯关</button>
          <button class="btn full ghost" data-action="story-list" style="margin-top:8px">← 返回修仙之路总览</button>
        </div>`;
      return;
    }
    const sc = def.scenes[story.idx];
    const order = shuffle(sc.choices.map((c, i) => i));   // 打乱顺序，避免正确答案恒为第一项
    const choices = order.map((i) => `<button class="choice" data-action="story-choice" data-choice="${i}">${esc(sc.choices[i].text)}</button>`).join("");
    view.innerHTML = `
      <div class="card">
        <div class="muted">第 ${chap} 卷 · 第 ${story.idx + 1} / ${def.scenes.length} 关 · ${esc(def.title)}</div>
        <div class="scene" style="margin-top:10px">
          <p>${esc(sc.narration)}</p>
          <p class="en">${esc(sc.prompt)}</p>
          ${choices}
          <div id="story-fb"></div>
        </div>
        <button class="btn full ghost" data-action="story-list" style="margin-top:10px">← 返回修仙之路总览</button>
      </div>`;
  }
  function renderStoryList() {
    const cards = data.stories.map((st, i) => {
      const done = eng.isStoryDone(st.id);
      const chap = st.chapter || (i + 1);
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3>第${chap}卷 · ${st.emoji} ${esc(st.title)}</h3>
          ${done ? '<span class="en">✓ 已通关</span>' : '<span class="muted">待挑战</span>'}
        </div>
        ${st.recap ? '<p class="muted" style="color:var(--brand)">🪷 前情提要：' + esc(st.recap) + '</p>' : ""}
        <p class="muted">${esc(st.intro)}</p>
        <div class="muted">共 ${st.scenes.length} 关</div>
        <button class="btn sm" data-action="story-open" data-id="${st.id}">${done ? "重玩" : "开始闯关"}</button>
      </div>`;
    }).join("");
    const totalDone = data.stories.filter((s) => eng.isStoryDone(s.id)).length;
    view.innerHTML = `
      <h2>🗡️ 修仙之路 · 剧情闯关</h2>
      <div class="card" style="background:var(--brand-soft)">
        <p style="margin:0">🌟 你本是一介凡人。白须老者<b>玄机真人</b>点醒你：欲修仙道，须通<b>古仙语（英语）</b>。从此你持灵珠、携灵狐小白、仗青芒剑，一路以古仙语闯过奇遇城镇与秘境，向着仙门前行。七卷连成一线，每卷首尾皆有联动。</p>
      </div>
      <p class="muted">在故事里用英语（古仙语）做选择，沉浸式练表达。完成每卷可得 +30 XP 与专属勋章！已通关 ${totalDone}/${data.stories.length} 卷。</p>
      <div class="grid grid-2">${cards}</div>
      <div class="notice" style="margin-top:12px">📜 <b>内容持续更新中……</b>《修仙之路》后续篇章（仙界篇 · 秘境篇 · 上古遗秘篇等）正在筹备，更多奇遇即将解锁，敬请期待！</div>
      <button class="btn full ghost" data-action="go-home" style="margin-top:8px">返回首页</button>`;
  }

  function storyStart() {
    story = { idx: 0, finished: false, log: [], started: true };
    renderStory();
  }
  function storyChoice(i) {
    const sc = getStory(currentStoryId).scenes[story.idx];
    const c = sc.choices[i];
    const fb = $("#story-fb");
    if (c.ok) {
      fb.innerHTML = `<div class="choice ok" style="margin:0">✅ ${esc(c.fb)}</div>`;
      toast("✅ 选对了！");
      setTimeout(() => {
        if (sc.next === null) {
          story.finished = true;
          eng.completeStory(currentStoryId);
          refreshHeader();
          renderStory();
          toast("🏆 通关！+30 XP · +15 💎");
        } else {
          story.idx += 1;
          renderStory();
        }
      }, 900);
    } else {
      fb.innerHTML = `<div class="choice no" style="margin:0">❌ ${esc(c.fb)} 再试一次～</div>`;
      toast("❌ 不对哦，再想想");
    }
  }

  // ---------- 陪练 ----------
  function renderTutor() {
    const msgs = tutorMsgs.map((m) => `
      <div class="msg ${m.who}">
        <div class="bubble">${esc(m.text)}</div>
        ${m.fb ? `<div class="fb">💡 ${esc(m.fb)}</div>` : ""}
      </div>`).join("");
    view.innerHTML = `
      <div class="card">
        <h2>💬 AI 对话陪练（入门版）</h2>
        <p class="muted">应用内置规则导师，覆盖打招呼/自我介绍/天气/食物/数字等。真实自由对话请在 WorkBuddy 里找我(导师)。</p>
        <div class="chat" id="chat">${msgs}</div>
        <div class="input-row">
          <input id="tutor-input" placeholder="用英语说点什么，例如 Hello!" onkeydown="if(event.key==='Enter')EM_app.sendTutor()" />
          <button class="btn" data-action="tutor-send">发送</button>
        </div>
        <button class="btn full ghost" data-action="go-home" style="margin-top:10px">返回首页</button>
      </div>`;
    const chat = $("#chat");
    chat.scrollTop = chat.scrollHeight;
  }
  function sendTutor() {
    const inp = $("#tutor-input");
    const val = inp.value.trim();
    if (!val) return;
    tutorMsgs.push({ who: "user", text: val });
    const r = eng.tutorReply(val);
    tutorMsgs.push({ who: "bot", text: r.reply, fb: r.fb });
    inp.value = "";
    renderTutor();
  }

  // ---------- 打卡 ----------
  function renderCheckin() {
    const s = eng.getState();
    const goals = [
      { name: "连续打卡 7 天", cur: Math.min(s.streak, 7), tar: 7 },
      { name: "学完 8 个词集", cur: Object.keys(s.words).length, tar: data.wordSets.reduce((n, x) => n + x.words.length, 0) },
      { name: "修完全部心法", cur: Object.keys(s.grammarDone).length, tar: data.grammar.length },
      { name: "通关全部剧情", cur: Object.keys(s.storiesDone || {}).length, tar: data.stories.length }
    ];
    const goalHtml = goals.map((g) => `
      <div class="card" style="margin:0">
        <div style="display:flex;justify-content:space-between"><b>${g.name}</b><span class="muted">${g.cur}/${g.tar}</span></div>
        <div class="bar" style="margin-top:8px"><i style="width:${Math.min(100, (g.cur / g.tar) * 100)}%"></i></div>
      </div>`).join("");
    const checkedToday = s.lastCheckin === eng.todayStr();
    view.innerHTML = `
      <div class="card" style="text-align:center">
        <h2>🔥 每日打卡</h2>
        <div class="streak-big">${s.streak} 天</div>
        <p class="muted">连续打卡能解锁勋章，坚持就是胜利！</p>
        <button class="btn full accent" data-action="checkin" ${checkedToday ? "disabled" : ""}>${checkedToday ? "✅ 今日已打卡" : "📅 立即打卡 (+10 XP)"}</button>
      </div>
      <div class="card">
        <h2>🎯 挑战目标</h2>
        <div class="grid grid-2">${goalHtml}</div>
      </div>
      <button class="btn full ghost" data-action="go-home">返回首页</button>`;
  }
  function doCheckin() {
    const r = eng.checkIn();
    if (r.already) toast("今天已经打卡啦～");
    else if (r.frozen) toast("💊 续修仙丹显灵！连击已延续至 " + r.streak + " 天");
    else toast("🔥 打卡成功！连续 " + r.streak + " 天 · +5 💎");
    refreshHeader();
    renderCheckin();
  }

  // ---------- 灵石商店（仙市） ----------
  function renderShop() {
    const s = eng.getState();
    const stones = s.stones || 0;
    const inv = s.items || {};
    const bs = eng.breakthroughStatus(); // 当前是否处于某境圆满待破界

    // 普通仙物（非突破丹）
    const normal = eng.SHOP_ITEMS.filter((it) => it.kind !== "breakthrough").map((it) => {
      const owned = it.kind === "consumable" ? (inv[it.id] || 0) : 0;
      const afford = stones >= it.price;
      const ownTag = it.kind === "consumable" && owned > 0
        ? '<div class="shop-owned">储物袋已有 ' + owned + ' 枚</div>' : "";
      return '<div class="card shop-item">' +
        '<div class="shop-ico">' + it.icon + '</div>' +
        '<div class="shop-head"><div class="shop-name">' + esc(it.name) + (it.kind === "consumable" ? ' <span class="muted">· 消耗品</span>' : '') + '</div>' +
          '<span class="shop-price">' + it.price + ' 💎</span></div>' +
        '<div class="shop-desc">' + esc(it.desc) + '</div>' +
        ownTag +
        '<button class="btn full ' + (afford ? "accent" : "ghost") + '" data-action="shop-buy" data-id="' + it.id + '"' + (afford ? "" : " disabled") + '>' +
          (afford ? "兑换" : "灵石不足") + '</button>' +
        '</div>';
    }).join("");

    // 突破丹药：每境圆满→下一境 一丹，异色异价
    const breaks = eng.SHOP_ITEMS.filter((it) => it.kind === "breakthrough").map((it) => {
      const owned = inv[it.id] || 0;
      const afford = stones >= it.price;
      const isNeeded = bs.atCap && bs.pillId === it.id; // 正需此丹破境
      const canBreak = isNeeded && bs.ready && owned > 0; // 已圆满+经验满+持丹 → 可破
      const style = ' style="border-color:' + it.color + ';box-shadow:0 0 0 1px ' + it.color + '55, 0 0 14px ' + it.color + '33"';
      const btn = canBreak
        ? '<button class="btn full accent" data-action="use-break" data-id="' + it.id + '">⚡ 服丹破境</button>'
        : '<button class="btn full ' + (afford ? "" : "ghost") + '" data-action="shop-buy" data-id="' + it.id + '"' + (afford ? "" : " disabled") + '>' +
            (afford ? "兑换 · " + it.price + " 💎" : "灵石不足") + '</button>';
      const note = isNeeded
        ? (bs.ready
            ? (owned > 0 ? '<div class="shop-owned" style="color:' + it.color + '">⚡ 已至' + bs.fromName + '圆满，经验盈满，可服此丹破境！</div>' : '<div class="shop-owned">⚡ 已至' + bs.fromName + '圆满且经验盈满，购得此丹即可破境。</div>')
            : '<div class="shop-owned">已至' + bs.fromName + '圆满，尚待经验盈满方可破境。</div>')
        : "";
      const tag = isNeeded ? ' <span class="muted" style="color:' + it.color + '">· 正需此丹</span>' : "";
      const ownedTag = owned > 0 ? '<div class="shop-owned">储物袋已有 ' + owned + ' 枚</div>' : "";
      return '<div class="card shop-item" ' + style + '>' +
        '<div class="shop-ico" style="color:' + it.color + '">' + it.icon + '</div>' +
        '<div class="shop-head"><div class="shop-name">' + esc(it.name) + tag + '</div>' +
          '<span class="shop-price">' + it.price + ' 💎</span></div>' +
        '<div class="shop-desc">' + esc(it.desc) + '</div>' +
        note + ownedTag +
        btn +
        '</div>';
    }).join("");

    const ownedAny = Object.keys(inv).some((k) => inv[k] > 0);
    const bagHtml = ownedAny
      ? eng.SHOP_ITEMS.filter((it) => inv[it.id] > 0).map((it) =>
          '<span class="bag-chip">' + it.icon + ' ' + esc(it.name) + ' ×' + inv[it.id] + '</span>').join("")
      : '<span class="muted">储物袋空空如也，去历练赚些灵石吧～</span>';
    view.innerHTML =
      '<h2>🪙 仙市 · 灵石坊</h2>' +
      '<div class="card" style="background:var(--brand-soft);text-align:center">' +
        '<div class="streak-big" style="font-size:34px">' + stones + ' 💎</div>' +
        '<p class="muted">当前灵石。做练习（学词 / 试剑 / 心法 / 历练 / 签到 / 仙谕）皆可收获灵石。</p>' +
      '</div>' +
      (bs.atCap ? '<div class="break-banner">⚡ 你已至 <b>' + bs.fromName + '圆满</b>，经验' + (bs.ready ? '盈满' : '尚未盈满') + '。' +
        (bs.ready ? (bs.hasPill ? '服下对应突破丹，即可破界飞升『' + bs.toName + '』！' : '前往仙市购得『' + bs.toName + '』之突破丹，方可破境。') : '继续修炼攒满经验，再图破境。') + '</div>' : '') +
      '<h3 style="margin-top:14px">🛒 在售仙物</h3>' +
      '<div class="grid grid-2">' + normal + '</div>' +
      '<h3 style="margin-top:16px">⚡ 破境丹药（圆满破界之用）</h3>' +
      '<p class="muted">修至每一大段位<b>圆满</b>且经验盈满，须服对应突破丹方可飞升下一大段位。各丹符纹、灵辉与价码皆异。</p>' +
      '<div class="grid grid-2">' + breaks + '</div>' +
      '<div class="card" style="margin-top:12px"><h3>🎒 储物袋</h3><div class="bag">' + bagHtml + '</div></div>' +
      '<button class="btn full ghost" data-action="go-home" style="margin-top:10px">返回首页</button>';
  }
  function shopBuy(id) {
    const r = eng.buyItem(id);
    if (!r.ok) {
      toast(r.reason === "poor" ? "💎 灵石不足，去做几场练习攒些灵石吧～" : "兑换失败");
      return;
    }
    const it = r.item;
    if (r.consumable) {
      toast("🎒 已收入储物袋：" + it.icon + " " + it.name);
    } else if (it.effect && it.effect.xp) {
      toast(it.icon + " " + it.name + "！瞬得 +" + it.effect.xp + " 修为");
    } else if (it.effect && it.effect.learn) {
      const n = learnRandomWords(it.effect.learn);
      toast(it.icon + " " + it.name + "！随机铭刻 " + n + " 个新仙言于识海");
    } else if (it.effect && it.effect.daily) {
      if (!dailyDoneToday()) {
        const pack = getDailyPack();
        let n = 0;
        pack.forEach((w) => {
          const before = eng.getState().words[w.setId + ":" + w.en];
          eng.learnWord(w.setId, w.en);
          if (!before) n++;
        });
        eng.collectDailyPack();
        try { localStorage.setItem(DAILY_KEY + "done_" + eng.todayStr(), "1"); } catch (e) {}
        toast(it.icon + " " + it.name + "！领受今日 " + n + " 仙言，经验 +" + (n * 5));
      } else {
        toast(it.icon + " 辟谷丹在手，今日仙谕已领过～");
      }
    }
    refreshHeader();
    renderShop();
  }
  // 随机铭刻 n 个未习仙言（供悟道卷使用）
  function learnRandomWords(n) {
    const learned = eng.getState().words;
    const pool = allWords().filter((w) => !learned[w.setId + ":" + w.en]);
    shuffle(pool);
    let c = 0;
    for (let i = 0; i < pool.length && c < n; i++) {
      eng.learnWord(pool[i].setId, pool[i].en);
      c++;
    }
    return c;
  }

  // ---------- 复习 ----------
  function openReview() {
    let list = [];
    data.wordSets.forEach((set) => {
      const due = eng.dueWords(set.id, set.words);
      due.forEach((w) => list.push(Object.assign({ setId: set.id }, w)));
    });
    // 无到期词时，回退到「已学过的词」整体温习，而非整座词库
    if (!list.length) list = learnedWords();
    if (!list.length) {
      toast("📭 识海尚无已铭仙言可温故，先去「词藏」拾取仙言吧～");
      go("home");
      return;
    }
    review = { quiz: { words: shuffle(list), i: 0, score: 0 } };
    renderReview();
  }
  function renderReview() {
    renderQuiz(review.quiz, "go-home", "温故试剑");
  }

  // ---------- 每日推荐学习 ----------
  const DAILY_KEY = "em_daily_";
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // 拆词记忆用的常见短词表（词 → 中文）
  const CHUNK = {
    a: "一个", an: "一个", the: "这", and: "和", or: "或", but: "但", in: "在…里", on: "在…上",
    at: "在", to: "到", of: "的", for: "为", with: "和…一起", is: "是", am: "是", are: "是",
    be: "是", do: "做", go: "去", see: "看", look: "看", eat: "吃", drink: "喝", book: "书",
    water: "水", ball: "球", foot: "脚", hand: "手", sun: "太阳", car: "车", bus: "公共汽车",
    red: "红", blue: "蓝", green: "绿", yellow: "黄", black: "黑", white: "白", cat: "猫",
    dog: "狗", man: "男人", woman: "女人", boy: "男孩", girl: "女孩", day: "天", fire: "火",
    rain: "雨", tree: "树", house: "房子", home: "家", love: "爱", good: "好", bad: "坏",
    play: "玩", work: "工作", time: "时间", life: "生命", world: "世界", star: "星", light: "光",
    dark: "暗", open: "开", close: "关", read: "读", write: "写", school: "学校", food: "食物",
    name: "名字", friend: "朋友", happy: "开心", new: "新", old: "旧", big: "大", small: "小",
    hot: "热", cold: "冷", child: "孩子", father: "父亲", mother: "母亲", brother: "兄弟",
    sister: "姐妹", room: "房间", class: "课", bed: "床", head: "头", eye: "眼睛", ear: "耳朵",
    mouth: "嘴", heart: "心", city: "城市", country: "国家", year: "年", week: "周", month: "月",
    morning: "早晨", night: "夜晚", money: "钱", music: "音乐", color: "颜色", number: "数字",
    letter: "字母", word: "词", story: "故事", animal: "动物", bird: "鸟", fish: "鱼", meat: "肉",
    egg: "蛋", rice: "米饭", bread: "面包", milk: "牛奶", tea: "茶", coffee: "咖啡", phone: "电话",
    computer: "电脑", paper: "纸", pen: "笔", door: "门", window: "窗", table: "桌子", chair: "椅子",
    out: "外面", side: "边", some: "一些", thing: "东西", every: "每个", body: "身体", one: "一",
    two: "二", three: "三", four: "四", five: "五", six: "六", seven: "七", eight: "八", nine: "九",
    ten: "十", no: "不", not: "不", up: "上", down: "下", back: "回", over: "越过", under: "在…下",
    after: "在…后", before: "在…前", port: "港口", way: "路", part: "部分", end: "结束", land: "土地",
    line: "线", case: "情况", fact: "事实", group: "组", kind: "种类", place: "地方", point: "点",
    state: "状态", left: "左", right: "右", high: "高", low: "低", own: "自己的", self: "自己",
    well: "好", far: "远", near: "近", air: "空气", sea: "海", earth: "地球", wood: "木头",
    gold: "金", glass: "玻璃", stone: "石头", wind: "风", snow: "雪", ice: "冰", hill: "小山",
    field: "田野", road: "路", street: "街道", town: "城镇", village: "村庄", king: "国王",
    queen: "女王", baby: "婴儿", lady: "女士", job: "工作", full: "满", half: "一半", late: "晚",
    early: "早", hard: "难", soft: "软", fast: "快", slow: "慢", warm: "温暖", cool: "凉爽",
    rich: "富", poor: "穷", young: "年轻", tall: "高", short: "矮", long: "长", free: "自由",
    busy: "忙", true: "真", false: "假", real: "真实", sure: "确定", able: "能", ready: "准备好",
    born: "出生", dead: "死", live: "活", die: "死", grow: "生长"
  };
  const CHUNK_KEYS = Object.keys(CHUNK).sort((a, b) => b.length - a.length);
  // 常见动词 / 形容词（用于选合适的例句模板）
  const VERBS = new Set(["be","have","do","say","go","get","make","know","think","take","see","come","want","use","find","give","tell","call","try","need","feel","become","leave","put","mean","keep","let","begin","seem","help","talk","turn","start","hear","read","write","eat","drink","play","learn","study","speak","listen","sleep","walk","run","buy","sell","clean","cook","live","like","hate","stop","wait","meet","send","build","break","bring","cut","draw","drive","fall","fill","fly","forget","hold","hurt","join","kill","laugh","lead","lie","lose","move","pass","pick","pull","push","ring","show","sing","sit","stand","swim","teach","thank","throw","understand","visit","wake","wash","watch","wear","wish","work","worry","count","choose","change","check","carry","catch","climb","collect","color","comb","cry","dance","jump","kick","knock","marry","obey","paint","plant","point","pray","repeat","rest","return","shape","share","shop","shout","solve","sound","spell","spend","stare","taste","test","train","translate","treat","trick","trip","trust","vote","wander","warn","wave","weigh","wonder","wrap","write","yawn","yell","zip"]);
  const ADJS = new Set(["big","small","good","bad","new","old","hot","cold","red","blue","green","yellow","black","white","happy","sad","tall","short","long","young","rich","poor","clean","dirty","fast","slow","easy","hard","open","closed","free","busy","late","early","right","wrong","full","empty","high","low","loud","quiet","strong","weak","kind","nice","beautiful","ugly","smart","stupid","warm","cool","real","sure","ready","born","dead","live","true","false"]);
  const NOUN_FRAMES = [
    "The cultivator keeps a {w} in his sleeve.",
    "In the spirit realm, a {w} glows with jade light.",
    "My master gave me this {w} as a gift.",
    "The {w} in the sacred hall shines with spirit light.",
    "A wandering immortal once owned this {w}.",
    "We found a {w} near the immortal spring.",
    "The {w} is a treasure of our sect.",
    "I must guard this {w} with my life.",
    "Elder Xuanji spoke of a lost {w}.",
    "A {w} can change a cultivator's fate.",
    "Little Bai the spirit fox curled up beside the {w}.",
    "At the market of immortals, this {w} costs a flask of dew.",
    "The {w} slipped from my hand and rolled into the lotus pond.",
    "Carve the name of the {w} upon your spirit tablet.",
    "When the tribulation came, only the {w} kept me safe.",
    "The town folk bow before the {w} as if it were a god.",
    "I traded three spirit stones for a single {w}.",
    "Place the {w} on the altar and let the moon bless it."
  ];
  const VERB_FRAMES = [
    "I {w} upon the clouds at dawn.",
    "We {w} together on the immortal path.",
    "The disciple learns to {w} in silence.",
    "They {w} by the spirit lake.",
    "An immortal will {w} at the summit.",
    "Can a mortal {w} like this?",
    "Let us {w} and seek the dao.",
    "I wish to {w} beyond the heavens.",
    "We should {w} with a calm heart.",
    "Do you {w} on your cultivation journey?",
    "Little Bai {w} the moment she smelled the spirit pill.",
    "The elder taught me to {w} without a single word.",
    "If you {w} now, the gate of the sect will open.",
    "She {w} so gracefully the lotus flowers turned to follow her.",
    "They {w} until the sun dipped behind the sacred mountain.",
    "I {w} thrice a day to keep my cultivation steady.",
    "The crowd began to {w} when the bell of dawn rang.",
    "Never {w} when the trial of the heart begins."
  ];
  const ADJ_FRAMES = [
    "The spirit energy feels {w} today.",
    "I am {w} after the long tribulation.",
    "The immortal maiden is very {w}.",
    "This ancient scroll is {w}.",
    "We are {w} to walk the dao.",
    "A {w} morning blesses my cultivation.",
    "The old master looks {w}.",
    "This trial is {w}.",
    "I am {w} before the heavenly gate.",
    "The spirit pill tastes {w}.",
    "The {w} mist over the valley hides a secret path.",
    "His {w} smile calmed the restless spirit beasts.",
    "Only a {w} heart may enter the inner hall.",
    "The longer I train, the more {w} the world becomes.",
    "She chose the {w} robe among a hundred on the rack.",
    "A {w} wind carried the scent of immortal herbs.",
    "The {w} light of the full moon lit our way home.",
    "Stay {w}, and the heavens will answer your call."
  ];
  function splitChunks(s) {
    const res = []; let i = 0;
    while (i < s.length) {
      let best = "";
      for (const k of CHUNK_KEYS) { if (s.startsWith(k, i) && k.length > best.length) best = k; }
      if (best) { res.push(best); i += best.length; } else { return [s]; }
    }
    return res;
  }
  // 联想记忆法（策划：谐音 / 画面），覆盖常见难记词
  const MNEM = {
    ambulance: "谐音「俺不能死」→ 快叫救护车！",
    pest: "谐音「拍死它」→ 见到害虫就拍死它。",
    flee: "谐音「飞离」→ 飞快离开 = 逃跑。",
    island: "四面环水的「陆地」便是岛（i + land 意象）。",
    enemy: "谐音「俺迷」→ 把俺绕晕的对头 = 敌人。",
    cousin: "谐音「卡真」→ 卡在亲戚里的表亲。",
    fashion: "谐音「发神」→ 走在时尚前沿像发神。",
    poison: "谐音「婆爱森」→ 婆婆下的毒。",
    sofa: "谐音「沙发」直接音译。",
    cartoon: "谐音「卡通」→ 动画片。",
    guitar: "谐音「吉他」直接音译。",
    salad: "谐音「沙拉」直接音译。",
    lemon: "谐音「柠檬」直接音译。",
    humor: "谐音「幽默」直接音译。",
    engine: "谐音「引擎」直接音译。",
    mineral: "mine(矿) + ral → 矿物。",
    jungle: "谐音「认真哥」→ 认真哥在丛林探险。",
    bridge: "联想：架在河上的「板」= 桥。",
    knife: "谐音「耐夫」→ 耐用的小刀。",
    wife: "谐音「外妇」→ 妻子。",
    knee: "谐音「你」→ 你跪下用的是膝盖。",
    knock: "谐音「脑壳」→ 敲脑壳 = 敲门。",
    laugh: "谐音「辣乎」→ 笑得辣乎乎。",
    cough: "谐音「咳夫」→ 咳嗽。",
    enough: "谐音「衣纳夫」→ 衣服够多了 = 足够。",
    tough: "谐音「他夫」→ 他够硬 = 坚韧。",
    dough: "谐音「逗」→ 揉面团逗孩子。",
    though: "谐音「柔」→ 虽然柔软。",
    thought: "谐音「瘦他」→ 思考让他瘦。",
    through: "谐音「ru」→ 穿过。",
    bought: "谐音「抱他」→ 抱他时买下了。",
    brought: "谐音「布绕」→ 带来。",
    caught: "谐音「考他」→ 抓住他考试。",
    taught: "谐音「套他」→ 教他套招。",
    daughter: "谐音「多特」→ 女儿多特别。",
    neighbor: "谐音「内伯」→ 一墙之隔的伯伯 = 邻居。",
    foreign: "谐音「佛林」→ 外国的。",
    forest: "for(为了) + rest(休息) → 进去休息的树林。",
    desert: "谐音「得饿」→ 沙漠里饿得慌（注意与甜点 dessert 差一个 s）。",
    dessert: "比 desert 多一个 s = 甜点（沙漠多一丝甜）。",
    minute: "谐音「米内特」→ 一分钟。",
    tongue: "谐音「糖」→ 舌头尝糖。",
    stomach: "谐音「四大摸」→ 摸摸胃（肚子）。",
    finger: "谐音「分哥」→ 手指像分开的兄弟。",
    thumb: "谐音「萨姆」→ 大拇指萨姆。",
    shoulder: "谐音「瘦得」→ 肩膀瘦得。",
    ankle: "谐音「安扣」→ 脚踝像扣子。",
    elbow: "谐音「爱抱」→ 手肘爱抱。",
    waist: "谐音「威斯特」→ 腰部。",
    beard: "谐音「比得」→ 胡子比得长。",
    chest: "谐音「切斯特」→ 胸。",
    smell: "谐音「斯麦尔」→ 闻起来像小麦。",
    taste: "谐音「泰斯特」→ 品尝。",
    touch: "谐音「塔吃」→ 触摸。",
    sight: "谐音「赛特」→ 视力。",
    sound: "谐音「桑德」→ 声音。",
    voice: "谐音「沃伊斯」→ 嗓音。",
    silence: "谐音「赛冷斯」→ 安静。",
    waste: "谐音「威斯特」→ 浪费。",
    wealth: "谐音「威尔司」→ 财富。",
    health: "谐音「赫尔司」→ 健康。",
    breath: "谐音「布莱司」→ 呼吸。",
    steal: "联想：steel(钢) 去掉 e = steal 偷（被偷走就像少了 e）。",
    quiet: "谐音「快特」→ 安静得快。",
    quite: "联想：quiet 多一个 e = 相当（安静得多 = 相当）。",
    accept: "谐音「阿克赛普特」→ 接受。",
    except: "联想：ex(出) + cept → 把…除外。",
    affect: "谐音「阿费克特」→ 影响。",
    effect: "联想：e + ffect → 效果。",
    advise: "谐音「额德瓦伊兹」→ 建议。",
    advice: "联想：ad + vice → 忠告。",
    borrow: "谐音「包肉」→ 借来包肉。",
    promise: "谐音「婆若米司」→ 承诺。",
    surprise: "谐音「色扑来兹」→ 惊喜。",
    danger: "谐音「单杰」→ 危险。",
    angel: "谐音「安杰」→ 天使。",
    devil: "谐音「戴沃」→ 魔鬼。",
    ghost: "谐音「够斯特」→ 鬼。",
    spirit: "谐音「斯必特」→ 精神 / 精灵。",
    dragon: "谐音「钻根」→ 龙。",
    magic: "谐音「麦吉克」→ 魔法。",
    power: "谐音「炮尔」→ 力量。",
    courage: "谐音「卡里几」→ 勇气。",
    wisdom: "谐音「威兹得姆」→ 智慧。",
    peace: "谐音「皮斯」→ 和平。",
    war: "谐音「窝」→ 战争像窝里斗。",
    dream: "谐音「追梦」→ 梦想。",
    future: "谐音「费车尔」→ 未来。",
    past: "谐音「帕斯特」→ 过去。",
    present: "pre(前) + sent(送) → 送到面前的 = 礼物 / 现在。",
    gift: "谐音「给夫特」→ 礼物。",
    luck: "谐音「拉客」→ 运气好拉客。",
    chance: "谐音「昌斯」→ 机会。",
    risk: "谐音「瑞斯克」→ 风险。",
    safe: "谐音「赛夫」→ 安全。",
    truth: "谐音「楚司」→ 真相。",
    lie: "谐音「赖」→ 撒谎（赖皮）。",
    honest: "谐音「昂内斯特」→ 诚实。",
    shame: "谐音「谢姆」→ 羞耻。",
    proud: "谐音「普劳德」→ 骄傲。",
    shy: "谐音「晒」→ 害羞地晒。",
    brave: "谐音「布瑞夫」→ 勇敢。",
    lazy: "谐音「累兹」→ 懒惰。",
    rude: "谐音「入的」→ 粗鲁。",
    polite: "谐音「坡赖特」→ 礼貌。",
    gentle: "谐音「尖头」→ 温柔。",
    welcome: "well(好) + come(来) → 好你来 = 欢迎。",
    business: "busy(忙) 的名词化 → 忙的事情 = 生意 / 事务。",
    because: "be(是) + cause(原因) → 是…的原因 = 因为。",
    between: "be(是) + tween(两) → 在两者之间 = 在…之间。",
    breakfast: "break(打破) + fast(禁食) → 打破一夜禁食的第一餐 = 早餐。",
    butterfly: "butter(黄油) + fly(飞) → 像黄油般翻飞的小虫 = 蝴蝶。",
    bedroom: "bed(床) + room(房间) → 放床的房间 = 卧室。",
    seafood: "sea(海) + food(食物) → 海里的食物 = 海鲜。",
    airport: "air(空) + port(港口) → 空中的港口 = 机场。",
    hometown: "home(家) + town(城镇) → 家乡的城镇 = 故乡。",
    weekend: "week(周) + end(结束) → 一周的结束 = 周末。",
    textbook: "text(文本) + book(书) → 课本。"
  };
  // 构词记忆法：安全前缀 + 已知词基 + 后缀（词基必须是真实单词，避免假词源）
  const AFFIX = [
    ["un", "不／反"], ["re", "再／重"], ["dis", "否定／分开"], ["mis", "错误"], ["over", "过度"],
    ["under", "在…下"], ["pre", "在前"], ["post", "在后"], ["inter", "之间"], ["trans", "跨越"],
    ["sub", "在下"], ["super", "在上／超"], ["anti", "反对"], ["auto", "自动"], ["non", "非"],
    ["co", "共同"], ["ex", "出／前"]
  ];
  const SUFFIX = [
    ["tion", "名词(行为)"], ["sion", "名词"], ["ment", "名词(结果)"], ["ness", "名词(性质)"],
    ["ity", "名词(性质)"], ["er", "…的人／物"], ["or", "…的人"], ["ist", "…主义者"],
    ["ful", "充满…的"], ["less", "无…的"], ["able", "能…的"], ["ible", "可…的"], ["ous", "多…的"],
    ["ive", "有…性质的"], ["al", "…的"], ["ic", "…的"], ["ly", "…地"], ["ize", "使…化"],
    ["ise", "使…"], ["en", "使…"], ["ish", "有点…的"], ["ed", "…的／过去"], ["ing", "…的／正在"], ["y", "…的"]
  ];
  const BASE = new Set(CHUNK_KEYS.concat([
    "happy", "kind", "care", "help", "use", "hope", "dark", "read", "play", "teach", "love",
    "like", "move", "pass", "act", "art", "work", "visit", "friend", "person", "nation", "nature",
    "music", "color", "power", "pain", "rest", "wish", "thank", "think", "speak", "listen", "learn",
    "build", "clean", "cook", "live", "walk", "run", "rain", "snow", "sun", "moon", "wind", "fire",
    "water", "earth", "star", "light", "hand", "foot", "head", "heart", "home", "school", "book",
    "paper", "word", "time", "life", "world", "day", "night", "year", "week", "month", "city",
    "town", "village", "country", "child", "father", "mother", "brother", "sister", "baby", "lady",
    "king", "queen", "job", "food", "name", "story", "animal", "bird", "fish", "meat", "egg", "rice",
    "bread", "milk", "tea", "coffee", "phone", "computer", "door", "window", "table", "chair", "bed",
    "room", "class", "house", "road", "street", "hill", "field", "tree", "stone", "glass", "gold",
    "wood", "air", "sea", "ice", "port", "part", "end", "land", "line", "case", "fact", "group",
    "place", "point", "state", "side", "way", "thing", "body", "start", "stop", "turn", "call",
    "view", "take", "stand", "write", "go", "see", "come", "get", "make", "know", "find", "give",
    "tell", "try", "need", "feel", "keep", "let", "begin", "talk", "hear", "eat", "drink", "sleep",
    "buy", "sell", "meet", "send", "bring", "cut", "draw", "drive", "fall", "fill", "fly", "forget",
    "hold", "hurt", "join", "kill", "laugh", "lead", "lie", "lose", "pick", "pull", "push", "ring",
    "show", "sing", "sit", "swim", "wash", "watch", "wear", "count", "choose", "change", "check",
    "carry", "catch", "climb", "collect", "comb", "cry", "dance", "jump", "kick", "knock", "marry",
    "obey", "paint", "plant", "pray", "repeat", "return", "shape", "share", "shop", "shout", "solve",
    "sound", "spell", "spend", "stare", "taste", "test", "train", "translate", "treat", "trick",
    "trip", "trust", "vote", "wander", "warn", "wave", "weigh", "wonder", "wrap", "yawn", "yell",
    "zip", "shine", "news", "step", "basket", "brush", "tooth", "coat", "member", "cause", "fast",
    "well", "some", "where", "every", "one", "no", "not", "out", "over", "up", "down", "back", "far",
    "near", "own", "ready", "able", "real", "sure", "true", "false", "born", "dead", "die", "grow",
    "high", "low", "long", "free", "busy", "late", "early", "hard", "soft", "warm", "cool", "rich",
    "poor", "young", "tall", "short", "big", "small", "good", "bad", "new", "old", "hot", "cold",
    "red", "blue", "green", "yellow", "black", "white", "open", "close", "sad", "right", "wrong",
    "full", "empty", "loud", "quiet", "strong", "weak", "nice", "beautiful", "ugly", "smart",
    "stupid", "dirty", "easy", "closed"
  ]));
  function matchSuffix(body) {
    if (BASE.has(body)) return { mid: body, s: null, sm: null };
    const sufs = SUFFIX.slice().sort((a, b) => b[0].length - a[0].length);
    for (const [s, m] of sufs) {
      if (body.endsWith(s) && body.length - s.length >= 2) {
        const m2 = body.slice(0, body.length - s.length);
        if (BASE.has(m2)) return { mid: m2, s: s, sm: m };
      }
    }
    return null;
  }
  function buildAffix(p, pm, r) {
    const segs = [];
    if (p) segs.push(p + "(" + pm + ")");
    segs.push(r.mid + "(" + (CHUNK[r.mid] || r.mid) + ")");
    if (r.s) segs.push(r.s + "(" + r.sm + ")");
    const gloss = (p ? pm : "") + (CHUNK[r.mid] || r.mid) + (r.s ? r.sm : "");
    return segs.join(" + ") + " = " + gloss;
  }
  function affixDecompose(en) {
    en = en.toLowerCase();
    if (en.length < 5) return null;
    // 先试「无前缀 + 后缀」(必须有后缀，避免整词被当成自身分解)
    const r0 = matchSuffix(en);
    if (r0 && r0.s) return buildAffix(null, null, r0);
    // 再试「前缀 + (后缀／词基)」，且必须拆出真实词基，避免假词源
    for (const [p, m] of AFFIX) {
      if (en.startsWith(p) && en.length - p.length >= 3) {
        const r2 = matchSuffix(en.slice(p.length));
        if (r2) return buildAffix(p, m, r2);
      }
    }
    return null;
  }
  function vividByPos(en, zh, ipa, pos) {
    const mean = zh || "这个词";
    if (pos === "verb") return "动作记忆：每次你「" + mean + "」时，口中念一声「" + en + "」，让身体记住它。";
    if (pos === "adj") return "贴签记忆：给眼前一个「" + mean + "」的东西贴上「" + en + "」的标签，用三次就忘不掉。";
    return "具象记忆：把「" + en + "」想成身边真实的一件「" + mean + "」——下次在书上见到它，就默念「这正是那枚" + mean + "」。";
  }
  function tipOf(w) {
    const en = (w.en || "").toLowerCase();
    const zh = w.zh || "";
    if (MNEM[en]) return "联想记忆：" + MNEM[en];
    const parts = splitChunks(en);
    if (parts.length >= 2 && parts.every((p) => CHUNK[p])) {
      return "拆词记忆：" + parts.map((p) => p + "(" + CHUNK[p] + ")").join(" + ");
    }
    const af = affixDecompose(en);
    if (af) return "构词记忆：" + af;
    const pos = VERBS.has(en) ? "verb" : ADJS.has(en) ? "adj" : "noun";
    return vividByPos(en, zh, w.ipa, pos);
  }
  function exampleOf(w) {
    const low = (w.en || "").toLowerCase();
    let frames = NOUN_FRAMES;
    if (VERBS.has(low)) frames = VERB_FRAMES;
    else if (ADJS.has(low)) frames = ADJ_FRAMES;
    const f = frames[hashStr(low) % frames.length];
    return f.replace(/\{w\}/g, w.en);
  }
  const COMBO_TMPL = [
    (ws) => "Upon the immortal road today I met ten new glyphs of the ancient tongue — " + ws.slice(0, 9).join(", ") + " and " + ws[9] + " — and I shall engrave them all upon my spirit tablet!",
    (ws) => "The ten sacred words I gathered this dawn — " + ws.join(", ") + " — now rest within my jade slip, ready for the trial ahead.",
    (ws) => "By the spirit lake I trained with these ten glyphs: " + ws.slice(0, 9).join(", ") + " and " + ws[9] + ". Each one sharpens my dao.",
    (ws) => "Ten breaths, ten words: " + ws.join(", ") + ". I speak them aloud at the summit so the heavens remember them with me."
  ];
  function comboSentence(words) {
    const ws = words.map((x) => x.en);
    return COMBO_TMPL[hashStr(eng.todayStr()) % COMBO_TMPL.length](ws);
  }
  function getDailyPack() {
    const ds = eng.todayStr();
    const KEY = DAILY_KEY + ds;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const a = JSON.parse(raw); if (Array.isArray(a) && a.length === 10) return a; }
    } catch (e) {}
    // 候选池：高频核心词(L1~L8，约 2000 最常见) + 主题词集 —— 优先生活和考试常见词汇
    const poolSets = [];
    if (window.EM.bulkSets) window.EM.bulkSets.slice(0, 8).forEach((s) => poolSets.push(s));
    data.wordSets.slice(0, 8).forEach((s) => poolSets.push(s));
    const seen = {}; const uniq = [];
    poolSets.forEach((s) => s.words.forEach((w) => {
      const k = (w.en || "").toLowerCase();
      if (k && !seen[k]) { seen[k] = 1; uniq.push({ setId: s.id, en: w.en, zh: w.zh, ipa: w.ipa || "" }); }
    }));
    const learned = eng.getState().words || {};
    const unl = uniq.filter((w) => !learned[w.setId + ":" + w.en]);
    const src = unl.length >= 10 ? unl : uniq;
    const rng = mulberry32(hashStr(ds));
    const arr = src.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    const sel = arr.slice(0, 10);
    try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch (e) {}
    return sel;
  }
  function dailyDoneToday() {
    try { return localStorage.getItem(DAILY_KEY + "done_" + eng.todayStr()) === "1"; } catch (e) { return false; }
  }
  function renderDaily() {
    const pack = getDailyPack();
    const exHtml = pack.map((w) => {
      const ex = exampleOf(w);
      return '<div class="daily-card">' +
        '<div class="dc-head"><span class="dc-en">' + esc(w.en) + '</span><span class="dc-ipa">' + esc(w.ipa || "") + '</span></div>' +
        '<div class="dc-zh">' + esc(w.zh) + '</div>' +
        '<div class="dc-ex">📌 例句：' + clickable(ex) + '</div>' +
        '<div class="dc-tip">🧠 记忆法：' + esc(tipOf(w)) + '</div>' +
        '</div>';
    }).join("");
    const combo = comboSentence(pack);
    const done = dailyDoneToday();
    view.innerHTML =
      '<h2>📜 每日仙谕 · 荐学</h2>' +
      '<p class="muted">每日自词库精选 10 个修行与生活最常用的古仙语词汇（按词频优先）。点例句里的任意英文仙言，即可查看词义与音标。</p>' +
      '<div class="card">' + exHtml + '</div>' +
      '<div class="card" style="background:var(--brand-soft)">' +
      '<h3>🔗 今日串记句</h3>' +
      '<p class="en" style="font-size:16px;line-height:1.8">' + clickable(combo) + '</p>' +
      '<p class="muted">用这一句话把今天的 10 个词串起来，读几遍更好记～</p>' +
      '</div>' +
      '<button class="btn full accent" data-action="daily-learn" ' + (done ? "disabled" : "") + '>' +
      (done ? "✅ 今日已收下" : "✅ 收下今日 10 词 (+50 XP)") + '</button>' +
      '<button class="btn full ghost" data-action="go-home" style="margin-top:8px">返回首页</button>';
  }
  function dailyLearn() {
    if (dailyDoneToday()) { toast("今天已经收下啦～"); return; }
    const pack = getDailyPack();
    let n = 0;
    pack.forEach((w) => {
      const before = eng.getState().words[w.setId + ":" + w.en];
      eng.learnWord(w.setId, w.en);
      if (!before) n++;
    });
    eng.collectDailyPack(); // 解锁「每日荐启 / 七日荐修」仙勋
    try { localStorage.setItem(DAILY_KEY + "done_" + eng.todayStr(), "1"); } catch (e) {}
    toast("🌱 已学会今日 " + n + " 个新词，经验 +" + (n * 5) + " · 灵石 +" + (n * 2) + " 💎");
    refreshHeader();
    renderDaily();
  }
  function clickable(text) {
    return esc(text).replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (m) =>
      '<span class="wclick" data-w="' + m.toLowerCase() + '">' + m + '</span>'
    );
  }
  // 例句点词查义 / 音标弹窗
  function showWordPop(en, elm) {
    const k = en.toLowerCase();
    const e = dictIndex[k];
    const pop = $("#wordpop");
    if (!e) pop.innerHTML = '<b>' + esc(en) + '</b><div class="muted">词库中未收录该词</div>';
    else pop.innerHTML = '<b>' + esc(e.en) + '</b> <span class="dc-ipa">' + esc(e.ipa || "") + '</span><div>' + esc(e.zh) + '</div>';
    pop.classList.remove("hidden");
    const r = elm.getBoundingClientRect();
    let top = r.bottom + 8; let left = r.left;
    if (left + 230 > window.innerWidth) left = window.innerWidth - 240;
    if (top + 130 > window.innerHeight) top = r.top - 140;
    pop.style.top = Math.max(8, top) + "px";
    pop.style.left = Math.max(8, left) + "px";
  }
  document.addEventListener("click", (e) => {
    const sp = e.target.closest(".wclick");
    if (sp) { showWordPop(sp.dataset.w, sp); return; }
    if (!e.target.closest("#wordpop")) { const p = $("#wordpop"); if (p) p.classList.add("hidden"); }
  });

  // ---------- 工具 ----------
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sample(a, n) {
    return shuffle(a).slice(0, n);
  }

  // ---------- 事件委托 ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    if (a === "go-home") go("home");
    else if (a === "go-words") go("words");
    else if (a === "go-grammar") go("grammar");
    else if (a === "go-story") go("story");
    else if (a === "go-tutor") go("tutor");
    else if (a === "go-daily") go("daily");
    else if (a === "open-set") openSet(el.dataset.set);
    else if (a === "flip") {
      const m = $("#meta-" + el.dataset.i);
      if (m) { const show = m.style.display === "none"; m.style.display = show ? "block" : "none"; el.textContent = show ? "隐去释义" : "显化释义"; }
    } else if (a === "learn-next") {
      const set = data.wordSets.find((x) => x.id === study.setId);
      const w = set.words[study.idx];
      if (el.dataset.learned === "1") {
        eng.learnWord(set.id, w.en);
        study.learnedThisRun += 1;
        toast("✅ 此言已铭识海 +5 XP · +2 💎");
      }
      study.idx += 1;
      eng.setStudyProgress(study.setId, study.idx, set.words.length); // 续修：记住参悟进度
      refreshHeader();
      renderStudy(set);
    } else if (a === "start-quiz") startQuiz();
    else if (a === "quiz-answer") {
      const q = study && study.phase === "quiz" ? study.quiz : review.quiz;
      const title = study && study.phase === "quiz" ? "试剑台" : "温故试剑";
      const back = study && study.phase === "quiz" ? "go-words" : "go-home";
      onQuizAnswer(el, back, title, q);
    } else if (a === "grammar-open") grammarOpen(el.dataset.id);
    else if (a === "grammar-check") grammarCheck(el.dataset.id, parseInt(el.dataset.idx, 10));
    else if (a === "grammar-done") { eng.completeGrammar(el.dataset.id); toast("📿 心法已成！+15 XP · +8 💎"); refreshHeader(); go("grammar"); }
    else if (a === "story-open") { currentStoryId = el.dataset.id; eng.unlock("story1"); story = { idx: 0, finished: false, log: [], started: false }; renderStory(); }
    else if (a === "story-list") { currentStoryId = null; story = { idx: 0, finished: false, log: [], started: false }; renderStory(); }
    else if (a === "story-start") storyStart();
    else if (a === "story-choice") storyChoice(parseInt(el.dataset.choice, 10));
    else if (a === "story-restart") { story = { idx: 0, finished: false, log: [], started: true }; renderStory(); }
    else if (a === "tutor-send") sendTutor();
    else if (a === "checkin") doCheckin();
    else if (a === "open-review") openReview();
    else if (a === "shop-buy") shopBuy(el.dataset.id);
    else if (a === "use-break") {
      const r = parseInt((el.dataset.id || "").replace("break_", ""), 10);
      const res = eng.useBreakthrough(r);
      if (res.ok) {
        toast("⚡ 破境成功！自「" + res.from + "」飞升「" + res.to + "」· 今为 " + eng.realmOf(res.level));
        refreshHeader();
        renderShop();
      } else {
        toast(res.reason === "no-pill" ? "⚠️ 储物袋中没有此突破丹，先去仙市兑换。" :
              res.reason === "xp-not-full" ? "⚠️ 经验尚未盈满，须先攒满本境圆满经验。" :
              res.reason === "not-at-cap" ? "⚠️ 你尚未至本境圆满，无破境之障。" : "⚠️ 破境失败");
      }
    }
    else if (a === "daily-learn") dailyLearn();
    else if (a === "like") doLike(el.dataset.id);
    else if (a === "open-greet") openGreetModal();
    else if (a === "greet-clear") clearGreet();
    else if (a === "logout") doLogout();
    else if (a === "login-submit") {
      const acc = $("#login-account"); const pw = $("#login-pw");
      if (acc && pw && acc.value && pw.value) tryLogin(acc.value.trim(), pw.value);
    }
    else if (a === "register-submit") {
      const e1 = $("#reg-email"); const u1 = $("#reg-user"); const p1 = $("#reg-pw");
      if (e1 && u1 && p1 && e1.value && u1.value && p1.value) tryRegister(e1.value.trim().toLowerCase(), u1.value.trim(), p1.value);
    }
    else if (a === "auth-tab-login") renderAuth("login");
    else if (a === "auth-tab-register") renderAuth("register");
    else if (a === "modal-close") closeModal();
  });

  // 暴露给内联 onkeydown
  window.EM_app = { sendTutor, createCharConfirm, renameConfirm };

  // ---------- 启动 ----------
  const modalEl = $("#modal");
  if (modalEl) modalEl.addEventListener("click", (e) => { if (e.target === modalEl) closeModal(); });
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => go(t.dataset.view)));

  // 任何状态改动（练功/学词/买丹…）→ 防抖 1.2s 后上报云端（驱动实时修榜）
  let syncTimer = null;
  function scheduleSync() {
    if (syncTimer) return;
    syncTimer = setTimeout(() => { syncTimer = null; syncNow(); }, 1200);
  }
  eng.onChange(scheduleSync);

  // SSE 实时推流：服务器一有变动立刻把最新修榜推给所有在线修士
  function openStream() {
    try {
      const es = new EventSource("/api/stream");
      es.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          if (d && d.list) { globalBoard = d.list; afterBoard(); }
        } catch (_) {}
      };
      es.onerror = () => { /* EventSource 自带自动重连 */ };
    } catch (_) {}
  }

  // 已登录：进入游戏
  function startApp() {
    refreshHeader();
    render();
    refreshBoard();
    setInterval(refreshBoard, 20000);
    openStream();
  }

  // ---------- 账号系统 UI ----------
  let authUser = null;
  function api(path, body) {
    return fetch(path, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {})
    }).then((r) => r.json());
  }
  function showAuth() { $("#auth-view").classList.remove("hidden"); renderAuth("login"); }
  function hideAuth() { $("#auth-view").classList.add("hidden"); }

  const DEMO_HINT = '<div class="auth-demo">演示账号可直接登录体验：<br>' +
    '韩立 · hanli@demo.com / hanli123<br>王婵 · wangchan@demo.com / wangchan123</div>';

  function authCard(mode, fields, btn, msg) {
    const isReg = mode === "register";
    return '<div class="auth-card">' +
      '<div class="auth-logo">🪷 English Master</div>' +
      '<div class="auth-sub">以古仙语通大道 · 修仙英语养成</div>' +
      '<div class="auth-tabs">' +
        '<button class="auth-tab ' + (!isReg ? "on" : "") + '" data-action="auth-tab-login">登录</button>' +
        '<button class="auth-tab ' + (isReg ? "on" : "") + '" data-action="auth-tab-register">注册</button>' +
      '</div>' +
      (msg ? '<div class="auth-msg">' + msg + '</div>' : "") +
      '<div class="auth-fields">' + fields + '</div>' +
      '<button class="btn full accent" data-action="' + (isReg ? "register-submit" : "login-submit") + '">' +
        (isReg ? "✅ " : "🔓 ") + btn + '</button>' +
      '</div>';
  }
  function renderAuth(mode, msg) {
    let html;
    if (mode === "register") {
      html = authCard("register",
        '<input id="reg-email" placeholder="邮箱" />' +
        '<input id="reg-user" placeholder="用户名(1-16字)" maxlength="16" />' +
        '<input id="reg-pw" type="password" placeholder="密码(至少6位)" />',
        "注册", msg);
    } else {
      const fields = '<input id="login-account" placeholder="邮箱或用户名" />' +
        '<input id="login-pw" type="password" placeholder="密码" />';
      html = authCard("login", fields, "登录", msg);
    }
    $("#auth-view").innerHTML = html + DEMO_HINT;
  }
  function tryLogin(account, pw) {
    api("/api/auth/login", { account: account, password: pw }).then((d) => {
      if (d && d.ok) {
        authUser = d.user;
        hideAuth();
        eng.applyRemoteState(d.state);
        startApp();
        toast("🪷 欢迎回来，" + d.user.username + "！");
      } else if (d && d.needsVerify) {
        const link = d.devVerifyUrl
          ? '该账号尚未验证邮箱。<a class="auth-link" href="' + d.devVerifyUrl + '" target="_blank">👉 点击此处验证（开发模式）</a> 后再登录。'
          : "该账号尚未验证邮箱，请先查收验证邮件。";
        renderAuth("login", link);
      } else {
        renderAuth("login", d && d.error ? d.error : "登录失败");
      }
    }).catch(() => renderAuth("login", "网络异常，登录失败"));
  }
  function tryRegister(email, user, pw) {
    api("/api/auth/register", { email: email, username: user, password: pw }).then((d) => {
      if (d && d.ok && d.needsVerify) {
        const link = d.devVerifyUrl
          ? '注册成功！请验证邮箱后登录。<br><a class="auth-link" href="' + d.devVerifyUrl + '" target="_blank">👉 点击此处完成验证（开发模式）</a>'
          : "注册成功！请查收验证邮件后登录。";
        renderAuth("login", link);
      } else if (d && d.ok) {
        renderAuth("login", "注册成功，请登录。");
      } else {
        renderAuth("register", d && d.error ? d.error : "注册失败");
      }
    }).catch(() => renderAuth("register", "网络异常，注册失败"));
  }
  function doLogout() {
    api("/api/auth/logout", {}).finally(() => {
      authUser = null;
      showAuth();
      toast("已退出登录");
    });
  }

  // 启动：先查登录态（HttpOnly cookie）。已登录则拉取云端存档进入游戏；否则显示登录/注册遮罩。
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then((r) => r.json())
    .then((d) => {
      if (d && d.ok && d.state) {
        authUser = d.user;
        eng.applyRemoteState(d.state);
        startApp();
      } else {
        showAuth();
      }
    })
    .catch(() => { showAuth(); });
})();
