'use client'

import Link from 'next/link'
import { WizardAnswers } from './WizardChat'

interface Props {
  answers: WizardAnswers
  onRestart: () => void
}

export default function WizardResults({ answers, onRestart }: Props) {
  const { passport, destination, purpose, duration, travelDate } = answers

  const passportSlug = encodeURIComponent(passport)
  const destSlug = encodeURIComponent(destination)

  const tiles = [
    { label: 'From', value: passport, icon: '🛂' },
    { label: 'Destination', value: destination, icon: '🌍' },
    { label: 'Purpose', value: purpose.replace(/^[^\s]+\s/, ''), icon: '🎯' },
    { label: 'Duration', value: duration.replace(/^[^\s]+\s/, ''), icon: '📅' },
  ]

  const whatsappText = encodeURIComponent(
    `I just used VisitPlane's AI Visa Wizard! 🤖\n${passport} → ${destination} visa guide generated instantly.\nTry it free: https://visitplane.com/wizard`
  )

  return (
    <div className="mx-auto w-full max-w-2xl px-4 mt-8 mb-16">
      {/* Summary card */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
        {/* Card header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-0.5">Your Visa Summary</p>
          <h2 className="text-lg font-bold text-white">
            {passport} → {destination}
          </h2>
        </div>

        {/* Info tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
          {tiles.map((tile) => (
            <div key={tile.label} className="flex flex-col items-center justify-center gap-1 px-4 py-5 text-center">
              <span className="text-2xl">{tile.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tile.label}</span>
              <span className="text-sm font-semibold text-slate-800 leading-tight">{tile.value}</span>
            </div>
          ))}
        </div>

        {/* Travel date banner */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center gap-2">
          <span className="text-base">🗓️</span>
          <span className="text-sm text-slate-600 font-medium">Planning to travel: <span className="text-slate-800">{travelDate}</span></span>
        </div>

        {/* Action buttons */}
        <div className="border-t border-slate-100 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Next Steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={`/visa/${passportSlug}/${destSlug}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
            >
              <span className="text-base">📋</span>
              <span>View Full Requirements</span>
            </Link>
            <Link
              href="/interview-prep"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
            >
              <span className="text-base">🎤</span>
              <span>Practice Interview</span>
            </Link>
            <Link
              href="/checklist"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
            >
              <span className="text-base">📄</span>
              <span>Get Document Checklist</span>
            </Link>
            <button
              onClick={onRestart}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
            >
              <span className="text-base">🔄</span>
              <span>Start Over</span>
            </button>
          </div>

          {/* WhatsApp share */}
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1ebe5b] transition"
          >
            <span className="text-base">📤</span>
            Share my visa guide on WhatsApp
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs text-slate-400">
        AI-generated guidance is for reference only. Always verify with official embassy sources.
      </p>
    </div>
  )
}
