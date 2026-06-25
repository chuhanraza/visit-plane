import { NextRequest, NextResponse } from 'next/server'
import { requirePermissionApi } from '@/lib/admin/guard'
import { leadsForExport, optInStatus, type OptInStatus } from '@/lib/admin/leads'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function csvCell(v: unknown): string {
  const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  const actor = await requirePermissionApi('leads', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const status = (sp.get('status') ?? '') as OptInStatus | ''
  const rows = await leadsForExport({
    q: sp.get('q') ?? undefined,
    source: sp.get('source') ?? undefined,
    status: status || undefined,
  })

  const headers = ['email', 'source', 'opt_in_status', 'passport', 'destination', 'lead_magnet', 'captured_at', 'confirmed_at', 'unsubscribed_at', 'tags', 'note']
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push([
      r.email, r.captured_from, optInStatus(r), r.route_passport, r.route_destination, r.lead_magnet,
      r.captured_at, r.confirmed_at, r.unsubscribed_at, r.admin_tags, r.admin_note,
    ].map(csvCell).join(','))
  }

  await writeAudit({
    actor, actorType: 'admin', action: 'lead.export_csv',
    entityType: 'lead', metadata: { count: rows.length, filters: { q: sp.get('q'), source: sp.get('source'), status } },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })

  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="visitplane-leads-${stamp}.csv"`,
    },
  })
}
