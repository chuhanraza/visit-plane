import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(60),
  config: z.object({
    q: z.string().max(120).optional(),
    source: z.string().max(120).optional(),
    status: z.string().max(20).optional(),
  }),
})

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('leads', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'delete') {
    const p = z.object({ id: z.string().uuid() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await svc.from('saved_reports').delete().eq('id', p.data.id).eq('kind', 'leads')
    await writeAudit({ actor, actorType: 'admin', action: 'lead_view.delete', entityType: 'saved_report', entityId: p.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const { data, error } = await svc.from('saved_reports')
    .insert({ name: parsed.data.name, kind: 'leads', config: parsed.data.config, created_by: actor }).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit({ actor, actorType: 'admin', action: 'lead_view.create', entityType: 'saved_report', entityId: (data as { id: string })?.id, metadata: { name: parsed.data.name }, ip })
  return NextResponse.json({ ok: true, id: (data as { id: string })?.id })
}
