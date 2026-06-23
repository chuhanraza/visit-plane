/**
 * Visitplane — Blog "Related Guides" internal-linking engine.
 *
 * Pure, dependency-light module: its ONLY import is a type import (erased at
 * runtime), so the exact same algorithm runs in the Next app and in the
 * standalone orphan-analysis script (scripts/analyze_internal_links.ts).
 *
 * Goals (Sprint 8):
 *  1. Each LIVE post links to 3–6 genuinely topically-related LIVE posts.
 *  2. Never link to noindexed or redirected slugs (caller supplies isExcluded).
 *  3. Bias inbound authority toward the proven-earner / deepened priority pages
 *     — relevance first, priority only as a tiebreaker / fill.
 *  4. Guarantee no orphans: every post is force-linked to its date-neighbours in
 *     the same category, so every multi-post category forms a crawl chain where
 *     every node receives ≥1 inbound link.
 */

import type { BlogPost } from './posts'

// ── Priority pages that should RECEIVE more inbound internal links ────────────
// Proven GSC earners + the Sprint-6 deepened set. All verified LIVE (not
// noindexed, not redirected) at build time.
export const PRIORITY_SLUGS: readonly string[] = [
  'best-travel-insurance-schengen-visa',
  'germany-job-seeker-visa-complete-requirements',
  'dubai-tourist-visa-complete-guide-indians',
  'how-much-does-a-saudi-arabia-visa-cost-from-pakistan-2026-fees-hidden-charges',
  'transit-visa-dubai-requirements',
  '15-cheapest-countries-to-visit-from-pakistan-in-2026',
  'how-long-does-schengen-visa-take',
]
const PRIORITY_SET = new Set(PRIORITY_SLUGS)

// ── Title-keyword tokenizer ──────────────────────────────────────────────────
// Strip boilerplate so only meaningful topic words contribute to overlap.
const STOPWORDS = new Set([
  'visa', 'visas', 'guide', 'guides', 'complete', 'requirements', 'requirement',
  'how', 'what', 'when', 'where', 'which', 'why', 'the', 'and', 'for', 'from',
  'with', 'your', 'you', 'are', 'can', 'does', 'do', 'get', 'getting', 'need',
  'needs', 'step', 'steps', 'by', 'this', 'that', 'into', 'about', 'best',
  'top', 'real', 'really', 'apply', 'application', 'travelers', 'traveller',
  'travellers', 'travel', 'citizens', 'citizen', 'passport', 'passports',
  'country', 'countries', 'tips', 'cost', 'costs', 'fees', 'price', 'prices',
  '2026', '2025', '2024', 'complete', 'full', 'all', 'new', 'know', 'much',
  'long', 'take', 'takes', 'hidden', 'charges', 'vs', 'or', 'a', 'an', 'in',
  'on', 'to', 'of', 'is', 'it', 'its', 'guide',
])

function titleKeywords(title: string): Set<string> {
  const out = new Set<string>()
  for (const raw of title.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 3) continue
    if (STOPWORDS.has(raw)) continue
    out.add(raw)
  }
  return out
}

// ── Options ──────────────────────────────────────────────────────────────────
export interface RelatedGuidesCtx {
  /** The post we are computing links FOR. */
  currentSlug: string
  /** Full post list (any indexability — filtering happens via isExcluded). */
  allPosts: BlogPost[]
  /** Tag derivation (passport/destination/topic). Reuses posts.getPostTags. */
  tagsOf: (post: BlogPost) => string[]
  /** True when a slug must NOT be linked to (noindexed OR redirected). */
  isExcluded: (slug: string) => boolean
  /** Max links to return. */
  limit?: number
  /** Minimum links to guarantee (no orphan / starved page). */
  min?: number
}

interface Scored {
  post: BlogPost
  score: number
  priority: boolean
  neighbor: boolean
}

/**
 * Returns 3–6 related LIVE posts for `currentSlug`, strongest relevance first,
 * priority pages favoured on ties, with category date-neighbours force-included
 * to guarantee a crawlable chain (no orphans).
 */
export function getRelatedGuides(ctx: RelatedGuidesCtx): BlogPost[] {
  const { currentSlug, allPosts, tagsOf, isExcluded } = ctx
  const limit = ctx.limit ?? 6
  const min = Math.min(ctx.min ?? 3, limit)

  const current = allPosts.find((p) => p.slug === currentSlug)
  if (!current) return []

  const live = allPosts.filter(
    (p) => p.slug !== currentSlug && !isExcluded(p.slug),
  )

  const curTags = new Set(tagsOf(current))
  const curKw = titleKeywords(current.title)

  // ── Score every LIVE candidate by topical overlap ──────────────────────────
  const scored: Scored[] = live.map((p) => {
    let score = 0
    if (current.passportCountry && p.passportCountry === current.passportCountry) score += 3
    if (current.destinationCountry && p.destinationCountry === current.destinationCountry) score += 3

    let tagShare = 0
    for (const t of tagsOf(p)) if (curTags.has(t)) tagShare++
    score += Math.min(tagShare, 3) * 2

    if (p.category === current.category) score += 1

    let kwShare = 0
    for (const w of titleKeywords(p.title)) if (curKw.has(w)) kwShare++
    score += Math.min(kwShare, 3)

    const priority = PRIORITY_SET.has(p.slug)
    if (priority && score > 0) score += 0.5 // tiebreaker — relevance still dominates

    return { post: p, score, priority, neighbor: false }
  })

  const bySlug = new Map(scored.map((s) => [s.post.slug, s]))

  // ── Category date-neighbours (the crawl chain that kills orphans) ───────────
  const sameCat = live
    .filter((p) => p.category === current.category)
    .sort((a, b) => {
      const d = new Date(b.date).getTime() - new Date(a.date).getTime()
      return d !== 0 ? d : a.slug.localeCompare(b.slug)
    })
  const allCat = [...sameCat]
  // Insert current into the sorted order to find its immediate neighbours.
  allCat.push({ ...current } as BlogPost)
  allCat.sort((a, b) => {
    const d = new Date(b.date).getTime() - new Date(a.date).getTime()
    return d !== 0 ? d : a.slug.localeCompare(b.slug)
  })
  const idx = allCat.findIndex((p) => p.slug === currentSlug)
  const neighborSlugs: string[] = []
  if (idx !== -1) {
    if (allCat[idx - 1]) neighborSlugs.push(allCat[idx - 1].slug)
    if (allCat[idx + 1]) neighborSlugs.push(allCat[idx + 1].slug)
  }
  for (const ns of neighborSlugs) {
    const s = bySlug.get(ns)
    if (s) s.neighbor = true
  }

  const rank = (a: Scored, b: Scored): number => {
    if (b.score !== a.score) return b.score - a.score
    if (a.priority !== b.priority) return a.priority ? -1 : 1
    const d = new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    return d !== 0 ? d : a.post.slug.localeCompare(b.post.slug)
  }

  const topical = scored.filter((s) => s.score > 0).sort(rank)

  // Build the result: reserve up to 2 slots for date-neighbours (chain), then
  // fill with the strongest topical matches.
  const chosen: BlogPost[] = []
  const used = new Set<string>()
  const add = (p?: BlogPost) => {
    if (!p || used.has(p.slug) || chosen.length >= limit) return
    used.add(p.slug)
    chosen.push(p)
  }

  // 1) Force-include neighbours (guarantees no orphans).
  for (const ns of neighborSlugs) add(bySlug.get(ns)?.post)
  // 2) Strongest topical matches.
  for (const s of topical) add(s.post)

  // 3) Top-up to `min` so no page is starved — priority pages first, then recent.
  if (chosen.length < min) {
    const fillPriority = live
      .filter((p) => PRIORITY_SET.has(p.slug) && !used.has(p.slug))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    for (const p of fillPriority) { if (chosen.length >= min) break; add(p) }
  }
  if (chosen.length < min) {
    const fillRecent = live
      .filter((p) => !used.has(p.slug))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    for (const p of fillRecent) { if (chosen.length >= min) break; add(p) }
  }

  // Display strongest-relevance first; force-included neighbours keep their slot
  // but sink to the bottom when weakly related, so the block never leads with an
  // off-topic link.
  return chosen
    .slice(0, limit)
    .sort((a, b) => {
      const sa = bySlug.get(a.slug)
      const sb = bySlug.get(b.slug)
      return rank(
        sa ?? { post: a, score: 0, priority: PRIORITY_SET.has(a.slug), neighbor: false },
        sb ?? { post: b, score: 0, priority: PRIORITY_SET.has(b.slug), neighbor: false },
      )
    })
}
