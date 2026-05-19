'use client'

import { useState, useRef } from 'react'
import Navbar from '@/app/interview-prep/components/Navbar'
import Footer from '@/app/interview-prep/components/Footer'
import WizardHero from './components/WizardHero'
import WizardChat from './components/WizardChat'
import WizardResults from './components/WizardResults'
import type { WizardAnswers } from './components/WizardChat'

type Phase = 'hero' | 'chat'

export default function WizardClient() {
  const [phase, setPhase] = useState<Phase>('hero')
  const [answers, setAnswers] = useState<WizardAnswers | null>(null)
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState(0) // used to remount WizardChat on restart
  const resultRef = useRef<HTMLDivElement>(null)

  function handleStart() {
    setPhase('chat')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleComplete(collected: WizardAnswers) {
    setAnswers(collected)
    setLoading(true)
    setAiResponse('')

    try {
      const res = await fetch('/api/wizard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(collected),
      })
      const data = await res.json()
      setAiResponse(data.text ?? data.error ?? 'Sorry, something went wrong. Please try again.')
    } catch {
      setAiResponse('Sorry, I could not connect to the AI. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 2000)
    }
  }

  function handleRestart() {
    setPhase('hero')
    setAnswers(null)
    setAiResponse('')
    setLoading(false)
    setKey((k) => k + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <Navbar />

      {phase === 'hero' ? (
        <WizardHero onStart={handleStart} />
      ) : (
        <div className="py-10">
          <WizardChat
            key={key}
            onComplete={handleComplete}
            aiResponse={aiResponse}
            loading={loading}
          />

          {answers && (
            <div ref={resultRef}>
              <WizardResults answers={answers} onRestart={handleRestart} />
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  )
}
