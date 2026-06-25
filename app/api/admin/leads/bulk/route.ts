import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { leadsByIds, optInStatus } from '@/lib/admin/leads'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1).max(1000),
  action: z.enum(['add_tag', 'remove_tag', 'export']),
  tag: z.string().trim().min(1).max(40).optional(),
})

function csvCell(v: unknown): string {
  const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('leads', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const { ids, action, tag } = parsed.data
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  const rows = await leadsByIds(ids)
  if (rows.length === 0) return NextResponse.json({ error: 'No matching leads' }, { status: 404 })

  if (action === 'export') {
    const headers = ['email', 'source', 'opt_in_status', 'passport', 'destination', 'lead_magnet', 'captured_at', 'tags', 'note']
    const lines = [headers.join(',')]
    for (const r of rows) lines.push([r.email, r.captured_from, optInStatus(r), r.route_passport, r.route_destination, r.lead_magnet, r.captured_at, r.admin_tags, r.admin_note].map(csvCell).join(','))
    await writeAudit({ actor, actorType: 'admin', action: 'lead.bulk_export', entityType: 'lead', metadata: { count: rows.length }, ip })
    const stamp = new Date().toISOString().slice(0, 10)
    return new NextResponse(lines.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="visitplane-leads-selected-${stamp}.csv"` } })
  }

  // add_tag / remove_tag
  if (!tag) return NextResponse.json({ error: 'tag is required' }, { status: 400 })
  const svc = getServiceClient()
  let changed = 0
  for (const r of rows) {
    const current = r.admin_tags ?? []
    const next = action === 'add_tag'
      ? (current.includes(tag) ? current : [...current, tag])
      : current.filter(t => t !== tag)
    if (next.length !== current.length) {
      await svc.from('email_subscribers').update({ admin_tags: next }).eq('id', r.id)
      changed++
    }
  }
  await writeAudit({ actor, actorType: 'admin', action: `lead.bulk_${action}`, entityType: 'lead', metadata: { tag, count: changed }, ip })
  return NextResponse.json({ ok: true, changed })
}
