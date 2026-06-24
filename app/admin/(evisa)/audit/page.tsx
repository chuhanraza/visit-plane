import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listAudit } from '@/lib/admin/data'

export const metadata: Metadata = { title: 'Audit log — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const ENTITIES = ['', 'order', 'invoice', 'service', 'lead', 'manual_order', 'affiliate_partner', 'affiliate_conversion', 'seo_page', 'email', 'sitemap']

export default async function AdminAudit({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const { rows, total, pageSize } = await listAudit({
    page, entityType: sp.entity, actor: sp.actor, action: sp.action,
    dateFrom: sp.from, dateTo: sp.to,
  })
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600'

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Audit log <span className="text-gray-500 text-sm font-normal">({total})</span></h1>

      <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
        <input name="actor" defaultValue={sp.actor ?? ''} placeholder="Actor…" className={`${inp} w-40`} />
        <input name="action" defaultValue={sp.action ?? ''} placeholder="Action…" className={`${inp} w-40`} />
        <select name="entity" defaultValue={sp.entity ?? ''} className={inp}>
          {ENTITIES.map(e => <option key={e || 'all'} value={e}>{e || 'All entities'}</option>)}
        </select>
        <label className="text-xs text-gray-500 space-y-0.5"><span>From</span><input type="date" name="from" defaultValue={sp.from ?? ''} className={`${inp} block`} /></label>
        <label className="text-xs text-gray-500 space-y-0.5"><span>To</span><input type="date" name="to" defaultValue={sp.to ?? ''} className={`${inp} block`} /></label>
        <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Filter</button>
        <Link href="/admin/audit" className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300">Reset</Link>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left font-medium px-4 py-3">When</th>
              <th className="text-left font-medium px-4 py-3">Actor</th>
              <th className="text-left font-medium px-4 py-3">Action</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Entity</th>
              <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No audit entries match.</td></tr>}
            {rows.map((a: Record<string, unknown>) => (
              <tr key={a.id as string} className="hover:bg-gray-800/40 align-top">
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{new Date(a.created_at as string).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-300">{a.actor as string}</td>
                <td className="px-4 py-2.5 text-gray-200 font-mono text-xs">{a.action as string}</td>
                <td className="px-4 py-2.5 text-gray-500 hidden md:table-cell">{a.entity_type ? `${a.entity_type as string}${a.entity_id ? `:${(a.entity_id as string).slice(0, 8)}` : ''}` : '—'}</td>
                <td className="px-4 py-2.5 hidden lg:table-cell max-w-md">
                  {a.metadata && Object.keys(a.metadata as object).length > 0
                    ? <details><summary className="text-gray-500 cursor-pointer text-xs">view</summary><pre className="text-[11px] text-gray-400 whitespace-pre-wrap break-all mt-1">{JSON.stringify(a.metadata, null, 1)}</pre></details>
                    : <span className="text-gray-700">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          {page > 1 && <Link href={`/admin/audit?${new URLSearchParams({ ...sp, page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</Link>}
          <span className="px-2 py-1.5 text-gray-500">Page {page} / {pages}</span>
          {page < pages && <Link href={`/admin/audit?${new URLSearchParams({ ...sp, page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</Link>}
        </div>
      )}
    </div>
  )
}
