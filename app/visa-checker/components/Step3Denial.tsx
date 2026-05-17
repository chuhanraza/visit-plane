'use client'
import type { DenialValue } from '../data'

type Props = {
  value: DenialValue
  onChange: (v: DenialValue) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { value: DenialValue; emoji: string; dot: string; label: string; sub: string }[] = [
  { value:'never',       emoji:'🟢', dot:'bg-emerald-500', label:'Never denied',                           sub:'I have never had a visa denial' },
  { value:'once_old',    emoji:'🟡', dot:'bg-yellow-500',  label:'Denied once, more than 3 years ago',    sub:'My previous denial was over 3 years ago' },
  { value:'once_recent', emoji:'🟠', dot:'bg-orange-500',  label:'Denied once, within last 3 years',      sub:'I had a denial within the past 3 years' },
  { value:'multiple',    emoji:'🔴', dot:'bg-red-500',     label:'Denied multiple times',                  sub:'I have had two or more visa denials' },
]

export default function Step3Denial({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/70 border border-gray-100 p-8 sm:p-10">
      <div className="mb-1 text-sm font-bold uppercase tracking-widest text-teal-500">Have you been denied before?</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        Have you ever been denied a visa?
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        To this country or any other country — be honest for the most accurate score.
      </p>

      <div className="space-y-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 ${
              value === opt.value
                ? 'border-teal-500 bg-teal-50 scale-[1.01]'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:scale-[1.005]'
            }`}
          >
            <span className="text-2xl shrink-0">{opt.emoji}</span>
            <div className="flex-1">
              <div className={`text-sm font-bold ${value === opt.value ? 'text-teal-800' : 'text-gray-800'}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-0.5 ${value === opt.value ? 'text-teal-600' : 'text-gray-400'}`}>
                {opt.sub}
              </div>
            </div>
            <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
              value === opt.value ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
            }`}>
              {value === opt.value && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

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
