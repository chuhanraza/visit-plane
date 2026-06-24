import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { createSubmittedOrder } from '@/lib/orders/service'
import { sendOrderConfirmation } from '@/lib/email'
import type { TravelerInput } from '@/lib/orders/types'

export const dynamic = 'force-dynamic'

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip') || null
}

function validTravelers(input: unknown): TravelerInput[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) return null
  const out: TravelerInput[] = []
  for (const t of input) {
    if (!t || typeof t !== 'object') return null
    const name = String((t as Record<string, unknown>).full_name ?? '').trim()
    const pass = String((t as Record<string, unknown>).passport_number ?? '').trim()
    if (name.length < 2 || name.length > 120) return null
    if (pass.length < 4 || pass.length > 40) return null
    const r = t as Record<string, unknown>
    out.push({
      full_name: name,
      passport_number: pass,
      dob: r.dob ? String(r.dob) : null,
      nationality: r.nationality ? String(r.nationality).slice(0, 80) : null,
      passport_expiry: r.passport_expiry ? String(r.passport_expiry) : null,
    })
  }
  return out
}

export async function POST(req: NextRequest) {
  // 1. Authenticated customer only
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  // 2. Validate body
  const body = await req.json().catch(() => null)
  if (!body || typeof body.serviceId !== 'string') {
    return NextResponse.json({ error: 'serviceId is required' }, { status: 400 })
  }
  const travelers = validTravelers(body.travelers)
  if (!travelers) {
    return NextResponse.json({ error: 'Provide 1–20 travellers, each with a name and passport number' }, { status: 422 })
  }

  // 3. Resolve (or create) the customer record for this user
  const svc = getServiceClient()
  let { data: customer } = await svc.from('customers').select('id, email').eq('user_id', user.id).maybeSingle()
  if (!customer) {
    const { data: created, error } = await svc.from('customers')
      .insert({ user_id: user.id, email: user.email ?? '' }).select('id, email').single()
    if (error) return NextResponse.json({ error: 'Could not create customer profile' }, { status: 500 })
    customer = created
  }

  // 4. Create the order
  try {
    const result = await createSubmittedOrder({
      customerId: customer.id,
      contactEmail: customer.email || user.email || '',
      serviceId: body.serviceId,
      travelers,
      actor: `customer:${user.email ?? user.id}`,
      actorType: 'customer',
      ip: clientIp(req),
    })

    // 5. Confirmation email (best-effort)
    const { data: service } = await svc.from('services').select('country_name, visa_type').eq('id', body.serviceId).maybeSingle()
    await sendOrderConfirmation(customer.email || user.email || '', {
      orderRef: result.orderRef, orderId: result.orderId,
      total: result.total, currency: result.currency,
      serviceName: service ? `${service.country_name} — ${service.visa_type}` : 'Visa service',
      travelers: travelers.length,
    })

    return NextResponse.json({ orderId: result.orderId, orderRef: result.orderRef }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 })
  }
}
