'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import VisaDataDisclaimer from '@/components/VisaDataDisclaimer'
import PassportDropdown from '@/components/home/PassportDropdown'
import VisaFreeMarquee, { VisaFreeCard } from '@/components/VisaFreeMarquee'
import { useUserCountry } from '@/hooks/useUserCountry'
import type { ReliableDestination, ReliableVisaFreeResponse } from '@/app/api/visa-free-reliable/route'

type Status = 'detecting' | 'loading' | 'ready' | 'empty' | 'error'
type Meta = Pick<ReliableVisaFreeResponse, 'source' | 'verified' | 'total'>

// ─────────────────────────────────────────────────────────────────────────────
// Homepage "No Visa Required" section.
//
// PART 1 — defaults the passport from IP geo (useUserCountry: 2s timeout →
//          last-used localStorage → neutral default) and offers a manual,
//          searchable passport switcher that persists the choice.
// PART 2 — fetches an ACCURACY-GUARDED list (/api/visa-free-reliable): only
//          destinations whose stored data is single-row, clearly visa-free /
//          free-VoA, and cost-consistent are shown. Wrong/duplicate/ambiguous
//          routes (e.g. China for a Pakistani passport) are excluded, never
//          shown. Honest "guide — reconfirm at the official source" framing
//          replaces the old "Verified" authority line.
// PART 3 — presents the reliable list in the auto/manual cinematic carousel.
// ─────────────────────────────────────────────────────────────────────────────
export default function VisaFreeSection() {
  const { countryName, loading: geoLoading } = useUserCountry()
  const [passport, setPassport] = useState('')
  const [applied, setApplied] = useState(false)
  const [dests, setDests] = useState<ReliableDestination[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [status, setStatus] = useState<Status>('detecting')

  // Default the passport from IP geo once the hook resolves (it never sticks on
  // "detecting": it self-resolves within 2s to last-used or a neutral default).
  useEffect(() => {
    if (applied || geoLoading) return
    if (countryName) {
      setPassport(countryName)
      setApplied(true)
    }
  }, [countryName, geoLoading, applied])

  const changePassport = useCallback((name: string) => {
    setPassport(name)
    setApplied(true)
    try { localStorage.setItem('visitplane_passport', name) } catch { /* ignore */ }
  }, [])

  // Fetch the guarded reliable list whenever the passport changes.
  useEffect(() => {
    if (!passport) return
    let cancelled = false
    setStatus('loading')
    fetch(`/api/visa-free-reliable?passport=${encodeURIComponent(passport)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const list: ReliableDestination[] = Array.isArray(data?.destinations) ? data.destinations : []
        setDests(list)
        setMeta({ source: data?.source ?? 'guarded-db', verified: data?.verified ?? null, total: data?.total ?? list.length })
        setStatus(list.length === 0 ? 'empty' : 'ready')
      })
      .catch(() => { if (!cancelled) { setDests([]); setMeta(null); setStatus('error') } })
    return () => { cancelled = true }
  }, [passport])

  // 4+ → seamless marquee makes sense; 1–3 → static centered row (no repeats).
  const useMarquee = dests.length >= 4

  // At-a-glance stats for the header strip (real data only — never fabricated).
  // The card list is a teaser capped at 30; `meta.total` is the true total. We
  // ONLY show the visa-free / on-arrival split when the full set is displayed —
  // otherwise a subset breakdown would misrepresent the total, so we show a
  // neutral "showing N of total" instead.
  const visaFreeCount = dests.filter((d) => d.kind === 'visa-free').length
  const voaCount = dests.filter((d) => d.kind === 'visa-on-arrival').length
  const maxDays = dests.reduce((m, d) => Math.max(m, d.days ?? 0), 0)
  const showStats = status === 'ready' && dests.length > 0
  const isCapped = !!meta && meta.total > dests.length

  return (
    <section className="overflow-hidden bg-gray-50 py-16 sm:py-20">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600">
            <span>✈️</span> Visa-Free Travel
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-[2.6rem] sm:leading-[1.1]">No Visa Required</h2>

          {/* Fill-in-the-blank hero line — the passport selector lives in the sentence */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-3 text-base text-gray-600 sm:text-lg">
            <PassportDropdown current={passport} onSelect={changePassport} geoLoading={geoLoading} />
            <span>can enter</span>
            {showStats && meta && meta.total > 0 ? (
              <span className="inline-flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-emerald-600 sm:text-3xl">{meta.total}</span>
                <span className="font-semibold text-gray-700">destinations</span>
              </span>
            ) : (
              <span className="font-semibold text-gray-700">destinations</span>
            )}
            <span>with no advance visa</span>
          </div>

          {/* At-a-glance stat strip — accurate to what's displayed */}
          {showStats && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {isCapped ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                  <span aria-hidden="true">✨</span> Showing {dests.length} of {meta?.total}
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> {visaFreeCount} visa-free
                  </span>
                  {voaCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-amber-400" /> {voaCount} on arrival
                    </span>
                  )}
                  {maxDays > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                      <span aria-hidden="true">⏱</span> up to {maxDays} days
                    </span>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Body */}
      {(status === 'detecting' || status === 'loading') && (
        <div className="flex flex-wrap items-stretch justify-center gap-4 px-4 sm:gap-5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[256px] w-[220px] shrink-0 animate-pulse rounded-[1.75rem] bg-gray-200/70 sm:h-[288px] sm:w-[244px] lg:h-[304px] lg:w-[260px]" />
          ))}
        </div>
      )}

      {status === 'ready' && (
        useMarquee ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <VisaFreeMarquee destinations={dests} passport={passport} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-stretch justify-center gap-4 px-4 sm:gap-5"
          >
            {dests.map((d) => (
              <VisaFreeCard key={d.name} passport={passport} dest={d} />
            ))}
          </motion.div>
        )
      )}

      {(status === 'empty' || status === 'error') && (
        <div className="mx-auto max-w-xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm">
            <div className="text-3xl">🛂</div>
            <h3 className="mt-3 text-base font-bold text-gray-900">
              {status === 'error'
                ? 'Couldn’t load visa-free destinations'
                : `No independently-reliable visa-free entries to show for ${passport} yet`}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
              {status === 'error'
                ? 'Please try again in a moment, or open your full passport map.'
                : 'We only show a destination here when our guide data for it is clean and unambiguous. Rather than risk a wrong “visa-free” claim, we’ve left the uncertain ones out — see your full passport map for the complete picture, and always confirm with the official source.'}
            </p>
            <Link
              href="/visa-free-map"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
            >
              See your full passport map →
            </Link>
          </div>
        </div>
      )}

      {/* Honest framing: reconfirm + official-source link, and full map */}
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
        {status === 'ready' && (
          <p className="mb-4 text-center text-xs text-gray-400">
            Drag, swipe or use arrow keys to explore ·{' '}
            <Link href="/visa-free-map" className="font-semibold text-emerald-600 underline-offset-2 hover:underline">
              See full requirements on your passport map →
            </Link>
          </p>
        )}
        <VisaDataDisclaimer variant="compact" />
      </div>
    </section>
  )
}
