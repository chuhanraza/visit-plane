import { createHmac } from 'crypto'
import { getServiceClient } from '@/lib/supabase/admin'
import { sleep } from '@/lib/admin/concurrency'

/**
 * Outbound webhooks. Operators register endpoints subscribed to events; when an
 * event fires we POST the payload signed with the endpoint secret (HMAC-SHA256
 * in the X-VisitPlane-Signature header) and log the delivery. Best-effort.
 * Service-role.
 */

export const WEBHOOK_EVENTS = ['lead.created', 'affiliate.conversion', 'manual_order.created', 'manual_order.status_change'] as const
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]

export interface EndpointRow {
  id: string; url: string; events: string[]; secret: string; active: boolean; description: string | null; created_at: string
}

export async function listEndpoints(): Promise<EndpointRow[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('webhook_endpoints').select('*').order('created_at', { ascending: false })
  return (data ?? []) as EndpointRow[]
}

export async function listDeliveries(limit = 50) {
  const svc = getServiceClient()
  const { data } = await svc.from('webhook_deliveries')
    .select('id, endpoint_id, event, status, response_code, error, created_at, delivered_at')
    .order('created_at', { ascending: false }).limit(limit)
  return (data ?? []) as { id: string; endpoint_id: string; event: string; status: string; response_code: number | null; error: string | null; created_at: string; delivered_at: string | null }[]
}

/**
 * Fire an event to all active endpoints subscribed to it. Never throws into the
 * caller (a webhook failure must not break the real operation).
 */
export async function fireWebhooks(event: WebhookEvent, payload: Record<string, unknown>): Promise<void> {
  try {
    const svc = getServiceClient()
    const { data } = await svc.from('webhook_endpoints').select('*').eq('active', true).contains('events', [event])
    const endpoints = (data ?? []) as EndpointRow[]
    if (endpoints.length === 0) return
    const body = JSON.stringify({ event, created_at: new Date().toISOString(), data: payload })

    await Promise.all(endpoints.map(async ep => {
      const sig = createHmac('sha256', ep.secret).update(body).digest('hex')
      const { data: row } = await svc.from('webhook_deliveries')
        .insert({ endpoint_id: ep.id, event, payload, status: 'pending' }).select('id').maybeSingle()
      const deliveryId = (row as { id: string } | null)?.id

      // Up to 3 attempts with backoff (0 / 0.5s / 1.5s). Best-effort, inline.
      const backoff = [0, 500, 1500]
      let attempts = 0, code: number | null = null, err: string | null = null, ok = false
      for (let a = 0; a < backoff.length && !ok; a++) {
        if (backoff[a]) await sleep(backoff[a])
        attempts++
        try {
          const res = await fetch(ep.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-VisitPlane-Signature': sig, 'X-VisitPlane-Event': event },
            body, signal: AbortSignal.timeout(8000),
          })
          code = res.status; ok = res.ok; err = ok ? null : `HTTP ${res.status}`
        } catch (e) { err = (e as Error).message }
      }
      if (deliveryId) await svc.from('webhook_deliveries').update({
        status: ok ? 'success' : 'failed', response_code: code, error: err, attempts, delivered_at: new Date().toISOString(),
      }).eq('id', deliveryId)
    }))
  } catch (e) {
    console.error('[webhooks] fire failed:', (e as Error).message)
  }
}
