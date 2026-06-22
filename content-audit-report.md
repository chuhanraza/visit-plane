# VisitPlane Content Audit — Sprint 4

**Scope:** Audit-only. No blog content, routes, redirects, or noindex tags were
changed in this sprint. This report and `content-audit.csv` are the evidence
base for a later prune/consolidate sprint, which Hamad and the strategist will
approve before any execution.

**Date:** 2026-06-22
**Auditor:** Technical-SEO content audit (automated signal extraction + rule-based classification)

---

## 1. The headline finding

VisitPlane's problem is **not thin-by-length content**. Every one of the 1,149
posts clears 600 words (minimum 613, median **1,432**, mean **1,426**). On a
naïve word-count screen the corpus looks healthy.

The actual disease is **mass-produced near-duplication**. **1,015 of 1,149
posts (88%)** fall into just **41 template clusters** — families of pages that
share a single skeleton and swap only the country/route. The largest single
cluster is **284 near-identical "X → Y visa requirements" pages**. This is a
classic doorway-page / scaled-content pattern, exactly what Google's Helpful
Content and spam-policy systems demote at the *domain* level — which explains
why even genuinely useful pages are stuck at ~position 66 and why 544 URLs sit
in "Discovered – not indexed" (Google found them and judged the page type not
worth indexing).

**The fix is subtraction, not addition.** Volume is the disease, not the cure.

---

## 2. How posts are stored (Phase 1)

| Item | Detail |
|---|---|
| Body content | One Markdown file per post in `content/blog/{slug}.md` (gray-matter frontmatter + body). |
| Metadata | Mirrored in `src/lib/posts.ts` (`blogPosts: BlogPost[]`) — title, date, excerpt, category, route, CTAs, FAQs. |
| Rendering | `app/blog/[slug]/page.tsx` reads the `.md`, renders body HTML, and wraps it in template chrome (hero, author card, "At a glance", CTAs, FAQ schema, related posts). |
| **Exact post count** | **1,149** `.md` files === **1,149** entries in `posts.ts` (counts reconcile). |

Word counts in this audit are computed on **body prose only** — Markdown
stripped, links reduced to anchor text, headings/lists/blockquotes removed. The
template chrome (nav, CTAs, author card, related-post grid) lives in
`page.tsx`, not in the `.md`, so it does not inflate any count.

---

## 3. Method — every flag traces to a real signal (Phase 2)

No invented "quality scores." Each signal is mechanical and reproducible
(`scripts/content_audit.py`):

- **Word count** — real prose, as above. Thin = <600w, severely thin = <300w
  (neither bucket has any members here — see §1).
- **Near-duplicate clustering** — 8-word shingles on **route-normalized** text
  (country names, demonyms, years, and ≤2-char tokens masked to a placeholder
  so route-swaps collapse), → **120-permutation MinHash** → **LSH banding
  (30×4)** for candidate pairs → exact **Jaccard** on shingle sets →
  union-find at **Jaccard ≥ 0.55**. Clusters of ≥2 = near-duplicate families.
- **Boilerplate ratio** — share of a post's shingles that also appear in
  ≥12% of the whole corpus. High ratio = the page is mostly shared template
  text. Corpus median 0.37; **271 posts (24%) are ≥0.60** (i.e. 60%+ recycled).
- **Title/keyword cannibalization** — posts whose normalized title (country
  tokens kept, year + stopwords removed, order-independent) collide on the
  **same target keyword**. **64 collision groups, 128 posts.**
- **Internal links** — count of in-body links to internal routes
  (`/visa/...`, `/blog/...`, tools). Orphan = 0 links.

---

## 4. Distributions

### Word count
| Bucket | Posts |
|---|---|
| <300 (severely thin) | 0 |
| 300–599 (thin) | 0 |
| 600–1,199 | 28 |
| 1,200+ | 1,121 |

### Cluster membership
| Membership | Posts |
|---|---|
| Large/mid duplicate family (≥4 near-dupes) | 983 |
| Small near-dup cluster (2–3) | 32 |
| Unique (no near-dup match) | 134 |

### Boilerplate ratio
| Ratio | Posts |
|---|---|
| <0.20 | 502 |
| 0.20–0.39 | 186 |
| 0.40–0.59 | 190 |
| ≥0.60 (template shell) | 271 |

---

## 5. Classification (Phase 3)

| Label | Posts | % | Meaning / recommended action |
|---|---:|---:|---|
| **KEEP** | 88 | 7.7% | Genuinely distinct, real demand, reasonable depth. Leave as-is. |
| **DEEPEN** | 327 | 28.5% | Real-demand route/topic but currently templated. Rebuild into a unique, differentiated page; keep the keyword. *(Candidate pool — not a single-sprint commitment; see §8.)* |
| **MERGE** | 77 | 6.7% | Genuine same-keyword duplicate. Redirect into the canonical sibling. |
| **CUT** | 657 | 57.2% | Templated doorway / low original value. noindex + remove or redirect. |

**Decision model.** Because the corpus is duplicate-driven (not length-thin),
labels are assigned on duplication and demand, not on word count:

1. **Same-keyword duplicate** (two posts at one target) → MERGE the
   non-survivor into its canonical sibling.
2. **Member of a doorway family (≥4 near-dupes)** → DEEPEN only if it targets
   **high demand, is well-linked (≥2 internal links), and is <50% boilerplate**;
   otherwise **CUT**. You cannot keep hundreds of route-swapped twins indexed —
   you keep a curated set of the highest-value routes and prune the long tail.
3. **Small near-dup cluster (2–3)** → keep the strongest as canonical
   (KEEP/DEEPEN), MERGE the rest.
4. **Unique post** → CUT if it's a ≥65% template shell or a low-demand orphan;
   otherwise KEEP.

### Label × demand (sanity check)
| Label | high | med | low |
|---|---:|---:|---:|
| KEEP | 84 | 4 | 0 |
| DEEPEN | 305 | 0 | 22 |
| MERGE | 65 | 9 | 3 |
| CUT | 282 | 220 | 155 |

Note that **282 "high-demand" pages are still CUT** — deliberately. A
high-demand keyword does **not** save a page that is one of 284 templated
near-duplicates; that page won't rank *and* it drags the domain. The keyword is
better served by one rebuilt canonical (a DEEPEN page), not by 30 doorway twins.

### Label × category
| Category | KEEP | DEEPEN | MERGE | CUT |
|---|---:|---:|---:|---:|
| Visa Guides (871) | 63 | 261 | 67 | 480 |
| Country Guides (101) | 4 | 39 | 6 | 52 |
| Travel Tips (94) | 2 | 7 | 0 | 85 |
| Document Help (64) | 3 | 18 | 3 | 40 |
| Interview Prep (10) | 7 | 2 | 1 | 0 |
| Single-route others (9) | 9 | 0 | 0 | 0 |

Interview Prep is the cleanest category (hand-built, distinct). Travel Tips is
the weakest (90% CUT — "15 cheapest countries from {X}" and "10 best budget
destinations for {X}" listicles, near-identical across nationalities).

---

## 6. Biggest duplicate clusters (the worst offenders)

| Cluster | Size | Demand mix | Theme |
|---|---:|---|---|
| dup-001 | 284 | 184 high / 99 med / 1 low | `{passport} → {country}` visa requirements ("how to apply") |
| dup-002 | 125 | 87 high / 38 med | "How much does a {country} visa cost from {passport}?" |
| dup-003 | 97 | 79 high / 18 med | "{country} visa processing time from {passport}" |
| dup-004 | 72 | 72 high | "{A} vs {B} visa for {passport}: which is easier?" |
| dup-005 | 44 | 19 high / 23 low / 2 med | "{country} travel guide: visa, budget, best time, itinerary" |
| dup-006 | 40 | 40 low | "Visa photo for a {country} visa: format, sample, mistakes" |
| dup-007 | 38 | 22 low / 11 med / 5 high | "15 cheapest countries to visit from {X}" |
| dup-008 | 38 | 18 high / 16 low / 4 med | "{country} visa rule changes in 2026" |
| dup-009 | 34 | 34 high | "{country} student visa for {nationality} students" |
| dup-011 | 25 | 17 high / 8 med | "How much does a {country} visa cost from {passport}?" (variant) |

These ten clusters alone account for **797 posts (69% of the entire blog)**.
The single largest, dup-001 (284 pages), is the clearest doorway signal on the
site.

---

## 7. Cannibalization & orphans

- **64 same-keyword collision groups (128 posts).** The dominant pattern is two
  slug variants for one route, e.g. `india-to-switzerland-schengen-visa-requirements-2026`
  vs `india-to-switzerland-visa-schengen-requirements-how-to-apply-2026`, or
  `pakistan-to-singapore-visa-requirements-2026` vs
  `...-visa-requirements-how-to-apply-2026`. These split link equity and confuse
  Google on which URL to rank — straightforward MERGE/redirects.
- **Orphans: 19 posts** have zero in-body internal links; **21** have ≤1. Low
  but worth fixing on any page that survives.

---

## 8. Top 30 DEEPEN candidates

These are the highest-value templated pages — real demand, well-linked, lowest
boilerplate. They are where rewriting effort earns the most. **Deepen in
priority order; do not attempt all 327 at once.**

Destination "travel guide" series (visa + budget + best-time + itinerary), all
~1,580–1,620w, 4 internal links, high demand:

`united-states`, `united-kingdom`, `united-arab-emirates`, `australia`,
`canada`, `france`, `saudi-arabia`, `germany`, `singapore`, `ireland`, `italy`,
`spain`, `portugal`, `turkey`, `thailand`, `qatar`, `norway`, `sweden`,
`malaysia` (`-travel-guide-2026-visa-budget-best-time-to-visit-itinerary`),
plus `dubai-travel-guide-top-things-to-do-costs-visa-tips-2026`.

Student-visa financial-requirements series (~1,490–1,525w, high demand):
`canada-`, `united-states-`, `united-kingdom-student-visa-financial-requirements-2026-proof-of-funds-explained`.

Visa-rule-change series (1,484w, **9 internal links** — best-linked in the
corpus): `france-`, `germany-`, `italy-`, `netherlands-`, `portugal-`,
`spain-visa-rule-changes-in-2026-what-travelers-need-to-know`, plus
`best-time-to-visit-malaysia-weather-seasons-cheapest-months-2026`.

The reason each is DEEPEN rather than KEEP: the body is currently a shared
template. To deserve indexing, each needs genuinely unique substance — real
fees, current processing realities, specific embassy/VFS detail, original
guidance — not the recycled skeleton it ships with today.

---

## 9. Recommended end-state & how aggressive to prune

**Be aggressive. The domain is being judged on its weakest 800 pages.**

Recommended phased path:

1. **Immediate prune — remove 734 pages (64% of the blog).**
   noindex the **657 CUT** pages and **301-redirect the 77 MERGE** pages into
   their canonical siblings. This is the single highest-impact action: it
   collapses the doorway mass that is suppressing the domain. Do it in one wave,
   not trickled — Google needs to see the page-type ratio change decisively.

2. **Consolidate & deepen the survivors — the remaining 415 (88 KEEP + 327
   DEEPEN).** Genuinely rebuild the **top ~120–150 DEEPEN** pages (start with
   §8) into unique, differentiated content. Hold the rest of the DEEPEN pool as
   noindex-until-rebuilt; only re-index a page once it's actually been
   deepened. Any DEEPEN page that doesn't get rebuilt within the program should
   be downgraded to CUT, not left as templated filler.

3. **Realistic stable end-state: ~200–300 high-quality indexable blog pages**
   (88 untouched KEEPs + ~120–200 rebuilt DEEPENs). That's roughly a **75–83%
   reduction** in indexable blog URLs.

**Why this is the right call from a recovery standpoint:** sites under
scaled-content / Helpful-Content suppression recover by demonstrating a
decisive shift in the *proportion* of low-value pages, not by adding more
content. 289 indexed today is not the floor to protect — it's evidence Google
already rejected most of the corpus. Cutting hard removes the anchor; the
~200–300 survivors then compete on their own merits with the domain no longer
penalized. A timid 20–30% prune will not move a domain-level quality
assessment.

**One caveat for Hamad:** demand here is inferred from keyword/route patterns,
not from your live Google Search Console data. Before executing, cross-check the
CUT list against GSC — any CUT page already pulling impressions/clicks for a
unique query should be promoted to DEEPEN instead of cut. The classification is
deliberately conservative on that axis (it keeps the high-demand routes as
DEEPEN), but GSC is the final arbiter of real demand.

---

## 10. Out of scope / untouched

Per the sprint guardrails, this audit did **not** touch and did **not** label
for removal: the homepage, the visa template, the wizard, interview-prep, or the
two Sprint-2 pages (Germany Job Seeker, Schengen Insurance). Blog posts that
overlap those product pages were eligible only to be labeled MERGE/CUT as blog
URLs. `force-dynamic` and `eslint.ignoreDuringBuilds` were left intact.

**Content changes made by this sprint: NONE.** Only three repo files were
added: `content-audit-report.md`, `content-audit.csv`, and
`scripts/content_audit.py` (plus `audit_summary.json`).

---

## Appendix — files

- `content-audit.csv` — one row per post (1,149 rows): slug, title, category,
  date, word_count, thin_flag, duplicate_cluster_id, cannibalization_group,
  internal_link_count, boilerplate_ratio, demand, label, reason. **This is the
  machine-readable file the execution sprint consumes.**
- `audit_summary.json` — aggregate stats behind this report.
- `scripts/content_audit.py` — the reproducible audit engine (re-run anytime).
