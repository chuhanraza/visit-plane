/**
 * /admin/data-quality
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin dashboard for the visa requirements verification pipeline.
 * Protected by ADMIN_SECRET env var via middleware check.
 *
 * Shows:
 *  - Overall stats (verified / pending / low-confidence / overdue)
 *  - Routes table with confidence badges, last verified, review due
 *  - Flagged routes (IATA mismatch)
 *  - Pending user corrections queue
 */
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Data Quality — Visitplane Admin' }
export const dynamic = 'force-dynamic'

// ─── Auth guard ───────────────────────────────────────────────────────────────
// Simple header-based secret. For production, replace with proper auth.
import { headers } from 'next/headers'

function parseCookie(cookieHeader: string, name: string): string {
  const match = cookieHeader.split(';').map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

async function checkAdminAccess() {
  const hdrs = await headers()
  const secret = hdrs.get('x-admin-secret') ?? ''
  const cookie = hdrs.get('cookie') ?? ''
  const cookieVal = parseCookie(cookie, 'admin_secret')
  return secret === process.env.ADMIN_SECRET || cookieVal === process.env.ADMIN_SECRET
}

// ─── Data fetching ────────────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ISO3 → display name
const ISO3_NAMES: Record<string, string> = {
  PAK: 'Pakistan', ARE: 'UAE', SAU: 'Saudi Arabia', TUR: 'Turkey',
  THA: 'Thailand', MYS: 'Malaysia', GBR: 'United Kingdom', DEU: 'Germany',
  USA: 'United States', CHN: 'China', SGP: 'Singapore', IDN: 'Indonesia',
  LKA: 'Sri Lanka', MDV: 'Maldives', QAT: 'Qatar', OMN: 'Oman',
  AZE: 'Azerbaijan', GEO: 'Georgia', JPN: 'Japan', KOR: 'South Korea',
  NPL: 'Nepal',
}

function countryName(iso3: string) {
  return ISO3_NAMES[iso3] ?? iso3
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchDashboardData() {
  const supabase = getSupabase()

  const [
    { data: routes },
    { data: corrections },
    { data: flagged },
    { data: summary },
  ] = await Promise.all([
    // All routes
    supabase
      .from('visa_requirements')
      .select('id, passport_iso, destination_iso, purpose, visa_category, data_confidence, verified_at, next_review_due, fee_amount, fee_currency, fee_is_free')
      .order('verified_at', { ascending: false, nullsFirst: true }),

    // Pending user corrections
    supabase
      .from('data_corrections')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),

    // Flagged pipeline runs
    supabase
      .from('visa_pipeline_audit')
      .select('passport_iso, destination_iso, purpose, run_at, flag_reason, confidence_set')
      .eq('flagged_for_review', true)
      .order('run_at', { ascending: false })
      .limit(50),

    // Summary stats view
    supabase.from('visa_data_quality_summary').select('*').single(),
  ])

  return { routes: routes ?? [], corrections: corrections ?? [], flagged: flagged ?? [], summary }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-2xl border ${color} p-5`}>
      <div className="text-3xl font-bold text-[#1F2937]">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function ConfidencePill({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles = {
    high:   'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low:    'bg-red-100 text-red-700 border-red-200',
  }
  const dots = { high: '🟢', medium: '🟡', low: '🔴' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[level]}`}>
      {dots[level]} {level}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DataQualityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; secret?: string }>
}) {
  const sp = await searchParams

  // Simple access check — accept ?secret= in URL for convenience
  const isAdmin =
    sp.secret === process.env.ADMIN_SECRET ||
    (await checkAdminAccess())

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Admin Access Required</h1>
          <p className="text-gray-500 text-sm">
            Append <code className="bg-gray-100 px-1 rounded">?secret=YOUR_ADMIN_SECRET</code> to the URL.
          </p>
        </div>
      </div>
    )
  }

  const { routes, corrections, flagged, summary } = await fetchDashboardData()

  const now         = new Date()
  const overdue     = routes.filter(r => r.next_review_due && new Date(r.next_review_due) < now)
  const unverified  = routes.filter(r => !r.verified_at)
  const lowConf     = routes.filter(r => r.data_confidence === 'low')

  const activeTab = sp.tab ?? 'routes'
  const secretQs  = sp.secret ? `?secret=${sp.secret}` : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937]">Data Quality</h1>
            <p className="text-gray-500 text-sm mt-1">
              Visa requirements verification pipeline — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={`/api/visa/run-pipeline${secretQs}`}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              ▶ Run Pipeline
            </a>
            <Link
              href="/"
              className="rounded-full bg-[#14B8A6] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 transition"
            >
              ← Back to Site
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total routes"        value={routes.length}         color="border-gray-200 bg-white" />
          <StatCard label="Verified"            value={routes.length - unverified.length} color="border-green-200 bg-green-50" />
          <StatCard label="Overdue review"      value={overdue.length}        color="border-red-200 bg-red-50" />
          <StatCard label="Pending corrections" value={corrections.length}    color="border-amber-200 bg-amber-50" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="High confidence"   value={summary?.data?.high_confidence ?? '—'}   color="border-green-100 bg-green-50" />
          <StatCard label="Medium confidence" value={summary?.data?.medium_confidence ?? '—'} color="border-amber-100 bg-amber-50" />
          <StatCard label="Low confidence"    value={summary?.data?.low_confidence ?? '—'}    color="border-red-100 bg-red-50" />
          <StatCard label="Flagged by IATA"   value={flagged.length}                          color="border-orange-100 bg-orange-50" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { id: 'routes',      label: `Routes (${routes.length})` },
            { id: 'flagged',     label: `Flagged (${flagged.length})` },
            { id: 'corrections', label: `Corrections (${corrections.length})` },
            { id: 'overdue',     label: `Overdue (${overdue.length})` },
          ].map(tab => (
            <a
              key={tab.id}
              href={`/admin/data-quality?tab=${tab.id}${sp.secret ? `&secret=${sp.secret}` : ''}`}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === tab.id
                  ? 'border-[#14B8A6] text-[#14B8A6]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Routes tab */}
        {activeTab === 'routes' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Route</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Fee</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Confidence</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Verified</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Review Due</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No routes seeded yet. Run the verification pipeline to populate data.
                    </td>
                  </tr>
                ) : routes.map(r => {
                  const isOverdue = r.next_review_due && new Date(r.next_review_due) < now
                  return (
                    <tr key={r.id} className={isOverdue ? 'bg-red-50/50' : ''}>
                      <td className="px-4 py-3 font-medium text-[#1F2937]">
                        {countryName(r.passport_iso)} → {countryName(r.destination_iso)}
                        <span className="ml-2 text-xs text-gray-400">{r.purpose}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.visa_category?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.fee_is_free ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : r.fee_amount ? (
                          `${r.fee_currency} ${r.fee_amount}`
                        ) : (
                          <span className="text-amber-500 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ConfidencePill level={r.data_confidence} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(r.verified_at)}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {fmtDate(r.next_review_due)}
                          {isOverdue && ' ⚑'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/pakistan-to-${r.destination_iso.toLowerCase()}-visa-requirements`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline text-xs"
                        >
                          View ↗
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Flagged tab */}
        {activeTab === 'flagged' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Route</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Confidence Set</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Flag Reason</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Run At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {flagged.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No flagged routes. IATA cross-check found no mismatches.
                    </td>
                  </tr>
                ) : flagged.map((f, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium text-[#1F2937]">
                      {countryName(f.passport_iso)} → {countryName(f.destination_iso)}
                    </td>
                    <td className="px-4 py-3">
                      <ConfidencePill level={f.confidence_set ?? 'low'} />
                    </td>
                    <td className="px-4 py-3 text-red-700 text-xs max-w-xs">{f.flag_reason}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(f.run_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Corrections tab */}
        {activeTab === 'corrections' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Route</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Issue</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Correction</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Submitted</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {corrections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No pending corrections.
                    </td>
                  </tr>
                ) : corrections.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-[#1F2937]">
                      {c.passport_iso && c.destination_iso
                        ? `${countryName(c.passport_iso)} → ${countryName(c.destination_iso)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs max-w-[150px]">{c.what_is_wrong}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">{c.corrected_value ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.source_url ? (
                        <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline truncate block max-w-[150px]">
                          Source ↗
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <form action={`/api/visa/review-correction`} method="POST" className="flex gap-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="secret" value={sp.secret ?? ''} />
                        <button name="action" value="accept"
                          className="rounded px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 transition">
                          Accept
                        </button>
                        <button name="action" value="reject"
                          className="rounded px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 transition">
                          Reject
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Overdue tab */}
        {activeTab === 'overdue' && (
          <div className="space-y-4">
            {overdue.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
                🎉 All routes are within their review window.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-semibold text-[#1F2937]">{overdue.length} routes past review date</p>
                  <a
                    href={`/api/visa/run-pipeline?mode=overdue${sp.secret ? `&secret=${sp.secret}` : ''}`}
                    className="rounded-full bg-[#14B8A6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 transition"
                  >
                    Re-verify all overdue
                  </a>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Route</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Verified</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Was Due</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {overdue.map(r => (
                      <tr key={r.id} className="bg-red-50/30">
                        <td className="px-4 py-3 font-medium text-[#1F2937]">
                          {countryName(r.passport_iso)} → {countryName(r.destination_iso)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(r.verified_at)}</td>
                        <td className="px-4 py-3 text-red-600 font-medium text-xs">{fmtDate(r.next_review_due)}</td>
                        <td className="px-4 py-3">
                          <ConfidencePill level={r.data_confidence} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pipeline instructions */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-bold text-[#1F2937] mb-3">Pipeline Commands</h3>
          <div className="space-y-2 font-mono text-sm text-gray-600">
            <p><span className="text-gray-400"># Single route</span></p>
            <p className="bg-gray-50 rounded px-3 py-2">node scripts/verify-visa-route.mjs PAK ARE tourist</p>
            <p><span className="text-gray-400"># Top 20 routes (rate-limited, ~20 min)</span></p>
            <p className="bg-gray-50 rounded px-3 py-2">node scripts/verify-visa-route.mjs --all-top20</p>
            <p><span className="text-gray-400"># Re-verify all overdue routes</span></p>
            <p className="bg-gray-50 rounded px-3 py-2">node scripts/verify-visa-route.mjs --overdue</p>
            <p><span className="text-gray-400"># Dry-run (no DB write, outputs JSON)</span></p>
            <p className="bg-gray-50 rounded px-3 py-2">node scripts/verify-visa-route.mjs PAK ARE tourist --dry-run</p>
          </div>
        </div>

      </div>
    </div>
  )
}
