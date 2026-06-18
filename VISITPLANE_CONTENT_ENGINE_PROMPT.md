# VisitPlane Content Engine — Reusable Prompt

Paste everything below into a new chat (with the `visitplane` folder connected) to continue mass-producing blog posts using the same proven pipeline.

---

You are continuing a large SEO content build for **VisitPlane**, a visa-requirements site (Next.js 16 App Router, Tailwind v4, Supabase, deployed on Vercel). The local project is the connected `visitplane` folder. Your job each round is to produce **60 new blog posts** ("6×"), wire them in, verify, and hand me a git push command. Follow this playbook exactly.

## Repo conventions (do not deviate)

- **Markdown posts** live in `content/blog/<slug>.md`. Frontmatter keys: `title, date ("2026-06-15"), excerpt, category, readTime, coverEmoji`. Body uses `## Overview`, a `> **Key takeaway:**` blockquote, multiple `##` H2 sections, `## Frequently Asked Questions` (a lead paragraph only — the actual Q&A lives in posts.ts), and a `## Sources` section with 3 official links, then a closing italic `*VisitPlane — ...*` line.
- **Metadata** lives in `src/lib/posts.ts` as objects in the `blogPosts` array, inserted **before** the line `\n]\n\nexport function getPostBySlug`. Each entry: `{ slug, title, date, excerpt, category, readTime, coverEmoji, passportCountry, destinationCountry, visaLink, ctaTitle, faqs:[{q,a}×4] }`. Use the typographic apostrophe `’` (U+2019) inside JS single-quoted strings to avoid escaping.
- **`category`** must be one of: `'Visa Guides' | 'Country Guides' | 'Interview Prep' | 'Document Help' | 'Travel Tips'`. Map: routes/cost/timeline/rejection/comparison/student/news → `Visa Guides`; best-time & travel guides → `Country Guides`; SOP & document guides → `Document Help`; listicles → `Travel Tips`; interview → `Interview Prep`.
- **`visaLink`** = `/wizard` (routes, comparisons, country guides, listicles, timelines), `/checklist` (document/student/cost-from-checklist), or `/interview-prep` (interview).
- **`passportCountry` → `destinationCountry`** render in an "At a glance" card and drive the hero photo. `destinationCountry` must be a clean country name (e.g. `United Kingdom`, not "the UK"; `United Arab Emirates`, not "UAE") so `/api/photo` can match its `LANDMARKS` map. Origin-based posts (listicles) use a representative `destinationCountry` that HAS a landmark (e.g. `Thailand`, `Turkey`).
- **Photos**: `app/api/photo/route.ts` holds a curated `LANDMARKS` map of verified Pexels photo IDs keyed by lowercased destination. Destinations not in the map fall back to `DEFAULT_LANDMARKS` (generic scenery) — that's fine. **Do NOT guess Pexels IDs** for new countries; only add a landmark if you can `curl`-fetch the JPEG, save it to the outputs dir, and `Read` it to confirm the subject matches. Otherwise let it default. Never mislabel a photo.

## Hard rules

1. **Every post ≥ 1,500 words.** Drafts always come out ~1,000–1,400; you MUST top up with substantive, format-appropriate sections and re-measure with `wc -w` until every file clears 1,500. Word-count estimates run high — trust `wc -w`, not your guess.
2. **Accuracy**: use verified 2026 figures (below). For volatile per-passport visa-free/VOA lists, frame as *guidance with caveats* and link to the Wizard — never assert a precise definitive list. Caveat all fees with "confirm current amount."
3. **No duplicate slugs.** Dedupe against existing files before writing.
4. **Verify with tsc** (see workflow). Sandbox `git` is wedged and has no GitHub creds — **I run git myself**; you just give me the push command.

## Verified 2026 figures (reuse these)

Schengen visa €90 (€45 child 6–11), insurance ≥€30,000, ~15-day decision, 90/180 rule. UK Standard Visitor £135 (from 8 Apr 2026), ~3 weeks. US B1/B2 MRV $185 ($250 Visa Integrity Fee enacted but not yet collected as of mid-2026). Canada visitor TRV CAD 100 + CAD 85 biometrics; study-permit living funds **CAD 22,895** (single, outside Quebec, from 1 Sep 2025); SDS ended late 2024; PAL/TAL needed. UAE tourist AED 350 (30-day)/650 (60-day). Saudi tourist e-visa ~SAR 535 incl insurance (limited eligibility; or via valid US/UK/Schengen visa, or sponsor/Umrah). Australia subclass 600 ~AUD 190; student living AUD 29,710/yr. Germany blocked account €11,904/yr (€992/mo); France VLS-TS €615/mo; Ireland student €10,000/yr (held 28 days); NZ student NZD 20,000/yr; UK student maintenance £1,483/mo London ÷ £1,136 outside (28-day rule) + IHS £776/yr. Maldives free 30-day VOA all. Kenya eTA. Vietnam e-visa ~USD 25/50 up to 90 days. Azerbaijan ASAN e-visa ~USD 26.

## Workflow each round

1. **Pick the next 60 topics.** Read `topics.json` in the outputs/scratchpad dir (1,000-topic bank: fields include slug, contentType, category, priority, rank, destination, market). Dedupe against `content/blog/*.md`, sort by `(priority, rank)`, take the next 60. **Skip malformed topics** (e.g. `egypt-to-egypt`) and pull the next valid one to keep 60. Group by `contentType`.
2. **Create a task list** (TaskCreate) with one task per sub-wave + a final wire/verify task. Mark in_progress/completed as you go.
3. **Generate by content type** with Python heredocs run via the bash tool (write to `content/blog/`). Build per-type generators with rich, specific, non-boilerplate bodies. Reuse the section library below. Then run **top-up passes** that `.replace("## The Bottom Line", block + "## The Bottom Line", 1)` or insert before `## Common Mistakes to Avoid`, re-checking `wc -w` until all ≥1,500.
4. **Wire** all 60 into `src/lib/posts.ts` in one Python pass (insert before the `getPostBySlug` anchor), with 4 FAQs each.
5. **Verify**: counts match (`ls content/blog/*.md | wc -l` == `grep -c "^    slug:" src/lib/posts.ts`), no duplicate slugs, and typecheck. The mounted FS flakes on tsc, so copy to the pre-existing `/tmp/vp` clone and run there:
   `cp src/lib/posts.ts /tmp/vp/src/lib/posts.ts; cp content/blog/*.md /tmp/vp/content/blog/; cd /tmp/vp && node_modules/.bin/tsc --noEmit 2>&1 | grep -vE "__tests__|node_modules"` — only non-`__tests__` errors matter (the mrzParser jest errors are pre-existing and ignored).
6. **Hand off** a concise summary + this push command (I run it):
   ```
   rm -f ~/Desktop/visitplane/.git/index.lock
   cd ~/Desktop/visitplane
   git add content/blog src/lib/posts.ts app/api/photo/route.ts
   git commit -m "content(blog): <wave description>; blog now <N> posts"
   git push
   ```

## Content types & their templates

- **route** (`X-to-Y-visa-requirements-how-to-apply-2026`, Schengen ones use `-visa-schengen-requirements-`): Overview, Who Needs a Visa, Fees, Documents, Step-by-Step, Proof of Funds, Ties (the quiet decider), Processing Time, Validity & Length of Stay, Tourism/Family/Business, Cost Snapshot, Travel History Helps, After You Apply, Booking & Insurance, First-Time Traveller, Mistakes, How to Prepare, Bottom Line, FAQ lead, Sources.
- **cost** (`how-much-does-a-X-visa-cost-from-Y-2026-fees-hidden-charges`): headline fee + full breakdown (bullets) + hidden charges + currency conversion + total estimate + avoid overpaying + priority worth it? + refund-if-refused + family budgeting + agent-or-self.
- **timeline** (`X-visa-processing-time-from-Y-how-long-it-really-takes-2026`): realistic time, how you apply, what drives delays, get it faster, plan travel around visa, why averages mislead, planning buffer, while you wait, first-time vs repeat, after a decision, apply-when-ready.
- **comparison** (`A-vs-B-visa-for-MARKET-which-is-easier-to-get-2026`): snapshot of each visa, head-to-head (cost/process/docs/funds/time/odds), verdict (lean to easier but caveat), depends-on-you scenarios, strengthen-either, myths, if-refused.
- **rejection** (`why-X-visas-get-refused-top-reasons-how-to-avoid-them-2026`): top reasons ranked, deep-dive on funds/ties/purpose/consistency/documents, checklist, what to do if refused, cover letter, myths.
- **student** (proof-of-funds, SOP): proof-of-funds = how much/what counts/source-history/dependants/verification/timeline/self-vs-sponsored. SOP = what it must do, structure, full **sample** (adapt-don't-copy), winning-vs-weak, length, consistency, self-check.
- **country/best-time** (`best-time-to-visit-X-...`): best overall, season-by-season, cheapest months, weather by region, top sights, festivals, what to pack, how long to stay, save money, off-season worth it, getting around, when to book, crowds, visa note.
- **city / country-itinerary** (`X-travel-guide-...` / `X-travel-guide-2026-visa-budget-best-time-to-visit-itinerary`): top things to do, when to visit, costs, getting around, food, where to stay, day trips, **sample itinerary**, visa basics, money/connectivity, best-vs-cheapest, safety, how many days.
- **listicle** (budget/dream/cheapest/e-visa/no-sponsor/easiest = numbered destination list with ~70-word blurbs; VOA/visa-free = guidance-overview format, NOT a hard list): How to Choose, Visa Rules Change (always confirm), money-saving checklist, best time, practical tips, how to verify, insurance/essentials, combining destinations, plan-in-right-order. VOA/visa-free add: what the category means, where access broadly applies (regional, caveated), why lists change, what you need at the border, visa-free vs e-visa vs VOA, passport strength, respect permitted stay.
- **news** (`X-visa-rule-changes-in-2026-what-travelers-need-to-know`): what's changed (numbered), why it matters, who's affected, planning around changes, if you applied under old rules, how to read visa news wisely, what hasn't changed (fundamentals), keep verifying.

Reusable top-up sections (drop in to reach 1,500): "First-Time Traveller? Start Early", "A Quick Note on Onward Travel", "Booking and Insurance", "Apply Yourself or Use an Agent?", "When and How to Pay", "Keep a Simple Timeline of Your Own", "How Long to Stay", "Saving Money Beyond the Calendar", "Is the Off-Season Worth It?", "Plan in the Right Order".

## Voice

Warm, plain, authoritative. UK spelling. Lead with the takeaway. Every post links internally to `/wizard`, `/checklist`, and/or `/interview-prep`. Always end with the official `## Sources` and the standard VisitPlane sign-off line.

**Start now:** read `topics.json`, dedupe, take the next 60, set up tasks, and produce them following the above. Report the new total post count and give me the push command.
