'use client'

import { useId, useState } from 'react'

type Variant = 'strip' | 'inline'

interface LeadMagnet {
  /** Public path to the downloadable file, e.g. /lead-magnets/checklist.pdf */
  url: string
  /** Short identifier stored in Supabase `lead_magnet` for tracking. */
  id: string
  /** Button label shown after a successful capture. */
  downloadLabel?: string
}

interface BlogEmailCaptureProps {
  /** Where the capture is rendered — stored in Supabase `captured_from`. */
  capturedFrom: string
  /** Visual style: full-width strip (index) or compact inline card (mid-article). */
  variant?: Variant
  /** Optional route context passed through to the subscriber record. */
  passport?: string
  destination?: string
  /** Headline + supporting copy overrides. */
  title?: string
  subtitle?: string
  /**
   * When provided, the component becomes a lead-magnet capture: it offers a
   * downloadable resource and reveals the download link on successful submit.
   */
  leadMagnet?: LeadMagnet
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Reusable blog newsletter capture, wired to the existing /api/subscribe
 * backend (double opt-in via Resend + Supabase). Used on the blog index
 * (variant="strip") and mid-article (variant="inline").
 */
export default function BlogEmailCapture({
  capturedFrom,
  variant = 'strip',
  passport,
  destination,
  title,
  subtitle,
  leadMagnet,
}: BlogEmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const consentId = useId()

  const isLeadMagnet = !!leadMagnet

  const heading =
    title ??
    (isLeadMagnet
      ? 'Get the free Ultimate Visa Application Checklist'
      : variant === 'inline'
        ? 'Found this helpful?'
        : 'Get visa updates straight to your inbox')
  const sub =
    subtitle ??
    (isLeadMagnet
      ? 'A free 4-page PDF: every document you need, a week-by-week timeline, and the 10 mistakes that get visas refused. Enter your email and download it instantly.'
      : variant === 'inline'
        ? 'Get our weekly visa newsletter — one email, real updates, zero spam.'
        : 'One email per week. Real visa rule changes, travel tips, and destination guides.')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }
    if (!consent) {
      setStatus('error')
      setMessage('Please tick the box to confirm you’d like to subscribe.')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          captured_from: capturedFrom,
          consent,
          ...(passport ? { passport } : {}),
          ...(destination ? { destination } : {}),
          ...(leadMagnet ? { lead_magnet: leadMagnet.id } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Something went wrong.')
      }
      setStatus('success')
      setMessage(
        isLeadMagnet
          ? 'Your checklist is ready below. We’ve also emailed you a confirmation link to get future visa updates.'
          : 'Almost there — check your inbox to confirm your subscription.',
      )
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const isStrip = variant === 'strip'

  return (
    <section
      className={
        isStrip
          ? 'overflow-hidden rounded-3xl px-6 py-10 text-center text-white shadow-xl sm:px-10'
          : 'overflow-hidden rounded-2xl border border-[#10B981]/25 bg-[#F0FDF9] px-6 py-7'
      }
      style={
        isStrip
          ? { background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #0d9488 100%)' }
          : undefined
      }
      aria-labelledby={`${consentId}-heading`}
    >
      <div className={isStrip ? 'mx-auto max-w-xl' : ''}>
        <p className={isStrip ? 'text-3xl' : 'text-2xl'}>📬</p>
        <h2
          id={`${consentId}-heading`}
          className={
            isStrip
              ? 'mt-3 text-2xl font-bold tracking-tight sm:text-3xl'
              : 'mt-2 text-lg font-bold text-[#0f1419]'
          }
        >
          {heading}
        </h2>
        <p
          className={
            isStrip
              ? 'mt-3 text-sm leading-relaxed text-white/75'
              : 'mt-1.5 text-sm leading-relaxed text-gray-600'
          }
        >
          {sub}
        </p>

        {status === 'success' ? (
          <div className="mt-6">
            <p
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                isStrip ? 'bg-white/15 text-white' : 'bg-white text-[#059669] ring-1 ring-[#10B981]/30'
              }`}
              role="status"
            >
              ✅ {message}
            </p>
            {isLeadMagnet && (
              <a
                href={leadMagnet!.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-sm transition hover:scale-[1.02] ${
                  isStrip ? 'bg-white text-[#0d9488]' : 'bg-[#10B981] text-white hover:bg-[#059669]'
                }`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {leadMagnet!.downloadLabel ?? 'Download the checklist (PDF)'}
              </a>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3"
            noValidate
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                aria-label="Email address"
                className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none transition ${
                  isStrip
                    ? 'bg-white/95 text-[#0f1419] placeholder-gray-400 focus:ring-2 focus:ring-white/60'
                    : 'border border-gray-200 bg-white text-[#0f1419] placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`rounded-xl px-6 py-3 text-sm font-bold shadow-sm transition disabled:opacity-60 ${
                  isStrip
                    ? 'bg-white text-[#0d9488] hover:scale-[1.03]'
                    : 'bg-[#10B981] text-white hover:bg-[#059669]'
                }`}
              >
                {status === 'loading'
                  ? (isLeadMagnet ? 'Sending…' : 'Subscribing…')
                  : (isLeadMagnet ? 'Get the checklist' : 'Subscribe')}
              </button>
            </div>

            <label
              htmlFor={consentId}
              className={`flex items-start gap-2 text-left text-xs leading-relaxed ${
                isStrip ? 'text-white/70' : 'text-gray-500'
              }`}
            >
              <input
                id={consentId}
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-[#10B981]"
              />
              <span>
                {isLeadMagnet
                  ? 'Email me the checklist plus occasional VisitPlane visa updates. No spam — unsubscribe anytime.'
                  : 'Yes, email me VisitPlane visa updates. No spam — unsubscribe anytime.'}
              </span>
            </label>

            {status === 'error' && (
              <p
                className={`text-xs font-medium ${isStrip ? 'text-amber-200' : 'text-red-600'}`}
                role="alert"
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
