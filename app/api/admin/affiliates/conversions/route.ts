import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { CONVERSION_STATUSES } from '@/lib/admin/affiliates'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  partner_slug: z.string().trim().toLowerCase().min(2).max(40),
  amount: z.coerce.number().nonnegative().max(1_000_000),
  currency: z.string().trim().toUpperCase().length(3).default('USD'),
  commission_amount: z.coerce.number().nonnegative().max(1_000_000).default(0),
  customer_email: z.string().trim().email().max(200).nullish().or(z.literal('')),
  external_ref: z.string().trim().max(120).nullish(),
  status: z.enum(CONVERSION_STATUSES).default('pending'),
  source: z.string().trim().max(120).nullish(),
  note: z.string().trim().max(1000).nullish(),
})

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  const d = parsed.data
  const svc = getServiceClient()
  // Validate partner exists to keep the ledger clean.
  const { data: partner } = await svc.from('affiliate_partners').select('slug').eq('slug', d.partner_slug).maybeSingle()
  if (!partner) return NextResponse.json({ error: `Unknown partner: ${d.partner_slug}` }, { status: 400 })

  const insert = {
    partner_slug: d.partner_slug, amount: d.amount, currency: d.currency,
    commission_amount: d.commission_amount, customer_email: d.customer_email || null,
    external_ref: d.external_ref || null, status: d.status, source: d.source || null, note: d.note || null,
  }
  const { data, error } = await svc.from('affiliate_conversions').insert(insert).select('*').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: 'affiliate_conversion.create',
    entityType: 'affiliate_conversion', entityId: (data as { id: string }).id,
    metadata: { ...insert }, ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, conversion: data })
}
