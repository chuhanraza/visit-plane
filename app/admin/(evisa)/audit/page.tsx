import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listAudit } from '@/lib/admin/data'

export const metadata: Metadata = { title: 'Audit log — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminAudit({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const { rows, total, pageSize } = await listAudit({ page, entityType: sp.entity })
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Audit log <span className="text-gray-500 text-sm font-normal">({total})</span></h1>
      <div className="flex gap-2 text-sm">
        {['', 'order', 'invoice', 'service'].map(e => (
          <Link key={e || 'all'} href={e ? `/admin/audit?entity=${e}` : '/admin/audit'}
            className={`px-3 py-1.5 rounded-lg capitalize ${(sp.entity ?? '') === e ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>{e || 'All'}</Link>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr><th className="text-left font-medium px-4 py-3">When</th><th className="text-left font-medium px-4 py-3">Actor</th><th className="text-left font-medium px-4 py-3">Action</th><th className="text-left font-medium px-4 py-3 hidden md:table-cell">Entity</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No audit entries.</td></tr>}
            {rows.map((a: Record<string, unknown>) => (
              <tr key={a.id as string} className="hover:bg-gray-800/40 align-top">
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{new Date(a.created_at as string).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-300">{a.actor as string}</td>
                <td className="px-4 py-2.5 text-gray-200 font-mono text-xs">{a.action as string}</td>
                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">
                  {a.entity_type ? <Link href={`/admin/${(a.entity_type as string) === 'order' ? 'orders' : a.entity_type as string + 's'}/${a.entity_id}`} className="hover:text-white">{a.entity_type as string}</Link> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          {page > 1 && <Link href={`/admin/audit?${new URLSearchParams({ ...sp, page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</Link>}
          {page < pages && <Link href={`/admin/audit?${new URLSearchParams({ ...sp, page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</Link>}
        </div>
      )}
    </div>
  )
}
