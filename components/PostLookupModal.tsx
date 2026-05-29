'use client'

/**
 * PostLookupModal — Capture Point 1
 *
 * Slide-up card (bottom-right) shown 15 s after the user lands on a visa page.
 * Suppressed for 30 days after dismissal (localStorage) and once per session
 * (sessionStorage).  Mobile-friendly.
 */

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SUPPRESS_DAYS = 30
const SESSION_KEY   = 'vp_post_lookup_shown'

function suppressKey(passport: string, destination: string) {
  return `vp_dismiss_post_${passport.toLowerCase()}_${destination.toLowerCase()}`
}

function isSuppressed(passport: string, destination: string): boolean {
  try {
    const ts = localStorage.getItem(suppressKey(passport, destination))
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < SUPPRESS_DAYS * 864e5
  } catch { return false }
}

function markSuppressed(passport: string, destination: string) {
  try {
    localStorage.setItem(suppressKey(passport, destination), String(Date.now()))
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch { /* noop */ }
}

function shownThisSession(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}

interface Props {
  passport:    string
  destination: string
}

export default function PostLookupModal({ passport, destination }: Props) {
  const [visible, setVisible] = useState(false)
  const [email,   setEmail]   = useState('')
  const [consent, setConsent] = useState(true)
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (shownThisSession() || isSuppressed(passport, destination)) return
    const timer = setTimeout(() => {
      setVisible(true)
      // Mark session-seen immediately so fast navigation doesn't double-fire
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* noop */ }
    }, 15_000)
    return () => clearTimeout(timer)
  }, [passport, destination])

  const dismiss = () => {
    setVisible(false)
    markSuppressed(passport, destination)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !consent) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          passport,
          destination,
          captured_from: 'post_lookup',
          consent,
        }),
      })
      if (!res.ok) throw new Error('non-ok')
      setStatus('success')
      setTimeout(() => { setVisible(false); markSuppressed(passport, destination) }, 3_000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Get visa update notifications"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:bottom-6 sm:right-6"
        >
          {/* ── Close button ─────────────────────────────────────────────── */}
          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-base leading-none transition"
          >
            ×
          </button>

          {status === 'success' ? (
            /* ── Success state ──────────────────────────────────────────── */
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <span className="text-3xl">✅</span>
              <p className="text-sm font-bold text-gray-900">You&apos;re on the list!</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                We&apos;ll notify you if <span className="font-semibold">{destination}</span> visa
                rules change for <span className="font-semibold">{passport}</span> passport holders.
              </p>
            </div>
          ) : (
            /* ── Form state ─────────────────────────────────────────────── */
            <>
              <p className="pr-6 text-sm font-semibold text-gray-900 leading-snug">
                📬 Get notified if{' '}
                <span className="text-teal-600">{destination}</span> visa rules change for{' '}
                <span className="text-teal-600">{passport}</span> passport holders.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-400 focus:bg-white"
                />

                <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-teal-500"
                  />
                  I agree to receive email alerts about visa rule changes. Unsubscribe anytime.
                </label>

                <button
                  type="submit"
                  disabled={status === 'loading' || !consent}
                  className="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-60"
                >
                  {status === 'loading' ? 'Saving…' : 'Notify Me →'}
                </button>

                {status === 'error' && (
                  <p className="text-center text-xs text-rose-500">
                    Something went wrong — please try again.
                  </p>
                )}
              </form>

              <p className="mt-2 text-center text-[10px] text-gray-400">
                Free. One email if rules change. Unsubscribe anytime.
              </p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
