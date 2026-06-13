'use client'

interface Props {
  onStart: () => void
}

export default function WizardHero({ onStart }: Props) {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.10),transparent_60%)]" />
        <div className="absolute -left-32 top-40 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.06),transparent_70%)]" />
        <div className="absolute -right-32 top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06),transparent_70%)]" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-600 mb-6">
          🤖 AI Visa Wizard
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-tight mb-4">
          Get Your{' '}
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Personalized
          </span>{' '}
          Visa Guide
        </h1>

        {/* Subtext */}
        <p className="text-lg text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
          Answer 5 quick questions. Our AI gives you a complete visa roadmap in seconds — free.
        </p>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            '✓ AI-Powered',
            '✓ 197 Countries',
            '✓ Instant Results',
          ].map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          Start Wizard →
        </button>

        {/* Small trust note */}
        <p className="mt-4 text-xs text-slate-400">
          Free · No signup required · Results in ~10 seconds
        </p>

        {/* What you'll get */}
        <div className="mt-14 text-left">
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
            <p className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-slate-400">
              What you&apos;ll get
            </p>
            <ul className="space-y-3">
              {[
                'Personalized visa category for YOUR route',
                'Document checklist tailored to your situation',
                'Exact cost breakdown in USD',
                'Timeline based on your travel date',
                'AI-generated tips specific to your route',
                'Shareable plan link for family / group travel',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-0.5 flex-shrink-0 text-emerald-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onStart}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-500/50"
            >
              Start Wizard →
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">⚡ Used by travelers worldwide</span>
          <span className="inline-flex items-center gap-1.5">🔒 No signup needed</span>
          <span className="inline-flex items-center gap-1.5">💯 197 countries covered</span>
        </div>
      </div>
    </section>
  )
}
