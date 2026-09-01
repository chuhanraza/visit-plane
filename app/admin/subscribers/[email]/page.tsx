/**
 * /admin/subscribers/[email]
 * ─────────────────────────────────────────────────────────────────
 * Per-subscriber detail: capture record, tags/note (editable), and real
 * email engagement history from marketing_events (delivered/opened/
 * clicked/bounced/complained only — general analytics events excluded).
 */
import Link             from 'next/link'
import { notFound }     from 'next/navigation'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Subscriber — VisitPlane Admin' }
export const dynamic = 'force-dynamic'

const EMAIL_METRICS = ['email.delivered', 'email.opened', 'email.clicked', 'email.bounced', 'email.complained'] as const

interface SubscriberRow {
  email:             string
  route_passport:    string | null
  route_destination: string | null
  captured_at:       string
  captured_from:     string
  confirmed_at:      string | null
  unsubscribed_at:   string | null
  admin_tags:        string[] | null
  admin_note:        string | null
}

interface EngagementEvent {
  metric:      string
  occurred_at: string
}

const METRIC_LABEL: Record<string, string> = {
  'email.delivered':  'Delivered',
  'email.opened':     'Opened',
  'email.clicked':    'Clicked',
  'email.bounced':    'Bounced',
  'email.complained': 'Complained',
}
const METRIC_COLOR: Record<string, string> = {
  'email.delivered':  'text-gray-300 bg-gray-800 border-gray-700',
  'email.opened':     'text-teal-400 bg-teal-950 border-teal-800',
  'email.clicked':    'text-emerald-400 bg-emerald-950 border-emerald-800',
  'email.bounced':    'text-red-400 bg-red-950 border-red-800',
  'email.complained': 'text-red-400 bg-red-950 border-red-800',
}

export default async function SubscriberDetailPage({ params }: { params: Promise<{ email: string }> }) {
  await requireAdmin('/admin/login?from=/admin/subscribers')

  const { email: rawEmail } = await params
  const email = decodeURIComponent(rawEmail)
  const svc = getServiceClient()

  const { data: subscriber, error } = await svc
    .from('email_subscribers')
    .select('email,route_passport,route_destination,captured_at,captured_from,confirmed_at,unsubscribed_at,admin_tags,admin_note')
    .eq('email', email)
    .maybeSingle()

  if (error) console.error(error)
  if (!subscriber) notFound()
  const s = subscriber as SubscriberRow

  const { data: events, error: eventsError } = await svc
    .from('marketing_events')
    .select('metric,occurred_at')
    .in('metric', EMAIL_METRICS)
    .ilike('email', email)
    .order('occurred_at', { ascending: false })
    .limit(200)
  if (eventsError) console.error(eventsError)
  const engagement = (events ?? []) as EngagementEvent[]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/subscribers" className="text-gray-400 hover:text-white text-sm transition">← Subscribers</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm font-semibold font-mono">{s.email}</span>
        <div className="ml-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Site</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* ── Record ─────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-xl font-bold font-mono">{s.email}</h1>
            {s.unsubscribed_at ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-950 border border-red-800 px-3 py-1 text-xs text-red-400">Unsubscribed</span>
            ) : s.confirmed_at ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-800 px-3 py-1 text-xs text-emerald-400">✓ Confirmed</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 border border-amber-800 px-3 py-1 text-xs text-amber-400">Pending</span>
            )}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 text-xs uppercase tracking-wider">Route</dt>
              <dd className="text-gray-200 mt-1">
                {s.route_passport && s.route_destination ? `${s.route_passport} → ${s.route_destination}` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs uppercase tracking-wider">Source</dt>
              <dd className="text-gray-200 mt-1 capitalize">{(s.captured_from ?? 'unknown').replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs uppercase tracking-wider">Captured at</dt>
              <dd className="text-gray-200 mt-1">{new Date(s.captured_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs uppercase tracking-wider">Confirmed at</dt>
              <dd className="text-gray-200 mt-1">{s.confirmed_at ? new Date(s.confirmed_at).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs uppercase tracking-wider">Unsubscribed at</dt>
              <dd className="text-gray-200 mt-1">{s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleString() : '—'}</dd>
            </div>
          </dl>
        </div>

        {/* ── Tags & note (editable) ────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Tags & note</h2>
          <form action="/api/admin/subscribers/update" method="POST" className="space-y-4">
            <input type="hidden" name="email" value={s.email} />
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="admin_tags">
                Tags (comma-separated)
              </label>
              <input
                id="admin_tags"
                name="admin_tags"
                type="text"
                defaultValue={(s.admin_tags ?? []).join(', ')}
                placeholder="vip, follow-up, high-intent"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="admin_note">
                Note
              </label>
              <textarea
                id="admin_note"
                name="admin_note"
                rows={4}
                defaultValue={s.admin_note ?? ''}
                placeholder="Internal note about this subscriber…"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button type="submit" className="rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-sm font-semibold transition">
              Save
            </button>
          </form>
        </div>

        {/* ── Engagement history ────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300">Email engagement history</h2>
            <p className="text-gray-500 text-xs mt-1">delivered / opened / clicked / bounced / complained — from Resend webhook events</p>
          </div>
          <div className="divide-y divide-gray-800">
            {engagement.map((e, i) => (
              <div key={`${e.metric}-${e.occurred_at}-${i}`} className="px-6 py-3 flex items-center justify-between text-sm">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] ${METRIC_COLOR[e.metric] ?? 'text-gray-300 bg-gray-800 border-gray-700'}`}>
                  {METRIC_LABEL[e.metric] ?? e.metric}
                </span>
                <span className="text-gray-500 text-xs">{new Date(e.occurred_at).toLocaleString()}</span>
              </div>
            ))}
            {engagement.length === 0 && (
              <div className="px-6 py-10 text-center text-gray-600 text-sm">No email engagement events recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
