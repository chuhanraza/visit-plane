import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { fireWebhooks } from '@/lib/admin/webhooks'
import { MANUAL_ORDER_STATUSES, PRODUCT_TYPES } from '@/lib/admin/revenue'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  customer_email: z.string().trim().email().max(200),
  product_type: z.enum(PRODUCT_TYPES),
  amount: z.coerce.number().nonnegative().max(1_000_000),
  currency: z.string().trim().toUpperCase().length(3).default('USD'),
  status: z.enum(MANUAL_ORDER_STATUSES).default('pending'),
  affiliate_partner: z.string().trim().max(60).nullish(),
  commission_amount: z.coerce.number().nonnegative().max(1_000_000).default(0),
  source: z.string().trim().max(120).nullish(),
  notes: z.string().trim().max(2000).nullish(),
})

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = CreateSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  const d = parsed.data
  const svc = getServiceClient()
  const insert: Record<string, unknown> = {
    customer_email: d.customer_email,
    product_type: d.product_type,
    amount: d.amount,
    currency: d.currency,
    status: d.status,
    affiliate_partner: d.affiliate_partner || null,
    commission_amount: d.commission_amount,
    source: d.source || null,
    notes: d.notes || null,
    fulfilled_at: d.status === 'paid' ? new Date().toISOString() : null,
  }
  const { data, error } = await svc.from('manual_orders').insert(insert).select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: 'manual_order.create',
    entityType: 'manual_order', entityId: (data as { id: string }).id,
    metadata: { order_ref: (data as { order_ref: string }).order_ref, ...insert },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  await fireWebhooks('manual_order.created', { id: (data as { id: string })?.id, order_ref: (data as { order_ref: string })?.order_ref, ...insert })
  return NextResponse.json({ ok: true, order: data })
}
