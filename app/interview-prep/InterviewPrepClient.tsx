'use client'

import { useState } from 'react'
import { QUESTIONS } from './data'
import Navbar           from './components/Navbar'
import Footer           from './components/Footer'
import InterviewHero    from './components/InterviewHero'
import InterviewRoom    from './components/InterviewRoom'
import InterviewResults from './components/InterviewResults'
import InterviewTips    from './components/InterviewTips'
import InterviewChecklist   from './components/InterviewChecklist'
import InterviewSocialProof from './components/InterviewSocialProof'

type View = 'home' | 'room' | 'results'

export default function InterviewPrepClient() {
  const [view,     setView]     = useState<View>('home')
  const [country,  setCountry]  = useState('')
  const [visaType, setVisaType] = useState('')
  const [currentQ, setCurrentQ] = useState(0)

  const questions = country && visaType ? (QUESTIONS[country]?.[visaType] ?? []) : []

  const handleEnter = () => {
    if (!country || !visaType || questions.length === 0) return
    setCurrentQ(0)
    setView('room')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrev = () => setCurrentQ(q => Math.max(0, q - 1))
  const handleNext = () => setCurrentQ(q => Math.min(questions.length - 1, q + 1))

  const handleComplete = () => {
    setView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRetry = () => {
    setCurrentQ(0)
    setView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Interview Room view (full dark immersive page) ────────────────────────
  if (view === 'room') {
    return (
      <div className="min-h-screen bg-[#0f0c29] text-white antialiased">
        <Navbar />
        <InterviewRoom
          questions={questions}
          country={country}
          visaType={visaType}
          currentQ={currentQ}
          onPrev={handlePrev}
          onNext={handleNext}
          onComplete={handleComplete}
        />
        <Footer />
      </div>
    )
  }

  // ── Results view ──────────────────────────────────────────────────────────
  if (view === 'results') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] antialiased">
        <Navbar />
        <InterviewResults
          country={country}
          visaType={visaType}
          questionCount={questions.length}
          onRetry={handleRetry}
        />
        <InterviewChecklist country={country} visaType={visaType} />
        <InterviewSocialProof />
        <Footer />
      </div>
    )
  }

  // ── Home view (hero + tips + checklist + social proof) ────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      <Navbar />
      <InterviewHero
        country={country}
        visaType={visaType}
        onCountryChange={v => { setCountry(v); setVisaType('') }}
        onVisaTypeChange={setVisaType}
        onEnter={handleEnter}
      />
      <InterviewTips />
      <InterviewChecklist country={country} visaType={visaType} />
      <InterviewSocialProof />
      <Footer />
    </div>
  )
}
