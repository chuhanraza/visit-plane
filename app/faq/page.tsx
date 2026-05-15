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
function ChevronDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
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

const FAQS = [
  {
    q: 'What is a visa and when do I need one?',
    a: `A visa is an official authorization — usually a stamp or sticker in your passport — that permits you to enter, stay in, or transit through a foreign country for a specific purpose (tourism, business, study, work) and time period. Whether you need one depends on your nationality and the destination country. Many countries have bilateral agreements that allow citizens to travel visa-free or obtain a visa on arrival. Use VisitPlane to instantly check whether you need a visa for any specific trip.`,
  },
  {
    q: 'What is the difference between visa-free, visa on arrival, and e-Visa?',
    a: `Visa-free means you don't need any visa — you simply show your passport at immigration and are admitted for a set period (usually 30–90 days). Visa on Arrival (VOA) means you can obtain a visa when you arrive at the airport or border crossing — no pre-approval needed, but you may need to pay a fee and present certain documents. An e-Visa (electronic visa) must be applied for and approved online before you travel. It's linked to your passport digitally, so you don't receive a physical stamp but you must receive approval before departing.`,
  },
  {
    q: 'How far in advance should I apply for a visa?',
    a: `It depends on the country and visa type. As a general rule, apply at least 4–8 weeks before your travel date. Some visas — such as US, UK, Canada, and Schengen visas — can take 4–12 weeks due to appointment availability and processing times. Some countries offer expedited processing for an additional fee. Always check the specific embassy or consulate website for current processing times, as these can change seasonally. Never book non-refundable flights before your visa is approved.`,
  },
  {
    q: 'What is a Schengen visa and which countries accept it?',
    a: `A Schengen visa allows travel across 27 European countries that are part of the Schengen Area — a zone where internal border checks have been abolished. These include Germany, France, Italy, Spain, Netherlands, Switzerland, Sweden, Norway, Portugal, Greece, Austria, Belgium, Denmark, Finland, Czech Republic, Hungary, Poland, and others. A single Schengen visa lets you move freely between all member states for up to 90 days within any 180-day period. Note that the UK and Ireland are not part of the Schengen Area and require separate visas.`,
  },
  {
    q: 'My visa was denied — what can I do?',
    a: `A visa denial is not the end. First, read the rejection letter carefully — it should state the reason for denial (incomplete documents, insufficient funds, lack of ties to home country, etc.). Address those specific issues before reapplying. You can often reapply after fixing the problems. In some cases, you may be able to appeal the decision. Consider using an immigration lawyer or consultant for complex cases. Each application is independent, so a previous denial doesn't automatically mean future rejections, but you must declare prior denials on most visa applications.`,
  },
  {
    q: 'What documents are typically required for a tourist visa?',
    a: `While requirements vary by country, most tourist visa applications require: a valid passport (usually with at least 6 months validity beyond your stay), completed visa application form, recent passport-sized photos, proof of accommodation (hotel bookings or invitation letter), proof of sufficient funds (bank statements), return flight itinerary, travel insurance, and proof of ties to your home country (employment letter, property ownership, family ties). Some countries also require a cover letter explaining your trip. Use VisitPlane's Document Checklist tool to get a specific list for your journey.`,
  },
  {
    q: 'What is passport validity and why does it matter for travel?',
    a: `Many countries require your passport to be valid for at least 6 months beyond your intended stay — not just valid at the time of entry. For example, if you plan to visit a country on December 1st and stay for 2 weeks, your passport should be valid until at least June 1st of the following year. Airlines may also refuse to board you if your passport doesn't meet the destination country's validity requirements. Always check the specific requirements for your destination and renew your passport well in advance if needed.`,
  },
  {
    q: 'Can I extend my visa while abroad?',
    a: `Yes, many countries allow visa extensions, but the process varies. You typically need to apply at the local immigration authority before your current visa expires — don't wait until the last day. You'll usually need to provide valid reasons (medical emergency, flight cancellation, etc.) along with supporting documents. Some countries allow extensions for tourists who simply want to stay longer. Overstaying a visa without an approved extension can result in fines, deportation, and bans on future entry. Always check local immigration rules and apply for extensions with plenty of time to spare.`,
  },
  {
    q: 'What is a transit visa and when do I need one?',
    a: `A transit visa is needed when you pass through a country's immigration/passport control — even if you're just connecting to another flight and not officially "entering" the country for tourism. Whether you need a transit visa depends on your passport nationality, the layover country, and whether you stay airside (in the international transit area without going through immigration) or landside (going through immigration). Some airports in the UK, France, Germany, and others require transit visas for certain nationalities even for short layovers. Always check transit requirements if you have a connecting flight.`,
  },
  {
    q: 'Is the visa information on VisitPlane 100% accurate and up to date?',
    a: `We work hard to keep our information accurate and regularly update our database from official government sources, embassy websites, and immigration authorities. However, visa policies change frequently — sometimes without much notice — and we cannot guarantee that every piece of information is current at the exact moment you check it. VisitPlane should be used as a starting point for your research, not as the final word. Before you travel, always verify requirements with the official embassy or consulate of your destination country. VisitPlane is not responsible for any travel disruptions arising from outdated information.`,
  },
]

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.5 }}
      className="rounded-2xl border border-white/8 bg-[#13103a] overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-white/3">
        <span className="text-sm font-semibold text-white leading-snug">{faq.q}</span>
        <span className={`mt-0.5 shrink-0 text-teal-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <p className="px-5 pb-5 text-sm leading-relaxed text-white/55">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

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
              ❓ Frequently Asked Questions
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Visa FAQ
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-white/45">
            Everything you need to know about visas, travel documents, and international entry requirements — answered clearly and concisely.
          </motion.p>
        </div>
      </section>

      {/* FAQS */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/8 p-6 text-center">
            <p className="text-sm text-white/60">
              Still have questions?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">Contact us</Link>
              {' '}and we&apos;ll get back to you within 2 business days.
            </p>
            <div className="mt-4">
              <Link href="/destinations"
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px">
                Check Visa Requirements <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
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
