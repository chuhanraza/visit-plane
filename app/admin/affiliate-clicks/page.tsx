/**
 * /admin/affiliate-clicks
 * ─────────────────────────────────────────────────────────────────────────────
 * Read-only EPC reporting view — REAL HUMAN clicks only.
 *
 * affiliate_clicks carries an is_bot flag (see
 * supabase/migrations/20260705_affiliate_clicks_is_bot.sql): crawlers fetch
 * every /go/[partner] link on a page just by crawling it, which is not a
 * human click. Every query on this page filters is_bot = false so the
 * numbers here are safe to line up against partner-dashboard earnings for
 * EPC — unlike /admin/affiliates, which does not filter bots.
 *
 * Read-only: SELECT only, no writes. Protected by the same requireAdmin()
 * gate as every other /admin page. force-dynamic is scoped to this page only
 * (not the root layout — see the ISR-outage note in guard usage elsewhere).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Affiliate Clicks (Human) — VisitPlane Admin' }
export const dynamic = 'force-dynamic'

// ─── Stat cards ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = 'teal',
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'teal' | 'indigo' | 'amber'
}) {
  const palette = {
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  }[color]

  return (
    <div className={`rounded-xl border p-5 ${palette}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  )
}

// ─── Partner badge ────────────────────────────────────────────────────────────
const PARTNER_META: Record<string, { emoji: string; color: string }> = {
  safetywing: { emoji: '🛡️', color: 'bg-blue-100 text-blue-700' },
  heymondo:   { emoji: '🏥', color: 'bg-purple-100 text-purple-700' },
  airalo:     { emoji: '📶', color: 'bg-teal-100 text-teal-700' },
  saily:      { emoji: '📡', color: 'bg-cyan-100 text-cyan-700' },
  wayaway:    { emoji: '✈️', color: 'bg-emerald-100 text-emerald-700' },
  kiwi:       { emoji: '🥝', color: 'bg-lime-100 text-lime-700' },
  ivisa:      { emoji: '📄', color: 'bg-orange-100 text-orange-700' },
}

function PartnerBadge({ partner }: { partner: string }) {
  const meta = PARTNER_META[partner] ?? { emoji: '🔗', color: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.color}`}>
      {meta.emoji} {partner}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AffiliateClicksAdminPage() {
  await requireAdmin('/admin/login?from=/admin/affiliate-clicks')

  const supabase = getServiceClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()

  const [
    { count: totalClicks },
    { count: last30Clicks },
    { count: last7Clicks },
    { data: byPartner },
    { data: bySource },
    { data: dailySeries },
  ] = await Promise.all([
    // Lifetime total — humans only
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('is_bot', false),

    // Last 30 days — humans only
    supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('is_bot', false)
      .gte('clicked_at', thirtyDaysAgo),

    // Last 7 days — humans only
    supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('is_bot', false)
      .gte('clicked_at', sevenDaysAgo),

    // Clicks per partner (all time) — humans only
    supabase
      .from('affiliate_clicks')
      .select('partner')
      .eq('is_bot', false)
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        const counts: Record<string, number> = {}
        for (const row of res.data) {
          counts[row.partner] = (counts[row.partner] ?? 0) + 1
        }
        const total = res.data.length || 1
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([partner, clicks]) => ({ partner, clicks, pct: Math.round((clicks / total) * 1000) / 10 }))
        return { data: sorted }
      }),

    // Top 20 source pages (all time) — humans only
    supabase
      .from('affiliate_clicks')
      .select('source_page')
      .eq('is_bot', false)
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        const counts: Record<string, number> = {}
        for (const row of res.data) {
          const key = row.source_page || '(no referrer recorded)'
          counts[key] = (counts[key] ?? 0) + 1
        }
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([sourcePage, clicks]) => ({ sourcePage, clicks }))
        return { data: sorted }
      }),

    // Daily count — last 30 days — humans only
    supabase
      .from('affiliate_clicks')
      .select('clicked_at')
      .eq('is_bot', false)
      .gte('clicked_at', thirtyDaysAgo)
      .order('clicked_at', { ascending: false })
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        const counts: Record<string, number> = {}
        for (const row of res.data) {
          const day = row.clicked_at.slice(0, 10)
          counts[day] = (counts[day] ?? 0) + 1
        }
        const sorted = Object.entries(counts)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, clicks]) => ({ date, clicks }))
        return { data: sorted }
      }),
  ])

  const humanTotal = totalClicks ?? 0
  const isLowData = humanTotal < 5000
  const maxPartnerClicks = Math.max(...(byPartner ?? []).map(r => r.clicks), 1)
  const maxDayClicks = Math.max(...(dailySeries ?? []).map(r => r.clicks), 1)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              VisitPlane Admin
            </p>
            <h1 className="text-2xl font-extrabold text-[#1F2937]">Affiliate Clicks — Human Only</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/affiliates"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← Affiliate Analytics
            </Link>
            <span className="text-xs text-gray-400">
              {now.toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* ── Explainer ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          <strong>🧑 Human-filtered EPC source of truth:</strong> every number on this page
          excludes bot/crawler traffic (<code className="rounded bg-teal-100 px-1 text-xs">is_bot = false</code>).
          Use these counts — not the totals on{' '}
          <Link href="/admin/affiliates" className="underline">/admin/affiliates</Link>, which don&apos;t
          filter bots — when computing earnings-per-click against a partner dashboard.
        </div>

        {isLowData && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>⚠️ Low data volume:</strong> only {humanTotal.toLocaleString()} real human clicks
            recorded so far. Percentages and per-source breakdowns below can swing a lot with a
            handful of extra clicks — treat them as directional until volume grows.
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Real human clicks — all time"
            value={humanTotal.toLocaleString()}
            sub="is_bot = false"
            color="teal"
          />
          <StatCard
            label="Last 30 days"
            value={(last30Clicks ?? 0).toLocaleString()}
            sub="Real human clicks"
            color="indigo"
          />
          <StatCard
            label="Last 7 days"
            value={(last7Clicks ?? 0).toLocaleString()}
            sub="Real human clicks"
            color="amber"
          />
        </div>

        {/* ── By partner ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#1F2937]">
            Human Clicks by Partner <span className="font-normal text-gray-400 text-sm">(all time)</span>
          </h2>
          {(byPartner ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No real human clicks recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {(byPartner ?? []).map(({ partner, clicks, pct }) => (
                <div key={partner}>
                  <div className="mb-1 flex items-center justify-between">
                    <PartnerBadge partner={partner} />
                    <span className="text-sm font-bold text-[#1F2937]">
                      {clicks} <span className="font-normal text-gray-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[#14B8A6] transition-all"
                      style={{ width: `${Math.round((clicks / maxPartnerClicks) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top 20 source pages ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-[#1F2937]">
            Top Source Pages <span className="font-normal text-gray-400 text-sm">(top 20, all time)</span>
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            Which pages actually drive a real human affiliate click. &quot;(no referrer recorded)&quot;
            covers clicks where the CTA didn&apos;t pass an explicit source and no Referer header arrived.
          </p>
          {(bySource ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No source-page data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 pr-6 text-left text-xs font-semibold text-gray-400">#</th>
                    <th className="py-2 text-left text-xs font-semibold text-gray-400">Source page</th>
                    <th className="py-2 pl-6 text-right text-xs font-semibold text-gray-400">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {(bySource ?? []).map(({ sourcePage, clicks }, i) => (
                    <tr key={sourcePage} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-6 text-xs text-gray-400">{i + 1}</td>
                      <td className="py-2.5 font-medium text-[#1F2937]">
                        {sourcePage === '(no referrer recorded)' ? (
                          <span className="italic text-gray-400">{sourcePage}</span>
                        ) : (
                          sourcePage
                        )}
                      </td>
                      <td className="py-2.5 pl-6 text-right font-bold text-[#1F2937]">{clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Daily count — last 30 days ───────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#1F2937]">
            Daily Human Clicks — Last 30 Days
          </h2>
          {(dailySeries ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-400">Date</th>
                    <th className="py-2 text-left text-xs font-semibold text-gray-400">Trend</th>
                    <th className="py-2 pl-4 text-right text-xs font-semibold text-gray-400">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {(dailySeries ?? []).map(({ date, clicks }) => (
                    <tr key={date} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2 pr-4 text-xs text-gray-500">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2">
                        <div className="h-2 w-full max-w-[200px] rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-indigo-400"
                            style={{ width: `${Math.round((clicks / maxDayClicks) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2 pl-4 text-right text-xs font-bold text-[#1F2937]">{clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
