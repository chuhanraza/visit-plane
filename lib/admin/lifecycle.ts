import { getServiceClient } from '@/lib/supabase/admin'
import { getFlag } from '@/lib/admin/settings'
import { sendBroadcastEmail, sendAlertsEmail } from '@/lib/email'
import { blogPosts } from '@/src/lib/posts'
import { writeAudit } from '@/lib/audit'

/**
 * Lifecycle re-engagement: two independent, one-time (not drip) tracks over
 * email_subscribers. Each track has its own sent-at guard column, which is
 * the SOLE idempotency check — re-running the worker never double-sends.
 *
 * Track A (win-back): confirmed 14+ days ago, still subscribed, never sent.
 * Track B (confirm nudge): never confirmed, consented 3+ days ago, never sent.
 *
 * Both honor unsubscribed_at IS NULL in the SQL query itself, not just in
 * application code. Both are gated behind their own app_settings flag
 * (winback_enabled / confirm_nudge_enabled — same pattern as the existing
 * email_broadcasts_enabled flag) so either can be turned off without a
 * redeploy.
 */

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.visitplane.com').replace(/\/$/, '')
const BATCH_SIZE = 20
const BATCH_DELAY_MS = 1100 // Resend's default rate limit is ~2 req/sec; stay well under it.

interface Subscriber {
  id: number
  email: string
  route_passport: string | null
  route_destination: string | null
  unsubscribe_token: string
  confirm_token: string | null
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ── Route → content matching ────────────────────────────────────────────────

/** Best blog post for a subscriber's route: exact passport+destination, then passport-only, else null. */
function matchPost(passport: string | null, destination: string | null) {
  if (!passport) return null
  const p = passport.trim().toLowerCase()
  const d = destination?.trim().toLowerCase()
  if (d) {
    const exact = blogPosts.find(
      post => post.passportCountry.toLowerCase() === p && post.destinationCountry.toLowerCase() === d,
    )
    if (exact) return exact
  }
  return blogPosts.find(post => post.passportCountry.toLowerCase() === p) ?? null
}

// ── Track A: win-back ────────────────────────────────────────────────────────

export async function getWinbackCandidates(): Promise<Subscriber[]> {
  const svc = getServiceClient()
  const { data } = await svc
    .from('email_subscribers')
    .select('id, email, route_passport, route_destination, unsubscribe_token, confirm_token')
    .not('confirmed_at', 'is', null)
    .is('unsubscribed_at', null)
    .is('winback_email_sent_at', null)
    .lte('confirmed_at', new Date(Date.now() - 14 * 86400000).toISOString())
    .limit(2000)
  return (data ?? []) as Subscriber[]
}

export function renderWinbackEmail(sub: Subscriber): { subject: string; bodyHtml: string } {
  const post = matchPost(sub.route_passport, sub.route_destination)

  if (post) {
    const subject = `${post.destinationCountry} from ${post.passportCountry}: what actually applies to you`
    const bodyHtml = `
      <p>You looked up <strong>${post.passportCountry} → ${post.destinationCountry}</strong> a while back — here's something worth reading before you book anything.</p>
      <p><a href="${SITE}/blog/${post.slug}" style="color:#2563eb;font-weight:600">${post.title}</a></p>
      <p style="color:#6b7280;font-size:13px">${post.excerpt}</p>
      <p>Rules shift, so it's worth a quick re-check even if you looked this up before: <a href="${SITE}/wizard" style="color:#2563eb">run it through the Visa Wizard</a>.</p>`
    return { subject, bodyHtml }
  }

  const subject = 'One tool worth bookmarking before your next trip'
  const bodyHtml = `
    <p>Whenever you're ready to plan your next trip, the fastest way to know what you actually need is the Visa Wizard — enter your passport and destination and get a straight answer, not a guess.</p>
    <p><a href="${SITE}/wizard" style="color:#2563eb;font-weight:600">Run the Visa Wizard →</a></p>
    <p style="color:#6b7280;font-size:13px">No account needed, and it's free.</p>`
  return { subject, bodyHtml }
}

export interface TrackResult {
  enabled: boolean
  candidates: number
  sent: number
  failed: number
  preview: { email: string; subject: string; bodyHtml: string }[]
}

export async function runWinback(dryRun: boolean): Promise<TrackResult> {
  const enabled = await getFlag('winback_enabled')
  const candidates = await getWinbackCandidates()
  const preview = candidates.slice(0, 5).map(sub => ({ email: sub.email, ...renderWinbackEmail(sub) }))

  if (dryRun || !enabled) {
    return { enabled, candidates: candidates.length, sent: 0, failed: 0, preview }
  }

  const svc = getServiceClient()
  let sent = 0, failed = 0
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE)
    for (const sub of batch) {
      const { subject, bodyHtml } = renderWinbackEmail(sub)
      const unsubscribeUrl = `${SITE}/unsubscribe?token=${sub.unsubscribe_token}`
      const res = await sendBroadcastEmail(sub.email, subject, bodyHtml, unsubscribeUrl)
      if (res.sent) {
        sent++
        await svc.from('email_subscribers').update({ winback_email_sent_at: new Date().toISOString() }).eq('id', sub.id)
      } else {
        failed++
      }
    }
    if (i + BATCH_SIZE < candidates.length) await sleep(BATCH_DELAY_MS)
  }

  await writeAudit({ actor: 'system', actorType: 'system', action: 'lifecycle.winback_sent', metadata: { sent, failed, candidates: candidates.length } })
  return { enabled, candidates: candidates.length, sent, failed, preview }
}

// ── Track B: confirm nudge ───────────────────────────────────────────────────

export async function getConfirmNudgeCandidates(): Promise<Subscriber[]> {
  const svc = getServiceClient()
  const { data } = await svc
    .from('email_subscribers')
    .select('id, email, route_passport, route_destination, unsubscribe_token, confirm_token')
    .is('confirmed_at', null)
    .is('unsubscribed_at', null)
    .is('confirm_nudge_sent_at', null)
    .not('confirm_token', 'is', null)
    .lte('consent_at', new Date(Date.now() - 3 * 86400000).toISOString())
    .limit(2000)
  return (data ?? []) as Subscriber[]
}

/** Same teal visual template as the original confirmation email (app/api/subscribe/route.ts). */
export function renderConfirmNudgeEmail(sub: Subscriber): { subject: string; html: string } {
  const confirmUrl = `${SITE}/confirm?token=${sub.confirm_token}`
  const unsubscribeUrl = `${SITE}/unsubscribe?token=${sub.unsubscribe_token}`
  const subject = 'Still want your visa alerts?'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
        <tr>
          <td style="background:#0d9488;padding:28px 32px;text-align:center">
            <span style="font-size:28px">✈️</span>
            <div style="color:#fff;font-size:20px;font-weight:700;margin-top:8px">VisitPlane</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827">
              You're one click away
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6">
              Hi traveller,<br><br>
              You started signing up for VisitPlane visa alerts but never confirmed — so nothing's been sent yet. No pressure, just a reminder in case it slipped by.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:12px;background:#0d9488">
                  <a href="${confirmUrl}"
                     style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px">
                    Confirm Subscription →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
              Or copy this link into your browser:<br>
              <a href="${confirmUrl}" style="color:#0d9488;word-break:break-all">${confirmUrl}</a>
            </p>
            <p style="margin:16px 0 0;font-size:13px;color:#9ca3af">
              If you'd rather not, you can safely ignore this — or unsubscribe below and you won't hear from us again.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;font-size:12px;color:#d1d5db">
              © VisitPlane · Free visa intelligence for travellers<br>
              <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:none">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}

export async function runConfirmNudge(dryRun: boolean): Promise<TrackResult> {
  const enabled = await getFlag('confirm_nudge_enabled')
  const candidates = await getConfirmNudgeCandidates()
  const preview = candidates.slice(0, 5).map(sub => {
    const { subject, html } = renderConfirmNudgeEmail(sub)
    return { email: sub.email, subject, bodyHtml: html }
  })

  if (dryRun || !enabled) {
    return { enabled, candidates: candidates.length, sent: 0, failed: 0, preview }
  }

  const svc = getServiceClient()
  let sent = 0, failed = 0
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE)
    for (const sub of batch) {
      const { subject, html } = renderConfirmNudgeEmail(sub)
      const res = await sendAlertsEmail(sub.email, subject, html)
      if (res.sent) {
        sent++
        await svc.from('email_subscribers').update({ confirm_nudge_sent_at: new Date().toISOString() }).eq('id', sub.id)
      } else {
        failed++
      }
    }
    if (i + BATCH_SIZE < candidates.length) await sleep(BATCH_DELAY_MS)
  }

  await writeAudit({ actor: 'system', actorType: 'system', action: 'lifecycle.confirm_nudge_sent', metadata: { sent, failed, candidates: candidates.length } })
  return { enabled, candidates: candidates.length, sent, failed, preview }
}
