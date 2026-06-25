import { getServiceClient } from '@/lib/supabase/admin'
import { getSettings, setSetting } from '@/lib/admin/settings'
import { getAnalytics } from '@/lib/admin/analytics'
import { sendInternalEmail } from '@/lib/email'

/**
 * Scheduled analytics digest. Config lives in app_settings; the flows cron calls
 * maybeSendDigest() daily and sends when due (daily or weekly cadence).
 */

export interface DigestConfig { enabled: boolean; frequency: 'daily' | 'weekly'; recipient: string; lastSent: string | null }

export async function getDigestConfig(): Promise<DigestConfig> {
  const s = await getSettings()
  return {
    enabled: s.digest_enabled === true,
    frequency: s.digest_frequency === 'weekly' ? 'weekly' : 'daily',
    recipient: typeof s.digest_recipient === 'string' ? s.digest_recipient : '',
    lastSent: typeof s.digest_last_sent === 'string' ? s.digest_last_sent : null,
  }
}

export async function setDigestConfig(cfg: { enabled: boolean; frequency: 'daily' | 'weekly'; recipient: string }, actor: string): Promise<void> {
  await setSetting('digest_enabled', cfg.enabled, actor)
  await setSetting('digest_frequency', cfg.frequency, actor)
  await setSetting('digest_recipient', cfg.recipient, actor)
}

function row(label: string, value: string) {
  return `<tr><td style="padding:4px 0;color:#6b7280">${label}</td><td style="text-align:right;font-weight:600">${value}</td></tr>`
}

export async function buildDigestHtml(days: number): Promise<{ subject: string; html: string }> {
  const to = new Date(); const from = new Date(Date.now() - (days - 1) * 86400000)
  const a = await getAnalytics(`${from.toISOString().slice(0, 10)}T00:00:00.000Z`, `${to.toISOString().slice(0, 10)}T23:59:59.999Z`)
  const m = a.metrics
  const delta = (cur: number, prev: number) => prev === 0 ? (cur ? '▲ new' : '—') : `${cur >= prev ? '▲' : '▼'} ${Math.abs(Math.round(((cur - prev) / prev) * 100))}%`
  const html = `
    <p style="font-size:14px;color:#374151">Your VisitPlane operator digest — last ${days} days (vs previous ${days}).</p>
    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;margin:8px 0">
      ${row('New leads', `${m.leads.current} (${delta(m.leads.current, m.leads.previous)})`)}
      ${row('Confirmed opt-ins', String(m.confirmed.current))}
      ${row('Customers', String(m.customers.current))}
      ${row('Affiliate clicks', `${m.affiliateClicks.current} (${delta(m.affiliateClicks.current, m.affiliateClicks.previous)})`)}
      ${row('Affiliate conversions', String(m.affiliateConversions.current))}
      ${row('Manual revenue', `$${m.manualRevenue.current.toFixed(2)}`)}
      ${row('e-Visa revenue', `$${m.evisaRevenue.current.toFixed(2)}`)}
    </table>
    <p style="font-size:13px;color:#6b7280">Top source: ${a.attribution[0] ? `${a.attribution[0].source} (${a.attribution[0].count})` : 'no data yet'}.</p>`
  return { subject: `VisitPlane digest — ${m.leads.current} new leads, $${(m.manualRevenue.current + m.evisaRevenue.current).toFixed(0)} revenue`, html }
}

export async function sendDigestNow(recipientOverride?: string): Promise<{ sent: boolean; reason?: string }> {
  const cfg = await getDigestConfig()
  const to = recipientOverride || cfg.recipient
  if (!to) return { sent: false, reason: 'no recipient configured' }
  const { subject, html } = await buildDigestHtml(cfg.frequency === 'weekly' ? 7 : 1)
  const res = await sendInternalEmail(to, subject, html)
  await setSetting('digest_last_sent', new Date().toISOString(), 'system')
  return { sent: res.sent, reason: res.sent ? undefined : 'Resend not configured' }
}

/** Cron entry: send if enabled + due. */
export async function maybeSendDigest(): Promise<{ sent: boolean }> {
  const cfg = await getDigestConfig()
  if (!cfg.enabled || !cfg.recipient) return { sent: false }
  const intervalMs = (cfg.frequency === 'weekly' ? 7 : 1) * 86400000 - 3600000 // small grace
  if (cfg.lastSent && Date.now() - new Date(cfg.lastSent).getTime() < intervalMs) return { sent: false }
  const r = await sendDigestNow()
  return { sent: r.sent }
}
