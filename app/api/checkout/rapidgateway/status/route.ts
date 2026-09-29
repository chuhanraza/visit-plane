import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/** Reads OUR order row — only the verified webhook ever moves it off 'pending'. Returns status only (no PII). */
export async function GET(req: NextRequest) {
  const order = req.nextUrl.searchParams.get('order') ?? ''
  if (!/^VP-\d{10,16}-[A-Z0-9]{6}$/.test(order)) return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
  const { data, error } = await getServiceClient()
    .from('premium_report_orders').select('status').eq('basket_id', order).maybeSingle()
  if (error) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ status: data.status }, { headers: { 'Cache-Control': 'no-store' } })
}
