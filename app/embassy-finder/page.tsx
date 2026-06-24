'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserCountry } from '@/hooks/useUserCountry'
import CountrySelect from '@/components/CountrySelect'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import OfficialSourceLink from '@/components/visa/OfficialSourceLink'

// ─────────────────────────────────────────────────────────────────────────────
// Embassy data. Field meaning (read carefully — the direction matters):
//   ofCountry  = the country the mission BELONGS to → the DESTINATION you apply to visit
//   inCountry  = where the mission is physically LOCATED → the applicant's HOME country
// So "Pakistan High Commission, London" is the mission OF Pakistan, located IN the
// United Kingdom — i.e. what a UK resident uses to apply to visit Pakistan.
// We only store real, verified missions; missing routes get an honest fallback.
// ─────────────────────────────────────────────────────────────────────────────
const EMBASSIES = [
  { ofCountry:'Pakistan',    inCountry:'United Kingdom', name:'Pakistan High Commission, London',     address:'35-36 Lowndes Square, London SW1X 9JN',        phone:'+44 20 7664 9200', hours:'Mon–Fri 9am–5pm',    flag:'🇵🇰' },
  { ofCountry:'Pakistan',    inCountry:'United States',  name:'Embassy of Pakistan, Washington D.C.',  address:'3517 International Ct NW, Washington DC 20008', phone:'+1 202 243 6500',  hours:'Mon–Fri 9am–5pm',    flag:'🇵🇰' },
  { ofCountry:'India',       inCountry:'United States',  name:'Embassy of India, Washington D.C.',     address:'2107 Massachusetts Ave NW, Washington DC 20008', phone:'+1 202 939 7000', hours:'Mon–Fri 9am–5:30pm', flag:'🇮🇳' },
  { ofCountry:'Nigeria',     inCountry:'United Kingdom', name:'Nigerian High Commission, London',      address:'9 Northumberland Avenue, London WC2N 5BX',     phone:'+44 20 7839 1244', hours:'Mon–Fri 9am–4pm',    flag:'🇳🇬' },
  { ofCountry:'Philippines', inCountry:'United States',  name:'Philippine Embassy, Washington D.C.',   address:'1600 Massachusetts Ave NW, Washington DC 20036', phone:'+1 202 467 9300', hours:'Mon–Fri 8:30am–5:30pm', flag:'🇵🇭' },
]

const COUNTRIES = ['India','Nigeria','Pakistan','Philippines','United Kingdom','United States']



export default function EmbassyFinderPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [results, setResults] = useState<typeof EMBASSIES | null>(null)
  const [query, setQuery] = useState<{ home: string; destination: string } | null>(null)
  const [geoBadgeDismissed, setGeoBadgeDismissed] = useState(false)

  // Correct direction: the DESTINATION country's embassy/consulate located in the
  // applicant's HOME country. `from` = home, `to` = destination.
  const runSearch = () => {
    setQuery({ home: from, destination: to })
    setResults(EMBASSIES.filter(e => e.ofCountry === to && e.inCountry === from))
  }

  const { countryName, loading: geoLoading } = useUserCountry()

  useEffect(() => {
    if (countryName && !geoLoading && !from) {
      // only pre-select if the country is in the COUNTRIES list
      if (COUNTRIES.includes(countryName)) setFrom(countryName)
    }
  }, [countryName, geoLoading, from])

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <ToolBreadcrumb toolName="Embassy Finder" toolEmoji="🏛️" />
      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.13),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 backdrop-blur-sm">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
            🏛️ Embassy Finder
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-[#0f0c29]">Find Any Embassy</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-400 bg-clip-text text-transparent">Instantly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base text-gray-500 sm:text-lg">Find the embassy or consulate of the country you want to visit, located in your home country — with contact details and opening hours.</p>

          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="rounded-xl bg-white p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-400">I live in (home country)</p>
                  <CountrySelect
                    value={from}
                    onChange={(v) => { setFrom(v); setGeoBadgeDismissed(true) }}
                    placeholder={geoLoading ? '🌍 Detecting…' : 'Your home country'}
                  />
                  {from && !geoBadgeDismissed && !geoLoading && (
                    <p className="mt-1 text-[10px] text-teal-400 flex items-center gap-1 px-1">
                      📍 Auto-detected
                      <button onClick={() => setGeoBadgeDismissed(true)} className="ml-1 text-gray-400 hover:text-gray-500">✕</button>
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-400">I want to visit</p>
                  <CountrySelect
                    value={to}
                    onChange={setTo}
                    placeholder="Destination country"
                  />
                </div>
              </div>
              <button onClick={runSearch} disabled={!from || !to}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-cyan-600 hover:shadow-teal-500/40 disabled:from-white/8 disabled:to-white/5 disabled:text-white/25 disabled:shadow-none disabled:cursor-not-allowed">
                🏛️ Find Embassy
              </button>
            </div>
          </div>
        </div>
      </section>

      {results !== null && query && (
        <section className="pb-24 px-4">
          <div className="mx-auto max-w-2xl space-y-4">
            {results.length > 0 && (
              <p className="text-center text-sm text-gray-500">
                The <span className="font-semibold text-[#0f0c29]">{query.destination}</span> embassy / consulate in{' '}
                <span className="font-semibold text-[#0f0c29]">{query.home}</span> — where {query.home}-based applicants
                apply for a {query.destination} visa.
              </p>
            )}
            {results.length === 0 ? (
              <>
                <div className="text-center rounded-2xl border border-gray-100 bg-white p-10">
                  <div className="text-5xl mb-4">🏛️</div>
                  <p className="font-semibold text-gray-600">
                    We don&apos;t have verified embassy details for {query.destination} in {query.home} yet.
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    To apply for a {query.destination} visa, you&apos;ll typically contact the{' '}
                    <span className="font-medium text-gray-500">{query.destination} embassy or consulate located in {query.home}</span>.
                    Search{' '}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`${query.destination} embassy in ${query.home}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-medium hover:underline"
                    >
                      &ldquo;{query.destination} embassy in {query.home}&rdquo;
                    </a>{' '}
                    or check the official source below.
                  </p>
                </div>
                <OfficialSourceLink destinationName={query.destination} homeCountry={query.home} />
              </>
            ) : results.map((e, i) => (
              <div key={i} className="rounded-2xl border border-indigo-500/15 bg-white p-5 hover:border-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-2xl border border-indigo-500/15">{e.flag}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#0f0c29]">{e.name}</h3>
                    <p className="mt-0.5 text-xs font-medium text-indigo-400">Embassy of {e.ofCountry} · located in {e.inCountry}</p>
                    <p className="mt-1.5 text-sm text-gray-500">📍 {e.address}</p>
                    <p className="mt-0.5 text-sm text-gray-500">📞 {e.phone}</p>
                    <p className="mt-0.5 text-sm text-teal-400 font-medium">🕐 {e.hours}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}    </div>
  )
}
