import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { fetchAllSubscribers, fetchFilteredSubscribers, hasActiveFilters, type SubscriberFilters } from '@/lib/admin/subscribers'

export const dynamic = 'force-dynamic'

function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
}

export async function GET(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const filters: SubscriberFilters = {
    q: sp.get('q') ?? undefined,
    confirmed: sp.get('confirmed') ?? undefined,
    unsub: sp.get('unsub') ?? undefined,
    passport: sp.get('passport') ?? undefined,
  }

  const rows = hasActiveFilters(filters)
    ? await fetchFilteredSubscribers(filters)
    : await fetchAllSubscribers()

  const csvRows = [
    ['email', 'passport', 'destination', 'captured_from', 'captured_at', 'confirmed_at', 'unsubscribed_at', 'admin_tags', 'admin_note'],
    ...rows.map(s => [
      s.email,
      s.route_passport ?? '',
      s.route_destination ?? '',
      s.captured_from ?? '',
      s.captured_at ?? '',
      s.confirmed_at ?? '',
      s.unsubscribed_at ?? '',
      (s.admin_tags ?? []).join('; '),
      s.admin_note ?? '',
    ]),
  ]

  const csv = toCsv(csvRows)
  const filename = `visitplane_subscribers_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
