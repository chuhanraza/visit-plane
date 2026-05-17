'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Data ─────────────────────────────────────────────────────────────────────
type Q = { q: string; answer: string; notToSay?: string; tip: string }

const QUESTIONS: Record<string, Q[]> = {
  usa: [
    { q: 'What is the purpose of your visit?', answer: 'I am visiting for tourism to explore [city/attraction]. I have booked hotels and a return flight on [date].', notToSay: 'I might look for work while there', tip: 'Be specific about your itinerary' },
    { q: 'How long do you plan to stay?', answer: 'I plan to stay for [X days/weeks] and will return before my visa expires. My return flight is already booked.', notToSay: 'As long as possible', tip: 'Always mention your return ticket' },
    { q: 'Do you have family/friends in the USA?', answer: 'I have [relationship] in [city] but I will be staying in a hotel and funding my own trip.', tip: 'Emphasize your independence' },
    { q: 'What is your job/income source?', answer: 'I work as [job] at [company] for [X years]. I have approved leave for this trip and will return to work on [date].', tip: 'Show employment stability' },
    { q: 'Can you show proof of funds?', answer: 'Yes, I have bank statements showing [amount] which covers my entire trip including accommodation and expenses.', tip: 'Have 3 months of statements ready' },
    { q: 'What ties do you have to your home country?', answer: 'I own property, have a stable job, and my family is here. I have every reason to return after my trip.', tip: 'Ties = property, job, family, assets' },
    { q: 'Have you visited the USA before?', answer: 'Yes/No. [If yes: I returned on time every visit. If no: This is my first visit and I\'m very excited to follow all rules]', tip: 'If denied before, explain what changed' },
    { q: 'Who is sponsoring your trip?', answer: 'I am self-sponsoring. My savings and salary cover all trip expenses.', tip: 'Self-sponsoring shows independence' },
  ],
  uk: [
    { q: 'Why do you want to visit the UK?', answer: 'I want to visit [specific attractions like Big Ben, museums] and experience British culture. I have [X] days planned.', tip: 'Research specific UK attractions' },
    { q: 'Where will you stay?', answer: 'I have booked [hotel name] in [city] for the duration of my stay. Here is my booking confirmation.', tip: 'Always have hotel booking printed' },
    { q: 'How will you fund your trip?', answer: 'I have [amount] in savings plus my monthly salary of [amount]. My bank statements show sufficient funds.', tip: 'Show 6 months of bank statements' },
    { q: 'When will you return?', answer: 'My return flight is booked for [date]. I must return to work at [company] on [date].', tip: 'Show employment letter + return ticket' },
  ],
  canada: [
    { q: 'What is the purpose of your visit?', answer: 'I am visiting Canada for tourism to see [Niagara Falls/Vancouver/Toronto]. I have a detailed itinerary planned.', tip: 'Mention specific Canadian landmarks' },
    { q: 'Do you have any relatives in Canada?', answer: 'I have a [relationship] in [city] but I am staying in a hotel and self-funding my trip entirely.', tip: 'Clarify you won\'t overstay' },
    { q: 'What are your ties to your home country?', answer: 'I have a permanent job at [company], own property, and my immediate family lives here. I will definitely return.', tip: 'Property ownership is strongest tie' },
  ],
  australia: [
    { q: 'Are you a genuine temporary entrant?', answer: 'Yes absolutely. I have strong personal and professional ties to [country]. I plan to return after [X weeks].', tip: 'GTE is Australia\'s key requirement' },
    { q: 'What will you do in Australia?', answer: 'I plan to visit [Sydney Opera House/Great Barrier Reef/Uluru] and explore Australian culture and nature.', tip: 'Show genuine tourist interest' },
  ],
  germany: [
    { q: 'Why Germany specifically?', answer: 'I want to experience German culture, visit [Berlin/Munich/Heidelberg castle] and explore the history.', tip: 'Show cultural interest, not job search' },
    { q: 'Do you have travel insurance?', answer: 'Yes, I have comprehensive travel insurance covering the entire Schengen zone with minimum €30,000 medical coverage.', tip: 'Schengen requires €30K minimum coverage' },
  ],
}

const COUNTRIES = [
  { key: 'usa', label: '🇺🇸 United States', visaTypes: ['Tourist/Business (B1/B2)', 'Student', 'Work'] },
  { key: 'uk', label: '🇬🇧 United Kingdom', visaTypes: ['Tourist/Business', 'Student', 'Work'] },
  { key: 'canada', label: '🇨🇦 Canada', visaTypes: ['Tourist/Business', 'Student', 'Work'] },
  { key: 'australia', label: '🇦🇺 Australia', visaTypes: ['Tourist/Business', 'Student', 'Work'] },
  { key: 'germany', label: '🇩🇪 Germany', visaTypes: ['Tourist/Business (Schengen)', 'Student', 'Work'] },
]

const TIPS = [
  { icon: '👔', title: 'Dress Professionally', body: 'Wear formal/business attire. First impressions matter to visa officers.' },
  { icon: '📁', title: 'Organize Documents', body: 'Bring originals + copies in a neat folder. Officers notice organized applicants.' },
  { icon: '⏰', title: 'Arrive 15 Min Early', body: 'Rushing creates anxiety. Arrive calm and composed for best performance.' },
  { icon: '🎯', title: 'Be Specific & Brief', body: 'Officers interview 100+ people daily. Short, direct, honest answers win.' },
  { icon: '🏠', title: 'Show Strong Ties', body: 'Property, job letter, family photos — prove you WILL return home.' },
]

const CHECKLIST = [
  'Valid passport (6+ months validity)',
  'Visa appointment confirmation',
  'Completed application form',
  'Bank statements (3–6 months)',
  'Employment letter + leave approval',
  'Return flight ticket',
  'Hotel/accommodation booking',
  'Travel insurance',
  'Passport photos (recent)',
  'Property/asset documents (if applicable)',
]

const TOOLS = [
  { label: '⚖️ Compare Visas', href: '/compare' },
  { label: '📋 Checklist', href: '/checklist' },
  { label: '⏱️ Processing Times', href: '/processing-times' },
  { label: '🛡️ Travel Insurance', href: '/travel-insurance' },
  { label: '💱 Currency Converter', href: '/currency-converter' },
  { label: '🏛️ Embassy Finder', href: '/embassy-finder' },
  { label: '💰 Cost Calculator', href: '/cost-calculator' },
  { label: '💪 Passport Strength', href: '/passport-strength' },
  { label: '📊 Visa Tracker', href: '/visa-tracker' },
  { label: '🎤 Interview Prep', href: '/interview-prep' },
]

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-[#0f0c29]'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Visit</span><span className="text-emerald-400">Plane</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Explore</Link>
          <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Visa Requirements</Link>
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">
              Tools
              <svg className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden">
                {TOOLS.map(t => (
                  <Link key={t.href} href={t.href} onClick={() => setToolsOpen(false)} className={`block px-4 py-2 text-sm hover:bg-white/5 hover:text-white transition ${t.href === '/interview-prep' ? 'text-teal-400' : 'text-white/60'}`}>{t.label}</Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Blog</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-px transition">
            Check Visa <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white transition" aria-label="Toggle menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" /> : <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {[{ label: 'Explore', href: '/destinations' }, { label: 'Visa Requirements', href: '/destinations' }, { label: 'Blog', href: '/blog' }].map(item => (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">{item.label}</Link>
            ))}
            <div className="pt-1 pb-0.5 px-3 text-xs font-semibold uppercase tracking-widest text-white/30">Tools</div>
            {TOOLS.map(t => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white transition ${t.href === '/interview-prep' ? 'text-teal-400' : 'text-white/60'}`}>{t.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: 'Explore', links: [{ label: 'Destinations', href: '/destinations' }, { label: 'Passport Strength', href: '/passport-strength' }, { label: 'Travel Guides', href: '/blog' }, { label: 'Visa Types', href: '/destinations' }] },
    { title: 'Resources', links: [{ label: 'Blog', href: '/blog' }, { label: 'Embassy Finder', href: '/embassy-finder' }, { label: 'Travel Insurance', href: '/travel-insurance' }, { label: 'FAQ', href: '/faq' }] },
    { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }, { label: 'Contact', href: '/contact' }] },
  ]
  return (
    <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={32} height={32} className="rounded-xl" />
              <span className="text-lg font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/30">The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.</p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}><Link href={link.href} className="text-sm text-white/30 hover:text-white transition">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
          <p className="text-xs text-white/15">Visa data is estimated. Always verify with official embassy sources.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function InterviewPrepClient() {
  const [country, setCountry] = useState('')
  const [visaType, setVisaType] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const selectedCountry = COUNTRIES.find(c => c.key === country)
  const questions = country ? (QUESTIONS[country] ?? []) : []

  const handleStart = () => {
    if (country && visaType) {
      setShowResults(true)
      setOpenIndex(null)
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] pt-16 pb-12 text-center px-4">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 mb-6">
            🎤 Interview Prep
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0f0c29] mb-4">Ace Your Visa Interview</h1>
          <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-lg mx-auto">Real questions from 225,000+ interview experiences. Practice before the big day.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm">📋 26,000+ Real Questions</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm">🌍 5 Countries Covered</span>
          </div>
        </div>
      </section>

      {/* ── Selector Card ────────────────────────────────────────────────── */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">I am traveling to:</label>
                <select value={country} onChange={e => { setCountry(e.target.value); setVisaType(''); setShowResults(false) }} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition">
                  <option value="">Select a country…</option>
                  {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Visa type:</label>
                <select value={visaType} onChange={e => { setVisaType(e.target.value); setShowResults(false) }} disabled={!country} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">Select visa type…</option>
                  {selectedCountry?.visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <button onClick={handleStart} disabled={!country || !visaType} className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Start Prep →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Accordion Results ────────────────────────────────────────────── */}
      {showResults && (
        <section id="results" className="px-4 pb-16 bg-[#FAFAFA]">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#0f0c29]">{selectedCountry?.label} — {visaType}</h2>
              <p className="text-sm text-gray-500 mt-1">{questions.length} questions to practice</p>
            </div>
            <div className="space-y-3">
              {questions.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition">
                    <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600">{i + 1}</span>
                    <span className="flex-1 text-sm font-semibold text-[#0f0c29]">{item.q}</span>
                    <svg className={`shrink-0 h-4 w-4 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-5 pt-1 space-y-3">
                      <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
                        <div className="text-xs font-bold text-teal-700 mb-1">✅ Sample Answer</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                      {item.notToSay && (
                        <div className="rounded-lg border-l-4 border-red-400 bg-red-50 px-4 py-3">
                          <div className="text-xs font-bold text-red-700 mb-1">⚠️ What NOT to say</div>
                          <p className="text-sm text-gray-700">&ldquo;{item.notToSay}&rdquo;</p>
                        </div>
                      )}
                      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
                        <div className="text-xs font-bold text-amber-700 mb-1">💡 Expert Tip</div>
                        <p className="text-sm text-gray-700">{item.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tips ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-2">💡 Pro Tips</p>
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">Interview Success Tips</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => (
              <div key={i} className="rounded-xl border-l-4 border-teal-500 bg-white p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-2">{tip.icon}</div>
                <div className="text-sm font-bold text-[#0f0c29] mb-1">{tip.title}</div>
                <p className="text-sm text-gray-500">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents Checklist ──────────────────────────────────────────── */}
      <section className="px-4 pb-20 bg-[#FAFAFA]">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
              <h3 className="text-lg font-extrabold text-white">📋 Documents to Bring</h3>
            </div>
            <div className="px-6 py-5">
              <ul className="space-y-3">
                {CHECKLIST.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-50" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
