'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import { buildMockSet, type InterviewQuestion } from '@/lib/data/interview-questions'

interface Props {
  countryName: string
  countryFlag: string
  countryIso: string
  countrySlug: string
  visaCode: string
  visaLabel: string
}

type Mode = 'text' | 'voice' | 'both'
type Phase = 'setup' | 'interview' | 'results'

interface AnswerResult {
  question: string
  answer: string
  score: number
  category_scores: Record<string, number>
  strengths: string[]
  improvements: string[]
}

const MOCK_SIZE = 7

function speechSupported() {
  if (typeof window === 'undefined') return false
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
}

export default function MockClient({
  countryName, countryFlag, countryIso, countrySlug, visaCode, visaLabel,
}: Props) {
  const prepUrl = `/interview-prep/${countrySlug}/${visaCode.toLowerCase()}`

  const [phase, setPhase] = useState<Phase>('setup')
  const [mode, setMode] = useState<Mode>('text')
  const [ttsOn, setTtsOn] = useState(false)
  const [timerOn, setTimerOn] = useState(true)

  const [mockSet, setMockSet] = useState<InterviewQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [scoring, setScoring] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<AnswerResult[]>([])
  const [lastFeedback, setLastFeedback] = useState<AnswerResult | null>(null)

  const [listening, setListening] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const recognitionRef = useRef<any>(null)

  const voiceAvailable = typeof window !== 'undefined' && speechSupported()

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'interview' || !timerOn) return
    setSeconds(0)
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase, idx, timerOn])

  // ── Officer voice (TTS) ──────────────────────────────────────────────────
  function speak(text: string) {
    if (!ttsOn || typeof window === 'undefined' || !window.speechSynthesis) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      window.speechSynthesis.speak(u)
    } catch { /* ignore */ }
  }

  // ── Start ────────────────────────────────────────────────────────────────
  function startMock() {
    const set = buildMockSet(countryIso, visaCode, MOCK_SIZE)
    if (set.length === 0) return
    setMockSet(set)
    setIdx(0)
    setAnswer('')
    setResults([])
    setLastFeedback(null)
    setError('')
    setPhase('interview')
    setTimeout(() => speak(set[0].question), 400)
  }

  // ── Voice input ──────────────────────────────────────────────────────────
  function toggleListening() {
    if (!voiceAvailable) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = false
    rec.onresult = (e: any) => {
      let chunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        chunk += e.results[i][0].transcript
      }
      setAnswer((prev) => (prev ? prev + ' ' : '') + chunk.trim())
    }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    try { rec.start(); setListening(true) } catch { setListening(false) }
  }

  // ── Submit one answer ────────────────────────────────────────────────────
  async function submitAnswer() {
    const q = mockSet[idx]
    const text = answer.trim()
    if (!text) { setError('Please answer before continuing (or use Skip).'); return }
    recognitionRef.current?.stop?.()
    setListening(false)
    setScoring(true)
    setError('')
    try {
      const res = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question_id: q.id, user_answer: text }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Scoring failed. Try again.')
        setScoring(false)
        return
      }
      const r: AnswerResult = {
        question: q.question,
        answer: text,
        score: data.feedback.score,
        category_scores: data.feedback.category_scores ?? {},
        strengths: data.feedback.strengths ?? [],
        improvements: data.feedback.improvements ?? [],
      }
      setResults((prev) => [...prev, r])
      setLastFeedback(r)
      setScoring(false)
    } catch {
      setError('Network error. Try again.')
      setScoring(false)
    }
  }

  function nextQuestion() {
    setLastFeedback(null)
    setAnswer('')
    if (idx + 1 >= mockSet.length) {
      setPhase('results')
      try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const ni = idx + 1
      setIdx(ni)
      setTimeout(() => speak(mockSet[ni].question), 300)
    }
  }

  function retake() {
    setPhase('setup')
    setResults([])
    setLastFeedback(null)
    setAnswer('')
    setIdx(0)
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  // ════════════════════════════ SETUP ════════════════════════════
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
        <ToolBreadcrumb toolName={`${countryName} Mock Interview`} toolEmoji="🎤" />
        <div className="mx-auto max-w-xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold">🎤 Mock Interview</h1>
            <p className="mt-1 text-sm text-slate-500">
              {countryFlag} {countryName} {visaLabel} · ~{MOCK_SIZE} questions · about 5 minutes. We&apos;ll
              simulate a real visa officer.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Answer mode</p>
                <div className="flex flex-wrap gap-2">
                  {(['text', 'voice', 'both'] as Mode[]).map((m) => {
                    const disabled = m !== 'text' && !voiceAvailable
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={disabled}
                        onClick={() => setMode(m)}
                        className={[
                          'rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition',
                          mode === m ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600',
                          disabled ? 'opacity-40 cursor-not-allowed' : '',
                        ].join(' ')}
                      >
                        {m === 'text' ? '⌨️ Text' : m === 'voice' ? '🎤 Voice' : '🎙️ Both'}
                      </button>
                    )
                  })}
                </div>
                {!voiceAvailable && (
                  <p className="mt-1.5 text-xs text-slate-400">Voice isn&apos;t supported in this browser — text mode works everywhere.</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={ttsOn} onChange={(e) => setTtsOn(e.target.checked)} disabled={typeof window !== 'undefined' && !window.speechSynthesis} className="h-4 w-4 rounded border-slate-300 text-teal-500" />
                🔊 Read questions aloud (officer voice)
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-500" />
                ⏱️ Show timer (real interviews are timed)
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                💡 Speak as you would to a real officer: brief, specific, honest. Your answers are scored
                in-browser and never stored.
              </div>
            </div>

            <button
              type="button"
              onClick={startMock}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/30"
            >
              Start Mock Interview →
            </button>
            <Link href={prepUrl} className="mt-3 block text-center text-xs font-semibold text-slate-400 hover:text-slate-600">
              ← Back to study mode
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════ INTERVIEW ════════════════════════════
  if (phase === 'interview') {
    const q = mockSet[idx]
    const progress = ((idx + (lastFeedback ? 1 : 0)) / mockSet.length) * 100
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
        <ToolBreadcrumb toolName={`${countryName} Mock Interview`} toolEmoji="🎤" />
        <div className="mx-auto max-w-xl px-4 py-8">
          {/* Progress + timer */}
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Question {idx + 1} of {mockSet.length}</span>
            {timerOn && <span>⏱️ {mmss}</span>}
          </div>
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{countryFlag} Officer asks</p>
            <p className="mt-2 text-lg font-bold text-[#0f0c29]">&ldquo;{q.question}&rdquo;</p>

            {!lastFeedback ? (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer…"
                  rows={4}
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {mode !== 'text' && voiceAvailable && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={[
                        'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                        listening ? 'bg-rose-500 text-white animate-pulse' : 'border border-slate-200 bg-white text-slate-700',
                      ].join(' ')}
                    >
                      {listening ? '⏹ Stop' : '🎤 Speak'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={scoring}
                    className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {scoring ? 'Scoring…' : 'Submit answer →'}
                  </button>
                  <span className="text-xs text-slate-400">Most officers expect 15–30 second answers</span>
                </div>
                {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-violet-700">{lastFeedback.score}/10</span>
                  <span className="text-xs font-medium text-violet-500">this answer</span>
                </div>
                {lastFeedback.strengths.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {lastFeedback.strengths.slice(0, 3).map((s, i) => <li key={i} className="text-xs text-emerald-700">✓ {s}</li>)}
                  </ul>
                )}
                {lastFeedback.improvements.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {lastFeedback.improvements.slice(0, 2).map((s, i) => <li key={i} className="text-xs text-amber-700">⚠ {s}</li>)}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white"
                >
                  {idx + 1 >= mockSet.length ? 'See my results →' : 'Next question →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════ RESULTS ════════════════════════════
  const overall = results.length
    ? Math.round((results.reduce((a, r) => a + r.score, 0) / results.length) * 10)
    : 0
  const verdict = overall >= 80 ? 'Strong — you’re well prepared' : overall >= 60 ? 'Solid — a little polish needed' : 'Keep practicing — focus on the gaps below'

  // Aggregate category scores
  const catAgg: Record<string, { sum: number; n: number }> = {}
  results.forEach((r) => {
    Object.entries(r.category_scores).forEach(([k, v]) => {
      if (typeof v !== 'number') return
      catAgg[k] = catAgg[k] ?? { sum: 0, n: 0 }
      catAgg[k].sum += v
      catAgg[k].n += 1
    })
  })
  const topStrengths = Array.from(new Set(results.flatMap((r) => r.strengths))).slice(0, 4)
  const topImprovements = Array.from(new Set(results.flatMap((r) => r.improvements))).slice(0, 4)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${prepUrl}` : prepUrl
  const shareText = `I scored ${overall}/100 on my ${countryName} ${visaLabel} mock visa interview at VisitPlane 🎤`

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
      <ToolBreadcrumb toolName={`${countryName} Mock Interview`} toolEmoji="🎤" />
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Interview Readiness Score</p>
          <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
            <span className="text-3xl font-extrabold">{overall}<span className="text-base">/100</span></span>
          </div>
          <p className="mt-3 font-bold text-[#0f0c29]">{verdict}</p>
        </div>

        {Object.keys(catAgg).length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold">Breakdown</p>
            <div className="space-y-2">
              {Object.entries(catAgg).map(([k, v]) => {
                const val = Math.round((v.sum / v.n) * 10) / 10
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs capitalize text-slate-500">{k.replace(/_/g, ' ')}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${val * 10}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-600">{val}/10</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {topStrengths.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">💪 What you did well</p>
            <ul className="mt-2 space-y-1">{topStrengths.map((s, i) => <li key={i} className="text-sm text-slate-700">• {s}</li>)}</ul>
          </div>
        )}
        {topImprovements.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-700">🎯 Improve before your real interview</p>
            <ul className="mt-2 space-y-1">{topImprovements.map((s, i) => <li key={i} className="text-sm text-slate-700">• {s}</li>)}</ul>
          </div>
        )}

        {/* Share */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold">📲 Share your score</p>
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white">💬 WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">𝕏 Post</a>
            <button type="button" onClick={() => navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">🔗 Copy</button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={retake} className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white">🔄 Retake mock interview</button>
          <Link href={prepUrl} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700">📚 Back to study mode</Link>
        </div>
      </div>
    </div>
  )
}
