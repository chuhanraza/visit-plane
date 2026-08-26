/**
 * /admin/data-quality/conflicts
 * ─────────────────────────────────────────────────────────────────────────────
 * Human-review queue for the 5,319 `destinations` passport→destination pairs
 * whose duplicate rows disagree on visa_type itself (visa-data-review.md §2 —
 * the most dangerous class of duplicate: a traveller could see "Visa Free" on
 * one part of the site and "Visa Required" on another for the same route).
 *
 * This page and its detail view NEVER edit or delete a `destinations` row.
 * Resolving a pair only writes to `destination_conflict_resolutions` (a
 * separate audit table) — a wrong click here cannot corrupt live visa data.
 * Physical dedupe of losing rows is a deliberate, separate follow-up.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Visa-Type Conflicts — Visitplane Admin' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface ConflictRow {
  passport_country: string
  country_name: string
  row_count: number
  distinct_type_count: number
  visa_types: string[]
}

async function fetchConflicts(q: string, status: 'all' | 'unresolved' | 'resolved', page: number) {
  const svc = getServiceClient()

  let query = svc
    .from('destination_visa_type_conflicts')
    .select('passport_country, country_name, row_count, distinct_type_count, visa_types', { count: 'exact' })
    .order('passport_country', { ascending: true })
    .order('country_name', { ascending: true })

  if (q) {
    query = query.or(`passport_country.ilike.%${q}%,country_name.ilike.%${q}%`)
  }

  const { data, count, error } = await query
  if (error) {
    console.error('[admin/conflicts] view query error:', error.message)
    return { rows: [] as ConflictRow[], total: 0, resolvedKeys: new Set<string>() }
  }
  const all = (data ?? []) as ConflictRow[]

  // Resolution status is looked up for the WHOLE filtered set (not just the
  // current page) so status filtering + counts stay accurate; 5,319 rows max,
  // fetched as a key set only (no row payload) so this stays cheap.
  const { data: resolutions } = await svc
    .from('destination_conflict_resolutions')
    .select('passport_country, country_name')
  const resolvedKeys = new Set((resolutions ?? []).map(r => `${r.passport_country}→${r.country_name}`))

  const filtered = status === 'all'
    ? all
    : all.filter(r => {
        const isResolved = resolvedKeys.has(`${r.passport_country}→${r.country_name}`)
        return status === 'resolved' ? isResolved : !isResolved
      })

  const total = filtered.length
  const start = (page - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  return { rows, total, resolvedKeys, totalUnfiltered: count ?? all.length }
}

export default async function ConflictsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; resolved?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const status = (sp.status === 'resolved' || sp.status === 'unresolved') ? sp.status : 'unresolved'
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const { rows, total, resolvedKeys } = await fetchConflicts(q, status as 'all' | 'unresolved' | 'resolved', page)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const qs = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({ q, status, page: String(page), ...overrides })
    if (!params.get('q')) params.delete('q')
    return `?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-gray-400 mb-1">
              <Link href="/admin/data-quality" className="hover:text-teal-600">Data Quality</Link> / Conflicts
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Visa-Type Conflicts</h1>
            <p className="text-gray-500 text-sm mt-1">
              Routes where duplicate rows in <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">destinations</code> disagree
              on <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">visa_type</code> itself — e.g. one row says
              &ldquo;Visa Free&rdquo;, another says &ldquo;Visa Required&rdquo;, for the same passport→destination.
              Each must be checked against an official source; nothing here is auto-resolved.
            </p>
          </div>
          <Link href="/admin/data-quality" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition whitespace-nowrap">
            ← Data Quality
          </Link>
        </div>

        {sp.resolved && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ Recorded decision for <strong>{sp.resolved}</strong>.
          </div>
        )}

        {/* Filters */}
        <form className="mb-5 flex flex-wrap items-center gap-3" action="/admin/data-quality/conflicts" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search passport or destination…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-64"
          />
          <input type="hidden" name="status" value={status} />
          <button type="submit" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
            Search
          </button>
          <div className="flex gap-1 ml-auto">
            {(['unresolved', 'resolved', 'all'] as const).map(s => (
              <Link
                key={s}
                href={`/admin/data-quality/conflicts${qs({ status: s, page: '1' })}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  status === s ? 'bg-[#14B8A6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'unresolved' ? 'Unresolved' : s === 'resolved' ? 'Resolved' : 'All'}
              </Link>
            ))}
          </div>
        </form>

        <p className="text-xs text-gray-400 mb-3">{total.toLocaleString()} pair{total === 1 ? '' : 's'} matching this filter</p>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Route</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Conflicting visa_type values</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rows</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No conflicts match this filter.
                  </td>
                </tr>
              ) : rows.map(r => {
                const key = `${r.passport_country}→${r.country_name}`
                const isResolved = resolvedKeys?.has(key) ?? false
                return (
                  <tr key={key}>
                    <td className="px-4 py-3 font-medium text-[#1F2937]">
                      {r.passport_country} → {r.country_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {r.visa_types.join(' · ')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.row_count}</td>
                    <td className="px-4 py-3">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 text-xs font-medium">
                          ✓ resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-medium">
                          needs review
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/data-quality/conflicts/${encodeURIComponent(r.passport_country)}/${encodeURIComponent(r.country_name)}`}
                        className="text-teal-600 hover:underline text-xs font-medium"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 text-sm">
            <Link
              href={`/admin/data-quality/conflicts${qs({ page: String(Math.max(1, page - 1)) })}`}
              className={`px-3 py-1.5 rounded-lg border border-gray-300 ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-gray-100'}`}
            >
              ← Prev
            </Link>
            <span className="text-gray-500 text-xs">Page {page} of {totalPages}</span>
            <Link
              href={`/admin/data-quality/conflicts${qs({ page: String(Math.min(totalPages, page + 1)) })}`}
              className={`px-3 py-1.5 rounded-lg border border-gray-300 ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-gray-100'}`}
            >
              Next →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
