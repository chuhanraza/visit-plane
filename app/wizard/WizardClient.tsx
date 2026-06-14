'use client'

import { useState, useEffect } from 'react'
import WizardHero from './components/WizardHero'
import WizardStep, { type WizardAnswers } from './components/WizardStep'
import WizardResults from './components/WizardResults'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import type { VisaData } from '@/lib/visa-engine'
import { ALL_COUNTRIES } from '@/components/CountrySelect'

type Phase = 'hero' | 'steps' | 'loading' | 'results'

// Map IP-geo names to the canonical CountrySelect names where they differ
const GEO_ALIASES: Record<string, string> = {
  UAE: 'United Arab Emirates',
}

/** Returns the canonical CountrySelect name for a detected name, or null if unknown. */
function canonicalCountry(name: string): string | null {
  if (!name) return null
  const normalized = GEO_ALIASES[name] ?? name
  return (
    ALL_COUNTRIES.find((c) => c.name.toLowerCase() === normalized.toLowerCase())?.name ?? null
  )
}

interface Props {
  /** Pre-loaded state from a shareable URL (base64 decoded) */
  initialAnswers?: Partial<WizardAnswers>
}

export default function WizardClient({ initialAnswers }: Props) {
  const [phase, setPhase] = useState<Phase>(initialAnswers ? 'loading' : 'hero')
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>(initialAnswers ?? {})
  const [visaData, setVisaData] = useState<VisaData | null>(null)
  const [aiInsight, setAiInsight] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)
  const [autoDetected, setAutoDetected] = useState<string | null>(null)

  // Auto-run when pre-loaded from shareable URL
  useEffect(() => {
    if (initialAnswers) {
      fetchResults(initialAnswers as WizardAnswers)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pre-fill passport from saved choice, else IP-based country detection.
  // Skipped when arriving via a shared result URL (initialAnswers present).
  useEffect(() => {
    if (initialAnswers) return
    let cancelled = false

    const apply = (name: string) => {
      const canonical = canonicalCountry(name)
      if (!canonical || cancelled) return false
      setAnswers((prev) => (prev.passport ? prev : { ...prev, passport: canonical }))
      setAutoDetected(canonical)
      try { localStorage.setItem('visitplane_passport', canonical) } catch { /* ignore */ }
      return true
    }

    // 1. Saved passport from a previous session
    try {
      const saved = localStorage.getItem('visitplane_passport')
      if (saved && apply(saved)) return
    } catch { /* ignore */ }

    // 2. IP-based detection (Vercel geo header, free)
    ;(async () => {
      try {
        const res = await fetch('/api/geo')
        if (!res.ok) return
        const data = await res.json()
        if (data?.countryName) apply(data.countryName)
      } catch { /* ignore — user picks manually */ }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleStart() {
    setPhase('steps')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAnswer(field: keyof WizardAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  function handleNext() {
    if (step < 5) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // All 5 answered — fetch results
      fetchResults(answers as WizardAnswers)
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setPhase('hero')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function fetchResults(a: WizardAnswers) {
    setPhase('loading')
    setVisaData(null)
    setAiInsight('')

    try {
      // Fetch structured visa data (decision tree — fast, reliable)
      const params = new URLSearchParams({
        passport: a.passport,
        destination: a.destination,
        purpose: a.purpose ?? 'Tourism',
      })
      const res = await fetch(`/api/visa-data?${params}`)
      const data: VisaData = await res.json()
      setVisaData(data)
      setPhase('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // Fallback: show results with no visa data (graceful)
      setPhase('results')
    }

    // Phase 5: Fetch AI insight asynchronously (non-blocking)
    setAiLoading(true)
    try {
      const aiRes = await fetch('/api/wizard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(a),
      })
      const aiData = await aiRes.json()
      if (aiData.insight) setAiInsight(aiData.insight)
    } catch {
      // AI failure — result card already showing, just skip AI section
    } finally {
      setAiLoading(false)
    }
  }

  function handleRestart() {
    setPhase('hero')
    setStep(1)
    setAnswers({})
    setVisaData(null)
    setAiInsight('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <ToolBreadcrumb toolName="AI Visa Wizard" toolEmoji="🤖" />

      {phase === 'hero' && <WizardHero onStart={handleStart} />}

      {phase === 'steps' && (
        <div className="py-12">
          <WizardStep
            step={step}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
            autoDetected={autoDetected}
          />
        </div>
      )}

      {phase === 'loading' && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          <p className="text-slate-600 font-medium">Generating your visa plan…</p>
          <p className="text-sm text-slate-400">Checking requirements for your route</p>
        </div>
      )}

      {phase === 'results' && visaData && (
        <div className="py-10">
          <WizardResults
            answers={answers as WizardAnswers}
            visaData={visaData}
            aiInsight={aiInsight}
            aiLoading={aiLoading}
            onRestart={handleRestart}
          />
        </div>
      )}
    </div>
  )
}
