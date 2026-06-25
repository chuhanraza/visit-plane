import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { leadTimeline } from '@/lib/admin/events'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('leads', 'view')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const leadId = Number(id)
  if (!Number.isInteger(leadId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const svc = getServiceClient()
  const { data } = await svc.from('email_subscribers').select('email').eq('id', leadId).maybeSingle()
  if (!data) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  const timeline = await leadTimeline((data as { email: string }).email)
  return NextResponse.json({ timeline })
}
