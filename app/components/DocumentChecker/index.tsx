'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCountryRequirements } from '@/app/data/documentRequirements'
import type { DocumentSpec } from '@/app/data/documentRequirements'
import type { DocumentResult } from './ResultCard'
import ResultCard from './ResultCard'
import UploadStep from './UploadStep'
import PrivacyBanner from './PrivacyBanner'
import ProUpsellBanner from './ProUpsellBanner'
import FinalReport from './FinalReport'

interface Props {
  country: string          // e.g. "schengen", "usa", "uae"
  countryLabel: string     // e.g. "UAE"
  onClose: () => void
}

type StepStatus = 'pending' | 'active' | 'done' | 'error'

interface DocState {
  spec: DocumentSpec
  status: StepStatus
  result: DocumentResult | null
}

function todayKey() {
  return `vp_doc_checks_${new Date().toISOString().slice(0, 10)}`
}

function getChecksUsed(): number {
  try { return Number(localStorage.getItem(todayKey()) ?? 0) } catch { return 0 }
}
function incrementChecks() {
  try {
    const k = todayKey()
    localStorage.setItem(k, String(Number(localStorage.getItem(k) ?? 0) + 1))
  } catch { /* ignore */ }
}

export default function DocumentChecker({ country, countryLabel, onClose }: Props) {
  const reqs = getCountryRequirements(country)
  const [docs, setDocs] = useState<DocState[]>(() =>
    (reqs?.documents ?? []).map((spec, i) => ({
      spec,
      status: i === 0 ? 'active' : 'pending',
      result: null,
    }))
  )
  const [showReport, setShowReport]   = useState(false)
  const [checksUsed, setChecksUsed]   = useState(getChecksUsed)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const currentIdx = docs.findIndex(d => d.status === 'active')

  function handleResult(idx: number, result: DocumentResult) {
    incrementChecks()
    setChecksUsed(getChecksUsed())
    setDocs(prev => {
      const next = prev.map((d, i) =>
        i === idx ? { ...d, status: 'done' as StepStatus, result }
        : i === idx + 1 ? { ...d, status: 'active' as StepStatus }
        : d
      )
      const allDone = next.every(d => d.status === 'done' || d.status === 'error')
      if (allDone) setTimeout(() => setShowReport(true), 400)
      return next
    })
  }

  function handleError(idx: number) {
    setDocs(prev => prev.map((d, i) =>
      i === idx ? { ...d, status: 'error' as StepStatus } : d
    ))
  }

  function handleReUpload(idx: number) {
    setDocs(prev => prev.map((d, i) =>
      i === idx ? { ...d, status: 'active' as StepStatus, result: null }
      : i > idx && d.status === 'pending' ? d
      : d
    ))
    setShowReport(false)
  }

  if (!reqs) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="rounded-2xl border border-white/10 bg-[#0D1526] p-8 text-center text-gray-400">
          <p>No document requirements found for <strong className="text-white">{countryLabel}</strong>.</p>
          <button onClick={onClose} className="mt-4 text-[#14B8A6] underline">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:60 }}
        transition={{ type:'spring', damping:28, stiffness:300 }}
        className="relative flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0D1526] shadow-2xl"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-bold text-white">AI Document Checker</p>
            <p className="text-xs text-gray-400">{countryLabel} Visa</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-white/20 hover:text-white">✕</button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <PrivacyBanner />
          <ProUpsellBanner checksUsed={checksUsed} />

          <AnimatePresence mode="wait">
            {showReport ? (
              <motion.div key="report" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <FinalReport
                  docs={docs.map(d => ({ spec: d.spec, result: d.result }))}
                  country={countryLabel}
                  onClose={onClose}
                />
              </motion.div>
            ) : (
              <motion.div key="steps" className="space-y-3">
                {docs.map((d, idx) => {
                  const isActive  = d.status === 'active'
                  const isDone    = d.status === 'done'
                  const isError   = d.status === 'error'
                  const isPending = d.status === 'pending'

                  return (
                    <div key={d.spec.id} className={`rounded-2xl border transition ${
                      isActive  ? 'border-[#14B8A6]/40 bg-[#14B8A6]/5'
                      : isDone  ? 'border-green-500/20 bg-green-900/5'
                      : isError ? 'border-red-500/20 bg-red-900/5'
                      : 'border-white/5 bg-white/[0.02] opacity-50'
                    } p-4`}>
                      {/* Step header */}
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-lg">
                          {isDone ? '✅' : isError ? '❌' : isActive ? '🔍' : '⬜'}
                        </span>
                        <p className={`text-sm font-semibold ${isPending ? 'text-gray-500' : 'text-white'}`}>
                          {d.spec.label}
                          {d.spec.required && <span className="ml-1 text-xs text-gray-500">(Required)</span>}
                        </p>
                      </div>

                      {/* Result card for done */}
                      {isDone && d.result && (
                        <ResultCard
                          docLabel={d.spec.label}
                          result={d.result}
                          onReUpload={() => handleReUpload(idx)}
                        />
                      )}

                      {/* Upload for active/error */}
                      {(isActive || isError) && (
                        <UploadStep
                          docLabel={`Upload ${d.spec.label}`}
                          documentType={d.spec.label}
                          country={countryLabel}
                          criteria={d.spec.criteria}
                          onResult={r => handleResult(idx, r)}
                          onError={() => handleError(idx)}
                        />
                      )}
                    </div>
                  )
                })}

                {/* View report button if all done */}
                {docs.every(d => d.status === 'done' || d.status === 'error') && !showReport && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full rounded-xl bg-[#14B8A6] py-3 text-sm font-bold text-white transition hover:bg-[#0EA5A0]"
                  >
                    View Full Report →
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
