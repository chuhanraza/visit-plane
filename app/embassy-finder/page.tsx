'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserCountry } from '@/hooks/useUserCountry'

const COUNTRIES = ['India','Nigeria','Pakistan','Philippines','United Kingdom','United States']
const EMBASSIES = [
  { from:'Pakistan', to:'United Kingdom', name:'Pakistan High Commission, London', address:'35-36 Lowndes Square, London SW1X 9JN', phone:'+44 20 7664 9200', hours:'Mon–Fri 9am–5pm', flag:'🇵🇰' },
  { from:'Pakistan', to:'United States', name:'Embassy of Pakistan, Washington D.C.', address:'3517 International Ct NW, Washington DC 20008', phone:'+1 202 243 6500', hours:'Mon–Fri 9am–5pm', flag:'🇵🇰' },
  { from:'India', to:'United States', name:'Embassy of India, Washington D.C.', address:'2107 Massachusetts Ave NW, Washington DC 20008', phone:'+1 202 939 7000', hours:'Mon–Fri 9am–5:30pm', flag:'🇮🇳' },
  { from:'Nigeria', to:'United Kingdom', name:'Nigerian High Commission, London', address:'9 Northumberland Avenue, London WC2N 5BX', phone:'+44 20 7839 1244', hours:'Mon–Fri 9am–4pm', flag:'🇳🇬' },
  { from:'Philippines', to:'United States', name:'Philippine Embassy, Washington D.C.', address:'1600 Massachusetts Ave NW, Washington DC 20036', phone:'+1 202 467 9300', hours:'Mon–Fri 8:30am–5:30pm', flag:'🇵🇭' },
]
const NAV = [{ label:'Explore', href:'/destinations' },{ label:'Passport Strength', href:'/passport-strength' },{ label:'⚖️ Compare', href:'/compare' },{ label:'📋 Checklist', href:'/checklist' },{ label:'🏛️ Embassy Finder', href:'/embassy-finder' },{ label:'Blog', href:'/blog' }]
const FOOTER_COLS = [{ title:'Tools', links:[['Passport Strength','/passport-strength'],['Visa Comparison','/compare'],['Document Checklist','/checklist'],['Currency Converter','/currency-converter'],['Embassy Finder','/embassy-finder']] },{ title:'Company', links:[['About','/about'],['FAQ','/faq'],['Contact','/contact'],['Privacy','/privacy'],['Terms','/terms']] }] as const

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
          <div className="relative group">
            <button className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition flex items-center gap-1">Tools <span className="text-[10px]">▾</span></button>
            <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#16122f] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
              <Link href="/passport-strength" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">💪 Passport Strength</Link>
              <Link href="/compare" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">⚖️ Compare Visas</Link>
              <Link href="/checklist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">📋 Checklist</Link>
              <Link href="/processing-times" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">⏱️ Processing Times</Link>
              <Link href="/travel-insurance" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">🛡️ Travel Insurance</Link>
              <Link href="/embassy-finder" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">🏛️ Embassy Finder</Link>
              <Link href="/cost-calculator" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">💰 Cost Calculator</Link>
              <Link href="/currency-converter" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition">💱 Currency Converter</Link>
            </div>
          </div>
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
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-white/30 hover:text-white transition">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
          <p className="text-xs text-white/15">Always verify details with official embassy sources.</p>
        </div>
      </div>
    </footer>
  )
}

export default function EmbassyFinderPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [results, setResults] = useState<typeof EMBASSIES | null>(null)
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)

  const { countryName, loading: geoLoading } = useUserCountry()

  useEffect(() => {
    if (countryName && !geoLoading && !from) {
      // only pre-select if the country is in the COUNTRIES list
      if (COUNTRIES.includes(countryName)) setFrom(countryName)
    }
  }, [countryName, geoLoading, from])

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased">
      <Navbar />

      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.13),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 backdrop-blur-sm">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
            🏛️ Embassy Finder
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-white">Find Any Embassy</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-400 bg-clip-text text-transparent">Instantly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base text-white/45 sm:text-lg">Locate embassies and consulates worldwide with contact details and opening hours.</p>

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="rounded-xl bg-[#16122f] p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-indigo-500/40 focus-within:border-indigo-500/60 transition cursor-pointer">
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400">I am from</span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-lg">🌍</span>
                      <select value={from} onChange={e => { setFrom(e.target.value); setGeoBadgeDismissed(true) }} className="w-full appearance-none bg-transparent text-sm font-medium text-white outline-none" style={{ colorScheme:'dark' }}>
                        <option value="" className="bg-[#16122f] text-gray-400">{geoLoading ? '🌍 Detecting…' : 'Passport country'}</option>
                        {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#16122f] text-white">{c}</option>)}
                      </select>
                    </div>
                  </label>
                  {from && !geoBadgeDismissed && !geoLoading && (
                    <p className="mt-1 text-[10px] text-teal-400 flex items-center gap-1 px-1">
                      📍 Auto-detected
                      <button onClick={() => setGeoBadgeDismissed(true)} className="ml-1 text-white/30 hover:text-white/60">✕</button>
                    </p>
                  )}
                </div>
                <label className="block rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-indigo-500/40 focus-within:border-indigo-500/60 transition cursor-pointer">
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400">Looking for embassy in</span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <select value={to} onChange={e => setTo(e.target.value)} className="w-full appearance-none bg-transparent text-sm font-medium text-white outline-none" style={{ colorScheme:'dark' }}>
                      <option value="" className="bg-[#16122f] text-gray-400">Destination country</option>
                      {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#16122f] text-white">{c}</option>)}
                    </select>
                  </div>
                </label>
              </div>
              <button onClick={() => setResults(EMBASSIES.filter(e => e.from === from && e.to === to))} disabled={!from || !to}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-cyan-600 hover:shadow-teal-500/40 disabled:from-white/8 disabled:to-white/5 disabled:text-white/25 disabled:shadow-none disabled:cursor-not-allowed">
                🏛️ Find Embassy
              </button>
            </div>
          </div>
        </div>
      </section>

      {results !== null && (
        <section className="pb-24 px-4">
          <div className="mx-auto max-w-2xl space-y-4">
            {results.length === 0 ? (
              <div className="text-center rounded-2xl border border-white/8 bg-[#16122f] p-12">
                <div className="text-5xl mb-4">🏛️</div>
                <p className="font-semibold text-white/60">No embassy found for this combination.</p>
                <p className="mt-1 text-sm text-white/30">Try a different passport or destination country.</p>
              </div>
            ) : results.map((e, i) => (
              <div key={i} className="rounded-2xl border border-indigo-500/15 bg-[#16122f] p-5 hover:border-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-2xl border border-indigo-500/15">{e.flag}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{e.name}</h3>
                    <p className="mt-1.5 text-sm text-white/45">📍 {e.address}</p>
                    <p className="mt-0.5 text-sm text-white/45">📞 {e.phone}</p>
                    <p className="mt-0.5 text-sm text-teal-400 font-medium">🕐 {e.hours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
