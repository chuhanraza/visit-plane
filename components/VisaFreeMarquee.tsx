'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import DestinationImage from '@/components/DestinationImage'
import { getPassportFlag } from '@/components/PassportSwitcher'
import { getCountryImage } from '@/lib/data/countryImages'
import { ALL_COUNTRIES } from '@/app/destinations/data'
import type { ReliableDestination } from '@/app/api/visa-free-reliable/route'

function nameToSlug(name: string) {
  return encodeURIComponent(name)
}

// Region lookup (name → region) from the 197-country dataset, for the card chip.
const REGION_BY_NAME = new Map(ALL_COUNTRIES.map((c) => [c.name.toLowerCase(), c.region]))
function regionOf(name: string): string | null {
  return REGION_BY_NAME.get(name.trim().toLowerCase()) ?? null
}

// Human label for the allowed-stay length / entry kind.
function stayLabel(d: ReliableDestination): string {
  if (d.days != null) return `${d.days} days`
  return d.kind === 'visa-on-arrival' ? 'On arrival' : 'Visa-free'
}
function kindLabel(d: ReliableDestination): string {
  return d.kind === 'visa-on-arrival' ? 'Visa on arrival' : 'Visa-free'
}
// Entry-kind accent: visa-free = emerald, visa-on-arrival = amber. Distinguishing
// the two at a glance is genuinely useful — VoA still needs action at the border.
function kindAccent(d: ReliableDestination) {
  return d.kind === 'visa-on-arrival'
    ? { dot: 'bg-amber-400 shadow-[0_0_6px_1px_rgba(251,191,36,0.9)]', text: 'text-amber-200', glow: 'from-amber-500/25', canvas: 'bg-[radial-gradient(120%_90%_at_15%_-5%,#fbbf24_0%,#f59e0b_36%,#0d9488_72%,#0f766e_100%)]' }
    : { dot: 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.9)]', text: 'text-emerald-200', glow: 'from-emerald-500/25', canvas: 'bg-[radial-gradient(120%_90%_at_15%_-5%,#34d399_0%,#10b981_38%,#0d9488_70%,#0f766e_100%)]' }
}

// Decorative "passport-stamp" motif drawn behind the flag on photo-less cards —
// turns a flat fallback into a designed travel card (pure SVG, no asset/network).
function StampMotif() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" viewBox="0 0 260 360" fill="none" aria-hidden="true">
      <circle cx="130" cy="128" r="70" stroke="white" strokeWidth="1" strokeDasharray="2 6" />
      <circle cx="130" cy="128" r="92" stroke="white" strokeWidth="1.5" strokeDasharray="3 8" />
      <circle cx="130" cy="128" r="114" stroke="white" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic visa-free destination card (shared by the marquee and the static
// few-items layout). Photo or branded fallback via <DestinationImage>.
// ─────────────────────────────────────────────────────────────────────────────
export function VisaFreeCard({
  passport,
  dest,
  onClick,
}: {
  passport: string
  dest: ReliableDestination
  onClick?: (e: React.MouseEvent) => void
}) {
  const flag = getPassportFlag(dest.name)
  const hasPhoto = !!getCountryImage(dest.name)
  const region = regionOf(dest.name)
  const accent = kindAccent(dest)
  return (
    <Link
      href={`/visa/${nameToSlug(passport)}/${nameToSlug(dest.name)}`}
      onClick={onClick}
      draggable={false}
      aria-label={`${dest.name} — ${kindLabel(dest).toLowerCase()}, up to ${stayLabel(dest)}`}
      className="group/card relative block h-[300px] w-[220px] shrink-0 overflow-hidden rounded-[1.75rem] bg-gray-900 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)] ring-1 ring-emerald-400/20 transition-all duration-300 will-change-transform hover:-translate-y-2 hover:shadow-[0_28px_55px_-15px_rgba(16,185,129,0.45)] hover:ring-emerald-400/60 focus-visible:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:h-[340px] sm:w-[244px] lg:h-[360px] lg:w-[260px]"
    >
      {/* ── canvas: full-bleed photo, or a designed travel-stamp gradient ── */}
      {hasPhoto ? (
        <DestinationImage
          name={dest.name}
          flag={flag}
          className="h-full w-full scale-105 object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
        />
      ) : (
        <div className={`absolute inset-0 ${accent.canvas}`}>
          <StampMotif />
          <div className="absolute left-1/2 top-[33%] -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-4xl shadow-lg backdrop-blur-md transition-transform duration-500 group-hover/card:scale-110 sm:h-24 sm:w-24 sm:text-5xl">
              {flag}
            </div>
          </div>
        </div>
      )}

      {/* legibility + brand glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${accent.glow} to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100`} />

      {/* top row: entry-type status + region */}
      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          {kindLabel(dest)}
        </span>
        {region && (
          <span className="shrink-0 rounded-full border border-white/15 bg-black/25 px-2 py-1 text-[10px] font-semibold text-white/85 backdrop-blur-md">
            {region}
          </span>
        )}
      </div>

      {/* bottom content block */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            {/* small flag chip only on photo cards — fallback cards already hero the flag */}
            {hasPhoto && (
              <div className="mb-1.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-base leading-none backdrop-blur-md">{flag}</div>
            )}
            <h3 className="truncate text-lg font-extrabold leading-tight text-white drop-shadow-sm">{dest.name}</h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            {stayLabel(dest)}
          </span>
        </div>
        {/* explore affordance — slides in on hover */}
        <div className={`mt-3 flex items-center gap-1.5 text-[11px] font-semibold ${accent.text} opacity-0 transition-all duration-300 group-hover/card:opacity-100`}>
          Explore entry rules
          <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover/card:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </div>
      </div>
    </Link>
  )
}

/**
 * Cinematic, edge-to-edge auto/manual marquee for visa-free destinations.
 *
 * One unified scroll model powers everything: a native horizontal scroller
 * (overflow-x-auto) is nudged forward each frame for the slow auto-scroll,
 * and the SAME scroller handles drag, swipe, prev/next buttons and keyboard.
 * The track is tripled so we can wrap scrollLeft seamlessly for an endless loop.
 *
 * Respects prefers-reduced-motion (no autoplay — static scrollable strip),
 * pauses on hover / focus / drag, and never shows a broken image
 * (<DestinationImage> guarantees a branded fallback).
 *
 * Data is supplied by the caller and is already accuracy-guarded
 * (see /api/visa-free-reliable) — this component only presents it.
 */
export default function VisaFreeMarquee({
  destinations,
  passport,
}: {
  destinations: ReliableDestination[]
  passport: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const draggingRef = useRef(false)
  const dragRef = useRef({ startX: 0, startScroll: 0, moved: 0 })
  const [reduced, setReduced] = useState(false)

  // Triple the list so we always have a copy to the left and right to wrap into.
  const loop = [...destinations, ...destinations, ...destinations]

  // ── prefers-reduced-motion ──────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // ── start centered on the middle copy so both directions have runway ─────
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const id = requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth / 3
    })
    return () => cancelAnimationFrame(id)
  }, [destinations.length, passport])

  // ── seamless wrap: keep scrollLeft inside the middle copy ────────────────
  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const set = el.scrollWidth / 3
    if (set <= 0) return
    if (el.scrollLeft < set * 0.5) el.scrollLeft += set
    else if (el.scrollLeft > set * 1.5) el.scrollLeft -= set
  }, [])

  // ── slow, elegant auto-scroll (time-based, ~32px/s) ──────────────────────
  useEffect(() => {
    if (reduced) return
    const el = scrollerRef.current
    if (!el) return
    let last = performance.now()
    const SPEED = 32 // px per second
    const tick = (now: number) => {
      const dt = now - last
      last = now
      if (!pausedRef.current && !draggingRef.current) {
        el.scrollLeft += (SPEED * dt) / 1000
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reduced])

  // ── prev / next + keyboard ───────────────────────────────────────────────
  const nudge = useCallback(
    (dir: number) => {
      const el = scrollerRef.current
      if (!el) return
      const step = Math.min(el.clientWidth * 0.8, 320)
      el.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' })
    },
    [reduced],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        nudge(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nudge(-1)
      }
    },
    [nudge],
  )

  // ── mouse drag-to-scroll (touch uses native momentum scrolling) ──────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = scrollerRef.current
    if (!el) return
    draggingRef.current = true
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: 0 }
    el.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const el = scrollerRef.current
    if (!el) return
    const dx = e.clientX - dragRef.current.startX
    dragRef.current.moved = Math.abs(dx)
    el.scrollLeft = dragRef.current.startScroll - dx
  }, [])

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const el = scrollerRef.current
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {}
    }
  }, [])

  // Suppress the click if the user was actually dragging the strip.
  const onCardClick = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.moved > 6) {
      e.preventDefault()
    }
  }, [])

  const pause = useCallback(() => {
    pausedRef.current = true
  }, [])
  const resume = useCallback(() => {
    pausedRef.current = false
  }, [])

  // Keep paused while focus lives anywhere inside the strip (keyboard users).
  const onBlurCapture = useCallback((e: React.FocusEvent) => {
    const el = scrollerRef.current
    if (el && !el.contains(e.relatedTarget as Node)) pausedRef.current = false
  }, [])

  return (
    <div
      className="group/marquee relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={onBlurCapture}
    >
      {/* edge fade masks — dissolve cards into the section background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-gray-50 to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-gray-50 to-transparent sm:w-20" />

      {/* prev / next — glassy floating controls (hidden on small screens) */}
      <button
        type="button"
        aria-label="Previous destinations"
        onClick={() => nudge(-1)}
        className="absolute left-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 shadow-lg shadow-gray-900/5 backdrop-blur-md transition hover:scale-105 hover:border-emerald-400/60 hover:text-emerald-600 active:scale-95 md:flex"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button
        type="button"
        aria-label="Next destinations"
        onClick={() => nudge(1)}
        className="absolute right-3 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 shadow-lg shadow-gray-900/5 backdrop-blur-md transition hover:scale-105 hover:border-emerald-400/60 hover:text-emerald-600 active:scale-95 md:flex"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </button>

      {/* the strip */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Visa-free destinations — scroll, drag or use arrow keys to browse"
        className="vp-marquee-scroll flex cursor-grab gap-4 overflow-x-auto overflow-y-hidden px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:cursor-grabbing sm:gap-5 sm:px-8"
      >
        {loop.map((d, i) => {
          const isClone = i < destinations.length || i >= destinations.length * 2
          return (
            // Clone copies are inert as well as aria-hidden: without inert their
            // links stay keyboard-focusable, which axe flags (aria-hidden-focus)
            // and which traps screen-reader/keyboard users in duplicate cards.
            <div key={`${d.name}-${i}`} aria-hidden={isClone} inert={isClone ? true : undefined}>
              <VisaFreeCard passport={passport} dest={d} onClick={onCardClick} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
