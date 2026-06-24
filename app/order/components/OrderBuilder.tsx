'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ServiceRecord, TravelerInput } from '@/lib/orders/types'

const money = (cur: string, n: number) => `${cur} ${n.toFixed(2)}`
const emptyTraveler = (): TravelerInput => ({ full_name: '', passport_number: '', dob: '', nationality: '', passport_expiry: '' })

export default function OrderBuilder({ services }: { services: ServiceRecord[] }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [travelers, setTravelers] = useState<TravelerInput[]>([emptyTraveler()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const service = useMemo(() => services.find(s => s.id === serviceId), [services, serviceId])

  const totals = useMemo(() => {
    if (!service) return null
    const n = travelers.length
    const govt = service.govt_fee * n
    const fee = service.service_fee * n
    return { n, govt, fee, total: govt + fee, currency: service.currency }
  }, [service, travelers.length])

  function updateTraveler(i: number, patch: Partial<TravelerInput>) {
    setTravelers(ts => ts.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  }
  function addTraveler() { setTravelers(ts => [...ts, emptyTraveler()]) }
  function removeTraveler(i: number) { setTravelers(ts => ts.length > 1 ? ts.filter((_, idx) => idx !== i) : ts) }

  const travelersValid = travelers.every(t => t.full_name.trim().length >= 2 && t.passport_number.trim().length >= 4)

  async function placeOrder() {
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, travelers }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not place order')
      router.push(`/portal/orders/${json.orderId}?placed=1`)
    } catch (e) {
      setError((e as Error).message); setSubmitting(false)
    }
  }

  const stepPill = (n: number, label: string) => (
    <div className="flex items-center gap-2">
      <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold ${
        step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</span>
      <span className={`text-sm ${step >= n ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{label}</span>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        {stepPill(1, 'Service')}
        <div className="flex-1 h-px bg-gray-200" />
        {stepPill(2, 'Travellers')}
        <div className="flex-1 h-px bg-gray-200" />
        {stepPill(3, 'Review')}
      </div>

      {/* Step 1 — service */}
      {step === 1 && (
        <div className="space-y-3">
          {services.map(s => (
            <label key={s.id} className={`block bg-white border rounded-2xl p-4 cursor-pointer transition-colors ${
              serviceId === s.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="service" className="mt-1" checked={serviceId === s.id} onChange={() => setServiceId(s.id)} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{s.country_name} — {s.visa_type}</div>
                    <div className="text-sm font-semibold text-gray-900">{money(s.currency, s.govt_fee + s.service_fee)}<span className="text-gray-400 font-normal">/traveller</span></div>
                  </div>
                  {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Processing {s.processing_days_min}–{s.processing_days_max} days · Govt {money(s.currency, s.govt_fee)} + Service {money(s.currency, s.service_fee)}</p>
                  {s.is_test && <span className="inline-block mt-1 text-[10px] uppercase tracking-wide bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Test data</span>}
                </div>
              </div>
            </label>
          ))}
          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(2)} disabled={!service}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-medium rounded-lg px-5 py-2.5">Continue</button>
          </div>
        </div>
      )}

      {/* Step 2 — travellers */}
      {step === 2 && (
        <div className="space-y-4">
          {travelers.map((t, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Traveller {i + 1}</h3>
                {travelers.length > 1 && (
                  <button onClick={() => removeTraveler(i)} className="text-xs text-red-600 hover:underline">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Full name (as in passport)" value={t.full_name}
                  onChange={e => updateTraveler(i, { full_name: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Passport number" value={t.passport_number}
                  onChange={e => updateTraveler(i, { passport_number: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <label className="text-xs text-gray-500">Date of birth
                  <input type="date" value={t.dob ?? ''} onChange={e => updateTraveler(i, { dob: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
                <label className="text-xs text-gray-500">Passport expiry
                  <input type="date" value={t.passport_expiry ?? ''} onChange={e => updateTraveler(i, { passport_expiry: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
                <input placeholder="Nationality" value={t.nationality ?? ''} onChange={e => updateTraveler(i, { nationality: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2" />
              </div>
            </div>
          ))}
          <button onClick={addTraveler} className="text-sm text-blue-600 hover:underline">+ Add another traveller</button>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 px-4 py-2.5">Back</button>
            <button onClick={() => setStep(3)} disabled={!travelersValid}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-medium rounded-lg px-5 py-2.5">Review</button>
          </div>
        </div>
      )}

      {/* Step 3 — review */}
      {step === 3 && service && totals && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">{service.country_name} — {service.visa_type}</h3>
            <table className="w-full text-sm text-gray-700">
              <tbody>
                <tr><td className="py-1 text-gray-500">Travellers</td><td className="py-1 text-right">{totals.n}</td></tr>
                <tr><td className="py-1 text-gray-500">Government fee ({money(service.currency, service.govt_fee)} × {totals.n})</td><td className="py-1 text-right">{money(totals.currency, totals.govt)}</td></tr>
                <tr><td className="py-1 text-gray-500">VisitPlane service fee ({money(service.currency, service.service_fee)} × {totals.n})</td><td className="py-1 text-right">{money(totals.currency, totals.fee)}</td></tr>
                <tr className="border-t border-gray-100"><td className="pt-2 font-semibold text-gray-900">Total</td><td className="pt-2 text-right font-bold text-gray-900">{money(totals.currency, totals.total)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400">
            You'll upload required documents after placing the order. No payment is taken now —
            we'll send an invoice. VisitPlane provides assistance and does not guarantee visa approval.
          </p>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-900 px-4 py-2.5">Back</button>
            <button onClick={placeOrder} disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-medium rounded-lg px-6 py-2.5">
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
