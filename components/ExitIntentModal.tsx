'use client'

/**
 * ExitIntentModal — Capture Point 3
 *
 * Desktop-only (≥ 768 px).  Fires once when the cursor exits through the top
 * of the viewport (tab-close gesture).  Suppressed for the rest of the session
 * (sessionStorage) and for 30 days after dismissal (localStorage).
 */

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const SUPPRESS_DAYS = 30
const LS_KEY        = 'vp_exit_dismiss_ts'
const SS_KEY        = 'vp_exit_shown'

function isSuppressed(): boolean {
  try {
    const ts = localStorage.getItem(LS_KEY)
    if (!ts) return false
    return Date.now() - parseInt(ts, 10) < SUPPRESS_DAYS * 864e5
  } catch { return false }
}

function markSuppressed() {
  try {
    localStorage.setItem(LS_KEY, String(Date.now()))
    sessionStorage.setItem(SS_KEY, '1')
  } catch { /* noop */ }
}

function shownThisSession(): boolean {
  try { return sessionStorage.getItem(SS_KEY) === '1' } catch { return false }
}

export default function ExitIntentModal() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [email,   setEmail]   = useState('')
  const [consent, setConsent] = useState(false)
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const firedRef = useRef(false)

  useEffect(() => {
    // Homepage only — never on visa pages or other routes
    if (pathname !== '/') return
    // Desktop-only: skip on narrow viewports
    if (typeof window === 'undefined' || window.innerWidth < 768) return

    const onMouseOut = (e: MouseEvent) => {
      // Only fire when cursor leaves through the top edge
      if (e.clientY > 5)      return
      if (firedRef.current)   return
      if (shownThisSession() || isSuppressed()) return

      firedRef.current = true
      try { sessionStorage.setItem(SS_KEY, '1') } catch { /* noop */ }
      setVisible(true)
    }

    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  }, [])

  const dismiss = () => {
    setVisible(false)
    markSuppressed()
  }

  // Close on Escape
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

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
          captured_from: 'exit_intent',
          consent,
        }),
      })
      if (!res.ok) throw new Error('non-ok')
      setStatus('success')
      setTimeout(() => { setVisible(false); markSuppressed() }, 3_500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Modal ────────────────────────────────────────────────────── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Get free visa guide"
            initial={{ opacity: 0, scale: 0.94, y: -24 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{   opacity: 0, scale: 0.94, y: -24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-xl leading-none transition"
            >
              ×
            </button>

            {status === 'success' ? (
              /* ── Success ───────────────────────────────────────────────── */
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="text-4xl">📬</span>
                <p className="text-lg font-bold text-gray-900">Check your email ✉️</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We sent a confirmation link. Click it and your guide will be on its way!
                </p>
              </div>
            ) : (
              /* ── Form ──────────────────────────────────────────────────── */
              <>
                <div className="text-center">
                  <span className="text-4xl">✈️</span>
                  <h2 className="mt-3 text-xl font-extrabold text-gray-900">
                    Wait — going somewhere?
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">Get our free guide:</p>
                  <p className="mt-1 text-base font-bold text-teal-600">
                    &ldquo;7 Visa Mistakes That Cost Travelers Their Trip&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Delivered instantly to your inbox.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-400 focus:bg-white"
                  />

                  <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-500">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-teal-500"
                    />
                    I agree to receive the guide and occasional travel updates. Unsubscribe anytime.
                  </label>

                  <button
                    type="submit"
                    disabled={status === 'loading' || !consent}
                    className="w-full rounded-xl bg-teal-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-60"
                  >
                    {status === 'loading' ? 'Sending…' : 'Send Me The Guide →'}
                  </button>

                  {status === 'error' && (
                    <p className="text-center text-xs text-rose-500">
                      Something went wrong — please try again.
                    </p>
                  )}
                </form>

                <p className="mt-4 text-center text-[10px] text-gray-400">
                  No spam. We hate it too. Unsubscribe any time.
                </p>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
