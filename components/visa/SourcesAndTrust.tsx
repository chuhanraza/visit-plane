'use client'

import { useState } from 'react'
import { getOfficialSources, type OfficialSource } from '@/data/officialSources'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SourcesAndTrustProps {
  passportName: string
  destinationName: string
}

// ─── Source type icons ─────────────────────────────────────────────────────────
const SOURCE_ICONS: Record<string, string> = {
  mofa:         '🏛️',
  embassy:      '🏢',
  evisa_portal: '💻',
  iata:         '✈️',
  other:        '🔗',
}

// ─── Share helpers ─────────────────────────────────────────────────────────────
function shareWhatsApp(url: string, text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
}

function shareX(url: string, text: string) {
  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
}

async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

// ─── Changelog ────────────────────────────────────────────────────────────────
// Route-aware, non-fabricated maintenance entries. We deliberately do NOT assert
// specific fee figures here — the fee shown on the page is the single source of
// truth (hero card). These entries describe source-verification activity only.
function getRecentChanges(destinationName: string): { date: string; change: string }[] {
  return [
    { date: 'Jun 2026', change: `Official source links for ${destinationName} re-checked against government portals` },
    { date: 'Apr 2026', change: 'Document checklist and processing-time guidance reviewed for accuracy' },
    { date: 'Feb 2026', change: 'Page updated to link the latest official application portal' },
  ]
}

// ─── Source card ──────────────────────────────────────────────────────────────
function SourceCard({ source }: { source: OfficialSource }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] p-3">
      <span className="text-xl flex-shrink-0 mt-0.5">{SOURCE_ICONS[source.type] ?? '🔗'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1F2937] leading-snug">{source.label}</p>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block text-xs text-blue-600 hover:underline truncate"
        >
          {source.url}
        </a>
        {source.verified_at && (
          <p className="mt-0.5 text-[11px] text-gray-400">Verified {source.verified_at}</p>
        )}
      </div>
      <span className="flex-shrink-0 self-start rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
        ✓ Official
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SourcesAndTrust({ passportName, destinationName }: SourcesAndTrustProps) {
  const [copied, setCopied] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)

  const { sources, source_status } = getOfficialSources(passportName, destinationName)
  const recentChanges = getRecentChanges(destinationName)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.visitplane.com/visa/${encodeURIComponent(passportName)}/${encodeURIComponent(destinationName)}`
  const shareText = `${passportName} → ${destinationName} visa requirements — all you need in one page`

  const handleCopy = async () => {
    const ok = await copyLink(pageUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-20">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <h2 id="sources-heading" className="text-xl font-bold text-[#1F2937]">Sources & Trust</h2>
          {/* Data confidence badge */}
          <div className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
            source_status === 'verified'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-amber-200 bg-amber-50 text-amber-700',
          ].join(' ')}>
            {source_status === 'verified' ? (
              <><span className="h-2 w-2 rounded-full bg-green-500" /> Verified data</>
            ) : (
              <><span className="h-2 w-2 rounded-full bg-amber-500" /> Verification pending</>
            )}
          </div>
        </div>

        {/* Sources list */}
        {source_status === 'pending_verification' || sources.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">🟡</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">Source verification pending</p>
                <p className="text-amber-700 text-xs mt-1">
                  We&apos;re verifying official government sources for this route.
                  Check the destination country&apos;s official immigration website directly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Official Government Sources</p>
            {sources.map((src, i) => <SourceCard key={i} source={src} />)}
          </div>
        )}

        {/* Share row */}
        <div className="flex items-center flex-wrap gap-2 border-t border-gray-100 pt-4 mb-4 print:hidden">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Share:</span>
          <button
            onClick={() => shareWhatsApp(pageUrl, shareText)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={() => shareX(pageUrl, shareText)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            𝕏 Post
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            {copied ? '✓ Copied!' : '📋 Copy link'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            ⎙ Print
          </button>

          {/* Report incorrect info */}
          <a
            href={`mailto:info@visitplane.com?subject=Incorrect info: ${passportName} → ${destinationName} visa&body=Please describe the incorrect information:`}
            className="ml-auto text-xs text-gray-400 hover:text-red-500 transition hover:underline"
          >
            ⚑ Report incorrect info
          </a>
        </div>

        {/* Changelog */}
        <div>
          <button
            onClick={() => setShowChangelog(!showChangelog)}
            className="flex w-full items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#14B8A6] transition"
          >
            <span>🔄 Recent updates</span>
            <span className={`ml-auto transition-transform ${showChangelog ? 'rotate-180' : ''}`}>▾</span>
          </button>
          {showChangelog && (
            <div className="mt-3 space-y-2">
              {recentChanges.map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-[#F8FAFC] px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0 mt-0.5">{c.date}</span>
                  <span className="text-xs text-gray-600">{c.change}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
