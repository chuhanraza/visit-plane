'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CountrySelect from '@/components/CountrySelect'

const DESTINATIONS = ['Australia','Canada','France','Germany','Italy','Japan','Spain','UAE','United Kingdom','United States']
const DURATIONS = ['1 Week','2 Weeks','1 Month','3 Months']
const COVERAGES = ['Basic','Standard','Premium']
const NAV = [
  { label: 'Explore', href: '/destinations' },
  { label: 'Visa Requirements', href: '/destinations' },
  { label: 'Passport Strength', href: '/passport-strength' },
  { label: '⚖️ Compare Visas', href: '/compare' },
  { label: '📋 Checklist', href: '/checklist' },
  { label: 'Guides', href: '/blog' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-indigo-500/40 transition cursor-pointer">
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

const sel = "w-full appearance-none bg-transparent text-sm font-medium text-white outline-none"
const opt = "bg-[#16122f]"

const PLANS = [
  { name: 'Basic',    price: '$15', medical: '$50K',  popular: false, bullets: ['Medical coverage up to $50K', 'Emergency evacuation', 'Trip cancellation'] },
  { name: 'Standard', price: '$25', medical: '$100K', popular: true,  bullets: ['Medical coverage up to $100K', 'Emergency evacuation', 'Trip cancellation + delay'] },
  { name: 'Premium',  price: '$45', medical: '$500K', popular: false, bullets: ['Medical coverage up to $500K', 'Emergency evacuation', 'Cancel for any reason'] },
]

export default function TravelInsurancePage() {
  const [dest, setDest] = useState('')
  const [dur, setDur] = useState('')
  const [count, setCount] = useState('1')
  const [cov, setCov] = useState('')
  const [shown, setShown] = useState(false)

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30">
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
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(item => (
              <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/5 hover:text-white transition">{item.label}</Link>
            ))}
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
          <Link href="/destinations" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-px transition">
            Check Visa <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-10 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute -left-40 top-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07),transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 inline-flex" />
            🛡️ Travel Insurance Finder
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.5rem] leading-tight">
            <span className="text-white">Travel Protected,</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Travel Smart</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-white/45 sm:text-lg">Compare travel insurance plans instantly</p>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="pb-28">
        <div className="mx-auto max-w-xl px-4">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
            <div className="relative rounded-xl bg-[#16122f] p-5 space-y-4">
              <CountrySelect
                value={dest}
                onChange={setDest}
                placeholder="Select destination country"
                label="Destination Country"
              />
              <Field label="Trip Duration">
                <select value={dur} onChange={e => setDur(e.target.value)} className={sel} style={{ colorScheme: 'dark' }}>
                  <option value="" className={opt}>Select duration</option>
                  {DURATIONS.map(d => <option key={d} value={d} className={opt}>{d}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Travelers">
                  <select value={count} onChange={e => setCount(e.target.value)} className={sel} style={{ colorScheme: 'dark' }}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n} className={opt}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>)}
                  </select>
                </Field>
                <Field label="Coverage">
                  <select value={cov} onChange={e => setCov(e.target.value)} className={sel} style={{ colorScheme: 'dark' }}>
                    <option value="" className={opt}>Select plan</option>
                    {COVERAGES.map(c => <option key={c} value={c} className={opt}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <button onClick={() => setShown(true)} className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-cyan-600 hover:shadow-teal-500/50 transition-all">
                Find Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      {shown && (
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {PLANS.map(p => (
                <div key={p.name} className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${p.popular ? 'border-teal-500/50 bg-teal-500/8' : 'border-white/10 bg-white/[0.04]'}`}>
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3 py-1 text-[10px] font-bold text-white whitespace-nowrap shadow-lg shadow-teal-500/30">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">{p.name}</p>
                    <p className="mt-1 text-2xl font-extrabold text-white">
                      {p.price}<span className="text-sm font-normal text-white/40">/week</span>
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">Medical up to {p.medical}</p>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {p.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2 text-xs text-white/60">
                        <span className="text-teal-400 mt-px shrink-0">✓</span>{b}
                      </li>
                    ))}
                  </ul>
                  <a href="https://worldnomads.com" target="_blank" rel="noopener noreferrer"
                    className={`block text-center rounded-xl py-2.5 text-sm font-bold transition-all ${p.popular ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/25' : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}>
                    Get Quote
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-[11px] text-white/25">VisitPlane may earn commission from purchases made through these links.</p>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="col-span-2">
              <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
                <Image src="/logo-v2.png" alt="VisitPlane" width={32} height={32} className="rounded-xl" />
                <span className="text-lg font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-white/30">The world&apos;s visa requirements, decoded in seconds. Free, fast, and always updated.</p>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Tools</h4>
              <ul className="space-y-2.5">
                {[['Passport Strength','/passport-strength'],['Visa Comparison','/compare'],['Document Checklist','/checklist'],['Currency Converter','/currency-converter'],['Embassy Finder','/embassy-finder']].map(([l,h]) => (
                  <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Company</h4>
              <ul className="space-y-2.5">
                {[['About','/about'],['FAQ','/faq'],['Contact','/contact'],['Privacy','/privacy'],['Terms','/terms']].map(([l,h]) => (
                  <li key={l}><Link href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Always verify requirements with official embassy sources.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
