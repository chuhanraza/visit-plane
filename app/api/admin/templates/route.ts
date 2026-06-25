import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  id: z.string().uuid().optional(),
  key: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,40}$/, 'key: 2-40 chars a-z0-9_-'),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(['transactional', 'marketing']).default('marketing'),
  subject: z.string().trim().min(1).max(200),
  body_html: z.string().trim().min(1).max(50000),
})
const DeleteSchema = z.object({ op: z.literal('delete'), id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('email', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const svc = getServiceClient()

  if (body?.op === 'delete') {
    const p = DeleteSchema.safeParse(body)
    if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await svc.from('email_templates').delete().eq('id', p.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'template.delete', entityType: 'email_template', entityId: p.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const d = parsed.data
  const row = { key: d.key, name: d.name, kind: d.kind, subject: d.subject, body_html: d.body_html, updated_by: actor, updated_at: new Date().toISOString() }
  const result = d.id
    ? await svc.from('email_templates').update(row).eq('id', d.id).select('id').maybeSingle()
    : await svc.from('email_templates').upsert(row, { onConflict: 'key' }).select('id').maybeSingle()
  if (result.error) return NextResponse.json({ error: result.error.code === '23505' ? 'That key already exists' : result.error.message }, { status: 400 })
  await writeAudit({ actor, actorType: 'admin', action: d.id ? 'template.update' : 'template.create', entityType: 'email_template', entityId: (result.data as { id: string })?.id, metadata: { key: d.key, name: d.name }, ip })
  return NextResponse.json({ ok: true, id: (result.data as { id: string })?.id })
}
