'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import {
  CATEGORY_META,
  type InterviewQuestion,
  type QuestionCategory,
} from '@/lib/data/interview-questions'

interface Props {
  countryName: string
  countryFlag: string
  countrySlug: string
  visaCode: string
  visaLabel: string
  questions: InterviewQuestion[]
}

interface Feedback {
  score: number
  category_scores: Record<string, number>
  strengths: string[]
  improvements: string[]
  rewrite_suggestion: string
}

const PROGRESS_KEY = 'visitplane_interview_progress'

type AnswerState = { text: string; loading: boolean; error: string; feedback: Feedback | null }

export default function PrepModeClient({
  countryName, countryFlag, countrySlug, visaCode, visaLabel, questions,
}: Props) {
  const pairKey = `${countrySlug}-${visaCode.toLowerCase()}`

  const [activeCat, setActiveCat] = useState<'all' | QuestionCategory>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})

  // ── Load progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        const pair = data?.country_visa_pairs?.[pairKey]
        if (pair) {
          setReviewed(pair.questions_reviewed ?? [])
          setSaved(pair.questions_saved ?? [])
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persist(nextReviewed: string[], nextSaved: string[]) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      const data = raw ? JSON.parse(raw) : { country_visa_pairs: {} }
      if (!data.country_visa_pairs) data.country_visa_pairs = {}
      data.country_visa_pairs[pairKey] = {
        ...(data.country_visa_pairs[pairKey] ?? {}),
        questions_reviewed: nextReviewed,
        questions_saved: nextSaved,
        last_activity: new Date().toISOString(),
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
    } catch { /* ignore */ }
  }

  function toggleReviewed(id: string) {
    setReviewed((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      persist(next, saved)
      return next
    })
  }
  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      persist(reviewed, next)
      return next
    })
  }

  // ── Category tabs ──────────────────────────────────────────────────────────
  const categoriesPresent = useMemo(() => {
    const set = new Set<QuestionCategory>()
    questions.forEach((q) => set.add(q.category))
    return Array.from(set)
  }, [questions])

  const visible = activeCat === 'all' ? questions : questions.filter((q) => q.category === activeCat)

  // ── AI feedback ────────────────────────────────────────────────────────────
  function setAns(id: string, patch: Partial<AnswerState>) {
    setAnswers((prev) => {
      const base: AnswerState = prev[id] ?? { text: '', loading: false, error: '', feedback: null }
      return { ...prev, [id]: { ...base, ...patch } }
    })
  }

  async function getFeedback(q: InterviewQuestion) {
    const cur = answers[q.id]
    const text = (cur?.text ?? '').trim()
    if (!text) { setAns(q.id, { error: 'Please type an answer first.' }); return }
    setAns(q.id, { loading: true, error: '', feedback: null })
    try {
      const res = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question_id: q.id, user_answer: text }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setAns(q.id, { loading: false, error: data.error ?? 'Something went wrong.' })
        return
      }
      setAns(q.id, { loading: false, feedback: data.feedback })
    } catch {
      setAns(q.id, { loading: false, error: 'Network error. Please try again.' })
    }
  }

  const reviewedCount = reviewed.length

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29]">
      <ToolBreadcrumb toolName={`${countryName} ${visaLabel}`} toolEmoji="🎤" />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Top bar */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-[#0f0c29]">
                {countryFlag} {countryName} {visaLabel} Interview Prep
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {questions.length} real questions · strong vs weak answers · AI feedback
              </p>
            </div>
            <Link href="/interview-prep" className="shrink-0 text-xs font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-700">
              Change
            </Link>
          </div>
          {questions.length > 0 && (
            <p className="mt-3 text-xs font-medium text-slate-500">
              Practice progress: {reviewedCount} / {questions.length} reviewed
            </p>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-3xl">🛠️</p>
            <p className="mt-3 font-semibold text-slate-800">We&apos;re still building the question bank for this route.</p>
            <p className="mt-1 text-sm text-slate-500">In the meantime, browse a route we&apos;ve completed.</p>
            <Link href="/interview-prep/us/b1b2" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white">
              Try US B1/B2 →
            </Link>
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              <CatTab label={`All (${questions.length})`} active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
              {categoriesPresent.map((cat) => {
                const n = questions.filter((q) => q.category === cat).length
                return (
                  <CatTab
                    key={cat}
                    label={`${CATEGORY_META[cat].icon} ${CATEGORY_META[cat].label} (${n})`}
                    active={activeCat === cat}
                    onClick={() => setActiveCat(cat)}
                  />
                )
              })}
            </div>

            {/* Question cards */}
            <div className="space-y-3">
              {visible.map((q) => {
                const isOpen = openId === q.id
                const a = answers[q.id]
                const isReviewed = reviewed.includes(q.id)
                const isSaved = saved.includes(q.id)
                return (
                  <div key={q.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : q.id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span className="flex items-center gap-2 text-base font-bold text-[#0f0c29]">
                        {isReviewed && <span className="text-emerald-500">✓</span>}
                        &ldquo;{q.question}&rdquo;
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {CATEGORY_META[q.category].label}
                        </span>
                        <span className={`text-teal-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="space-y-3 border-t border-slate-100 px-5 py-4 text-sm">
                        <p className="text-slate-600"><span className="font-semibold text-slate-800">💡 Why officers ask: </span>{q.why_asked}</p>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="font-semibold text-emerald-700">✓ Strong answer</p>
                          <p className="mt-1 text-slate-700">{q.strong_answer_pattern}</p>
                        </div>
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                          <p className="font-semibold text-rose-700">✗ Weak answer</p>
                          <p className="mt-1 text-slate-700">{q.weak_answer_pattern}</p>
                        </div>
                        <p className="text-slate-600"><span className="font-semibold text-slate-800">🎯 Pro tip: </span>{q.pro_tip}</p>
                        <div className="flex flex-wrap gap-2">
                          {q.keywords_to_use.map((k) => (
                            <span key={k} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">🟢 {k}</span>
                          ))}
                          {q.keywords_to_avoid.map((k) => (
                            <span key={k} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 border border-rose-200">🔴 {k}</span>
                          ))}
                        </div>

                        {/* Try answering */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="mb-2 text-sm font-semibold text-slate-800">📝 Try answering — get AI feedback</p>
                          <textarea
                            value={a?.text ?? ''}
                            onChange={(e) => setAns(q.id, { text: e.target.value })}
                            placeholder="Type your answer as you'd say it to the officer…"
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => getFeedback(q)}
                              disabled={a?.loading}
                              className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                              {a?.loading ? 'Scoring…' : 'Get AI Feedback →'}
                            </button>
                            {a?.error && <span className="text-xs text-rose-600">{a.error}</span>}
                          </div>

                          {a?.feedback && (
                            <div className="mt-3 rounded-lg border border-violet-200 bg-white p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-extrabold text-violet-700">{a.feedback.score}/10</span>
                                <span className="text-xs font-medium text-violet-500">AI score</span>
                              </div>
                              {a.feedback.strengths?.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-bold text-emerald-700">💪 Strengths</p>
                                  <ul className="mt-1 space-y-0.5">
                                    {a.feedback.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600">• {s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {a.feedback.improvements?.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-bold text-amber-700">🎯 Improve</p>
                                  <ul className="mt-1 space-y-0.5">
                                    {a.feedback.improvements.map((s, i) => <li key={i} className="text-xs text-slate-600">• {s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {a.feedback.rewrite_suggestion && (
                                <div className="mt-2 rounded-md bg-slate-50 p-2">
                                  <p className="text-xs font-bold text-slate-700">✍️ Suggested rewrite</p>
                                  <p className="mt-1 text-xs italic text-slate-600">{a.feedback.rewrite_suggestion}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {q.source_url && (
                          <a href={q.source_url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-teal-600 underline underline-offset-2">
                            📖 Source →
                          </a>
                        )}

                        <div className="flex items-center gap-4 pt-1">
                          <button type="button" onClick={() => toggleReviewed(q.id)} className={`text-xs font-semibold ${isReviewed ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            {isReviewed ? '✓ Reviewed' : 'Mark as reviewed'}
                          </button>
                          <button type="button" onClick={() => toggleSaved(q.id)} className={`text-xs font-semibold ${isSaved ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            {isSaved ? '⭐ Saved' : '☆ Save for later'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function CatTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition',
        active ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
