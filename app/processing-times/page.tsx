'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const PASSPORTS = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso',
  'Burundi','Cambodia','Cameroon','Canada','Cape Verde','Central African Republic',
  'Chad','Chile','China','Colombia','Comoros','Costa Rica','Croatia','Cuba',
  'Cyprus','Czech Republic','Democratic Republic of the Congo','Denmark','Djibouti',
  'Dominica','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala',
  'Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hong Kong','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia',
  'Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius',
  'Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco',
  'Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand',
  'Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman',
  'Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Republic of the Congo','Romania',
  'Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Swaziland','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste',
  'Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'UAE','Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
].sort()
const DESTS = ['Australia','Canada','France','Germany','Japan','New Zealand','Singapore','UAE','United Kingdom','United States'].sort()
const VISA_TYPES = ['Tourist','Business','Student','Work']
type TimeData = { standard: number; express: number; tips: string[] }
const TIMES: Record<string, TimeData> = {
  'Pakistan|United Kingdom|Tourist':       { standard:15, express:5,  tips:['Apply at least 4 weeks early','Provide 6 months of bank statements','Book refundable flights before submitting'] },
  'Pakistan|United States|Tourist':        { standard:60, express:30, tips:['No interview required — submit online','Include strong financial documents','Apply well before your intended travel date'] },
  'Pakistan|UAE|Tourist':                  { standard:3,  express:1,  tips:['Apply via the UAE ICA portal online','Usually approved in 1–3 business days','Ensure passport is valid for 6+ months'] },
  'Pakistan|Germany|Tourist':              { standard:15, express:7,  tips:['Book a consulate appointment early','Include all financial and travel documents','Apply at least 6 weeks before travel'] },
  'India|United States|Tourist':           { standard:60, express:30, tips:['Schedule your interview as early as possible','Show strong home-country ties (property, employment)','Apply during off-peak months for faster slots'] },
  'India|United Kingdom|Tourist':          { standard:15, express:5,  tips:['Apply at least 4 weeks early','Priority service reduces to 5 days','Provide 6 months of bank statements'] },
  'India|Canada|Tourist':                  { standard:30, express:10, tips:['Submit biometrics promptly after applying','Include travel itinerary and accommodation proof','Show proof of sufficient funds for your stay'] },
  'India|Australia|Tourist':               { standard:20, express:7,  tips:['Apply online via ImmiAccount','Ensure health insurance is arranged','Processing is usually 15–25 days online'] },
  'Nigeria|United Kingdom|Tourist':        { standard:21, express:7,  tips:['Use the Priority visa service for speed','Complete biometrics appointment immediately','Ensure all documents are officially certified'] },
  'Philippines|United States|Tourist':     { standard:45, express:20, tips:['Provide proof of employment and income','Show strong ties to the Philippines','Prepare a detailed, realistic travel itinerary'] },
  'China|United States|Tourist':           { standard:45, express:20, tips:['Schedule DS-160 and interview well in advance','Processing can be delayed during peak periods','Bring all supporting documents to your interview'] },
  'Bangladesh|United Kingdom|Tourist':     { standard:21, express:7,  tips:['Use Priority service for faster results','Submit strong financial evidence','Apply at least 5 weeks before travel'] },
  'Mexico|United States|Tourist':          { standard:45, express:20, tips:['Schedule your B1/B2 interview early','Show economic ties to Mexico','Provide employment letters and bank statements'] },
  'United States|United Kingdom|Tourist':  { standard:3,  express:1,  tips:['Apply for a UK ETA online','Usually approved the same day','No in-person appointment needed'] },
  'United Kingdom|United States|Tourist':  { standard:3,  express:1,  tips:['Apply for ESTA online before departure','Usually processed within 72 hours','Ensure your passport is ESTA-eligible'] },
}
const NAV = [{ label:'Explore', href:'/destinations' },{ label:'Passport Strength', href:'/passport-strength' },{ label:'⚖️ Compare', href:'/compare' },{ label:'📋 Checklist', href:'/checklist' },{ label:'⏱️ Processing Times', href:'/processing-times' },{ label:'Blog', href:'/blog' }]
const FOOTER_COLS = [{ title:'Explore', links:[['Destinations','/destinations'],['Travel Guides','/blog'],['Visa Types','#']] as const },{ title:'Resources', links:[['Blog','/blog'],['Embassy Finder','/embassy-finder'],['FAQ','/faq']] as const },{ title:'Company', links:[['About','/about'],['Privacy Policy','/privacy'],['Contact','/contact']] as const }]

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
          <span className="text-lg font-bold tracking-tight"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => <Link key={n.label} href={n.href} className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">{n.label}</Link>)}
        </nav>
        <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition">Check Visa →</Link>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={32} height={32} className="rounded-xl" />
              <span className="text-lg font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/30">The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.</p>
          </div>
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">{col.title}</h4>
              <ul className="space-y-2.5">{col.links.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-white/30 hover:text-white transition">{label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
          <p className="text-xs text-white/15">Processing times are estimates. Always verify with official embassy sources.</p>
        </div>
      </div>
    </footer>
  )
}

export default function ProcessingTimesPage() {
  const [passport, setPassport] = useState('')
  const [dest, setDest] = useState('')
  const [vtype, setVtype] = useState('Tourist')
  const [result, setResult] = useState<TimeData | null | 'none'>(null)
  const sel = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition'
  const found = result && result !== 'none' ? result : null

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased">
      <Navbar />
      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-12 text-center px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.12),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400">⏱️ Processing Time Tracker</div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem]">
            <span className="text-white">How Long Will Your</span><br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Visa Take?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-white/45">Real processing time estimates for every visa type</p>
        </div>
      </section>
      {/* INPUTS */}
      <section className="mx-auto max-w-2xl px-4 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-teal-400">Passport Country</label>
              <select value={passport} onChange={e => setPassport(e.target.value)} className={sel} style={{ colorScheme:'dark' }}>
                <option value="">Select country</option>
                {PASSPORTS.map(c => <option key={c} value={c} className="bg-[#16122f]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-teal-400">Destination</label>
              <select value={dest} onChange={e => setDest(e.target.value)} className={sel} style={{ colorScheme:'dark' }}>
                <option value="">Select destination</option>
                {DESTS.map(c => <option key={c} value={c} className="bg-[#16122f]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-teal-400">Visa Type</label>
              <select value={vtype} onChange={e => setVtype(e.target.value)} className={sel} style={{ colorScheme:'dark' }}>
                {VISA_TYPES.map(t => <option key={t} value={t} className="bg-[#16122f]">{t}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => setResult(TIMES[`${passport}|${dest}|${vtype}`] ?? 'none')} disabled={!passport || !dest}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed">
            ⏱️ Check Times
          </button>
        </div>
        {/* RESULTS */}
        {result === 'none' && (
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center text-sm text-white/40">
            Processing times typically range from 5–30 days depending on your embassy. Please check the official embassy website for exact timelines.
          </div>
        )}
        {found && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.08] p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-400">📅 Standard Processing</div>
                <div className="mt-3 text-4xl font-extrabold text-white">{found.standard}<span className="ml-1.5 text-lg font-semibold text-white/40">days</span></div>
                <div className="mt-1 text-xs text-white/35">≈ {Math.ceil(found.standard / 7)} weeks</div>
              </div>
              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-teal-400">⚡ Express Processing</div>
                <div className="mt-3 text-4xl font-extrabold text-white">{found.express}<span className="ml-1.5 text-lg font-semibold text-white/40">days</span></div>
                <div className="mt-1 text-xs text-white/35">Priority service available</div>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-6">
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-400">💡 Tips to Speed Up Processing</div>
              <ul className="space-y-2.5">
                {found.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-bold text-teal-400">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
