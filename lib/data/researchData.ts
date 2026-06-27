// ─────────────────────────────────────────────────────────────────────────────
// Derivation layer for the original-data "research" pages (Phase 4).
//
// These pages are meant to be GENUINELY CITABLE reference resources, so the
// derivations here are deliberately conservative and honest:
//
//  • Visa Cost Index — built from VisitPlane's own curated destination fee list
//    (app/destinations/data.ts). These are TYPICAL, DESTINATION-LEVEL tourist-visa
//    fees, NOT nationality-specific. We parse only unambiguous numeric fees, keep
//    "Free" as $0, and flag everything else ("Embassy quote", "$200+/day") as
//    non-numeric rather than inventing a number. The page frames this clearly.
//
//  • Passport Power — built from the IATA-derived Passport Index snapshot
//    (lib/data/visaFreeWorld.json), counting DISTINCT destinations that need no
//    advance visa (visa-free + visa-on-arrival). Sourced + dated.
//
//  • Document Requirements Index — built from the curated, OFFICIAL-source-cited
//    routes (lib/data/officialRequirements.ts). Each row carries its own source +
//    last-verified date. This is the most original of the three.
//
// NO fabricated numbers. Where the source is unverified/curated, the consuming
// page must frame it as "VisitPlane's dataset — verify at the official source".
// ─────────────────────────────────────────────────────────────────────────────

import { ALL_COUNTRIES, type Country as DestCountry, type VisaCategory } from '@/app/destinations/data'
import worldData from '@/lib/data/visaFreeWorld.json'
import type { VerifiedDestination } from '@/lib/data/visaFreeVerified'
import { OFFICIAL_REQUIREMENTS, type OfficialRequirements } from '@/lib/data/officialRequirements'
import { COUNTRIES, BY_ISO3, type Country as SeoCountry } from '@/lib/seo/countries'

// ── Shared dates / sources (single source of truth for the pages) ────────────
export const RESEARCH_LAST_UPDATED = '2026-06-27'
export const PASSPORT_INDEX_SOURCE = {
  name: 'Passport Index dataset (IATA-derived)',
  url: 'https://github.com/ilyankou/passport-index-dataset',
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. VISA COST INDEX
// ═════════════════════════════════════════════════════════════════════════════

export interface CostRow {
  name: string
  flag: string
  region: string
  visa: VisaCategory
  maxStay: string
  /** Raw display fee from the dataset, e.g. "$90", "Free", "Embassy quote". */
  feeDisplay: string
  /** Parsed numeric USD when the fee is unambiguous; null otherwise. */
  feeUsd: number | null
  /** True when the fee is a real number we can rank/aggregate on. */
  numeric: boolean
}

/** Parse a display fee like "$90" / "Free" / "$200+/day" / "Embassy quote". */
function parseFee(fee: string): { value: number | null; numeric: boolean } {
  const f = (fee ?? '').trim()
  if (!f || f === '—') return { value: null, numeric: false }
  if (/^free$/i.test(f)) return { value: 0, numeric: true }
  // Reject ranges / per-day / non-fixed quotes — we will not invent a point value.
  if (/\+|\/day|quote|varies|embassy/i.test(f)) {
    const m = f.match(/\$\s*(\d+)/)
    return { value: m ? Number(m[1]) : null, numeric: false }
  }
  const m = f.match(/\$\s*(\d+(?:\.\d+)?)/)
  if (m) return { value: Number(m[1]), numeric: true }
  return { value: null, numeric: false }
}

export function getCostIndex(): CostRow[] {
  return ALL_COUNTRIES
    .filter((c: DestCountry) => c.visa !== 'Not Permitted')
    .map((c: DestCountry) => {
      const { value, numeric } = parseFee(c.fee_usd)
      return {
        name: c.name,
        flag: c.flag,
        region: c.region,
        visa: c.visa,
        maxStay: c.max_stay,
        feeDisplay: c.fee_usd,
        feeUsd: value,
        numeric,
      }
    })
}

export interface CostStats {
  total: number
  freeCount: number
  numericCount: number
  median: number | null
  min: { name: string; fee: number } | null
  max: { name: string; fee: number } | null
  /** Median fee per region (numeric, non-free-only excluded? no — includes free=0). */
  byRegion: { region: string; count: number; median: number }[]
}

function median(nums: number[]): number {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
}

export function getCostStats(rows: CostRow[] = getCostIndex()): CostStats {
  const numeric = rows.filter((r) => r.numeric && r.feeUsd !== null) as (CostRow & { feeUsd: number })[]
  const paid = numeric.filter((r) => r.feeUsd > 0)
  const fees = numeric.map((r) => r.feeUsd)
  const sortedPaid = [...paid].sort((a, b) => a.feeUsd - b.feeUsd)

  const regions = [...new Set(rows.map((r) => r.region))]
  const byRegion = regions
    .map((region) => {
      const rn = numeric.filter((r) => r.region === region)
      return { region, count: rn.length, median: median(rn.map((r) => r.feeUsd)) }
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => a.median - b.median)

  return {
    total: rows.length,
    freeCount: rows.filter((r) => r.feeUsd === 0).length,
    numericCount: numeric.length,
    median: numeric.length ? median(fees) : null,
    min: sortedPaid.length ? { name: sortedPaid[0].name, fee: sortedPaid[0].feeUsd } : null,
    max: sortedPaid.length ? { name: sortedPaid[sortedPaid.length - 1].name, fee: sortedPaid[sortedPaid.length - 1].feeUsd } : null,
    byRegion,
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. PASSPORT POWER / VISA-FREE ACCESS
// ═════════════════════════════════════════════════════════════════════════════

const WORLD = worldData as Record<string, VerifiedDestination[]>

export interface PassportRow {
  name: string
  flag: string
  /** nationality slug for the /visa-free-countries-for-{slug}-passport winner page */
  nationalitySlug: string | null
  visaFree: number
  visaOnArrival: number
  /** Distinct destinations needing no advance visa. */
  total: number
  rank: number
}

/** Find the SEO country (for flag + nationality slug) by display name. */
function seoByName(name: string): SeoCountry | undefined {
  const key = name.trim().toLowerCase()
  return COUNTRIES.find((c) => c.name.toLowerCase() === key)
}

export function getPassportPower(): PassportRow[] {
  const rows = Object.entries(WORLD).map(([name, dests]) => {
    const vf = dests.filter((d) => d.kind === 'visa-free').length
    const voa = dests.filter((d) => d.kind === 'visa-on-arrival').length
    const seo = seoByName(name)
    return {
      name,
      flag: seo?.flag ?? '🏳️',
      nationalitySlug: seo?.nationality ?? null,
      visaFree: vf,
      visaOnArrival: voa,
      total: vf + voa,
    }
  })
  rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  // Dense-rank by total access.
  let rank = 0
  let prev = -1
  return rows.map((r, i) => {
    if (r.total !== prev) {
      rank = i + 1
      prev = r.total
    }
    return { ...r, rank }
  })
}

/** The emerging-market passports VisitPlane focuses on (for the highlight block). */
export const FOCUS_PASSPORTS = [
  'Pakistan', 'India', 'Bangladesh', 'Nigeria', 'Philippines',
  'Egypt', 'Kenya', 'Ghana', 'Indonesia', 'Vietnam',
]

// ═════════════════════════════════════════════════════════════════════════════
// 3. VISA DOCUMENT REQUIREMENTS INDEX (curated, official-source-cited routes)
// ═════════════════════════════════════════════════════════════════════════════

export interface DocRow {
  passport: string
  destination: string
  passportFlag: string
  destFlag: string
  visaType: string
  mandatory: number
  conditional: number
  recommended: number
  total: number
  sourceLabel: string
  sourceUrl: string
  lastVerified: string
  /** Live visa detail page for this route. */
  visaUrl: string
}

/** Split a "passport→destination" key back into its two names. */
function splitKey(key: string): { passport: string; destination: string } {
  const [p, d] = key.split('→')
  const title = (s: string) => s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return { passport: title(p), destination: title(d) }
}

function flagForName(name: string): string {
  const seo = seoByName(name)
  if (seo) return seo.flag
  // Fall back through ISO3 map by name match.
  const byName = Object.values(BY_ISO3).find((c) => c.name.toLowerCase() === name.toLowerCase())
  return byName?.flag ?? '🏳️'
}

export function getDocRequirementsIndex(): DocRow[] {
  const rows: DocRow[] = Object.entries(OFFICIAL_REQUIREMENTS).map(([key, req]: [string, OfficialRequirements]) => {
    const { passport, destination } = splitKey(key)
    const count = (tier: 'mandatory' | 'conditional' | 'recommended') =>
      req.groups.filter((g) => g.tier === tier).reduce((sum, g) => sum + g.items.length, 0)
    const mandatory = count('mandatory')
    const conditional = count('conditional')
    const recommended = count('recommended')
    return {
      passport,
      destination,
      passportFlag: flagForName(passport),
      destFlag: flagForName(destination),
      visaType: req.visaType,
      mandatory,
      conditional,
      recommended,
      total: mandatory + conditional + recommended,
      sourceLabel: req.sourceLabel,
      sourceUrl: req.sourceUrl,
      lastVerified: req.lastVerified,
      visaUrl: `/visa/${encodeURIComponent(passport)}/${encodeURIComponent(destination)}`,
    }
  })
  rows.sort((a, b) => b.total - a.total || a.passport.localeCompare(b.passport))
  return rows
}

export interface DocStats {
  routeCount: number
  passportCount: number
  destinationCount: number
  avgMandatory: number
  maxRoute: DocRow | null
}

export function getDocStats(rows: DocRow[] = getDocRequirementsIndex()): DocStats {
  const passports = new Set(rows.map((r) => r.passport))
  const destinations = new Set(rows.map((r) => r.destination))
  const avgMandatory = rows.length
    ? Math.round((rows.reduce((s, r) => s + r.mandatory, 0) / rows.length) * 10) / 10
    : 0
  return {
    routeCount: rows.length,
    passportCount: passports.size,
    destinationCount: destinations.size,
    avgMandatory,
    maxRoute: rows[0] ?? null,
  }
}
