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
 *   3. WayAway     → Via Travelpayouts: generate a SHORT LINK in the dashboard
 *                    (tp.media hand-built links break — see `case 'wayaway'`)
 *   4. HeyMondo    → Apply at heymondo.com/affiliates
 *                    Replace HEYMONDO_REF_ID below
 *   5. Kiwi        → Via Travelpayouts: generate a SHORT LINK in the dashboard
 *                    and set NEXT_PUBLIC_KIWI_TRACKING_URL (see `case 'kiwi'`)
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
  | 'ivisa'
  | 'airhelp'

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
  | 'req_page'
  | 'guide_page'
  | 'flight_delay_page'

export interface AffiliatePartnerConfig {
  id: AffiliatePartner
  name: string
  category: 'insurance' | 'esim' | 'flights' | 'visa-services' | 'claims-services'
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
  // Monetizes the "apply for X visa" intent we can't serve ourselves (we don't
  // process visas). Apply at ivisa.com/affiliates; set NEXT_PUBLIC_IVISA_TRACKING_URL
  // to the tracking link from the dashboard once approved. Until then /go/ivisa
  // redirects to ivisa.com unattributed. Always show the official government
  // channel + fee alongside any iVisa CTA (honesty layer).
  ivisa: {
    id: 'ivisa',
    name: 'iVisa',
    category: 'visa-services',
    trustpilotRating: 4.3,
    baseUrl: 'https://www.ivisa.com',
    description: 'Online visa application service — expert review, 24/7 support.',
    priceFrom: 'Service fee applies',
    commission: 'Per approved order',
  },
  // ── DARK / PLACEHOLDER — no real affiliate relationship yet ─────────────────
  // Used by app/flight-compensation (the flight delay/cancellation compensation
  // checker). trustpilotRating 4.5 is AirHelp's real public Trustpilot score as
  // of July 2026 (trustpilot.com/review/www.airhelp.com — "Excellent", 231k+
  // reviews), not fabricated. There is NO tracking link yet: buildAffiliateUrl()
  // below intentionally falls through to the site's own homepage (a safe,
  // non-affiliate fallback) instead of airhelp.com, so this never sends a click
  // to a real partner without attribution/commission set up. Apply at
  // airhelp.com/partners, then set NEXT_PUBLIC_AIRHELP_TRACKING_URL (see
  // AFFILIATE_IDS below) — that one env var is the only change needed to go live.
  airhelp: {
    id: 'airhelp',
    name: 'AirHelp',
    category: 'claims-services',
    trustpilotRating: 4.5,
    baseUrl: 'https://www.airhelp.com',
    description: 'Flight delay/cancellation compensation claims handled for you — no win, no fee.',
    priceFrom: 'Free to check; fee only if they win your claim',
    commission: 'Per successful claim (pending partner approval)',
  },
}

// ─── Affiliate ID placeholders ─────────────────────────────────────────────────
// Replace these when your applications are approved
const AFFILIATE_IDS = {
  // 26557179 is the approved SafetyWing Ambassador referenceID — public (it
  // appears in the outbound affiliate URL), hardcoded as default since Vercel
  // env inlining for these vars has been unreliable; env var still overrides.
  SAFETYWING_REFERENCE_ID: process.env.NEXT_PUBLIC_SAFETYWING_ID || '26557179',
  AIRALO_AFF_CODE: process.env.NEXT_PUBLIC_AIRALO_CODE || 'visitplane',
  // ⚠️ MARKER INCONSISTENCY — kept only as documentation, no longer used to
  // build links (both flight partners now use dashboard-generated short links):
  //   546374 = the marker this codebase historically hardcoded. tp.media
  //            returned 403 for it on the WayAway program pre-activation.
  //   746637 = the marker the VERIFIED WayAway short link actually attributes
  //            to (observed live: aviasales.tpo.lu/Da1Eq1Ch 302s to
  //            aviasales.com?marker=746637...). This is the activated account.
  // Do NOT hand-build tp.media/r links with either marker — trs requires a
  // numeric traffic-source id and the program must be authorized; generate
  // short links from the Travelpayouts dashboard instead.
  TRAVELPAYOUTS_MARKER: process.env.NEXT_PUBLIC_TP_MARKER || '546374',
  // Full Kiwi tracking link from the Travelpayouts dashboard (generate a short
  // link for the Kiwi.com program, same as WayAway's). Empty = not yet
  // generated → plain kiwi.com deep link (works, but unattributed).
  KIWI_TRACKING_URL: process.env.NEXT_PUBLIC_KIWI_TRACKING_URL || '',
  HEYMONDO_REF_ID: process.env.NEXT_PUBLIC_HEYMONDO_ID || 'visitplane',
  SAILY_AFF_CODE: process.env.NEXT_PUBLIC_SAILY_CODE || 'visitplane',
  // Full tracking link from the iVisa affiliate dashboard (may contain a
  // {subId} placeholder). Empty = not yet approved → plain ivisa.com link.
  IVISA_TRACKING_URL: process.env.NEXT_PUBLIC_IVISA_TRACKING_URL ?? '',
  // Full tracking link from the AirHelp affiliate dashboard once approved (may
  // contain a {subId} placeholder). Empty = not yet approved → dark fallback
  // (VisitPlane homepage, NOT airhelp.com) so no unattributed traffic is sent.
  AIRHELP_TRACKING_URL: process.env.NEXT_PUBLIC_AIRHELP_TRACKING_URL ?? '',
}

// ─── Build the final affiliate URL (with subID injected) ─────────────────────
export function buildAffiliateUrl(
  partner: AffiliatePartner,
  subId: string,
  opts: { destIso?: string; originIso?: string } = {}
): string {
  // opts.originIso is currently unused (Kiwi no longer builds a route deep
  // link) but stays in the signature — /go/[partner] passes it, and a real
  // Kiwi tracking link may use it again later.
  const { destIso = '' } = opts

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

    case 'wayaway':
      // The old hand-built tp.media/r?marker=...&trs=...&p=...&u=... link
      // returned HTTP 400/403 — trs needs a numeric Travelpayouts
      // traffic-source id (not our string subId), and the account needed
      // explicit WayAway-program authorization. Replaced with a verified
      // Travelpayouts short link (marker + program routing baked in
      // server-side on their end) — it's complete and self-contained, so no
      // params get appended here; adding any could break it.
      return 'https://aviasales.tpo.lu/Da1Eq1Ch'

    case 'kiwi': {
      // The old hand-built tp.media/r?marker=...&trs=...&p=3&u=... link was
      // broken twice over (verified live 2026-07-08): trs rejected our string
      // subId with HTTP 400 "schema: error converting value for trs", and
      // program id 3 returns 404 "promo not found" with EITHER marker even
      // with trs fixed — so every Kiwi click died on a tp.media error page
      // and never reached Kiwi. Same failure class WayAway had before its
      // verified short link. Until a real Kiwi short link is generated from
      // the Travelpayouts dashboard (set NEXT_PUBLIC_KIWI_TRACKING_URL —
      // that one env var is the only change needed to go live), send users
      // to a working kiwi.com search directly: functional, just unattributed.
      const tracking = AFFILIATE_IDS.KIWI_TRACKING_URL.trim()
      if (tracking) {
        // Dashboard short links are complete and self-contained — appending
        // params can break them (same rule as the WayAway case above).
        return tracking
      }
      console.error('[affiliates] NEXT_PUBLIC_KIWI_TRACKING_URL is not set — Kiwi link is UNATTRIBUTED')
      // NOT a deep link: the old /us/search/{ISO}/{ISO}/anytime/anytime format
      // 404s on kiwi.com (verified live — Kiwi expects place slugs, not ISO
      // codes), so the site root is the only verified-working destination.
      return 'https://www.kiwi.com/us/'
    }

    case 'ivisa': {
      const tracking = AFFILIATE_IDS.IVISA_TRACKING_URL.trim()
      if (tracking) {
        return tracking.includes('{subId}')
          ? tracking.replaceAll('{subId}', encodeURIComponent(subId))
          : tracking
      }
      return 'https://www.ivisa.com/?utm_source=visitplane&utm_medium=referral'
    }

    case 'airhelp': {
      // DARK until approved: no real tracking link configured yet, so redirect
      // to our own homepage rather than sending unattributed traffic to a real
      // competitor/partner site. Set NEXT_PUBLIC_AIRHELP_TRACKING_URL (one env
      // var) once the AirHelp affiliate application is approved to go live —
      // no other code change required.
      const tracking = AFFILIATE_IDS.AIRHELP_TRACKING_URL.trim()
      if (tracking) {
        return tracking.includes('{subId}')
          ? tracking.replaceAll('{subId}', encodeURIComponent(subId))
          : tracking
      }
      return 'https://www.visitplane.com/'
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
