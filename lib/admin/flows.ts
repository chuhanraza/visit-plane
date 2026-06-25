import { getServiceClient } from '@/lib/supabase/admin'
import { getFlag } from '@/lib/admin/settings'
import { sendBroadcastEmail } from '@/lib/email'
import { suppressionHours, suppressedSet } from '@/lib/admin/email'
import { recordEvent } from '@/lib/admin/events'

/**
 * Automated flows: trigger (lead.created) → ordered steps (delay + email).
 * A worker (cron + manual) enrolls newly-confirmed leads and sends due step
 * emails. Real sends are gated behind the email_broadcasts_enabled flag (same
 * safe default as manual broadcasts). Service-role, behind requireAdmin().
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.visitplane.com').replace(/\/$/, '')

export interface FlowStep { id?: string; position: number; delay_minutes: number; subject: string; body: string }
export interface FlowRow { id: string; name: string; trigger_type: string; active: boolean; created_at: string }

export async function listFlows() {
  const svc = getServiceClient()
  const [{ data: flows }, { data: steps }, { data: runs }] = await Promise.all([
    svc.from('flows').select('*').order('created_at', { ascending: false }),
    svc.from('flow_steps').select('*').order('position'),
    svc.from('flow_runs').select('flow_id, status'),
  ])
  const stepsByFlow = new Map<string, FlowStep[]>()
  for (const s of (steps ?? []) as (FlowStep & { flow_id: string })[]) {
    const arr = stepsByFlow.get(s.flow_id) ?? []; arr.push(s); stepsByFlow.set(s.flow_id, arr)
  }
  const runStats = new Map<string, { active: number; completed: number }>()
  for (const r of (runs ?? []) as { flow_id: string; status: string }[]) {
    const st = runStats.get(r.flow_id) ?? { active: 0, completed: 0 }
    if (r.status === 'active') st.active++; else if (r.status === 'completed') st.completed++
    runStats.set(r.flow_id, st)
  }
  return ((flows ?? []) as FlowRow[]).map(f => ({ ...f, steps: stepsByFlow.get(f.id) ?? [], stats: runStats.get(f.id) ?? { active: 0, completed: 0 } }))
}

export const FLOW_TRIGGERS = ['lead.created', 'wizard.completed'] as const
export type FlowTrigger = (typeof FLOW_TRIGGERS)[number]

export async function createFlow(name: string, steps: { delay_minutes: number; subject: string; body: string }[], triggerType: FlowTrigger = 'lead.created'): Promise<string> {
  const svc = getServiceClient()
  const { data, error } = await svc.from('flows').insert({ name, trigger_type: triggerType, active: false }).select('id').maybeSingle()
  if (error) throw new Error(error.message)
  const flowId = (data as { id: string }).id
  if (steps.length) {
    await svc.from('flow_steps').insert(steps.map((s, i) => ({ flow_id: flowId, position: i, delay_minutes: s.delay_minutes, subject: s.subject, body: s.body })))
  }
  return flowId
}

export async function setFlowActive(id: string, active: boolean) {
  const svc = getServiceClient()
  await svc.from('flows').update({ active }).eq('id', id)
}

export async function deleteFlow(id: string) {
  const svc = getServiceClient()
  await svc.from('flows').delete().eq('id', id)
}

/** Enroll newly-confirmed leads + send due step emails. Idempotent + safe. */
export async function runFlowWorker(): Promise<{ enabled: boolean; enrolled: number; sent: number; completed: number }> {
  const enabled = await getFlag('email_broadcasts_enabled')
  if (!enabled) return { enabled: false, enrolled: 0, sent: 0, completed: 0 }

  const svc = getServiceClient()
  const now = Date.now()
  let enrolled = 0, sent = 0, completed = 0

  const { data: flows } = await svc.from('flows').select('id, created_at, trigger_type').eq('active', true)
  for (const f of (flows ?? []) as { id: string; created_at: string; trigger_type: string }[]) {
    const { data: steps } = await svc.from('flow_steps').select('position, delay_minutes, subject, body').eq('flow_id', f.id).order('position')
    const flowSteps = (steps ?? []) as { position: number; delay_minutes: number; subject: string; body: string }[]
    if (flowSteps.length === 0) continue

    const { data: existing } = await svc.from('flow_runs').select('email').eq('flow_id', f.id).limit(50000)
    const enrolledSet = new Set((existing ?? []).map((r: { email: string }) => r.email.toLowerCase()))

    // Candidate emails differ by trigger; both require confirmed + subscribed to email.
    let candidates: string[] = []
    if (f.trigger_type === 'wizard.completed') {
      const { data: ev } = await svc.from('marketing_events').select('email').eq('metric', 'wizard.completed').gte('occurred_at', f.created_at).not('email', 'is', null).limit(2000)
      const emails = [...new Set((ev ?? []).map((e: { email: string | null }) => (e.email || '').toLowerCase()).filter(Boolean))]
      if (emails.length) {
        const { data: subs } = await svc.from('email_subscribers').select('email').not('confirmed_at', 'is', null).is('unsubscribed_at', null).in('email', emails)
        candidates = ((subs ?? []) as { email: string }[]).map(s => s.email)
      }
    } else {
      const { data: leads } = await svc.from('email_subscribers')
        .select('email').not('confirmed_at', 'is', null).is('unsubscribed_at', null).gte('confirmed_at', f.created_at).limit(500)
      candidates = ((leads ?? []) as { email: string }[]).map(l => l.email)
    }

    const toEnroll = candidates
      .filter(e => !enrolledSet.has(e.toLowerCase()))
      .map(email => ({ flow_id: f.id, email, current_step: 0, next_action_at: new Date(now + flowSteps[0].delay_minutes * 60000).toISOString() }))
    if (toEnroll.length) { await svc.from('flow_runs').upsert(toEnroll, { onConflict: 'flow_id,email', ignoreDuplicates: true }); enrolled += toEnroll.length }
  }

  // ── Advance: due active runs.
  const { data: dueRuns } = await svc.from('flow_runs').select('id, flow_id, email, current_step').eq('status', 'active').lte('next_action_at', new Date(now).toISOString()).limit(500)
  const dueList = (dueRuns ?? []) as { id: string; flow_id: string; email: string; current_step: number }[]
  // Smart-send: defer runs whose recipient was emailed within the suppression window.
  const supHours = await suppressionHours()
  const suppressed = await suppressedSet(dueList.map(r => r.email), supHours)
  for (const run of dueList) {
    if (suppressed.has(run.email.toLowerCase())) {
      await svc.from('flow_runs').update({ next_action_at: new Date(now + supHours * 3600000).toISOString(), updated_at: new Date().toISOString() }).eq('id', run.id)
      continue
    }
    const { data: steps } = await svc.from('flow_steps').select('position, delay_minutes, subject, body').eq('flow_id', run.flow_id).order('position')
    const flowSteps = (steps ?? []) as { delay_minutes: number; subject: string; body: string }[]
    if (run.current_step >= flowSteps.length) { await svc.from('flow_runs').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', run.id); completed++; continue }

    // Recipient must still be confirmed + subscribed.
    const { data: rec } = await svc.from('email_subscribers').select('unsubscribe_token, unsubscribed_at, confirmed_at').ilike('email', run.email).maybeSingle()
    const r = rec as { unsubscribe_token: string; unsubscribed_at: string | null; confirmed_at: string | null } | null
    if (!r || r.unsubscribed_at || !r.confirmed_at) { await svc.from('flow_runs').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', run.id); continue }

    const step = flowSteps[run.current_step]
    const res = await sendBroadcastEmail(run.email, step.subject, step.body, `${SITE}/unsubscribe?token=${r.unsubscribe_token}`)
    if (res.sent) { sent++; await recordEvent({ email: run.email, metric: 'flow.email_sent', properties: { flow_id: run.flow_id, step: run.current_step } }) }

    const next = run.current_step + 1
    if (next >= flowSteps.length) { await svc.from('flow_runs').update({ status: 'completed', current_step: next, updated_at: new Date().toISOString() }).eq('id', run.id); completed++ }
    else { await svc.from('flow_runs').update({ current_step: next, next_action_at: new Date(now + flowSteps[next].delay_minutes * 60000).toISOString(), updated_at: new Date().toISOString() }).eq('id', run.id) }
  }

  return { enabled: true, enrolled, sent, completed }
}
