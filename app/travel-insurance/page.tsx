'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function TravelInsurancePage() {
  const [dest, setDest] = useState('')
  const [dur, setDur] = useState('')
  const [count, setCount] = useState('1')
  const [cov, setCov] = useState('')

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
              <Field label="Destination">
                <select value={dest} onChange={e => setDest(e.target.value)} className={sel} style={{ colorScheme: 'dark' }}>
                  <option value="" className={opt}>Select destination country</option>
                  {DESTINATIONS.map(d => <option key={d} value={d} className={opt}>{d}</option>)}
                </select>
              </Field>
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
              <button className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-cyan-600 hover:shadow-teal-500/50 transition-all">
                Find Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#0a0820] pb-8 pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={28} height={28} className="rounded-xl" />
              <span className="text-base font-bold"><span className="text-white">Visit</span><span className="text-emerald-400">Plane</span></span>
            </Link>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {[['Destinations','/destinations'],['Blog','/blog'],['Checklist','/checklist'],['Privacy','/privacy'],['Terms','/terms'],['Contact','/contact']].map(([l,h]) => (
                <Link key={l} href={h} className="text-sm text-white/30 hover:text-white transition">{l}</Link>
              ))}
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
