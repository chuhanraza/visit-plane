import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServiceClient } from '@/lib/supabase/admin'
import { verifyApiKey } from '@/lib/admin/apikeys'
import { writeAudit } from '@/lib/audit'
import { fireWebhooks } from '@/lib/admin/webhooks'

export const dynamic = 'force-dynamic'

/**
 * PUBLIC affiliate conversion postback. Partners call this (GET pixel or POST)
 * when a conversion is confirmed. Authenticated by a scoped API key
 * (scope: affiliate:write) passed via ?key=, Authorization: Bearer, or x-api-key.
 * Inserts an affiliate_conversions row, audits, and fires the affiliate.conversion
 * webhook. NEVER trusts the caller beyond the validated key + known partner.
 */

const Schema = z.object({
  partner_slug: z.string().trim().toLowerCase().min(2).max(40),
  amount: z.coerce.number().nonnegative().max(1_000_000),
  commission_amount: z.coerce.number().nonnegative().max(1_000_000).default(0),
  currency: z.string().trim().toUpperCase().length(3).default('USD'),
  external_ref: z.string().trim().max(120).optional(),
  customer_email: z.string().trim().email().max(200).optional(),
  status: z.enum(['pending', 'confirmed', 'paid', 'rejected']).default('confirmed'),
  source: z.string().trim().max(120).optional(),
})

function extractKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim()
  return req.headers.get('x-api-key') || req.nextUrl.searchParams.get('key')
}

async function handle(req: NextRequest, raw: Record<string, unknown>) {
  const auth = await verifyApiKey(extractKey(req), 'affiliate:write')
  if (!auth.ok) return NextResponse.json({ error: 'Invalid or unauthorized API key' }, { status: 401 })

  const parsed = Schema.safeParse({
    partner_slug: raw.partner_slug ?? raw.partner,
    amount: raw.amount,
    commission_amount: raw.commission_amount ?? raw.commission,
    currency: raw.currency,
    external_ref: raw.external_ref ?? raw.ref ?? raw.order_id,
    customer_email: raw.customer_email ?? raw.email,
    status: raw.status,
    source: raw.source,
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid params' }, { status: 400 })
  const d = parsed.data

  const svc = getServiceClient()
  const { data: partner } = await svc.from('affiliate_partners').select('slug').eq('slug', d.partner_slug).maybeSingle()
  if (!partner) return NextResponse.json({ error: `Unknown partner: ${d.partner_slug}` }, { status: 400 })

  // Idempotency: a repeat postback with the same partner + external_ref is a no-op.
  if (d.external_ref) {
    const { data: dupe } = await svc.from('affiliate_conversions')
      .select('id').eq('partner_slug', d.partner_slug).eq('external_ref', d.external_ref).maybeSingle()
    if (dupe) return NextResponse.json({ ok: true, id: (dupe as { id: string }).id, deduplicated: true })
  }

  const insert = {
    partner_slug: d.partner_slug, amount: d.amount, commission_amount: d.commission_amount,
    currency: d.currency, external_ref: d.external_ref ?? null, customer_email: d.customer_email ?? null,
    status: d.status, source: d.source ?? 'postback',
  }
  const { data, error } = await svc.from('affiliate_conversions').insert(insert).select('id').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  await writeAudit({ actor: `apikey:${auth.name}`, actorType: 'system', action: 'affiliate_conversion.postback', entityType: 'affiliate_conversion', entityId: (data as { id: string })?.id, metadata: insert, ip })
  await fireWebhooks('affiliate.conversion', { id: (data as { id: string })?.id, ...insert })

  return NextResponse.json({ ok: true, id: (data as { id: string })?.id })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  return handle(req, body as Record<string, unknown>)
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  return handle(req, params)
}
