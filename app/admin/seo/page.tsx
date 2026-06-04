/**
 * /admin/seo
 * ─────────────────────────────────────────────────────────────────────────────
 * SEO Operations Dashboard
 *
 * Sections:
 *  1. Overview stats (total pages, published, pending, failed, GSC clicks)
 *  2. Quality gate breakdown (word count, uniqueness, Flesch, sources)
 *  3. Generation pipeline (by template + launch phase)
 *  4. Top traffic pages (from GSC via seo_page_content.gsc_clicks)
 *  5. Recent generation jobs
 *  6. Quick actions (trigger generation, bulk publish)
 *
 * Auth: x-admin-secret header OR admin_secret cookie
 */

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'SEO Dashboard — Visitplane Admin' }
export const dynamic = 'force-dynamic'

// ── Auth guard ────────────────────────────────────────────────────────────────

function parseCookie(cookieHeader: string, name: string): string {
  const match = cookieHeader.split(';').map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

async function checkAdmin() {
  const hdrs   = await headers()
  const secret = hdrs.get('x-admin-secret') ?? ''
  const cookie = hdrs.get('cookie') ?? ''
  const cookieVal = parseCookie(cookie, 'admin_secret')
  return secret === process.env.ADMIN_SECRET ||
         cookieVal === process.env.ADMIN_SECRET
}

// ── Supabase ──────────────────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ── Data types ────────────────────────────────────────────────────────────────

type TemplateStat = {
  template: string
  total: number
  published: number
  pending: number
  failed: number
  avg_word_count: number
  avg_quality_score: number
}

type TopPage = {
  url_slug: string
  title: string
  gsc_clicks: number
  gsc_impressions: number
  gsc_ctr: number
  gsc_position: number
  published: boolean
}

type QualityBreakdown = {
  total_passed: number
  total_failed: number
  failed_word_count: number
  failed_uniqueness: number
  failed_sources: number
  failed_flesch: number
  failed_route_specific: number
  failed_ai_phrases: number
}

type GenerationJob = {
  id: string
  phase: number
  total_routes: number
  completed: number
  failed: number
  status: string
  started_at: string
  finished_at: string | null
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getDashboardData() {
  const supabase = getSupabase()

  const [summaryRes, topPagesRes, qualityRes, jobsRes] = await Promise.all([
    // Template-level summary
    supabase
      .from('seo_page_content')
      .select('template, generation_status, published, word_count, quality_passed')
      .order('template'),

    // Top 20 pages by GSC clicks
    supabase
      .from('seo_page_content')
      .select('url_slug, title, gsc_clicks, gsc_impressions, gsc_ctr, gsc_position, published')
      .order('gsc_clicks', { ascending: false })
      .limit(20),

    // Quality breakdown
    supabase
      .from('seo_page_content')
      .select('quality_passed, quality_failures'),

    // Recent jobs
    supabase
      .from('seo_generation_jobs')
      .select('id, phase, total_routes, completed, failed, status, started_at, finished_at')
      .order('started_at', { ascending: false })
      .limit(10),
  ])

  // ── Process template stats ─────────────────────────────────────────────────
  const rows = summaryRes.data ?? []
  const templateMap: Record<string, TemplateStat> = {}

  for (const row of rows) {
    if (!templateMap[row.template]) {
      templateMap[row.template] = {
        template:          row.template,
        total:             0,
        published:         0,
        pending:           0,
        failed:            0,
        avg_word_count:    0,
        avg_quality_score: 0,
      }
    }
    const s = templateMap[row.template]
    s.total++
    if (row.published)                              s.published++
    if (row.generation_status === 'pending')        s.pending++
    if (row.generation_status === 'failed')         s.failed++
    if (row.word_count)                             s.avg_word_count += row.word_count
    if (row.quality_passed)                         s.avg_quality_score++
  }

  // Finalise averages
  for (const s of Object.values(templateMap)) {
    if (s.total > 0) {
      s.avg_word_count    = Math.round(s.avg_word_count / s.total)
      s.avg_quality_score = Math.round((s.avg_quality_score / s.total) * 100)
    }
  }
  const templateStats = Object.values(templateMap).sort((a, b) => a.template.localeCompare(b.template))

  // ── Process quality breakdown ──────────────────────────────────────────────
  const qualityRows = qualityRes.data ?? []
  const quality: QualityBreakdown = {
    total_passed:          0,
    total_failed:          0,
    failed_word_count:     0,
    failed_uniqueness:     0,
    failed_sources:        0,
    failed_flesch:         0,
    failed_route_specific: 0,
    failed_ai_phrases:     0,
  }

  for (const r of qualityRows) {
    if (r.quality_passed) {
      quality.total_passed++
    } else {
      quality.total_failed++
      const failures: string[] = r.quality_failures ?? []
      if (failures.some(f => f.includes('Word count')))           quality.failed_word_count++
      if (failures.some(f => f.includes('Uniqueness')))           quality.failed_uniqueness++
      if (failures.some(f => f.includes('source')))               quality.failed_sources++
      if (failures.some(f => f.includes('Flesch')))               quality.failed_flesch++
      if (failures.some(f => f.includes('route-specific')))       quality.failed_route_specific++
      if (failures.some(f => f.includes('AI-detector')))          quality.failed_ai_phrases++
    }
  }

  const totalPages      = rows.length
  const totalPublished  = rows.filter(r => r.published).length
  const totalGSCClicks  = (topPagesRes.data ?? []).reduce((sum, p) => sum + (p.gsc_clicks ?? 0), 0)
  const totalImpressions = (topPagesRes.data ?? []).reduce((sum, p) => sum + (p.gsc_impressions ?? 0), 0)

  return {
    totalPages,
    totalPublished,
    totalPending:   rows.filter(r => r.generation_status === 'pending').length,
    totalFailed:    rows.filter(r => r.generation_status === 'failed').length,
    totalGSCClicks,
    totalImpressions,
    templateStats,
    topPages:     (topPagesRes.data ?? []) as TopPage[],
    quality,
    jobs:         (jobsRes.data ?? []) as GenerationJob[],
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color = 'emerald',
}: { label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue:    'bg-blue-50 border-blue-200 text-blue-700',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    red:     'bg-red-50 border-red-200 text-red-700',
    purple:  'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color] ?? colors.emerald}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value.toLocaleString()}</div>
      {sub && <div className="mt-1 text-xs opacity-70">{sub}</div>}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────────

function Badge({ label, variant = 'gray' }: { label: string; variant?: 'green' | 'yellow' | 'red' | 'gray' | 'blue' }) {
  const v: Record<string, string> = {
    green:  'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red:    'bg-red-100 text-red-800',
    gray:   'bg-gray-100 text-gray-700',
    blue:   'bg-blue-100 text-blue-800',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v[variant]}`}>
      {label}
    </span>
  )
}

function statusBadge(status: string) {
  if (status === 'done')     return <Badge label="Done"    variant="green" />
  if (status === 'running')  return <Badge label="Running" variant="blue" />
  if (status === 'error')    return <Badge label="Error"   variant="red" />
  return <Badge label={status} />
}

// ── Main component ────────────────────────────────────────────────────────────

export default async function SEOAdminPage() {
  const isAdmin = await checkAdmin()
  if (!isAdmin) redirect('/admin/login?from=/admin/seo')

  const d = await getDashboardData()

  const qualityPassRate = d.totalPages > 0
    ? Math.round(((d.quality.total_passed) / d.totalPages) * 100)
    : 0

  const TEMPLATE_LABELS: Record<string, string> = {
    template1: 'T1 · Visa Requirements',
    template2: 'T2 · Visa-Free Countries',
    template3: 'T3 · Cheapest Visas',
    template4: 'T4 · Destination Guide',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">Admin</Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-semibold text-gray-800">SEO Dashboard</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">SEO Operations</h1>
          </div>
          <div className="flex gap-3">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Open GSC →
            </a>
            <Link
              href="/admin/seo/generate"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Generate Content
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-8">

        {/* ── Overview stats ───────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Overview</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Pages"   value={d.totalPages}      color="blue" />
            <StatCard label="Published"      value={d.totalPublished}  color="emerald"
                      sub={`${d.totalPages > 0 ? Math.round((d.totalPublished / d.totalPages) * 100) : 0}% of total`} />
            <StatCard label="Pending"        value={d.totalPending}    color="amber" />
            <StatCard label="Failed QA"      value={d.totalFailed}     color="red" />
            <StatCard label="GSC Clicks"     value={d.totalGSCClicks}  color="purple"
                      sub="Last 28 days" />
            <StatCard label="Impressions"    value={d.totalImpressions} color="blue"
                      sub="Last 28 days" />
          </div>
        </section>

        {/* ── Quality gate overview ─────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quality Gates</h2>
          <div className="rounded-xl border bg-white p-6">
            {/* Pass rate progress bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall pass rate</span>
                <span className="text-sm font-bold text-emerald-700">{qualityPassRate}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                  style={{ width: `${qualityPassRate}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{d.quality.total_passed} passed</span>
                <span>{d.quality.total_failed} failed</span>
              </div>
            </div>

            {/* Failure breakdown */}
            {d.quality.total_failed > 0 && (
              <div>
                <div className="mb-3 text-sm font-medium text-gray-700">Failure breakdown</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: 'Word Count',     count: d.quality.failed_word_count },
                    { label: 'Uniqueness',     count: d.quality.failed_uniqueness },
                    { label: 'Sources',        count: d.quality.failed_sources },
                    { label: 'Flesch Score',   count: d.quality.failed_flesch },
                    { label: 'Route Specific', count: d.quality.failed_route_specific },
                    { label: 'AI Phrases',     count: d.quality.failed_ai_phrases },
                  ].map(({ label, count }) => (
                    <div key={label} className={`rounded-lg p-3 text-center ${count > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className={`text-xl font-bold ${count > 0 ? 'text-red-600' : 'text-gray-400'}`}>{count}</div>
                      <div className="mt-1 text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Per-template breakdown ────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">By Template</h2>
          {d.templateStats.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
              No generated pages yet. Use the <strong>Generate Content</strong> button to start.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Template', 'Total', 'Published', 'Pending', 'Failed', 'Avg Words', 'QA Pass %'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.templateStats.map((t) => (
                    <tr key={t.template} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {TEMPLATE_LABELS[t.template] ?? t.template}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-emerald-700 font-medium">{t.published.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-amber-600">{t.pending.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{t.failed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.avg_word_count.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${t.avg_quality_score >= 80 ? 'bg-emerald-500' : t.avg_quality_score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                              style={{ width: `${t.avg_quality_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{t.avg_quality_score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Top traffic pages ─────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Top Traffic Pages <span className="text-sm font-normal text-gray-500">(GSC · last 28d)</span></h2>
          <div className="overflow-hidden rounded-xl border bg-white">
            {d.topPages.filter(p => p.gsc_clicks > 0).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No GSC data yet. Data syncs daily after Google indexes your pages.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['#', 'Page', 'Clicks', 'Impressions', 'CTR', 'Position', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.topPages.filter(p => p.gsc_clicks > 0).map((page, i) => (
                    <tr key={page.url_slug} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://www.visitplane.com/${page.url_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {page.title ?? page.url_slug}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{(page.gsc_clicks ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(page.gsc_impressions ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{page.gsc_ctr ? `${(page.gsc_ctr * 100).toFixed(1)}%` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{page.gsc_position ? page.gsc_position.toFixed(1) : '—'}</td>
                      <td className="px-4 py-3">
                        {page.published
                          ? <Badge label="Live"    variant="green" />
                          : <Badge label="Unpublished" variant="yellow" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Generation jobs ───────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Generation Jobs</h2>
            <div className="flex gap-2">
              {([1, 2, 3, 4] as const).map(phase => (
                <form key={phase} action={`/api/seo/batch`} method="POST">
                  <input type="hidden" name="phase" value={phase} />
                  <button
                    type="submit"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Start Phase {phase}
                  </button>
                </form>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border bg-white">
            {d.jobs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No generation jobs yet. Use <strong>Start Phase 1</strong> above to begin the launch rollout.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Job', 'Phase', 'Progress', 'Failed', 'Status', 'Started', 'Finished'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.jobs.map((job) => {
                    const pct = job.total_routes > 0
                      ? Math.round((job.completed / job.total_routes) * 100)
                      : 0
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{job.id.slice(-12)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Phase {job.phase}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-600">{job.completed}/{job.total_routes}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">{job.failed}</td>
                        <td className="px-4 py-3">{statusBadge(job.status)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(job.started_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {job.finished_at ? new Date(job.finished_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title:  'Generate Single Route',
                desc:   'Trigger Gemini generation for one specific passport→destination route.',
                href:   '/admin/seo/generate',
                emoji:  '⚡',
                color:  'border-emerald-200 hover:border-emerald-400',
              },
              {
                title:  'View Data Quality',
                desc:   'Inspect visa data confidence scores and pending corrections.',
                href:   '/admin/data-quality',
                emoji:  '🔍',
                color:  'border-blue-200 hover:border-blue-400',
              },
              {
                title:  'Open GSC',
                desc:   'Google Search Console — view queries, pages, coverage.',
                href:   'https://search.google.com/search-console',
                emoji:  '📊',
                color:  'border-purple-200 hover:border-purple-400',
                external: true,
              },
              {
                title:  'Sitemap Status',
                desc:   'Check generated sitemaps and submission status.',
                href:   '/sitemap.xml',
                emoji:  '🗺️',
                color:  'border-amber-200 hover:border-amber-400',
                external: true,
              },
            ].map(({ title, desc, href, emoji, color, external }) => (
              <a
                key={title}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className={`group rounded-xl border-2 bg-white p-5 transition-all ${color}`}
              >
                <div className="mb-2 text-3xl">{emoji}</div>
                <div className="font-semibold text-gray-800 group-hover:text-emerald-700">{title}</div>
                <div className="mt-1 text-sm text-gray-500">{desc}</div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
