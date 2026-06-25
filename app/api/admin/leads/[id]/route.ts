import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  admin_tags: z.array(z.string().trim().min(1).max(40)).max(25).optional(),
  admin_note: z.string().max(2000).nullable().optional(),
}).refine(b => b.admin_tags !== undefined || b.admin_note !== undefined, {
  message: 'Provide admin_tags and/or admin_note',
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('leads', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const leadId = Number(id)
  if (!Number.isInteger(leadId) || leadId <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  const svc = getServiceClient()
  const { data: before } = await svc.from('email_subscribers').select('id, email, admin_tags, admin_note').eq('id', leadId).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const patch: Record<string, unknown> = {}
  if (parsed.data.admin_tags !== undefined) patch.admin_tags = parsed.data.admin_tags
  if (parsed.data.admin_note !== undefined) patch.admin_note = parsed.data.admin_note

  const { data: after, error } = await svc.from('email_subscribers').update(patch).eq('id', leadId)
    .select('id, email, admin_tags, admin_note').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: 'lead.update_meta',
    entityType: 'lead', entityId: String(leadId),
    metadata: { email: (before as { email: string }).email, before, after },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, lead: after })
}
