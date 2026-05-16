'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bahrain','Bangladesh','Belgium',
  'Brazil','Canada','Chile','China','Colombia','Croatia','Czech Republic','Denmark','Egypt','Ethiopia',
  'Finland','France','Georgia','Germany','Ghana','Greece','Hungary','India','Indonesia','Iran','Ireland',
  'Israel','Italy','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Malaysia','Mexico','Morocco','Nepal',
  'Netherlands','New Zealand','Nigeria','Norway','Oman','Pakistan','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Saudi Arabia','Singapore','South Africa','South Korea','Spain',
  'Sri Lanka','Sweden','Switzerland','Taiwan','Thailand','Turkey','UAE','Ukraine','United Kingdom',
  'United States','Vietnam','Zimbabwe',
].sort()

const FLAGS: Record<string,string> = {
  'Australia':'🇦🇺','Canada':'🇨🇦','China':'🇨🇳','Egypt':'🇪🇬','France':'🇫🇷','Germany':'🇩🇪','India':'🇮🇳',
  'Japan':'🇯🇵','Malaysia':'🇲🇾','Morocco':'🇲🇦','Netherlands':'🇳🇱','Nigeria':'🇳🇬','Oman':'🇴🇲',
  'Pakistan':'🇵🇰','Philippines':'🇵🇭','Portugal':'🇵🇹','Qatar':'🇶🇦','Saudi Arabia':'🇸🇦',
  'Singapore':'🇸🇬','South Korea':'🇰🇷','Spain':'🇪🇸','Sri Lanka':'🇱🇰','Thailand':'🇹🇭',
  'Turkey':'🇹🇷','UAE':'🇦🇪','United Kingdom':'🇬🇧','United States':'🇺🇸','Vietnam':'🇻🇳',
}
const VISA_TYPES = ['Tourist','Business','Student','Work']
const NAV_TOOLS = [['⚖️ Compare Visas','/compare'],['📋 Checklist','/checklist'],['⏱️ Processing Times','/processing-times'],['🛡️ Travel Insurance','/travel-insurance'],['💱 Currency Converter','/currency-converter'],['🏛️ Embassy Finder','/embassy-finder'],['💪 Passport Strength','/passport-strength'],['📊 Visa Tracker','/visa-tracker']]

export default function VisaTrackerPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [form, setForm] = useState({ country:'', visaType:'', date:'', ref:'', notes:'' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-teal-500/60 focus:bg-white/8 transition'
  const lbl = 'block text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1.5'

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased">
      <header className="sticky top-0 z-50 bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative"><div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" /><Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" /></div>
            <span className="text-lg font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Explore</Link>
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">
                Tools <svg className={`h-3.5 w-3.5 transition-transform ${toolsOpen?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {toolsOpen && <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f0c29]/98 backdrop-blur-xl shadow-2xl py-1.5">{NAV_TOOLS.map(([l,h]) => <Link key={l} href={h} onClick={() => setToolsOpen(false)} className="block px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">{l}</Link>)}</div>}
            </div>
            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition">
              Check Visa <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-white/55 hover:bg-white/5 md:hidden transition">
              {menuOpen ? <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>}
            </button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-white/5 bg-[#060C18]/98 md:hidden px-4 py-4 space-y-1">{[['Explore','/destinations'],['Blog','/blog'],['Visa Tracker','/visa-tracker']].map(([l,h]) => <Link key={l} href={h} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition">{l}</Link>)}</div>}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)', backgroundSize:'64px 64px' }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400 mb-6">📊 Visa Application Tracker</div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-white">Track Your Visa</span><br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Application Journey</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-white/45">Monitor every step from application to approval. Never miss a deadline again.</p>
        </div>
      </section>

      {/* FORM */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-sm shadow-2xl shadow-black/40">
            <h2 className="text-lg font-bold text-white mb-6">Add New Application</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={lbl}>Destination Country</label>
                <div className="relative">
                  {form.country && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">{FLAGS[form.country]??'🌍'}</span>}
                  <select value={form.country} onChange={e => set('country',e.target.value)} className={`${inp} ${form.country?'pl-9':''} appearance-none`} style={{colorScheme:'dark'}}>
                    <option value="" className="bg-[#16122f] text-gray-400">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#16122f] text-white">{FLAGS[c]??'🌍'} {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Visa Type</label>
                <select value={form.visaType} onChange={e => set('visaType',e.target.value)} className={`${inp} appearance-none`} style={{colorScheme:'dark'}}>
                  <option value="" className="bg-[#16122f] text-gray-400">Select type…</option>
                  {VISA_TYPES.map(t => <option key={t} value={t} className="bg-[#16122f] text-white">{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Application Date</label>
                <input type="date" value={form.date} onChange={e => set('date',e.target.value)} className={inp} style={{colorScheme:'dark'}} />
              </div>
              <div>
                <label className={lbl}>Reference Number</label>
                <input type="text" value={form.ref} onChange={e => set('ref',e.target.value)} placeholder="e.g. VISA-2024-00123" className={inp} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes',e.target.value)} placeholder="Any additional notes about your application…" rows={3} className={`${inp} resize-none`} />
              </div>
            </div>
            <button type="button" className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-cyan-600 transition-all">+ Add Application</button>
          </div>

          {/* EMPTY STATE */}
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-3xl">📋</div>
            <p className="text-base font-semibold text-white/60">No applications tracked yet.</p>
            <p className="mt-1.5 text-sm text-white/30">Add your first visa application above!</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="mb-4 inline-flex items-center gap-2.5"><Image src="/logo-v2.png" alt="VisitPlane" width={32} height={32} className="rounded-xl" /><span className="text-lg font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span></Link>
              <p className="max-w-xs text-sm leading-relaxed text-white/30">The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.</p>
            </div>
            {([{title:'Explore',links:[['Destinations','/destinations'],['Blog','/blog'],['FAQ','/faq']]},{title:'Tools',links:[['Checklist','/checklist'],['Embassy Finder','/embassy-finder'],['Visa Tracker','/visa-tracker']]},{title:'Company',links:[['About','/about'],['Privacy','/privacy'],['Contact','/contact']]}] as {title:string,links:[string,string][]}[]).map(col => (
              <div key={col.title}><h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">{col.title}</h4><ul className="space-y-2.5">{col.links.map(([l,h]) => <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>)}</ul></div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Visa data is estimated. Always verify with official embassy sources.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
