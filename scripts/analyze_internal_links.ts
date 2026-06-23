/**
 * Sprint 8 — internal-linking orphan/coverage analysis.
 * Runs the REAL related-guides algorithm over every LIVE post and reports:
 *  - orphans before (legacy getRelatedPosts, 3 links, no exclusions)
 *  - orphans after (getRelatedGuides, up to 6 LIVE-only links)
 *  - avg outbound related links per post
 *  - inbound link count for each of the 7 priority pages
 *
 * Run: node --experimental-strip-types scripts/analyze_internal_links.ts
 */
import { blogPosts, getPostTags } from '../src/lib/posts.ts'
import { noindexedPostSet } from '../lib/data/noindexedPosts.ts'
import { redirectedSlugSet } from '../lib/data/blogRedirectSlugs.ts'
import { getRelatedGuides, PRIORITY_SLUGS } from '../src/lib/relatedGuides.ts'

const isExcluded = (slug: string) =>
  noindexedPostSet.has(slug) || redirectedSlugSet.has(slug)

const livePosts = blogPosts.filter((p) => !isExcluded(p.slug))
const liveSlugs = new Set(livePosts.map((p) => p.slug))

// ── category sizes (orphan-chain sanity) ─────────────────────────────────────
const catCount = new Map<string, number>()
for (const p of livePosts) catCount.set(p.category, (catCount.get(p.category) ?? 0) + 1)

// ── AFTER: real algorithm ────────────────────────────────────────────────────
const inboundAfter = new Map<string, number>()
for (const s of liveSlugs) inboundAfter.set(s, 0)
let totalLinksAfter = 0
let belowMin = 0
const FIXED_INTERNAL_LINKS_PER_POST = 7 // visaLink, visa-free, req-matrix, checklist, wizard, passport-strength, destinations

for (const p of livePosts) {
  const related = getRelatedGuides({
    currentSlug: p.slug,
    allPosts: blogPosts,
    tagsOf: getPostTags,
    isExcluded,
    limit: 6,
    min: 3,
  })
  totalLinksAfter += related.length
  if (related.length + FIXED_INTERNAL_LINKS_PER_POST < 3) belowMin++
  for (const r of related) {
    if (isExcluded(r.slug)) {
      console.error(`!! LEAK: ${p.slug} -> excluded ${r.slug}`)
    }
    inboundAfter.set(r.slug, (inboundAfter.get(r.slug) ?? 0) + 1)
  }
}
const orphansAfter = [...liveSlugs].filter((s) => (inboundAfter.get(s) ?? 0) === 0)

// ── BEFORE: legacy getRelatedPosts (passport+dest+category, limit 3, NO exclusions) ──
function legacyRelated(slug: string): string[] {
  const current = blogPosts.find((p) => p.slug === slug)
  if (!current) return []
  return blogPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0
      if (p.passportCountry === current.passportCountry) score += 2
      if (p.destinationCountry === current.destinationCountry) score += 2
      if (p.category === current.category) score += 1
      return { slug: p.slug, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.slug)
}
const inboundBefore = new Map<string, number>()
for (const s of liveSlugs) inboundBefore.set(s, 0)
let leakBefore = 0
for (const p of livePosts) {
  for (const r of legacyRelated(p.slug)) {
    if (isExcluded(r)) leakBefore++ // legacy linked to noindexed/redirected
    if (liveSlugs.has(r)) inboundBefore.set(r, (inboundBefore.get(r) ?? 0) + 1)
  }
}
const orphansBefore = [...liveSlugs].filter((s) => (inboundBefore.get(s) ?? 0) === 0)

// ── Priority inbound ─────────────────────────────────────────────────────────
const priorityInbound = PRIORITY_SLUGS.map((s) => ({
  slug: s,
  before: inboundBefore.get(s) ?? 0,
  after: inboundAfter.get(s) ?? 0,
}))

const avgInboundAll =
  [...inboundAfter.values()].reduce((a, b) => a + b, 0) / inboundAfter.size

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\n===== SPRINT 8 INTERNAL-LINK ANALYSIS =====')
console.log('Total posts:', blogPosts.length, '| LIVE:', livePosts.length,
  '| noindexed:', noindexedPostSet.size, '| redirected:', redirectedSlugSet.size)
console.log('LIVE category sizes:', Object.fromEntries(catCount))
console.log('\n-- Outbound (Related Guides block) --')
console.log('Avg related links per LIVE post:', (totalLinksAfter / livePosts.length).toFixed(2))
console.log('Posts with <3 total internal links (incl. 7 fixed route/tool links):', belowMin)
console.log('\n-- Orphans (LIVE posts receiving 0 inbound from related blocks) --')
console.log('BEFORE (legacy, 3 links, no exclusions):', orphansBefore.length)
console.log('AFTER  (getRelatedGuides, ≤6 LIVE-only): ', orphansAfter.length)
if (orphansAfter.length) console.log('  remaining orphans:', orphansAfter.slice(0, 20))
console.log('Legacy links pointing to noindexed/redirected (leaks):', leakBefore)
console.log('Avg inbound per LIVE post (after):', avgInboundAll.toFixed(2))
console.log('\n-- Priority pages inbound (before -> after) --')
for (const p of priorityInbound) {
  console.log(`  ${p.before} -> ${p.after}  ${p.slug}`)
}
const avgInboundPriority =
  priorityInbound.reduce((a, b) => a + b.after, 0) / priorityInbound.length
console.log(`Priority avg inbound (after): ${avgInboundPriority.toFixed(1)} vs site avg ${avgInboundAll.toFixed(1)}`)
console.log('===== END =====\n')
