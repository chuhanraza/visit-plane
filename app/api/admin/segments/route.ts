import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { resolveSegment, type SegmentDef } from '@/lib/admin/segments'

export const dynamic = 'force-dynamic'

const ConditionSchema = z.object({
  type: z.enum(['source', 'status', 'captured_within_days', 'destination', 'has_tag', 'did_metric']),
  value: z.string().trim().max(120),
  days: z.coerce.number().int().min(1).max(3650).optional(),
})
const DefSchema = z.object({ match: z.enum(['all', 'any']).default('all'), conditions: z.array(ConditionSchema).max(20) })
const CreateSchema = z.object({ name: z.string().trim().min(1).max(80), definition: DefSchema })
const DeleteSchema = z.object({ op: z.literal('delete'), id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'delete') {
    const parsed = DeleteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await svc.from('marketing_segments').delete().eq('id', parsed.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'segment.delete', entityType: 'segment', entityId: parsed.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  if (body?.op === 'preview') {
    const parsed = DefSchema.safeParse(body.definition)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid definition' }, { status: 400 })
    const r = await resolveSegment(parsed.data as SegmentDef)
    return NextResponse.json({ ok: true, count: r.count, sample: r.sample })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const { data, error } = await svc.from('marketing_segments')
    .insert({ name: parsed.data.name, definition: parsed.data.definition, created_by: actor }).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit({ actor, actorType: 'admin', action: 'segment.create', entityType: 'segment', entityId: (data as { id: string })?.id, metadata: { name: parsed.data.name }, ip })
  return NextResponse.json({ ok: true, id: (data as { id: string })?.id })
}
