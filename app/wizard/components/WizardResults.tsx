'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { WizardAnswers } from './WizardStep'
import type { VisaData } from '@/lib/visa-engine'
import { shortName } from '@/lib/visa-engine'
import { ALL_COUNTRIES } from '@/components/CountrySelect'
import TravelReadinessGrid from '@/components/visa/TravelReadinessGrid'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'

interface Props {
  answers: WizardAnswers
  visaData: VisaData
  aiInsight: string
  aiLoading: boolean
  onRestart: () => void
}

function getFlag(country: string): string {
  const found = ALL_COUNTRIES.find(
    (c) => c.name === country || c.name.toLowerCase() === country.toLowerCase()
  )
  return found?.flag ?? '🌍'
}

function encodeState(answers: WizardAnswers): string {
  const state = {
    p: answers.passport,
    d: answers.destination,
    pu: answers.purpose,
    du: answers.duration,
    dt: answers.travelDate,
  }
  return btoa(encodeURIComponent(JSON.stringify(state)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') // base64url — path-safe
}

function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function addDays(isoDate: string, days: number): string {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  d.setDate(d.getDate() - days)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function WizardResults({ answers, visaData, aiInsight, aiLoading, onRestart }: Props) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const passportFlag = getFlag(answers.passport)
  const destFlag = getFlag(answers.destination)
  const passportShort = shortName(answers.passport)
  const destShort = shortName(answers.destination)

  const shareState = encodeState(answers)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/wizard/result/${shareState}`
    : `/wizard/result/${shareState}`

  const whatsappText = encodeURIComponent(
    `${passportFlag} ${passportShort} → ${destFlag} ${destShort} visa plan:\n${visaData.icon} ${visaData.visaLabel} · ${visaData.costUSD != null ? `$${visaData.costUSD} USD` : 'Free'} · ${answers.duration} days\n\nGenerated free at: ${shareUrl}`
  )

  const tweetText = encodeURIComponent(
    `${passportShort} → ${destShort}: ${visaData.icon} ${visaData.visaLabel} (${visaData.costUSD != null ? `$${visaData.costUSD}` : 'Free'}, ${answers.duration} days). Got my free visa plan from @visitplane:`
  )
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !consent) return
    setEmailStatus('loading')
    try {
      const res = await fetch('/api/wizard-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, answers, visaData, consent }),
      })
      if (res.ok) {
        setEmailStatus('sent')
      } else {
        setEmailStatus('error')
      }
    } catch {
      setEmailStatus('error')
    }
  }

  const passportSlug = encodeURIComponent(answers.passport)
  const destSlug = encodeURIComponent(answers.destination)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 mb-16">

      {/* ── YMYL honesty band — guidance not guarantee + official source ─────── */}
      <VisaDataDisclaimer
        destinationName={answers.destination}
        homeCountry={answers.passport}
        className="mb-5"
      />

      {/* ── Result card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Your Visa Plan</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{passportFlag}</span>
            <span className="text-lg font-bold text-white">{passportShort}</span>
            <span className="text-white/60">→</span>
            <span className="text-2xl">{destFlag}</span>
            <span className="text-lg font-bold text-white">{destShort}</span>
            <span className="text-white/60">·</span>
            <span className="text-sm text-white/80">{answers.purpose}</span>
            <span className="text-white/60">·</span>
            <span className="text-sm text-white/80">{answers.duration} days</span>
          </div>
        </div>

        {/* Visa type badge */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-bold ${visaData.badgeColor}`}>
            <span className="text-xl">{visaData.icon}</span>
            {visaData.visaLabel}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visaData.applyUrl && (
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-teal-500 font-bold mt-0.5">✓</span>
                <span>
                  Apply online at{' '}
                  <a href={visaData.applyUrl} target="_blank" rel="noopener noreferrer"
                    className="text-teal-600 underline underline-offset-2 hover:text-teal-700 font-medium break-all">
                    {new URL(visaData.applyUrl).hostname}
                  </a>
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-teal-500 font-bold mt-0.5">✓</span>
              <span>Processing: <strong>{visaData.processingDays}</strong></span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-teal-500 font-bold mt-0.5">✓</span>
              <span>
                Cost: <strong>{visaData.costUSD != null ? `$${visaData.costUSD} USD` : 'Free'}</strong>
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-teal-500 font-bold mt-0.5">✓</span>
              <span>Stay: <strong>Up to {visaData.maxStayDays} days</strong></span>
            </div>
          </div>

          {visaData.notes && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
              💡 {visaData.notes}
            </div>
          )}
        </div>

        {/* Action plan */}
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">📋 Your Action Plan</p>

          <ol className="space-y-4">
            {/* Step 1: Gather docs */}
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-teal-500 text-white text-xs font-bold">1</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Gather documents ({visaData.requiredDocs.length} required, {visaData.conditionalDocs.length} conditional)
                </p>
                <details className="mt-1.5 text-sm text-slate-500 group">
                  <summary className="cursor-pointer text-teal-600 font-medium hover:text-teal-700 list-none">
                    See full checklist →
                  </summary>
                  <div className="mt-2 space-y-1.5 text-slate-600">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Required</p>
                    {visaData.requiredDocs.map((doc, i) => (
                      <p key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-500 mt-0.5">✓</span>{doc}
                      </p>
                    ))}
                    {visaData.conditionalDocs.length > 0 && (
                      <>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mt-3">May be required</p>
                        {visaData.conditionalDocs.map((doc, i) => (
                          <p key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500 mt-0.5">◦</span>{doc}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                </details>
              </div>
            </li>

            {/* Step 2: Apply on time */}
            {visaData.visaType !== 'visa_free' && (
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-teal-500 text-white text-xs font-bold">2</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Apply {visaData.leadTimeDays > 0 ? `${visaData.leadTimeDays} days before` : 'before'} your travel date
                  </p>
                  {answers.travelDate && visaData.leadTimeDays > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Earliest: <span className="font-semibold text-slate-700">{addDays(answers.travelDate, visaData.leadTimeDays)}</span>
                      {' '}(latest safe date for your {formatDate(answers.travelDate)} trip)
                    </p>
                  )}
                </div>
              </li>
            )}

            {/* Step 3: Pay fee */}
            {visaData.costUSD != null && visaData.costUSD > 0 && (
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-teal-500 text-white text-xs font-bold">{visaData.visaType !== 'visa_free' ? 3 : 2}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Pay ${visaData.costUSD} USD fee
                    {visaData.visaType === 'visa_on_arrival' ? ' on arrival' : visaData.applyUrl ? ' online' : ''}
                  </p>
                </div>
              </li>
            )}

            {/* Step 4: Get visa */}
            {visaData.visaType === 'evisa' && (
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-teal-500 text-white text-xs font-bold">4</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Receive eVisa by email in {visaData.processingDays}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Print it or keep a digital copy on your phone</p>
                </div>
              </li>
            )}

            {visaData.visaType === 'visa_free' && (
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-bold">2</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Book flights & accommodation</p>
                  <p className="text-xs text-slate-500 mt-0.5">No visa required — just show up with a valid passport</p>
                </div>
              </li>
            )}
          </ol>
        </div>

        {/* CTA buttons */}
        <div className="px-6 py-5 space-y-2.5">
          <Link
            href={`/visa/${passportSlug}/${destSlug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            📋 View Full Visa Details →
          </Link>

          {/* Email capture */}
          {!emailOpen && emailStatus !== 'sent' && (
            <button
              onClick={() => setEmailOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition"
            >
              📧 Email This Plan to Myself
            </button>
          )}

          {emailOpen && emailStatus !== 'sent' && (
            <form onSubmit={handleEmailSubmit} className="rounded-xl border border-teal-200 bg-teal-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-teal-800">Send this plan to your inbox</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600">
                  I agree to receive this plan and occasional visa alerts from VisitPlane. Unsubscribe anytime.
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!email || !consent || emailStatus === 'loading'}
                  className="flex-1 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-50 transition"
                >
                  {emailStatus === 'loading' ? 'Sending…' : 'Send Plan →'}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
              {emailStatus === 'error' && (
                <p className="text-xs text-rose-600">Failed to send — please try again.</p>
              )}
            </form>
          )}

          {emailStatus === 'sent' && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              ✓ Plan sent to your inbox!
            </div>
          )}

          {/* Share row */}
          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1ebe5b] transition"
            >
              <span>💬</span> WhatsApp
            </a>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              <span>𝕏</span> Post
            </a>
            <button
              onClick={handleCopyLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-teal-400 hover:bg-teal-50 transition"
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          </div>

          <button
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition py-1"
          >
            🔄 Start over
          </button>
        </div>
      </div>

      {/* ── AI insight section (Phase 5) ──────────────────────────────────────── */}
      {(aiLoading || aiInsight) && (
        <div className="mt-4 rounded-2xl border border-violet-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <p className="text-sm font-bold text-violet-700">AI Personalized Insight</p>
              <span className="text-xs bg-violet-100 text-violet-500 rounded-full px-2 py-0.5 font-medium">Powered by Gemini</span>
            </div>
          </div>
          <div className="px-6 py-4">
            {aiLoading && !aiInsight ? (
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <div className="h-4 w-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin flex-shrink-0" />
                Generating personalized tips…
              </div>
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{aiInsight}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Travel Readiness (affiliate) ──────────────────────────────────────── */}
      <div className="mt-4">
        <TravelReadinessGrid
          passportName={answers.passport}
          destinationName={answers.destination}
          destinationFlag={destFlag}
        />
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
        Visa requirements change frequently. Always verify with the official embassy or consulate before applying.{' '}
        <Link href={`/visa/${passportSlug}/${destSlug}`} className="underline hover:text-slate-600">
          View official sources →
        </Link>
      </p>
    </div>
  )
}
