import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { PARTNER_TYPES } from '@/lib/admin/affiliates'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,40}$/, 'slug: 2-40 chars a-z0-9_-'),
  name: z.string().trim().min(1).max(80),
  type: z.enum(PARTNER_TYPES),
  commission_rate: z.coerce.number().nonnegative().max(100),
  commission_model: z.string().trim().max(60).nullish(),
  tracking_link: z.string().trim().max(500).nullish(),
  active: z.coerce.boolean(),
  notes: z.string().trim().max(1000).nullish(),
})

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  const d = parsed.data
  const svc = getServiceClient()
  const row = {
    slug: d.slug, name: d.name, type: d.type,
    commission_rate: d.commission_rate, commission_model: d.commission_model || null,
    tracking_link: d.tracking_link || null, active: d.active, notes: d.notes || null,
    updated_at: new Date().toISOString(),
  }

  let result
  if (d.id) {
    result = await svc.from('affiliate_partners').update(row).eq('id', d.id).select('*').maybeSingle()
  } else {
    result = await svc.from('affiliate_partners').upsert(row, { onConflict: 'slug' }).select('*').maybeSingle()
  }
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: d.id ? 'affiliate_partner.update' : 'affiliate_partner.create',
    entityType: 'affiliate_partner', entityId: (result.data as { id: string })?.id ?? d.slug,
    metadata: { ...row }, ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, partner: result.data })
}
