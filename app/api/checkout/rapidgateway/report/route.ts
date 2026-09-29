import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { buildPremiumReport } from '@/lib/premiumReport'

export const dynamic = 'force-dynamic'

/** Returns the report ONLY for orders the webhook has marked paid. */
export async function GET(req: NextRequest) {
  const order = req.nextUrl.searchParams.get('order') ?? ''
  if (!/^VP-\d{10,16}-[A-Z0-9]{6}$/.test(order)) return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
  const { data } = await getServiceClient()
    .from('premium_report_orders').select('status,passport_country,destination_country').eq('basket_id', order).maybeSingle()
  if (!data || data.status !== 'paid') return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 })
  return NextResponse.json(buildPremiumReport(data.passport_country, data.destination_country), { headers: { 'Cache-Control': 'no-store' } })
}
