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

// ─── Bot/crawler detection ─────────────────────────────────────────────────
// Same signature coverage as the backfill in
// supabase/migrations/20260705_affiliate_clicks_is_bot.sql — keep both in sync.
const BOT_UA_RE = /bot|crawl|spider|slurp|bingpreview|curl|wget|python-requests|headless/i
function isBotUserAgent(ua: string): boolean {
  return ua === '' || BOT_UA_RE.test(ua)
}

// ─── Referer validation ─────────────────────────────────────────────────────
// Distributed bot campaigns rotate User-Agent strings through pools of
// legitimate-looking browser UAs, which defeats BOT_UA_RE entirely (see
// supabase/migrations/20260802_affiliate_clicks_fraud_detection.sql for the
// campaign this was built to catch: ~1,000 IPs, ~49 rotating UAs, all
// evading the UA regex). A same-origin Referer is much harder for a
// script to fake consistently while still looking organic, so it's used as
// a second, independent signal. This never blocks the redirect — only the
// human-click classification below changes.
const ALLOWED_REFERER_ORIGINS = new Set([
  'https://visitplane.com',
  'https://www.visitplane.com',
])
type RefererStatus = 'same_origin' | 'missing' | 'foreign'
function classifyReferer(refererHeader: string | null): RefererStatus {
  if (!refererHeader) return 'missing'
  try {
    return ALLOWED_REFERER_ORIGINS.has(new URL(refererHeader).origin) ? 'same_origin' : 'foreign'
  } catch {
    return 'foreign'
  }
}

// ─── App-level rate limiting ────────────────────────────────────────────────
// Real users don't click affiliate links repeatedly — this catches
// distributed bots (rotating IPs individually stay under most per-IP
// limits, but a single IP firing >5 /go/* clicks in 60s is never a human).
// Reuses affiliate_clicks + the (user_ip_hash, clicked_at) index added in
// the same migration above instead of standing up a separate store.
const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX_CLICKS = 5
const UNKNOWN_IP_HASH = createHash('sha256').update('unknown').digest('hex').slice(0, 16)
async function isRateLimited(
  supabase: ReturnType<typeof getSupabase>,
  ipHash: string
): Promise<boolean> {
  if (ipHash === UNKNOWN_IP_HASH) return false
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString()
  const { count, error } = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('user_ip_hash', ipHash)
    .gte('clicked_at', since)
  if (error) {
    console.error('[affiliate-click] rate-limit check failed:', error.message)
    return false // fail open — a DB hiccup must never misclassify or delay
  }
  return (count ?? 0) >= RATE_LIMIT_MAX_CLICKS
}

// ─── Valid partner slugs ──────────────────────────────────────────────────────
const VALID_PARTNERS = new Set(Object.keys(AFFILIATE_PARTNERS))

const VALID_PLACEMENTS = new Set<AffiliatePlacement>([
  'visa_page', 'blog_post', 'homepage', 'checkout_flow', 'email',
  'email_sequence', 'cheapest_page', 'route_page', 'itinerary',
  'req_page', 'guide_page', 'flight_delay_page',
  'visa_free_page', 'nat_hub_page', 'destination_page',
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

  // ── Respect Do-Not-Track / Global Privacy Control — same rule as /api/track.
  //    Skips the click log only; the redirect below always happens regardless. ─
  const dntRequested = req.headers.get('dnt') === '1' || req.headers.get('sec-gpc') === '1'

  // ── Skip logging obvious crawlers (they fetch every /go/ link on a page
  //    just by crawling it — that's not a human click). Redirect still happens. ─
  const isBot = isBotUserAgent(userAgent)

  // ── Log to Supabase. AWAIT it so the row is actually persisted (a bare
  //    fire-and-forget insert is dropped when the serverless function freezes
  //    after responding). Guarded by a short timeout so a DB hiccup can never
  //    delay the redirect by more than ~1s, and wrapped in try/catch so any
  //    logging failure — including a thrown client-init error — can never
  //    break or delay the redirect itself. ───────────────────────────────────
  //
  //    Classification (is_suspected_fraud + fraud_reason) never blocks the
  //    redirect below — it only changes how the click is counted:
  //      - referer_mismatch:      Referer present but not our own origin
  //      - unverified_no_referer: no Referer at all (privacy browsers, some
  //                               in-app browsers — plausibly real, but not
  //                               confirmed, so it's excluded from the
  //                               "verified human" count rather than
  //                               hard-blocked or miscounted as one)
  //      - rate_limit_exceeded:   >5 clicks from this IP hash in 60s
  if (!dntRequested && !isBot) {
    try {
      const supabase = getSupabase()
      const logClick = async () => {
        const refererStatus = classifyReferer(req.headers.get('referer'))
        const rateLimited = await isRateLimited(supabase, userIpHash)

        let fraudReason: string | null = null
        if (rateLimited) fraudReason = 'rate_limit_exceeded'
        else if (refererStatus === 'foreign') fraudReason = 'referer_mismatch'
        else if (refererStatus === 'missing') fraudReason = 'unverified_no_referer'

        const { error } = await supabase.from('affiliate_clicks').insert({
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
          is_suspected_fraud: fraudReason !== null,
          fraud_reason: fraudReason,
        })
        if (error) console.error('[affiliate-click] DB error:', error.message)
      }
      // Rate-limit check + insert together, capped at ~1s total so a DB
      // hiccup on either step can never delay the redirect noticeably.
      await Promise.race([logClick(), new Promise(r => setTimeout(r, 1000))])
    } catch (err) {
      console.error('[affiliate-click] logging failed:', err)
    }
  }

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
