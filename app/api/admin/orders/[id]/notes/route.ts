import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('orders', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 5000) : ''

  const svc = getServiceClient()
  const { error } = await svc.from('orders').update({ internal_notes: notes }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({ actor, actorType: 'admin', action: 'order.notes_updated', entityType: 'order', entityId: id })
  return NextResponse.json({ ok: true })
}
