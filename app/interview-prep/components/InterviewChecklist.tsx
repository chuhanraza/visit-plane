'use client'
import { useState } from 'react'
import { CHECKLIST } from '../data'

interface Props { country?: string; visaType?: string }

export default function InterviewChecklist({ country, visaType }: Props) {
  const [checked, setChecked] = useState<boolean[]>(new Array(CHECKLIST.length).fill(false))
  const total   = CHECKLIST.length
  const done    = checked.filter(Boolean).length
  const allDone = done === total

  const toggle = (i: number) => setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n })

  return (
    <section className="bg-[#F8FAFC] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-3">📋 Pre-Interview</span>
          <h2 className="text-3xl font-extrabold text-[#0f0c29] mb-2">Don&apos;t Walk In Without These</h2>
          <p className="text-sm text-gray-500">
            Essential documents for{' '}
            <span className="font-semibold text-[#0f0c29]">
              {country && visaType ? `${country} ${visaType} visa` : 'your visa'} interview
            </span>
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/60 overflow-hidden">
          {/* Progress bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#0f0c29]">
              {allDone ? '🎉 You\'re ready!' : `${done} of ${total} documents checked`}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${allDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {Math.round((done / total) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out" style={{ width: `${(done / total) * 100}%` }} />
          </div>

          {/* Checklist items */}
          <ul className="divide-y divide-gray-50 px-2 py-2">
            {CHECKLIST.map((item, i) => (
              <li key={i}>
                <button onClick={() => toggle(i)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left hover:bg-gray-50 transition group ${checked[i] ? 'opacity-60' : ''}`}>
                  {/* Checkbox */}
                  <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${checked[i] ? 'border-teal-500 bg-teal-500' : 'border-gray-300 group-hover:border-teal-400'}`}>
                    {checked[i] && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm font-medium transition-all ${checked[i] ? 'line-through text-gray-400' : 'text-[#0f0c29]'}`}>{item}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Completion message */}
          {allDone && (
            <div className="mx-4 mb-4 rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-center">
              <p className="text-sm font-bold text-green-700">🎉 You&apos;re ready! Now practice your answers above.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
