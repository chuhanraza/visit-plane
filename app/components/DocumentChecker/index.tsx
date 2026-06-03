'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCountryRequirements } from '@/app/data/documentRequirements'
import type { DocumentSpec } from '@/app/data/documentRequirements'
import type { DocumentResult } from './ResultCard'
import ResultCard from './ResultCard'
import UploadStep from './UploadStep'
import FinalReport from './FinalReport'

interface Props {
  country: string        // e.g. "schengen", "usa", "uae"
  countryLabel: string   // e.g. "UAE"
  visaType?: string      // e.g. "Tourist Visa"
  onClose: () => void
}

type StepStatus = 'pending' | 'active' | 'done' | 'error'

interface DocState {
  spec: DocumentSpec
  status: StepStatus
  result: DocumentResult | null
}

const FREE_LIMIT = 3

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

// ─── Welcome Screen ──────────────────────────────────────────────────────────
function WelcomeScreen({
  countryLabel,
  visaType,
  docCount,
  checksUsed,
  onStart,
  onClose,
}: {
  countryLabel: string
  visaType?: string
  docCount: number
  checksUsed: number
  onStart: () => void
  onClose: () => void
}) {
  const checksLeft = Math.max(0, FREE_LIMIT - checksUsed)
  const atLimit = checksLeft === 0

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-5 px-1"
    >
      {/* Hero */}
      <div className="text-center pt-2">
        <div className="text-4xl mb-3">🤖</div>
        <h2 className="text-lg font-bold text-white leading-snug">
          Let&apos;s check your documents
          {countryLabel ? (
            <> for <span className="text-[#14B8A6]">{countryLabel}</span></>
          ) : null}
          {visaType ? (
            <> <span className="text-gray-400 font-normal text-base">{visaType}</span></>
          ) : null}
        </h2>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
          We&apos;ll analyze each document against official requirements and tell you
          what&apos;s good, what&apos;s wrong, and what to fix — <em>before</em> you submit.
        </p>
      </div>

      {/* Trust badges */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] divide-y divide-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-base">⏱️</span>
          <div>
            <p className="text-sm text-gray-200 font-medium">Takes about 2–3 minutes</p>
            <p className="text-xs text-gray-500">Checking {docCount} document{docCount !== 1 ? 's' : ''} · ~15s each</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-base">🔒</span>
          <div>
            <p className="text-sm text-gray-200 font-medium">Files deleted instantly after check</p>
            <p className="text-xs text-gray-500">Images are compressed client-side, never stored</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-base">✓</span>
          <div>
            <p className="text-sm text-gray-200 font-medium">
              {atLimit ? (
                <span className="text-amber-400">You&apos;ve used all {FREE_LIMIT} free checks today</span>
              ) : (
                <>Free — <span className="text-[#14B8A6]">{checksLeft} check{checksLeft !== 1 ? 's' : ''} remaining</span> today</>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {atLimit ? 'Upgrade to Pro for unlimited checks' : `${FREE_LIMIT} free per day · Pro for unlimited`}
            </p>
          </div>
        </div>
      </div>

      {/* Documents list preview */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents we&apos;ll check</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: docCount }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {atLimit ? (
        <div className="space-y-2">
          <div className="rounded-xl border border-amber-500/30 bg-amber-900/20 px-4 py-3 text-center">
            <p className="text-sm font-bold text-amber-300 mb-0.5">Daily limit reached</p>
            <p className="text-xs text-amber-400/80">Come back tomorrow or upgrade for unlimited checks</p>
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white transition hover:from-amber-400 hover:to-orange-400"
          >
            Upgrade to VisitPlane Pro · $9/mo →
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 transition hover:text-gray-400"
          >
            Not now
          </button>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="w-full rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-[#0d9488] hover:to-[#4F46E5] active:scale-[0.98]"
        >
          Start Document Check →
        </button>
      )}
    </motion.div>
  )
}

// ─── Checks counter badge ─────────────────────────────────────────────────────
function ChecksCounter({ used }: { used: number }) {
  if (used === 0) return null
  const left = Math.max(0, FREE_LIMIT - used)
  const atLimit = left === 0
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      atLimit ? 'bg-amber-500/15 text-amber-300' : 'bg-white/8 text-gray-400'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${atLimit ? 'bg-amber-400' : 'bg-[#14B8A6]'}`} />
      {atLimit ? 'Limit reached' : `${left} free check${left !== 1 ? 's' : ''} left`}
    </div>
  )
}

// ─── Pro upsell (inline, after limit) ────────────────────────────────────────
function ProUpsellInline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-orange-900/20 px-5 py-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-sm font-bold text-amber-300">You&apos;ve used {FREE_LIMIT} free checks today</p>
            <p className="mt-0.5 text-xs text-amber-400/80 leading-relaxed">
              Unlock unlimited checks, priority AI (under 5s), downloadable PDF reports, and saved document profiles.
            </p>
          </div>
        </div>
        <button className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-amber-400 hover:to-orange-400">
          Upgrade · $9/mo →
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main DocumentChecker ─────────────────────────────────────────────────────
export default function DocumentChecker({ country, countryLabel, visaType, onClose }: Props) {
  const reqs = getCountryRequirements(country)
  const [step, setStep] = useState<'welcome' | 'checking' | 'report'>('welcome')
  const [docs, setDocs] = useState<DocState[]>(() =>
    (reqs?.documents ?? []).map((spec, i) => ({
      spec,
      status: i === 0 ? 'pending' : 'pending',  // all pending at start, first goes active on Start
      result: null,
    }))
  )
  const [checksUsed, setChecksUsed] = useState(getChecksUsed)
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

  function handleStart() {
    // Activate the first document
    setDocs(prev => prev.map((d, i) => i === 0 ? { ...d, status: 'active' as StepStatus } : d))
    setStep('checking')
  }

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
      if (allDone) setTimeout(() => setStep('report'), 400)
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
      i === idx ? { ...d, status: 'active' as StepStatus, result: null } : d
    ))
    setStep('checking')
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

  const showProBanner = checksUsed >= FREE_LIMIT && step === 'checking'
  const progressPct = step === 'welcome' ? 0
    : step === 'report' ? 100
    : Math.round((docs.filter(d => d.status === 'done' || d.status === 'error').length / docs.length) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0D1526] shadow-2xl"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl overflow-hidden bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#14B8A6] to-[#6366F1]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 mt-0.5">
          <div>
            <p className="font-bold text-white">AI Document Checker</p>
            <p className="text-xs text-gray-400">
              {countryLabel}{visaType ? ` · ${visaType}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ChecksCounter used={checksUsed} />
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition hover:bg-white/20 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <AnimatePresence mode="wait">

            {/* ── WELCOME ── */}
            {step === 'welcome' && (
              <WelcomeScreen
                key="welcome"
                countryLabel={countryLabel}
                visaType={visaType}
                docCount={docs.length}
                checksUsed={checksUsed}
                onStart={handleStart}
                onClose={onClose}
              />
            )}

            {/* ── CHECKING ── */}
            {step === 'checking' && (
              <motion.div key="checking" className="space-y-3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {showProBanner && <ProUpsellInline />}

                {docs.map((d, idx) => {
                  const isActive  = d.status === 'active'
                  const isDone    = d.status === 'done'
                  const isError   = d.status === 'error'
                  const isPending = d.status === 'pending'
                  const stepNum   = idx + 1

                  return (
                    <div
                      key={d.spec.id}
                      className={`rounded-2xl border transition-all duration-300 ${
                        isActive  ? 'border-[#14B8A6]/40 bg-[#14B8A6]/5'
                        : isDone  ? 'border-green-500/20 bg-green-900/5'
                        : isError ? 'border-red-500/20 bg-red-900/5'
                        : 'border-white/5 bg-white/[0.02] opacity-40'
                      } p-4`}
                    >
                      {/* Step header */}
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                          isDone ? 'bg-green-500 text-white'
                          : isError ? 'bg-red-500 text-white'
                          : isActive ? 'bg-[#14B8A6] text-white'
                          : 'bg-white/10 text-gray-600'
                        }`}>
                          {isDone ? '✓' : isError ? '!' : stepNum}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isPending ? 'text-gray-500' : 'text-white'}`}>
                            {d.spec.label}
                          </p>
                          {isActive && (
                            <p className="text-xs text-[#14B8A6]">
                              Document {stepNum} of {docs.length}
                            </p>
                          )}
                        </div>
                        {d.spec.required && isPending && (
                          <span className="text-xs text-gray-600">Required</span>
                        )}
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
                          docSpec={d.spec}
                          country={countryLabel}
                          onResult={r => handleResult(idx, r)}
                          onError={() => handleError(idx)}
                        />
                      )}
                    </div>
                  )
                })}

                {/* View report button if all done */}
                {docs.every(d => d.status === 'done' || d.status === 'error') && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setStep('report')}
                    className="w-full rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#6366F1] py-3 text-sm font-bold text-white transition hover:from-[#0d9488] hover:to-[#4F46E5]"
                  >
                    View Full Report →
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* ── REPORT ── */}
            {step === 'report' && (
              <motion.div key="report"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <FinalReport
                  docs={docs.map(d => ({ spec: d.spec, result: d.result }))}
                  country={countryLabel}
                  onClose={onClose}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
