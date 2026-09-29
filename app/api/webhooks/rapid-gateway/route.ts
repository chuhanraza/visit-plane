import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getServiceClient } from '@/lib/supabase/admin'
import { PREMIUM_REPORT_PRICE_PKR, RAPIDGATEWAY_MODE, logMode } from '@/lib/payments/rapidgateway'

export const dynamic = 'force-dynamic'

/**
 * RapidGateway webhook — the ONLY thing allowed to mark an order paid.
 * expected = HMAC_SHA256(salt, `${timestamp}.${rawBody}`) hex UPPERCASE over the RAW bytes
 * (body read with req.text() before any JSON.parse). Rejects bad/missing signature or
 * |now - timestamp| > 300s with 401. De-duplicates on eventId.
 */
function reject(reason: string) {
  console.warn(`[rapidgateway:webhook] REJECTED: ${reason}`)
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

interface Payload {
  eventId?: string; eventType?: string; merchantTransactionId?: string; gatewayTxnRef?: string
  status?: string; amount?: string | number; currency?: string; environment?: string
}

export async function POST(req: NextRequest) {
  const salt = process.env.RAPIDGATEWAY_WEBHOOK_SIGNING_SALT
  if (!salt) return reject('RAPIDGATEWAY_WEBHOOK_SIGNING_SALT not configured (failing closed)')

  const raw = await req.text()
  const sig = req.headers.get('x-rapidgateway-signature')
  const ts = req.headers.get('x-rapidgateway-timestamp')
  if (!sig || !ts) return reject('missing signature/timestamp header')

  let tsNum = Number(ts)
  if (!Number.isFinite(tsNum)) return reject('non-numeric timestamp')
  if (tsNum > 1e12) tsNum /= 1000 // tolerate milliseconds
  if (Math.abs(Date.now() / 1000 - tsNum) > 300) return reject('timestamp outside 300s window')

  const expected = createHmac('sha256', salt).update(`${ts}.${raw}`).digest('hex').toUpperCase()
  const a = Buffer.from(sig.trim().toUpperCase()), b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return reject('signature mismatch')

  let p: Payload
  try { p = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  logMode('webhook')

  const basket = p.merchantTransactionId
  const eventId = p.eventId
  if (!basket || !eventId) return NextResponse.json({ ok: true, ignored: 'missing ids' })

  // A TEST event must never confirm a live order (and vice versa).
  const envOk = (p.environment ?? '').toUpperCase() === (RAPIDGATEWAY_MODE === 'live' ? 'LIVE' : 'TEST')
  if (!envOk) {
    console.warn(`[rapidgateway:webhook] ignoring ${p.environment} event while mode=${RAPIDGATEWAY_MODE}`)
    return NextResponse.json({ ok: true, ignored: 'environment mismatch' })
  }

  const db = getServiceClient()
  const { data: order } = await db.from('premium_report_orders')
    .select('id,status,amount,webhook_event_id').eq('basket_id', basket).maybeSingle()
  if (!order) { console.warn(`[rapidgateway:webhook] unknown basket ${basket}`); return NextResponse.json({ ok: true, ignored: 'unknown order' }) }
  if (order.webhook_event_id === eventId) return NextResponse.json({ ok: true, duplicate: true })

  if (p.eventType === 'transaction.completed') {
    const amt = Number(p.amount)
    if ((p.currency && p.currency !== 'PKR') || !Number.isFinite(amt) || Math.abs(amt - PREMIUM_REPORT_PRICE_PKR) > 0.001) {
      console.error(`[rapidgateway:webhook] amount/currency mismatch for ${basket}: ${p.amount} ${p.currency}`)
      return NextResponse.json({ ok: true, ignored: 'amount mismatch' })
    }
    const { error } = await db.from('premium_report_orders').update({
      status: 'paid', paid_at: new Date().toISOString(), gateway_txn_ref: p.gatewayTxnRef ?? null, webhook_event_id: eventId,
    }).eq('id', order.id)
    if (error?.code === '23505') return NextResponse.json({ ok: true, duplicate: true })
    if (error) { console.error('[rapidgateway:webhook] update failed', error.message); return NextResponse.json({ error: 'Retry' }, { status: 500 }) }
  } else if (p.eventType === 'transaction.failed') {
    if (order.status !== 'paid') { // never downgrade a paid order
      const { error } = await db.from('premium_report_orders').update({
        status: 'failed', gateway_txn_ref: p.gatewayTxnRef ?? null, webhook_event_id: eventId,
      }).eq('id', order.id).neq('status', 'paid')
      if (error && error.code !== '23505') { console.error('[rapidgateway:webhook] update failed', error.message); return NextResponse.json({ error: 'Retry' }, { status: 500 }) }
    }
  }
  return NextResponse.json({ ok: true })
}
