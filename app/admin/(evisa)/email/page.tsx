import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { emailSegments, listPendingOptIn, recentBroadcasts, emailEngagement, suppressionHours } from '@/lib/admin/email'
import { listSegments } from '@/lib/admin/segments'
import { listTemplates } from '@/lib/admin/templates'
import { abTestResults } from '@/lib/admin/abtests'
import { getFlag } from '@/lib/admin/settings'
import EmailComposer from './EmailComposer'
import SuppressionControl from './SuppressionControl'

export const metadata: Metadata = { title: 'Email — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminEmail() {
  await requireAdmin()
  const [segments, pending, broadcasts, broadcastsEnabled, savedSegments, engagement, templates] = await Promise.all([
    emailSegments(),
    listPendingOptIn({ page: 1, pageSize: 20 }),
    recentBroadcasts(8),
    getFlag('email_broadcasts_enabled'),
    listSegments(),
    emailEngagement(30),
    listTemplates(),
  ])
  const [supHours, abTests] = await Promise.all([suppressionHours(), abTestResults(8)])

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-0.5">{sub}</div>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Email campaigns</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/email/templates" className="text-sm text-gray-400 hover:text-white">Templates →</Link>
          <Link href="/admin/subscribers" className="text-sm text-gray-400 hover:text-white">Subscriber analytics →</Link>
        </div>
      </div>

      <div className={`rounded-xl border px-4 py-2.5 text-sm ${broadcastsEnabled ? 'border-emerald-800 bg-emerald-900/20 text-emerald-200' : 'border-gray-800 bg-gray-900 text-gray-400'}`}>
        {broadcastsEnabled
          ? 'Broadcasts are ENABLED. Sends go to confirmed, subscribed recipients via Resend with a per-recipient unsubscribe link.'
          : 'Broadcasts are OFF (safe default). Test sends work; real sends require enabling "email_broadcasts_enabled" in Settings.'}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total subscribers" value={String(segments.total)} />
        <Stat label="Confirmed (sendable)" value={String(segments.confirmed)} sub="double opt-in complete" />
        <Stat label="Pending opt-in" value={String(segments.pending)} sub="awaiting confirmation" />
        <Stat label="Unsubscribed" value={String(segments.unsubscribed)} />
      </div>

      <SuppressionControl hours={supHours} />

      <EmailComposer segments={segments} broadcastsEnabled={broadcastsEnabled} savedSegments={savedSegments.map(s => ({ id: s.id, name: s.name }))} templates={templates.map(t => ({ name: t.name, subject: t.subject, body: t.body_html }))} />

      {abTests.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">A/B subject tests</h2>
          <div className="space-y-3">
            {abTests.map(t => (
              <div key={t.test_id} className="border border-gray-800 rounded-xl p-3 text-sm">
                <div className="text-xs text-gray-500 mb-1">{new Date(t.when).toLocaleString()}</div>
                {(['A', 'B'] as const).map(v => {
                  const subj = v === 'A' ? t.subjectA : t.subjectB
                  const sent = v === 'A' ? t.sentA : t.sentB
                  const opened = v === 'A' ? t.openedA : t.openedB
                  const rate = v === 'A' ? t.openRateA : t.openRateB
                  const win = t.winner === v
                  return (
                    <div key={v} className="flex items-center justify-between py-0.5">
                      <span className={`truncate ${win ? 'text-emerald-300' : 'text-gray-300'}`}>{win && '★ '}{v}: {subj || '(no subject)'}</span>
                      <span className="text-gray-400 text-xs whitespace-nowrap ml-3">{opened}/{sent} opened · {rate}%</span>
                    </div>
                  )
                })}
                {t.winner && t.winner !== 'tie' && <div className="text-[11px] text-emerald-400 mt-1">Winner: variant {t.winner}</div>}
                {!t.openedA && !t.openedB && <div className="text-[11px] text-gray-600 mt-1">Open data appears once the Resend webhook is configured.</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Double opt-in queue */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">Double opt-in queue <span className="text-gray-500 text-sm font-normal">({pending.total})</span></h2>
          {pending.rows.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending confirmations.</p>
          ) : (
            <ul className="divide-y divide-gray-800 text-sm">
              {pending.rows.map(p => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span className="text-gray-200">{p.email}</span>
                  <span className="text-xs text-gray-500">{p.captured_from || '—'} · {new Date(p.captured_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent broadcasts (from audit log) + stats note */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">Recent broadcasts</h2>
          {broadcasts.length === 0 ? (
            <p className="text-gray-500 text-sm">No broadcasts sent yet.</p>
          ) : (
            <ul className="divide-y divide-gray-800 text-sm">
              {broadcasts.map((b, i) => {
                const m = b.metadata as { subject?: string; sent?: number; recipientCount?: number }
                return (
                  <li key={i} className="py-2">
                    <div className="text-gray-200">{m.subject ?? '(no subject)'}</div>
                    <div className="text-xs text-gray-500">{m.sent ?? 0}/{m.recipientCount ?? 0} sent · {new Date(b.created_at).toLocaleString()}</div>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Engagement (30d)</div>
            {engagement.tracked ? (
              <div className="flex gap-4 text-sm text-gray-300">
                <span>{engagement.delivered} delivered</span>
                <span>{engagement.opened} opened</span>
                <span>{engagement.clicked} clicked</span>
                {engagement.bounced > 0 && <span className="text-red-400">{engagement.bounced} bounced</span>}
              </div>
            ) : (
              <p className="text-xs text-gray-600">No data yet — connect the Resend webhook (<code>/api/webhooks/resend</code>) to record opens/clicks.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
