'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { faqPage } from '@/lib/seo/schema'

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
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

const FAQS = [
  {
    q: 'Is VisitPlane free?',
    a: `Yes — completely. VisitPlane is free to use, no account required, no subscription, no hidden fees. You can check visa requirements for any passport–destination combination as many times as you want. We keep it free because we believe access to clear visa information should not cost anything.`,
  },
  {
    q: 'How accurate is your visa data?',
    a: `We work hard to keep our data accurate, cross-referencing official government websites, embassy sources, and immigration authority portals. That said, visa policies change frequently — sometimes with little notice — and we are a small team, not a government database. Always treat VisitPlane as a reliable starting point, then verify the final details with the official embassy or consulate of your destination country before you travel.`,
  },
  {
    q: 'Do you process visa applications?',
    a: `No. VisitPlane is an information tool — we tell you what visa you need, what documents are required, and what to expect. We do not submit applications, collect passport details, or act as a travel agency or visa agent. For the actual application, you go directly to the official embassy, consulate, or government e-visa portal of your destination country.`,
  },
  {
    q: 'How often is the data updated?',
    a: `We update our database regularly as we become aware of policy changes. Major changes — like a country opening up visa-free access or introducing an e-visa — are updated as soon as we verify them from official sources. Smaller tweaks (fee adjustments, processing time changes) are reviewed periodically. We do not follow a fixed weekly or monthly release cycle because visa policy does not either.`,
  },
  {
    q: 'Where does your data come from?',
    a: `Our primary sources are official government websites, embassy and consulate portals, and national immigration authority pages. We also monitor IATA Travel Centre announcements and official foreign ministry travel advisories. We do not rely on user-submitted data or travel forums as primary sources.`,
  },
  {
    q: 'Can I trust this for my actual travel plans?',
    a: `You can use VisitPlane to plan and understand your visa situation — that is exactly what it is built for. However, do not book non-refundable flights or make irrevocable commitments based solely on what you read here. Visa rules can change between when we update our database and when you travel. For any trip, double-check the current requirements on the official embassy website or contact the consulate directly. Think of us as the informed friend who gives you a solid overview — not the final legal authority.`,
  },
  {
    q: 'Do I need to create an account?',
    a: `No account, no sign-up, no email required. You open the site, select your passport country and destination, and get your results instantly. We deliberately built it this way — your travel plans are your own business.`,
  },
  {
    q: 'Can I get visa alerts for my route?',
    a: `Not yet. Visa alerts — notifying you when requirements change for a specific passport–destination pair — are on our roadmap. If this would be useful to you, let us know via the contact page. For now, we recommend bookmarking the relevant page and rechecking it a few weeks before you travel.`,
  },
  {
    q: 'What if I find wrong information?',
    a: `Please tell us. Use the Contact page and describe the passport, destination, and what you believe is incorrect — ideally with a link to the official source. We take data accuracy seriously and will investigate and update as quickly as we can. Getting this right matters: bad visa data can mean missed flights and denied entry.`,
  },
  {
    q: 'How can I support VisitPlane?',
    a: `The best way to support us is to share the site with other travelers who would find it useful. If you spot wrong data and report it, that directly improves the product for everyone. We are a small independent tool with no investor funding — we run on word of mouth. If you would like to contribute in other ways, reach out via the Contact page.`,
  },
]

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-[#0f0c29] leading-snug">{faq.q}</span>
        <span className={`mt-0.5 shrink-0 text-teal-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-gray-500">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  // FAQPage JSON-LD — the Q&A below is fully visible on the page, so this is a
  // valid (non-spammy) rich-result source. Built from the same FAQS array.
  const faqSchema = faqPage(FAQS.map((f) => ({ q: f.q, a: f.a })))
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-[#0f0c29]"
          >
            FAQ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-gray-500"
          >
            Real answers about how VisitPlane works, where our data comes from, and what we can — and cannot — do for you.
          </motion.p>
        </div>
      </section>

      {/* FAQS */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-6 text-center">
            <p className="text-sm text-gray-500">
              Still have a question?{' '}
              <Link href="/contact" className="font-semibold text-teal-400 hover:text-teal-300 transition">
                Contact us
              </Link>
              {' '}— we reply within 48 hours.
            </p>
            <div className="mt-4">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px"
              >
                Check Visa Requirements <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
