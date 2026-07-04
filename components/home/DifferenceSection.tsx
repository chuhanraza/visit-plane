'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, type Variants } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// "The difference" — two-column comparison (iVisa-style): a muted "Do it
// yourself" card vs. an emphasized green-bordered "With VisitPlane" card with
// check-marks and a CTA. Copy stays honest to VisitPlane (a free info guide), so
// no paid-service claims (experts/payments/WhatsApp) it can't stand behind.
// ─────────────────────────────────────────────────────────────────────────────

const PROBLEMS = [
  'A dozen government & embassy tabs',
  'Confusing legal language — easy to get wrong',
  'Conflicting answers, nothing clearly dated',
  'Easy to miss a required document or fee',
  'No single place for every passport & route',
]

const SOLUTIONS = [
  'One free place for every passport & destination',
  'Plain-language requirements you can act on',
  'Checked against official government & embassy sources',
  'Exact documents, fees & timelines, upfront',
  'Free tools — checklist, compare, passport strength & more',
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
function PlaneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
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
    <section className="relative overflow-hidden border-t border-gray-100 bg-white pb-12 pt-6 sm:pb-14 sm:pt-7">
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
        </motion.div>

        {/* Two-column comparison */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid items-start gap-5 sm:gap-6 md:grid-cols-2"
        >
          {/* Do it yourself */}
          <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-7 sm:p-9 md:mt-7">
            <h3 className="mb-7 text-center text-xl font-extrabold text-[#143A4E] sm:text-2xl">Do it yourself</h3>
            <ul className="space-y-5">
              {PROBLEMS.map((p) => (
                <li key={p} className="flex items-start gap-3.5">
                  <span className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                    <XMark className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[15px] leading-snug text-gray-500 sm:text-base">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With VisitPlane */}
          <div className="relative rounded-[1.75rem] border-[3px] border-[#16C95C] bg-white p-7 shadow-[0_24px_60px_-24px_rgba(16,201,92,0.4)] sm:p-9">
            <h3 className="mb-7 flex items-center justify-center gap-2 text-xl font-extrabold text-[#143A4E] sm:text-2xl">
              <span>With</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB]">
                  <PlaneIcon className="h-4 w-4 text-white" />
                </span>
                <span className="tracking-tight">
                  <span className="text-[#0F1419]">Visit</span><span className="text-[#16C95C]">Plane</span>
                </span>
              </span>
            </h3>
            <ul className="space-y-5">
              {SOLUTIONS.map((s) => (
                <li key={s} className="flex items-start gap-3.5">
                  <span className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[15px] font-bold leading-snug text-[#143A4E] sm:text-base">{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <Link
                href="/destinations"
                className="rounded-2xl bg-[#16C95C] px-9 py-3.5 text-base font-extrabold text-[#0A2E1A] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#14b853] hover:shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
