'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'

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
  const inp = 'w-full rounded-xl border border-gray-200 bg-white/5 px-4 py-2.5 text-sm text-[#0f0c29] placeholder-white/25 outline-none focus:border-teal-500/60 focus:bg-white/8 transition'
  const lbl = 'block text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-1.5'

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <ToolBreadcrumb toolName="Visa Tracker" toolEmoji="📊" />
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)', backgroundSize:'64px 64px' }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-400 mb-6">📊 Visa Application Tracker</div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[#0f0c29]">Track Your Visa</span><br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Application Journey</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-gray-500">Monitor every step from application to approval. Never miss a deadline again.</p>
        </div>
      </section>

      {/* FORM */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 backdrop-blur-sm shadow-2xl shadow-gray-200">
            <h2 className="text-lg font-bold text-[#0f0c29] mb-6">Add New Application</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={lbl}>Destination Country</label>
                <div className="relative">
                  {form.country && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">{FLAGS[form.country]??'🌍'}</span>}
                  <select value={form.country} onChange={e => set('country',e.target.value)} className={`${inp} ${form.country?'pl-9':''} appearance-none`} style={{colorScheme:'dark'}}>
                    <option value="" className="bg-white text-gray-400">Select country…</option>
                    {COUNTRIES.map(c => <option key={c} value={c} className="bg-white text-[#0f0c29]">{FLAGS[c]??'🌍'} {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Visa Type</label>
                <select value={form.visaType} onChange={e => set('visaType',e.target.value)} className={`${inp} appearance-none`} style={{colorScheme:'dark'}}>
                  <option value="" className="bg-white text-gray-400">Select type…</option>
                  {VISA_TYPES.map(t => <option key={t} value={t} className="bg-white text-[#0f0c29]">{t}</option>)}
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
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/[0.02] py-16 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-3xl">📋</div>
            <p className="text-base font-semibold text-gray-500">No applications tracked yet.</p>
            <p className="mt-1.5 text-sm text-gray-400">Add your first visa application above!</p>
          </div>
        </div>
      </section></div>
  )
}
