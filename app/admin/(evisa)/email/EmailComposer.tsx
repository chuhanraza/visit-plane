'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EmailSegments } from '@/lib/admin/email'

export default function EmailComposer({ segments, broadcastsEnabled }: { segments: EmailSegments; broadcastsEnabled: boolean }) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [source, setSource] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')

  const segMatch = source ? (segments.bySource.find(s => s.source === source)?.sendable ?? 0) : segments.sendable

  async function post(payload: Record<string, unknown>) {
    setBusy(true); setResult('')
    const res = await fetch('/api/admin/email/broadcast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok) {
      setResult(j.test ? `Test ${j.sent ? 'sent' : 'attempted (Resend not configured)'} to ${testEmail}.` : `Broadcast: ${j.sent}/${j.recipientCount} sent${j.failed ? `, ${j.failed} failed` : ''}.`)
      if (!j.test) router.refresh()
    } else setResult(`Error: ${j.error || 'failed'}`)
  }

  function sendTest() {
    if (!subject || !body) { setResult('Add a subject and body first.'); return }
    if (!testEmail) { setResult('Enter a test email address.'); return }
    post({ subject, body, test: true, testEmail })
  }

  function sendReal() {
    if (!subject || !body) { setResult('Add a subject and body first.'); return }
    if (!confirm(`Send "${subject}" to ${segMatch} confirmed subscriber(s)${source ? ` in "${source}"` : ''}? This cannot be undone.`)) return
    post({ subject, body, ...(source ? { source } : {}) })
  }

  const inp = 'w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <h2 className="font-semibold text-white">Compose broadcast</h2>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs text-gray-400 space-y-1"><span>Segment</span>
          <select value={source} onChange={e => setSource(e.target.value)} className={inp}>
            <option value="">All confirmed ({segments.sendable})</option>
            {segments.bySource.map(s => <option key={s.source} value={s.source}>{s.source} ({s.sendable})</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-400 space-y-1"><span>Recipients</span>
          <div className={`${inp} flex items-center text-gray-300`}>{segMatch} confirmed, subscribed</div>
        </label>
      </div>

      <label className="block text-xs text-gray-400 space-y-1"><span>Subject</span><input value={subject} onChange={e => setSubject(e.target.value)} className={inp} /></label>
      <label className="block text-xs text-gray-400 space-y-1"><span>Body (HTML allowed)</span><textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className={`${inp} font-mono`} placeholder="<p>Hi traveller,</p>" /></label>

      {body && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Preview</div>
          <div className="bg-white text-black rounded-lg p-4 text-sm max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
        <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="you@example.com" className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 w-52" />
        <button onClick={sendTest} disabled={busy} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-200 text-sm">Send test</button>
        <button onClick={sendReal} disabled={busy || !broadcastsEnabled} title={broadcastsEnabled ? '' : 'Enable email_broadcasts_enabled in Settings'} className="ml-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-white text-sm">
          {broadcastsEnabled ? `Send to ${segMatch}` : 'Broadcasts disabled'}
        </button>
      </div>
      {result && <p className="text-sm text-gray-300">{result}</p>}
    </div>
  )
}
