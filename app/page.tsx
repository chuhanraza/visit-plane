'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// ----- Data -----
const COUNTRIES = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
]

const POPULAR_DESTINATIONS = [
  { code: 'ae', name: 'UAE', flag: '🇦🇪', visa: 'eVisa', tone: 'amber' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷', visa: 'eVisa', tone: 'amber' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵', visa: 'Visa Required', tone: 'rose' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧', visa: 'Visa Required', tone: 'rose' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬', visa: 'Visa Free', tone: 'emerald' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾', visa: 'Visa Free', tone: 'emerald' },
]

const STATS = [
  { value: '150+', label: 'Countries' },
  { value: '10K+', label: 'Visa Pages' },
  { value: 'Always', label: 'Free' },
  { value: 'Daily', label: 'Updated' },
]

const TRUST_ITEMS = [
  { icon: 'shield', label: 'Official data' },
  { icon: 'refresh', label: 'Updated daily' },
  { icon: 'globe', label: '195 countries' },
  { icon: 'gift', label: '100% free' },
]

// ----- Tone helpers -----
const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber:   'bg-amber-50 text-amber-700 ring-amber-200',
  rose:    'bg-rose-50 text-rose-700 ring-rose-200',
}

// ----- Icons -----
function TrustIcon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  switch (name) {
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'refresh':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      )
    case 'globe':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
        </svg>
      )
    case 'gift':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12v9H4v-9" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 21V7" />
          <path d="M12 7s-3-5-6-3 1 6 6 3Z" />
          <path d="M12 7s3-5 6-3-1 6-6 3Z" />
        </svg>
      )
    default:
      return null
  }
}

function ChevronDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function PlaneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  )
}

// ----- Page -----
export default function HomePage() {
  const router = useRouter()
  const [passport, setPassport] = useState('')
  const [destination, setDestination] = useState('')

  const canSubmit = passport && destination && passport !== destination

  const handleCheck = () => {
    if (!canSubmit) return
    router.push(`/visa/${passport}/${destination}`)
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased selection:bg-[#10B981]/20 selection:text-[#1A1A1A]">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1A1A1A]">Visit</span>
              <span className="text-[#10B981]">Plane</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/destinations" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">
              Destinations
            </Link>
            <Link href="/how-it-works" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">
              How it Works
            </Link>
            <Link href="/blog" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">
              Blog
            </Link>
          </nav>

          <Link
            href="/get-started"
            className="group inline-flex items-center gap-2 rounded-full bg-[#10B981] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#059669]"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FDF4] to-white">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.10),transparent_70%)] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pt-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-white px-3.5 py-1.5 text-xs font-medium text-[#10B981] shadow-sm">
              <span className="text-base leading-none">✦</span>
              <span>Trusted by 10,000+ Global Nomads</span>
              <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
            </div>

            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-[#1A1A1A] sm:text-6xl lg:text-7xl">
              <span className="block">The World&apos;s Visa Rules.</span>
              <span className="block bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#14B8A6] bg-clip-text text-transparent">
                Decoded in Seconds.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base text-gray-500 sm:text-lg">
              Stop guessing. Know exactly what you need to board your plane.
            </p>
          </div>

          {/* Search card */}
          <div className="relative mx-auto mt-12 max-w-3xl">
            <div className="relative rounded-3xl border border-[#10B981]/20 bg-[#F0FDF4] p-2 shadow-lg shadow-[#10B981]/10">
              <div className="rounded-[1.25rem] bg-white p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField
                    id="passport"
                    label="My Passport is from"
                    value={passport}
                    onChange={setPassport}
                    placeholder="Select your passport"
                    options={COUNTRIES}
                  />
                  <SelectField
                    id="destination"
                    label="Take me to"
                    value={destination}
                    onChange={setDestination}
                    placeholder="Select destination"
                    options={COUNTRIES}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!canSubmit}
                  className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-6 py-4 text-sm font-semibold text-white shadow-[0_6px_24px_-6px_rgba(16,185,129,0.5)] transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                >
                  Check Visa Requirements
                  <PlaneIcon className="h-4 w-4 transition group-enabled:group-hover:translate-x-0.5" />
                </button>

                {passport && destination && passport === destination && (
                  <p className="mt-3 text-center text-xs text-amber-600">
                    Please choose a different destination from your passport country.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#10B981]/15 bg-[#F0FDF4] shadow-sm">
            <dl className="grid grid-cols-2 divide-y divide-[#10B981]/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center justify-center px-4 py-5">
                  <dt className="text-2xl font-semibold tracking-tight text-[#10B981] sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="relative bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#10B981]">
                Popular right now
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
                Top destinations this week
              </h2>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Hand-picked countries travellers are checking the most. Tap any card for a full visa breakdown.
              </p>
            </div>
            <Link
              href="/destinations"
              className="group inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#10B981]"
            >
              Browse all destinations
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_DESTINATIONS.map((d) => (
              <Link
                key={d.code}
                href={`/visa/us/${d.code}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#10B981]/30 hover:shadow-md"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#10B981]/5 blur-3xl transition group-hover:bg-[#10B981]/10" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-gray-100 text-2xl">
                      {d.flag}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#1A1A1A]">{d.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-400">View visa details</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#10B981]" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[d.tone]}`}
                  >
                    {d.visa}
                  </span>
                  <span className="text-xs text-gray-400">Updated today</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUST_ITEMS.map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#10B981]">
                  <TrustIcon name={t.icon} className="h-4 w-4" />
                </span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="VisitPlane" width={20} height={20} className="rounded" />
            <span>
              <span className="text-gray-600">Visit</span>
              <span className="text-[#10B981]">Plane</span>
              <span className="ml-2">© {new Date().getFullYear()}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="transition hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="transition hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ----- Components -----
type Option = { code: string; name: string; flag: string }

function SelectField({
  id,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: Option[]
}) {
  const selected = options.find((o) => o.code === value)
  return (
    <label htmlFor={id} className="group relative block rounded-2xl border border-gray-200 bg-white p-4 transition focus-within:border-[#10B981]/60 focus-within:shadow-sm hover:border-gray-300">
      <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xl leading-none">{selected?.flag ?? '🌐'}</span>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent pr-7 text-base font-medium text-[#1A1A1A] outline-none"
        >
          <option value="" className="text-gray-400">
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.code} value={o.code} className="text-[#1A1A1A]">
              {o.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition group-focus-within:text-[#10B981]" />
      </div>
    </label>
  )
}
