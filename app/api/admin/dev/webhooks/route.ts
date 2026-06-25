import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { WEBHOOK_EVENTS } from '@/lib/admin/webhooks'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  url: z.string().trim().url().max(500),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
  description: z.string().trim().max(200).nullish(),
})
const DeleteSchema = z.object({ op: z.literal('delete'), id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('developers', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'delete') {
    const parsed = DeleteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await svc.from('webhook_endpoints').delete().eq('id', parsed.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'webhook.delete', entityType: 'webhook_endpoint', entityId: parsed.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const secret = `whsec_${randomBytes(24).toString('base64url')}`
  const { data, error } = await svc.from('webhook_endpoints')
    .insert({ url: parsed.data.url, events: parsed.data.events, description: parsed.data.description ?? null, secret })
    .select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit({ actor, actorType: 'admin', action: 'webhook.create', entityType: 'webhook_endpoint', entityId: (data as { id: string })?.id, metadata: { url: parsed.data.url, events: parsed.data.events }, ip })
  // secret returned once so the operator can configure verification downstream.
  return NextResponse.json({ ok: true, id: (data as { id: string })?.id, secret })
}
