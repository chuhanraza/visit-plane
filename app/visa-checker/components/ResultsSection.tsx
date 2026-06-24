'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { calculateScore, getScoreInfo, getPassportStrengthLabel, getRecommendations, FLAGS } from '../data'
import type { QuizAnswers } from '../data'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'

// ─── Animated count-up ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

// ─── Score circle ─────────────────────────────────────────────────────────────
function ScoreCircle({ score }: { score: number }) {
  const r   = 70
  const circ = 2 * Math.PI * r
  const display = useCountUp(score)
  const info    = getScoreInfo(display)
  const offset  = circ * (1 - display / 100)

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative w-48 h-48">
        <svg width="192" height="192" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r={r} fill="none" stroke="#e5e7eb" strokeWidth="14" />
          <circle cx="96" cy="96" r={r} fill="none"
            stroke={info.stroke} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 96 96)"
            style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black leading-none ${info.textColor}`}>{display}%</span>
          <span className="text-xs text-gray-500 mt-1.5 font-medium">Approval Probability</span>
          <span className={`mt-2 text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest ${info.badgeBg}`}>{info.label}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Factor card ─────────────────────────────────────────────────────────────
function FactorCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        <div className={`text-sm font-bold ${color}`}>{value}</div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ResultsSection({ answers, onRetake }: { answers: QuizAnswers; onRetake: () => void }) {
  const score = calculateScore(answers)
  const recs  = getRecommendations(answers)
  const noTies = answers.ties.length === 0 || answers.ties.includes('none')
  const passportTier = getPassportStrengthLabel(answers.passport)

  const denialLabel = answers.denial === 'never' ? 'No Prior Denials (+15)' :
    answers.denial === 'once_old'    ? 'Prior Denial (−10)' :
    answers.denial === 'once_recent' ? 'Recent Denial (−20)' : 'Multiple Denials (−30)'
  const denialColor = answers.denial === 'never' ? 'text-emerald-600' : 'text-red-500'

  const tiesLabel = noTies ? 'No Ties (−15)' :
    answers.ties.length >= 4 ? `${answers.ties.length} Strong Ties (+${Math.min(answers.ties.length * 5, 25)})` :
    `${answers.ties.length} Tie${answers.ties.length > 1 ? 's' : ''} (+${answers.ties.length * 5})`
  const tiesColor = noTies ? 'text-red-500' : answers.ties.length >= 3 ? 'text-emerald-600' : 'text-amber-600'

  const finLabel = answers.financial === 'strong' ? 'Strong (+10)' : answers.financial === 'good' ? 'Good (+5)' :
    answers.financial === 'moderate' ? 'Moderate (±0)' : 'Limited (−10)'
  const finColor = answers.financial === 'strong' ? 'text-emerald-600' : answers.financial === 'limited' ? 'text-red-500' : 'text-amber-600'

  const shareText = `My visa approval odds are ${score}%! 🌍 Find out yours at visitplane.com/visa-checker`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  const copyScore = () => navigator.clipboard?.writeText(shareText).catch(() => {})

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* ── YMYL honesty band — guidance not guarantee + official source ── */}
        <VisaDataDisclaimer destinationName={answers.destination} homeCountry={answers.passport} />

        {/* ── Score card ─────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
          {/* Dark header */}
          <div className="bg-[#0f0c29] px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-4 text-4xl mb-3">
              <span>{FLAGS[answers.passport] ?? '🌍'}</span>
              <span className="text-white/40 text-2xl">→</span>
              <span>{FLAGS[answers.destination] ?? '🌍'}</span>
            </div>
            <div className="text-white font-bold text-lg">{answers.passport} → {answers.destination}</div>
            <div className="text-white/50 text-sm mt-0.5">Tourist Visa Assessment</div>
          </div>

          {/* Score circle */}
          <ScoreCircle score={score} />

          {/* Factor breakdown */}
          <div className="px-8 pb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <FactorCard icon="🛂" label="Passport Strength"
                value={`${passportTier} ${passportTier === 'Strong' ? '(+35)' : passportTier === 'Moderate' ? '(+0)' : '(−30)'}`}
                color={passportTier === 'Strong' ? 'text-emerald-600' : passportTier === 'Weak' ? 'text-red-500' : 'text-amber-600'} />
              <FactorCard icon={answers.denial === 'never' ? '✅' : '⚠️'} label="Denial History" value={denialLabel} color={denialColor} />
              <FactorCard icon="🏠" label="Ties to Home" value={tiesLabel} color={tiesColor} />
              <FactorCard icon="💰" label="Financial Situation" value={finLabel} color={finColor} />
            </div>
          </div>
        </div>

        {/* ── Recommendations ─────────────────────────────────────── */}
        <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-1">Your Action Plan</h3>
          <p className="text-sm text-gray-500 mb-6">Follow these steps to maximize your approval odds.</p>
          <div className="space-y-3">
            {recs.map((r, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                <span className="text-2xl shrink-0 mt-0.5">{r.icon}</span>
                <p className="text-sm text-gray-700 flex-1">{r.text}</p>
                {r.href && (
                  <Link href={r.href}
                    className="shrink-0 text-xs font-bold text-teal-600 border border-teal-200 bg-teal-50 rounded-lg px-2.5 py-1 hover:bg-teal-100 transition">
                    Go →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Next steps ──────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-6">Next Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon:'📋', label:'Get Document Checklist', href:'/checklist', color:'bg-blue-50 border-blue-100 text-blue-700' },
              { icon:'🎤', label:'Practice Interview',     href:'/interview-prep', color:'bg-purple-50 border-purple-100 text-purple-700' },
              { icon:'🏛️', label:'Find Embassy',           href:'/embassy-finder', color:'bg-teal-50 border-teal-100 text-teal-700' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md ${a.color}`}>
                <span className="text-3xl">{a.icon}</span>
                <span className="text-sm font-bold leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Share + Retake ────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white shadow-xl shadow-gray-200/60 border border-gray-100 p-8 text-center">
          <div className="text-lg font-bold text-gray-800 mb-4">📤 Share Your Score</div>
          <p className="text-sm text-gray-500 mb-6">My visa approval odds are <strong>{score}%</strong>! Share with friends planning the same trip.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1ebe5a] hover:-translate-y-0.5">
              <span>📲</span> Share on WhatsApp
            </a>
            <button onClick={copyScore}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50">
              <span>📋</span> Copy to Clipboard
            </button>
          </div>
          <button onClick={onRetake}
            className="mt-6 w-full rounded-2xl border-2 border-teal-200 bg-teal-50 px-6 py-3.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100">
            🔄 Retake Quiz
          </button>
        </div>

      </div>
    </div>
  )
}
