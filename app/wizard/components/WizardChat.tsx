'use client'

import { useState, useEffect, useRef } from 'react'
import CountrySelect from '@/components/CountrySelect'

interface Message { role: 'ai' | 'user'; text: string }
export interface WizardAnswers {
  passport: string
  destination: string
  purpose: string
  duration: string
  travelDate: string
}

interface Props {
  onComplete: (answers: WizardAnswers) => void
  aiResponse: string
  loading: boolean
}

const QUESTIONS = [
  { text: "👋 Hi! I'm your VisitPlane AI visa assistant.\nWhere is your passport from?" },
  { text: 'Great! 🌍 Where would you like to travel?' },
  {
    text: 'What is the purpose of your visit?\nChoose one:',
    options: ['✈️ Tourism/Holiday', '💼 Business', '🎓 Study', '💪 Work/Employment'],
  },
  {
    text: 'How long do you plan to stay?',
    options: ['📅 Less than 2 weeks', '📅 2-4 weeks', '📅 1-3 months', '📅 More than 3 months'],
  },
  {
    text: 'When are you planning to travel?',
    options: ['⚡ Within 2 weeks (urgent!)', '📅 1-3 months from now', '📅 3-6 months from now', '🗓️ More than 6 months'],
  },
]

const FIELD_KEYS: (keyof WizardAnswers)[] = ['passport', 'destination', 'purpose', 'duration', 'travelDate']

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm">🤖</div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-teal-500 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-white/80 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function AIBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm">🤖</div>
      <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-teal-500 px-4 py-3 text-sm text-white whitespace-pre-wrap shadow-sm">
        {text}
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-slate-800 px-4 py-3 text-sm text-white shadow-sm">
        {text}
      </div>
    </div>
  )
}

export default function WizardChat({ onComplete, aiResponse, loading }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({})
  const [inputVal, setInputVal] = useState('')
  const [aiShown, setAiShown] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, loading])

  // Show first question on mount
  useEffect(() => {
    showAIMessage(QUESTIONS[0].text, () => setStep(1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show AI response when it arrives
  useEffect(() => {
    if (aiResponse && !aiShown) {
      setAiShown(true)
      showAIMessage(aiResponse)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiResponse])

  function showAIMessage(text: string, callback?: () => void) {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: 'ai', text }])
      callback?.()
    }, 1400)
  }

  function handleAnswer(answer: string) {
    const field = FIELD_KEYS[step - 1]
    const newAnswers = { ...answers, [field]: answer } as WizardAnswers
    setAnswers(newAnswers)
    setMessages((prev) => [...prev, { role: 'user', text: answer }])
    setInputVal('')

    if (step < 5) {
      showAIMessage(QUESTIONS[step].text, () => setStep((s) => s + 1))
    } else {
      // All 5 answered
      setStep(6)
      onComplete(newAnswers)
    }
  }

  const currentQ = step >= 1 && step <= 5 ? QUESTIONS[step - 1] : null
  const isCountryStep = step === 1 || step === 2

  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🤖</div>
          <div>
            <p className="text-sm font-semibold text-white">VisitPlane AI Visa Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-xs text-white/80">Online · Powered by Claude AI</span>
            </div>
          </div>
          {step > 0 && step <= 5 && (
            <div className="ml-auto text-xs text-white/70 font-medium">
              Step {step}/5
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex flex-col px-4 py-5 min-h-[340px] max-h-[480px] overflow-y-auto">
          {messages.map((msg, i) =>
            msg.role === 'ai'
              ? <AIBubble key={i} text={msg.text} />
              : <UserBubble key={i} text={msg.text} />
          )}
          {isTyping && <TypingIndicator />}
          {loading && !aiResponse && (
            <div className="flex flex-col items-start gap-1 mb-4">
              <TypingIndicator />
              <p className="ml-10 text-xs text-slate-400 animate-pulse">Generating your personalized visa guide…</p>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        {step >= 1 && step <= 5 && !isTyping && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
            {isCountryStep ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <CountrySelect
                    value={inputVal}
                    onChange={(val) => setInputVal(val)}
                    placeholder={step === 1 ? 'Search your passport country…' : 'Search destination country…'}
                    variant="light"
                  />
                </div>
                <button
                  onClick={() => inputVal && handleAnswer(inputVal)}
                  disabled={!inputVal}
                  className="shrink-0 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-40 transition"
                >
                  Next →
                </button>
              </div>
            ) : currentQ?.options ? (
              <div className="grid grid-cols-2 gap-2">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
