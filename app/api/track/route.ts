/**
 * POST /api/track — lightweight, first-party funnel beacon.
 * ─────────────────────────────────────────────────────────────────────────────
 * Records anonymous funnel events (currently `page.view` on money pages) into the
 * existing marketing_events spine. NO third-party analytics, NO PII:
 *   - session id is an anonymous first-party cookie (vp_sid), not tied to identity
 *   - country comes from Vercel's edge geo header (coarse, ISO-2), not stored IP
 *   - Do-Not-Track / Global-Privacy-Control are honored (request is dropped)
 *
 * Kept deliberately tiny and non-blocking so it never hurts page performance.
 */
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { recordEvent } from '@/lib/admin/events'

export const dynamic = 'force-dynamic'

// Only money pages are tracked — keeps the table meaningful + small.
const MONEY_PAGE_RE = /^\/(visa\/|seo\/|visa-data|wizard|itinerary-generator|blog\/)/

// Events the beacon is allowed to record (anonymous, funnel-top only).
const ALLOWED = new Set(['page.view'])

function cleanPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const path = (raw.startsWith('http') ? (() => { try { return new URL(raw).pathname } catch { return raw } })() : raw).split('?')[0]
  return path.startsWith('/') ? path.slice(0, 256) : null
}

export async function POST(req: NextRequest) {
  // ── Honor Do-Not-Track / Global Privacy Control ──────────────────────────
  if (req.headers.get('dnt') === '1' || req.headers.get('sec-gpc') === '1') {
    return NextResponse.json({ ok: true, skipped: 'dnt' })
  }

  const body = await req.json().catch(() => ({}))
  const event = typeof body.event === 'string' && ALLOWED.has(body.event) ? body.event : 'page.view'
  const page = cleanPath(body.page)
  if (!page || !MONEY_PAGE_RE.test(page)) {
    return NextResponse.json({ ok: true, skipped: 'page' })
  }

  // ── Anonymous first-party session (same cookie the /go redirect uses) ─────
  const cookieHeader = req.headers.get('cookie') ?? ''
  const m = cookieHeader.match(/vp_sid=([^;]+)/)
  const session = m ? m[1] : `anon_${Date.now()}_${randomBytes(4).toString('hex')}`
  const country = (req.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase() || null

  await recordEvent({
    metric: event,
    properties: { page, session, country },
  })

  const res = NextResponse.json({ ok: true })
  if (!m) {
    res.cookies.set('vp_sid', session, {
      httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    })
  }
  res.headers.set('Cache-Control', 'no-store')
  return res
}
