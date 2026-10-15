/**
 * Corridor pages, origin-aware tool, crawler policy and edge TTLs.
 * Run with:  npx vitest run __tests__/letterCorridors.test.ts
 */
import { describe, expect, it } from 'vitest'
import { CORRIDORS, findLiveCorridor, liveCorridors } from '../lib/letters/corridors'
import { DEST_BY_SLUG } from '../lib/letters/destinations'
import { ORIGINS, PERSONAS, localizeFields } from '../lib/letters/origins'
import { allLetterPaths, samplePlaceholderCount, sampleLetter } from '../lib/letters/seo'
import { LETTERS, blocksToText, buildLetter, getFields, getNotices } from '../lib/letters/templates'
import type { OriginId } from '../lib/letters/origins'
import { AI_SEARCH_BOT_UA_PATTERN, BLOCKED_BOT_UA_PATTERN, aiSearchBotMayFetch } from '../lib/security/botBlocklist'
import { forcedEdgeTtl, withEdgeTtl } from '../lib/edge/forcedTtl'

const ngrams = (text: string, n = 5): Set<string> => {
  const w = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '))
  return out
}
const corridorText = (c: (typeof CORRIDORS)[number]) =>
  [...c.intro, ...c.checklist.map((r) => `${r.label} ${r.text}`), ...c.fit.items, ...c.mistakes.map((m) => `${m.title} ${m.body}`), ...c.faqs.map((f) => `${f.q} ${f.a}`)].join(' ')

describe('corridor data', () => {
  it('has unique slugs per letter type and resolvable references', () => {
    const keys = CORRIDORS.map((c) => `${c.type}/${c.slug}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const c of CORRIDORS) {
      expect(DEST_BY_SLUG[c.destSlug], `${c.slug} destSlug`).toBeTruthy()
      for (const r of c.related) expect(CORRIDORS.some((x) => x.slug === r), `${c.slug} related ${r}`).toBe(true)
      expect(c.sources.length).toBeGreaterThan(0)
      for (const s of c.sources) expect(s.url).toMatch(/^https:\/\//)
      expect(c.liveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('keeps titles and descriptions inside search-result limits', () => {
    for (const c of CORRIDORS) {
      expect(c.title.length, `${c.slug} title`).toBeLessThanOrEqual(60)
      expect(c.description.length, `${c.slug} description`).toBeLessThanOrEqual(155)
      expect(c.description.length).toBeGreaterThan(80)
    }
  })

  it('has enough substance on each page', () => {
    for (const c of CORRIDORS) {
      const words = corridorText(c).split(/\s+/).length
      expect(words, `${c.slug} words`).toBeGreaterThan(330)
      expect(c.checklist.length).toBeGreaterThanOrEqual(4)
      expect(c.mistakes.length).toBeGreaterThanOrEqual(4)
      expect(c.faqs.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('does not copy text between corridor pages (scaled-content guard)', () => {
    for (let i = 0; i < CORRIDORS.length; i++) {
      for (let j = i + 1; j < CORRIDORS.length; j++) {
        const a = ngrams(corridorText(CORRIDORS[i]))
        const b = ngrams(corridorText(CORRIDORS[j]))
        let shared = 0
        for (const g of a) if (b.has(g)) shared++
        const overlap = shared / Math.min(a.size, b.size)
        expect(overlap, `${CORRIDORS[i].slug} vs ${CORRIDORS[j].slug}`).toBeLessThan(0.3)
      }
    }
  })

  it('never promises an outcome', () => {
    for (const c of CORRIDORS) {
      expect(corridorText(c)).not.toMatch(/guarantee[sd]?\b(?! a visa)|will be approved|ensures? approval|improve your chances|boost your chances/i)
    }
  })
})

describe('go-live gating', () => {
  it('lists only corridors whose date has passed', () => {
    const before = liveCorridors('2026-10-15').map((c) => c.slug)
    expect(before).toContain('pakistan-to-schengen')
    expect(before).not.toContain('india-to-schengen')
    expect(liveCorridors('2026-10-22').map((c) => c.slug)).toContain('india-to-schengen')
    expect(findLiveCorridor('cover', 'india-to-schengen', '2026-10-15')).toBeNull()
    expect(findLiveCorridor('cover', 'india-to-schengen', '2026-10-22')).not.toBeNull()
    expect(findLiveCorridor('noc', 'pakistan-to-schengen', '2026-12-01')).toBeNull() // wrong type
  })

  it('puts live corridors, and only those, in the sitemap list', () => {
    const paths = allLetterPaths()
    expect(paths).toContain('/support-letter/cover-letter/pakistan-to-schengen')
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('sample letters', () => {
  it('are complete (no placeholders) and localized', () => {
    for (const c of CORRIDORS) {
      const dest = DEST_BY_SLUG[c.destSlug]
      expect(samplePlaceholderCount(c.type, dest, c.origin, c.sampleOverrides), `${c.slug} placeholders`).toBe(0)
      const text = blocksToText(sampleLetter(c.type, dest, c.origin, c.sampleOverrides))
      if (c.origin === 'india') {
        expect(text).not.toMatch(/PKR|Pakistan|NADRA|FBR|CNIC|Islamabad/)
        expect(text).toMatch(/Pune|INR|New Delhi/)
      } else {
        expect(text).not.toMatch(/INR|Pune|ITR-V|New Delhi/)
      }
    }
  })

  it('addresses UK letters to the Entry Clearance Officer, not an embassy', () => {
    const text = blocksToText(sampleLetter('sponsor', DEST_BY_SLUG['united-kingdom'], 'pakistan'))
    expect(text).toContain('Entry Clearance Officer')
    expect(text).not.toContain('Embassy of the United Kingdom')
  })
})

describe('origin-aware fields', () => {
  const origins = ORIGINS.map((o) => o.id)

  it('never adds or removes a field', () => {
    for (const l of LETTERS) {
      for (const o of origins) {
        expect(getFields(l.type, o).map((f) => f.id)).toEqual(l.fields.map((f) => f.id))
      }
    }
  })

  it('keeps the exact option strings the consistency checks look for', () => {
    for (const o of origins) {
      const enc = getFields('cover', o).find((f) => f.id === 'enclosures')!.options!
      for (const must of ['Passport copy', 'Flight reservation', 'Hotel booking', 'Travel insurance', 'Employer NOC / leave letter']) {
        expect(enc, `${o} enclosures`).toContain(must)
      }
      const fin = getFields('cover', o).find((f) => f.id === 'finDocs')!.options!
      expect(fin).toContain('Sponsor letter and sponsor documents')
      expect(fin.some((x) => /registration/i.test(x))).toBe(true)
    }
  })

  it('swaps Pakistani documents for Indian ones', () => {
    const fin = getFields('cover', 'india').find((f) => f.id === 'finDocs')!.options!
    expect(fin.join('|')).toContain('ITR-V')
    expect(fin.join('|')).not.toMatch(/FBR|NTN/)
    const enc = getFields('cover', 'india').find((f) => f.id === 'enclosures')!.options!
    expect(enc.join('|')).not.toContain('NADRA')
    expect(getFields('cover', 'india').find((f) => f.id === 'embassyCity')!.placeholder).toBe('New Delhi')
  })

  it('leaves Pakistan untouched', () => {
    const base = LETTERS.find((l) => l.type === 'cover')!.fields
    expect(localizeFields('cover', base, 'pakistan')).toBe(base)
  })

  it('labels the registration line by origin in the cover letter', () => {
    const base = { employment: 'Self-employed / freelancer', business: 'Example Co', bizSince: '2019', ntn: 'X-1' }
    const text = (origin: OriginId) => blocksToText(buildLetter('cover', { ...base, origin }, '2026-10-15'))
    expect(text('pakistan')).toContain('Registration / NTN: X-1')
    expect(text('india')).toContain('Registration (GST / Udyam / company): X-1')
    expect(text('other')).toContain('Business registration: X-1')
  })

  it('has a persona for every landing-page origin', () => {
    expect(PERSONAS.pakistan.currency).toBe('PKR')
    expect(PERSONAS.india.currency).toBe('INR')
  })
})

describe('government NOC', () => {
  const gov = {
    issuer: 'Government department (an authorised officer signs)', company: 'Example Department', empName: 'A B', empTitle: 'Officer',
  }
  it('uses department wording and shows an attestation notice', () => {
    const text = blocksToText(buildLetter('noc', gov, '2026-10-15'))
    expect(text).toContain('The department has no objection')
    expect(text).toContain('official departmental letterhead')
    expect(text).toContain('Signature and official stamp')
    expect(getNotices('noc', gov).some((n) => /attested/.test(n.text))).toBe(true)
  })
  it('keeps the company wording for private employers', () => {
    const text = blocksToText(buildLetter('noc', { issuer: 'Employer (HR or manager signs)', company: 'X Ltd' }, '2026-10-15'))
    expect(text).toContain('The company has no objection')
  })
})

describe('Schengen cover notice', () => {
  it('says a cover letter is optional on many lists', () => {
    const n = getNotices('cover', { region: 'Schengen (Europe)' }).map((x) => x.text).join(' ')
    expect(n).toMatch(/many do not/)
  })
})

describe('crawler policy', () => {
  it('blocks training and SEO scrapers everywhere', () => {
    for (const ua of ['Mozilla/5.0 (compatible; GPTBot/1.1)', 'ClaudeBot/1.0', 'AhrefsBot/7.0', 'Bytespider', 'CCBot/2.0']) {
      expect(BLOCKED_BOT_UA_PATTERN.test(ua), ua).toBe(true)
    }
  })
  it('does not block search engines or user-triggered fetchers', () => {
    for (const ua of ['Googlebot/2.1', 'bingbot/2.0', 'ChatGPT-User/1.0', 'Claude-User', 'Perplexity-User', 'facebookexternalhit/1.1', 'Twitterbot']) {
      expect(BLOCKED_BOT_UA_PATTERN.test(ua), ua).toBe(false)
      expect(AI_SEARCH_BOT_UA_PATTERN.test(ua), ua).toBe(false)
    }
  })
  it('lets AI search bots read only the letter tool, the blog and the files they need', () => {
    for (const ua of ['OAI-SearchBot/1.0', 'PerplexityBot/1.0', 'Claude-SearchBot', 'DuckAssistBot/1.0']) {
      expect(AI_SEARCH_BOT_UA_PATTERN.test(ua), ua).toBe(true)
      expect(BLOCKED_BOT_UA_PATTERN.test(ua), ua).toBe(false)
    }
    for (const ok of ['/support-letter', '/support-letter/cover-letter/pakistan-to-schengen', '/blog', '/blog/some-post', '/robots.txt', '/sitemap.xml', '/sitemap-blog.xml']) {
      expect(aiSearchBotMayFetch(ok), ok).toBe(true)
    }
    for (const no of ['/', '/visa/pakistan/germany', '/blogger', '/support-letters', '/admin', '/api/subscribe', '/support-letter-evil']) {
      expect(aiSearchBotMayFetch(no), no).toBe(false)
    }
  })
})

describe('forced edge TTLs', () => {
  it('covers sitemaps and robots only', () => {
    expect(forcedEdgeTtl('/sitemap.xml')).toBe(6 * 3600)
    expect(forcedEdgeTtl('/sitemap-blog.xml')).toBe(6 * 3600)
    expect(forcedEdgeTtl('/robots.txt')).toBe(24 * 3600)
    expect(forcedEdgeTtl('/')).toBeNull()
    expect(forcedEdgeTtl('/support-letter')).toBeNull()
  })
  it('sets a shared-cache lifetime and keeps the body and status', async () => {
    const res = withEdgeTtl(new Response('<urlset/>', { status: 200, headers: { 'cache-control': 'max-age=0, must-revalidate', 'content-type': 'application/xml' } }), 21600)
    expect(res.headers.get('cache-control')).toBe('public, max-age=0, s-maxage=21600')
    expect(res.headers.get('content-type')).toBe('application/xml')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<urlset/>')
  })
})
