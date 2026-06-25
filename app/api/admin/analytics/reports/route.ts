import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  kind: z.enum(['analytics', 'leads', 'revenue', 'custom']).default('analytics'),
  config: z.record(z.string(), z.unknown()).default({}),
})
const DeleteSchema = z.object({ op: z.literal('delete'), id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('analytics', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'delete') {
    const parsed = DeleteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const { error } = await svc.from('saved_reports').delete().eq('id', parsed.data.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await writeAudit({ actor, actorType: 'admin', action: 'report.delete', entityType: 'saved_report', entityId: parsed.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const { data, error } = await svc.from('saved_reports')
    .insert({ name: parsed.data.name, kind: parsed.data.kind, config: parsed.data.config, created_by: actor })
    .select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit({ actor, actorType: 'admin', action: 'report.create', entityType: 'saved_report', entityId: (data as { id: string })?.id, metadata: { name: parsed.data.name }, ip })
  return NextResponse.json({ ok: true, id: (data as { id: string })?.id })
}
