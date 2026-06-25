'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminRow } from '@/lib/admin/admins'
import { ROLES } from '@/lib/admin/rbac'

export function AdminAllowlist({ admins }: { admins: AdminRow[] }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [role, setRole] = useState('admin')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    const res = await fetch('/api/admin/settings/admins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'add', email, note: note || null, role }),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) { setEmail(''); setNote(''); setMsg('Admin added.'); router.refresh() }
    else setMsg(j.error || 'Failed')
  }

  async function remove(userId: string, label: string) {
    if (!confirm(`Remove admin access for ${label}? This is audited.`)) return
    const res = await fetch('/api/admin/settings/admins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'remove', user_id: userId }),
    })
    if (res.ok) router.refresh()
    else alert((await res.json().catch(() => ({}))).error || 'Failed')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <h2 className="font-semibold text-white">Admin allowlist <span className="text-gray-500 text-sm font-normal">({admins.length})</span></h2>
      <p className="text-xs text-gray-500">Supabase-Auth users with full admin access. Users must sign up / log in once before they can be added. Legacy <code className="text-gray-400">ADMIN_SECRET</code> cookie access is separate.</p>

      {admins.length === 0 ? (
        <p className="text-gray-500 text-sm">No Supabase-Auth admins yet — access is currently via the legacy admin secret.</p>
      ) : (
        <ul className="divide-y divide-gray-800 text-sm">
          {admins.map(a => (
            <li key={a.user_id} className="flex items-center justify-between py-2">
              <div>
                <div className="text-gray-200">{a.email ?? <span className="text-gray-500">unknown ({a.user_id.slice(0, 8)})</span>} <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{a.role}</span></div>
                {a.note && <div className="text-xs text-gray-500">{a.note}</div>}
              </div>
              <button onClick={() => remove(a.user_id, a.email ?? a.user_id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="admin@email.com" className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 w-56" />
        <select value={role} onChange={e => setRole(e.target.value)} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200">
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="note (optional)" className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 w-40" />
        <button type="submit" disabled={busy} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm">Add admin</button>
        {msg && <span className="text-sm text-gray-400">{msg}</span>}
      </form>
    </div>
  )
}

export function FeatureFlags({ flags }: { flags: { key: string; label: string; value: boolean; hint: string }[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState('')

  async function toggle(key: string, value: boolean) {
    setBusy(key)
    const res = await fetch('/api/admin/settings/flags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setBusy('')
    if (res.ok) router.refresh()
    else alert((await res.json().catch(() => ({}))).error || 'Failed')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <h2 className="font-semibold text-white">Feature flags</h2>
      <ul className="divide-y divide-gray-800">
        {flags.map(f => (
          <li key={f.key} className="flex items-center justify-between py-3">
            <div>
              <div className="text-gray-200 text-sm">{f.label} <code className="text-xs text-gray-600">{f.key}</code></div>
              <div className="text-xs text-gray-500">{f.hint}</div>
            </div>
            <button
              onClick={() => toggle(f.key, !f.value)} disabled={busy === f.key}
              className={`relative w-11 h-6 rounded-full transition-colors ${f.value ? 'bg-emerald-600' : 'bg-gray-700'} disabled:opacity-50`}
              aria-pressed={f.value}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${f.value ? 'translate-x-5' : ''}`} />
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-600">Turning on <code>payments_enabled</code> does NOT itself charge cards — live processing also requires Stripe keys + the e-Visa payments activation steps.</p>
    </div>
  )
}
