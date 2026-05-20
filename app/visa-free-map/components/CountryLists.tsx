'use client'
import Link from 'next/link'
import { ALL_COUNTRIES } from '@/components/CountrySelect'

const FLAG_MAP = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c.flag]))

// Flags for DB-specific names
const EXTRA_FLAGS: Record<string, string> = {
  'uae': '🇦🇪', 'dr congo': '🇨🇩', 'republic of the congo': '🇨🇬',
  'ivory coast': '🇨🇮', 'north korea': '🇰🇵', 'south korea': '🇰🇷',
  'czech republic': '🇨🇿',
}

function getFlag(name: string): string {
  return FLAG_MAP[name.toLowerCase()] ?? EXTRA_FLAGS[name.toLowerCase()] ?? '🌍'
}

export interface VisaCountry { name: string; processing_time?: string | null; fee?: string | null }

interface Props {
  passport: string
  visaFree: VisaCountry[]
  onArrival: VisaCountry[]
  required: VisaCountry[]
}

function CountryRow({ name, passport, badge }: { name: string; passport: string; badge: React.ReactNode }) {
  return (
    <Link
      href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(name)}`}
      className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:border-teal-500/30 hover:bg-white/[0.06] transition group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xl flex-shrink-0">{getFlag(name)}</span>
        <span className="text-sm font-semibold text-white/80 truncate group-hover:text-white transition">{name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge}
        <span className="text-white/20 text-xs group-hover:text-teal-400 transition">→</span>
      </div>
    </Link>
  )
}

export default function CountryLists({ passport, visaFree, onArrival, required }: Props) {
  const freeTop = visaFree.slice(0, 10)
  const arrivalTop = onArrival.slice(0, 10)
  const fastVisa = required
    .filter(c => c.processing_time)
    .slice(0, 10)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Column 1: Visa Free */}
      <div>
        <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
          ✈️ Top Visa-Free Destinations
        </h3>
        <div className="space-y-2">
          {freeTop.map(c => (
            <CountryRow key={c.name} name={c.name} passport={passport}
              badge={<span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Visa Free</span>} />
          ))}
          {freeTop.length === 0 && <p className="text-sm text-white/30 text-center py-4">No data</p>}
        </div>
      </div>

      {/* Column 2: On Arrival */}
      <div>
        <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
          🌏 Visa on Arrival
        </h3>
        <div className="space-y-2">
          {arrivalTop.map(c => (
            <CountryRow key={c.name} name={c.name} passport={passport}
              badge={<span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">On Arrival</span>} />
          ))}
          {arrivalTop.length === 0 && <p className="text-sm text-white/30 text-center py-4">No data</p>}
        </div>
      </div>

      {/* Column 3: Easy Visa */}
      <div>
        <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
          📋 Easy to Get Visa
        </h3>
        <div className="space-y-2">
          {fastVisa.map(c => (
            <CountryRow key={c.name} name={c.name} passport={passport}
              badge={<span className="text-[10px] text-white/40 truncate max-w-[80px]">{c.processing_time}</span>} />
          ))}
          {fastVisa.length === 0 && (
            required.slice(0, 10).map(c => (
              <CountryRow key={c.name} name={c.name} passport={passport}
                badge={<span className="text-[10px] font-bold bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded-full">Visa Req.</span>} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
