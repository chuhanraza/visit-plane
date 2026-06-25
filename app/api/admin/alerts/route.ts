import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { evaluateAlerts, ALERT_METRICS } from '@/lib/admin/ops'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  metric: z.enum(ALERT_METRICS.map(m => m.key) as [string, ...string[]]),
  op: z.enum(['gt', 'gte', 'lt', 'lte']),
  threshold: z.coerce.number().min(0).max(1_000_000),
})

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('ops', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'evaluate') {
    const r = await evaluateAlerts()
    await writeAudit({ actor, actorType: 'admin', action: 'alert.evaluate_manual', entityType: 'alert', metadata: r, ip })
    return NextResponse.json({ ok: true, ...r })
  }
  if (body?.op === 'toggle') {
    const p = z.object({ id: z.string().uuid(), active: z.coerce.boolean() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    await svc.from('alert_rules').update({ active: p.data.active }).eq('id', p.data.id)
    return NextResponse.json({ ok: true })
  }
  if (body?.op === 'delete') {
    const p = z.object({ id: z.string().uuid() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await svc.from('alert_rules').delete().eq('id', p.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'alert.delete', entityType: 'alert', entityId: p.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const { data, error } = await svc.from('alert_rules').insert({ ...parsed.data }).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit({ actor, actorType: 'admin', action: 'alert.create', entityType: 'alert', entityId: (data as { id: string })?.id, metadata: { ...parsed.data }, ip })
  return NextResponse.json({ ok: true, id: (data as { id: string })?.id })
}
