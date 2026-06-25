import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { globalSearch } from '@/lib/admin/search'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const hits = await globalSearch(q)
  return NextResponse.json({ hits })
}
