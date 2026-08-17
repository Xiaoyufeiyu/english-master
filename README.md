# English Master · 英语大神养成（MVP）

一个**纯前端、可离线运行**的英语学习网页应用，专为零基础用户设计，按学习科学循序渐进。

## 怎么用
- 已启动本地服务器：在浏览器打开 **http://127.0.0.1:8000/**
- 数据保存在浏览器本地（localStorage），无需注册、无需联网、无需 API Key
- 顶部导航：首页 / 单词 / 语法 / 剧情 / 陪练 / 打卡

## 功能一览
| 模块 | 说明 | 学习科学原理 |
|------|------|--------------|
| 📚 单词 | 8 个 A1 主题词集 + 26 组「核心词库」（按词频排序，共约 6500 词），逐词翻卡学习 + 选择题测验 | 间隔重复(SRS/Leitner)、检索练习、可理解输入 |
| 📐 语法 | 8 节 A1 语法课（讲解+例句+填空练习） | 脚手架式难度递进、即时反馈 |
| 🎭 剧情 | 4 个剧情角色扮演闯关（迷路的小狗/超市购物/生日派对/去动物园），选对推进 | 可理解输入、情境化输出 |
| 💬 陪练 | 应用内置规则导师，覆盖问候/自我介绍/食物/数字等 | 低门槛开口、纠错提示 |
| ✅ 打卡 | 每日打卡 streak + 挑战目标 + 勋章墙 | 游戏化动机、习惯养成 |

### 关于单词量（约 6500 词）
- 单词 Tab 由两部分组成：**8 个 A1 主题词集**（带例句，适合零基础）+ **26 组「核心词库」**（按真实语料词频排序，从最高频的 the/be/and 到更低频词，每组 250 词）。
- 核心词库来自公开英中词典 **ECDICT**，用 `build_bulk.py` 按词频筛选、清洗中文释义后自动生成 `assets/bulkwords.js`（请勿手改，重跑脚本即可刷新）。
- 学习页为**逐词翻卡**：每屏一个词，点「显示释义」看中文，会了点「我学会了(+5)」，不会点「下一个」，学完本组有小结并可进入测验。

## 趣味四件套（已按你的选择全部实现）
- 🏅 游戏化：经验值 XP / 等级 / 42 枚仙勋（修仙主题·分 8 大类）
- 🎭 剧情角色扮演：沉浸式闯关
- 💬 AI 对话陪练：应用内置入门导师
- 🔥 打卡 / 挑战：连续打卡与里程碑目标

## 关于"AI 导师"
你选择了"用 WorkBuddy 当导师"。本应用负责**结构化练习、进度与游戏化**；而**真实自由对话陪练**请直接在 WorkBuddy 对话框里找我（导师）聊——那里是大模型真身，能逐句纠错、自由发挥。

应用内置的"陪练"是离线规则引擎，适合零基础先开口；想升级成应用内真·大模型对话，可后续接入你的 LLM API（在 `assets/engine.js` 的 `tutorReply` 处替换为 API 调用即可，需自备后端代理以防密钥泄露）。

## 后续迭代建议
1. 接入真实 LLM 做应用内自由对话陪练
2. 增加发音/听力（Web Speech API）
3. 扩展 B1/B2 词库与语法

---

## 🌐 在线账号版（注册 · 登录 · 实时修榜 · 云端存档）

现已升级为**带账号系统的在线网站**：大家各自用邮箱+密码注册，进度自动云端同步、刷新不丢，多人实时修榜（SSE 推送，谁练一招全场 1 秒刷新）。

### 本地运行
```bash
cd D:\english-master
node server/server.js          # 默认端口 8080；自定义：PORT=8080 node server/server.js
# 若报 "--use-system-ca is not allowed in NODE_OPTIONS"，先执行：unset NODE_OPTIONS
```
- 本机打开 **http://localhost:8080/**
- 同一局域网的其他设备：把 `localhost` 换成你的局域网 IP，如 **http://192.168.x.x:8080/**

### 预置演示账号（部署即可直接登录体验）
| 修士 | 邮箱 | 密码 | 段位 |
|------|------|------|------|
| 韩立 | hanli@demo.com | hanli123 | 元婴期 Lv.35 |
| 王婵 | wangchan@demo.com | wangchan123 | 金丹期 Lv.25 |

也可在登录页自行注册新账号（注册后开发模式直接给出验证链接；正式部署接 SMTP 后改发邮件）。

### 部署到公网（Hugging Face Spaces，推荐 · 免绑卡 · 支持 qq 邮箱）
> 为什么选它：Render 要绑卡、Glitch 已停运、Koyeb 转付费、Replit 拒中国邮箱。
> Hugging Face Spaces（简称 HF）是目前唯一同时满足「免费 + 不绑卡 + 能跑 Node 后端 + 国内打得开」的平台，用 Docker 跑你的后端，端口固定 7860。

1. 打开 https://huggingface.co/join ，用 **qq 邮箱**注册（HF 不限制中国邮箱，直接能收到验证邮件）。
2. 登录后点右上角头像 → **New Space**。
3. 填写：
   - **Space name**：`english-master`
   - **License**：`mit`
   - **Select the Space SDK**：选 **Docker** → **Blank**
   - **Space hardware**：保持 **Free**
   - **Visibility**：选 **Public**
4. 点 **Create Space**，等待进入 Space 页面（先别管里面的默认内容）。
5. 进入后点顶部 **Settings** → 找到 **Repository** 区 → **Link to a Git repository** → 选 **GitHub** 并授权 → 选本仓库 `Xiaoyufeiyu/english-master` → 保存。
   - 仓库里已含 `Dockerfile`，HF 会自动拉取并按 7860 端口构建，无需你手动传文件。
6. 回到 Space 主页，点 **Logs** 标签，等待出现 `English Master 账号版服务已启动`（约 1–3 分钟）。
7. 页面右上角 **Embed this Space → Direct URL** 就是你的线上网址，形如 `https://你的HF用户名-english-master.hf.space`。

打开网址即可注册、登录、多人实时修榜。

### 持久化（HF 可选）
- 免费层文件系统默认持久，但长时间无人访问会被休眠（重新打开自动唤醒，首次约等 10–30 秒）。
- 重启后 `data.json` 可能清空，只剩预置演示账号——适合演示。要长期保留用户存档，可在 Space **Settings → Variables and Secrets** 设 `EM_DATA=/data/data.json` 并开启 Persistent Storage。

---

### 部署到公网（Render，备选 · 需绑卡）
1. 把本仓库推到 GitHub（已附 `render.yaml`）。
2. Render 控制台 → **New → Blueprint**（或 Manual → Web Service）→ 连接该仓库。
3. 按 `render.yaml` 自动建服务：Runtime `node`、Start `node server/server.js`、Health Check `/`、环境变量 `NODE_VERSION=22`。
4. 部署完成后 Render 给一个固定公网域名（如 `https://english-master.onrender.com`），所有人直接注册即用。
5. 前端无需改动（API 走同源相对路径）。

#### 持久化（重要）
- **免费层**：文件系统是临时性的，服务重启/重新部署后 `data.json`（用户存档）会清空，只剩预置演示账号——适合短期演示。
- **持久化**：升级 Render **Starter 套餐（$7/月）**，在 `render.yaml` 中取消 `disk` 段注释并设 `EM_DATA=/var/data/data.json`，存档写到持久盘，重启不丢。
- 更大规模：可后续把存储换成数据库（Postgres/SQLite），代码已预留 `EM_DATA` 接入点，改造量小。

### 后端 API 一览（`server/server.js`，零依赖 Node）
- `POST /api/auth/register` → 注册（邮箱+密码，密码 scrypt 哈希存储）
- `GET  /api/auth/verify?t=...` → 邮箱验证
- `POST /api/auth/login` → 登录（返回 HttpOnly 会话 Cookie）
- `POST /api/auth/logout` → 登出
- `GET  /api/auth/me` → 当前登录用户
- `GET  /api/load` → 拉取当前账号云端存档（需登录）
- `POST /api/save` → 上报全量存档（需登录，驱动实时修榜）
- `GET  /api/leaderboard` → 实时修榜（按今日修为排序）
- `GET  /api/stream` → SSE 实时推送（任何人变动即广播最新修榜）
- `POST /api/like` / `GET /api/greet-clear` → 道友问候

### 存储
- `server/data.json`：`{ users:{uid:{...}}, sessions:{sid:uid} }`，自动生成，可删除重置。
- 可用环境变量 `EM_DATA` 指定数据文件路径（部署挂持久盘时用）。
