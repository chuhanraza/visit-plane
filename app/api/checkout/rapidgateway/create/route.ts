import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServiceClient } from '@/lib/supabase/admin'
import { COUNTRIES } from '@/app/visa-checker/data'
import { rateLimit, clientKey } from '@/lib/rateLimit'
import {
  PREMIUM_REPORT_PRICE_PKR, createHostedCheckout, logMode, newBasketId, normalizePkMobile,
} from '@/lib/payments/rapidgateway'

export const dynamic = 'force-dynamic'

const Body = z.object({
  passport: z.string().refine((c) => COUNTRIES.includes(c), 'Unknown passport country'),
  destination: z.string().refine((c) => COUNTRIES.includes(c), 'Unknown destination'),
  email: z.string().trim().toLowerCase().email().max(200),
  mobile: z.string().trim().max(20),
})

/** Creates a pending order, opens a RapidGateway hosted checkout, returns the URL to redirect to. */
export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, 'rg-create'), 8, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 })
  }
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
  }
  const { passport, destination, email } = parsed.data
  if (passport === destination) return NextResponse.json({ error: 'Choose two different countries' }, { status: 400 })
  const mobile = normalizePkMobile(parsed.data.mobile)
  if (!mobile) return NextResponse.json({ error: 'Enter a valid Pakistani mobile number (03XXXXXXXXX)' }, { status: 400 })

  logMode('create')
  const db = getServiceClient()
  // New basket_id on EVERY attempt: the gateway rejects a reused BASKET_ID as a duplicate.
  const basketId = newBasketId()
  const { error: insErr } = await db.from('premium_report_orders').insert({
    basket_id: basketId, status: 'pending', passport_country: passport, destination_country: destination,
    customer_email: email, customer_mobile: mobile, amount: PREMIUM_REPORT_PRICE_PKR, currency: 'PKR',
  })
  if (insErr) {
    console.error('[rapidgateway:create] order insert failed', insErr.message)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
  }

  try {
    const redirectUrl = await createHostedCheckout({ basketId, email, mobile })
    return NextResponse.json({ redirectUrl, orderId: basketId })
  } catch (e) {
    console.error('[rapidgateway:create] gateway error', e instanceof Error ? e.message : e)
    await db.from('premium_report_orders').update({ status: 'failed' }).eq('basket_id', basketId).eq('status', 'pending')
    return NextResponse.json({ error: 'Payment gateway is unavailable. Please try again.' }, { status: 502 })
  }
}
