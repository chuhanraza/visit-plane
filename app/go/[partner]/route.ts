/**
 * GET /go/[partner]?dest=IND&route=PAK&placement=visa_page&slug=...
 * ─────────────────────────────────────────────────────────────────────────────
 * Affiliate tracking redirect endpoint.
 *
 * 1. Validates partner
 * 2. Logs click to affiliate_clicks (Supabase)
 * 3. Builds final affiliate URL with subID
 * 4. 302 redirects to partner
 *
 * SubID format: {partner}_{placement}_{timestamp} (URL-safe)
 * This lets Travelpayouts / partners pass back the subID on conversion.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import {
  buildAffiliateUrl,
  AFFILIATE_PARTNERS,
  type AffiliatePartner,
  type AffiliatePlacement,
} from '@/src/lib/affiliates'

// ─── Supabase service client (bypasses RLS, server-only) ─────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Valid partner slugs ──────────────────────────────────────────────────────
const VALID_PARTNERS = new Set(Object.keys(AFFILIATE_PARTNERS))

const VALID_PLACEMENTS = new Set<AffiliatePlacement>([
  'visa_page', 'blog_post', 'homepage', 'checkout_flow', 'email',
  'email_sequence', 'cheapest_page', 'route_page', 'itinerary',
])

/** Reduce a full URL to a clean path (drop origin + query) for attribution. */
function cleanSourcePage(raw: string | null): string | null {
  if (!raw) return null
  try {
    // Accept absolute URLs (Referer) or already-relative paths.
    const path = raw.startsWith('http') ? new URL(raw).pathname : raw.split('?')[0]
    return path.slice(0, 256) || null
  } catch {
    return raw.split('?')[0].slice(0, 256) || null
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partner: string }> }
) {
  const { partner: partnerSlug } = await params
  const { searchParams } = req.nextUrl

  // ── Validate partner ───────────────────────────────────────────────────────
  if (!VALID_PARTNERS.has(partnerSlug)) {
    return NextResponse.json({ error: 'Unknown partner' }, { status: 404 })
  }
  const partner = partnerSlug as AffiliatePartner

  // ── Extract query params ───────────────────────────────────────────────────
  const rawPlacement = searchParams.get('placement') ?? 'visa_page'
  const placement: AffiliatePlacement = VALID_PLACEMENTS.has(rawPlacement as AffiliatePlacement)
    ? (rawPlacement as AffiliatePlacement)
    : 'visa_page'

  const destIso = (searchParams.get('dest') ?? '').slice(0, 3).toUpperCase()
  const routePassport = (searchParams.get('route') ?? '').slice(0, 3).toUpperCase() || null
  const blogSlug = searchParams.get('slug') ?? null

  // ── Build subID (used in affiliate URL + for conversion matching) ──────────
  const ts = Date.now()
  const subId = `${partner}_${placement}_${ts}`

  // ── Session ID from cookie (or generate new one) ───────────────────────────
  const cookieHeader = req.headers.get('cookie') ?? ''
  const sessionMatch = cookieHeader.match(/vp_sid=([^;]+)/)
  const userSessionId = sessionMatch ? sessionMatch[1] : `anon_${ts}`

  // ── Hash IP for privacy (GDPR-friendly) ───────────────────────────────────
  const rawIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const userIpHash = createHash('sha256').update(rawIp).digest('hex').slice(0, 16)

  const userAgent = req.headers.get('user-agent') ?? ''

  // ── Source page (explicit ?source= wins, else Referer) + country (Vercel geo) ─
  const sourcePage = cleanSourcePage(searchParams.get('source') ?? req.headers.get('referer'))
  const country = (req.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase() || null

  // ── Log to Supabase. AWAIT it so the row is actually persisted (a bare
  //    fire-and-forget insert is dropped when the serverless function freezes
  //    after responding). Guarded by a short timeout so a DB hiccup can never
  //    delay the redirect by more than ~1s. ──────────────────────────────────
  const supabase = getSupabase()
  const insert = supabase
    .from('affiliate_clicks')
    .insert({
      partner,
      placement,
      route_passport: routePassport || null,
      route_dest: destIso || null,
      blog_slug: blogSlug,
      source_page: sourcePage,
      country,
      user_session_id: userSessionId,
      user_ip_hash: userIpHash,
      user_agent: userAgent,
    })
    .then(({ error }) => {
      if (error) console.error('[affiliate-click] DB error:', error.message)
    })
  await Promise.race([insert, new Promise(r => setTimeout(r, 1000))])

  // ── Build final affiliate URL ──────────────────────────────────────────────
  const affiliateUrl = buildAffiliateUrl(partner, subId, {
    destIso: destIso.toLowerCase(),
    originIso: routePassport?.toLowerCase() ?? 'pk',
  })

  // ── Set session cookie if new visitor ─────────────────────────────────────
  const res = NextResponse.redirect(affiliateUrl, { status: 302 })
  if (!sessionMatch) {
    res.cookies.set('vp_sid', userSessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  }

  // ── Cache headers: no-store (click tracking must not be cached) ────────────
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')

  return res
}
