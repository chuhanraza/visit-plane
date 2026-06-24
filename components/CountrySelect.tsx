'use client'
import { useState, useRef, useEffect } from 'react'

const ALL_COUNTRIES = [
  { name: 'Afghanistan', code: 'AF', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', flag: '🇩🇿' },
  { name: 'Andorra', code: 'AD', flag: '🇦🇩' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴' },
  { name: 'Antigua and Barbuda', code: 'AG', flag: '🇦🇬' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  { name: 'Armenia', code: 'AM', flag: '🇦🇲' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: 'AZ', flag: '🇦🇿' },
  { name: 'Bahamas', code: 'BS', flag: '🇧🇸' },
  { name: 'Bahrain', code: 'BH', flag: '🇧🇭' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { name: 'Barbados', code: 'BB', flag: '🇧🇧' },
  { name: 'Belarus', code: 'BY', flag: '🇧🇾' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪' },
  { name: 'Belize', code: 'BZ', flag: '🇧🇿' },
  { name: 'Benin', code: 'BJ', flag: '🇧🇯' },
  { name: 'Bhutan', code: 'BT', flag: '🇧🇹' },
  { name: 'Bolivia', code: 'BO', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', code: 'BA', flag: '🇧🇦' },
  { name: 'Botswana', code: 'BW', flag: '🇧🇼' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { name: 'Brunei', code: 'BN', flag: '🇧🇳' },
  { name: 'Bulgaria', code: 'BG', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫' },
  { name: 'Burundi', code: 'BI', flag: '🇧🇮' },
  { name: 'Cambodia', code: 'KH', flag: '🇰🇭' },
  { name: 'Cameroon', code: 'CM', flag: '🇨🇲' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Cape Verde', code: 'CV', flag: '🇨🇻' },
  { name: 'Central African Republic', code: 'CF', flag: '🇨🇫' },
  { name: 'Chad', code: 'TD', flag: '🇹🇩' },
  { name: 'Chile', code: 'CL', flag: '🇨🇱' },
  { name: 'China', code: 'CN', flag: '🇨🇳' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴' },
  { name: 'Comoros', code: 'KM', flag: '🇰🇲' },
  { name: 'Congo', code: 'CG', flag: '🇨🇬' },
  { name: 'Costa Rica', code: 'CR', flag: '🇨🇷' },
  { name: 'Croatia', code: 'HR', flag: '🇭🇷' },
  { name: 'Cuba', code: 'CU', flag: '🇨🇺' },
  { name: 'Cyprus', code: 'CY', flag: '🇨🇾' },
  { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰' },
  { name: 'Djibouti', code: 'DJ', flag: '🇩🇯' },
  { name: 'Dominica', code: 'DM', flag: '🇩🇲' },
  { name: 'Dominican Republic', code: 'DO', flag: '🇩🇴' },
  { name: 'DR Congo', code: 'CD', flag: '🇨🇩' },
  { name: 'Ecuador', code: 'EC', flag: '🇪🇨' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬' },
  { name: 'El Salvador', code: 'SV', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', code: 'GQ', flag: '🇬🇶' },
  { name: 'Eritrea', code: 'ER', flag: '🇪🇷' },
  { name: 'Estonia', code: 'EE', flag: '🇪🇪' },
  { name: 'Eswatini', code: 'SZ', flag: '🇸🇿' },
  { name: 'Ethiopia', code: 'ET', flag: '🇪🇹' },
  { name: 'Fiji', code: 'FJ', flag: '🇫🇯' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮' },
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Gabon', code: 'GA', flag: '🇬🇦' },
  { name: 'Gambia', code: 'GM', flag: '🇬🇲' },
  { name: 'Georgia', code: 'GE', flag: '🇬🇪' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭' },
  { name: 'Greece', code: 'GR', flag: '🇬🇷' },
  { name: 'Grenada', code: 'GD', flag: '🇬🇩' },
  { name: 'Guatemala', code: 'GT', flag: '🇬🇹' },
  { name: 'Guinea', code: 'GN', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: 'GW', flag: '🇬🇼' },
  { name: 'Guyana', code: 'GY', flag: '🇬🇾' },
  { name: 'Haiti', code: 'HT', flag: '🇭🇹' },
  { name: 'Honduras', code: 'HN', flag: '🇭🇳' },
  { name: 'Hungary', code: 'HU', flag: '🇭🇺' },
  { name: 'Iceland', code: 'IS', flag: '🇮🇸' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹' },
  { name: 'Ivory Coast', code: 'CI', flag: '🇨🇮' },
  { name: 'Jamaica', code: 'JM', flag: '🇯🇲' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'Jordan', code: 'JO', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: 'KZ', flag: '🇰🇿' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪' },
  { name: 'Kiribati', code: 'KI', flag: '🇰🇮' },
  { name: 'Kosovo', code: 'XK', flag: '🇽🇰' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', code: 'KG', flag: '🇰🇬' },
  { name: 'Laos', code: 'LA', flag: '🇱🇦' },
  { name: 'Latvia', code: 'LV', flag: '🇱🇻' },
  { name: 'Lebanon', code: 'LB', flag: '🇱🇧' },
  { name: 'Lesotho', code: 'LS', flag: '🇱🇸' },
  { name: 'Liberia', code: 'LR', flag: '🇱🇷' },
  { name: 'Libya', code: 'LY', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: 'LI', flag: '🇱🇮' },
  { name: 'Lithuania', code: 'LT', flag: '🇱🇹' },
  { name: 'Luxembourg', code: 'LU', flag: '🇱🇺' },
  { name: 'Madagascar', code: 'MG', flag: '🇲🇬' },
  { name: 'Malawi', code: 'MW', flag: '🇲🇼' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾' },
  { name: 'Maldives', code: 'MV', flag: '🇲🇻' },
  { name: 'Mali', code: 'ML', flag: '🇲🇱' },
  { name: 'Malta', code: 'MT', flag: '🇲🇹' },
  { name: 'Marshall Islands', code: 'MH', flag: '🇲🇭' },
  { name: 'Mauritania', code: 'MR', flag: '🇲🇷' },
  { name: 'Mauritius', code: 'MU', flag: '🇲🇺' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
  { name: 'Micronesia', code: 'FM', flag: '🇫🇲' },
  { name: 'Moldova', code: 'MD', flag: '🇲🇩' },
  { name: 'Monaco', code: 'MC', flag: '🇲🇨' },
  { name: 'Mongolia', code: 'MN', flag: '🇲🇳' },
  { name: 'Montenegro', code: 'ME', flag: '🇲🇪' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦' },
  { name: 'Mozambique', code: 'MZ', flag: '🇲🇿' },
  { name: 'Myanmar', code: 'MM', flag: '🇲🇲' },
  { name: 'Namibia', code: 'NA', flag: '🇳🇦' },
  { name: 'Nauru', code: 'NR', flag: '🇳🇷' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿' },
  { name: 'Nicaragua', code: 'NI', flag: '🇳🇮' },
  { name: 'Niger', code: 'NE', flag: '🇳🇪' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { name: 'North Korea', code: 'KP', flag: '🇰🇵' },
  { name: 'North Macedonia', code: 'MK', flag: '🇲🇰' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  { name: 'Palau', code: 'PW', flag: '🇵🇼' },
  { name: 'Palestine', code: 'PS', flag: '🇵🇸' },
  { name: 'Panama', code: 'PA', flag: '🇵🇦' },
  { name: 'Papua New Guinea', code: 'PG', flag: '🇵🇬' },
  { name: 'Paraguay', code: 'PY', flag: '🇵🇾' },
  { name: 'Peru', code: 'PE', flag: '🇵🇪' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭' },
  { name: 'Poland', code: 'PL', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦' },
  { name: 'Romania', code: 'RO', flag: '🇷🇴' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺' },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼' },
  { name: 'Saint Kitts and Nevis', code: 'KN', flag: '🇰🇳' },
  { name: 'Saint Lucia', code: 'LC', flag: '🇱🇨' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', flag: '🇻🇨' },
  { name: 'Samoa', code: 'WS', flag: '🇼🇸' },
  { name: 'San Marino', code: 'SM', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', code: 'ST', flag: '🇸🇹' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
  { name: 'Senegal', code: 'SN', flag: '🇸🇳' },
  { name: 'Serbia', code: 'RS', flag: '🇷🇸' },
  { name: 'Seychelles', code: 'SC', flag: '🇸🇨' },
  { name: 'Sierra Leone', code: 'SL', flag: '🇸🇱' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'Slovakia', code: 'SK', flag: '🇸🇰' },
  { name: 'Slovenia', code: 'SI', flag: '🇸🇮' },
  { name: 'Solomon Islands', code: 'SB', flag: '🇸🇧' },
  { name: 'Somalia', code: 'SO', flag: '🇸🇴' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
  { name: 'South Sudan', code: 'SS', flag: '🇸🇸' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰' },
  { name: 'Sudan', code: 'SD', flag: '🇸🇩' },
  { name: 'Suriname', code: 'SR', flag: '🇸🇷' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  { name: 'Syria', code: 'SY', flag: '🇸🇾' },
  { name: 'Taiwan', code: 'TW', flag: '🇹🇼' },
  { name: 'Tajikistan', code: 'TJ', flag: '🇹🇯' },
  { name: 'Tanzania', code: 'TZ', flag: '🇹🇿' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  { name: 'Timor-Leste', code: 'TL', flag: '🇹🇱' },
  { name: 'Togo', code: 'TG', flag: '🇹🇬' },
  { name: 'Tonga', code: 'TO', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', code: 'TT', flag: '🇹🇹' },
  { name: 'Tunisia', code: 'TN', flag: '🇹🇳' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  { name: 'Turkmenistan', code: 'TM', flag: '🇹🇲' },
  { name: 'Tuvalu', code: 'TV', flag: '🇹🇻' },
  { name: 'Uganda', code: 'UG', flag: '🇺🇬' },
  { name: 'Ukraine', code: 'UA', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'Uruguay', code: 'UY', flag: '🇺🇾' },
  { name: 'Uzbekistan', code: 'UZ', flag: '🇺🇿' },
  { name: 'Vanuatu', code: 'VU', flag: '🇻🇺' },
  { name: 'Vatican City', code: 'VA', flag: '🇻🇦' },
  { name: 'Venezuela', code: 'VE', flag: '🇻🇪' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
  { name: 'Yemen', code: 'YE', flag: '🇾🇪' },
  { name: 'Zambia', code: 'ZM', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: 'ZW', flag: '🇿🇼' },
]

export { ALL_COUNTRIES }

// ── Synonyms / alias → canonical name in ALL_COUNTRIES ────────────────────────
// Lets short DB names ("UAE") and common variants ("United States of America",
// "Türkiye", "Holland") resolve to the right flag AND be found by search. Keys
// are lowercased.
const COUNTRY_SYNONYMS: Record<string, string> = {
  'uae': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'emirates': 'United Arab Emirates',
  'usa': 'United States',
  'u.s.a.': 'United States',
  'us': 'United States',
  'u.s.': 'United States',
  'united states of america': 'United States',
  'america': 'United States',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'britain': 'United Kingdom',
  'great britain': 'United Kingdom',
  'england': 'United Kingdom',
  'czechia': 'Czech Republic',
  'holland': 'Netherlands',
  'burma': 'Myanmar',
  "cote d'ivoire": 'Ivory Coast',
  "côte d'ivoire": 'Ivory Coast',
  'cabo verde': 'Cape Verde',
  'swaziland': 'Eswatini',
  'turkiye': 'Turkey',
  'türkiye': 'Turkey',
  'macedonia': 'North Macedonia',
  'vatican': 'Vatican City',
  'holy see': 'Vatican City',
  'korea': 'South Korea',
  'republic of korea': 'South Korea',
  's. korea': 'South Korea',
  'russian federation': 'Russia',
}

// Reverse map: canonical name → list of alias search terms.
const REVERSE_ALIASES: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {}
  for (const [alias, canon] of Object.entries(COUNTRY_SYNONYMS)) {
    ;(out[canon] ??= []).push(alias)
  }
  return out
})()

type PoolItem = { name: string; code: string; flag: string; terms: string[] }

/** Resolve a (possibly short/aliased) country name to its canonical record. */
function resolveCountryRecord(name: string) {
  const key = name.trim().toLowerCase()
  const exact = ALL_COUNTRIES.find(c => c.name.toLowerCase() === key)
  if (exact) return exact
  const canon = COUNTRY_SYNONYMS[key]
  if (canon) {
    const c = ALL_COUNTRIES.find(x => x.name === canon)
    if (c) return c
  }
  return null
}

/** Build a searchable, flag-resolved, de-duplicated pool from raw names. */
function buildCountryPool(names: string[]): PoolItem[] {
  const seen = new Set<string>()
  const pool: PoolItem[] = []
  for (const name of names) {
    const k = name.trim().toLowerCase()
    if (!k || seen.has(k)) continue
    seen.add(k)
    const rec = resolveCountryRecord(name)
    const canonical = rec?.name ?? name
    const terms = Array.from(
      new Set(
        [name, canonical, ...(REVERSE_ALIASES[canonical] ?? [])]
          .map(t => t.toLowerCase()),
      ),
    )
    pool.push({
      name,
      code: rec?.code ?? name.slice(0, 2).toUpperCase(),
      flag: rec?.flag ?? '🌍',
      terms,
    })
  }
  return pool
}

interface CountrySelectProps {
  value: string
  onChange: (country: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  variant?: 'dark' | 'light'
  /** Optional filtered list of country names to show (e.g. from DB query). Looks up flags automatically. */
  options?: string[]
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = 'Search country...',
  label,
  disabled = false,
  className = '',
  variant = 'dark',
  options,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isDark = variant === 'dark'

  // Build the working country list: use `options` prop if provided, else full
  // list. Either way names are flag-resolved (so "UAE" → 🇦🇪), de-duplicated, and
  // carry alias search terms (so "United Arab" matches "UAE").
  const countryPool = buildCountryPool(options ?? ALL_COUNTRIES.map(c => c.name))

  // Filter + sort: match against name OR any alias term; starts-with first.
  const q = search.toLowerCase().trim()
  const filtered = countryPool.filter(c =>
    q === '' || c.terms.some(t => t.includes(q))
  ).sort((a, b) => {
    const aStarts = a.terms.some(t => t.startsWith(q))
    const bStarts = b.terms.some(t => t.startsWith(q))
    if (aStarts && !bStarts) return -1
    if (!aStarts && bStarts) return 1
    return a.name.localeCompare(b.name)
  })

  // Resolve the selected value's flag even when it's a short/aliased DB name.
  const selectedCountry = resolveCountryRecord(value)

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [search])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const selectCountry = (name: string) => {
    onChange(name)
    setIsOpen(false)
    setSearch('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0) {
        selectCountry(filtered[highlightedIndex]?.name ?? filtered[0].name)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, 0))
    }
  }

  // ─── Style tokens ───────────────────────────────────────────────────────────
  const triggerBase = isDark
    ? 'bg-[#16122f] border-white/10 hover:border-teal-500/50'
    : 'bg-white border-[#E2E8F0] hover:border-[#10B981] shadow-sm'

  const triggerOpen = isDark
    ? 'border-teal-500 ring-2 ring-teal-500/20'
    : 'border-[#10B981] ring-2 ring-[#10B981]/20'

  const triggerText = isDark ? 'text-white' : 'text-[#0F1419]'
  const triggerPlaceholder = isDark ? 'text-gray-400' : 'text-gray-400'

  const dropdownBg = isDark
    ? 'bg-[#0f0c29] border-white/10 shadow-2xl shadow-black/50'
    : 'bg-white border-gray-200 shadow-2xl shadow-gray-200/80'

  const searchAreaBg = isDark ? 'bg-[#16122f] border-white/10' : 'bg-gray-50 border-gray-200'
  const searchInputBg = isDark
    ? 'bg-white/5 border-white/10 focus-within:border-teal-500'
    : 'bg-white border-gray-300 focus-within:border-teal-500'
  const searchIconColor = isDark ? 'text-gray-400' : 'text-gray-400'
  const searchInputText = isDark
    ? 'text-white placeholder-gray-500'
    : 'text-[#0f0c29] placeholder-gray-400'
  const countText = isDark ? 'text-gray-500' : 'text-gray-400'

  const itemBase = isDark
    ? 'border-white/5 text-white hover:bg-teal-500/10'
    : 'border-[#E2E8F0] text-[#0F1419] hover:bg-[#F1F5F9]'

  const itemSelected = isDark
    ? 'bg-teal-500/20 text-teal-400'
    : 'bg-emerald-50 text-emerald-700'

  const itemHighlighted = isDark ? 'bg-teal-500/10' : 'bg-[#F1F5F9]'

  const itemNameHover = isDark ? 'group-hover:text-teal-300' : 'group-hover:text-emerald-600'

  const footerBg = isDark
    ? 'bg-[#16122f] border-white/10 text-gray-500'
    : 'bg-gray-50 border-gray-200 text-gray-400'

  const emptyText = isDark ? 'text-gray-400' : 'text-gray-500'
  const emptySubText = isDark ? 'text-gray-500' : 'text-gray-400'
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className={`block text-xs font-bold tracking-widest uppercase mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </label>
      )}

      {/* ── TRIGGER BUTTON ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(prev => !prev)
            setSearch('')
          }
        }}
        className={[
          'w-full flex items-center justify-between',
          isDark ? 'px-4 py-3' : 'px-4 py-[14px] min-h-[56px] text-base',
          'rounded-xl border transition-all duration-200',
          triggerBase,
          isOpen ? triggerOpen : '',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          'group',
        ].join(' ')}
      >
        {/* Left: name */}
        <span className={`text-base font-semibold truncate ${value ? triggerText : triggerPlaceholder}`}>
          {value || placeholder}
        </span>

        {/* Right: flag + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-2xl leading-none">
            {selectedCountry ? selectedCountry.flag : '🌍'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isDark ? 'text-gray-400' : 'text-gray-400'} ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ── DROPDOWN ── */}
      {isOpen && (
        <div className={[
          'absolute z-50 w-full mt-2',
          'border rounded-2xl overflow-hidden',
          dropdownBg,
        ].join(' ')}>

          {/* Search bar */}
          <div className={`p-3 border-b ${searchAreaBg}`}>
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors ${searchInputBg}`}>
              <svg className={`w-4 h-4 flex-shrink-0 ${searchIconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search countries..."
                className={`flex-1 bg-transparent text-sm outline-none font-medium ${searchInputText}`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'} transition-colors`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className={`text-xs mt-2 px-1 ${countText}`}>
              {search
                ? `${filtered.length} ${filtered.length === 1 ? 'country' : 'countries'} found`
                : `${countryPool.length} countries`}
            </p>
          </div>

          {/* Countries list */}
          <div ref={listRef} className={isDark ? 'max-h-64 overflow-y-auto' : 'max-h-[320px] overflow-y-auto'}>
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="text-3xl">🔍</span>
                <p className={`text-sm mt-2 ${emptyText}`}>No country found for &quot;{search}&quot;</p>
                <p className={`text-xs mt-1 ${emptySubText}`}>Try a different spelling</p>
              </div>
            ) : (
              filtered.map((country, index) => {
                const isSelected = value === country.name
                const isHighlighted = index === highlightedIndex
                return (
                  <button
                    key={country.code}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectCountry(country.name)}
                    className={[
                      'w-full flex items-center justify-between',
                      'px-4 py-3 transition-colors duration-100',
                      'border-b last:border-0',
                      itemBase,
                      isSelected ? itemSelected : '',
                      !isSelected && isHighlighted ? itemHighlighted : '',
                      'group',
                    ].join(' ')}
                  >
                    {/* Left: checkmark + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      {isSelected ? (
                        <svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-emerald-600'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-4 flex-shrink-0" />
                      )}
                      <span className={`text-base font-semibold truncate ${itemNameHover} transition-colors`}>
                        {search ? highlightMatch(country.name, search, isDark) : country.name}
                      </span>
                    </div>

                    {/* Right: flag */}
                    <span className="text-2xl flex-shrink-0 ml-3 leading-none">
                      {country.flag}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className={`px-4 py-2 border-t ${footerBg}`}>
            <p className="text-xs text-center">
              ↑↓ navigate · Enter select · Esc close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Highlight matching text ───────────────────────────────────────────────────
function highlightMatch(text: string, search: string, isDark: boolean) {
  if (!search) return <>{text}</>
  const index = text.toLowerCase().indexOf(search.toLowerCase())
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <span className={`font-bold ${isDark ? 'text-teal-400' : 'text-emerald-600'}`}>
        {text.slice(index, index + search.length)}
      </span>
      {text.slice(index + search.length)}
    </>
  )
}
