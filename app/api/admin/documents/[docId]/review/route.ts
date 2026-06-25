import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, ctx: { params: Promise<{ docId: string }> }) {
  const actor = await requirePermissionApi('orders', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { docId } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const status = body.status
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid review status' }, { status: 400 })
  }

  const svc = getServiceClient()
  const { data: doc, error } = await svc.from('order_documents')
    .update({ status, reviewed_by: actor, reviewed_at: new Date().toISOString() })
    .eq('id', docId).select('order_id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: 'document.reviewed',
    entityType: 'order', entityId: doc.order_id as string,
    metadata: { document_id: docId, status },
  })
  return NextResponse.json({ ok: true, status })
}
