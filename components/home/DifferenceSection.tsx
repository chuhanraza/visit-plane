'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, type Variants } from 'framer-motion'
import EagleTraveler from '@/components/home/EagleTraveler'

// ─────────────────────────────────────────────────────────────────────────────
// "The difference" — a transformation comparison. Each painful DIY step (left,
// muted) resolves into a VisitPlane benefit (right, elevated + spotlit), so the
// section reads as before → after rather than two disconnected lists.
// ─────────────────────────────────────────────────────────────────────────────

const PAIRS: { problem: string; solution: string }[] = [
  { problem: 'A dozen government & embassy tabs', solution: 'One free source for every passport & destination' },
  { problem: 'Conflicting answers, nothing dated', solution: 'Checked against official government & embassy sources' },
  { problem: 'Dense legal language to decode', solution: 'Plain-language requirements you can act on' },
  { problem: 'Easy to miss a document or fee', solution: 'Exact documents, fees & timelines, upfront' },
  { problem: 'No single place for every route', solution: 'Free tools: checklist, compare, passport strength & more' },
]

function XMark({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function Check({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

const rowV: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

export default function DifferenceSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="relative overflow-hidden border-t border-gray-100 bg-white py-20 sm:py-28">
      {/* ambient brand glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 right-[-10%] h-[480px] w-[480px] rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(16,201,92,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] left-[-8%] h-[380px] w-[380px] rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)' }} />
      </div>

      <div ref={ref} className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={container} className="mb-12 text-center">
          <motion.span variants={rowV} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> The difference
          </motion.span>
          <motion.h2 variants={rowV} className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-[2.6rem] sm:leading-[1.1]">
            Visa research,{' '}
            <span className="relative inline-block">
              <span className="relative z-10">without the guesswork</span>
              <span className="absolute inset-x-0 bottom-1 z-0 hidden h-3 -rotate-[0.5deg] bg-emerald-300/40 sm:block" aria-hidden="true" />
            </span>
          </motion.h2>
          <motion.p variants={rowV} className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-gray-500">
            Doing it alone means hours of conflicting tabs. Here&apos;s what each headache turns into with VisitPlane.
          </motion.p>
        </motion.div>

        {/* Brand mascot lead visual (hides gracefully until the asset is added) */}
        <EagleTraveler />

        {/* Comparison panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-white/80 p-3 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.25)] backdrop-blur-sm sm:p-5 lg:p-6"
        >
          {/* spotlight behind the winning (right) column — desktop only */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-emerald-50/90 via-emerald-50/40 to-transparent md:block" aria-hidden="true" />

          {/* column headers */}
          <div className="relative mb-3 hidden grid-cols-[1fr_auto_1fr] items-center gap-x-4 md:grid">
            <div className="flex items-center gap-2 px-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500"><XMark className="h-3 w-3" /></span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">On your own</span>
            </div>
            <div className="w-9" />
            <div className="flex items-center gap-2 px-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"><Check className="h-3 w-3" /></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">With VisitPlane</span>
            </div>
          </div>

          {/* rows */}
          <motion.div initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={container} className="relative space-y-2.5">
            {PAIRS.map((p) => (
              <motion.div key={p.solution} variants={rowV}>
                {/* desktop: problem → arrow → solution */}
                <div className="hidden grid-cols-[1fr_auto_1fr] items-stretch gap-x-4 md:grid">
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500"><XMark /></span>
                    <span className="text-sm leading-snug text-gray-500">{p.problem}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-500 shadow-sm">
                      <ArrowRight />
                    </span>
                  </div>
                  <div className="group flex items-center gap-3 rounded-2xl border border-emerald-300/60 bg-white px-4 py-3.5 shadow-sm ring-1 ring-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"><Check /></span>
                    <span className="text-sm font-semibold leading-snug text-gray-900">{p.solution}</span>
                  </div>
                </div>

                {/* mobile: stacked transformation card */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 md:hidden">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500"><XMark className="h-3 w-3" /></span>
                    <span className="text-[13px] leading-snug text-gray-500">{p.problem}</span>
                  </div>
                  <div className="my-2 ml-2.5 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-500">
                      <ArrowRight className="h-3 w-3 rotate-90" />
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent" />
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300/60 bg-white px-3 py-2.5 shadow-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></span>
                    <span className="text-[13px] font-semibold leading-snug text-gray-900">{p.solution}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-center sm:flex-row sm:text-left"
          >
            <p className="text-sm font-semibold text-white">
              Skip the guesswork — check your exact requirements free.
            </p>
            <Link
              href="/destinations"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Check my visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
