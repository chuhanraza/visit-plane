'use client'
import CountrySelect from '@/components/CountrySelect'
import { isLikelyVisaFree } from '../data'

type Props = {
  passport: string
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Destination({ passport, value, onChange, onNext, onBack }: Props) {
  const visaFree = value ? isLikelyVisaFree(passport, value) : null

  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/70 border border-gray-100 p-8 sm:p-10">
      <div className="mb-1 text-sm font-bold uppercase tracking-widest text-teal-500">Where do you want to go?</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        Which country do you want to visit?
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        We&apos;ll calculate your specific approval odds for this destination.
      </p>

      <CountrySelect
        value={value}
        onChange={onChange}
        placeholder="Search or select destination country…"
      />

      {/* Instant visa badge */}
      {value && visaFree !== null && (
        <div className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
          visaFree
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <span className="text-2xl">{visaFree ? '✅' : '⚠️'}</span>
          <div>
            <span className={`text-sm font-bold ${visaFree ? 'text-emerald-700' : 'text-amber-700'}`}>
              {visaFree ? 'Likely Visa Free' : 'Visa Required'}
            </span>
            <p className={`text-xs mt-0.5 ${visaFree ? 'text-emerald-600' : 'text-amber-600'}`}>
              {visaFree
                ? 'Based on your passport, you may travel visa-free. We\'ll refine your odds below.'
                : 'A visa is typically required. Let\'s calculate your approval probability.'}
            </p>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex gap-3">
        <button onClick={onBack}
          className="flex-1 rounded-2xl border-2 border-gray-200 px-6 py-4 text-base font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50">
          ← Back
        </button>
        <button onClick={onNext} disabled={!value}
          className="flex-[2] rounded-2xl bg-teal-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none">
          Next →
        </button>
      </div>
    </div>
  )
}
