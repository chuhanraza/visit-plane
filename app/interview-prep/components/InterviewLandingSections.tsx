'use client'

import { useState } from 'react'

// ── Sample questions shown immediately on the landing (no gate) ──────────────
const SAMPLE_QUESTIONS = [
  {
    q: 'Why do you want to visit our country?',
    why: 'Tests whether your purpose is genuine and specific, not vague. Vague answers raise non-immigrant-intent concerns (Section 214(b) for the US).',
    strong:
      "I'm visiting the Grand Canyon for 10 days with my wife. We've booked hotels in Las Vegas and Flagstaff, and my return flight is on July 22.",
    weak: '"I want to see America." / "I just want to travel."',
    tip: 'Name a specific place. Mention dates. Show you have planned the trip.',
  },
  {
    q: 'What do you do for a living?',
    why: 'Your job is your strongest tie to home. Officers gauge whether you have a stable reason to return after the trip.',
    strong:
      "I'm a senior accountant at Khan & Co. in Lahore — I've worked there 6 years and have approved leave for this trip.",
    weak: '"I\'m between jobs right now." / "I do a bit of everything."',
    tip: 'State your role, employer, tenure, and that your leave is approved. Stability signals you will return.',
  },
  {
    q: 'Will you return to your home country?',
    why: 'The single most important question. Officers look for concrete ties: job, family, property, commitments.',
    strong:
      'Yes — I own my apartment, my children are in school here, and I must be back for a work project in August.',
    weak: '"I might stay if I find an opportunity." / "We will see how it goes."',
    tip: 'Never use "might", "maybe", or "settle". List concrete ties that pull you home.',
  },
]

function SampleQuestionCard({ item, index }: { item: (typeof SAMPLE_QUESTIONS)[0]; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-base font-bold text-[#0f0c29]">&ldquo;{item.q}&rdquo;</span>
        <span className={`text-teal-500 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-5 py-4 text-sm">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-800">💡 Why officers ask: </span>
            {item.why}
          </p>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="font-semibold text-emerald-700">✓ Strong answer</p>
            <p className="mt-1 text-slate-700">{item.strong}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="font-semibold text-rose-700">✗ Weak answer</p>
            <p className="mt-1 text-slate-700">{item.weak}</p>
          </div>
          <p className="text-slate-600">
            <span className="font-semibold text-slate-800">🎯 Pro tip: </span>
            {item.tip}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Rejection data with REAL cited sources ───────────────────────────────────
const REJECTION_DATA = [
  { flag: '🇺🇸', label: 'US B1/B2 (visitor)', note: 'Refusals driven largely by Section 214(b) — non-immigrant intent', source: 'travel.state.gov', url: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html' },
  { flag: '🇬🇧', label: 'UK Standard Visitor', note: 'Refusals centre on the "genuine visitor" requirement and finances', source: 'gov.uk', url: 'https://www.gov.uk/standard-visitor' },
  { flag: '🇨🇦', label: 'Canada visitor (TRV)', note: 'Refusals often cite weak ties, travel history, or purpose of visit', source: 'canada.ca', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
]

export default function InterviewLandingSections({ onJumpToSelector }: { onJumpToSelector: () => void }) {
  return (
    <>
      {/* ── Value preview: sample questions ─────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">What officers actually ask</h2>
            <p className="mt-2 text-sm text-slate-500">
              Real question patterns drawn from official consular guidance — see the answer
              approach before you commit to anything.
            </p>
          </div>
          <div className="space-y-3">
            {SAMPLE_QUESTIONS.map((item, i) => (
              <SampleQuestionCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-extrabold text-[#0f0c29]">How it works</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { icon: '🎯', title: '1. Choose your visa', body: 'Pick country and visa type. We tailor the questions to your route.' },
              { icon: '📚', title: '2. Study real questions', body: 'Browse by category with strong vs weak answer examples and pro tips.' },
              { icon: '🎤', title: '3. Practice with AI', body: 'Mock interview mode: the AI asks, you answer, and you get a readiness score.' },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-3 text-lg font-bold text-[#0f0c29]">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why interviews matter (real, cited) ─────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">Why preparation matters</h2>
            <p className="mt-2 text-sm text-slate-500">
              The most common refusal reason worldwide is unclear or insufficient ties to your
              home country. Knowing what officers look for is the difference.
            </p>
          </div>
          <div className="space-y-3">
            {REJECTION_DATA.map((r) => (
              <div key={r.label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#FAFAFA] p-4">
                <span className="text-2xl">{r.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0f0c29]">{r.label}</p>
                  <p className="text-sm text-slate-600">{r.note}</p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-teal-600 underline underline-offset-2 hover:text-teal-700"
                  >
                    Source: {r.source} →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Refusal criteria and statistics change. Always verify with the official consulate for
            your route before applying.
          </p>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] px-4 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: '🏛️', text: 'Sourced from official consular guidance' },
            { icon: '🔒', text: 'We never store your practice answers' },
            { icon: '🌐', text: 'Free for every passport' },
            { icon: '🎤', text: 'Browser-native voice mock interview' },
          ].map((t) => (
            <div key={t.text} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <span className="text-2xl">{t.icon}</span>
              <span className="text-xs font-medium text-slate-600">{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#0f0c29]">Ready to practice?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Pick your destination and visa type, then study real questions or jump into a mock
          interview.
        </p>
        <button
          onClick={onJumpToSelector}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/30 transition-all hover:-translate-y-0.5"
        >
          Choose my visa →
        </button>
      </section>
    </>
  )
}
