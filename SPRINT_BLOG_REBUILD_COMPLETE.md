# Sprint A — Blog Infrastructure Rebuild: Completion Report

**Date:** 2026-06-15
**Scope delivered:** The genuine gaps between the Sprint A spec and the already-shipped blog. Existing working features were left intact (no rebuild, no regressions).

---

## Context: what already existed before this sprint

Reconnaissance showed the blog was far more complete than the brief assumed. Already in place and **not touched**:

- Unified `<SiteHeader/>` + `<SiteFooter/>` applied globally via `app/layout.tsx` (so `/blog` already inherited them — Phase 1 was effectively done; there were no blog-specific header/footer components to delete, and no "How it Works" link in the blog).
- Image system (`utils/blogPhotos.ts`, Pexels CDN — hero/card/inline per slug).
- Immersive index hero, live search, category filter, featured post, responsive grid.
- Post template: full-bleed hero, reading-progress bar, sticky social share, two-column TOC, mid-article visa CTA, related posts, author card, FAQ accordion, affiliate trip box.
- Article + FAQPage JSON-LD, dynamic OG images (`/api/og`), Twitter cards.
- 43 posts (not 10), each with metadata + images; blog posts already in the main `sitemap.ts`.

Because of this, the sprint was executed as a **targeted gap-fill**, not a rebuild.

---

## What was built in this sprint

### 1. Email capture (Phase 3 + 4)
- **New:** `components/blog/BlogEmailCapture.tsx` — reusable, consent-compliant newsletter form wired to the existing `/api/subscribe` (Supabase + Resend double opt-in). Two variants: `strip` and `inline`.
- Placed on the blog index (`captured_from: blog_index`), mid-article in each post (`blog_post`, with passport/destination context), and on category/tag landing pages (`blog_category` / `blog_tag`).

### 2. Breadcrumbs + structured data (Phase 4 + 5)
- **New:** `components/blog/BlogBreadcrumb.tsx` — renders the visible trail **and** `BreadcrumbList` JSON-LD.
- Wired into the index (`Home › Blog`) and posts (`Home › Blog › Category › Title`).

### 3. Index upgrades (Phase 3)
- `app/blog/BlogClientPage.tsx`:
  - **URL-synced categories** via `?category=<slug>` (shareable/filterable, `router.replace`).
  - **Pagination** — "Load more", 20 posts per page; resets on filter/search change.
  - **Three horizontal carousels** (default view only): "📚 Most Read This Month", "✈️ Visa Guides by Destination", "💡 Visa Tips & Insider Knowledge".
  - Email capture strip below the content.
  - Category pills made horizontally scrollable on mobile.
- `app/blog/page.tsx` — added breadcrumb and wrapped the client list in `<Suspense>` (required for `useSearchParams`).

### 4. Category + tag taxonomy & landing pages (Phase 9)
- `src/lib/posts.ts` — new helpers: `toSlug`, `getAllCategories`, `categoryFromSlug`, `getPostsByCategory`, `getPostTags`, `getAllTags`, `tagFromSlug`, `getPostsByTag`. Tags are **auto-derived** from each post's route (passport/destination) and title keywords, so no per-post data edits were required.
- **New:** `app/blog/category/[category]/page.tsx` and `app/blog/tag/[tag]/page.tsx` — static-generated landing pages with intros, breadcrumbs, `PostGrid`, email capture, related-tag chips, and per-page SEO metadata + canonical.
- **New:** `components/blog/PostGrid.tsx` — shared server-rendered card grid.

### 5. Per-post SEO + sitemap (Phase 6 + 7)
- `app/blog/[slug]/page.tsx`:
  - Schema upgraded from `Article` → **`BlogPosting`** with `wordCount`, `articleSection`, `keywords`, `mainEntityOfPage`, and publisher logo.
  - Added per-post `canonical` and `article:*` Open Graph tags (published/modified time, section, tags).
  - Added a **tag chip row** and the **brand tagline** ("VisitPlane — visa requirements, decoded in seconds…") with a `/destinations` CTA (Phase 8 internal linking).
- **New:** `app/sitemap-blog.xml/route.ts` — standalone blog sitemap (posts + category + tag URLs).
- `app/sitemap.ts` — category/tag landing pages added to the main sitemap.
- `app/robots.ts` — references `sitemap-blog.xml` alongside the main sitemap.

---

## Files changed / added

**Added**
- `components/blog/BlogEmailCapture.tsx`
- `components/blog/BlogBreadcrumb.tsx`
- `components/blog/PostGrid.tsx`
- `app/blog/category/[category]/page.tsx`
- `app/blog/tag/[tag]/page.tsx`
- `app/sitemap-blog.xml/route.ts`

**Modified**
- `app/blog/page.tsx`
- `app/blog/BlogClientPage.tsx`
- `app/blog/[slug]/page.tsx`
- `src/lib/posts.ts`
- `app/sitemap.ts`
- `app/robots.ts`

---

## Verification

- **`tsc --noEmit`: 0 type errors across all application code.** (137 reported errors are all pre-existing `__tests__` vitest-global references, unrelated to this work and not part of the Next build.)
- Next-specific build risks audited manually: `useSearchParams` Suspense boundary ✅, server/client component boundaries ✅, `OpenGraph` article metadata typing ✅, function hoisting in `posts.ts` ✅, image `remotePatterns` already cover Pexels/Unsplash ✅.

### Not verifiable in this environment
- A full `next build` could not be run locally: Next 16's Turbopack native build binary SIGBUSes in the sandbox (while `next --version` and SWC load fine). This is an environment limitation, not a code issue — Vercel's build environment runs it normally.

---

## Go live

Deployment could not be triggered from the sandbox (no Vercel token / GitHub credentials available, and a stale `.git/index.lock` on the mounted folder could not be removed here). To deploy from your Mac terminal — Vercel will build and auto-deploy from the push:

```bash
cd ~/Desktop/visitplane
rm -f .git/index.lock
git add -A
git commit -m "feat(blog): email capture, breadcrumbs+schema, carousels, category/tag pages, blog sitemap"
git push origin main
```

### Post-deploy checks
- `curl -I https://www.visitplane.com/blog` → 200
- Visit `/blog`: hero, search, category pills (URL updates to `?category=…`), carousels, "Load more", email strip.
- Open a post: breadcrumb, mid-article email CTA, tag chips, brand tagline.
- `/blog/category/visa-guides` and `/blog/tag/schengen` load correctly.
- `https://www.visitplane.com/sitemap-blog.xml` returns XML.
- Validate a post URL in the [Google Rich Results / Schema validator](https://validator.schema.org/) → `BlogPosting`, `BreadcrumbList`, `FAQPage` detected.

---

## Not in scope (per agreement)
- No new blog content (Sprints C/D).
- No changes to `/destinations`, `/visa/*`, `/wizard`, `/interview-prep`, or homepage.
- No new fonts/colors, no paid image services, no comments system.
