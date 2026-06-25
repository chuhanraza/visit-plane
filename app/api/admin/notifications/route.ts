import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { recentActivity, getLastSeen, setSeen, countUnread } from '@/lib/admin/notifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [activity, lastSeen] = await Promise.all([recentActivity(40), getLastSeen()])
  return NextResponse.json({ activity, lastSeen, unread: countUnread(activity, lastSeen) })
}

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const lastSeen = await setSeen(actor)
  return NextResponse.json({ ok: true, lastSeen })
}
