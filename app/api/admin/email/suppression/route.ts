import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { setSetting } from '@/lib/admin/settings'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Schema = z.object({ hours: z.coerce.number().int().min(0).max(720) })

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('email', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'hours must be 0–720' }, { status: 400 })
  await setSetting('send_suppression_hours', parsed.data.hours, actor)
  await writeAudit({ actor, actorType: 'admin', action: 'email.suppression_config', entityType: 'email', metadata: { hours: parsed.data.hours }, ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null })
  return NextResponse.json({ ok: true })
}
