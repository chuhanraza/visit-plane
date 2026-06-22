#!/usr/bin/env python3
"""
VisitPlane content audit (Sprint 4) — AUDIT ONLY, changes no content.

Reads every content/blog/*.md, computes quality signals, clusters
near-duplicates (MinHash + LSH on route-normalized shingles), detects
title cannibalization, classifies KEEP/DEEPEN/MERGE/CUT and emits
content-audit.csv + audit_summary.json for the report.
"""
import os, re, csv, json, glob, random, hashlib
from collections import defaultdict
import numpy as np

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_DIR = os.path.join(REPO, "content", "blog")

# ── country / demonym / city tokens used to normalize route-swapped posts ──
COUNTRY_TOKENS = set("""
afghanistan albania algeria andorra angola argentina armenia australia austria
azerbaijan bahamas bahrain bangladesh barbados belarus belgium belize benin bhutan
bolivia bosnia botswana brazil brunei bulgaria burkina burundi cambodia cameroon
canada chad chile china colombia comoros congo costa rica croatia cuba cyprus czech
czechia denmark djibouti dominica dominican ecuador egypt salvador england eritrea
estonia eswatini ethiopia fiji finland france gabon gambia georgia germany ghana
greece grenada guatemala guinea guyana haiti honduras hungary iceland india indonesia
iran iraq ireland israel italy jamaica japan jordan kazakhstan kenya kiribati kosovo
kuwait kyrgyzstan laos latvia lebanon lesotho liberia libya liechtenstein lithuania
luxembourg madagascar malawi malaysia maldives mali malta mauritania mauritius mexico
micronesia moldova monaco mongolia montenegro morocco mozambique myanmar namibia nauru
nepal netherlands holland zealand nicaragua niger nigeria korea macedonia norway oman
pakistan palau palestine panama papua paraguay peru philippines poland portugal qatar
romania russia rwanda samoa marino arabia saudi senegal serbia seychelles sierra
singapore slovakia slovenia solomon somalia africa spain lanka sri sudan suriname
sweden switzerland syria taiwan tajikistan tanzania thailand timor togo tonga trinidad
tobago tunisia turkey turkmenistan tuvalu uganda ukraine emirates uae kingdom uk usa
america united states uruguay uzbekistan vanuatu vatican venezuela vietnam yemen zambia
zimbabwe schengen europe european dubai abu dhabi istanbul bali phuket bangkok tokyo
london paris berlin rome madrid sydney toronto
afghan albanian algerian argentine armenian australian austrian bangladeshi belgian
bolivian brazilian british bulgarian cambodian cameroonian canadian chilean chinese
colombian croatian cuban cypriot czech danish dutch ecuadorian egyptian emirati english
estonian ethiopian fijian filipino finnish french gabonese georgian german ghanaian greek
guatemalan haitian honduran hungarian icelandic indian indonesian iranian iraqi irish
israeli italian jamaican japanese jordanian kazakh kenyan kuwaiti kyrgyz laotian latvian
lebanese liberian libyan lithuanian malaysian maldivian maltese mexican moldovan
mongolian moroccan mozambican namibian nepalese nigerian norwegian omani pakistani
palestinian panamanian paraguayan peruvian polish portuguese qatari romanian russian
rwandan saudi senegalese serbian singaporean slovak slovenian somali spanish sudanese
swedish swiss syrian taiwanese tajik tanzanian thai tunisian turkish turkmen ugandan
ukrainian uruguayan uzbek venezuelan vietnamese yemeni zambian zimbabwean
""".split())

YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")
WORD_RE = re.compile(r"[a-z]+")

HIGH_DEMAND = set("""
schengen europe usa america united states us uk kingdom canada australia germany france
italy spain netherlands uae emirates dubai saudi arabia qatar japan turkey thailand
singapore malaysia ireland switzerland sweden norway portugal student work job seeker
digital nomad golden green card h1b express entry
""".split())
HIGH_DEMAND_PASSPORTS = set("pakistan india nigeria bangladesh philippines egypt china indonesia kenya ghana".split())

# ── markdown -> prose for honest word counting ──
def strip_markdown(md: str) -> str:
    md = re.sub(r"```.*?```", " ", md, flags=re.S)         # code fences
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", md)            # images
    md = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", md)         # links -> text
    md = re.sub(r"^\s{0,3}#{1,6}\s*", "", md, flags=re.M)    # heading hashes
    md = re.sub(r"^\s{0,3}>\s?", "", md, flags=re.M)         # blockquote
    md = re.sub(r"^\s*[-*+]\s+", "", md, flags=re.M)         # bullets
    md = re.sub(r"^\s*\d+\.\s+", "", md, flags=re.M)         # numbered
    md = re.sub(r"[|>*_`#~]", " ", md)                       # residual md chars
    md = re.sub(r"\s+", " ", md)
    return md.strip()

def parse_md(path):
    raw = open(path, encoding="utf-8").read()
    fm, body = {}, raw
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", raw, flags=re.S)
    if m:
        for line in m.group(1).splitlines():
            km = re.match(r'^(\w+):\s*"?(.*?)"?\s*$', line)
            if km:
                fm[km.group(1)] = km.group(2)
        body = m.group(2)
    return fm, body

def normalize_for_shingle(prose: str) -> list:
    prose = prose.lower()
    prose = YEAR_RE.sub(" ", prose)
    toks = WORD_RE.findall(prose)
    return ["X" if (t in COUNTRY_TOKENS or len(t) <= 2) else t for t in toks]

def shingles(tokens, k=8):
    if len(tokens) < k:
        return {hash(" ".join(tokens))} if tokens else set()
    return {hash(" ".join(tokens[i:i+k])) for i in range(len(tokens)-k+1)}

# ── MinHash ──
NUM_PERM = 120
PRIME = 2147483647          # 2^31 - 1 (Mersenne)
MASK = 0x7fffffff           # 31-bit shingle hashes
random.seed(42)
A = np.array([random.randrange(1, PRIME) for _ in range(NUM_PERM)], dtype=np.uint64)
B = np.array([random.randrange(0, PRIME) for _ in range(NUM_PERM)], dtype=np.uint64)

def minhash(sh):
    if not sh:
        return tuple([0]*NUM_PERM)
    h = np.fromiter((x & MASK for x in sh), dtype=np.uint64, count=len(sh))  # (S,)
    # vectorized: (A[:,None]*h[None,:] + B[:,None]) % PRIME  -> min over shingles
    vals = (A[:, None] * h[None, :] + B[:, None]) % np.uint64(PRIME)        # (NUM_PERM, S)
    return tuple(int(x) for x in vals.min(axis=1))

# ── load corpus ──
files = sorted(glob.glob(os.path.join(BLOG_DIR, "*.md")))
posts = []
for p in files:
    slug = os.path.basename(p)[:-3]
    fm, body = parse_md(p)
    prose = strip_markdown(body)
    wc = len([w for w in prose.split() if any(c.isalpha() for c in w)])
    ilinks = re.findall(r"\]\((/[^)\s]+)\)", body)
    blog_links = [l for l in ilinks if l.startswith("/blog/")]
    toks = normalize_for_shingle(prose)
    sh = shingles(toks, 8)
    posts.append({
        "slug": slug, "title": fm.get("title", ""), "category": fm.get("category", ""),
        "date": fm.get("date", ""), "wc": wc,
        "ilink": len(ilinks), "blog_ilink": len(blog_links),
        "sh": sh, "sig": minhash(sh),
        "ntoks": len(toks),
    })

N = len(posts)

# ── global boilerplate: shingle document frequency ──
df = defaultdict(int)
for po in posts:
    for s in po["sh"]:
        df[s] += 1
boiler_cut = max(8, int(0.12 * N))   # shingle in >=12% of posts = boilerplate
for po in posts:
    if po["sh"]:
        bs = sum(1 for s in po["sh"] if df[s] >= boiler_cut)
        po["boiler"] = round(bs / len(po["sh"]), 3)
    else:
        po["boiler"] = 0.0

# ── LSH banding to find candidate pairs ──
BANDS, ROWS = 30, 4   # 120 = 30*4 ; ~ threshold (1/30)^(1/4) ≈ 0.43
buckets = defaultdict(list)
for idx, po in enumerate(posts):
    sig = po["sig"]
    for bi in range(BANDS):
        band = sig[bi*ROWS:(bi+1)*ROWS]
        buckets[(bi, band)].append(idx)

cand = set()
for b, idxs in buckets.items():
    if len(idxs) > 1:
        for i in range(len(idxs)):
            for j in range(i+1, len(idxs)):
                cand.add((idxs[i], idxs[j]))

def jaccard(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return inter / (len(a) + len(b) - inter)

NEAR = 0.55   # near-duplicate threshold
edges = []
pair_j = {}
for i, j in cand:
    jv = jaccard(posts[i]["sh"], posts[j]["sh"])
    if jv >= NEAR:
        edges.append((i, j))
        pair_j[(i, j)] = jv

# ── union-find clustering ──
parent = list(range(N))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[ra] = rb
for i, j in edges:
    union(i, j)

clusters = defaultdict(list)
for idx in range(N):
    clusters[find(idx)].append(idx)
dup_clusters = {r: m for r, m in clusters.items() if len(m) > 1}

# assign cluster ids + pick canonical survivor (max wc, then most ilinks, then earliest date)
cluster_id = {}
canonical = {}
maxjac = defaultdict(float)
for i, j in edges:
    maxjac[i] = max(maxjac[i], pair_j[(i, j)])
    maxjac[j] = max(maxjac[j], pair_j[(i, j)])

cid_counter = 0
for r, members in sorted(dup_clusters.items(), key=lambda kv: -len(kv[1])):
    cid_counter += 1
    cid = f"dup-{cid_counter:03d}"
    survivor = sorted(members, key=lambda m: (-posts[m]["wc"], -posts[m]["ilink"], posts[m]["date"]))[0]
    for m in members:
        cluster_id[m] = cid
        canonical[m] = (m == survivor)

# ── true same-target cannibalization: normalized title KEEPING country tokens ──
# (two posts aimed at the SAME keyword/route = genuine duplicates to redirect)
STOP = {"the","for","and","your","from","with","guide","complete","how","what",
        "you","get","is","it","to","in","of","a","an","really","step","by"}
def target_key(title):
    t = YEAR_RE.sub(" ", title.lower())
    toks = [tk for tk in WORD_RE.findall(t) if tk not in STOP and len(tk) > 2]
    return " ".join(sorted(set(toks)))   # order/duplicate independent, country tokens kept

target_groups = defaultdict(list)
for idx, po in enumerate(posts):
    target_groups[target_key(po["title"])].append(idx)
cannibal_id = {}
target_survivor = {}
cg_counter = 0
cannibal_groups_count = 0
for key, members in target_groups.items():
    if len(members) >= 2 and key.strip():
        cg_counter += 1
        cannibal_groups_count += 1
        gid = f"cnb-{cg_counter:03d}"
        surv = sorted(members, key=lambda m: (-posts[m]["wc"], -posts[m]["ilink"], posts[m]["date"]))[0]
        for m in members:
            cannibal_id[m] = gid
            target_survivor[m] = (m == surv)

# ── demand heuristic ──
def demand(po):
    blob = (po["slug"] + " " + po["title"]).lower()
    toks = set(WORD_RE.findall(blob))
    if toks & HIGH_DEMAND:
        return "high"
    if toks & HIGH_DEMAND_PASSPORTS:
        return "med"
    return "low"

# cluster size per post (content near-dup family)
csize = {}
for r, members in dup_clusters.items():
    for m in members:
        csize[m] = len(members)

# ── classify ──
# Model: the corpus is NOT length-thin (min ~610w). The disease is
# templated near-duplication — large doorway families that target distinct
# keywords with one shared skeleton. So:
#   MERGE  = genuine same-keyword duplicate (redirect into survivor)
#   CUT    = templated doorway / low original value (noindex + remove/redirect)
#   DEEPEN = real-demand route worth rebuilding into a unique page
#   KEEP   = genuinely distinct page, leave as-is
def classify(idx):
    po = posts[idx]
    wc, boiler, il = po["wc"], po["boiler"], po["ilink"]
    dem = demand(po)
    cs = csize.get(idx, 0)
    cid = cluster_id.get(idx, "")
    is_canon = canonical.get(idx, False)
    bpct = int(round(boiler * 100))

    # 1. TRUE same-keyword duplicate (two posts at one target) -> MERGE non-survivor
    if idx in cannibal_id and not target_survivor.get(idx, False):
        return "MERGE", f"exact-target duplicate ({cannibal_id[idx]}); redirect into canonical sibling"

    # 2. Mid/large template family (>=4 near-dupes) = doorway cluster
    if cs >= 4:
        if dem == "high" and boiler < 0.50 and il >= 2:
            return "DEEPEN", f"high-demand route in template family {cid} (n={cs}); rebuild as unique page, keep keyword"
        extra = f", {bpct}% boilerplate" if boiler >= 0.50 else ""
        return "CUT", f"templated doorway in {cid} (n={cs} near-dupes), {dem}-demand{extra}; noindex + remove/redirect"

    # 3. Small near-dup cluster (2-3)
    if cs in (2, 3):
        if is_canon:
            if dem == "high":
                return "KEEP", f"strongest of small near-dup cluster {cid} (n={cs}), {wc}w, high-demand"
            return "DEEPEN", f"canonical of small near-dup cluster {cid} (n={cs}); expand into the one page"
        return "MERGE", f"near-duplicate (J≥{NEAR}) of {cid} survivor; consolidate/redirect"

    # 4. Unique (no near-dup cluster)
    if boiler >= 0.65:
        return "CUT", f"standalone but {bpct}% shared-boilerplate template shell; little original value"
    if dem == "low" and il <= 1:
        return "CUT", f"unique but low-demand near-orphan ({il} internal links); little ranking upside"
    if dem == "low":
        return "DEEPEN", f"unique, {wc}w, low-demand but linked; differentiate or fold later"
    return "KEEP", f"unique, {wc}w, {dem}-demand, {bpct}% boilerplate; reasonable depth — leave as-is"

for idx in range(N):
    label, reason = classify(idx)
    posts[idx]["label"] = label
    posts[idx]["reason"] = reason
    posts[idx]["dup_cluster"] = cluster_id.get(idx, "")
    posts[idx]["cannibal"] = cannibal_id.get(idx, "")
    posts[idx]["demand"] = demand(posts[idx])
    posts[idx]["thin_flag"] = "severe" if posts[idx]["wc"] < 300 else ("thin" if posts[idx]["wc"] < 600 else "")

# ── write CSV ──
csv_path = os.path.join(REPO, "content-audit.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["slug", "title", "category", "date", "word_count", "thin_flag",
                "duplicate_cluster_id", "cannibalization_group", "internal_link_count",
                "boilerplate_ratio", "demand", "label", "reason"])
    for po in posts:
        w.writerow([po["slug"], po["title"], po["category"], po["date"], po["wc"],
                    po["thin_flag"], po["dup_cluster"], po["cannibal"], po["ilink"],
                    po["boiler"], po["demand"], po["label"], po["reason"]])

# ── summary stats ──
from collections import Counter
label_counts = Counter(po["label"] for po in posts)
wc_bins = {"<300": 0, "300-599": 0, "600-1199": 0, "1200+": 0}
for po in posts:
    wc = po["wc"]
    if wc < 300: wc_bins["<300"] += 1
    elif wc < 600: wc_bins["300-599"] += 1
    elif wc < 1200: wc_bins["600-1199"] += 1
    else: wc_bins["1200+"] += 1

dup_sizes = sorted(([cluster_id[m] for m in members][0], len(members))
                   for r, members in dup_clusters.items())
cluster_size_by_id = {}
for r, members in dup_clusters.items():
    cluster_size_by_id[cluster_id[members[0]]] = len(members)
top_clusters = sorted(cluster_size_by_id.items(), key=lambda kv: -kv[1])[:10]
# theme for each top cluster = shortest title
cluster_theme = {}
for r, members in dup_clusters.items():
    cid = cluster_id[members[0]]
    titles = [posts[m]["title"] for m in members]
    cluster_theme[cid] = min(titles, key=len)

orphans = sum(1 for po in posts if po["ilink"] == 0)
near_orphans = sum(1 for po in posts if po["ilink"] <= 1)

# top DEEPEN candidates: deepen-labelled, prefer high demand + decent wc + linked
deepen = [po for po in posts if po["label"] == "DEEPEN"]
def deepen_score(po):
    d = {"high": 2, "med": 1, "low": 0}[po["demand"]]
    return (d, po["wc"], po["ilink"])
deepen_sorted = sorted(deepen, key=deepen_score, reverse=True)[:30]

posts_in_dup = sum(len(m) for m in dup_clusters.values())

summary = {
    "total": N,
    "wc_bins": wc_bins,
    "label_counts": dict(label_counts),
    "label_pct": {k: round(100*v/N, 1) for k, v in label_counts.items()},
    "num_dup_clusters": len(dup_clusters),
    "posts_in_dup_clusters": posts_in_dup,
    "top_clusters": [{"id": cid, "size": sz, "theme": cluster_theme[cid]} for cid, sz in top_clusters],
    "cannibal_groups": cannibal_groups_count,
    "orphans": orphans,
    "near_orphans": near_orphans,
    "median_wc": sorted(po["wc"] for po in posts)[N//2],
    "mean_wc": round(sum(po["wc"] for po in posts)/N, 1),
    "top_deepen": [{"slug": po["slug"], "title": po["title"], "wc": po["wc"],
                    "demand": po["demand"], "ilink": po["ilink"], "reason": po["reason"]}
                   for po in deepen_sorted],
    "category_counts": dict(Counter(po["category"] for po in posts)),
    "params": {"shingle_k": 8, "minhash_perm": NUM_PERM, "lsh_bands": BANDS,
               "lsh_rows": ROWS, "near_threshold": NEAR, "boiler_df_cut": boiler_cut},
}
json.dump(summary, open(os.path.join(REPO, "audit_summary.json"), "w"), indent=2)
print(json.dumps({k: summary[k] for k in
      ["total","wc_bins","label_counts","label_pct","num_dup_clusters",
       "posts_in_dup_clusters","cannibal_groups","orphans","near_orphans",
       "median_wc","mean_wc"]}, indent=2))
print("TOP CLUSTERS:")
for c in summary["top_clusters"]:
    print(f"  {c['id']}  n={c['size']}  {c['theme'][:70]}")
print("CSV rows:", N)
