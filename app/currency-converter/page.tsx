'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'

const CURR = ['USD','EUR','GBP','PKR','INR','AED','SAR','CAD','AUD','JPY','CNY','CHF','SGD','MYR','THB','TRY','EGP','NGN','BDT','PHP']
const PAIRS: [string,string][] = [['USD','PKR'],['USD','INR'],['USD','AED'],['GBP','PKR'],['EUR','PKR'],['SAR','PKR']]
const NAV = [
  { label: 'Explore', href: '/destinations' },
  { label: 'Visa Requirements', href: '/destinations' },
  { label: 'Passport Strength', href: '/passport-strength' },
  { label: '⚖️ Compare Visas', href: '/compare' },
  { label: '📋 Checklist', href: '/checklist' },
  { label: 'Guides', href: '/blog' },
]
const sel = "w-full appearance-none bg-transparent text-sm font-medium text-[#0f0c29] outline-none"
const opt = "bg-white"

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('1')
  const [fromCur, setFrom] = useState('USD')
  const [toCur, setTo] = useState('PKR')
  const [result, setResult] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState('')
  const [pairRates, setPairRates] = useState<Record<string,number>>({})
  const swap = () => { const t = fromCur; setFrom(toCur); setTo(t); setResult(null); setRate(null); setUpdated('') }
  useEffect(() => {
    const fetchPopularRates = async () => {
      for (const base of [...new Set(PAIRS.map(([f]) => f))]) {
        try {
          const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`)
          const data = await res.json()
          const d = data[base.toLowerCase()]
          PAIRS.filter(([f]) => f === base).forEach(([f, t]) =>
            setPairRates(p => ({ ...p, [`${f}-${t}`]: d[t.toLowerCase()] }))
          )
        } catch (e) { console.error('Popular rates fetch error:', e) }
      }
    }
    fetchPopularRates()
  }, [])

  const convert = async () => {
    setLoading(true); setError(''); setResult(null); setRate(null); setUpdated('')
    try {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCur.toLowerCase()}.json`)
      const data = await res.json()
      const r = data[fromCur.toLowerCase()][toCur.toLowerCase()]
      if (!r) throw new Error('Rate not found')
      setRate(r); setResult(parseFloat(amount) * r); setUpdated(data.date)
    } catch { setError('Could not fetch rates. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      <ToolBreadcrumb toolName="Currency Converter" toolEmoji="💱" />
      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-10 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 inline-flex" />
            💱 Travel Currency Converter
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl leading-tight">
            <span className="text-[#0f0c29]">Know Your Money</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Before You Go</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base text-gray-500 sm:text-lg">Real-time exchange rates for 200+ currencies. Always free, always accurate.</p>
        </div>
      </section>

      {/* CONVERTER CARD */}
      <section className="pb-28">
        <div className="mx-auto max-w-xl px-4">
          <div className="relative rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
            <div className="relative rounded-xl bg-white p-5 space-y-4">
              <label className="block rounded-xl border border-gray-200 bg-white/5 p-3.5 hover:border-indigo-500/40 transition cursor-pointer">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-1.5">Amount</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" placeholder="1.00"
                  className="w-full bg-transparent text-sm font-medium text-[#0f0c29] outline-none placeholder-white/20" />
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 rounded-xl border border-gray-200 bg-white/5 p-3.5 hover:border-indigo-500/40 transition cursor-pointer">
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-1.5">From</span>
                  <select value={fromCur} onChange={e => setFrom(e.target.value)} className={sel} style={{ colorScheme: 'dark' }}>
                    {CURR.map(c => <option key={c} value={c} className={opt}>{c}</option>)}
                  </select>
                </label>
                <button onClick={swap} className="mt-4 flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition font-bold text-lg">⇄</button>
                <label className="flex-1 rounded-xl border border-gray-200 bg-white/5 p-3.5 hover:border-indigo-500/40 transition cursor-pointer">
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-1.5">To</span>
                  <select value={toCur} onChange={e => setTo(e.target.value)} className={sel} style={{ colorScheme: 'dark' }}>
                    {CURR.map(c => <option key={c} value={c} className={opt}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {[100,500,1000,5000,10000].map(n => (
                  <button key={n} onClick={() => setAmount(String(n))} className="rounded-lg border border-gray-200 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-white transition">{n.toLocaleString()}</button>
                ))}
              </div>
              <button onClick={convert} disabled={loading || !amount}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Converting…' : 'Convert'}
              </button>
              <p className="text-center text-[10px] text-white/25">Rates updated daily via European Central Bank</p>
              {error && <p className="text-center text-xs text-red-400">{error}</p>}
              {result !== null && rate !== null && (
                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-center">
                  <p className="text-2xl font-extrabold text-[#0f0c29]">
                    {result.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-teal-400">{toCur}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">1 {fromCur} = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCur}</p>
                  {updated && <p className="mt-2 text-[10px] text-gray-300">Last updated: {updated}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR PAIRS */}
      <section className="pb-10">
        <div className="mx-auto max-w-xl px-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Popular Pairs</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PAIRS.map(([f,t]) => (
              <button key={`${f}-${t}`} onClick={() => { setFrom(f); setTo(t); setResult(null); setRate(null); setUpdated('') }}
                className="rounded-xl border border-gray-200 bg-white p-3 text-left hover:border-indigo-500/30 hover:bg-white/[0.07] transition">
                <p className="text-xs font-bold text-[#0f0c29]">{f} → {t}</p>
                <p className="mt-1 text-sm font-semibold text-teal-400">{pairRates[`${f}-${t}`] ? pairRates[`${f}-${t}`].toLocaleString(undefined,{maximumFractionDigits:2}) : '…'}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRAVEL TIPS */}
      <section className="pb-24">
        <div className="mx-auto max-w-xl px-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Travel Money Tips</p>
          <div className="grid gap-2">
            {['Exchange at bank for best rates','Avoid airport exchange counters','Always pay in local currency abroad'].map(tip => (
              <div key={tip} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <span>💡</span><p className="text-sm text-gray-500">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section></div>
  )
}
