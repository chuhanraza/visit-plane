'use client'
import { useState } from 'react'
import SearchableCountrySelect from './SearchableCountrySelect'
import { useUserCountry } from '@/hooks/useUserCountry'

type Props = {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export default function Step1Passport({ value, onChange, onNext }: Props) {
  const { loading: geoLoading } = useUserCountry()
  const [badgeDismissed, setBadgeDismissed] = useState(false)

  const isAutoDetected = value && !geoLoading && !badgeDismissed

  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/70 border border-gray-100 p-8 sm:p-10">
      {/* Question header */}
      <div className="mb-1 text-sm font-bold uppercase tracking-widest text-teal-500">Where are you from?</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        What is your passport country?
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        This is the single biggest factor in visa approval rates.
      </p>

      {/* Country selector */}
      <SearchableCountrySelect
        value={value}
        onChange={(v) => { onChange(v); setBadgeDismissed(true) }}
        placeholder={geoLoading ? '🌍 Detecting your location…' : 'Search or select your passport country…'}
      />

      {/* Auto-detected badge */}
      {isAutoDetected && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-teal-50 border border-teal-100 px-4 py-2.5">
          <span className="text-xs text-teal-600 font-medium">📍 Auto-detected from your IP</span>
          <button onClick={() => setBadgeDismissed(true)} className="text-xs text-gray-400 hover:text-gray-600">
            Not you? Change →
          </button>
        </div>
      )}

      {/* Confirmed tip (after manual selection) */}
      {value && !isAutoDetected && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
          <span className="text-lg">✅</span>
          <span className="text-sm text-teal-700 font-medium">{value} passport selected</span>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!value}
        className="mt-8 w-full rounded-2xl bg-teal-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
      >
        Next →
      </button>
    </div>
  )
}
