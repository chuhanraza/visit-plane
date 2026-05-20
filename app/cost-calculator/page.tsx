'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const VISA_COSTS: Record<string, Record<string, { fee: string; service: string; total: string }>> = {
  'Tourist': {
    'UAE':            { fee: 'AED 300 (~$82)', service: '$0', total: '~$82' },
    'United Kingdom': { fee: '£115 (~$145)',   service: '$0', total: '~$145' },
    'United States':  { fee: '$185',            service: '$0', total: '$185' },
    'Schengen':       { fee: '€80 (~$87)',      service: '$0', total: '~$87' },
    'Australia':      { fee: 'AUD 150 (~$100)', service: '$0', total: '~$100' },
    'Canada':         { fee: 'CAD 100 (~$74)',  service: '$0', total: '~$74' },
    'Japan':          { fee: '¥3,000 (~$20)',   service: '$0', total: '~$20' },
    'South Korea':    { fee: '$45',             service: '$0', total: '$45' },
  },
}

const DESTINATIONS = Object.keys(VISA_COSTS['Tourist'])
const VISA_TYPES = ['Tourist', 'Business', 'Student', 'Work']

export default function CostCalculatorPage() {
  const [visaType, setVisaType] = useState('Tourist')
  const [destination, setDestination] = useState('')

  const result = destination && VISA_COSTS[visaType]?.[destination]

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">{/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            💰 Visa Cost Calculator
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-[#0f0c29]">Estimate Your </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Visa Cost
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-500">
            Get an estimate of official government visa fees. All fees are paid directly to the embassy — VisitPlane is always free.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Visa Type</label>
                <div className="flex flex-wrap gap-2">
                  {VISA_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setVisaType(t); setDestination('') }}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                        visaType === t
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'border border-gray-200 text-gray-500 hover:text-white hover:border-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Destination</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0f0c29] outline-none focus:border-emerald-500/50 transition"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Select a destination</option>
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {result && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-5">
                <h3 className="text-base font-bold text-[#0f0c29] mb-4">Estimated Cost for {destination} {visaType} Visa</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Official Government Fee', value: result.fee },
                    { label: 'VisitPlane Service Fee', value: <span className="text-emerald-400 font-bold">FREE</span> },
                    { label: 'Estimated Total', value: <span className="text-xl font-extrabold text-[#0f0c29]">{result.total}</span> },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="text-sm font-semibold text-[#0f0c29]">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] text-gray-400">
                  ⚠️ Fees are estimates based on official embassy rates. Always verify on the official embassy website before applying.
                </p>
              </div>
            )}

            {!result && destination && (
              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-300">
                Cost data for this visa type + destination combo is coming soon. Check the official embassy website for the most accurate fees.
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-px transition"
            >
              Check Full Visa Requirements →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
