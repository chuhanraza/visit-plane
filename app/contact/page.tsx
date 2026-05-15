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

const CONTACT_CARDS = [
  {
    icon: '✉️',
    title: 'General Inquiries',
    desc: 'Questions about VisitPlane, visa data, or partnerships.',
    email: 'hello@visitplane.com',
  },
  {
    icon: '🔒',
    title: 'Privacy & Data',
    desc: 'Data requests, GDPR inquiries, or privacy concerns.',
    email: 'privacy@visitplane.com',
  },
  {
    icon: '⚖️',
    title: 'Legal',
    desc: 'Terms of service questions, copyright, or legal notices.',
    email: 'legal@visitplane.com',
  },
  {
    icon: '🐛',
    title: 'Report an Issue',
    desc: 'Found incorrect visa data or a bug on the site? Let us know.',
    email: 'support@visitplane.com',
  },
]

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Opens mailto as a fallback (no backend needed)
    const mailto = `mailto:hello@visitplane.com?subject=${encodeURIComponent(form.subject || 'Contact from VisitPlane')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
    window.location.href = mailto
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased overflow-x-hidden">
      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-teal-500/20 blur-md group-hover:bg-teal-500/30 transition" />
              <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Visit</span><span className="text-teal-400">Plane</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(item => (
              <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px">
              Check Visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition">
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {NAV_LINKS.map(item => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">
              💬 Get in Touch
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Contact Us
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-white/45">
            Have a question, spotted incorrect visa data, or want to collaborate? We&apos;d love to hear from you. We typically respond within 2 business days.
          </motion.p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CONTACT_CARDS.map((card, i) => (
              <motion.a key={card.title} href={`mailto:${card.email}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-2xl border border-white/8 bg-[#13103a] p-5 transition hover:border-teal-500/30 hover:bg-[#16122f]">
                <div className="mb-3 text-2xl">{card.icon}</div>
                <h3 className="mb-1 text-sm font-bold text-white">{card.title}</h3>
                <p className="mb-3 text-xs leading-relaxed text-white/45">{card.desc}</p>
                <span className="text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition">{card.email}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/8 bg-[#13103a] p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-bold text-white">Send a Message</h2>

            {submitted ? (
              <div className="rounded-xl border border-teal-500/25 bg-teal-500/10 p-6 text-center">
                <div className="mb-2 text-3xl">✅</div>
                <p className="text-sm font-semibold text-teal-400">Opening your email client…</p>
                <p className="mt-1 text-xs text-white/45">If nothing opened, email us directly at hello@visitplane.com</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Your Name</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/60">Email Address</label>
                    <input
                      type="email" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/60">Subject</label>
                  <input
                    type="text" value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition"
                    placeholder="Question about visa requirements"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/60">Message</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition resize-none"
                    placeholder="Tell us what's on your mind…"
                  />
                </div>
                <button type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px">
                  Send Message <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={28} height={28} className="rounded-xl" />
              <span className="text-base font-bold"><span className="text-white">Visit</span><span className="text-teal-400">Plane</span></span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-5">
              {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['About', '/about'], ['FAQ', '/faq']].map(([l, h]) => (
                <Link key={l} href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link>
              ))}
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
