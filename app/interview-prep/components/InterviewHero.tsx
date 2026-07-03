'use client'
import { INTERVIEW_COUNTRIES } from '@/lib/data/interview-questions'
import CountrySelect from '@/components/CountrySelect'

interface Props {
  country: string
  visaType: string
  onCountryChange: (v: string) => void
  onVisaTypeChange: (v: string) => void
  onEnter: () => void
}

export default function InterviewHero({ country, visaType, onCountryChange, onVisaTypeChange, onEnter }: Props) {
  const canEnter = country && visaType
  return (
    <section className="bg-[#FAFAFA] pt-14 pb-16 px-4 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Left (60%) ─────────────────────────────────────────────────── */}
          <div className="flex-1 lg:max-w-[58%]">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 mb-6">
              🎤 Interview Prep
            </span>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#0f0c29] leading-[1.05] mb-5">
              Pass Your Visa Interview{' '}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">With Confidence.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-500 mb-7 max-w-md leading-relaxed">
              Practice with AI, prep with real questions, walk in ready. Free for every passport,
              every destination.
            </p>

            {/* Trust pills — real, no invented numbers */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                📚 Questions sourced from official consular guidance
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                🤖 AI-powered mock interview practice
              </span>
            </div>

            {/* Selectors */}
            <div id="ip-selector" className="flex flex-col sm:flex-row gap-3 mb-5 scroll-mt-24">
              <div className="flex-1">
                <CountrySelect
                  value={country}
                  onChange={(v) => { onCountryChange(v); onVisaTypeChange('') }}
                  placeholder="Select country…"
                  label="Country"
                  options={INTERVIEW_COUNTRIES.map(c => c.name)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Visa Type</label>
                <select
                  value={visaType}
                  onChange={e => onVisaTypeChange(e.target.value)}
                  disabled={!country}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#0f0c29] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">Select visa type…</option>
                  {(INTERVIEW_COUNTRIES.find(c => c.name === country)?.visa_types ?? []).map(v => (
                    <option key={v.code} value={v.code}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onEnter}
              disabled={!canEnter}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/30 hover:from-teal-600 hover:to-emerald-600 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              Start Practice →
            </button>
            <p className="mt-3 text-xs text-gray-400">Free · No signup · ~5 minutes</p>
          </div>

          {/* ── Right (40%) — Animated Officer Panel. Decorative — hidden on
              phones so the selectors + Start CTA sit above the fold instead of
              a 320px illustration pushing them down. ───────────────────────── */}
          <div className="hidden lg:flex lg:max-w-[38%] w-full justify-center">
            <div className="relative w-72 h-80 animate-pulse-glass">
              {/* Outer glow frame */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#1a1040] to-[#0f0c29] border border-teal-500/20 shadow-2xl shadow-teal-500/10 overflow-hidden">
                {/* Frosted glass overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.03]" />
                {/* Scanline effect */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)' }} />

                {/* Silhouette */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-56">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-44 rounded-t-full"
                    style={{ background: 'linear-gradient(to bottom, rgba(30,20,60,0.9), rgba(15,12,41,1))', filter: 'blur(2px)' }} />
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full"
                    style={{ background: 'linear-gradient(to bottom, rgba(40,30,70,0.85), rgba(20,15,50,0.9))', filter: 'blur(1.5px)' }} />
                </div>

                {/* Top status bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/5">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Visa Officer</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-blink-rec" />
                    <span className="text-[10px] font-bold text-red-400">REC</span>
                  </div>
                </div>

                {/* Bottom "Officer Ready" badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-500/30 px-4 py-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-bold text-teal-300">Officer Ready</span>
                </div>

                {/* Corner teal accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-500/40 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal-500/40 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-500/40 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500/40 rounded-br-3xl" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
