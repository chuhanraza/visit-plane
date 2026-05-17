'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────
type Q = { q: string; answer: string; notSay?: string; tip: string }

// ─── Questions DB ─────────────────────────────────────────────────────────────
const QUESTIONS: Record<string, Record<string, Q[]>> = {
  "United States": {
    "Tourist": [
      { q: "What is the purpose of your visit?", answer: "I am visiting for tourism to explore New York and Washington DC. I have booked hotels and a return flight.", notSay: "I might look for work opportunities while there.", tip: "Be specific about tourist attractions you plan to visit." },
      { q: "How long do you plan to stay?", answer: "I plan to stay for 2 weeks and will return before my visa expires. My return flight is already booked for [date].", notSay: "As long as possible or until my visa runs out.", tip: "Always mention your specific return date and booked ticket." },
      { q: "What is your job and income source?", answer: "I work as [position] at [company] for [X] years earning [salary]. I have approved annual leave for this trip.", notSay: "I'm between jobs right now.", tip: "Strong employment = strong reason to return home." },
      { q: "What ties do you have to your home country?", answer: "I own property, have a permanent job, and my family lives here. I have every reason to return after my trip.", notSay: "I don't have many ties here, I prefer America.", tip: "Ties = property, job, family, assets. Show all of them." },
      { q: "Who is sponsoring your trip?", answer: "I am self-sponsoring. My savings and monthly salary fully cover all trip expenses including hotel and flights.", notSay: "A friend in America is paying for everything.", tip: "Self-sponsoring shows financial independence." },
      { q: "Have you been to the USA before?", answer: "Yes, I visited in [year] and returned on time as required. OR: No, this is my first visit and I plan to follow all visa rules.", notSay: "I overstayed before but it was just a few days.", tip: "Previous visits with no violations strengthen your case." },
      { q: "Do you have family or friends in the USA?", answer: "I have a [relation] in [city] but I am staying in a hotel and funding my trip independently.", notSay: "My whole family is there, I want to join them.", tip: "Having relatives is fine, but clarify you will return." },
      { q: "Can you show proof of sufficient funds?", answer: "Yes. I have bank statements showing [amount] which comfortably covers my entire trip including all expenses.", notSay: "I have some savings, not sure of the exact amount.", tip: "Bring 3-6 months of bank statements showing consistent balance." },
    ],
    "Student": [
      { q: "Which university have you been accepted to?", answer: "I have been accepted to [University Name] in [City] to study [Course Name] starting [Month Year].", notSay: "I applied to several, not sure which one yet.", tip: "Know your university details thoroughly before the interview." },
      { q: "Why did you choose this university?", answer: "It is ranked top [X] globally for [subject]. It offers [specific program feature] which matches my career goals perfectly.", notSay: "It was the only one that accepted me.", tip: "Show genuine research into the university and program." },
      { q: "How will you finance your studies?", answer: "My education is funded by [scholarship/family/self]. I have [amount] in a dedicated education fund plus my family's support.", notSay: "I will work part-time to pay my tuition.", tip: "Show clear financial plan covering full tuition + living costs." },
      { q: "What will you do after completing your degree?", answer: "I plan to return to [home country] and apply my degree at [industry/company]. The skills are highly needed back home.", notSay: "I hope to find a job and stay in the USA permanently.", tip: "Always emphasize your plan to RETURN home after studies." },
      { q: "Why study in USA instead of your home country?", answer: "USA universities offer world-class research facilities and global exposure that [home country] universities cannot match for [my field].", notSay: "Education back home is bad quality.", tip: "Frame it positively about USA's strengths, not home country weakness." },
      { q: "Do you speak English fluently?", answer: "Yes. I scored [IELTS/TOEFL score] and have been studying and working in English for [X] years.", notSay: "I will improve my English once I get there.", tip: "High English test scores eliminate this concern completely." },
    ],
    "Work": [
      { q: "What company has sponsored your work visa?", answer: "I have been hired by [Company Name] as a [Job Title]. They have obtained H-1B/L-1 approval for my position.", notSay: "I'm still negotiating the employment contract.", tip: "Have your employment contract and visa petition ready." },
      { q: "What will your job responsibilities be?", answer: "I will be responsible for [specific duties]. My role requires [specialized skills] which the company cannot find locally.", notSay: "I'm not sure yet, HR will tell me when I arrive.", tip: "Know your job description in detail before the interview." },
      { q: "What is your salary package?", answer: "My annual salary is [amount] which meets the prevailing wage requirement for this position in [location].", notSay: "I don't know the exact amount yet.", tip: "Know your exact salary. H-1B requires prevailing wage compliance." },
      { q: "What are your qualifications for this role?", answer: "I have a [degree] in [field] from [university] plus [X] years of experience specifically in [skill area].", notSay: "I have general experience in many areas.", tip: "Specialty occupation requires specific qualifications. Be precise." },
      { q: "Do you plan to apply for a green card?", answer: "I am focused on my current assignment. H-1B allows dual intent so I will explore options as my career develops.", notSay: "No I will definitely leave after my visa expires.", tip: "H-1B is dual intent. Honesty about future plans is acceptable." },
    ],
  },
  "United Kingdom": {
    "Tourist": [
      { q: "Why do you want to visit the UK?", answer: "I want to visit specific attractions like the British Museum, Buckingham Palace, and the Scottish Highlands. I have a detailed 10-day itinerary planned.", notSay: "I heard there are good job opportunities there.", tip: "Research specific UK attractions and mention them by name." },
      { q: "Where will you stay during your visit?", answer: "I have booked [Hotel Name] in [City] for the duration of my stay. Here is my confirmed booking showing full payment.", notSay: "I'll figure out accommodation when I arrive.", tip: "Pre-booked hotels with confirmation are essential." },
      { q: "How will you fund your trip?", answer: "I have £[amount] in savings specifically for this trip, plus my monthly salary of [amount]. My bank statements confirm sufficient funds.", notSay: "My friend in UK will pay for most things.", tip: "Show 6 months of bank statements with consistent balance." },
      { q: "When will you return to your home country?", answer: "My return flight is booked for [specific date]. I must return to start work at [company] on [date].", notSay: "I'm not sure yet, depends how much I enjoy it.", tip: "A booked return ticket + employment letter is your strongest proof." },
      { q: "What do you do for work back home?", answer: "I work as [position] at [company] for [X] years. I have approved annual leave for this trip and a job to return to.", notSay: "I'm currently unemployed but looking for work.", tip: "Stable employment is your strongest tie to home country." },
    ],
    "Student": [
      { q: "Which UK university will you attend?", answer: "I will attend [University] in [City] to study [Course] for [duration]. I hold an unconditional offer letter.", notSay: "I have applied but not confirmed yet.", tip: "Have your CAS (Confirmation of Acceptance for Studies) ready." },
      { q: "Why did you choose to study in the UK?", answer: "UK universities are globally ranked for [my subject]. [University] specifically offers [unique feature] that aligns with my career in [field].", notSay: "UK was easier to get into than USA.", tip: "Show deep research into UK education quality and specific program." },
      { q: "How will you support yourself financially?", answer: "I have £[amount] in a dedicated account covering tuition and living costs. My [parents/scholarship] provide ongoing support.", notSay: "I plan to work part-time to cover my expenses.", tip: "UK requires proof of £1,334/month for living costs in London." },
      { q: "What are your plans after graduation?", answer: "I plan to return to [country] and work in [industry]. The Graduate Route visa might allow me to gain some UK experience first.", notSay: "I want to stay in UK permanently after graduating.", tip: "Mentioning Graduate Route visa shows you know the legal options." },
    ],
    "Work": [
      { q: "Who is your UK employer?", answer: "I have been hired by [Company Name] in [City] as a [Job Title]. They hold a valid Sponsor Licence and issued my Certificate of Sponsorship.", notSay: "I'm still finalizing the employment details.", tip: "The Certificate of Sponsorship (CoS) is your key document." },
      { q: "What is your salary in the UK role?", answer: "My salary is £[amount] per year which exceeds the Skilled Worker visa minimum threshold for my occupation code.", notSay: "I'm not sure, we haven't finalized compensation.", tip: "Know the exact salary threshold for your SOC code." },
    ],
  },
  "Canada": {
    "Tourist": [
      { q: "What is the main purpose of your visit to Canada?", answer: "I am visiting Canada for tourism. I plan to see Niagara Falls, explore Vancouver, and visit Toronto. I have a 14-day itinerary planned.", notSay: "I want to explore job opportunities there.", tip: "Mention specific Canadian landmarks by name." },
      { q: "Do you have relatives or friends in Canada?", answer: "I have a [relation] in [city] but I am staying in a hotel and funding my trip completely independently.", notSay: "Yes, I'm hoping they can help me settle there.", tip: "Having contacts is fine. Clarify you plan to return home." },
      { q: "What are your ties to your home country?", answer: "I have a permanent job at [company], own property, and my immediate family lives here. I have very strong reasons to return.", notSay: "I don't have many ties, I'm quite free.", tip: "Property ownership is the single strongest tie you can show." },
      { q: "How long do you plan to stay in Canada?", answer: "I plan to stay for exactly [X days]. My return flight is booked and I must return to work on [date].", notSay: "Maybe 6 months if I can extend.", tip: "Short, specific answer with return flight confirmation." },
      { q: "How much money are you bringing for the trip?", answer: "I have CAD [amount] budgeted for this trip including flights, hotel, food, and activities. My bank statements confirm this.", notSay: "I'm not sure, enough to get by.", tip: "Canada recommends CAD $100/day minimum for tourists." },
    ],
    "Student": [
      { q: "Which Canadian institution will you study at?", answer: "I will study [Program] at [Institution Name] in [City]. It is a Designated Learning Institution (DLI). I have my Letter of Acceptance.", notSay: "I applied to several schools in Canada.", tip: "Only DLI-approved institutions qualify for student visa." },
      { q: "Prove you are a genuine student who will return home.", answer: "I have strong family ties, property, and career plans in [country]. I am studying [subject] to improve my career prospects back home.", notSay: "Canada is great, I might try to stay if I can.", tip: "This is Canada's version of Australia's GTE requirement." },
    ],
    "Work": [
      { q: "Do you have a valid Canadian job offer?", answer: "Yes. I have a positive LMIA-supported job offer from [Company] in [Province] as a [Job Title] at [salary] per year.", notSay: "I plan to find a job once I arrive in Canada.", tip: "LMIA (Labour Market Impact Assessment) is mandatory for most work permits." },
    ],
  },
  "Australia": {
    "Tourist": [
      { q: "Are you a genuine temporary entrant (GTE)?", answer: "Yes absolutely. I have strong personal ties to [country] including property, employment, and family. I am visiting purely for tourism for [X weeks].", notSay: "I might extend my stay if I like it there.", tip: "GTE is Australia's most important visa criterion. Emphasize it." },
      { q: "What specifically will you do in Australia?", answer: "I plan to visit the Sydney Opera House, Great Barrier Reef, and Uluru. I have a detailed day-by-day itinerary and all accommodation booked.", notSay: "I'll figure it out when I get there.", tip: "Specific, researched itinerary proves genuine tourist intent." },
      { q: "How will you fund your Australian trip?", answer: "I have AUD [amount] saved for this trip. My bank statements show consistent savings over [X months] with no sudden deposits.", notSay: "A friend will help me pay for some things.", tip: "Australia looks for consistent savings, not recent large deposits." },
    ],
    "Student": [
      { q: "Why did you choose Australia for your studies?", answer: "Australia is ranked globally for [my field]. [University] specifically offers [unique aspect]. The practical learning approach matches my learning style.", notSay: "It was easier than USA or UK to get into.", tip: "Australia checks Genuine Student (GS) status. Show real motivation." },
      { q: "What are your plans after completing your degree?", answer: "I plan to return to [country] and work in [industry]. The knowledge I gain will be highly valuable in my home market.", notSay: "I hope to get a 485 visa and stay in Australia.", tip: "While 485 visa exists legally, emphasize home country return plans." },
    ],
    "Work": [
      { q: "What skilled occupation are you applying under?", answer: "I am applying under [occupation] on the Medium and Long Term Strategic Skills List (MLTSSL). My skills assessment from [assessing body] is approved.", notSay: "I'm not sure which occupation code applies to me.", tip: "Skills assessment from the relevant authority is mandatory." },
    ],
  },
  "Germany": {
    "Tourist": [
      { q: "Why do you want to visit Germany specifically?", answer: "I want to experience German culture and history. I plan to visit Berlin's Brandenburg Gate, Neuschwanstein Castle, and Munich's museums.", notSay: "Germany has good job opportunities I want to explore.", tip: "Show cultural and tourism interest. Never mention job searching." },
      { q: "Do you have travel insurance for the Schengen zone?", answer: "Yes. I have comprehensive travel insurance covering the entire Schengen zone with €30,000 minimum medical coverage as required.", notSay: "I have some basic insurance, I think it covers Europe.", tip: "Schengen REQUIRES minimum €30,000 medical coverage. No exceptions." },
      { q: "Have you traveled to Schengen countries before?", answer: "Yes, I visited [country] in [year] and followed all visa rules, departing before my authorized stay expired. OR: No, this is my first Schengen visit.", notSay: "I overstayed a bit last time but it was not long.", tip: "Clean travel history across all countries is very important." },
      { q: "What is your itinerary for Germany?", answer: "I have [X] days planned. Berlin for [X] days, Munich for [X] days, then [other city]. All accommodation is pre-booked and paid.", notSay: "I'll travel around and see what I find.", tip: "Day-by-day itinerary with hotel bookings shows serious preparation." },
    ],
    "Student": [
      { q: "Which German university accepted you?", answer: "I have been accepted to [University] in [City] for [Program]. Germany's higher education is tuition-free for international students which is a huge advantage.", notSay: "I applied to several universities in Germany.", tip: "Most German public universities are tuition-free. Show you know this." },
      { q: "Do you speak German?", answer: "I have [A1/A2/B1/B2] level German certified by [Goethe Institut]. My program is taught in English so language will not be a barrier.", notSay: "I will learn German when I arrive.", tip: "German language proof or English-taught program confirmation is key." },
    ],
    "Work": [
      { q: "Do you have a recognized qualification for Germany?", answer: "Yes. My [degree/qualification] has been recognized by [anabin database / relevant authority]. This qualifies me for the Skilled Immigration Act pathway.", notSay: "I have international experience that should count.", tip: "Germany requires formal qualification recognition. Check anabin database." },
      { q: "Do you have a job offer from a German employer?", answer: "Yes. I have a binding job offer from [Company] in [City] as a [Position] with a salary of €[amount] per year.", notSay: "I plan to find a job once I arrive in Germany.", tip: "Germany also offers Job Seeker Visa (6 months) to find work in-country." },
    ],
  },
}

// ─── Supporting data ──────────────────────────────────────────────────────────
const COUNTRIES = [
  { value: "United States", label: "🇺🇸 United States" },
  { value: "United Kingdom", label: "🇬🇧 United Kingdom" },
  { value: "Canada",         label: "🇨🇦 Canada" },
  { value: "Australia",      label: "🇦🇺 Australia" },
  { value: "Germany",        label: "🇩🇪 Germany" },
]

const VISA_TYPES = ["Tourist", "Student", "Work"]

const DIFFICULTY: Record<string, Record<string, { dot: string; label: string; detail: string }>> = {
  "United States": { "Tourist": { dot: "🔴", label: "Hard",   detail: "B1/B2 refusal rate ~20%" }, "Student": { dot: "🟡", label: "Medium", detail: "F-1 visa"             }, "Work": { dot: "🔴", label: "Hard",   detail: "H-1B very competitive"  } },
  "United Kingdom": { "Tourist": { dot: "🟡", label: "Medium", detail: "Standard visitor visa"  }, "Student": { dot: "🟡", label: "Medium", detail: "Student Route visa"   }, "Work": { dot: "🔴", label: "Hard",   detail: "Skilled Worker visa"    } },
  "Canada":         { "Tourist": { dot: "🟢", label: "Easy",   detail: "TRV processing"         }, "Student": { dot: "🟡", label: "Medium", detail: "Study permit"         }, "Work": { dot: "🟡", label: "Medium", detail: "LMIA work permit"       } },
  "Australia":      { "Tourist": { dot: "🟡", label: "Medium", detail: "GTE requirement"         }, "Student": { dot: "🟡", label: "Medium", detail: "Genuine Student check" }, "Work": { dot: "🔴", label: "Hard",   detail: "Skills assessment needed"} },
  "Germany":        { "Tourist": { dot: "🟡", label: "Medium", detail: "Schengen visa rules"     }, "Student": { dot: "🟡", label: "Medium", detail: "Language requirements" }, "Work": { dot: "🟡", label: "Medium", detail: "Qualification recognition"} },
}

const TIPS = [
  { icon: "👔", title: "Dress Professionally",  body: "Wear formal/business attire. First impressions matter to visa officers." },
  { icon: "📁", title: "Organize Documents",    body: "Bring originals + copies in a neat folder. Officers notice organized applicants." },
  { icon: "⏰", title: "Arrive 15 Min Early",   body: "Rushing creates anxiety. Arrive calm and composed for best performance." },
  { icon: "🎯", title: "Be Specific & Brief",   body: "Officers interview 100+ people daily. Short, direct, honest answers win." },
  { icon: "🏠", title: "Show Strong Ties",       body: "Property, job letter, family photos — prove you WILL return home." },
]

const CHECKLIST = [
  "Valid passport (6+ months validity)",
  "Visa appointment confirmation",
  "Completed application form",
  "Bank statements (3–6 months)",
  "Employment letter + leave approval",
  "Return flight ticket",
  "Hotel/accommodation booking",
  "Travel insurance",
  "Passport photos (recent)",
  "Property/asset documents (if applicable)",
]

const TOOLS = [
  { label: "💪 Passport Strength",  href: "/passport-strength" },
  { label: "⚖️ Compare Visas",      href: "/compare"           },
  { label: "📋 Checklist",           href: "/checklist"         },
  { label: "⏱️ Processing Times",    href: "/processing-times"  },
  { label: "🛡️ Travel Insurance",   href: "/travel-insurance"  },
  { label: "🏛️ Embassy Finder",     href: "/embassy-finder"    },
  { label: "💰 Cost Calculator",    href: "/cost-calculator"   },
  { label: "💱 Currency Converter", href: "/currency-converter"},
  { label: "📊 Visa Tracker",       href: "/visa-tracker"      },
  { label: "🎤 Interview Prep",     href: "/interview-prep"    },
]

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [toolsOpen,   setToolsOpen]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-[#0f0c29]'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Visit</span><span className="text-emerald-400">Plane</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Explore</Link>
          <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Visa Requirements</Link>
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">
              Tools
              <svg className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl shadow-black/40 py-1.5 overflow-hidden">
                {TOOLS.map(t => (
                  <Link key={t.href} href={t.href} onClick={() => setToolsOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-white/5 hover:text-white transition ${t.href === '/interview-prep' ? 'text-teal-400 font-semibold' : 'text-white/60'}`}>
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Blog</Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-px transition">
            Check Visa <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white transition" aria-label="Toggle menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" /> : <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {[{ label: 'Explore', href: '/destinations' }, { label: 'Visa Requirements', href: '/destinations' }, { label: 'Blog', href: '/blog' }].map(item => (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">{item.label}</Link>
            ))}
            <div className="pt-1 pb-0.5 px-3 text-xs font-semibold uppercase tracking-widest text-white/30">Tools</div>
            {TOOLS.map(t => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white transition ${t.href === '/interview-prep' ? 'text-teal-400' : 'text-white/60'}`}>
                {t.label}
              </Link>
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
    { title: 'Explore',   links: [{ label: 'Destinations', href: '/destinations' }, { label: 'Passport Strength', href: '/passport-strength' }, { label: 'Travel Guides', href: '/blog' }, { label: 'Visa Types', href: '/destinations' }] },
    { title: 'Resources', links: [{ label: 'Blog', href: '/blog' }, { label: 'Embassy Finder', href: '/embassy-finder' }, { label: 'Travel Insurance', href: '/travel-insurance' }, { label: 'FAQ', href: '/faq' }] },
    { title: 'Company',   links: [{ label: 'About', href: '/about' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }, { label: 'Contact', href: '/contact' }] },
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
                {col.links.map(link => <li key={link.label}><Link href={link.href} className="text-sm text-white/30 hover:text-white transition">{link.label}</Link></li>)}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewPrepClient() {
  const [country,     setCountry]     = useState('')
  const [visaType,    setVisaType]    = useState('')
  const [showResults, setShowResults] = useState(false)
  const [openIndex,   setOpenIndex]   = useState<number | null>(null)

  // Derived state — computed from latest render values (no stale closure risk)
  const questions  = country && visaType ? (QUESTIONS[country]?.[visaType] ?? []) : []
  const difficulty = country && visaType ? DIFFICULTY[country]?.[visaType]        : null
  const countryLabel = COUNTRIES.find(c => c.value === country)?.label ?? country

  const handleStart = () => {
    if (!country || !visaType) return
    setShowResults(true)
    setOpenIndex(null)
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  const handlePrint = () => window.print()
  const handleWhatsApp = () => {
    const text = encodeURIComponent(`📋 Visa Interview Prep — ${country} ${visaType} Visa\n\nPractice ${questions.length} real interview questions:\nhttps://visitplane.com/interview-prep`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAFA] pt-16 pb-12 text-center px-4">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 mb-6">
            🎤 Interview Prep
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0f0c29] mb-4">Ace Your Visa Interview</h1>
          <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-lg mx-auto">Real questions from 225,000+ interview experiences. Practice before the big day.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm">📋 26,000+ Real Questions</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 shadow-sm">🌍 5 Countries Covered</span>
          </div>
        </div>
      </section>

      {/* ── Selector Card ─────────────────────────────────────────────────── */}
      <section className="px-4 pb-4">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">I am traveling to:</label>
                <select
                  value={country}
                  onChange={e => { setCountry(e.target.value); setVisaType(''); setShowResults(false) }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#0f0c29] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                >
                  <option value="">Select a country…</option>
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Difficulty badge */}
              {country && visaType && difficulty && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-4 py-2.5">
                  <span className="text-base">{difficulty.dot}</span>
                  <span className="text-sm font-bold text-[#0f0c29]">{difficulty.label} difficulty</span>
                  <span className="ml-1 text-xs text-gray-400">— {difficulty.detail}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Visa type:</label>
                <select
                  value={visaType}
                  onChange={e => { setVisaType(e.target.value); setShowResults(false) }}
                  disabled={!country}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#0f0c29] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select visa type…</option>
                  {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <button
                onClick={handleStart}
                disabled={!country || !visaType}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start Prep →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {showResults && questions.length > 0 && (
        <section id="results" className="px-4 pt-10 pb-16 bg-[#FAFAFA]">
          <div className="mx-auto max-w-2xl">

            {/* Header row */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-[#0f0c29]">{countryLabel} — {visaType} Visa</h2>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-sm font-semibold text-teal-700">
                📋 Showing {questions.length} questions for {country} {visaType} visa
              </div>
            </div>

            {/* Print / Share */}
            <div className="mb-6 flex flex-wrap gap-3 justify-center">
              <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-teal-400 hover:text-teal-600 transition shadow-sm">
                📋 Print these questions
              </button>
              <button onClick={handleWhatsApp} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 transition shadow-sm">
                📱 Share on WhatsApp
              </button>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              {questions.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 transition"
                  >
                    <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600">{i + 1}</span>
                    <span className="flex-1 text-sm font-semibold text-[#0f0c29] leading-snug">{item.q}</span>
                    <svg className={`shrink-0 mt-0.5 h-4 w-4 text-gray-400 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6"/></svg>
                  </button>

                  {openIndex === i && (
                    <div className="px-5 pb-5 pt-0 space-y-3">
                      {/* Answer */}
                      <div className="rounded-lg border-l-4 bg-teal-50 px-4 py-3" style={{ borderColor: '#14B8A6' }}>
                        <div className="text-xs font-bold text-teal-700 mb-1.5">✅ Sample Answer</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                      </div>
                      {/* Not to say */}
                      {item.notSay && (
                        <div className="rounded-lg border-l-4 bg-red-50 px-4 py-3" style={{ borderColor: '#EF4444' }}>
                          <div className="text-xs font-bold text-red-700 mb-1.5">⚠️ What NOT to say</div>
                          <p className="text-sm text-gray-700">&ldquo;{item.notSay}&rdquo;</p>
                        </div>
                      )}
                      {/* Tip */}
                      <div className="rounded-lg border-l-4 bg-amber-50 px-4 py-3" style={{ borderColor: '#F59E0B' }}>
                        <div className="text-xs font-bold text-amber-700 mb-1.5">💡 Expert Tip</div>
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

      {/* ── Tips ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 bg-[#F8FAFC]">
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

      {/* ── Documents Checklist ───────────────────────────────────────────── */}
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
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 rounded border-2 border-gray-300 bg-white" />
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
