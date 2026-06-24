import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

export function parseServiceBody(body: Record<string, unknown>) {
  const country_name = String(body.country_name ?? '').trim()
  const visa_type = String(body.visa_type ?? '').trim()
  if (country_name.length < 2 || visa_type.length < 2) return { error: 'Country and visa type are required' as const }
  const num = (v: unknown, d = 0) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : d }
  const reqDocs = Array.isArray(body.required_documents)
    ? (body.required_documents as unknown[]).map(d => {
        const o = d as Record<string, unknown>
        return { key: slugify(String(o.key ?? o.label ?? 'doc')), label: String(o.label ?? o.key ?? 'Document').slice(0, 120), required: o.required !== false }
      }).slice(0, 30)
    : []
  return {
    value: {
      country_iso: String(body.country_iso ?? '').toUpperCase().slice(0, 2) || 'XX',
      country_name, visa_type,
      description: body.description ? String(body.description).slice(0, 1000) : null,
      govt_fee: num(body.govt_fee), service_fee: num(body.service_fee),
      currency: String(body.currency ?? 'USD').toUpperCase().slice(0, 3),
      processing_days_min: Math.max(0, parseInt(String(body.processing_days_min ?? 1), 10) || 1),
      processing_days_max: Math.max(1, parseInt(String(body.processing_days_max ?? 30), 10) || 30),
      required_documents: reqDocs,
      active: body.active !== false,
      is_test: body.is_test === true,
    },
  }
}

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = parseServiceBody(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 422 })

  const svc = getServiceClient()
  const baseSlug = slugify(`${parsed.value.country_name}-${parsed.value.visa_type}`) || `service-${Date.now()}`
  const { data, error } = await svc.from('services')
    .insert({ ...parsed.value, slug: `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` })
    .select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({ actor, actorType: 'admin', action: 'service.created', entityType: 'service', entityId: data.id, metadata: { country: parsed.value.country_name, visa_type: parsed.value.visa_type } })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
