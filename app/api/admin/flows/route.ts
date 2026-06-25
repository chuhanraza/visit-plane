import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { writeAudit } from '@/lib/audit'
import { createFlow, setFlowActive, deleteFlow, runFlowWorker } from '@/lib/admin/flows'

export const dynamic = 'force-dynamic'

const StepSchema = z.object({
  delay_minutes: z.coerce.number().int().min(0).max(525600),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(50000),
})
const CreateSchema = z.object({ name: z.string().trim().min(1).max(80), steps: z.array(StepSchema).min(1).max(10) })

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('marketing', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  if (body?.op === 'toggle') {
    const p = z.object({ id: z.string().uuid(), active: z.coerce.boolean() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    await setFlowActive(p.data.id, p.data.active)
    await writeAudit({ actor, actorType: 'admin', action: 'flow.toggle', entityType: 'flow', entityId: p.data.id, metadata: { active: p.data.active }, ip })
    return NextResponse.json({ ok: true })
  }
  if (body?.op === 'delete') {
    const p = z.object({ id: z.string().uuid() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await deleteFlow(p.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'flow.delete', entityType: 'flow', entityId: p.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }
  if (body?.op === 'run') {
    const r = await runFlowWorker()
    await writeAudit({ actor, actorType: 'admin', action: 'flow.run_manual', entityType: 'flow', metadata: r, ip })
    return NextResponse.json({ ok: true, ...r })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const id = await createFlow(parsed.data.name, parsed.data.steps)
  await writeAudit({ actor, actorType: 'admin', action: 'flow.create', entityType: 'flow', entityId: id, metadata: { name: parsed.data.name, steps: parsed.data.steps.length }, ip })
  return NextResponse.json({ ok: true, id })
}
