import csv, json, re, sys

SRC = r"D:/english-master/_ecdict.csv"
OUT = r"D:/english-master/assets/bulkwords.js"
TARGET = 6500          # 目标词数（落在 5000-7000 区间）
CHUNK = 250            # 每组词数
CURATED = set("""hello hi goodbye please thanks sorry yes no one two three four five six seven eight
red blue green yellow black white pink orange mother father sister brother friend baby grandfather grandmother
water apple rice egg bread milk tea banana cat dog bird fish rabbit cow duck horse eat drink go see like have want play
home school book pen sun moon day night""".split())

cjk = re.compile(r"[\u4e00-\u9fff]")
word_re = re.compile(r"^[a-z]{2,15}$")

rows = []
with open(SRC, encoding="utf-8", errors="replace") as f:
    r = csv.reader(f)
    next(r, None)  # header
    for row in r:
        if len(row) < 10:
            continue
        word = (row[0] or "").strip().lower()
        phonetic = (row[1] or "").strip().strip('"').strip()
        translation = (row[3] or "").strip()
        tag = (row[7] or "")
        frq_raw = (row[9] or "").strip()
        if not word_re.match(word):
            continue
        if word in CURATED:
            continue
        if "zm" in tag or "zq" in tag or "zs" in tag:  # 跳过人名/地名/机构
            continue
        try:
            frq = int(frq_raw)
        except ValueError:
            frq = 0
        if frq <= 0:
            continue
        # 取翻译首行，去掉 [网络] 等前缀
        line = translation.split("\n", 1)[0].strip()
        line = re.sub(r"^\[[^\]]*\]\s*", "", line).strip()
        # 合并换行/多余空格（含源码里的字面 \n），并截掉 [计]/[网络] 等噪音后缀
        line = line.replace("\\n", " ").replace("\\r", " ")
        line = re.sub(r"\s+", " ", line)
        line = line.split("[", 1)[0].strip().strip(";").strip()
        if not line or not cjk.search(line):
            continue
        rows.append((frq, word, phonetic, line))

# 去重（同一单词保留词频最小的一条）
seen = {}
for frq, word, phonetic, zh in rows:
    if word not in seen or frq < seen[word][0]:
        seen[word] = (frq, word, phonetic, zh)

items = sorted(seen.values(), key=lambda x: x[0])  # 词频升序 = 越常用越靠前
items = items[:TARGET]

# 调试输出
print("valid unique words:", len(items))
sample = items[:12]
print("top sample:", [(w, frq) for frq, w, ph, zh in sample])

# 分块成词集
sets = []
for i in range(0, len(items), CHUNK):
    chunk = items[i:i + CHUNK]
    lvl = i // CHUNK + 1
    lo = i + 1
    hi = i + len(chunk)
    words = [{"en": w, "zh": zh, "ipa": ph} for frq, w, ph, zh in chunk]
    sets.append({
        "id": "core%d" % lvl,
        "title": "核心词库 L%d（%d–%d）" % (lvl, lo, hi),
        "emoji": "📘",
        "words": words,
    })

with open(OUT, "w", encoding="utf-8") as f:
    f.write("// 自动生成：核心词库（按 ECDICT 词频排序），请勿手改\n")
    f.write("window.EM = window.EM || {};\n")
    f.write("window.EM.bulkSets = ")
    f.write(json.dumps(sets, ensure_ascii=False, separators=(",", ":")))
    f.write(";\n")

print("written sets:", len(sets), "total words:", sum(len(s["words"]) for s in sets))
print("OUT ->", OUT)
