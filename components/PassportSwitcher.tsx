'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Canonical passport list (name + flag) ─────────────────────────────────
export const PASSPORT_LIST: { name: string; flag: string }[] = [
  { name: 'Afghanistan', flag: '🇦🇫' }, { name: 'Albania', flag: '🇦🇱' },
  { name: 'Algeria', flag: '🇩🇿' }, { name: 'Andorra', flag: '🇦🇩' },
  { name: 'Angola', flag: '🇦🇴' }, { name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { name: 'Argentina', flag: '🇦🇷' }, { name: 'Armenia', flag: '🇦🇲' },
  { name: 'Australia', flag: '🇦🇺' }, { name: 'Austria', flag: '🇦🇹' },
  { name: 'Azerbaijan', flag: '🇦🇿' }, { name: 'Bahamas', flag: '🇧🇸' },
  { name: 'Bahrain', flag: '🇧🇭' }, { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Barbados', flag: '🇧🇧' }, { name: 'Belarus', flag: '🇧🇾' },
  { name: 'Belgium', flag: '🇧🇪' }, { name: 'Belize', flag: '🇧🇿' },
  { name: 'Benin', flag: '🇧🇯' }, { name: 'Bhutan', flag: '🇧🇹' },
  { name: 'Bolivia', flag: '🇧🇴' }, { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Botswana', flag: '🇧🇼' }, { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Brunei', flag: '🇧🇳' }, { name: 'Bulgaria', flag: '🇧🇬' },
  { name: 'Burkina Faso', flag: '🇧🇫' }, { name: 'Burundi', flag: '🇧🇮' },
  { name: 'Cambodia', flag: '🇰🇭' }, { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Canada', flag: '🇨🇦' }, { name: 'Cape Verde', flag: '🇨🇻' },
  { name: 'Central African Republic', flag: '🇨🇫' }, { name: 'Chad', flag: '🇹🇩' },
  { name: 'Chile', flag: '🇨🇱' }, { name: 'China', flag: '🇨🇳' },
  { name: 'Colombia', flag: '🇨🇴' }, { name: 'Comoros', flag: '🇰🇲' },
  { name: 'Costa Rica', flag: '🇨🇷' }, { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Cuba', flag: '🇨🇺' }, { name: 'Cyprus', flag: '🇨🇾' },
  { name: 'Czech Republic', flag: '🇨🇿' }, { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Djibouti', flag: '🇩🇯' }, { name: 'Dominica', flag: '🇩🇲' },
  { name: 'Dominican Republic', flag: '🇩🇴' }, { name: 'DR Congo', flag: '🇨🇩' },
  { name: 'Ecuador', flag: '🇪🇨' }, { name: 'Egypt', flag: '🇪🇬' },
  { name: 'El Salvador', flag: '🇸🇻' }, { name: 'Equatorial Guinea', flag: '🇬🇶' },
  { name: 'Eritrea', flag: '🇪🇷' }, { name: 'Estonia', flag: '🇪🇪' },
  { name: 'Eswatini', flag: '🇸🇿' }, { name: 'Ethiopia', flag: '🇪🇹' },
  { name: 'Fiji', flag: '🇫🇯' }, { name: 'Finland', flag: '🇫🇮' },
  { name: 'France', flag: '🇫🇷' }, { name: 'Gabon', flag: '🇬🇦' },
  { name: 'Gambia', flag: '🇬🇲' }, { name: 'Georgia', flag: '🇬🇪' },
  { name: 'Germany', flag: '🇩🇪' }, { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Greece', flag: '🇬🇷' }, { name: 'Grenada', flag: '🇬🇩' },
  { name: 'Guatemala', flag: '🇬🇹' }, { name: 'Guinea', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', flag: '🇬🇼' }, { name: 'Guyana', flag: '🇬🇾' },
  { name: 'Haiti', flag: '🇭🇹' }, { name: 'Honduras', flag: '🇭🇳' },
  { name: 'Hungary', flag: '🇭🇺' }, { name: 'Iceland', flag: '🇮🇸' },
  { name: 'India', flag: '🇮🇳' }, { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Iran', flag: '🇮🇷' }, { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Ireland', flag: '🇮🇪' }, { name: 'Israel', flag: '🇮🇱' },
  { name: 'Italy', flag: '🇮🇹' }, { name: 'Jamaica', flag: '🇯🇲' },
  { name: 'Japan', flag: '🇯🇵' }, { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Kazakhstan', flag: '🇰🇿' }, { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Kiribati', flag: '🇰🇮' }, { name: 'Kosovo', flag: '🇽🇰' },
  { name: 'Kuwait', flag: '🇰🇼' }, { name: 'Kyrgyzstan', flag: '🇰🇬' },
  { name: 'Laos', flag: '🇱🇦' }, { name: 'Latvia', flag: '🇱🇻' },
  { name: 'Lebanon', flag: '🇱🇧' }, { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'Liberia', flag: '🇱🇷' }, { name: 'Libya', flag: '🇱🇾' },
  { name: 'Liechtenstein', flag: '🇱🇮' }, { name: 'Lithuania', flag: '🇱🇹' },
  { name: 'Luxembourg', flag: '🇱🇺' }, { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Malawi', flag: '🇲🇼' }, { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Maldives', flag: '🇲🇻' }, { name: 'Mali', flag: '🇲🇱' },
  { name: 'Malta', flag: '🇲🇹' }, { name: 'Marshall Islands', flag: '🇲🇭' },
  { name: 'Mauritania', flag: '🇲🇷' }, { name: 'Mauritius', flag: '🇲🇺' },
  { name: 'Mexico', flag: '🇲🇽' }, { name: 'Micronesia', flag: '🇫🇲' },
  { name: 'Moldova', flag: '🇲🇩' }, { name: 'Monaco', flag: '🇲🇨' },
  { name: 'Mongolia', flag: '🇲🇳' }, { name: 'Montenegro', flag: '🇲🇪' },
  { name: 'Morocco', flag: '🇲🇦' }, { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'Myanmar', flag: '🇲🇲' }, { name: 'Namibia', flag: '🇳🇦' },
  { name: 'Nauru', flag: '🇳🇷' }, { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Netherlands', flag: '🇳🇱' }, { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Nicaragua', flag: '🇳🇮' }, { name: 'Niger', flag: '🇳🇪' },
  { name: 'Nigeria', flag: '🇳🇬' }, { name: 'North Korea', flag: '🇰🇵' },
  { name: 'North Macedonia', flag: '🇲🇰' }, { name: 'Norway', flag: '🇳🇴' },
  { name: 'Oman', flag: '🇴🇲' }, { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'Palau', flag: '🇵🇼' }, { name: 'Palestine', flag: '🇵🇸' },
  { name: 'Panama', flag: '🇵🇦' }, { name: 'Papua New Guinea', flag: '🇵🇬' },
  { name: 'Paraguay', flag: '🇵🇾' }, { name: 'Peru', flag: '🇵🇪' },
  { name: 'Philippines', flag: '🇵🇭' }, { name: 'Poland', flag: '🇵🇱' },
  { name: 'Portugal', flag: '🇵🇹' }, { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Romania', flag: '🇷🇴' }, { name: 'Russia', flag: '🇷🇺' },
  { name: 'Rwanda', flag: '🇷🇼' }, { name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { name: 'Saint Lucia', flag: '🇱🇨' }, { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { name: 'Samoa', flag: '🇼🇸' }, { name: 'San Marino', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', flag: '🇸🇹' }, { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Senegal', flag: '🇸🇳' }, { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Seychelles', flag: '🇸🇨' }, { name: 'Sierra Leone', flag: '🇸🇱' },
  { name: 'Singapore', flag: '🇸🇬' }, { name: 'Slovakia', flag: '🇸🇰' },
  { name: 'Slovenia', flag: '🇸🇮' }, { name: 'Solomon Islands', flag: '🇸🇧' },
  { name: 'Somalia', flag: '🇸🇴' }, { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Korea', flag: '🇰🇷' }, { name: 'South Sudan', flag: '🇸🇸' },
  { name: 'Spain', flag: '🇪🇸' }, { name: 'Sri Lanka', flag: '🇱🇰' },
  { name: 'Sudan', flag: '🇸🇩' }, { name: 'Suriname', flag: '🇸🇷' },
  { name: 'Sweden', flag: '🇸🇪' }, { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Syria', flag: '🇸🇾' }, { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Tajikistan', flag: '🇹🇯' }, { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'Thailand', flag: '🇹🇭' }, { name: 'Timor-Leste', flag: '🇹🇱' },
  { name: 'Togo', flag: '🇹🇬' }, { name: 'Tonga', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹' }, { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Turkey', flag: '🇹🇷' }, { name: 'Turkmenistan', flag: '🇹🇲' },
  { name: 'Tuvalu', flag: '🇹🇻' }, { name: 'UAE', flag: '🇦🇪' },
  { name: 'Uganda', flag: '🇺🇬' }, { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'United Kingdom', flag: '🇬🇧' }, { name: 'United States', flag: '🇺🇸' },
  { name: 'Uruguay', flag: '🇺🇾' }, { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Vanuatu', flag: '🇻🇺' }, { name: 'Venezuela', flag: '🇻🇪' },
  { name: 'Vietnam', flag: '🇻🇳' }, { name: 'Yemen', flag: '🇾🇪' },
  { name: 'Zambia', flag: '🇿🇲' }, { name: 'Zimbabwe', flag: '🇿🇼' },
]

export function getPassportFlag(name: string): string {
  return PASSPORT_LIST.find((p) => p.name === name)?.flag ?? '🌍'
}

interface PassportSwitcherProps {
  current: string
  onSelect: (name: string) => void
  onClose: () => void
}

export default function PassportSwitcher({ current, onSelect, onClose }: PassportSwitcherProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = query
    ? PASSPORT_LIST.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : PASSPORT_LIST

  const handleSelect = useCallback((name: string) => {
    try { localStorage.setItem('visitplane_passport', name) } catch { /* ignore */ }
    onSelect(name)
    onClose()
  }, [onSelect, onClose])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#0f0c29]">Select your passport</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm text-[#0f0c29] outline-none focus:border-emerald-500/60 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Country list */}
        <div className="overflow-y-auto max-h-72 px-2 pb-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelect(p.name)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-all hover:bg-emerald-50 ${
                  p.name === current ? 'bg-emerald-500/10 font-semibold text-emerald-600' : 'text-[#0f0c29]'
                }`}
              >
                <span className="text-xl">{p.flag}</span>
                <span>{p.name}</span>
                {p.name === current && <span className="ml-auto text-emerald-500 text-xs">✓ selected</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
