/* ============================================================
 *  English Master — 带账号系统的联网实时后端
 *  零依赖 Node：静态托管 + 账号(注册/登录/邮箱验证/会话) + 实时修榜(SSE) + 全量云端存档
 *  存储：server/data.json  { users:{uid:{...}}, sessions:{sid:uid} }
 *  部署：支持 process.env.PORT / process.env.EM_DATA
 * ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const DATA = process.env.EM_DATA || path.join(__dirname, "data.json");
const PORT = process.env.PORT || 8080;

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// ---------- 段位 / 问候文案（与前端一致） ----------
const REALMS = ["炼气期", "筑基期", "金丹期", "元婴期", "化神期",
  "炼虚期", "合体期", "大乘期", "渡劫期", "真仙境"];
const MAX_LEVEL = REALMS.length * 10;
function realmOf(level) {
  const L = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level) || 1));
  const idx = Math.min(Math.floor((L - 1) / 10), REALMS.length - 1);
  const layer = ((L - 1) % 10) + 1;
  const suffix = layer === 10 ? "圆满" : layer + "层";
  return REALMS[idx] + suffix;
}
function realmIndexOf(level) {
  const L = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level) || 1));
  return Math.min(Math.floor((L - 1) / 10), REALMS.length - 1);
}
function relationLabel(diff) {
  if (diff === 0) return "道友问好";
  if (diff === -1) return "小辈请安";
  if (diff <= -2) return "晚辈请安";
  if (diff === 1) return "前辈赞赏";
  return "老前辈赞赏";
}
function buildGreetText(fromName, fromLevel, diff) {
  return String(fromName).slice(0, 12) + "（" + realmOf(fromLevel) + "）" + relationLabel(diff);
}

// ---------- 密码哈希（零依赖：scrypt） ----------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return salt.toString("hex") + ":" + hash.toString("hex");
}
function verifyPassword(pw, stored) {
  if (!stored || stored.indexOf(":") < 0) return false;
  const parts = stored.split(":");
  const salt = Buffer.from(parts[0], "hex");
  const hash = Buffer.from(parts[1], "hex");
  const h = crypto.scryptSync(pw, salt, 64);
  return crypto.timingSafeEqual(h, hash);
}
function newId() { return "u_" + crypto.randomBytes(9).toString("hex"); }
function newToken() { return crypto.randomBytes(24).toString("hex"); }

// ---------- 存储（用户 + 会话） ----------
function load() {
  try {
    const o = JSON.parse(fs.readFileSync(DATA, "utf8"));
    if (o && o.users) return o;
  } catch (e) {}
  return { users: {}, sessions: {} };
}
let store = load();
if (!store.users) store.users = {};
if (!store.sessions) store.sessions = {};

// 预置演示账号：韩立(元婴期) / 王婵(金丹期)。部署后即可登录体验，也支持任意注册。
function defaultState(name, id) {
  return {
    id, name, level: 1, xp: 0, totalXP: 0, streak: 0,
    dailyXP: 0, dailyDate: todayStr(), stones: 0, items: {},
    words: {}, grammarDone: {}, storiesDone: {},
    stats: { wordsLearned: 0, quizzes: 0, correct: 0, studyDays: 0 },
    badges: [], greetings: [], progress: {}, updatedAt: Date.now()
  };
}
const HANLI_BADGES = ["first_word","ten_words","words100","words500","first_grammar","gram10","gram30","quiz10","quiz50","quiz100","review_first","story1","story_s1","story_s2","story_s3","story_s4","story_s5","streak3","streak7","daily_first","daily7","level2","level5","level10","realm_1","realm_2","realm_3","like_first","like10"];
const WANGCHAN_BADGES = ["first_word","ten_words","words100","first_grammar","gram10","quiz10","quiz50","review_first","story1","story_s1","streak3","streak7","daily_first","level2","level5","level10","realm_1","realm_2","like_first"];
function seedDemoAccounts() {
  const demo = [
    { id: "demo_hanli", email: "hanli@demo.com", username: "韩立", pw: "hanli123", level: 35, totalXP: 8126, streak: 28, stones: 320, badges: HANLI_BADGES },
    { id: "demo_wangchan", email: "wangchan@demo.com", username: "王婵", pw: "wangchan123", level: 25, totalXP: 5804, streak: 16, stones: 180, badges: WANGCHAN_BADGES }
  ];
  demo.forEach((d) => {
    const st = defaultState(d.username, d.id);
    st.level = d.level;
    st.xp = Math.round((50 + 25 * d.level) * 0.45);
    st.totalXP = d.totalXP;
    st.streak = d.streak;
    st.stones = d.stones;
    st.badges = d.badges.slice();
    st.stats = { wordsLearned: 64, quizzes: 64, correct: 54, studyDays: d.streak };
    st.greetings = [{ from: "system", fromName: "道友", fromRealm: "筑基期", text: "道友问好", diff: 0, ts: Date.now() }];
    store.users[d.id] = {
      id: d.id, email: d.email, username: d.username,
      pwHash: hashPassword(d.pw), verified: true, verifyToken: null,
      createdAt: Date.now(), state: st
    };
  });
  console.log("[seed] 已创建演示账号：韩立(hanli@demo.com / hanli123)、王婵(wangchan@demo.com / wangchan123)");
}
if (Object.keys(store.users).length === 0) seedDemoAccounts();

// 防抖持久化
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; try { fs.writeFileSync(DATA, JSON.stringify(store)); } catch (e) {} }, 1500);
}

// ---------- 会话 / Cookie ----------
function parseCookies(req) {
  const c = req.headers.cookie;
  const o = {};
  if (!c) return o;
  c.split(";").forEach((s) => {
    const i = s.indexOf("=");
    if (i > 0) o[s.slice(0, i).trim()] = decodeURIComponent(s.slice(i + 1).trim());
  });
  return o;
}
function getUid(req) {
  const sid = parseCookies(req).sid;
  return sid ? (store.sessions[sid] || null) : null;
}
function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", "sid=" + token + "; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax");
}
function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
}

// ---------- 实时推流（SSE） ----------
const clients = new Set();
function broadcastBoard() {
  if (!clients.size) return;
  const payload = "data: " + JSON.stringify(leaderboard()) + "\n\n";
  clients.forEach((res) => { try { res.write(payload); } catch (e) { clients.delete(res); } });
}

// ---------- 修榜（由每个用户的角色状态推导） ----------
function leaderboard() {
  const today = todayStr();
  const list = Object.values(store.users).map((u) => {
    const p = u.state || {};
    return {
      id: u.id,
      name: p.name || u.username,
      level: p.level || 1,
      streak: p.streak || 0,
      totalXP: p.totalXP || 0,
      todayXP: p.dailyDate === today ? (p.dailyXP || 0) : 0,
      dailyDate: p.dailyDate,
      likes: (p.greetings && p.greetings.length) || 0,
      greetings: p.greetings || []
    };
  });
  list.sort((a, b) => b.todayXP - a.todayXP || b.level - a.level || b.totalXP - a.totalXP);
  return { today, list };
}

// 合并客户端上报的完整状态（绑定到登录用户，防伪造 id）
function mergeState(uid, d) {
  const u = store.users[uid];
  if (!u) return null;
  const prev = u.state || {};
  const merged = Object.assign({}, prev, d);
  merged.id = uid;
  merged.name = u.username;
  merged.updatedAt = Date.now();
  const gs = {};
  ((prev.greetings) || []).concat(d.greetings || []).forEach((g) => {
    if (g && g.ts != null) gs[g.ts + "|" + g.from] = g;
  });
  const arr = Object.values(gs);
  merged.greetings = arr.length > 30 ? arr.slice(-30) : arr;
  u.state = merged;
  return merged;
}

// ---------- 邮件发送钩子（生产接 SMTP；开发模式仅打印+返回链接） ----------
function sendVerificationEmail(email, url) {
  if (process.env.SMTP_HOST) {
    // 生产：在此用 nodemailer 发送；需 npm i nodemailer 并配置 SMTP_*
    console.log("[mail] 应通过 SMTP 发送验证邮件至 " + email + " -> " + url);
  } else {
    console.log("[dev] 验证链接(" + email + "): " + url);
  }
}

// ---------- 工具 ----------
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon"
};
function sendJSON(res, obj, code) {
  res.writeHead(code || 200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
function isValidEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || ""); }

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  const q = (req.url || "/").split("?")[1] || "";

  // ================= 账号系统 =================
  // 注册
  if (url === "/api/auth/register" && req.method === "POST") {
    return readBody(req).then((d) => {
      const email = (d.email || "").trim().toLowerCase();
      const username = (d.username || "").trim();
      const password = d.password || "";
      if (!isValidEmail(email)) return sendJSON(res, { ok: false, error: "邮箱格式不正确" }, 400);
      if (username.length < 1 || username.length > 16) return sendJSON(res, { ok: false, error: "用户名需 1-16 字" }, 400);
      if (password.length < 6) return sendJSON(res, { ok: false, error: "密码至少 6 位" }, 400);
      if (Object.values(store.users).some((u) => u.email === email))
        return sendJSON(res, { ok: false, error: "该邮箱已注册" }, 409);
      if (Object.values(store.users).some((u) => u.username === username))
        return sendJSON(res, { ok: false, error: "该用户名已被占用" }, 409);
      const id = newId();
      const verifyToken = newToken();
      store.users[id] = {
        id, email, username,
        pwHash: hashPassword(password), verified: false, verifyToken,
        createdAt: Date.now(), state: defaultState(username, id)
      };
      const verifyUrl = "/api/auth/verify?token=" + verifyToken;
      sendVerificationEmail(email, verifyUrl);
      scheduleSave();
      return sendJSON(res, { ok: true, needsVerify: true, devVerifyUrl: verifyUrl,
        message: "注册成功，请验证邮箱后登录（开发模式：点击下方验证链接即可）。" });
    }).catch(() => sendJSON(res, { ok: false, error: "bad json" }, 400));
  }

  // 验证邮箱
  if (url === "/api/auth/verify" && req.method === "GET") {
    const token = (q.split("token=")[1] || "").split("&")[0];
    const u = Object.values(store.users).find((x) => x.verifyToken === token);
    if (!u) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h2>验证链接无效或已使用</h2><p>请重新注册或返回 App。</p>");
    }
    u.verified = true; u.verifyToken = null;
    scheduleSave();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<h2>✅ 邮箱验证成功！</h2><p>现在可以回到 App 用账号密码登录了。</p>");
  }

  // 登录
  if (url === "/api/auth/login" && req.method === "POST") {
    return readBody(req).then((d) => {
      const account = (d.account || "").trim().toLowerCase();
      const password = d.password || "";
      const u = Object.values(store.users).find((x) => x.email === account || x.username.toLowerCase() === account);
      if (!u || !verifyPassword(password, u.pwHash))
        return sendJSON(res, { ok: false, error: "账号或密码错误" }, 401);
      if (!u.verified) {
        const devVerifyUrl = u.verifyToken ? "/api/auth/verify?token=" + u.verifyToken : null;
        return sendJSON(res, { ok: false, error: "not_verified", needsVerify: true, devVerifyUrl,
          message: "账号尚未验证邮箱，请先验证。" }, 403);
      }
      const token = newToken();
      store.sessions[token] = u.id;
      setSessionCookie(res, token);
      return sendJSON(res, { ok: true, user: { email: u.email, username: u.username, verified: true }, state: u.state });
    }).catch(() => sendJSON(res, { ok: false, error: "bad json" }, 400));
  }

  // 当前登录用户
  if (url === "/api/auth/me" && req.method === "GET") {
    const uid = getUid(req);
    if (!uid || !store.users[uid]) return sendJSON(res, { ok: false }, 401);
    const u = store.users[uid];
    return sendJSON(res, { ok: true, user: { email: u.email, username: u.username, verified: u.verified }, state: u.state });
  }

  // 退出
  if (url === "/api/auth/logout" && req.method === "POST") {
    const sid = parseCookies(req).sid;
    if (sid) delete store.sessions[sid];
    clearSessionCookie(res);
    return sendJSON(res, { ok: true });
  }

  // ================= 游戏数据（需登录） =================
  // 拉取云端存档
  if (url === "/api/load" && req.method === "GET") {
    const uid = getUid(req);
    if (!uid || !store.users[uid]) return sendJSON(res, { ok: false }, 401);
    return sendJSON(res, { ok: true, state: store.users[uid].state });
  }

  // 保存完整状态（全量云同步）
  if ((url === "/api/save" || url === "/api/report") && req.method === "POST") {
    const uid = getUid(req);
    if (!uid || !store.users[uid]) return sendJSON(res, { ok: false, error: "未登录" }, 401);
    return readBody(req).then((d) => {
      mergeState(uid, d || {});
      scheduleSave();
      broadcastBoard();
      return sendJSON(res, Object.assign({ ok: true }, leaderboard()));
    }).catch(() => sendJSON(res, { ok: false, error: "bad json" }, 400));
  }

  // 点赞 / 道友问候（from=当前登录用户，防伪造）
  if (url === "/api/like" && req.method === "POST") {
    const uid = getUid(req);
    if (!uid || !store.users[uid]) return sendJSON(res, { ok: false, error: "未登录" }, 401);
    return readBody(req).then((d) => {
      const to = d.to;
      const t = store.users[to];
      const f = store.users[uid];
      if (!t || !f || to === uid) return sendJSON(res, { ok: false, error: "invalid like" }, 400);
      const diff = realmIndexOf(f.state.level) - realmIndexOf(t.state.level);
      const text = buildGreetText(f.state.name, f.state.level, diff);
      t.state.greetings = t.state.greetings || [];
      t.state.greetings.push({ from: uid, fromName: f.state.name, fromRealm: realmOf(f.state.level), text, diff, ts: Date.now() });
      if (t.state.greetings.length > 30) t.state.greetings = t.state.greetings.slice(-30);
      scheduleSave();
      broadcastBoard();
      return sendJSON(res, Object.assign({ ok: true, relation: relationLabel(diff) }, leaderboard()));
    }).catch(() => sendJSON(res, { ok: false, error: "bad json" }, 400));
  }

  // 收下问候（清当前用户）
  if (url === "/api/greet-clear" && req.method === "POST") {
    const uid = getUid(req);
    if (!uid || !store.users[uid]) return sendJSON(res, { ok: false, error: "未登录" }, 401);
    store.users[uid].state.greetings = [];
    scheduleSave();
    broadcastBoard();
    return sendJSON(res, Object.assign({ ok: true }, leaderboard()));
  }

  // ================= 公开：修榜 + SSE =================
  if (url === "/api/leaderboard" && req.method === "GET") {
    return sendJSON(res, leaderboard());
  }
  if (url === "/api/stream" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write("retry: 3000\n\n");
    res.write("data: " + JSON.stringify(leaderboard()) + "\n\n");
    clients.add(res);
    const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch (e) {} }, 20000);
    req.on("close", () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  // ---- 静态文件 ----
  let rel = url === "/" ? "/index.html" : url;
  const filePath = path.join(ROOT, path.normalize(rel));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end("forbidden");
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("English Master 账号版服务已启动：http://localhost:" + PORT);
  console.log("支持 注册/登录/邮箱验证 + SSE 实时修榜 + 全量云端存档。");
});
