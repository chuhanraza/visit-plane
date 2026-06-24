import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { parseServiceBody } from '../route'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))

  // Allow a lightweight active-only toggle, or a full update.
  const svc = getServiceClient()
  if (Object.keys(body).length === 1 && 'active' in body) {
    const { error } = await svc.from('services').update({ active: body.active === true }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await writeAudit({ actor, actorType: 'admin', action: 'service.toggled', entityType: 'service', entityId: id, metadata: { active: body.active === true } })
    return NextResponse.json({ ok: true })
  }

  const parsed = parseServiceBody(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 422 })
  const { error } = await svc.from('services').update(parsed.value).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit({ actor, actorType: 'admin', action: 'service.updated', entityType: 'service', entityId: id })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const svc = getServiceClient()
  const { error } = await svc.from('services').delete().eq('id', id)
  if (error) {
    // FK restrict => service is referenced by existing orders. Deactivate instead.
    await svc.from('services').update({ active: false }).eq('id', id)
    await writeAudit({ actor, actorType: 'admin', action: 'service.deactivated', entityType: 'service', entityId: id, metadata: { reason: 'in_use' } })
    return NextResponse.json({ ok: true, deactivated: true, note: 'Service is used by existing orders, so it was deactivated instead of deleted.' })
  }
  await writeAudit({ actor, actorType: 'admin', action: 'service.deleted', entityType: 'service', entityId: id })
  return NextResponse.json({ ok: true, deleted: true })
}
