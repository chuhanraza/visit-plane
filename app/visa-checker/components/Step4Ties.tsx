'use client'

type Props = {
  value: string[]
  onChange: (v: string[]) => void
  onNext: () => void
  onBack: () => void
}

const TIES = [
  { id:'property',  label:'I own property in my home country',         icon:'🏠' },
  { id:'job',       label:'I have a stable full-time job',             icon:'💼' },
  { id:'family',    label:'I have immediate family (spouse/children)',  icon:'👨‍👩‍👧' },
  { id:'savings',   label:'I have significant savings or assets',       icon:'💰' },
  { id:'business',  label:'I have a business registered here',         icon:'🏢' },
  { id:'traveled',  label:'I have previously traveled and returned',   icon:'✈️' },
]

export default function Step4Ties({ value, onChange, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    if (id === 'none') { onChange(['none']); return }
    const without = value.filter(v => v !== 'none')
    onChange(without.includes(id) ? without.filter(v => v !== id) : [...without, id])
  }
  const isNone = value.includes('none')
  const canNext = value.length > 0

  return (
    <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/70 border border-gray-100 p-8 sm:p-10">
      <div className="mb-1 text-sm font-bold uppercase tracking-widest text-teal-500">What are your ties to home?</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        Which of these apply to you?
      </h2>
      <p className="text-gray-500 text-sm mb-8">Select all that apply — strong ties significantly boost approval odds.</p>

      <div className="space-y-2.5">
        {TIES.map(t => {
          const selected = value.includes(t.id)
          return (
            <button key={t.id} onClick={() => toggle(t.id)} disabled={isNone}
              className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-3.5 text-left transition-all duration-150 ${
                selected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
              } ${isNone ? 'opacity-40' : ''}`}>
              <span className="text-xl shrink-0">{t.icon}</span>
              <span className={`flex-1 text-sm font-medium ${selected ? 'text-teal-800' : 'text-gray-700'}`}>{t.label}</span>
              <div className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
              }`}>
                {selected && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}

        {/* None option */}
        <button onClick={() => toggle('none')}
          className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-3.5 text-left transition-all duration-150 ${
            isNone ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}>
          <span className="text-xl shrink-0">🚫</span>
          <span className={`flex-1 text-sm font-medium ${isNone ? 'text-gray-800' : 'text-gray-500'}`}>None of the above</span>
          <div className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
            isNone ? 'border-gray-500 bg-gray-500' : 'border-gray-300'
          }`}>
            {isNone && (
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={onBack}
          className="flex-1 rounded-2xl border-2 border-gray-200 px-6 py-4 text-base font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50">
          ← Back
        </button>
        <button onClick={onNext} disabled={!canNext}
          className="flex-[2] rounded-2xl bg-teal-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none">
          Next →
        </button>
      </div>
    </div>
  )
}
