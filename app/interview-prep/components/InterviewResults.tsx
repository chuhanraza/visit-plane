'use client'
import Link from 'next/link'
import { COUNTRIES } from '../data'

interface Props {
  country: string
  visaType: string
  questionCount: number
  onRetry: () => void
}

const FOCUS_AREAS: Record<string, string[]> = {
  Tourist: ['Strong ties to home country', 'Financial proof & bank statements', 'Clear travel itinerary & bookings'],
  Student: ['Enrollment + tuition proof', 'Return plan after graduation', 'English proficiency scores'],
  Work:    ['Employment contract details', 'Qualification documentation', 'Prevailing wage compliance'],
}

// Circular SVG progress
function CircularScore({ score }: { score: number }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-[#0f0c29]" style={{ color }}>{score}%</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Ready</span>
      </div>
    </div>
  )
}

export default function InterviewResults({ country, visaType, questionCount, onRetry }: Props) {
  const countryData = COUNTRIES.find(c => c.value === country)
  const score = 87
  const focusAreas = FOCUS_AREAS[visaType] ?? FOCUS_AREAS.Tourist

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`🎉 I just scored ${score}% on my ${country} ${visaType} visa interview prep!\n\nPractice yours free: https://visitplane.com/interview-prep`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <section className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/60 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-8 text-center">
            <div className="text-6xl animate-bounce-trophy mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-white mb-1">Interview Complete!</h2>
            <p className="text-teal-100 text-sm">
              You&apos;ve prepared {questionCount} questions for{' '}
              <span className="font-bold">{countryData?.flag} {country}</span> {visaType} visa
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Readiness Score */}
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Readiness Score</p>
              <CircularScore score={score} />
              <p className="mt-3 text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Based on your selected visa type and common officer concerns for {country}
              </p>
            </div>

            {/* Focus Areas */}
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">What To Focus On</p>
              <div className="grid gap-2">
                {focusAreas.map((area, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600">{i + 1}</span>
                    <span className="text-sm font-medium text-[#0f0c29]">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onRetry}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-600 transition col-span-2">
                🔄 Practice Again
              </button>
              <Link href="/checklist"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-teal-400 hover:text-teal-600 transition">
                📋 Document Checklist
              </Link>
              <Link href="/embassy-finder"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-teal-400 hover:text-teal-600 transition">
                🏛️ Find Embassy
              </Link>
              <button onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100 transition col-span-2">
                📤 Share My Prep Score on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
