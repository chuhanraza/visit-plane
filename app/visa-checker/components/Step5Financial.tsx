'use client'
import type { FinancialValue } from '../data'

type Props = {
  value: FinancialValue
  onChange: (v: FinancialValue) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { value: FinancialValue; icon: string; label: string; sub: string }[] = [
  { value:'strong',   icon:'💰', label:'Strong',   sub:'I have 6+ months of expenses saved' },
  { value:'good',     icon:'💵', label:'Good',     sub:'I have 3–6 months of expenses saved' },
  { value:'moderate', icon:'💴', label:'Moderate', sub:'I have 1–3 months of expenses saved' },
  { value:'limited',  icon:'💸', label:'Limited',  sub:'I have less than 1 month saved' },
]

export default function Step5Financial({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/70 border border-gray-100 p-8 sm:p-10">
      <div className="mb-1 text-sm font-bold uppercase tracking-widest text-teal-500">Your financial situation</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        What best describes your finances?
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Financial stability is a key signal to visa officers that you&apos;ll return home.
      </p>

      <div className="space-y-3">
        {OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 ${
              value === opt.value
                ? 'border-teal-500 bg-teal-50 scale-[1.01]'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 hover:scale-[1.005]'
            }`}>
            <span className="text-2xl shrink-0">{opt.icon}</span>
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
          See My Score →
        </button>
      </div>
    </div>
  )
}
