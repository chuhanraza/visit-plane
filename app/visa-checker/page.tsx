'use client'
import { useState, useEffect } from 'react'
import type { QuizAnswers, DenialValue, FinancialValue } from './data'
import { EMPTY_ANSWERS } from './data'
import VisaNavbar        from './components/VisaNavbar'
import LandingSection    from './components/LandingSection'
import ProgressBar       from './components/ProgressBar'
import Step1Passport     from './components/Step1Passport'
import Step2Destination  from './components/Step2Destination'
import Step3Denial       from './components/Step3Denial'
import Step4Ties         from './components/Step4Ties'
import Step5Financial    from './components/Step5Financial'
import ResultsSection    from './components/ResultsSection'
import { useUserCountry } from '@/hooks/useUserCountry'

export default function VisaCheckerPage() {
  const [step, setStep]       = useState(0) // 0=landing, 1-5=quiz, 6=results
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS)

  const next    = () => setStep(s => s + 1)
  const prev    = () => setStep(s => Math.max(1, s - 1))
  const restart = () => { setStep(0); setAnswers(EMPTY_ANSWERS) }

  const set = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) =>
    setAnswers(a => ({ ...a, [key]: value }))

  const { countryName, loading: geoLoading } = useUserCountry()

  // Pre-fill passport from IP geo when user reaches Step 1
  useEffect(() => {
    if (countryName && !geoLoading && !answers.passport) {
      set('passport', countryName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryName, geoLoading])

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <VisaNavbar />

      {/* ── Landing ─────────────────────────────────────────────── */}
      {step === 0 && <LandingSection onStart={() => setStep(1)} />}

      {/* ── Quiz steps ──────────────────────────────────────────── */}
      {step >= 1 && step <= 5 && (
        <div className="px-4 pt-10 pb-20">
          <ProgressBar step={step} totalSteps={5} />
          <div className="mx-auto mt-8 max-w-xl">
            {step === 1 && (
              <Step1Passport
                value={answers.passport}
                onChange={v => set('passport', v)}
                onNext={next}
              />
            )}
            {step === 2 && (
              <Step2Destination
                passport={answers.passport}
                value={answers.destination}
                onChange={v => set('destination', v)}
                onNext={next}
                onBack={prev}
              />
            )}
            {step === 3 && (
              <Step3Denial
                value={answers.denial}
                onChange={v => set('denial', v as DenialValue)}
                onNext={next}
                onBack={prev}
              />
            )}
            {step === 4 && (
              <Step4Ties
                value={answers.ties}
                onChange={v => set('ties', v)}
                onNext={next}
                onBack={prev}
              />
            )}
            {step === 5 && (
              <Step5Financial
                value={answers.financial}
                onChange={v => set('financial', v as FinancialValue)}
                onNext={next}
                onBack={prev}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {step === 6 && <ResultsSection answers={answers} onRetake={restart} />}
    </div>
  )
}
