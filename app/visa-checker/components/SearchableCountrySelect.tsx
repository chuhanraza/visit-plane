'use client'
import { useState, useRef, useEffect } from 'react'
import { COUNTRIES, FLAGS } from '../data'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder: string
  excludeCountry?: string
}

export default function SearchableCountrySelect({ value, onChange, placeholder, excludeCountry }: Props) {
  const [query, setQuery]     = useState('')
  const [isOpen, setIsOpen]   = useState(false)
  const containerRef          = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = COUNTRIES.filter(c =>
    c !== excludeCountry && c.toLowerCase().includes(query.toLowerCase())
  )

  const select = (country: string) => {
    onChange(country)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input row */}
      <div
        className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3.5 cursor-text transition-colors ${
          isOpen ? 'border-teal-500 shadow-sm shadow-teal-100' : 'border-gray-200 hover:border-teal-300'
        }`}
        onClick={() => { setIsOpen(true) }}
      >
        <span className="text-2xl shrink-0">{value ? (FLAGS[value] ?? '🌍') : '🌍'}</span>
        <input
          type="text"
          placeholder={value || placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => { setIsOpen(true); setQuery('') }}
          className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder-gray-400"
        />
        {value && !query && (
          <span className="absolute left-[68px] text-sm font-medium text-gray-800 pointer-events-none">{value}</span>
        )}
        <svg className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-200 bg-white shadow-xl max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">No countries found</div>
          ) : (
            filtered.slice(0, 80).map(country => (
              <button
                key={country}
                onMouseDown={e => { e.preventDefault(); select(country) }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  country === value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <span className="text-xl shrink-0">{FLAGS[country] ?? '🌍'}</span>
                <span>{country}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
