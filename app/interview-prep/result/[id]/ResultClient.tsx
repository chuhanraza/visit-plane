'use client'

import { useState } from 'react'
import Link from 'next/link'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'

interface Props {
  countryName: string
  countryFlag: string
  countrySlug: string
  visaCode: string
  visaLabel: string
  overall: number
  categories: Record<string, number>
}

export default function ResultClient({
  countryName, countryFlag, countrySlug, visaCode, visaLabel, overall, categories,
}: Props) {
  const [copied, setCopied] = useState(false)
  const verdict = overall >= 80 ? 'Strong — well prepared' : overall >= 60 ? 'Solid — a little polish needed' : 'Keep practicing the gaps'
  const mockUrl = `/interview-prep/mock/${countrySlug}-${visaCode.toLowerCase()}`
  const studyUrl = `/interview-prep/${countrySlug}/${visaCode.toLowerCase()}`

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `I scored ${overall}/100 on my ${countryName} ${visaLabel} mock visa interview at VisitPlane 🎤`

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
      <ToolBreadcrumb toolName={`${countryName} Interview Result`} toolEmoji="🎤" />
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Interview Readiness Score</p>
          <p className="mt-1 text-sm text-slate-500">{countryFlag} {countryName} · {visaLabel}</p>
          <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
            <span className="text-3xl font-extrabold">{overall}<span className="text-base">/100</span></span>
          </div>
          <p className="mt-3 font-bold">{verdict}</p>
        </div>

        {Object.keys(categories).length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold">Breakdown</p>
            <div className="space-y-2">
              {Object.entries(categories).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs capitalize text-slate-500">{k.replace(/_/g, ' ')}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${Math.max(0, Math.min(10, v)) * 10}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-600">{v}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold">📲 Share</p>
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white">💬 WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">𝕏 Post</a>
            <button type="button" onClick={copy} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">{copied ? '✓ Copied' : '🔗 Copy'}</button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link href={mockUrl} className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-center text-sm font-bold text-white">🎤 Try your own mock interview</Link>
          <Link href={studyUrl} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700">📚 Study the question bank</Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Practice score only — visa decisions rest with the consular officer.
        </p>
      </div>
    </div>
  )
}
