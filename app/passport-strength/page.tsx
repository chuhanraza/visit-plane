'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Supabase ─────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ─── Passport rankings (Henley Passport Index 2024 approximate) ───────────────
const PASSPORT_RANKINGS: Record<string, number> = {
  'Japan': 1, 'Singapore': 2, 'France': 3, 'Germany': 3, 'Italy': 3,
  'Spain': 3, 'Finland': 4, 'Sweden': 4, 'Austria': 4, 'Denmark': 4,
  'Netherlands': 4, 'Ireland': 5, 'Portugal': 5, 'United Kingdom': 5,
  'Belgium': 5, 'Luxembourg': 5, 'Norway': 5, 'Switzerland': 5,
  'New Zealand': 5, 'South Korea': 3, 'Australia': 6, 'Greece': 6,
  'Czech Republic': 6, 'Malta': 6, 'Poland': 6, 'Canada': 7, 'United States': 7,
  'Hungary': 7, 'Lithuania': 7, 'Slovakia': 7, 'Latvia': 7, 'Slovenia': 7,
  'Iceland': 8, 'Estonia': 8, 'Croatia': 9, 'Romania': 10,
  'Bulgaria': 11, 'Malaysia': 12, 'Taiwan': 13, 'Israel': 13,
  'Cyprus': 14, 'UAE': 15, 'Brunei': 16, 'Chile': 17, 'Argentina': 18,
  'Hong Kong': 19, 'Brazil': 20, 'Mexico': 25, 'Serbia': 38,
  'Albania': 40, 'North Macedonia': 45, 'Montenegro': 46, 'Turkey': 52,
  'Ukraine': 35, 'Moldova': 48, 'Russia': 51, 'South Africa': 52,
  'Qatar': 55, 'Bahrain': 58, 'Saudi Arabia': 60, 'Kuwait': 60,
  'Oman': 61, 'China': 64, 'Thailand': 67, 'Bahamas': 27,
  'Indonesia': 70, 'Tunisia': 72, 'Morocco': 73, 'Ghana': 76,
  'Kenya': 80, 'India': 82, 'Jordan': 84,
  'Vietnam': 90, 'Nigeria': 93, 'Algeria': 95,
  'Bangladesh': 99, 'Egypt': 100, 'Pakistan': 101, 'Iran': 103,
  'Libya': 104, 'Iraq': 107, 'Syria': 108, 'Afghanistan': 110,
  'Nepal': 95, 'Sri Lanka': 100, 'Philippines': 74, 'Colombia': 59,
  'Peru': 55, 'Ecuador': 70, 'Bolivia': 90, 'Venezuela': 92,
  'Cuba': 85, 'Dominican Republic': 65, 'Jamaica': 80, 'Panama': 49,
  'Costa Rica': 30, 'Guatemala': 82, 'Honduras': 95, 'Nicaragua': 91,
  'El Salvador': 87, 'Paraguay': 42, 'Uruguay': 15, 'Suriname': 63,
  'Georgia': 45, 'Armenia': 75, 'Azerbaijan': 78, 'Kazakhstan': 58,
  'Uzbekistan': 91, 'Tajikistan': 93, 'Kyrgyzstan': 95, 'Turkmenistan': 97,
  'Mongolia': 60, 'Cambodia': 98, 'Laos': 98, 'Myanmar': 99,
  'Ethiopia': 98, 'Tanzania': 78, 'Uganda': 78, 'Rwanda': 72,
  'Senegal': 82, 'Cameroon': 95, 'Ivory Coast': 93, 'Mali': 100,
  'Niger': 99, 'Chad': 101, 'Somalia': 104, 'Sudan': 103,
  'South Sudan': 104, 'Mozambique': 85, 'Zimbabwe': 97, 'Zambia': 85,
  'Malawi': 88, 'Madagascar': 90, 'Botswana': 65, 'Namibia': 70,
  'Angola': 96, 'Benin': 97, 'Togo': 97, 'Gabon': 87,
  'Sierra Leone': 100, 'Liberia': 99, 'Eritrea': 103, 'Djibouti': 93,
  'Comoros': 96, 'Mauritius': 28, 'Seychelles': 30, 'Cape Verde': 60,
  'Fiji': 35, 'Papua New Guinea': 93, 'Samoa': 62,
  'Vanuatu': 45, 'Tonga': 70, 'Kiribati': 82, 'Nauru': 88,
  'Palau': 55, 'Micronesia': 80, 'Marshall Islands': 88, 'Tuvalu': 90,
  'Solomon Islands': 88, 'Timor-Leste': 98, 'Bhutan': 88,
  'Maldives': 55, 'Lebanon': 100, 'Palestine': 104, 'Yemen': 105,
  'Kosovo': 50, 'Bosnia and Herzegovina': 45, 'Belarus': 70,
  'North Korea': 102, 'Burundi': 101, 'Central African Republic': 102,
  'Democratic Republic of the Congo': 103, 'Republic of the Congo': 100,
  'Equatorial Guinea': 100, 'Guinea': 99, 'Guinea-Bissau': 100,
  'Lesotho': 90, 'Swaziland': 88, 'Sao Tome and Principe': 92,
  'Burkina Faso': 100, 'Gambia': 93,
}

// ─── Country flags ────────────────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩',
  'Angola': '🇦🇴', 'Argentina': '🇦🇷', 'Armenia': '🇦🇲', 'Australia': '🇦🇺',
  'Austria': '🇦🇹', 'Azerbaijan': '🇦🇿', 'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭',
  'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧', 'Belarus': '🇧🇾', 'Belgium': '🇧🇪',
  'Belize': '🇧🇿', 'Benin': '🇧🇯', 'Bhutan': '🇧🇹', 'Bolivia': '🇧🇴',
  'Bosnia and Herzegovina': '🇧🇦', 'Botswana': '🇧🇼', 'Brazil': '🇧🇷',
  'Brunei': '🇧🇳', 'Bulgaria': '🇧🇬', 'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮',
  'Cambodia': '🇰🇭', 'Cameroon': '🇨🇲', 'Canada': '🇨🇦', 'Cape Verde': '🇨🇻',
  'Central African Republic': '🇨🇫', 'Chad': '🇹🇩', 'Chile': '🇨🇱',
  'China': '🇨🇳', 'Colombia': '🇨🇴', 'Comoros': '🇰🇲', 'Costa Rica': '🇨🇷',
  'Croatia': '🇭🇷', 'Cuba': '🇨🇺', 'Cyprus': '🇨🇾', 'Czech Republic': '🇨🇿',
  'Democratic Republic of the Congo': '🇨🇩', 'Denmark': '🇩🇰',
  'Djibouti': '🇩🇯', 'Dominica': '🇩🇲', 'Dominican Republic': '🇩🇴',
  'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'El Salvador': '🇸🇻',
  'Equatorial Guinea': '🇬🇶', 'Eritrea': '🇪🇷', 'Estonia': '🇪🇪',
  'Ethiopia': '🇪🇹', 'Fiji': '🇫🇯', 'Finland': '🇫🇮', 'France': '🇫🇷',
  'Gabon': '🇬🇦', 'Gambia': '🇬🇲', 'Georgia': '🇬🇪', 'Germany': '🇩🇪',
  'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Grenada': '🇬🇩', 'Guatemala': '🇬🇹',
  'Guinea': '🇬🇳', 'Guinea-Bissau': '🇬🇼', 'Guyana': '🇬🇾', 'Haiti': '🇭🇹',
  'Honduras': '🇭🇳', 'Hong Kong': '🇭🇰', 'Hungary': '🇭🇺', 'Iceland': '🇮🇸',
  'India': '🇮🇳', 'Indonesia': '🇮🇩', 'Iran': '🇮🇷', 'Iraq': '🇮🇶',
  'Ireland': '🇮🇪', 'Israel': '🇮🇱', 'Italy': '🇮🇹', 'Ivory Coast': '🇨🇮',
  'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿',
  'Kenya': '🇰🇪', 'Kiribati': '🇰🇮', 'Kosovo': '🇽🇰', 'Kuwait': '🇰🇼',
  'Kyrgyzstan': '🇰🇬', 'Laos': '🇱🇦', 'Latvia': '🇱🇻', 'Lebanon': '🇱🇧',
  'Lesotho': '🇱🇸', 'Liberia': '🇱🇷', 'Libya': '🇱🇾', 'Liechtenstein': '🇱🇮',
  'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺', 'Madagascar': '🇲🇬',
  'Malawi': '🇲🇼', 'Malaysia': '🇲🇾', 'Maldives': '🇲🇻', 'Mali': '🇲🇱',
  'Malta': '🇲🇹', 'Marshall Islands': '🇲🇭', 'Mauritania': '🇲🇷',
  'Mauritius': '🇲🇺', 'Mexico': '🇲🇽', 'Micronesia': '🇫🇲',
  'Moldova': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolia': '🇲🇳', 'Montenegro': '🇲🇪',
  'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦',
  'Nauru': '🇳🇷', 'Nepal': '🇳🇵', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿',
  'Nicaragua': '🇳🇮', 'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'North Korea': '🇰🇵',
  'North Macedonia': '🇲🇰', 'Norway': '🇳🇴', 'Oman': '🇴🇲', 'Pakistan': '🇵🇰',
  'Palau': '🇵🇼', 'Palestine': '🇵🇸', 'Panama': '🇵🇦',
  'Papua New Guinea': '🇵🇬', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪',
  'Philippines': '🇵🇭', 'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
  'Republic of the Congo': '🇨🇬', 'Romania': '🇷🇴', 'Russia': '🇷🇺',
  'Rwanda': '🇷🇼', 'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨',
  'Saint Vincent and the Grenadines': '🇻🇨', 'Samoa': '🇼🇸',
  'San Marino': '🇸🇲', 'Sao Tome and Principe': '🇸🇹', 'Saudi Arabia': '🇸🇦',
  'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Seychelles': '🇸🇨',
  'Sierra Leone': '🇸🇱', 'Singapore': '🇸🇬', 'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮', 'Solomon Islands': '🇸🇧', 'Somalia': '🇸🇴',
  'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'South Sudan': '🇸🇸',
  'Spain': '🇪🇸', 'Sri Lanka': '🇱🇰', 'Sudan': '🇸🇩', 'Suriname': '🇸🇷',
  'Swaziland': '🇸🇿', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾',
  'Taiwan': '🇹🇼', 'Tajikistan': '🇹🇯', 'Tanzania': '🇹🇿',
  'Thailand': '🇹🇭', 'Timor-Leste': '🇹🇱', 'Togo': '🇹🇬', 'Tonga': '🇹🇴',
  'Trinidad and Tobago': '🇹🇹', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷',
  'Turkmenistan': '🇹🇲', 'Tuvalu': '🇹🇻', 'UAE': '🇦🇪', 'Uganda': '🇺🇬',
  'Ukraine': '🇺🇦', 'United Kingdom': '🇬🇧', 'United States': '🇺🇸',
  'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿', 'Vanuatu': '🇻🇺',
  'Venezuela': '🇻🇪', 'Vietnam': '🇻🇳', 'Yemen': '🇾🇪', 'Zambia': '🇿🇲',
  'Zimbabwe': '🇿🇼',
}

// ─── Country centroids [lat, lon] for world map dots ─────────────────────────
const COUNTRY_DOTS: Record<string, [number, number]> = {
  'United States': [37.1, -95.7], 'Canada': [56.1, -106.3], 'Mexico': [23.6, -102.6],
  'Brazil': [-14.2, -51.9], 'Argentina': [-38.4, -63.6], 'Chile': [-35.7, -71.5],
  'Colombia': [4.6, -74.3], 'Peru': [-9.2, -75.0], 'Venezuela': [6.4, -66.6],
  'Ecuador': [-1.8, -78.2], 'Bolivia': [-16.3, -64.0], 'Paraguay': [-23.4, -58.4],
  'Uruguay': [-32.5, -55.8], 'Guyana': [4.9, -58.9], 'Suriname': [3.9, -56.0],
  'Cuba': [21.5, -79.5], 'Dominican Republic': [18.7, -70.2], 'Haiti': [18.9, -72.3],
  'Jamaica': [18.1, -77.3], 'Trinidad and Tobago': [10.7, -61.2],
  'Barbados': [13.2, -59.5], 'Panama': [8.6, -80.8], 'Costa Rica': [9.7, -83.8],
  'Guatemala': [15.8, -90.2], 'Honduras': [15.2, -86.2], 'El Salvador': [13.8, -88.9],
  'Nicaragua': [12.9, -85.2], 'Belize': [17.2, -88.5], 'Bahamas': [25.0, -77.4],
  'United Kingdom': [55.4, -3.4], 'France': [46.2, 2.2], 'Germany': [51.2, 10.5],
  'Italy': [41.9, 12.6], 'Spain': [40.5, -4.0], 'Portugal': [39.4, -8.2],
  'Netherlands': [52.1, 5.3], 'Belgium': [50.5, 4.5], 'Switzerland': [46.8, 8.2],
  'Austria': [47.5, 14.6], 'Sweden': [60.1, 18.6], 'Norway': [60.5, 8.5],
  'Denmark': [56.3, 9.5], 'Finland': [64.0, 26.0], 'Poland': [51.9, 19.1],
  'Czech Republic': [49.8, 15.5], 'Hungary': [47.2, 19.5], 'Romania': [45.9, 25.0],
  'Bulgaria': [42.7, 25.5], 'Greece': [39.1, 22.0], 'Croatia': [45.1, 15.2],
  'Serbia': [44.0, 21.0], 'Slovakia': [48.7, 19.7], 'Slovenia': [46.2, 15.0],
  'Ukraine': [48.4, 31.2], 'Belarus': [53.7, 28.0], 'Lithuania': [55.2, 24.0],
  'Latvia': [56.9, 24.6], 'Estonia': [58.6, 25.0], 'Moldova': [47.4, 28.4],
  'Ireland': [53.1, -8.2], 'Iceland': [64.9, -18.5], 'Luxembourg': [49.8, 6.1],
  'Malta': [35.9, 14.4], 'Cyprus': [35.1, 33.4], 'Montenegro': [42.7, 19.4],
  'Albania': [41.2, 20.2], 'North Macedonia': [41.6, 21.7], 'Kosovo': [42.6, 20.9],
  'Bosnia and Herzegovina': [44.2, 17.7], 'Monaco': [43.7, 7.4], 'Russia': [61.5, 105.3],
  'Turkey': [39.1, 35.2], 'Georgia': [42.3, 43.4], 'Armenia': [40.1, 45.0],
  'Azerbaijan': [40.1, 47.6], 'Kazakhstan': [48.0, 67.0], 'Uzbekistan': [41.4, 64.6],
  'Kyrgyzstan': [41.2, 74.8], 'Tajikistan': [38.9, 71.3], 'Turkmenistan': [38.97, 59.6],
  'Iran': [32.4, 53.7], 'Iraq': [33.2, 43.7], 'Saudi Arabia': [24.0, 44.6],
  'UAE': [24.0, 54.0], 'Qatar': [25.4, 51.2], 'Kuwait': [29.3, 47.5],
  'Bahrain': [26.0, 50.6], 'Oman': [21.5, 55.9], 'Yemen': [15.6, 48.5],
  'Jordan': [30.6, 36.2], 'Lebanon': [33.9, 35.9], 'Israel': [31.0, 35.0],
  'Syria': [35.0, 38.0], 'Palestine': [31.9, 35.2],
  'India': [20.6, 79.0], 'Pakistan': [30.4, 69.3], 'Bangladesh': [23.7, 90.4],
  'Nepal': [28.4, 84.1], 'Sri Lanka': [7.9, 80.8], 'Maldives': [3.2, 73.2],
  'Bhutan': [27.5, 90.4], 'China': [35.9, 104.2], 'Japan': [36.2, 138.3],
  'South Korea': [35.9, 127.8], 'North Korea': [40.3, 127.5], 'Taiwan': [23.7, 121.0],
  'Mongolia': [46.9, 103.8], 'Hong Kong': [22.3, 114.2],
  'Thailand': [15.9, 100.9], 'Vietnam': [14.1, 108.3], 'Cambodia': [12.6, 104.9],
  'Laos': [19.9, 102.5], 'Myanmar': [17.1, 95.9], 'Malaysia': [4.2, 108.0],
  'Singapore': [1.4, 103.8], 'Indonesia': [-0.8, 113.9], 'Philippines': [12.9, 121.8],
  'Brunei': [4.5, 114.7], 'Timor-Leste': [-8.9, 125.7],
  'Australia': [-25.3, 133.8], 'New Zealand': [-40.9, 174.9], 'Fiji': [-17.7, 178.1],
  'Papua New Guinea': [-6.3, 143.9], 'Samoa': [-13.8, -172.1], 'Tonga': [-21.2, -175.2],
  'Vanuatu': [-15.4, 166.9], 'Solomon Islands': [-9.6, 160.2], 'Palau': [7.5, 134.6],
  'Egypt': [26.8, 30.8], 'Libya': [27.0, 17.2], 'Tunisia': [33.9, 9.5],
  'Algeria': [28.0, 2.6], 'Morocco': [31.8, -7.1], 'Sudan': [12.9, 30.2],
  'South Sudan': [7.9, 30.2], 'Ethiopia': [9.1, 40.5], 'Somalia': [5.2, 46.2],
  'Kenya': [-0.0, 37.9], 'Tanzania': [-6.4, 35.0], 'Uganda': [1.4, 32.3],
  'Rwanda': [-1.9, 30.0], 'Nigeria': [9.1, 8.7], 'Ghana': [7.9, -1.0],
  'Senegal': [14.5, -14.5], 'Cameroon': [3.9, 11.5], 'South Africa': [-30.6, 22.9],
  'Zimbabwe': [-19.0, 29.2], 'Zambia': [-13.1, 27.8], 'Mozambique': [-18.7, 35.5],
  'Madagascar': [-18.8, 46.9], 'Angola': [-11.2, 17.9], 'Namibia': [-22.0, 17.1],
  'Botswana': [-22.3, 24.7], 'Malawi': [-13.3, 34.3], 'Niger': [17.6, 8.1],
  'Mali': [17.6, -4.0], 'Chad': [15.5, 18.7], 'Togo': [8.6, 0.8],
  'Benin': [9.3, 2.3], 'Ivory Coast': [7.5, -5.6], 'Guinea': [11.0, -10.9],
  'Burkina Faso': [12.4, -1.6], 'Sierra Leone': [8.5, -11.8],
  'Liberia': [6.4, -9.4], 'Gabon': [-0.8, 11.6], 'Djibouti': [11.8, 42.6],
  'Eritrea': [15.2, 39.8], 'Mauritius': [-20.3, 57.6], 'Seychelles': [-4.7, 55.5],
  'Cape Verde': [16.0, -24.0],
}

// ─── Passport countries list ─────────────────────────────────────────────────
const PASSPORT_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso',
  'Burundi','Cambodia','Cameroon','Canada','Cape Verde','Central African Republic',
  'Chad','Chile','China','Colombia','Comoros','Costa Rica','Croatia','Cuba',
  'Cyprus','Czech Republic','Democratic Republic of the Congo','Denmark','Djibouti',
  'Dominica','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala',
  'Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hong Kong','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia',
  'Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius',
  'Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco',
  'Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand',
  'Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman',
  'Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Republic of the Congo','Romania',
  'Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Swaziland','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste',
  'Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'UAE','Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
].sort()

// ─── Types ────────────────────────────────────────────────────────────────────
type VisaCounts = {
  visaFree: number
  visaOnArrival: number
  eVisa: number
  visaRequired: number
  total: number
}

type DestinationRow = {
  country_name: string
  visa_type: string
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = Date.now()
    const initial = 0
    const raf = (cb: FrameRequestCallback) => requestAnimationFrame(cb)
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(initial + (target - initial) * ease))
      if (progress < 1) raf(step)
    }
    raf(step)
  }, [target, duration])
  return count
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}
function ChevronDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
function MenuIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function ShareIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
function CopyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}
function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

// ─── Circular Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 200 }: { score: number; size?: number }) {
  const animatedScore = useAnimatedCounter(score, 1600)
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const color =
    score >= 70 ? '#10b981' :
    score >= 40 ? '#f59e0b' :
    '#ef4444'

  const colorDark =
    score >= 70 ? '#064e3b' :
    score >= 40 ? '#451a03' :
    '#450a0a'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className="absolute inset-4 rounded-full blur-2xl opacity-30"
        style={{ background: color }}
      />
      {/* SVG ring */}
      <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={colorDark}
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-black tabular-nums" style={{ color }}>{animatedScore}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">Power Score</span>
      </div>
    </div>
  )
}

// ─── World Map Dot Visualization ──────────────────────────────────────────────
function WorldMapDots({
  destinations,
}: {
  destinations: DestinationRow[]
}) {
  const W = 900
  const H = 440
  const pad = 20

  // Build lookup: country_name → visa_type
  const lookup = new Map<string, string>()
  destinations.forEach(d => lookup.set(d.country_name, d.visa_type))

  // Map lat/lon to SVG coords
  const toXY = (lat: number, lon: number): [number, number] => {
    const x = pad + ((lon + 180) / 360) * (W - 2 * pad)
    const y = pad + ((90 - lat) / 180) * (H - 2 * pad)
    return [x, y]
  }

  const getColor = (name: string) => {
    const vt = lookup.get(name)
    if (!vt) return '#1e293b'
    if (vt === 'Visa Free') return '#10b981'
    if (vt === 'eVisa') return '#10b981'
    if (vt === 'Visa on Arrival') return '#f59e0b'
    return '#ef4444'
  }

  const dots = Object.entries(COUNTRY_DOTS).map(([name, [lat, lon]]) => {
    const [x, y] = toXY(lat, lon)
    const color = getColor(name)
    const hasData = lookup.has(name)
    return { name, x, y, color, hasData }
  })

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#05080f]">
      {/* Map legend */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md text-[10px] font-bold">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />Visa Free / eVisa</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />On Arrival</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />Visa Required</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-700" />No data</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 420 }}>
        {/* Grid lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const y = pad + ((90 - lat) / 180) * (H - 2 * pad)
          return (
            <line key={lat} x1={pad} y1={y} x2={W - pad} y2={y}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          )
        })}
        {[-120, -60, 0, 60, 120].map(lon => {
          const x = pad + ((lon + 180) / 360) * (W - 2 * pad)
          return (
            <line key={lon} x1={x} y1={pad} x2={x} y2={H - pad}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          )
        })}

        {/* Country dots */}
        {dots.map(({ name, x, y, color, hasData }) => (
          <g key={name}>
            {/* Glow for has-data */}
            {hasData && color !== '#1e293b' && (
              <circle cx={x} cy={y} r={6} fill={color} opacity={0.2} />
            )}
            <circle cx={x} cy={y} r={hasData ? 4 : 2.5} fill={color} opacity={hasData ? 0.9 : 0.4} />
          </g>
        ))}
      </svg>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  count, label, icon, color, delay,
}: {
  count: number; label: string; icon: string; color: string; delay: number
}) {
  const animatedCount = useAnimatedCounter(count, 1200)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border p-5 text-center`}
      style={{ borderColor: `${color}25`, background: `${color}08` }}
    >
      <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
      <div className="relative">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-4xl font-black tabular-nums" style={{ color }}>{animatedCount}</div>
        <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">{label}</div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PassportStrengthPage() {
  const [passport, setPassport] = useState('')
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState<VisaCounts | null>(null)
  const [destinations, setDestinations] = useState<DestinationRow[]>([])
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const fetchData = useCallback(async (country: string) => {
    if (!country) return
    setLoading(true)
    setCounts(null)
    setDestinations([])

    const { data, error } = await getSupabase()
      .from('destinations')
      .select('country_name, visa_type')
      .eq('passport_country', country)

    if (error || !data) {
      setLoading(false)
      return
    }

    setDestinations(data)

    const grouped: Record<string, number> = {}
    data.forEach(row => {
      const vt = row.visa_type || 'Visa Required'
      grouped[vt] = (grouped[vt] || 0) + 1
    })

    const visaFree = (grouped['Visa Free'] || 0)
    const eVisa = (grouped['eVisa'] || 0)
    const visaOnArrival = (grouped['Visa on Arrival'] || 0)
    const visaRequired = (grouped['Visa Required'] || 0)
    const total = data.length

    setCounts({ visaFree, eVisa, visaOnArrival, visaRequired, total })
    setLoading(false)

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }, [])

  useEffect(() => {
    if (passport) fetchData(passport)
  }, [passport, fetchData])

  const score = counts
    ? Math.round(((counts.visaFree + counts.eVisa) / counts.total) * 100)
    : 0

  const rank = passport ? (PASSPORT_RANKINGS[passport] ?? null) : null
  const flag = passport ? (COUNTRY_FLAGS[passport] ?? '🌍') : '🌍'

  // Top 10 easiest (visa free / eVisa)
  const easiestDestinations = destinations
    .filter(d => d.visa_type === 'Visa Free' || d.visa_type === 'eVisa')
    .slice(0, 10)
    .map(d => ({
      name: d.country_name,
      flag: COUNTRY_FLAGS[d.country_name] ?? '🏳️',
      type: d.visa_type,
    }))

  // Top 5 hardest (visa required)
  const hardestDestinations = destinations
    .filter(d => d.visa_type === 'Visa Required')
    .slice(0, 5)
    .map(d => ({
      name: d.country_name,
      flag: COUNTRY_FLAGS[d.country_name] ?? '🏳️',
    }))

  const shareText = counts
    ? `My ${passport} passport ${flag} can access ${counts.visaFree} countries visa-free!\nPassport Power Score: ${score}/100 🛂✈️\nCheck yours at visitplane.com/passport-strength`
    : ''

  const handleCopy = async () => {
    if (!shareText) return
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <div className="min-h-screen bg-[#060C18] text-white antialiased overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060C18]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30'
          : 'bg-transparent'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition" />
              <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="relative rounded-xl" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Visit</span>
              <span className="text-emerald-400">Plane</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: 'Explore',            href: '/destinations' },
              { label: 'Visa Requirements',  href: '/destinations' },
              { label: 'Passport Strength',  href: '/passport-strength' },
              { label: 'Guides',             href: '/blog' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-white ${
                  item.href === '/passport-strength' ? 'text-emerald-400 font-semibold' : 'text-white/55'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/destinations"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 hover:shadow-emerald-500/40 hover:-translate-y-px"
            >
              Check Visa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-white/55 hover:bg-white/5 hover:text-white md:hidden transition"
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/5 bg-[#060C18]/98 backdrop-blur-xl md:hidden overflow-hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
                {[
                  { label: 'Explore', href: '/destinations' },
                  { label: 'Visa Requirements', href: '/destinations' },
                  { label: 'Passport Strength', href: '/passport-strength' },
                  { label: 'Guides', href: '/blog' },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
          <div className="absolute -left-48 top-48 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.07),transparent_70%)]" />
          <div className="absolute -right-48 top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07),transparent_70%)]" />
        </div>
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-sm">
              <span className="text-base">🛂</span>
              Passport Power Index
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]"
          >
            <span className="text-white">How Powerful Is</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Your Passport?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-base text-white/45 sm:text-lg"
          >
            Discover your passport&apos;s global access score. See how many countries
            you can visit visa-free, on arrival, or with an eVisa — instantly.
          </motion.p>

          {/* Passport selector */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mx-auto mt-10 max-w-lg"
          >
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-sm shadow-2xl shadow-black/50">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
              <div className="relative rounded-xl bg-[#0C1526] px-4 py-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                  Select Your Passport Country
                </label>
                <div className="relative flex items-center gap-3">
                  <span className="text-2xl select-none">{flag}</span>
                  <select
                    value={passport}
                    onChange={e => setPassport(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm font-medium text-white outline-none pr-8"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#0C1526] text-gray-400">Choose your country…</option>
                    {PASSPORT_COUNTRIES.map(c => (
                      <option key={c} value={c} className="bg-[#0C1526] text-white">{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-white/30" />
                </div>
              </div>
            </div>

            {/* Quick picks */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-white/25">Try:</span>
              {['Pakistan', 'India', 'United States', 'United Kingdom', 'Japan', 'UAE'].map(c => (
                <button key={c}
                  onClick={() => setPassport(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    passport === c
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-white/45 hover:border-emerald-500/40 hover:text-white'
                  }`}
                >
                  {COUNTRY_FLAGS[c]} {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RESULTS ─────────────────────────────────────────────────── */}
      <div ref={resultsRef}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-xl px-4 py-20 text-center"
            >
              <div className="flex items-center justify-center gap-3 text-white/40">
                <svg className="h-5 w-5 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium text-emerald-400">Calculating passport strength…</span>
              </div>
            </motion.div>
          )}

          {counts && !loading && (
            <motion.div
              key={passport}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
            >

              {/* ── Score Section ──────────────────────────────────────── */}
              <section className="bg-[#0A1120] py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between md:gap-16">

                    {/* Score ring */}
                    <div className="flex flex-col items-center gap-4">
                      <ScoreRing score={score} size={220} />
                      {rank && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">
                          <span className="text-lg">🏅</span>
                          <span className="text-white/60">Ranks</span>
                          <span className="text-white">#{rank}</span>
                          <span className="text-white/60">globally</span>
                        </div>
                      )}
                    </div>

                    {/* Passport info + stats */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center gap-3 md:justify-start">
                        <span className="text-5xl">{flag}</span>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Passport Power</p>
                          <h2 className="text-3xl font-extrabold text-white">{passport}</h2>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard count={counts.visaFree}       label="Visa Free"   icon="🟢" color="#10b981" delay={0.1} />
                        <StatCard count={counts.eVisa}          label="eVisa"       icon="🔵" color="#3b82f6" delay={0.2} />
                        <StatCard count={counts.visaOnArrival}  label="On Arrival"  icon="🟡" color="#f59e0b" delay={0.3} />
                        <StatCard count={counts.visaRequired}   label="Visa Req."   icon="🔴" color="#ef4444" delay={0.4} />
                      </div>

                      <p className="mt-4 text-sm text-white/35">
                        Based on <span className="text-white font-semibold">{counts.total} destinations</span> in our database
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── World Map ──────────────────────────────────────────── */}
              <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-2">🗺️ Global Access</p>
                    <h2 className="text-2xl font-extrabold text-white">World Visa Map</h2>
                    <p className="mt-1 text-sm text-white/40">
                      Showing visa access for <strong className="text-white">{passport}</strong> passport holders
                    </p>
                  </div>
                  <WorldMapDots destinations={destinations} />
                </div>
              </section>

              {/* ── Top Destinations ──────────────────────────────────── */}
              <section className="bg-[#0A1120] py-16 sm:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                  <div className="grid gap-10 md:grid-cols-2">

                    {/* Top 10 easiest */}
                    <div>
                      <div className="mb-5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">✈️ Easiest Access</p>
                        <h3 className="text-xl font-extrabold text-white">Top 10 Visa-Free Destinations</h3>
                      </div>
                      {easiestDestinations.length === 0 ? (
                        <p className="text-sm text-white/35">No visa-free destinations found in our database for this passport.</p>
                      ) : (
                        <div className="space-y-2">
                          {easiestDestinations.map((d, i) => (
                            <Link
                              key={d.name}
                              href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(d.name)}`}
                              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-[#0C1526] px-4 py-3 transition hover:border-emerald-500/30 hover:bg-[#0f1e35]"
                            >
                              <span className="text-xs font-bold text-white/30 w-5 text-right">{i + 1}</span>
                              <span className="text-xl">{d.flag}</span>
                              <span className="flex-1 text-sm font-medium text-white">{d.name}</span>
                              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                                d.type === 'Visa Free'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-blue-500/15 text-blue-400'
                              }`}>{d.type}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400 transition" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top 5 hardest */}
                    <div>
                      <div className="mb-5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400 mb-1">🚫 Restricted Access</p>
                        <h3 className="text-xl font-extrabold text-white">Top 5 Hardest Destinations</h3>
                      </div>
                      {hardestDestinations.length === 0 ? (
                        <p className="text-sm text-white/35">No visa-required destinations found.</p>
                      ) : (
                        <div className="space-y-2">
                          {hardestDestinations.map((d, i) => (
                            <Link
                              key={d.name}
                              href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(d.name)}`}
                              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-[#0C1526] px-4 py-3 transition hover:border-rose-500/30 hover:bg-[#1a0f14]"
                            >
                              <span className="text-xs font-bold text-white/30 w-5 text-right">{i + 1}</span>
                              <span className="text-xl">{d.flag}</span>
                              <span className="flex-1 text-sm font-medium text-white">{d.name}</span>
                              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-rose-500/15 text-rose-400">Visa Required</span>
                              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-rose-400 transition" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Share Section ──────────────────────────────────────── */}
              <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                  <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#0C1526] p-8 sm:p-10 text-center">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />

                    <div className="relative">
                      <div className="text-4xl mb-4">✈️</div>
                      <h3 className="text-2xl font-extrabold text-white mb-2">Share Your Passport Score</h3>
                      <p className="text-sm text-white/40 mb-6">Let the world know how powerful your passport is!</p>

                      {/* Share text preview */}
                      <div className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 mb-6 text-left">
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line font-mono">
                          {`My ${passport} passport ${flag} can access ${counts.visaFree} countries visa-free!\nPassport Power Score: ${score}/100 🛂✈️\nCheck yours at visitplane.com/passport-strength`}
                        </p>
                      </div>

                      {/* Share buttons */}
                      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <button
                          onClick={handleCopy}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                            copied
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'border border-white/15 bg-white/8 text-white hover:bg-white/12'
                          }`}
                        >
                          {copied ? <CheckCircleIcon /> : <CopyIcon />}
                          {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>

                        <a
                          href={twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 px-5 py-2.5 text-sm font-bold text-[#1d9bf0] transition hover:bg-[#1d9bf0]/20"
                        >
                          <ShareIcon />
                          Share on X
                        </a>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-full border border-[#25d366]/30 bg-[#25d366]/10 px-5 py-2.5 text-sm font-bold text-[#25d366] transition hover:bg-[#25d366]/20"
                        >
                          <ShareIcon />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA: Check Specific Visa ────────────────────────────────── */}
      <section className="bg-[#0A1120] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-10 text-center sm:p-14">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/6" />
            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/6" />
            <div className="relative">
              <div className="mb-4 text-4xl">🔍</div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Check Visa Requirements</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
                Know your passport score? Now check detailed visa requirements for any specific destination.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Check Visa Requirements <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Read Travel Guides
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#040810] pb-8 pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-v2.png" alt="VisitPlane" width={30} height={30} className="rounded-xl" />
              <span className="text-base font-bold">
                <span className="text-white">Visit</span>
                <span className="text-emerald-400">Plane</span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xs text-white/30 hover:text-white transition">Home</Link>
              <Link href="/destinations" className="text-xs text-white/30 hover:text-white transition">Destinations</Link>
              <Link href="/passport-strength" className="text-xs text-emerald-400/70 hover:text-emerald-400 transition">Passport Strength</Link>
              <Link href="/blog" className="text-xs text-white/30 hover:text-white transition">Blog</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} VisitPlane. All rights reserved.</p>
            <p className="text-xs text-white/15">Passport scores are estimates. Verify with official embassy sources.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
