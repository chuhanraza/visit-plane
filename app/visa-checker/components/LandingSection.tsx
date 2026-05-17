'use client'

const STATS = [
  { value: '94%',   label: 'Accuracy Rate',          icon: '🎯' },
  { value: '200+',  label: 'Countries Covered',       icon: '🌍' },
  { value: '60s',   label: 'to Complete',             icon: '⚡' },
]

const PILLS = ['✓ Free', '✓ Instant Results', '✓ Personalized', '✓ 200+ Countries']

export default function LandingSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-16">
      {/* ─── Main card ─────────────────────────────────────────── */}
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl shadow-gray-200/80 border border-gray-100 p-8 sm:p-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 mb-6">
          🎯 Visa Success Estimator
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
          Will You Get<br />Your Visa?
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
          Answer 5 quick questions and get your personalized visa approval probability score.
          Takes less than 60 seconds.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PILLS.map(p => (
            <span key={p} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
              {p}
            </span>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-teal-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-teal-500/40 active:translate-y-0"
        >
          Start Free Assessment →
        </button>

        {/* Trust text */}
        <p className="mt-4 text-sm text-gray-400">
          Trusted by 100,000+ travelers worldwide
        </p>
      </div>

      {/* ─── Stat cards ─────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xl">
        {STATS.map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
