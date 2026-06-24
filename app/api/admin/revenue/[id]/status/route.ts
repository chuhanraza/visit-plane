import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { MANUAL_ORDER_STATUSES } from '@/lib/admin/revenue'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  status: z.enum(MANUAL_ORDER_STATUSES),
  note: z.string().trim().max(500).optional(),
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  const svc = getServiceClient()
  const { data: before } = await svc.from('manual_orders').select('id, order_ref, status, fulfilled_at').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const b = before as { id: string; order_ref: string; status: string; fulfilled_at: string | null }
  const patch: Record<string, unknown> = { status: parsed.data.status }
  if (parsed.data.status === 'paid' && !b.fulfilled_at) patch.fulfilled_at = new Date().toISOString()

  const { data: after, error } = await svc.from('manual_orders').update(patch).eq('id', id).select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: 'manual_order.status_change',
    entityType: 'manual_order', entityId: id,
    metadata: { order_ref: b.order_ref, from: b.status, to: parsed.data.status, note: parsed.data.note ?? null },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, order: after })
}
