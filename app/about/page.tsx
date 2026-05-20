'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function MenuIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Explore',           href: '/destinations' },
  { label: 'Visa Requirements', href: '/destinations' },
  { label: 'Passport Strength', href: '/passport-strength' },
  { label: '⚖️ Compare Visas',  href: '/compare' },
  { label: '📋 Checklist',      href: '/checklist' },
  { label: 'Guides',            href: '/blog' },
]

const STATS = [
  { value: '190+', label: 'Countries covered' },
  { value: '10k+', label: 'Visa routes tracked' },
  { value: '50k+', label: 'Travelers helped' },
  { value: 'Free', label: 'Always & forever' },
]

const VALUES = [
  {
    icon: '🎯',
    title: 'Accuracy First',
    desc: 'We obsess over data quality. Every visa requirement is cross-referenced with official government sources before it goes live on VisitPlane.',
  },
  {
    icon: '🌍',
    title: 'Built for Everyone',
    desc: 'Whether you hold the world\'s most powerful passport or face complex visa hurdles — VisitPlane gives you the same clear, unbiased information.',
  },
  {
    icon: '⚡',
    title: 'Fast & Simple',
    desc: 'No account required. No sign-up walls. Just select your passport, pick a destination, and get instant results.',
  },
  {
    icon: '🔄',
    title: 'Always Updating',
    desc: 'Visa policies change constantly. Our team monitors official sources and updates our database regularly to keep information current.',
  },
  {
    icon: '🔒',
    title: 'Privacy Respecting',
    desc: 'We don\'t ask for your personal details to check visa requirements. Your travel plans are your business.',
  },
  {
    icon: '💡',
    title: 'Empowering Travelers',
    desc: 'We believe access to clear visa information helps people explore the world with confidence and reduces uncertainty in travel planning.',
  },
]

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">{/* HERO */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">
              ✈️ Our Story
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f0c29]">
            About VisitPlane
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 max-w-xl mx-auto text-base leading-relaxed text-gray-500">
            We built VisitPlane because checking visa requirements was needlessly complicated. Confusing government websites, outdated forums, and expensive travel agents shouldn&apos;t stand between you and the world.
          </motion.p>
        </div>
      </section>

      {/* STATS */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
                <div className="text-2xl font-extrabold text-teal-400">{stat.value}</div>
                <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-teal-500/20 bg-teal-500/8 p-8 text-center">
            <div className="mb-4 text-4xl">🚀</div>
            <h2 className="mb-3 text-xl font-bold text-[#0f0c29]">Our Mission</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              To make global travel accessible by giving every traveler instant, clear, and accurate visa information — completely free. We believe the complexity of international travel should never be a barrier to exploring the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* VALUES */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold text-[#0f0c29]">
            What We Stand For
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="mb-3 text-2xl">{v.icon}</div>
                <h3 className="mb-2 text-sm font-bold text-[#0f0c29]">{v.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-gray-100 bg-white p-8">
            <h2 className="mb-3 text-xl font-bold text-[#0f0c29]">Ready to check your visa?</h2>
            <p className="mb-6 text-sm text-gray-500">Select your passport country and destination to get instant requirements — no sign-up needed.</p>
            <Link href="/destinations"
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px">
              Check Visa Requirements <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section></div>
  )
}
