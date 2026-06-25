import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/, 'code: 3-40 chars A-Z 0-9 _ -'),
  description: z.string().trim().max(200).nullish(),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.coerce.number().min(0).max(1_000_000),
  currency: z.string().trim().toUpperCase().length(3).default('USD'),
  max_redemptions: z.coerce.number().int().min(1).max(1_000_000).nullish(),
  valid_from: z.string().datetime().nullish().or(z.literal('')),
  valid_until: z.string().datetime().nullish().or(z.literal('')),
  active: z.coerce.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('revenue', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'toggle') {
    const p = z.object({ id: z.string().uuid(), active: z.coerce.boolean() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    await svc.from('promo_codes').update({ active: p.data.active }).eq('id', p.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'promo.toggle', entityType: 'promo_code', entityId: p.data.id, metadata: { active: p.data.active }, ip })
    return NextResponse.json({ ok: true })
  }
  if (body?.op === 'delete') {
    const p = z.object({ id: z.string().uuid() }).safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await svc.from('promo_codes').delete().eq('id', p.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'promo.delete', entityType: 'promo_code', entityId: p.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const d = parsed.data
  if (d.discount_type === 'percent' && d.discount_value > 100) return NextResponse.json({ error: 'Percent discount cannot exceed 100' }, { status: 400 })
  const insert = {
    code: d.code, description: d.description || null, discount_type: d.discount_type, discount_value: d.discount_value,
    currency: d.currency, max_redemptions: d.max_redemptions ?? null,
    valid_from: d.valid_from || null, valid_until: d.valid_until || null, active: d.active,
  }
  const { data, error } = await svc.from('promo_codes').insert(insert).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'That code already exists' : error.message }, { status: 400 })
  await writeAudit({ actor, actorType: 'admin', action: 'promo.create', entityType: 'promo_code', entityId: (data as { id: string })?.id, metadata: insert, ip })
  return NextResponse.json({ ok: true, id: (data as { id: string })?.id })
}
