/**
 * /admin/data-quality/conflicts/[passport]/[destination]
 * ─────────────────────────────────────────────────────────────────────────────
 * Detail/review view for one visa_type-conflicting pair. Shows every duplicate
 * `destinations` row side by side so an admin can check each against an
 * official source and record a decision. Submitting the form only writes to
 * `destination_conflict_resolutions` via /api/admin/conflicts/resolve — it
 * NEVER edits or deletes the underlying `destinations` rows.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}): Promise<Metadata> {
  const { passport, destination } = await params
  return { title: `${decodeURIComponent(passport)} → ${decodeURIComponent(destination)} — Conflict Review` }
}

interface DestRow {
  id: number
  visa_type: string | null
  pricing: string | null
  processing_time: string | null
  validity: string | null
  last_verified: string | null
  official_source_url: string | null
  data_confidence: string | null
  notes: string | null
}

interface Resolution {
  decision: 'kept_row' | 'needs_research' | 'flagged_corrupt'
  kept_row_id: number | null
  note: string | null
  resolved_by: string
  resolved_at: string
}

export default async function ConflictDetailPage({
  params,
}: {
  params: Promise<{ passport: string; destination: string }>
}) {
  await requireAdmin()
  const { passport: passportSlug, destination: destinationSlug } = await params
  const passport_country = decodeURIComponent(passportSlug)
  const country_name = decodeURIComponent(destinationSlug)

  const svc = getServiceClient()
  const [{ data: rows, error }, { data: resolution }] = await Promise.all([
    svc
      .from('destinations')
      .select('id, visa_type, pricing, processing_time, validity, last_verified, official_source_url, data_confidence, notes')
      .eq('passport_country', passport_country)
      .eq('country_name', country_name)
      .order('id', { ascending: true }),
    svc
      .from('destination_conflict_resolutions')
      .select('decision, kept_row_id, note, resolved_by, resolved_at')
      .eq('passport_country', passport_country)
      .eq('country_name', country_name)
      .maybeSingle(),
  ])

  if (error) console.error('[admin/conflicts detail] error:', error.message)
  const destRows = (rows ?? []) as DestRow[]
  if (destRows.length === 0) notFound()
  const res = resolution as Resolution | null

  const distinctTypes = Array.from(new Set(destRows.map(r => r.visa_type ?? '(none)')))
  const isRealConflict = distinctTypes.length > 1

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

        <div className="text-xs text-gray-400 mb-1">
          <Link href="/admin/data-quality" className="hover:text-teal-600">Data Quality</Link> /{' '}
          <Link href="/admin/data-quality/conflicts" className="hover:text-teal-600">Conflicts</Link> / Review
        </div>
        <h1 className="text-2xl font-bold text-[#1F2937] mb-1">
          {passport_country} → {country_name}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {destRows.length} rows · {distinctTypes.length} distinct visa_type value{distinctTypes.length === 1 ? '' : 's'}: {distinctTypes.join(' · ')}
        </p>

        {res && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Already resolved: <strong>{res.decision.replace('_', ' ')}</strong>
            {res.kept_row_id ? ` — kept row #${res.kept_row_id}` : ''} by {res.resolved_by} on{' '}
            {new Date(res.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
            {res.note ? <span className="block mt-1 italic">&ldquo;{res.note}&rdquo;</span> : null}
            {' '}Submitting the form below will update this decision.
          </div>
        )}

        {!isRealConflict && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
            Note: this pair currently shows only one distinct visa_type — it may have been edited since this
            page was generated. Refresh to confirm before resolving.
          </div>
        )}

        {/* Rows side by side */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-left font-semibold text-gray-600">Keep this row?</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600">id</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600">visa_type</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600">pricing</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600">processing_time</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600">validity</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600">source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {destRows.map(r => (
                <tr key={r.id} className={res?.kept_row_id === r.id ? 'bg-green-50/60' : ''}>
                  <td className="px-3 py-3">
                    <input type="radio" name="kept_row_id" value={r.id} form="resolve-form" defaultChecked={res?.kept_row_id === r.id} />
                  </td>
                  <td className="px-3 py-3 text-gray-400 text-xs">#{r.id}</td>
                  <td className="px-3 py-3 font-medium text-[#1F2937]">{r.visa_type ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{r.pricing ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{r.processing_time ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-600">{r.validity ?? '—'}</td>
                  <td className="px-3 py-3 text-xs">
                    {r.official_source_url ? (
                      <a href={r.official_source_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">source ↗</a>
                    ) : (
                      <span className="text-gray-300">none</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resolution form */}
        <form id="resolve-form" action="/api/admin/conflicts/resolve" method="POST" className="bg-white rounded-2xl border border-gray-200 p-6">
          <input type="hidden" name="passport_country" value={passport_country} />
          <input type="hidden" name="country_name" value={country_name} />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note (what you checked, or the official source you compared against)
          </label>
          <textarea
            name="note"
            rows={3}
            defaultValue={res?.note ?? ''}
            placeholder="e.g. confirmed against gov.uk visa page 2026-08-26 — row #13784 is correct"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="decision"
              value="kept_row"
              className="rounded-full bg-[#14B8A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition"
            >
              ✓ Keep selected row (verified correct)
            </button>
            <button
              type="submit"
              name="decision"
              value="needs_research"
              className="rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
            >
              ? Needs more research
            </button>
            <button
              type="submit"
              name="decision"
              value="flagged_corrupt"
              className="rounded-full border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
            >
              ⚑ Flag as data corruption
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            None of these buttons change or delete any <code>destinations</code> row — they only record your decision for later cleanup.
          </p>
        </form>

        <div className="mt-6">
          <Link href="/admin/data-quality/conflicts" className="text-sm text-gray-500 hover:text-teal-600">← Back to conflicts list</Link>
        </div>
      </div>
    </div>
  )
}
