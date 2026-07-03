'use client'
import { useEffect, useState } from 'react'
import { Q, COUNTRIES } from '../data'

interface Props {
  questions: Q[]
  country: string
  visaType: string
  currentQ: number
  onPrev: () => void
  onNext: () => void
  onComplete: () => void
}

export default function InterviewRoom({ questions, country, visaType, currentQ, onPrev, onNext, onComplete }: Props) {
  const [animKey, setAnimKey] = useState(0)
  const item = questions[currentQ]
  const progress = ((currentQ + 1) / questions.length) * 100
  const countryData = COUNTRIES.find(c => c.value === country)
  const isLast = currentQ === questions.length - 1

  useEffect(() => { setAnimKey(k => k + 1) }, [currentQ])

  return (
    <section className="min-h-screen bg-[#0f0c29] text-white flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-[#0a0820]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{countryData?.flag}</span>
            <span className="text-sm font-semibold text-white/70 truncate">{countryData?.embassy} · {visaType} Visa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-blink-rec flex-shrink-0" />
            <span className="text-sm font-bold text-red-400 whitespace-nowrap hidden sm:block">INTERVIEW IN PROGRESS</span>
            <span className="text-sm font-bold text-red-400 sm:hidden">LIVE</span>
          </div>
          <div className="text-sm font-bold text-white/60 whitespace-nowrap flex-shrink-0">
            {currentQ + 1} <span className="text-white/30">/</span> {questions.length}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── Main Interview Area ──────────────────────────────────────────────── */}
      <div className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 h-full">

          {/* LEFT — Officer Panel (40%) */}
          <div className="lg:w-[40%]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden h-full"
              style={{ boxShadow: '0 0 40px rgba(20,184,166,0.06) inset' }}>

              {/* Badge */}
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Visa Officer</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-blink-rec" />
                  <span className="text-[10px] text-red-400/80 font-semibold">Recording</span>
                </div>
              </div>

              {/* Silhouette avatar */}
              <div className="relative flex flex-col items-center pt-8 pb-4">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1e1450] to-[#0f0c29]" />
                  {/* Head */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full"
                    style={{ background: 'rgba(40,30,70,0.9)', filter: 'blur(1px)' }} />
                  {/* Shoulders */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-14 rounded-t-full"
                    style={{ background: 'rgba(25,18,55,0.95)', filter: 'blur(1px)' }} />
                </div>
                {/* Flag + embassy */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg">{countryData?.flag}</span>
                  <span className="text-xs text-white/50 font-medium">{countryData?.embassy}</span>
                </div>

                {/* Speaking dots */}
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-[10px] text-white/40 mr-1">Speaking</span>
                  <span className="h-2 w-2 rounded-full bg-teal-400 speaking-dot-1" />
                  <span className="h-2 w-2 rounded-full bg-teal-400 speaking-dot-2" />
                  <span className="h-2 w-2 rounded-full bg-teal-400 speaking-dot-3" />
                </div>
              </div>

              {/* Speech bubble / question */}
              <div className="px-5 pb-6">
                <div key={animKey} className="animate-slide-left relative bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg">
                  <div className="absolute -top-2 left-5 w-4 h-4 bg-white rotate-45" />
                  <p className="text-sm font-semibold text-[#0f0c29] leading-relaxed relative z-10">{item.q}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Answer Panel (60%) */}
          <div className="lg:w-[60%] flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#FAFAFA] overflow-hidden flex-1">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-0.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                  Your Answer
                </span>
              </div>
              <div key={`ans-${animKey}`} className="px-5 py-4 animate-fade-up">
                <p className="text-sm text-[#0f0c29] leading-relaxed font-medium">{item.answer}</p>
              </div>

              {/* Insight cards */}
              <div className="px-5 pb-5 grid gap-3">
                {/* Correct approach */}
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">✅ Correct Approach</span>
                  </div>
                  <p className="text-xs text-green-800 leading-relaxed">{item.answer.split('.')[0]}.</p>
                </div>

                {/* Never say this */}
                {item.notSay && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">❌ Never Say This</span>
                    </div>
                    <p className="text-xs text-red-800 leading-relaxed">&ldquo;{item.notSay}&rdquo;</p>
                  </div>
                )}

                {/* Officer insight */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">💡 Officer Insight</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">{item.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-[#0a0820]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3 sm:gap-4">
          <button onClick={onPrev} disabled={currentQ === 0}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/60 hover:border-white/30 hover:text-white transition disabled:opacity-25 disabled:cursor-not-allowed sm:flex-none sm:px-5">
            ← Previous
          </button>

          {/* Dots — the progress bar + counter carry this on phones */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {questions.map((_, i) => (
              <span key={i} className={`rounded-full transition-all duration-300 ${i === currentQ ? 'h-2.5 w-6 bg-teal-400' : i < currentQ ? 'h-2 w-2 bg-teal-600/60' : 'h-2 w-2 bg-white/20'}`} />
            ))}
          </div>

          {isLast ? (
            <button onClick={onComplete}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600 transition sm:flex-none sm:px-5">
              Complete Interview ✓
            </button>
          ) : (
            <button onClick={onNext}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600 transition sm:flex-none sm:px-5">
              Next Question →
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
