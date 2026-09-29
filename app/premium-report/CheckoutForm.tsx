'use client'
import { useState } from 'react'
import { COUNTRIES } from '@/app/visa-checker/data'

export default function CheckoutForm() {
  const [passport, setPassport] = useState('Pakistan')
  const [destination, setDestination] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const ready = passport && destination && passport !== destination && /\S+@\S+\.\S+/.test(email) && mobile.trim().length >= 10

  async function pay(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || busy) return
    setBusy(true); setErr('')
    try {
      const res = await fetch('/api/checkout/rapidgateway/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passport, destination, email, mobile }),
      })
      const j = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string }
      if (!res.ok || !j.redirectUrl) throw new Error(j.error || 'Could not start checkout')
      window.location.href = j.redirectUrl
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Something went wrong')
      setBusy(false)
    }
  }

  const field = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500'
  return (
    <form onSubmit={pay} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">My passport
          <select className={field} value={passport} onChange={(e) => setPassport(e.target.value)}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">Destination
          <select className={field} value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="">Select destination…</option>
            {COUNTRIES.filter((c) => c !== passport).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium text-gray-700">Email
        <input type="email" required autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </label>
      <label className="block text-sm font-medium text-gray-700">Mobile (Pakistan)
        <input type="tel" required autoComplete="tel" inputMode="tel" className={field} value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="03XXXXXXXXX" />
      </label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {ready ? (
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? 'Redirecting to RapidGateway…' : 'Pay with RapidGateway — Rs 2,000'}
        </button>
      ) : (
        <p className="text-center text-sm text-gray-500">Choose both countries and enter your email and mobile to continue to payment.</p>
      )}
      <p className="text-center text-xs text-gray-500">Secure hosted checkout · PKR only · You are redirected to RapidGateway to pay.</p>
    </form>
  )
}
