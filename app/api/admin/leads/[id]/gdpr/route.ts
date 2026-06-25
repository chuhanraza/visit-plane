import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { exportLeadData, eraseLeadData, emailHash } from '@/lib/admin/gdpr'

export const dynamic = 'force-dynamic'

async function emailForId(id: string): Promise<string | null> {
  const leadId = Number(id)
  if (!Number.isInteger(leadId)) return null
  const svc = getServiceClient()
  const { data } = await svc.from('email_subscribers').select('email').eq('id', leadId).maybeSingle()
  return (data as { email: string } | null)?.email ?? null
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('leads', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const email = await emailForId(id)
  if (!email) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const data = await exportLeadData(email)
  await writeAudit({
    actor, actorType: 'admin', action: 'gdpr.export', entityType: 'lead', entityId: id,
    metadata: { email_hash: emailHash(email) }, ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="gdpr-${emailHash(email).slice(0, 12)}.json"` },
  })
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('leads', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  if (body?.confirm !== true) return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })

  const email = await emailForId(id)
  if (!email) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  const hash = emailHash(email)
  const result = await eraseLeadData(email)
  // Audit AFTER erase, recording only the hash (the email is now gone).
  await writeAudit({
    actor, actorType: 'admin', action: 'gdpr.erase', entityType: 'lead',
    metadata: { email_hash: hash, ...result }, ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, ...result })
}
