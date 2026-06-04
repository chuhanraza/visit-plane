/**
 * /admin/affiliates
 * ─────────────────────────────────────────────────────────────────────────────
 * Affiliate analytics dashboard for VisitPlane founders.
 * Protected by ADMIN_SECRET cookie (same pattern as /admin/data-quality).
 *
 * Shows:
 *   - Total clicks (lifetime + last 30 days)
 *   - Clicks per partner per day (last 14 days)
 *   - Top-converting routes
 *   - Top-converting placements
 *   - EPC trend note
 */

import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'

export const metadata: Metadata = { title: 'Affiliate Analytics — VisitPlane Admin' }
export const dynamic = 'force-dynamic'

// ─── Auth guard ───────────────────────────────────────────────────────────────
async function checkAdminAccess() {
  const hdrs = await headers()
  const secret = hdrs.get('x-admin-secret')
  const cookie = hdrs.get('cookie') ?? ''
  const cookieOk = cookie.includes(`admin_secret=${process.env.ADMIN_SECRET}`)
  return secret === process.env.ADMIN_SECRET || cookieOk
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

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
  color?: 'teal' | 'indigo' | 'amber' | 'rose'
}) {
  const palette = {
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
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
export default async function AffiliatesAdminPage() {
  if (!(await checkAdminAccess())) redirect('/admin/login?from=/admin/affiliates')

  const supabase = getSupabase()

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString()

  const [
    { count: totalClicks },
    { count: last30Clicks },
    { data: byPartner },
    { data: topRoutes },
    { data: topPlacements },
    { data: dailySeries },
  ] = await Promise.all([
    // Lifetime total
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }),

    // Last 30 days
    supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .gte('clicked_at', thirtyDaysAgo),

    // Clicks per partner (last 30 days)
    supabase
      .from('affiliate_clicks')
      .select('partner')
      .gte('clicked_at', thirtyDaysAgo)
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        const counts: Record<string, number> = {}
        for (const row of res.data) {
          counts[row.partner] = (counts[row.partner] ?? 0) + 1
        }
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([partner, clicks]) => ({ partner, clicks }))
        return { data: sorted }
      }),

    // Top 10 routes (last 30 days)
    supabase
      .from('affiliate_clicks')
      .select('route_passport, route_dest')
      .gte('clicked_at', thirtyDaysAgo)
      .not('route_passport', 'is', null)
      .not('route_dest', 'is', null)
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        const counts: Record<string, number> = {}
        for (const row of res.data) {
          const key = `${row.route_passport} → ${row.route_dest}`
          counts[key] = (counts[key] ?? 0) + 1
        }
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([route, clicks]) => ({ route, clicks }))
        return { data: sorted }
      }),

    // Clicks per placement (last 30 days)
    supabase
      .from('affiliate_clicks')
      .select('placement')
      .gte('clicked_at', thirtyDaysAgo)
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        const counts: Record<string, number> = {}
        for (const row of res.data) {
          counts[row.placement] = (counts[row.placement] ?? 0) + 1
        }
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([placement, clicks]) => ({ placement, clicks }))
        return { data: sorted }
      }),

    // Daily series — last 14 days for each partner
    supabase
      .from('affiliate_clicks')
      .select('partner, clicked_at')
      .gte('clicked_at', fourteenDaysAgo)
      .order('clicked_at', { ascending: true })
      .then(async (res) => {
        if (res.error || !res.data) return { data: [] }
        // Group by date + partner
        const map: Record<string, Record<string, number>> = {}
        for (const row of res.data) {
          const day = row.clicked_at.slice(0, 10)
          if (!map[day]) map[day] = {}
          map[day][row.partner] = (map[day][row.partner] ?? 0) + 1
        }
        const entries = Object.entries(map)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, partners]) => ({ date, partners }))
        return { data: entries }
      }),
  ])

  const partners = ['safetywing', 'heymondo', 'airalo', 'saily', 'wayaway', 'kiwi']

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              VisitPlane Admin
            </p>
            <h1 className="text-2xl font-extrabold text-[#1F2937]">Affiliate Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/data-quality"
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← Data Quality
            </Link>
            <span className="text-xs text-gray-400">
              {now.toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Lifetime clicks"
            value={(totalClicks ?? 0).toLocaleString()}
            sub="All time"
            color="teal"
          />
          <StatCard
            label="Last 30 days"
            value={(last30Clicks ?? 0).toLocaleString()}
            sub="Clicks"
            color="indigo"
          />
          <StatCard
            label="EPC target"
            value="$0.30+"
            sub="Goal by month 2"
            color="amber"
          />
          <StatCard
            label="Active streams"
            value="3"
            sub="Insurance · eSIM · Flights"
            color="rose"
          />
        </div>

        {/* ── Conversions note ────────────────────────────────────────────── */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>💰 EPC & Conversions:</strong> Connect Travelpayouts API to see actual
          conversion rates. Add your{' '}
          <code className="rounded bg-amber-100 px-1 text-xs">TRAVELPAYOUTS_API_KEY</code>{' '}
          to <code className="rounded bg-amber-100 px-1 text-xs">.env.local</code>.
          Until then, track conversion rate manually via each partner dashboard.
        </div>

        {/* ── Two-column: by partner + by placement ───────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Clicks per partner */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#1F2937]">
              Clicks by Partner <span className="font-normal text-gray-400 text-sm">(last 30 days)</span>
            </h2>
            {(byPartner ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No clicks yet — deploy and start sending traffic.</p>
            ) : (
              <div className="space-y-3">
                {(byPartner ?? []).map(({ partner, clicks }: { partner: string; clicks: number }) => {
                  const maxClicks = Math.max(...(byPartner ?? []).map((r: { clicks: number }) => r.clicks), 1)
                  const pct = Math.round((clicks / maxClicks) * 100)
                  return (
                    <div key={partner}>
                      <div className="mb-1 flex items-center justify-between">
                        <PartnerBadge partner={partner} />
                        <span className="text-sm font-bold text-[#1F2937]">{clicks}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-[#14B8A6] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Clicks per placement */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#1F2937]">
              Clicks by Placement <span className="font-normal text-gray-400 text-sm">(last 30 days)</span>
            </h2>
            {(topPlacements ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {(topPlacements ?? []).map(({ placement, clicks }: { placement: string; clicks: number }) => {
                  const maxClicks = Math.max(...(topPlacements ?? []).map((r: { clicks: number }) => r.clicks), 1)
                  const pct = Math.round((clicks / maxClicks) * 100)
                  return (
                    <div key={placement}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {placement.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-[#1F2937]">{clicks}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-indigo-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Daily series heatmap ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#1F2937]">
            Daily Clicks — Last 14 Days
          </h2>
          {(dailySeries ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-400">Date</th>
                    {partners.map(p => (
                      <th key={p} className="py-2 px-2 text-center text-xs font-semibold text-gray-400 capitalize">
                        {p}
                      </th>
                    ))}
                    <th className="py-2 pl-4 text-right text-xs font-semibold text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(dailySeries ?? []).map(({ date, partners: partnerCounts }: { date: string; partners: Record<string, number> }) => {
                    const total = Object.values(partnerCounts).reduce((a: number, b: number) => a + b, 0)
                    return (
                      <tr key={date} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2 pr-4 text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        {partners.map(p => (
                          <td key={p} className="py-2 px-2 text-center text-xs">
                            {partnerCounts[p] ? (
                              <span className="font-semibold text-[#1F2937]">{partnerCounts[p]}</span>
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        ))}
                        <td className="py-2 pl-4 text-right text-xs font-bold text-[#1F2937]">{total}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Top routes ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#1F2937]">
            Top Routes <span className="font-normal text-gray-400 text-sm">(last 30 days)</span>
          </h2>
          {(topRoutes ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No route data yet. Route tracking requires visitors to come from visa pages.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 pr-6 text-left text-xs font-semibold text-gray-400">#</th>
                    <th className="py-2 text-left text-xs font-semibold text-gray-400">Route</th>
                    <th className="py-2 text-right text-xs font-semibold text-gray-400">Clicks</th>
                    <th className="py-2 pl-6 text-right text-xs font-semibold text-gray-400">Est. EPC</th>
                  </tr>
                </thead>
                <tbody>
                  {(topRoutes ?? []).map(({ route, clicks }: { route: string; clicks: number }, i: number) => (
                    <tr key={route} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-6 text-xs text-gray-400">{i + 1}</td>
                      <td className="py-2.5 font-medium text-[#1F2937]">{route}</td>
                      <td className="py-2.5 text-right font-bold text-[#1F2937]">{clicks}</td>
                      <td className="py-2.5 pl-6 text-right text-xs text-gray-400">
                        ~${(clicks * 0.30).toFixed(2)} est.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Affiliate IDs setup guide ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-[#1F2937]">📋 Affiliate IDs Setup</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add these to your <code className="rounded bg-gray-100 px-1 text-xs">.env.local</code>{' '}
            and Vercel environment variables once your applications are approved.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 text-left text-xs font-semibold text-gray-400">Partner</th>
                  <th className="py-2 text-left text-xs font-semibold text-gray-400">Env Variable</th>
                  <th className="py-2 text-left text-xs font-semibold text-gray-400">Apply At</th>
                  <th className="py-2 text-left text-xs font-semibold text-gray-400">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { partner: 'SafetyWing', env: 'NEXT_PUBLIC_SAFETYWING_ID', url: 'safetywing.com/partners', payout: '$10/signup' },
                  { partner: 'HeyMondo', env: 'NEXT_PUBLIC_HEYMONDO_ID', url: 'heymondo.com/affiliates', payout: '8-10% commission' },
                  { partner: 'Airalo', env: 'NEXT_PUBLIC_AIRALO_CODE', url: 'partners.airalo.com', payout: '7% commission' },
                  { partner: 'Saily', env: 'NEXT_PUBLIC_SAILY_CODE', url: 'nordvpn.com/affiliates', payout: 'Competitive' },
                  { partner: 'WayAway', env: 'NEXT_PUBLIC_WAYAWAY_PROGRAM_ID', url: 'tp.media (Travelpayouts)', payout: 'Up to 50% profit share' },
                  { partner: 'Kiwi.com', env: 'NEXT_PUBLIC_KIWI_PROGRAM_ID', url: 'tp.media (Travelpayouts)', payout: 'Per booking' },
                  { partner: 'Travelpayouts', env: 'NEXT_PUBLIC_TP_MARKER', url: 'travelpayouts.com', payout: 'Unified dashboard' },
                ].map(({ partner, env, url, payout }) => (
                  <tr key={env} className="hover:bg-gray-50/50">
                    <td className="py-2.5 font-medium text-[#1F2937]">{partner}</td>
                    <td className="py-2.5">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-teal-700">{env}</code>
                    </td>
                    <td className="py-2.5 text-xs text-gray-500">{url}</td>
                    <td className="py-2.5 text-xs font-semibold text-emerald-600">{payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
