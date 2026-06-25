'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_SCOPES, type ApiKeyRow } from '@/lib/admin/apikeys'
import { WEBHOOK_EVENTS, type EndpointRow } from '@/lib/admin/webhooks'

const inp = 'bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200'

export default function DevConsole({ keys, endpoints, deliveries }: {
  keys: ApiKeyRow[]
  endpoints: EndpointRow[]
  deliveries: { id: string; endpoint_id: string; event: string; status: string; response_code: number | null; created_at: string }[]
}) {
  const router = useRouter()
  const [newKey, setNewKey] = useState('')
  const [newSecret, setNewSecret] = useState('')

  async function createKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const scopes = API_SCOPES.filter(s => f.get(s) === 'on')
    if (scopes.length === 0) { alert('Pick at least one scope'); return }
    const res = await fetch('/api/admin/dev/keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: f.get('name'), scopes }),
    })
    const j = await res.json()
    if (res.ok) { setNewKey(j.key); router.refresh(); (e.target as HTMLFormElement).reset() }
    else alert(j.error || 'Failed')
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this key? Calls using it will stop working.')) return
    const res = await fetch('/api/admin/dev/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'revoke', id }) })
    if (res.ok) router.refresh()
  }

  async function createHook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const events = WEBHOOK_EVENTS.filter(ev => f.get(ev) === 'on')
    if (events.length === 0) { alert('Pick at least one event'); return }
    const res = await fetch('/api/admin/dev/webhooks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: f.get('url'), events, description: f.get('description') || null }),
    })
    const j = await res.json()
    if (res.ok) { setNewSecret(j.secret); router.refresh(); (e.target as HTMLFormElement).reset() }
    else alert(j.error || 'Failed')
  }

  async function delHook(id: string) {
    if (!confirm('Delete this webhook endpoint?')) return
    const res = await fetch('/api/admin/dev/webhooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'delete', id }) })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* API KEYS */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">API keys</h2>
        {newKey && (
          <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-3 text-sm">
            <div className="text-emerald-300 mb-1">New key — copy it now, it won’t be shown again:</div>
            <code className="block bg-gray-950 rounded px-2 py-1 text-emerald-200 break-all">{newKey}</code>
            <button onClick={() => setNewKey('')} className="text-xs text-gray-400 mt-1">dismiss</button>
          </div>
        )}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
              <tr><th className="text-left font-medium px-4 py-3">Name</th><th className="text-left font-medium px-4 py-3">Prefix</th><th className="text-left font-medium px-4 py-3">Scopes</th><th className="text-left font-medium px-4 py-3">Last used</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {keys.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No keys yet.</td></tr>}
              {keys.map(k => (
                <tr key={k.id} className={k.active ? '' : 'opacity-50'}>
                  <td className="px-4 py-2.5 text-white">{k.name}</td>
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{k.scopes.join(', ')}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'never'}</td>
                  <td className="px-4 py-2.5 text-right">{k.active ? <button onClick={() => revokeKey(k.id)} className="text-red-400 hover:text-red-300 text-xs">Revoke</button> : <span className="text-gray-600 text-xs">revoked</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={createKey} className="flex flex-wrap items-center gap-2">
          <input name="name" required placeholder="Key name" className={inp} />
          {API_SCOPES.map(s => <label key={s} className="text-xs text-gray-400 flex items-center gap-1"><input type="checkbox" name={s} /> {s}</label>)}
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">Create key</button>
        </form>
      </section>

      {/* WEBHOOKS */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">Webhook endpoints</h2>
        {newSecret && (
          <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-3 text-sm">
            <div className="text-emerald-300 mb-1">Signing secret (verify the X-VisitPlane-Signature HMAC-SHA256 header):</div>
            <code className="block bg-gray-950 rounded px-2 py-1 text-emerald-200 break-all">{newSecret}</code>
            <button onClick={() => setNewSecret('')} className="text-xs text-gray-400 mt-1">dismiss</button>
          </div>
        )}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
              <tr><th className="text-left font-medium px-4 py-3">URL</th><th className="text-left font-medium px-4 py-3">Events</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {endpoints.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No endpoints yet.</td></tr>}
              {endpoints.map(ep => (
                <tr key={ep.id} className={ep.active ? '' : 'opacity-50'}>
                  <td className="px-4 py-2.5 text-gray-200 text-xs break-all">{ep.url}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{ep.events.join(', ')}</td>
                  <td className="px-4 py-2.5 text-right"><button onClick={() => delHook(ep.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={createHook} className="flex flex-wrap items-center gap-2">
          <input name="url" type="url" required placeholder="https://your-endpoint…" className={`${inp} w-64`} />
          {WEBHOOK_EVENTS.map(ev => <label key={ev} className="text-xs text-gray-400 flex items-center gap-1"><input type="checkbox" name={ev} /> {ev}</label>)}
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm">Add endpoint</button>
        </form>
      </section>

      {/* DELIVERIES */}
      <section className="space-y-3">
        <h2 className="font-semibold text-white">Recent webhook deliveries</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
              <tr><th className="text-left font-medium px-4 py-3">When</th><th className="text-left font-medium px-4 py-3">Event</th><th className="text-left font-medium px-4 py-3">Status</th><th className="text-left font-medium px-4 py-3">Code</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {deliveries.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No deliveries yet.</td></tr>}
              {deliveries.map(d => (
                <tr key={d.id}>
                  <td className="px-4 py-2 text-gray-500 text-xs whitespace-nowrap">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-gray-300 font-mono text-xs">{d.event}</td>
                  <td className="px-4 py-2"><span className={`text-[11px] px-2 py-0.5 rounded-full ${d.status === 'success' ? 'bg-emerald-500/15 text-emerald-300' : d.status === 'failed' ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300'}`}>{d.status}</span></td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{d.response_code ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
