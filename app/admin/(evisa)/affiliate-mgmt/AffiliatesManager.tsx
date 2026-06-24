'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PARTNER_TYPES, CONVERSION_STATUSES, type PartnerPerf, type ConversionRow } from '@/lib/admin/affiliates'

const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-sm text-gray-200 w-full'

export default function AffiliatesManager({ partners, conversions }: { partners: PartnerPerf[]; conversions: ConversionRow[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function savePartner(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/affiliates/partners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) { setEditing(null); setAdding(false); router.refresh() }
    else alert((await res.json().catch(() => ({}))).error || 'Save failed')
  }

  return (
    <div className="space-y-6">
      {/* Partners */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Partners <span className="text-gray-500 text-sm font-normal">({partners.length})</span></h2>
          <button onClick={() => setAdding(v => !v)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm">{adding ? 'Close' : '+ Add partner'}</button>
        </div>

        {adding && <PartnerForm onSave={savePartner} onCancel={() => setAdding(false)} />}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left font-medium px-4 py-3">Partner</th>
                <th className="text-left font-medium px-4 py-3">Type</th>
                <th className="text-right font-medium px-4 py-3">Rate</th>
                <th className="text-right font-medium px-4 py-3">Clicks (life / 30d)</th>
                <th className="text-right font-medium px-4 py-3">Conv.</th>
                <th className="text-right font-medium px-4 py-3">Commission</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {partners.map(p => (
                <FragmentRow key={p.id} p={p} editing={editing === p.id} onEdit={() => setEditing(p.id)} onCancel={() => setEditing(null)} onSave={savePartner} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600">Click tracking is live via <code className="text-gray-400">/go/[partner]</code>. Conversions are recorded manually below until a partner postback/webhook is wired.</p>
      </section>

      {/* Conversions */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">Conversion log <span className="text-gray-500 text-sm font-normal">({conversions.length})</span></h2>
        <ConversionForm partners={partners} onSaved={() => router.refresh()} />
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left font-medium px-4 py-3">When</th>
                <th className="text-left font-medium px-4 py-3">Partner</th>
                <th className="text-right font-medium px-4 py-3">Amount</th>
                <th className="text-right font-medium px-4 py-3">Commission</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {conversions.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No conversions logged yet.</td></tr>}
              {conversions.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{new Date(c.occurred_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-gray-200">{c.partner_slug}</td>
                  <td className="px-4 py-2.5 text-right text-gray-200">{c.currency} {Number(c.amount).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-300">{Number(c.commission_amount).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-gray-400 capitalize">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function FragmentRow({ p, editing, onEdit, onCancel, onSave }: {
  p: PartnerPerf; editing: boolean; onEdit: () => void; onCancel: () => void; onSave: (b: Record<string, unknown>) => void
}) {
  if (editing) {
    return (
      <tr className="bg-gray-800/30">
        <td colSpan={7} className="px-4 py-3">
          <PartnerForm partner={p} onSave={onSave} onCancel={onCancel} />
        </td>
      </tr>
    )
  }
  return (
    <tr className="hover:bg-gray-800/40">
      <td className="px-4 py-2.5">
        <div className="text-white">{p.name} {!p.active && <span className="text-[10px] text-gray-500">(inactive)</span>}</div>
        <div className="text-xs text-gray-600">{p.tracking_link || p.slug}</div>
      </td>
      <td className="px-4 py-2.5 text-gray-400">{p.type}</td>
      <td className="px-4 py-2.5 text-right text-gray-300">{p.commission_rate}{p.commission_model === 'per_signup_usd' ? ' $' : '%'}</td>
      <td className="px-4 py-2.5 text-right text-gray-300">{p.clicksLifetime} / {p.clicks30d}</td>
      <td className="px-4 py-2.5 text-right text-gray-300">{p.conversions}</td>
      <td className="px-4 py-2.5 text-right text-gray-300">{p.commissionEarned.toFixed(2)}</td>
      <td className="px-4 py-2.5 text-right"><button onClick={onEdit} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button></td>
    </tr>
  )
}

function PartnerForm({ partner, onSave, onCancel }: { partner?: PartnerPerf; onSave: (b: Record<string, unknown>) => void; onCancel: () => void }) {
  const [saving, setSaving] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const f = new FormData(e.currentTarget)
    await onSave({
      id: partner?.id,
      slug: f.get('slug'), name: f.get('name'), type: f.get('type'),
      commission_rate: f.get('commission_rate'), commission_model: f.get('commission_model') || null,
      tracking_link: f.get('tracking_link') || null, active: f.get('active') === 'on',
      notes: f.get('notes') || null,
    })
    setSaving(false)
  }
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 items-end">
      <label className="text-xs text-gray-400 space-y-1"><span>Slug</span><input name="slug" defaultValue={partner?.slug} required readOnly={!!partner} className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Name</span><input name="name" defaultValue={partner?.name} required className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Type</span><select name="type" defaultValue={partner?.type ?? 'other'} className={inp}>{PARTNER_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Commission rate</span><input name="commission_rate" type="number" step="0.1" min="0" defaultValue={partner?.commission_rate ?? 0} className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Model</span><input name="commission_model" defaultValue={partner?.commission_model ?? ''} placeholder="percent / per_signup_usd / profit_share" className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Tracking link</span><input name="tracking_link" defaultValue={partner?.tracking_link ?? ''} className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1 sm:col-span-2"><span>Notes</span><input name="notes" defaultValue={partner?.notes ?? ''} className={inp} /></label>
      <label className="text-xs text-gray-400 flex items-center gap-2 pb-2"><input name="active" type="checkbox" defaultChecked={partner?.active ?? true} /> Active</label>
      <div className="flex gap-2 sm:col-span-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm">{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 text-sm">Cancel</button>
      </div>
    </form>
  )
}

function ConversionForm({ partners, onSaved }: { partners: PartnerPerf[]; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true); setErr('')
    const form = e.currentTarget
    const f = new FormData(form)
    const res = await fetch('/api/admin/affiliates/conversions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_slug: f.get('partner_slug'), amount: f.get('amount'), currency: f.get('currency') || 'USD',
        commission_amount: f.get('commission_amount') || 0, customer_email: f.get('customer_email') || null,
        external_ref: f.get('external_ref') || null, status: f.get('status'), source: f.get('source') || null,
      }),
    })
    if (res.ok) { form.reset(); onSaved() }
    else { setErr((await res.json().catch(() => ({}))).error || 'Failed'); setSaving(false) }
  }
  return (
    <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 grid sm:grid-cols-3 lg:grid-cols-4 gap-2 items-end">
      <label className="text-xs text-gray-400 space-y-1"><span>Partner *</span><select name="partner_slug" required className={inp}>{partners.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Amount *</span><input name="amount" type="number" step="0.01" min="0" required className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Commission</span><input name="commission_amount" type="number" step="0.01" min="0" defaultValue="0" className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Currency</span><input name="currency" defaultValue="USD" maxLength={3} className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Status</span><select name="status" defaultValue="pending" className={inp}>{CONVERSION_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Customer email</span><input name="customer_email" type="email" className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>External ref</span><input name="external_ref" className={inp} /></label>
      <label className="text-xs text-gray-400 space-y-1"><span>Source</span><input name="source" placeholder="placement" className={inp} /></label>
      {err && <p className="text-red-400 text-sm sm:col-span-3 lg:col-span-4">{err}</p>}
      <div className="sm:col-span-3 lg:col-span-4"><button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white text-sm">{saving ? 'Saving…' : 'Log conversion'}</button></div>
    </form>
  )
}
