import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listLeads, leadSources, listCorrections, type OptInStatus } from '@/lib/admin/leads'
import LeadsTable from './LeadsTable'

export const metadata: Metadata = { title: 'Leads / CRM — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminLeads({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const tab = sp.tab === 'corrections' ? 'corrections' : 'leads'
  const page = parseInt(sp.page ?? '1', 10) || 1

  const Tab = ({ id, label }: { id: string; label: string }) => (
    <Link href={`/admin/leads?tab=${id}`} className={`px-3 py-1.5 rounded-lg text-sm ${tab === id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:text-white'}`}>{label}</Link>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Leads / CRM</h1>
        <div className="flex gap-2">
          <Tab id="leads" label="Email leads" />
          <Tab id="corrections" label="Data corrections" />
        </div>
      </div>

      {tab === 'leads' ? await LeadsTab(sp, page) : await CorrectionsTab(page)}
    </div>
  )
}

async function LeadsTab(sp: Record<string, string>, page: number) {
  const filters = { q: sp.q ?? '', source: sp.source ?? '', status: (sp.status ?? '') as OptInStatus | '' }
  const [{ rows, total, pageSize }, sources] = await Promise.all([
    listLeads({ ...filters, page }),
    leadSources(),
  ])
  return (
    <LeadsTable
      rows={rows} sources={sources}
      filters={{ q: filters.q, source: filters.source, status: filters.status }}
      total={total} page={page} pageSize={pageSize}
    />
  )
}

async function CorrectionsTab(page: number) {
  const { rows, total, pageSize } = await listCorrections({ page })
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left font-medium px-4 py-3">Route</th>
              <th className="text-left font-medium px-4 py-3">What's wrong</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Correction</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No user-submitted corrections yet.</td></tr>}
            {rows.map(c => (
              <tr key={c.id} className="hover:bg-gray-800/40 align-top">
                <td className="px-4 py-2.5 text-gray-300 whitespace-nowrap">{[c.passport_iso, c.destination_iso].filter(Boolean).join(' → ') || '—'}</td>
                <td className="px-4 py-2.5 text-white max-w-xs">{c.what_is_wrong}</td>
                <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell max-w-xs">{c.corrected_value || '—'}{c.source_url ? <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="block text-blue-400 text-xs hover:underline">source ↗</a> : null}</td>
                <td className="px-4 py-2.5"><span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 capitalize">{c.status}</span></td>
                <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          {page > 1 && <Link href={`/admin/leads?tab=corrections&page=${page - 1}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</Link>}
          {page < pages && <Link href={`/admin/leads?tab=corrections&page=${page + 1}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</Link>}
        </div>
      )}
    </div>
  )
}
