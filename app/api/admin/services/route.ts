import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { parseServiceBody, slugify } from '@/lib/admin/services'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('orders', 'edit')
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
