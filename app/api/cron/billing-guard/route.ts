import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { sendInternalEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Billing circuit-breaker check. Runs every 15 min via the Worker's cron
 * trigger (worker-entry.ts `scheduled`, event.cron === '*\/15 * * * *').
 *
 * SAFETY GATE: defaults to dry-run/alert-only. Real trips require BOTH
 * usage over threshold AND BILLING_GUARD_ARMED === 'true' (wrangler.jsonc
 * vars, hand-edited + redeployed — never an app_settings toggle, so a bug in
 * this route's own logic can't arm itself). Unarmed, a would-trip is logged
 * and emailed but ops_circuit_breaker_state.maintenance_active is left
 * untouched. Clearing the flag when the cycle rolls over is NOT gated on
 * armed — that direction only ever restores normal service, never harms it.
 *
 * Cost source: Cloudflare's Billable Usage API
 * (GET /accounts/{id}/billable-usage, requires a Billing:Read-scoped token —
 * see CLOUDFLARE_BILLING_API_TOKEN below). It reports one row per service
 * line for the current billing period; the flat $5/mo Workers Paid
 * subscription itself is its own line (not usage), so it's excluded by name
 * from the sum — everything else is "usage cost" per the task definition.
 * If Cloudflare renames/adds a flat-fee line this exclusion list needs a
 * matching update (logged in metadata.rawUsage below so a human can verify).
 */

const FLAT_FEE_SERVICE_NAMES = new Set(['Workers Paid', 'Workers Standard'])

interface BillableUsageRow {
  ServiceName: string
  ContractedCost?: number
  CumulatedContractedCost?: number
}

async function authorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth === `Bearer ${secret}` || req.nextUrl.searchParams.get('secret') === secret) return true
  }
  return !!(await requireAdminApi())
}

async function fetchCycleUsageCostUsd(): Promise<{ costUsd: number; raw: BillableUsageRow[] } | { error: string }> {
  const token = process.env.CLOUDFLARE_BILLING_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!token || !accountId) return { error: 'CLOUDFLARE_BILLING_API_TOKEN or CLOUDFLARE_ACCOUNT_ID not configured' }

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/billable-usage`, {
    headers: { authorization: `Bearer ${token}` },
  })
  if (!res.ok) return { error: `Cloudflare billable-usage API returned ${res.status}` }
  const body = (await res.json()) as { success: boolean; result?: BillableUsageRow[]; errors?: unknown }
  if (!body.success || !body.result) return { error: `Cloudflare billable-usage API: ${JSON.stringify(body.errors ?? body)}` }

  const usageRows = body.result.filter((r) => !FLAT_FEE_SERVICE_NAMES.has(r.ServiceName))
  const costUsd = usageRows.reduce((sum, r) => sum + (r.CumulatedContractedCost ?? r.ContractedCost ?? 0), 0)
  return { costUsd, raw: body.result }
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = getServiceClient()
  const armed = (process.env.BILLING_GUARD_ARMED as string) === 'true'
  const threshold = Number(process.env.BILLING_GUARD_THRESHOLD_USD ?? '0.50')
  const alertEmail = process.env.BILLING_GUARD_ALERT_EMAIL

  const { data: state } = await svc
    .from('ops_circuit_breaker_state')
    .select('maintenance_active')
    .eq('id', 1)
    .maybeSingle()
  const currentlyActive = state?.maintenance_active === true

  const usage = await fetchCycleUsageCostUsd()
  if ('error' in usage) {
    await writeAudit({
      actor: 'system', actorType: 'system', action: 'billing_circuit_breaker_check',
      metadata: { decision: 'error', reason: usage.error, armed, threshold },
    })
    return NextResponse.json({ ok: false, decision: 'error', reason: usage.error })
  }

  const overThreshold = usage.costUsd > threshold
  let decision: 'pass' | 'would_trip' | 'tripped' | 'would_clear' | 'cleared' = 'pass'

  if (overThreshold && !currentlyActive) {
    decision = armed ? 'tripped' : 'would_trip'
  } else if (!overThreshold && currentlyActive) {
    decision = 'cleared' // clearing is always allowed regardless of armed — safe direction
  } else if (overThreshold && currentlyActive) {
    decision = armed ? 'tripped' : 'would_trip' // stays tripped/would-stay-tripped, still logged each tick
  }

  if (decision === 'tripped' || decision === 'cleared') {
    await svc.from('ops_circuit_breaker_state').update({
      maintenance_active: decision === 'tripped',
      last_cycle_cost_usd: usage.costUsd,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
  } else {
    await svc.from('ops_circuit_breaker_state').update({
      last_cycle_cost_usd: usage.costUsd,
      last_checked_at: new Date().toISOString(),
    }).eq('id', 1)
  }

  await writeAudit({
    actor: 'system', actorType: 'system', action: 'billing_circuit_breaker_check',
    metadata: { decision, cycleCostUsd: usage.costUsd, threshold, armed, rawUsage: usage.raw },
  })

  if (alertEmail && (decision === 'tripped' || decision === 'would_trip' || decision === 'cleared')) {
    const subject = decision === 'tripped'
      ? `🔴 VisitPlane maintenance mode TRIPPED — usage cost $${usage.costUsd.toFixed(2)}`
      : decision === 'would_trip'
        ? `⚠️ VisitPlane would trip (dry-run) — usage cost $${usage.costUsd.toFixed(2)}`
        : `✅ VisitPlane usage back under threshold — maintenance mode cleared`
    const html = `<p>Cycle usage cost: <strong>$${usage.costUsd.toFixed(2)}</strong> (threshold $${threshold.toFixed(2)}).</p>
      <p>Armed: <strong>${armed}</strong>. Decision: <strong>${decision}</strong>.</p>
      ${decision === 'would_trip' ? '<p>Dry-run mode — the maintenance flag was NOT changed. Set BILLING_GUARD_ARMED=true in wrangler.jsonc and redeploy to arm real trips.</p>' : ''}`
    await sendInternalEmail(alertEmail, subject, html)
  }

  return NextResponse.json({ ok: true, decision, cycleCostUsd: usage.costUsd, threshold, armed })
}
