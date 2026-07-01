/**
 * Affiliate partner configuration for VisitPlane
 * ─────────────────────────────────────────────────────────────────────────────
 * All partner IDs and URLs are defined here.
 *
 * ⚠️  HOW TO ADD YOUR AFFILIATE IDs:
 *   1. SafetyWing  → Apply at safetywing.com/partners
 *                    Replace SAFETYWING_REFERENCE_ID below with your ID (numeric)
 *   2. Airalo      → Apply at partners.airalo.com
 *                    Replace AIRALO_AFF_CODE below with your code (string)
 *   3. WayAway     → Apply at tp.media (Travelpayouts) for WayAway program
 *                    Replace TRAVELPAYOUTS_MARKER with your marker ID
 *                    Replace WAYAWAY_PROGRAM_ID with WayAway's program ID (4114 typically)
 *   4. HeyMondo    → Apply at heymondo.com/affiliates
 *                    Replace HEYMONDO_REF_ID below
 *   5. Kiwi        → Via Travelpayouts — use TRAVELPAYOUTS_MARKER + KIWI_PROGRAM_ID
 *   6. Saily       → Apply via NordVPN affiliate program
 *                    Replace SAILY_AFF_CODE below
 *
 * All partners are integrated via Travelpayouts as primary aggregator where
 * available — single dashboard, single payout.
 */

export type AffiliatePartner =
  | 'safetywing'
  | 'heymondo'
  | 'airalo'
  | 'saily'
  | 'wayaway'
  | 'kiwi'

export type AffiliatePlacement =
  | 'visa_page'
  | 'blog_post'
  | 'homepage'
  | 'checkout_flow'
  | 'email'
  | 'email_sequence'
  | 'cheapest_page'
  | 'route_page'
  | 'itinerary'

export interface AffiliatePartnerConfig {
  id: AffiliatePartner
  name: string
  category: 'insurance' | 'esim' | 'flights'
  trustpilotRating: number  // must be ≥ 4.0
  baseUrl: string
  description: string
  priceFrom: string
  commission: string
}

// ─── Partner registry ─────────────────────────────────────────────────────────
export const AFFILIATE_PARTNERS: Record<AffiliatePartner, AffiliatePartnerConfig> = {
  safetywing: {
    id: 'safetywing',
    name: 'SafetyWing',
    category: 'insurance',
    trustpilotRating: 4.3,
    baseUrl: 'https://safetywing.com',
    description: 'Nomad insurance from $1.50/day. Covers Schengen medical requirements.',
    priceFrom: '$1.50/day',
    commission: '$10 per signup',
  },
  heymondo: {
    id: 'heymondo',
    name: 'HeyMondo',
    category: 'insurance',
    trustpilotRating: 4.6,
    baseUrl: 'https://heymondo.com',
    description: 'Comprehensive travel insurance with 24/7 medical chat.',
    priceFrom: 'From $15',
    commission: '8-10% commission',
  },
  airalo: {
    id: 'airalo',
    name: 'Airalo',
    category: 'esim',
    trustpilotRating: 4.4,
    baseUrl: 'https://www.airalo.com',
    description: 'eSIM for 200+ countries. No SIM swap needed.',
    priceFrom: 'From $5',
    commission: '7% commission',
  },
  saily: {
    id: 'saily',
    name: 'Saily',
    category: 'esim',
    trustpilotRating: 4.2,
    baseUrl: 'https://saily.com',
    description: 'eSIM by NordVPN — global coverage, competitive rates.',
    priceFrom: 'From $3.99',
    commission: 'Competitive rates',
  },
  wayaway: {
    id: 'wayaway',
    name: 'WayAway',
    category: 'flights',
    trustpilotRating: 4.1,
    baseUrl: 'https://wayaway.io',
    description: 'Flight search + cashback. Up to 50% profit share.',
    priceFrom: 'Best price',
    commission: 'Up to 50% profit share',
  },
  kiwi: {
    id: 'kiwi',
    name: 'Kiwi.com',
    category: 'flights',
    trustpilotRating: 4.1,
    baseUrl: 'https://www.kiwi.com',
    description: 'Flexible flight combinations. Kiwi Guarantee included.',
    priceFrom: 'Best fares',
    commission: 'Via Travelpayouts',
  },
}

// ─── Affiliate ID placeholders ─────────────────────────────────────────────────
// Replace these when your applications are approved
const AFFILIATE_IDS = {
  SAFETYWING_REFERENCE_ID: process.env.NEXT_PUBLIC_SAFETYWING_ID ?? 'visitplane',
  AIRALO_AFF_CODE: process.env.NEXT_PUBLIC_AIRALO_CODE ?? 'visitplane',
  // No fallback: marker=0 is Travelpayouts' "no affiliate" value — a link carrying
  // it tracks nothing payable. When unset we skip tp.media entirely (see below).
  TRAVELPAYOUTS_MARKER: process.env.NEXT_PUBLIC_TP_MARKER ?? '',
  WAYAWAY_PROGRAM_ID: process.env.NEXT_PUBLIC_WAYAWAY_PROGRAM_ID ?? '4114',
  KIWI_PROGRAM_ID: process.env.NEXT_PUBLIC_KIWI_PROGRAM_ID ?? '3',
  HEYMONDO_REF_ID: process.env.NEXT_PUBLIC_HEYMONDO_ID ?? 'visitplane',
  SAILY_AFF_CODE: process.env.NEXT_PUBLIC_SAILY_CODE ?? 'visitplane',
}

// True when the Travelpayouts marker is a real affiliate ID (set and non-zero).
function hasTpMarker(): boolean {
  const m = AFFILIATE_IDS.TRAVELPAYOUTS_MARKER.trim()
  return m !== '' && m !== '0'
}

// ─── Build the final affiliate URL (with subID injected) ─────────────────────
export function buildAffiliateUrl(
  partner: AffiliatePartner,
  subId: string,
  opts: { destIso?: string; originIso?: string } = {}
): string {
  const { destIso = '', originIso = 'pk' } = opts

  switch (partner) {
    case 'safetywing':
      return `https://safetywing.com/?referenceID=${AFFILIATE_IDS.SAFETYWING_REFERENCE_ID}&utm_source=visitplane&utm_medium=referral&utm_campaign=visa_page&subID=${subId}`

    case 'heymondo':
      return `https://heymondo.com/?utm_source=visitplane&utm_medium=affiliate&utm_campaign=visa_page&ref=${AFFILIATE_IDS.HEYMONDO_REF_ID}&clickid=${subId}`

    case 'airalo': {
      const dest = destIso ? `&destination=${destIso.toUpperCase()}` : ''
      return `https://www.airalo.com/?aff=${AFFILIATE_IDS.AIRALO_AFF_CODE}&aff_click_id=${subId}${dest}`
    }

    case 'saily':
      return `https://saily.com/?aff=${AFFILIATE_IDS.SAILY_AFF_CODE}&click_id=${subId}`

    case 'wayaway': {
      const dest = destIso ? `&destination=${destIso.toUpperCase()}` : ''
      const origin = originIso ? `&origin=${originIso.toUpperCase()}` : ''
      // Without a real marker, tp.media would attribute nothing — send the user
      // straight to WayAway instead of a dead tracking hop.
      if (!hasTpMarker()) {
        console.error('[affiliates] NEXT_PUBLIC_TP_MARKER is not set — WayAway link is UNATTRIBUTED')
        return `https://wayaway.io/?destination=${destIso}${origin}&utm_source=visitplane&utm_medium=affiliate`
      }
      const u = encodeURIComponent(`https://wayaway.io/?destination=${destIso}${origin}`)
      return `https://tp.media/r?marker=${AFFILIATE_IDS.TRAVELPAYOUTS_MARKER}&trs=visitplane_${subId}&p=${AFFILIATE_IDS.WAYAWAY_PROGRAM_ID}&u=${u}&utm_source=visitplane&utm_medium=affiliate${dest}${origin}`
    }

    case 'kiwi': {
      const o = originIso.toUpperCase()
      const d = destIso.toUpperCase()
      const kiwiUrl = `https://www.kiwi.com/us/search/${o}/${d}/anytime/anytime`
      if (!hasTpMarker()) {
        console.error('[affiliates] NEXT_PUBLIC_TP_MARKER is not set — Kiwi link is UNATTRIBUTED')
        return kiwiUrl
      }
      const u = encodeURIComponent(kiwiUrl)
      return `https://tp.media/r?marker=${AFFILIATE_IDS.TRAVELPAYOUTS_MARKER}&trs=visitplane_${subId}&p=${AFFILIATE_IDS.KIWI_PROGRAM_ID}&u=${u}&utm_source=visitplane&utm_medium=affiliate`
    }

    default: {
      const p = partner as AffiliatePartner
      return (AFFILIATE_PARTNERS[p] as { baseUrl: string }).baseUrl
    }
  }
}

// ─── Build the /go/ tracking URL (used in all CTAs) ──────────────────────────
export function affiliateTrackingUrl(
  partner: AffiliatePartner,
  opts: {
    placement: AffiliatePlacement
    destIso?: string
    routePassport?: string
    blogSlug?: string
    /** Explicit source-page identifier (falls back to the Referer header in /go). */
    source?: string
  }
): string {
  const { placement, destIso, routePassport, blogSlug, source } = opts
  const params = new URLSearchParams({ placement })
  if (destIso) params.set('dest', destIso)
  if (routePassport) params.set('route', routePassport)
  if (blogSlug) params.set('slug', blogSlug)
  if (source) params.set('source', source)
  return `/go/${partner}?${params.toString()}`
}

// ─── Schengen countries that require travel insurance ─────────────────────────
const SCHENGEN_IDENTIFIERS = [
  'schengen', 'germany', 'france', 'italy', 'spain', 'portugal', 'greece',
  'netherlands', 'belgium', 'austria', 'switzerland', 'czech', 'poland',
  'hungary', 'sweden', 'norway', 'denmark', 'finland', 'slovakia', 'slovenia',
  'luxembourg', 'malta', 'estonia', 'latvia', 'lithuania', 'iceland',
  'liechtenstein',
]

export function isInsuranceRequired(destinationName: string): boolean {
  const lower = destinationName.toLowerCase()
  return SCHENGEN_IDENTIFIERS.some(s => lower.includes(s))
}

// ─── Destination → airport code mapping ──────────────────────────────────────
export function getAirportCode(destinationName: string): { city: string; code: string } {
  const d = destinationName.toLowerCase()
  if (d.includes('uae') || d.includes('united arab')) return { city: 'Dubai', code: 'DXB' }
  if (d.includes('turkey') || d.includes('türkiye')) return { city: 'Istanbul', code: 'IST' }
  if (d.includes('saudi')) return { city: 'Riyadh', code: 'RUH' }
  if (d.includes('malaysia')) return { city: 'Kuala Lumpur', code: 'KUL' }
  if (d.includes('thailand')) return { city: 'Bangkok', code: 'BKK' }
  if (d.includes('uk') || d.includes('united kingdom') || d.includes('england')) return { city: 'London', code: 'LHR' }
  if (d.includes('canada')) return { city: 'Toronto', code: 'YYZ' }
  if (d.includes('germany')) return { city: 'Frankfurt', code: 'FRA' }
  if (d.includes('france')) return { city: 'Paris', code: 'CDG' }
  if (d.includes('japan')) return { city: 'Tokyo', code: 'NRT' }
  if (d.includes('usa') || d.includes('united states')) return { city: 'New York', code: 'JFK' }
  if (d.includes('australia')) return { city: 'Sydney', code: 'SYD' }
  if (d.includes('singapore')) return { city: 'Singapore', code: 'SIN' }
  if (d.includes('maldives')) return { city: 'Malé', code: 'MLE' }
  if (d.includes('qatar')) return { city: 'Doha', code: 'DOH' }
  return { city: destinationName, code: 'XXX' }
}
