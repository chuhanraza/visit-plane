import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { setDigestConfig, sendDigestNow } from '@/lib/admin/digest'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  enabled: z.coerce.boolean(),
  frequency: z.enum(['daily', 'weekly']),
  recipient: z.string().trim().email().max(200).or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('analytics', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  if (body?.op === 'send') {
    const to = typeof body.recipient === 'string' ? body.recipient : undefined
    const r = await sendDigestNow(to)
    await writeAudit({ actor, actorType: 'admin', action: 'digest.send_now', entityType: 'digest', metadata: r, ip })
    return NextResponse.json({ ok: r.sent, ...r })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  await setDigestConfig(parsed.data, actor)
  await writeAudit({ actor, actorType: 'admin', action: 'digest.config', entityType: 'digest', metadata: { ...parsed.data }, ip })
  return NextResponse.json({ ok: true })
}
