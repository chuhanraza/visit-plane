import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getFlag } from '@/lib/admin/settings'
import { recipientsFor, recipientsForSegment } from '@/lib/admin/email'
import { sendBroadcastEmail } from '@/lib/email'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(50000),
  source: z.string().trim().max(120).optional(),
  leadMagnet: z.string().trim().max(120).optional(),
  segmentId: z.string().uuid().optional(),
  test: z.coerce.boolean().default(false),
  testEmail: z.string().trim().email().max(200).optional(),
})

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://visitplane.com').replace(/\/$/, '')
}

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('email', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const d = parsed.data
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  // ── Test send: goes only to the provided test address. No flag required. ────
  if (d.test) {
    if (!d.testEmail) return NextResponse.json({ error: 'testEmail is required for a test send' }, { status: 400 })
    const r = await sendBroadcastEmail(d.testEmail, `[TEST] ${d.subject}`, d.body, `${siteUrl()}/unsubscribe?token=preview`)
    await writeAudit({ actor, actorType: 'admin', action: 'email.broadcast_test', entityType: 'email', metadata: { subject: d.subject, to: d.testEmail, sent: r.sent }, ip })
    return NextResponse.json({ ok: true, test: true, sent: r.sent, recipientCount: 1 })
  }

  // ── Real broadcast: gated behind the operator feature flag. ─────────────────
  const enabled = await getFlag('email_broadcasts_enabled')
  if (!enabled) {
    return NextResponse.json({ error: 'Broadcasts are disabled. Enable "email_broadcasts_enabled" in Settings first.' }, { status: 403 })
  }

  const recipients = d.segmentId
    ? await recipientsForSegment(d.segmentId)
    : await recipientsFor({ source: d.source, leadMagnet: d.leadMagnet })
  if (recipients.length === 0) return NextResponse.json({ error: 'No confirmed, subscribed recipients match this audience.' }, { status: 400 })

  let sent = 0, failed = 0
  for (const r of recipients) {
    const unsubscribeUrl = `${siteUrl()}/unsubscribe?token=${r.unsubscribe_token}`
    const res = await sendBroadcastEmail(r.email, d.subject, d.body, unsubscribeUrl)
    if (res.sent) sent++; else failed++
  }

  await writeAudit({
    actor, actorType: 'admin', action: 'email.broadcast', entityType: 'email',
    metadata: { subject: d.subject, segment: { source: d.source ?? null, leadMagnet: d.leadMagnet ?? null, segmentId: d.segmentId ?? null }, recipientCount: recipients.length, sent, failed },
    ip,
  })
  return NextResponse.json({ ok: true, recipientCount: recipients.length, sent, failed })
}
