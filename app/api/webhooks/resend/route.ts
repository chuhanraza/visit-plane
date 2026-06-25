import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { recordEvent } from '@/lib/admin/events'

export const dynamic = 'force-dynamic'

/**
 * PUBLIC Resend webhook → marketing event spine. Resend signs with Svix headers
 * (svix-id / svix-timestamp / svix-signature). We verify HMAC-SHA256 over
 * `${id}.${timestamp}.${body}` against RESEND_WEBHOOK_SECRET (whsec_…), enforce a
 * ±5min replay window, then record delivery/open/click/bounce/complaint events
 * keyed to the recipient email. Idempotent on (email, metric, email_id).
 */

const TRACKED: Record<string, string> = {
  'email.delivered': 'email.delivered',
  'email.opened': 'email.opened',
  'email.clicked': 'email.clicked',
  'email.bounced': 'email.bounced',
  'email.complained': 'email.complained',
}

function verifySvix(secret: string, id: string, ts: string, body: string, sigHeader: string): boolean {
  try {
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
    const expected = createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64')
    // svix-signature is space-separated "v1,<sig>" entries
    for (const part of sigHeader.split(' ')) {
      const sig = part.includes(',') ? part.split(',')[1] : part
      const a = Buffer.from(sig), b = Buffer.from(expected)
      if (a.length === b.length && timingSafeEqual(a, b)) return true
    }
  } catch { /* fall through */ }
  return false
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })

  const body = await req.text()
  const id = req.headers.get('svix-id') ?? ''
  const ts = req.headers.get('svix-timestamp') ?? ''
  const sig = req.headers.get('svix-signature') ?? ''
  if (!id || !ts || !sig) return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 })

  // Replay window (±5 min)
  const tsNum = Number(ts) * 1000
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum) > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Timestamp outside tolerance' }, { status: 400 })
  }
  if (!verifySvix(secret, id, ts, body, sig)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let evt: { type?: string; data?: { email_id?: string; to?: string[] | string } }
  try { evt = JSON.parse(body) } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }

  const metric = evt.type ? TRACKED[evt.type] : undefined
  const to = Array.isArray(evt.data?.to) ? evt.data?.to[0] : evt.data?.to
  if (metric && to) {
    await recordEvent({ email: to, metric, properties: { email_id: evt.data?.email_id ?? null }, uniqueId: `${evt.data?.email_id ?? id}` })
  }
  return NextResponse.json({ ok: true })
}
