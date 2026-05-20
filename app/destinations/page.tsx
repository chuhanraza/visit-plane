'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserCountry } from '@/hooks/useUserCountry'

// ─── All 197 countries organised by continent ──────────────────────────────
const ALL_COUNTRIES: { name: string; flag: string; continent: string; visa: string }[] = [
  // Asia
  { name: 'Afghanistan',   flag: '🇦🇫', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Armenia',       flag: '🇦🇲', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Azerbaijan',    flag: '🇦🇿', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Bangladesh',    flag: '🇧🇩', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Bhutan',        flag: '🇧🇹', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Brunei',        flag: '🇧🇳', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Cambodia',      flag: '🇰🇭', continent: 'Asia',        visa: 'eVisa' },
  { name: 'China',         flag: '🇨🇳', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Georgia',       flag: '🇬🇪', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Hong Kong',     flag: '🇭🇰', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'India',         flag: '🇮🇳', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Indonesia',     flag: '🇮🇩', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Iran',          flag: '🇮🇷', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Japan',         flag: '🇯🇵', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Kazakhstan',    flag: '🇰🇿', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Kyrgyzstan',    flag: '🇰🇬', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Laos',          flag: '🇱🇦', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Malaysia',      flag: '🇲🇾', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Maldives',      flag: '🇲🇻', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Mongolia',      flag: '🇲🇳', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Myanmar',       flag: '🇲🇲', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Nepal',         flag: '🇳🇵', continent: 'Asia',        visa: 'Visa on Arrival' },
  { name: 'North Korea',   flag: '🇰🇵', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Pakistan',      flag: '🇵🇰', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Philippines',   flag: '🇵🇭', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Singapore',     flag: '🇸🇬', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'South Korea',   flag: '🇰🇷', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Sri Lanka',     flag: '🇱🇰', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Taiwan',        flag: '🇹🇼', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Tajikistan',    flag: '🇹🇯', continent: 'Asia',        visa: 'eVisa' },
  { name: 'Thailand',      flag: '🇹🇭', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Timor-Leste',   flag: '🇹🇱', continent: 'Asia',        visa: 'Visa on Arrival' },
  { name: 'Turkmenistan',  flag: '🇹🇲', continent: 'Asia',        visa: 'Visa Required' },
  { name: 'Uzbekistan',    flag: '🇺🇿', continent: 'Asia',        visa: 'Visa Free' },
  { name: 'Vietnam',       flag: '🇻🇳', continent: 'Asia',        visa: 'eVisa' },
  // Europe
  { name: 'Albania',       flag: '🇦🇱', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'Andorra',       flag: '🇦🇩', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'Austria',       flag: '🇦🇹', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Belarus',       flag: '🇧🇾', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Belgium',       flag: '🇧🇪', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦', continent: 'Europe', visa: 'Visa Free' },
  { name: 'Bulgaria',      flag: '🇧🇬', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Croatia',       flag: '🇭🇷', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Cyprus',        flag: '🇨🇾', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Czech Republic',flag: '🇨🇿', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Denmark',       flag: '🇩🇰', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Estonia',       flag: '🇪🇪', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Finland',       flag: '🇫🇮', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'France',        flag: '🇫🇷', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Germany',       flag: '🇩🇪', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Greece',        flag: '🇬🇷', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Hungary',       flag: '🇭🇺', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Iceland',       flag: '🇮🇸', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Ireland',       flag: '🇮🇪', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Italy',         flag: '🇮🇹', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Kosovo',        flag: '🇽🇰', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'Latvia',        flag: '🇱🇻', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Liechtenstein', flag: '🇱🇮', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Lithuania',     flag: '🇱🇹', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Luxembourg',    flag: '🇱🇺', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Malta',         flag: '🇲🇹', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Moldova',       flag: '🇲🇩', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'Monaco',        flag: '🇲🇨', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Montenegro',    flag: '🇲🇪', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'Netherlands',   flag: '🇳🇱', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'North Macedonia',flag: '🇲🇰', continent: 'Europe',     visa: 'Visa Free' },
  { name: 'Norway',        flag: '🇳🇴', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Poland',        flag: '🇵🇱', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Portugal',      flag: '🇵🇹', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Romania',       flag: '🇷🇴', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Russia',        flag: '🇷🇺', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'San Marino',    flag: '🇸🇲', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Serbia',        flag: '🇷🇸', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'Slovakia',      flag: '🇸🇰', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Slovenia',      flag: '🇸🇮', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Spain',         flag: '🇪🇸', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Sweden',        flag: '🇸🇪', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Switzerland',   flag: '🇨🇭', continent: 'Europe',      visa: 'Visa Required' },
  { name: 'Turkey',        flag: '🇹🇷', continent: 'Europe',      visa: 'eVisa' },
  { name: 'Ukraine',       flag: '🇺🇦', continent: 'Europe',      visa: 'Visa Free' },
  { name: 'United Kingdom',flag: '🇬🇧', continent: 'Europe',      visa: 'Visa Required' },
  // Americas
  { name: 'Antigua and Barbuda', flag: '🇦🇬', continent: 'Americas', visa: 'Visa Free' },
  { name: 'Argentina',     flag: '🇦🇷', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Bahamas',       flag: '🇧🇸', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Barbados',      flag: '🇧🇧', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Belize',        flag: '🇧🇿', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Bolivia',       flag: '🇧🇴', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Brazil',        flag: '🇧🇷', continent: 'Americas',    visa: 'Visa Required' },
  { name: 'Canada',        flag: '🇨🇦', continent: 'Americas',    visa: 'Visa Required' },
  { name: 'Chile',         flag: '🇨🇱', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Colombia',      flag: '🇨🇴', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Costa Rica',    flag: '🇨🇷', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Cuba',          flag: '🇨🇺', continent: 'Americas',    visa: 'Visa Required' },
  { name: 'Dominica',      flag: '🇩🇲', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Dominican Republic', flag: '🇩🇴', continent: 'Americas', visa: 'Visa on Arrival' },
  { name: 'Ecuador',       flag: '🇪🇨', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'El Salvador',   flag: '🇸🇻', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Grenada',       flag: '🇬🇩', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Guatemala',     flag: '🇬🇹', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Guyana',        flag: '🇬🇾', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Haiti',         flag: '🇭🇹', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Honduras',      flag: '🇭🇳', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Jamaica',       flag: '🇯🇲', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Mexico',        flag: '🇲🇽', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Nicaragua',     flag: '🇳🇮', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Panama',        flag: '🇵🇦', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Paraguay',      flag: '🇵🇾', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Peru',          flag: '🇵🇪', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Saint Kitts and Nevis', flag: '🇰🇳', continent: 'Americas', visa: 'Visa Free' },
  { name: 'Saint Lucia',   flag: '🇱🇨', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', continent: 'Americas', visa: 'Visa Free' },
  { name: 'Suriname',      flag: '🇸🇷', continent: 'Americas',    visa: 'Visa Required' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹', continent: 'Americas', visa: 'Visa Free' },
  { name: 'United States', flag: '🇺🇸', continent: 'Americas',    visa: 'Visa Required' },
  { name: 'Uruguay',       flag: '🇺🇾', continent: 'Americas',    visa: 'Visa Free' },
  { name: 'Venezuela',     flag: '🇻🇪', continent: 'Americas',    visa: 'Visa Free' },
  // Middle East
  { name: 'Bahrain',       flag: '🇧🇭', continent: 'Middle East', visa: 'eVisa' },
  { name: 'Egypt',         flag: '🇪🇬', continent: 'Middle East', visa: 'eVisa' },
  { name: 'Iraq',          flag: '🇮🇶', continent: 'Middle East', visa: 'Visa Required' },
  { name: 'Israel',        flag: '🇮🇱', continent: 'Middle East', visa: 'Visa Free' },
  { name: 'Jordan',        flag: '🇯🇴', continent: 'Middle East', visa: 'Visa on Arrival' },
  { name: 'Kuwait',        flag: '🇰🇼', continent: 'Middle East', visa: 'Visa Required' },
  { name: 'Lebanon',       flag: '🇱🇧', continent: 'Middle East', visa: 'Visa Required' },
  { name: 'Oman',          flag: '🇴🇲', continent: 'Middle East', visa: 'eVisa' },
  { name: 'Palestine',     flag: '🇵🇸', continent: 'Middle East', visa: 'Visa Required' },
  { name: 'Qatar',         flag: '🇶🇦', continent: 'Middle East', visa: 'Visa Free' },
  { name: 'Saudi Arabia',  flag: '🇸🇦', continent: 'Middle East', visa: 'eVisa' },
  { name: 'Syria',         flag: '🇸🇾', continent: 'Middle East', visa: 'Visa Required' },
  { name: 'UAE',           flag: '🇦🇪', continent: 'Middle East', visa: 'eVisa' },
  { name: 'Yemen',         flag: '🇾🇪', continent: 'Middle East', visa: 'Visa Required' },
  // Africa
  { name: 'Algeria',       flag: '🇩🇿', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Angola',        flag: '🇦🇴', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Benin',         flag: '🇧🇯', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Botswana',      flag: '🇧🇼', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Burkina Faso',  flag: '🇧🇫', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Burundi',       flag: '🇧🇮', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'Cameroon',      flag: '🇨🇲', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Cape Verde',    flag: '🇨🇻', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Central African Republic', flag: '🇨🇫', continent: 'Africa', visa: 'Visa Required' },
  { name: 'Chad',          flag: '🇹🇩', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Comoros',       flag: '🇰🇲', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'Democratic Republic of the Congo', flag: '🇨🇩', continent: 'Africa', visa: 'Visa Required' },
  { name: 'Djibouti',      flag: '🇩🇯', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Equatorial Guinea', flag: '🇬🇶', continent: 'Africa',  visa: 'Visa Required' },
  { name: 'Eritrea',       flag: '🇪🇷', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Ethiopia',      flag: '🇪🇹', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Gabon',         flag: '🇬🇦', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Gambia',        flag: '🇬🇲', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Ghana',         flag: '🇬🇭', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Guinea',        flag: '🇬🇳', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Guinea-Bissau', flag: '🇬🇼', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'Ivory Coast',   flag: '🇨🇮', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Kenya',         flag: '🇰🇪', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Lesotho',       flag: '🇱🇸', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Liberia',       flag: '🇱🇷', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Libya',         flag: '🇱🇾', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Madagascar',    flag: '🇲🇬', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'Malawi',        flag: '🇲🇼', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Mali',          flag: '🇲🇱', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Mauritania',    flag: '🇲🇷', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'Mauritius',     flag: '🇲🇺', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Morocco',       flag: '🇲🇦', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Mozambique',    flag: '🇲🇿', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'Namibia',       flag: '🇳🇦', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Niger',         flag: '🇳🇪', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Nigeria',       flag: '🇳🇬', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Republic of the Congo', flag: '🇨🇬', continent: 'Africa', visa: 'Visa Required' },
  { name: 'Rwanda',        flag: '🇷🇼', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Sao Tome and Principe', flag: '🇸🇹', continent: 'Africa', visa: 'Visa on Arrival' },
  { name: 'Senegal',       flag: '🇸🇳', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Seychelles',    flag: '🇸🇨', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Sierra Leone',  flag: '🇸🇱', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Somalia',       flag: '🇸🇴', continent: 'Africa',      visa: 'Visa on Arrival' },
  { name: 'South Africa',  flag: '🇿🇦', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'South Sudan',   flag: '🇸🇸', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Sudan',         flag: '🇸🇩', continent: 'Africa',      visa: 'Visa Required' },
  { name: 'Swaziland',     flag: '🇸🇿', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Tanzania',      flag: '🇹🇿', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Togo',          flag: '🇹🇬', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Tunisia',       flag: '🇹🇳', continent: 'Africa',      visa: 'Visa Free' },
  { name: 'Uganda',        flag: '🇺🇬', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Zambia',        flag: '🇿🇲', continent: 'Africa',      visa: 'eVisa' },
  { name: 'Zimbabwe',      flag: '🇿🇼', continent: 'Africa',      visa: 'Visa on Arrival' },
  // Oceania
  { name: 'Australia',     flag: '🇦🇺', continent: 'Oceania',     visa: 'eVisa' },
  { name: 'Fiji',          flag: '🇫🇯', continent: 'Oceania',     visa: 'Visa Free' },
  { name: 'Kiribati',      flag: '🇰🇮', continent: 'Oceania',     visa: 'Visa on Arrival' },
  { name: 'Marshall Islands', flag: '🇲🇭', continent: 'Oceania',  visa: 'Visa Free' },
  { name: 'Micronesia',    flag: '🇫🇲', continent: 'Oceania',     visa: 'Visa Free' },
  { name: 'Nauru',         flag: '🇳🇷', continent: 'Oceania',     visa: 'Visa Required' },
  { name: 'New Zealand',   flag: '🇳🇿', continent: 'Oceania',     visa: 'eVisa' },
  { name: 'Palau',         flag: '🇵🇼', continent: 'Oceania',     visa: 'Visa Free' },
  { name: 'Papua New Guinea', flag: '🇵🇬', continent: 'Oceania',  visa: 'Visa on Arrival' },
  { name: 'Samoa',         flag: '🇼🇸', continent: 'Oceania',     visa: 'Visa Free' },
  { name: 'Solomon Islands', flag: '🇸🇧', continent: 'Oceania',   visa: 'Visa Free' },
  { name: 'Tonga',         flag: '🇹🇴', continent: 'Oceania',     visa: 'Visa Free' },
  { name: 'Tuvalu',        flag: '🇹🇻', continent: 'Oceania',     visa: 'Visa on Arrival' },
  { name: 'Vanuatu',       flag: '🇻🇺', continent: 'Oceania',     visa: 'Visa Free' },
]

const CONTINENTS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa', 'Oceania']

const VISA_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/20'    },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/20'    },
}

export default function DestinationsPage() {
  const [search, setSearch]             = useState('')
  const [activeContinent, setContinent] = useState('All')
  const { countryName } = useUserCountry()
  const detectedPassport = countryName || 'Pakistan'

  const filtered = useMemo(() => {
    return ALL_COUNTRIES.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.continent.toLowerCase().includes(search.toLowerCase())
      const matchContinent = activeContinent === 'All' || c.continent === activeContinent
      return matchSearch && matchContinent
    })
  }, [search, activeContinent])

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">{/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            🌍 {ALL_COUNTRIES.length} Countries Available
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[#0f0c29]">Explore </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              197 Destinations
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-500">
            Select any country to instantly check visa requirements, fees, processing times, and document checklists.
            {countryName && (
              <span className="block mt-2 text-sm text-teal-400">
                📍 Showing results for <strong>{countryName}</strong> passport
              </span>
            )}
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries or continents…"
                className="w-full rounded-2xl border border-gray-200 bg-white/[0.06] pl-11 pr-4 py-3.5 text-sm text-[#0f0c29] placeholder-white/30 outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition text-lg"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Continent filter tabs ───────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-[#FAFAFA]/95 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  activeContinent === c
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'border border-gray-200 bg-white/5 text-gray-500 hover:border-emerald-500/40 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Country count + grid ────────────────────────────────────────────── */}
      <section className="pb-24 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Count */}
          <div className="mb-6 text-sm text-gray-400 text-center">
            {filtered.length === ALL_COUNTRIES.length
              ? `${ALL_COUNTRIES.length} countries available`
              : `${filtered.length} of ${ALL_COUNTRIES.length} countries`}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No countries found for &quot;{search}&quot;</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((country) => {
                const badge = VISA_BADGE[country.visa] ?? VISA_BADGE['Visa Required']
                return (
                  <Link
                    key={country.name}
                    href={`/visa/${encodeURIComponent(detectedPassport)}/${encodeURIComponent(country.name)}`}
                    className="group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:border-teal-500/50 hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10"
                  >
                    <span className="text-4xl">{country.flag}</span>
                    <div className="text-sm font-semibold text-[#0f0c29] leading-tight">{country.name}</div>
                    <div className="text-[10px] text-gray-400">{country.continent}</div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                      {country.visa}
                    </span>
                    <span className="text-[10px] text-white/25 group-hover:text-teal-400 transition">
                      View Requirements →
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-px transition"
            >
              Check Visa Requirements for Your Passport →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
