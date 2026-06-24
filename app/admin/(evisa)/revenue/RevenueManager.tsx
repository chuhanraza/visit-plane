'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MANUAL_ORDER_STATUSES, PRODUCT_TYPES, STATUS_BADGE, type ManualOrderRow } from '@/lib/admin/revenue'

export default function RevenueManager({
  rows, partners, filters, total, page, pageSize,
}: {
  rows: ManualOrderRow[]
  partners: { slug: string; name: string }[]
  filters: { q: string; status: string }
  total: number
  page: number
  pageSize: number
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const pages = Math.max(1, Math.ceil(total / pageSize))

  async function changeStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/revenue/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) router.refresh()
    else alert((await res.json().catch(() => ({}))).error || 'Status change failed')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form method="get" className="flex flex-wrap items-center gap-2 text-sm">
          <input name="q" defaultValue={filters.q} placeholder="Search ref / email…" className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 w-44" />
          <select name="status" defaultValue={filters.status} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-gray-200">
            <option value="">Any status</option>
            {MANUAL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">Filter</button>
        </form>
        <button onClick={() => setShowForm(v => !v)} className="ml-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm">
          {showForm ? 'Close' : '+ New manual order'}
        </button>
      </div>

      {showForm && <NewOrderForm partners={partners} onCreated={() => { setShowForm(false); router.refresh() }} />}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="text-left font-medium px-4 py-3">Ref</th>
              <th className="text-left font-medium px-4 py-3">Customer</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Type</th>
              <th className="text-right font-medium px-4 py-3">Amount</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No manual orders yet.</td></tr>}
            {rows.map(o => (
              <tr key={o.id} className="hover:bg-gray-800/40 align-middle">
                <td className="px-4 py-2.5 text-white font-mono text-xs">{o.order_ref}</td>
                <td className="px-4 py-2.5 text-gray-300">{o.customer_email}</td>
                <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{o.product_type}{o.affiliate_partner ? ` · ${o.affiliate_partner}` : ''}</td>
                <td className="px-4 py-2.5 text-right text-gray-200 whitespace-nowrap">{o.currency} {Number(o.amount).toFixed(2)}{o.commission_amount > 0 && <span className="block text-[10px] text-gray-500">comm {Number(o.commission_amount).toFixed(2)}</span>}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={o.status}
                    onChange={e => changeStatus(o.id, e.target.value)}
                    className={`text-[11px] rounded-full px-2 py-0.5 border-0 cursor-pointer ${STATUS_BADGE[o.status as keyof typeof STATUS_BADGE] ?? 'bg-gray-700 text-gray-200'}`}
                  >
                    {MANUAL_ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-gray-900 text-gray-200">{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} order{total === 1 ? '' : 's'}</span>
        {pages > 1 && (
          <div className="flex gap-2">
            {page > 1 && <a href={`?${new URLSearchParams({ ...filters, page: String(page - 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Prev</a>}
            <span className="px-2 py-1.5">Page {page} / {pages}</span>
            {page < pages && <a href={`?${new URLSearchParams({ ...filters, page: String(page + 1) })}`} className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-200">Next</a>}
          </div>
        )}
      </div>
    </div>
  )
}

function NewOrderForm({ partners, onCreated }: { partners: { slug: string; name: string }[]; onCreated: () => void }) {
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true); setErr('')
    const f = new FormData(e.currentTarget)
    const body = {
      customer_email: f.get('customer_email'),
      product_type: f.get('product_type'),
      amount: f.get('amount'),
      currency: f.get('currency') || 'USD',
      status: f.get('status'),
      affiliate_partner: f.get('affiliate_partner') || null,
      commission_amount: f.get('commission_amount') || 0,
      source: f.get('source') || null,
      notes: f.get('notes') || null,
    }
    const res = await fetch('/api/admin/revenue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) onCreated()
    else { setErr((await res.json().catch(() => ({}))).error || 'Create failed'); setSaving(false) }
  }

  const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 w-full'
  return (
    <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
      <label className="text-xs text-gray-400 space-y-1"><span>Customer email *</span><input name="customer_email" type="email" required className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Product type</span>
        <select name="product_type" defaultValue="affiliate" className={inp}>{PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}</select>
      </label>
      <label className="text-xs text-gray-400 space-y-1"><span>Amount *</span><input name="amount" type="number" step="0.01" min="0" required className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Currency</span><input name="currency" defaultValue="USD" maxLength={3} className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Status</span>
        <select name="status" defaultValue="pending" className={inp}>{MANUAL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </label>
      <label className="text-xs text-gray-400 space-y-1"><span>Affiliate partner</span>
        <select name="affiliate_partner" defaultValue="" className={inp}><option value="">—</option>{partners.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
      </label>
      <label className="text-xs text-gray-400 space-y-1"><span>Commission amount</span><input name="commission_amount" type="number" step="0.01" min="0" defaultValue="0" className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Source</span><input name="source" placeholder="e.g. blog_post, referral" className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1 sm:col-span-2"><span>Notes</span><textarea name="notes" rows={2} className={inp} /></label>
      {err && <p className="text-red-400 text-sm sm:col-span-2">{err}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white text-sm">{saving ? 'Saving…' : 'Create order'}</button>
      </div>
    </form>
  )
}
