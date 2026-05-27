'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

const VALUES = [
  {
    icon: '🎯',
    title: 'Accuracy First',
    desc: 'We obsess over data quality. Every visa requirement is cross-referenced with official government sources before it goes live on VisitPlane.',
  },
  {
    icon: '🌍',
    title: 'Built for Everyone',
    desc: "Whether you hold the world's most powerful passport or face complex visa hurdles — VisitPlane gives you the same clear, unbiased information.",
  },
  {
    icon: '⚡',
    title: 'Fast & Simple',
    desc: 'No account required. No sign-up walls. Just select your passport, pick a destination, and get instant results.',
  },
  {
    icon: '🔄',
    title: 'Always Updating',
    desc: 'Visa policies change constantly. We monitor official sources and update our database as changes are confirmed — no fixed schedule, just as fast as reality changes.',
  },
  {
    icon: '🔒',
    title: 'Privacy Respecting',
    desc: "We don't ask for your personal details to check visa requirements. We don't store your searches. Your travel plans are your own business.",
  },
  {
    icon: '💡',
    title: 'Empowering Travelers',
    desc: 'We believe access to clear visa information reduces uncertainty and helps more people explore the world confidently — regardless of where they were born.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      {/* HERO */}
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f0c29]"
          >
            About VisitPlane
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 max-w-xl mx-auto text-base leading-relaxed text-gray-500"
          >
            We built VisitPlane because checking visa requirements was needlessly complicated. Confusing government websites, outdated travel forums, and expensive visa agents should not stand between you and the world.
          </motion.p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-gray-100 bg-white p-8"
          >
            <h2 className="mb-4 text-xl font-bold text-[#0f0c29]">Who we are</h2>
            <p className="text-sm leading-relaxed text-gray-500 mb-4">
              VisitPlane is a small independent project. We are not a travel agency, a visa processing service, or a funded startup with a large team. We are a few people who travel frequently and got tired of the same problem: figuring out whether you need a visa, what kind, what it costs, and what you need to bring.
            </p>
            <p className="text-sm leading-relaxed text-gray-500">
              So we built the tool we wished existed — one that gives you a clear answer in seconds, covers 197 countries, and costs nothing to use. No account, no upsell, no agency fees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MISSION */}
      <section className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-8 text-center"
          >
            <div className="mb-4 text-4xl">🚀</div>
            <h2 className="mb-3 text-xl font-bold text-[#0f0c29]">Our Mission</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Accurate visa information for every traveler, completely free. The complexity of international travel should never be a barrier to exploring the world — especially not because good information was locked behind expensive services or buried in confusing government websites.
            </p>
          </motion.div>
        </div>
      </section>

      {/* VALUES */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-8 text-center text-xl font-bold text-[#0f0c29]"
          >
            What We Stand For
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="mb-3 text-2xl">{v.icon}</div>
                <h3 className="mb-2 text-sm font-bold text-[#0f0c29]">{v.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HONEST NOTE */}
      <section className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl border border-gray-100 bg-white p-8"
          >
            <h2 className="mb-4 text-xl font-bold text-[#0f0c29]">A note on data accuracy</h2>
            <p className="text-sm leading-relaxed text-gray-500 mb-4">
              We do our best to keep everything current and correct. We cross-reference official government sources, embassy portals, and immigration authorities. But we are not infallible — visa rules change, sometimes without much notice, and we are a small team.
            </p>
            <p className="text-sm leading-relaxed text-gray-500">
              Always verify your final requirements with the official embassy or consulate of your destination country before you travel — especially for complex trips or if you are close to your travel date. If you spot something wrong on our site, please{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">let us know</Link>
              {' '}— it helps everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-gray-100 bg-white p-8"
          >
            <h2 className="mb-3 text-xl font-bold text-[#0f0c29]">Ready to check your visa?</h2>
            <p className="mb-6 text-sm text-gray-500">Select your passport country and destination to get instant requirements — no sign-up needed.</p>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px"
            >
              Check Visa Requirements <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
