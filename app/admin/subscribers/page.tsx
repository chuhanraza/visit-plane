/**
 * /admin/subscribers
 * ─────────────────────────────────────────────────────────────────
 * Email subscriber analytics dashboard.
 * Auth: same cookie/header pattern as other admin pages.
 */

import { createClient } from '@supabase/supabase-js'
import { redirect }     from 'next/navigation'
import { headers }      from 'next/headers'
import Link             from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Subscribers — VisitPlane Admin' }
export const dynamic = 'force-dynamic'

// ── Auth ──────────────────────────────────────────────────────────

function parseCookie(cookieHeader: string, name: string): string {
  const match = cookieHeader.split(';').map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

async function checkAdmin() {
  const hdrs      = await headers()
  const secret    = hdrs.get('x-admin-secret') ?? ''
  const cookie    = hdrs.get('cookie') ?? ''
  const cookieVal = parseCookie(cookie, 'admin_secret')
  return secret === process.env.ADMIN_SECRET ||
         cookieVal === process.env.ADMIN_SECRET
}

// ── Supabase ──────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ── Data helpers ──────────────────────────────────────────────────

interface Subscriber {
  email:             string
  route_passport:    string | null
  route_destination: string | null
  captured_at:       string
  captured_from:     string
  confirmed_at:      string | null
  unsubscribed_at:   string | null
}

async function fetchAll(): Promise<Subscriber[]> {
  const { data, error } = await getSupabase()
    .from('email_subscribers')
    .select('email,route_passport,route_destination,captured_at,captured_from,confirmed_at,unsubscribed_at')
    .order('captured_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []) as Subscriber[]
}

// ── Page ──────────────────────────────────────────────────────────

export default async function SubscribersPage() {
  const ok = await checkAdmin()
  if (!ok) redirect('/admin/login?from=/admin/subscribers')

  const all = await fetchAll()

  const total        = all.length
  const confirmed    = all.filter(s => s.confirmed_at).length
  const unconfirmed  = total - confirmed
  const unsubscribed = all.filter(s => s.unsubscribed_at).length
  const active       = confirmed - unsubscribed

  // Source breakdown
  const sourceMap: Record<string, number> = {}
  for (const s of all) {
    const k = s.captured_from ?? 'unknown'
    sourceMap[k] = (sourceMap[k] ?? 0) + 1
  }

  // Top passport-destination pairs
  const routeMap: Record<string, number> = {}
  for (const s of all) {
    if (s.route_passport && s.route_destination) {
      const k = `${s.route_passport} → ${s.route_destination}`
      routeMap[k] = (routeMap[k] ?? 0) + 1
    }
  }
  const topRoutes = Object.entries(routeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Daily signups — last 30 days
  const today = new Date()
  const dailyMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const s of all) {
    const day = s.captured_at.slice(0, 10)
    if (day in dailyMap) dailyMap[day]++
  }
  const dailyEntries = Object.entries(dailyMap)
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1)

  // CSV export data (base64-encoded for client download)
  const csvRows = [
    ['email','passport','destination','captured_from','captured_at','confirmed_at','unsubscribed_at'],
    ...all.map(s => [
      s.email,
      s.route_passport ?? '',
      s.route_destination ?? '',
      s.captured_from ?? '',
      s.captured_at ?? '',
      s.confirmed_at ?? '',
      s.unsubscribed_at ?? '',
    ]),
  ]
  const csvContent = csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const csvB64 = Buffer.from(csvContent).toString('base64')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/seo" className="text-gray-400 hover:text-white text-sm transition">← SEO</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm font-semibold">Subscribers</span>
        <div className="ml-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition">← Site</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Email Subscribers</h1>
            <p className="text-gray-400 text-sm mt-1">All 3 capture points: homepage, visa pages, exit intent</p>
          </div>
          <form action="/api/admin/export-subscribers" method="GET">
            <button
              type="button"
              onClick={`(() => {
                const a = document.createElement('a');
                a.href = 'data:text/csv;base64,${csvB64}';
                a.download = 'visitplane_subscribers_${new Date().toISOString().slice(0,10)}.csv';
                a.click();
              })()`}
              className="rounded-xl bg-gray-800 border border-gray-700 px-5 py-2.5 text-sm font-semibold hover:bg-gray-700 transition"
              id="csv-export-btn"
            >
              ↓ Export CSV
            </button>
          </form>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',        value: total,        color: 'text-white'          },
            { label: 'Confirmed',    value: confirmed,    color: 'text-emerald-400'    },
            { label: 'Unconfirmed',  value: unconfirmed,  color: 'text-amber-400'      },
            { label: 'Active',       value: active,       color: 'text-teal-400'       },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Daily trend */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Daily Sign-ups — Last 30 Days</h2>
            <div className="flex items-end gap-1 h-32">
              {dailyEntries.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-teal-500 rounded-t group-hover:bg-teal-400 transition"
                    style={{ height: `${Math.max(2, (count / maxDaily) * 112)}px` }}
                    title={`${day}: ${count}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>{dailyEntries[0]?.[0]?.slice(5)}</span>
              <span>{dailyEntries[dailyEntries.length - 1]?.[0]?.slice(5)}</span>
            </div>
          </div>

          {/* Source breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Sign-up Source</h2>
            <div className="space-y-3">
              {Object.entries(sourceMap).sort((a,b) => b[1]-a[1]).map(([src, n]) => (
                <div key={src}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{src.replace(/_/g, ' ')}</span>
                    <span className="text-gray-400 font-mono">{n}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(n / Math.max(total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(sourceMap).length === 0 && (
                <p className="text-gray-600 text-sm">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Top routes ──────────────────────────────────────── */}
        {topRoutes.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Top Subscribed Routes</h2>
            <div className="space-y-2">
              {topRoutes.map(([route, n], i) => (
                <div key={route} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 w-5 text-right shrink-0">{i + 1}.</span>
                  <span className="text-gray-200 flex-1">{route}</span>
                  <span className="text-teal-400 font-mono shrink-0">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Subscriber table ────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-300">Recent Subscribers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Email</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Signed up</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {all.slice(0, 100).map(s => (
                  <tr key={s.email} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-3 text-gray-200 font-mono text-xs">{s.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {s.route_passport && s.route_destination
                        ? `${s.route_passport} → ${s.route_destination}`
                        : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300 capitalize">
                        {(s.captured_from ?? 'unknown').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(s.captured_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {s.unsubscribed_at ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-950 border border-red-800 px-2 py-0.5 text-[11px] text-red-400">Unsub</span>
                      ) : s.confirmed_at ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[11px] text-emerald-400">✓ Confirmed</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 border border-amber-800 px-2 py-0.5 text-[11px] text-amber-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
                {all.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                      No subscribers yet. Submissions will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {all.length > 100 && (
              <p className="px-6 py-3 text-xs text-gray-600 border-t border-gray-800">
                Showing 100 of {all.length} — export CSV for full list
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CSV export script */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('csv-export-btn')?.addEventListener('click', function() {
          const a = document.createElement('a');
          a.href = 'data:text/csv;base64,${csvB64}';
          a.download = 'visitplane_subscribers_${new Date().toISOString().slice(0,10)}.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      `}} />
    </div>
  )
}
