# Mobile-First Audit — 375px viewport (2026-07-03)

**Context:** 69% of GSC traffic is mobile (emerging-market Android, slow 3G/4G). This audit combines
(a) code-level review of all key page templates, (b) rendered checks at 375×812 (local dev + production),
(c) Lighthouse **mobile** runs against production.

**Method notes:** Local dev renders visa pages as "Coming Soon" (placeholder Supabase env), so visa-page
rendered evidence comes from production Lighthouse (incl. axe a11y pass) + code review. No horizontal
overflow was found on any tested page at 375px (homepage, visa page, blog post, wizard, interview-prep,
destinations) — the apparent 407px scrollWidth in dev was a preview-scrollbar artifact.

**Lighthouse mobile baseline (production, throttled):**

| Page | Perf | A11y | LCP | CLS | TBT | JS | Images | Total |
|---|---|---|---|---|---|---|---|---|
| Homepage `/` | 76 | 91 | 5.5s | 0.031 | 0ms | 326KB | 184KB | 676KB |
| Visa `/visa/Pakistan/Turkey` | 74 | 95 | 5.2s | 0.007 | 0ms | 525KB | 2KB | 695KB |
| Blog `/blog/dubai-visa-for-nigerians-2026` | 75 | 86 | 7.3s | 0.000 | 50ms | 492KB | **853KB** | **1738KB** |

Top perf offenders (Lighthouse opportunities):
- **Blog hero image**: `/api/photo?...v=hero` = **445KB** transfer; card variants 100–140KB. LCP 7.3s.
- **Unused JS ~200–226KB per page** (chunks `9831`, `9920`, `4bd1b696` — framer-motion + shared client bundle).
- Render-blocking CSS (2 stylesheets) on visa + blog.
- Homepage LCP 5.5s: hero is text+form but LCP waits on JS hydration/images.

---

## P0 — broken/blocking at 375px

| # | Page | File | Issue |
|---|---|---|---|
| P0-1 | All | `app/page.tsx:673-685`, blog email capture, destinations search, interview-prep select | **Inputs/selects < 16px font** (14px email input, 14px search, 12–14px selects) → iOS auto-zoom on focus, jarring on every form. Verified rendered: homepage email 14px, destinations search 14px + selects 12px, interview-prep select 14px. |
| P0-2 | All | `components/layout/SiteFooter.tsx:118,137,156,175+` | **Footer link contrast `text-white/30`–`/25` on near-black ≈2.5:1** — fails WCAG AA badly; affiliate "Recommended Partners" links effectively invisible (verified: 42–81 axe contrast failures per page, footer dominates). |
| P0-3 | Home | `app/page.tsx` (marquee), axe `aria-hidden-focus` ×60 | **60 focusable links inside `aria-hidden="true"`** (duplicated marquee track) — screen-reader/keyboard trap on the homepage. |
| P0-4 | Visa | `components/visa/VisaRequirementsBlock.tsx:397-402` | Requirements `<table>` with fixed `w-44` label column inside `overflow-hidden` (not `overflow-x-auto`) — content clipped at 375px when table renders. |
| P0-5 | Destinations | `app/destinations/DestinationsClient.tsx` | Filter pills render at **26px height** (verified) — far below 44px tap minimum for the page's primary controls; region/sort selects 12px font (iOS zoom). |
| P0-6 | Blog | `app/blog/[slug]/BlogPostClient.tsx:198+`, axe `button-name`/`link-name` | Share buttons/links have **no accessible name** (6 axe failures) and are 36px targets. |
| P0-7 | Header | `components/layout/SiteHeader.tsx:395,404` | Mobile menu tools grid `grid-cols-4` with `text-[10px]` labels — cramped/unreadable at 375px; hamburger 36px target. |
| P0-8 | Wizard | `app/wizard/components/WizardStep.tsx:138` | Purpose options `grid-cols-2` at base → ~170px buttons with wrapped 2-line content; dense tap zone on the money step. |
| P0-9 | Interview | `app/interview-prep/components/InterviewRoom.tsx:51-174` | Interview room desktop split (officer 40% panel + bottom nav row) has no mobile stacking; nav buttons compress at 375px. |

## P1 — hurts UX/conversion

- **Conversion / affiliate**: visa page has only footer `/go/*` links visible in default render (3, at 16px height, contrast-failing) — TravelReadinessGrid CTAs `text-xs px-3 py-2` (~32px) (`components/visa/TravelReadinessGrid.tsx:134-147`); blog in-content CTAs 32px tall (verified). Primary action IS above the fold on homepage (good) but "Check My Visa" disabled state is `opacity-40` (unclear).
- **Touch targets < 44px** (verified rendered): footer social icons 32px; modal close buttons 24–28px (`PostLookupModal.tsx:107`, `ExitIntentModal.tsx:132`); homepage continent pills 34px; breadcrumb links 16px height (`app/visa/[passport]/[destination]/page.tsx:408`); related-route links `py-2` (`RelatedRoutesAndFAQ.tsx:168-184`); email-consent checkbox 14px (`app/page.tsx:688`); blog category pills ~32px; wizard calendar days 36px (`InlineCalendar.tsx:104`).
- **Visa hero card at 375px**: stat tiles `grid-cols-2` with `text-[10px]` labels + `truncate` values — key facts ("3–5 business days") truncate with hover-only `title` tooltip (`VisaHeroCard.tsx:213-220`).
- **Sticky mobile CTA bar** on visa page can cover last content; content has `pb-24` but FAQ expanders near bottom still collide (`VisaPageClient.tsx:75-116`).
- **CountrySelect dropdown** `max-h-[320px]` on 667px phones extends past fold; 200+ DOM options; placeholder `text-gray-400` (`CountrySelect.tsx:410,537`). SearchableCountrySelect `max-h-60` similar (`visa-checker/.../SearchableCountrySelect.tsx:64`).
- **Blog**: no TOC on mobile (`hidden xl:block`, 12-min reads); related-post excerpts `text-xs`; "at a glance" `grid-cols-2` cramped; heading-order violation (footer `h4`).
- **Forms**: email inputs missing `autocomplete="email"` (wizard results), duration input missing `inputmode="numeric"` (`WizardStep.tsx:164`).
- **Contrast (axe, non-footer)**: `text-emerald-600` badges, `text-gray-400` metadata spans, teal `#0D9488` chips on images — 42–81 failures/page.
- **SEO/UX side-finding**: lowercase `/visa/pakistan/turkey` serves a 200 "Coming Soon" soft-404 in the browser (canonical caps version exists) — case redirect appears inconsistent between crawler and browser paths.

## P2 — polish

- Marquee cards 220px wide → second card cut at 375px (by design for scroll affordance, but gap-4 makes it awkward) (`VisaFreeMarquee.tsx:72`).
- Popular-destination card images `h-44` fixed; `DestinationImage` lacks `sizes` attr (600px fetched for 355px slot) (`DestinationImage.tsx:38-51`).
- Interview/checker score circles fixed 144–192px (`ResultsSection.tsx:34`, `InterviewResults.tsx:25`).
- Officer silhouette renders on mobile pushing CTA down (`InterviewHero.tsx:88-128`).
- Wizard results share row 3-up cramped (`WizardResults.tsx:343-366`); consent checkbox 16px.
- Blog drop-cap `::first-letter` 2.8rem can shift layout; `.blog-prose` 17px/1.85 at ≤640px (acceptable, keep).
- Header logo/brand `gap-2.5` tight at 375px.
- Visa-checker landing stat cards `grid-cols-3` ~114px each.

## Counts

- **P0: 9** (fonts/zoom, contrast, aria-hidden focus trap, table clip, filter pills, share-button names, menu grid, wizard grid, interview room)
- **P1: ~14** clusters (tap targets, hero-card truncation, sticky bar, dropdowns, TOC, forms, badge contrast, affiliate CTA size/placement)
- **P2: ~9** (image sizes, fixed circles, marquee width, spacing polish)

## Results (post-wave, production Lighthouse mobile, 2026-07-03)

| Page | Perf | A11y | LCP | CLS | TBT | Images |
|---|---|---|---|---|---|---|
| Homepage | 76 → **78** | 91 → **96** | 5.5 → 5.6s | 0.031 | 0ms | 184KB |
| Visa page | 74 → **76** | 95 → **96** | 5.2 → **4.7s** | 0.007 → **0** | 0ms | 2KB |
| Blog post | 75 → **78** | 86 → **96** | 7.3 → **5.5s** | 0 | 50→90ms | 853 → **589KB** |

Fixed entirely: aria-hidden-focus ×60 (marquee), button-name/link-name ×6 (share buttons),
heading-order ×3 (footer). Contrast failures reduced (42–81 → and further after the
wave4b chip/footer pass, which deployed after these runs). Remaining contrast items are
per-page body-copy instances (gray-400 fee notes, teal hover-links) — tracked as P2.

## Wave plan

- **Wave 1 (P0):** input font-size ≥16px globally on mobile; footer contrast; marquee `inert`/tabindex fix; table overflow wrapper; destinations pills ≥44px + select font; share button aria-labels; header menu grid 3-col + 12px labels; wizard grid-cols-1; interview room mobile stacking.
- **Wave 2 (speed):** `/api/photo` hero weight (resize/quality/AVIF), `sizes` on card images, defer non-critical JS (framer-motion audit), preconnect/fetchpriority on LCP, verify CLS stays ~0.
- **Wave 3 (conversion):** affiliate CTA tap size + placement at answer/peak-intent points (max 2–3/page), visa hero stat readability, sticky CTA safe-area, mobile TOC, disabled-state clarity, one-handed wizard/interview polish.
- **Wave 4 (a11y):** heading order, remaining contrast (emerald/gray-400), focus states, reduced-motion, labels/landmarks; final Lighthouse re-run.
