import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listCustomers } from '@/lib/admin/data'

export const metadata: Metadata = { title: 'Customers — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const { rows, total, pageSize } = await listCustomers({ q: sp.q, page })
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Customers <span className="text-gray-500 text-sm font-normal">({total})</span></h1>
      <form className="flex gap-2" action="/admin/customers" method="get">
        <input name="q" defaultValue={sp.q ?? ''} placeholder="Search name or email"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-2">Search</button>
        {sp.q && <Link href="/admin/customers" className="text-gray-400 hover:text-white text-sm px-2 py-2">Clear</Link>}
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr><th className="text-left font-medium px-4 py-3">Name</th><th className="text-left font-medium px-4 py-3">Email</th><th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Account</th><th className="text-right font-medium px-4 py-3">Joined</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No customers.</td></tr>}
            {rows.map((c: Record<string, unknown>) => (
              <tr key={c.id as string} className="hover:bg-gray-800/40">
                <td className="px-4 py-3"><Link href={`/admin/customers/${c.id}`} className="text-blue-400 hover:underline">{(c.full_name as string) || '—'}</Link></td>
                <td className="px-4 py-3 text-gray-300">{c.email as string}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.user_id ? 'Registered' : 'Guest'}</td>
                <td className="px-4 py-3 text-right text-gray-500">{new Date(c.created_at as string).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-end gap-2 text-sm">
          {page > 1 && <Link href={`/admin/customers?${new URLSearchParams({ ...sp, page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</Link>}
          {page < pages && <Link href={`/admin/customers?${new URLSearchParams({ ...sp, page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</Link>}
        </div>
      )}
    </div>
  )
}
