'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useUserCountry } from '@/hooks/useUserCountry'
import { getPassportFlag } from '@/components/PassportSwitcher'

const PassportSwitcher = dynamic(() => import('@/components/PassportSwitcher'), { ssr: false })

// ─── Data ──────────────────────────────────────────────────────────────────

export type Country = {
  name: string
  flag: string
  region: string
  visa: VisaCategory
  max_stay: string   // e.g. "30 days" | "90 days" | "—"
  fee_usd: string    // e.g. "Free" | "$50" | "Embassy quote"
  alt: string[]      // alternate search terms
  popular: number    // 1 = most popular; lower = less
}

export type VisaCategory =
  | 'Visa Free'
  | 'eVisa'
  | 'Visa on Arrival'
  | 'Visa Required'
  | 'Not Permitted'

// prettier-ignore
export const ALL_COUNTRIES: Country[] = [
  // ── Asia ─────────────────────────────────────────────────────────────────
  { name:'Afghanistan',   flag:'🇦🇫', region:'Asia',        visa:'Not Permitted',  max_stay:'—',       fee_usd:'—',               alt:['AF'],                     popular:197 },
  { name:'Armenia',       flag:'🇦🇲', region:'Asia',        visa:'eVisa',          max_stay:'21 days', fee_usd:'$6',              alt:['AM','Yerevan'],           popular:80  },
  { name:'Azerbaijan',    flag:'🇦🇿', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$26',             alt:['AZ','Baku'],              popular:75  },
  { name:'Bangladesh',    flag:'🇧🇩', region:'Asia',        visa:'Visa Required',  max_stay:'30 days', fee_usd:'$51',             alt:['BD','Dhaka'],             popular:90  },
  { name:'Bhutan',        flag:'🇧🇹', region:'Asia',        visa:'Visa Required',  max_stay:'—',       fee_usd:'$200+/day',       alt:['BT','Thimphu'],           popular:130 },
  { name:'Brunei',        flag:'🇧🇳', region:'Asia',        visa:'Visa Free',      max_stay:'14 days', fee_usd:'Free',            alt:['BN','Bandar Seri'],       popular:140 },
  { name:'Cambodia',      flag:'🇰🇭', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$36',             alt:['KH','Phnom Penh','Angkor Wat'], popular:40 },
  { name:'China',         flag:'🇨🇳', region:'Asia',        visa:'Visa Required',  max_stay:'30 days', fee_usd:'$140',            alt:['CN','Beijing','Shanghai','Peking'], popular:5 },
  { name:'Georgia',       flag:'🇬🇪', region:'Asia',        visa:'Visa Free',      max_stay:'365 days',fee_usd:'Free',            alt:['GE','Tbilisi'],           popular:50  },
  { name:'Hong Kong',     flag:'🇭🇰', region:'Asia',        visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['HK','HKG'],               popular:12  },
  { name:'India',         flag:'🇮🇳', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$25',             alt:['IN','Delhi','Mumbai','New Delhi'], popular:4 },
  { name:'Indonesia',     flag:'🇮🇩', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['ID','Bali','Jakarta'],    popular:8   },
  { name:'Iran',          flag:'🇮🇷', region:'Asia',        visa:'Visa Required',  max_stay:'30 days', fee_usd:'$75',             alt:['IR','Tehran','Persia'],   popular:100 },
  { name:'Japan',         flag:'🇯🇵', region:'Asia',        visa:'Visa Required',  max_stay:'15 days', fee_usd:'Embassy quote',   alt:['JP','Tokyo','Osaka'],     popular:2   },
  { name:'Kazakhstan',    flag:'🇰🇿', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$20',             alt:['KZ','Almaty','Astana'],   popular:65  },
  { name:'Kyrgyzstan',    flag:'🇰🇬', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['KG','Bishkek'],           popular:110 },
  { name:'Laos',          flag:'🇱🇦', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$35',             alt:['LA','Vientiane'],         popular:70  },
  { name:'Malaysia',      flag:'🇲🇾', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['MY','KL','Kuala Lumpur'], popular:10  },
  { name:'Maldives',      flag:'🇲🇻', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['MV','Malé','Male'],       popular:20  },
  { name:'Mongolia',      flag:'🇲🇳', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$53',             alt:['MN','Ulaanbaatar'],       popular:95  },
  { name:'Myanmar',       flag:'🇲🇲', region:'Asia',        visa:'Visa Required',  max_stay:'28 days', fee_usd:'$50',             alt:['MM','Burma','Yangon'],    popular:105 },
  { name:'Nepal',         flag:'🇳🇵', region:'Asia',        visa:'Visa on Arrival',max_stay:'90 days', fee_usd:'$30',             alt:['NP','Kathmandu','Everest'], popular:45 },
  { name:'North Korea',   flag:'🇰🇵', region:'Asia',        visa:'Not Permitted',  max_stay:'—',       fee_usd:'—',               alt:['KP','DPRK','Pyongyang'],  popular:197 },
  { name:'Pakistan',      flag:'🇵🇰', region:'Asia',        visa:'Visa Required',  max_stay:'30 days', fee_usd:'$75',             alt:['PK','Islamabad','Karachi','Lahore'], popular:55 },
  { name:'Philippines',   flag:'🇵🇭', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['PH','Manila','Cebu'],     popular:18  },
  { name:'Singapore',     flag:'🇸🇬', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['SG','SGP'],               popular:9   },
  { name:'South Korea',   flag:'🇰🇷', region:'Asia',        visa:'Visa Required',  max_stay:'30 days', fee_usd:'Embassy quote',   alt:['KR','Seoul','Korea'],     popular:6   },
  { name:'Sri Lanka',     flag:'🇱🇰', region:'Asia',        visa:'eVisa',          max_stay:'30 days', fee_usd:'$20',             alt:['LK','Colombo','Ceylon'],  popular:35  },
  { name:'Taiwan',        flag:'🇹🇼', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['TW','Taipei'],            popular:30  },
  { name:'Tajikistan',    flag:'🇹🇯', region:'Asia',        visa:'eVisa',          max_stay:'45 days', fee_usd:'$50',             alt:['TJ','Dushanbe'],          popular:120 },
  { name:'Thailand',      flag:'🇹🇭', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['TH','Bangkok','Phuket','Pattaya'], popular:1 },
  { name:'Timor-Leste',   flag:'🇹🇱', region:'Asia',        visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$30',             alt:['TL','East Timor','Dili'], popular:160 },
  { name:'Turkmenistan',  flag:'🇹🇲', region:'Asia',        visa:'Visa Required',  max_stay:'10 days', fee_usd:'$55',             alt:['TM','Ashgabat'],          popular:170 },
  { name:'Uzbekistan',    flag:'🇺🇿', region:'Asia',        visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['UZ','Tashkent','Samarkand'], popular:60 },
  { name:'Vietnam',       flag:'🇻🇳', region:'Asia',        visa:'eVisa',          max_stay:'90 days', fee_usd:'$25',             alt:['VN','Hanoi','Ho Chi Minh City','Saigon'], popular:7 },
  // ── Europe ───────────────────────────────────────────────────────────────
  { name:'Albania',       flag:'🇦🇱', region:'Europe',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['AL','Tirana'],            popular:85  },
  { name:'Andorra',       flag:'🇦🇩', region:'Europe',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['AD'],                     popular:135 },
  { name:'Austria',       flag:'🇦🇹', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['AT','Vienna','Wien'],      popular:22  },
  { name:'Belarus',       flag:'🇧🇾', region:'Europe',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$60',             alt:['BY','Minsk'],             popular:115 },
  { name:'Belgium',       flag:'🇧🇪', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['BE','Brussels','Bruges'], popular:28  },
  { name:'Bosnia and Herzegovina', flag:'🇧🇦', region:'Europe', visa:'Visa Free', max_stay:'90 days', fee_usd:'Free',            alt:['BA','Sarajevo'],          popular:90  },
  { name:'Bulgaria',      flag:'🇧🇬', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['BG','Sofia'],             popular:60  },
  { name:'Croatia',       flag:'🇭🇷', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['HR','Zagreb','Dubrovnik'], popular:32  },
  { name:'Cyprus',        flag:'🇨🇾', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['CY','Nicosia'],           popular:48  },
  { name:'Czech Republic',flag:'🇨🇿', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['CZ','Prague','Czechia'],  popular:25  },
  { name:'Denmark',       flag:'🇩🇰', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['DK','Copenhagen'],        popular:40  },
  { name:'Estonia',       flag:'🇪🇪', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['EE','Tallinn'],           popular:70  },
  { name:'Finland',       flag:'🇫🇮', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['FI','Helsinki'],          popular:55  },
  { name:'France',        flag:'🇫🇷', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['FR','Paris'],             popular:3   },
  { name:'Germany',       flag:'🇩🇪', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['DE','Berlin','Munich'],   popular:11  },
  { name:'Greece',        flag:'🇬🇷', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['GR','Athens','Santorini'], popular:14  },
  { name:'Hungary',       flag:'🇭🇺', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['HU','Budapest'],          popular:35  },
  { name:'Iceland',       flag:'🇮🇸', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['IS','Reykjavik'],         popular:50  },
  { name:'Ireland',       flag:'🇮🇪', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$100',            alt:['IE','Dublin'],            popular:42  },
  { name:'Italy',         flag:'🇮🇹', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['IT','Rome','Milan','Venice','Roma'], popular:7 },
  { name:'Kosovo',        flag:'🇽🇰', region:'Europe',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['XK','Pristina'],          popular:125 },
  { name:'Latvia',        flag:'🇱🇻', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['LV','Riga'],              popular:75  },
  { name:'Liechtenstein', flag:'🇱🇮', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['LI','Vaduz'],             popular:155 },
  { name:'Lithuania',     flag:'🇱🇹', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['LT','Vilnius'],           popular:78  },
  { name:'Luxembourg',    flag:'🇱🇺', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['LU','Luxembourg City'],   popular:88  },
  { name:'Malta',         flag:'🇲🇹', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['MT','Valletta'],          popular:62  },
  { name:'Moldova',       flag:'🇲🇩', region:'Europe',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['MD','Chisinau'],          popular:130 },
  { name:'Monaco',        flag:'🇲🇨', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['MC','Monte Carlo'],       popular:110 },
  { name:'Montenegro',    flag:'🇲🇪', region:'Europe',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['ME','Podgorica'],         popular:85  },
  { name:'Netherlands',   flag:'🇳🇱', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['NL','Amsterdam','Holland'], popular:16 },
  { name:'North Macedonia',flag:'🇲🇰', region:'Europe',     visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['MK','Skopje','Macedonia'], popular:115 },
  { name:'Norway',        flag:'🇳🇴', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['NO','Oslo'],              popular:45  },
  { name:'Poland',        flag:'🇵🇱', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['PL','Warsaw','Krakow'],   popular:30  },
  { name:'Portugal',      flag:'🇵🇹', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['PT','Lisbon','Porto'],     popular:19  },
  { name:'Romania',       flag:'🇷🇴', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['RO','Bucharest'],         popular:65  },
  { name:'Russia',        flag:'🇷🇺', region:'Europe',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['RU','Moscow','Saint Petersburg'], popular:33 },
  { name:'San Marino',    flag:'🇸🇲', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['SM'],                     popular:145 },
  { name:'Serbia',        flag:'🇷🇸', region:'Europe',      visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['RS','Belgrade'],          popular:70  },
  { name:'Slovakia',      flag:'🇸🇰', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['SK','Bratislava'],        popular:80  },
  { name:'Slovenia',      flag:'🇸🇮', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['SI','Ljubljana'],         popular:72  },
  { name:'Spain',         flag:'🇪🇸', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['ES','Madrid','Barcelona'], popular:6  },
  { name:'Sweden',        flag:'🇸🇪', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['SE','Stockholm'],         popular:38  },
  { name:'Switzerland',   flag:'🇨🇭', region:'Europe',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$80',             alt:['CH','Zurich','Geneva','Bern'], popular:23 },
  { name:'Turkey',        flag:'🇹🇷', region:'Europe',      visa:'eVisa',          max_stay:'90 days', fee_usd:'$50',             alt:['TR','Istanbul','Ankara','Turkiye'], popular:9 },
  { name:'Ukraine',       flag:'🇺🇦', region:'Europe',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['UA','Kyiv','Kiev'],        popular:68  },
  { name:'United Kingdom',flag:'🇬🇧', region:'Europe',      visa:'Visa Required',  max_stay:'6 months',fee_usd:'Embassy quote',   alt:['GB','UK','London','England','Scotland'], popular:5 },
  // ── Americas ─────────────────────────────────────────────────────────────
  { name:'Antigua and Barbuda', flag:'🇦🇬', region:'Americas', visa:'Visa Free',  max_stay:'6 months',fee_usd:'Free',            alt:['AG'],                     popular:105 },
  { name:'Argentina',     flag:'🇦🇷', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['AR','Buenos Aires'],      popular:27  },
  { name:'Bahamas',       flag:'🇧🇸', region:'Americas',    visa:'Visa Free',      max_stay:'8 months',fee_usd:'Free',            alt:['BS','Nassau'],            popular:60  },
  { name:'Barbados',      flag:'🇧🇧', region:'Americas',    visa:'Visa Free',      max_stay:'6 months',fee_usd:'Free',            alt:['BB','Bridgetown'],        popular:80  },
  { name:'Belize',        flag:'🇧🇿', region:'Americas',    visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['BZ','Belmopan'],          popular:95  },
  { name:'Bolivia',       flag:'🇧🇴', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['BO','La Paz','Sucre'],    popular:85  },
  { name:'Brazil',        flag:'🇧🇷', region:'Americas',    visa:'Visa Required',  max_stay:'90 days', fee_usd:'Embassy quote',   alt:['BR','Rio de Janeiro','São Paulo','Sao Paulo'], popular:15 },
  { name:'Canada',        flag:'🇨🇦', region:'Americas',    visa:'Visa Required',  max_stay:'6 months',fee_usd:'$100',            alt:['CA','Toronto','Vancouver','Ottawa'], popular:8 },
  { name:'Chile',         flag:'🇨🇱', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['CL','Santiago'],          popular:55  },
  { name:'Colombia',      flag:'🇨🇴', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['CO','Bogotá','Bogota','Medellín'], popular:40 },
  { name:'Costa Rica',    flag:'🇨🇷', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['CR','San José'],          popular:35  },
  { name:'Cuba',          flag:'🇨🇺', region:'Americas',    visa:'Visa Required',  max_stay:'30 days', fee_usd:'$50',             alt:['CU','Havana'],            popular:50  },
  { name:'Dominica',      flag:'🇩🇲', region:'Americas',    visa:'Visa Free',      max_stay:'6 months',fee_usd:'Free',            alt:['DM','Roseau'],            popular:130 },
  { name:'Dominican Republic', flag:'🇩🇴', region:'Americas', visa:'Visa on Arrival', max_stay:'30 days', fee_usd:'$10', alt:['DO','Santo Domingo','Punta Cana'], popular:25 },
  { name:'Ecuador',       flag:'🇪🇨', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['EC','Quito','Galapagos'], popular:48  },
  { name:'El Salvador',   flag:'🇸🇻', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['SV','San Salvador'],      popular:100 },
  { name:'Grenada',       flag:'🇬🇩', region:'Americas',    visa:'Visa Free',      max_stay:'6 months',fee_usd:'Free',            alt:['GD','St. George\'s'],     popular:120 },
  { name:'Guatemala',     flag:'🇬🇹', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['GT','Guatemala City'],    popular:70  },
  { name:'Guyana',        flag:'🇬🇾', region:'Americas',    visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['GY','Georgetown'],        popular:140 },
  { name:'Haiti',         flag:'🇭🇹', region:'Americas',    visa:'Visa Free',      max_stay:'3 months',fee_usd:'Free',            alt:['HT','Port-au-Prince'],    popular:150 },
  { name:'Honduras',      flag:'🇭🇳', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['HN','Tegucigalpa'],       popular:110 },
  { name:'Jamaica',       flag:'🇯🇲', region:'Americas',    visa:'Visa Free',      max_stay:'6 months',fee_usd:'Free',            alt:['JM','Kingston'],          popular:45  },
  { name:'Mexico',        flag:'🇲🇽', region:'Americas',    visa:'Visa Free',      max_stay:'180 days',fee_usd:'Free',            alt:['MX','Mexico City','Cancun','CDMX'], popular:4 },
  { name:'Nicaragua',     flag:'🇳🇮', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['NI','Managua'],           popular:115 },
  { name:'Panama',        flag:'🇵🇦', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['PA','Panama City'],       popular:52  },
  { name:'Paraguay',      flag:'🇵🇾', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['PY','Asunción'],          popular:125 },
  { name:'Peru',          flag:'🇵🇪', region:'Americas',    visa:'Visa Free',      max_stay:'183 days',fee_usd:'Free',            alt:['PE','Lima','Machu Picchu'], popular:30 },
  { name:'Saint Kitts and Nevis', flag:'🇰🇳', region:'Americas', visa:'Visa Free', max_stay:'6 months', fee_usd:'Free',          alt:['KN','Basseterre'],        popular:150 },
  { name:'Saint Lucia',   flag:'🇱🇨', region:'Americas',    visa:'Visa Free',      max_stay:'6 months',fee_usd:'Free',            alt:['LC','Castries'],          popular:120 },
  { name:'Saint Vincent and the Grenadines', flag:'🇻🇨', region:'Americas', visa:'Visa Free', max_stay:'6 months', fee_usd:'Free', alt:['VC'],                   popular:145 },
  { name:'Suriname',      flag:'🇸🇷', region:'Americas',    visa:'Visa Required',  max_stay:'60 days', fee_usd:'$25',             alt:['SR','Paramaribo'],        popular:155 },
  { name:'Trinidad and Tobago', flag:'🇹🇹', region:'Americas', visa:'Visa Free',  max_stay:'90 days', fee_usd:'Free',            alt:['TT','Port of Spain'],     popular:80  },
  { name:'United States', flag:'🇺🇸', region:'Americas',    visa:'Visa Required',  max_stay:'6 months',fee_usd:'$185',            alt:['US','USA','America','Washington DC','New York','NYC'], popular:2 },
  { name:'Uruguay',       flag:'🇺🇾', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['UY','Montevideo'],        popular:75  },
  { name:'Venezuela',     flag:'🇻🇪', region:'Americas',    visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['VE','Caracas'],           popular:120 },
  // ── Middle East ──────────────────────────────────────────────────────────
  { name:'Bahrain',       flag:'🇧🇭', region:'Middle East', visa:'eVisa',          max_stay:'14 days', fee_usd:'$9',              alt:['BH','Manama'],            popular:45  },
  { name:'Egypt',         flag:'🇪🇬', region:'Middle East', visa:'eVisa',          max_stay:'30 days', fee_usd:'$25',             alt:['EG','Cairo','Giza','Pyramids'], popular:10 },
  { name:'Iraq',          flag:'🇮🇶', region:'Middle East', visa:'Visa Required',  max_stay:'10 days', fee_usd:'$75',             alt:['IQ','Baghdad'],           popular:165 },
  { name:'Israel',        flag:'🇮🇱', region:'Middle East', visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['IL','Tel Aviv','Jerusalem'], popular:30 },
  { name:'Jordan',        flag:'🇯🇴', region:'Middle East', visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$20',             alt:['JO','Amman','Petra','Aqaba'], popular:28 },
  { name:'Kuwait',        flag:'🇰🇼', region:'Middle East', visa:'Visa Required',  max_stay:'30 days', fee_usd:'$70',             alt:['KW','Kuwait City'],       popular:75  },
  { name:'Lebanon',       flag:'🇱🇧', region:'Middle East', visa:'Visa Required',  max_stay:'30 days', fee_usd:'$75',             alt:['LB','Beirut'],            popular:100 },
  { name:'Oman',          flag:'🇴🇲', region:'Middle East', visa:'eVisa',          max_stay:'30 days', fee_usd:'$20',             alt:['OM','Muscat'],            popular:40  },
  { name:'Palestine',     flag:'🇵🇸', region:'Middle East', visa:'Visa Required',  max_stay:'—',       fee_usd:'—',               alt:['PS','Ramallah','Gaza'],   popular:135 },
  { name:'Qatar',         flag:'🇶🇦', region:'Middle East', visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['QA','Doha'],              popular:22  },
  { name:'Saudi Arabia',  flag:'🇸🇦', region:'Middle East', visa:'eVisa',          max_stay:'90 days', fee_usd:'$130',            alt:['SA','Riyadh','Jeddah','KSA'], popular:20 },
  { name:'Syria',         flag:'🇸🇾', region:'Middle East', visa:'Visa Required',  max_stay:'15 days', fee_usd:'$70',             alt:['SY','Damascus'],          popular:180 },
  { name:'UAE',           flag:'🇦🇪', region:'Middle East', visa:'eVisa',          max_stay:'30 days', fee_usd:'$90',             alt:['AE','Dubai','Abu Dhabi','United Arab Emirates','Emirates'], popular:13 },
  { name:'Yemen',         flag:'🇾🇪', region:'Middle East', visa:'Visa Required',  max_stay:'30 days', fee_usd:'$55',             alt:['YE','Sanaa'],             popular:185 },
  // ── Africa ───────────────────────────────────────────────────────────────
  { name:'Algeria',       flag:'🇩🇿', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$35',             alt:['DZ','Algiers'],           popular:80  },
  { name:'Angola',        flag:'🇦🇴', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$120',            alt:['AO','Luanda'],            popular:140 },
  { name:'Benin',         flag:'🇧🇯', region:'Africa',      visa:'eVisa',          max_stay:'30 days', fee_usd:'$50',             alt:['BJ','Cotonou'],           popular:145 },
  { name:'Botswana',      flag:'🇧🇼', region:'Africa',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['BW','Gaborone'],          popular:100 },
  { name:'Burkina Faso',  flag:'🇧🇫', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$50',             alt:['BF','Ouagadougou'],       popular:165 },
  { name:'Burundi',       flag:'🇧🇮', region:'Africa',      visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$90',             alt:['BI','Bujumbura'],         popular:175 },
  { name:'Cameroon',      flag:'🇨🇲', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['CM','Yaoundé'],           popular:130 },
  { name:'Cape Verde',    flag:'🇨🇻', region:'Africa',      visa:'eVisa',          max_stay:'30 days', fee_usd:'$25',             alt:['CV','Praia'],             popular:90  },
  { name:'Central African Republic', flag:'🇨🇫', region:'Africa', visa:'Visa Required', max_stay:'—', fee_usd:'Embassy quote',  alt:['CF','Bangui'],            popular:190 },
  { name:'Chad',          flag:'🇹🇩', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$80',             alt:['TD','N\'Djamena'],        popular:185 },
  { name:'Comoros',       flag:'🇰🇲', region:'Africa',      visa:'Visa on Arrival',max_stay:'45 days', fee_usd:'$30',             alt:['KM','Moroni'],            popular:170 },
  { name:'Democratic Republic of the Congo', flag:'🇨🇩', region:'Africa', visa:'Visa Required', max_stay:'30 days', fee_usd:'$100', alt:['CD','DRC','Kinshasa'], popular:175 },
  { name:'Djibouti',      flag:'🇩🇯', region:'Africa',      visa:'eVisa',          max_stay:'31 days', fee_usd:'$30',             alt:['DJ'],                     popular:155 },
  { name:'Equatorial Guinea', flag:'🇬🇶', region:'Africa',  visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['GQ','Malabo'],            popular:180 },
  { name:'Eritrea',       flag:'🇪🇷', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$70',             alt:['ER','Asmara'],            popular:178 },
  { name:'Ethiopia',      flag:'🇪🇹', region:'Africa',      visa:'eVisa',          max_stay:'30 days', fee_usd:'$72',             alt:['ET','Addis Ababa'],       popular:65  },
  { name:'Gabon',         flag:'🇬🇦', region:'Africa',      visa:'eVisa',          max_stay:'90 days', fee_usd:'$85',             alt:['GA','Libreville'],        popular:150 },
  { name:'Gambia',        flag:'🇬🇲', region:'Africa',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['GM','Banjul'],            popular:130 },
  { name:'Ghana',         flag:'🇬🇭', region:'Africa',      visa:'Visa Required',  max_stay:'60 days', fee_usd:'$100',            alt:['GH','Accra'],             popular:55  },
  { name:'Guinea',        flag:'🇬🇳', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['GN','Conakry'],           popular:165 },
  { name:'Guinea-Bissau', flag:'🇬🇼', region:'Africa',      visa:'Visa on Arrival',max_stay:'90 days', fee_usd:'$50',             alt:['GW','Bissau'],            popular:180 },
  { name:'Ivory Coast',   flag:'🇨🇮', region:'Africa',      visa:'Visa Required',  max_stay:'90 days', fee_usd:'$70',             alt:['CI','Cote d\'Ivoire','Abidjan'], popular:120 },
  { name:'Kenya',         flag:'🇰🇪', region:'Africa',      visa:'eVisa',          max_stay:'90 days', fee_usd:'$51',             alt:['KE','Nairobi','Mombasa','Safari'], popular:22 },
  { name:'Lesotho',       flag:'🇱🇸', region:'Africa',      visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['LS','Maseru'],            popular:155 },
  { name:'Liberia',       flag:'🇱🇷', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['LR','Monrovia'],          popular:170 },
  { name:'Libya',         flag:'🇱🇾', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'Embassy quote',   alt:['LY','Tripoli'],           popular:175 },
  { name:'Madagascar',    flag:'🇲🇬', region:'Africa',      visa:'Visa on Arrival',max_stay:'90 days', fee_usd:'$35',             alt:['MG','Antananarivo'],      popular:85  },
  { name:'Malawi',        flag:'🇲🇼', region:'Africa',      visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['MW','Lilongwe'],          popular:140 },
  { name:'Mali',          flag:'🇲🇱', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['ML','Bamako'],            popular:170 },
  { name:'Mauritania',    flag:'🇲🇷', region:'Africa',      visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$55',             alt:['MR','Nouakchott'],        popular:165 },
  { name:'Mauritius',     flag:'🇲🇺', region:'Africa',      visa:'Visa Free',      max_stay:'60 days', fee_usd:'Free',            alt:['MU','Port Louis'],        popular:60  },
  { name:'Morocco',       flag:'🇲🇦', region:'Africa',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['MA','Marrakech','Casablanca','Fez'], popular:15 },
  { name:'Mozambique',    flag:'🇲🇿', region:'Africa',      visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$50',             alt:['MZ','Maputo'],            popular:130 },
  { name:'Namibia',       flag:'🇳🇦', region:'Africa',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['NA','Windhoek'],          popular:75  },
  { name:'Niger',         flag:'🇳🇪', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['NE','Niamey'],            popular:180 },
  { name:'Nigeria',       flag:'🇳🇬', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['NG','Lagos','Abuja'],     popular:35  },
  { name:'Republic of the Congo', flag:'🇨🇬', region:'Africa', visa:'Visa Required', max_stay:'30 days', fee_usd:'$100',         alt:['CG','Brazzaville'],       popular:175 },
  { name:'Rwanda',        flag:'🇷🇼', region:'Africa',      visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['RW','Kigali'],            popular:65  },
  { name:'Sao Tome and Principe', flag:'🇸🇹', region:'Africa', visa:'Visa on Arrival', max_stay:'15 days', fee_usd:'$50',        alt:['ST','São Tomé'],          popular:175 },
  { name:'Senegal',       flag:'🇸🇳', region:'Africa',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['SN','Dakar'],             popular:72  },
  { name:'Seychelles',    flag:'🇸🇨', region:'Africa',      visa:'Visa Free',      max_stay:'3 months',fee_usd:'Free',            alt:['SC','Victoria','Mahé'],   popular:48  },
  { name:'Sierra Leone',  flag:'🇸🇱', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$80',             alt:['SL','Freetown'],          popular:160 },
  { name:'Somalia',       flag:'🇸🇴', region:'Africa',      visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$60',             alt:['SO','Mogadishu'],         popular:185 },
  { name:'South Africa',  flag:'🇿🇦', region:'Africa',      visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['ZA','Johannesburg','Cape Town','Durban'], popular:18 },
  { name:'South Sudan',   flag:'🇸🇸', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['SS','Juba'],              popular:188 },
  { name:'Sudan',         flag:'🇸🇩', region:'Africa',      visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['SD','Khartoum'],          popular:185 },
  { name:'Swaziland',     flag:'🇸🇿', region:'Africa',      visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['SZ','Eswatini','Mbabane'], popular:155 },
  { name:'Tanzania',      flag:'🇹🇿', region:'Africa',      visa:'eVisa',          max_stay:'90 days', fee_usd:'$50',             alt:['TZ','Dar es Salaam','Zanzibar','Kilimanjaro'], popular:28 },
  { name:'Togo',          flag:'🇹🇬', region:'Africa',      visa:'eVisa',          max_stay:'30 days', fee_usd:'$50',             alt:['TG','Lomé'],              popular:150 },
  { name:'Tunisia',       flag:'🇹🇳', region:'Africa',      visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['TN','Tunis','Carthage'],  popular:40  },
  { name:'Uganda',        flag:'🇺🇬', region:'Africa',      visa:'eVisa',          max_stay:'90 days', fee_usd:'$50',             alt:['UG','Kampala'],           popular:62  },
  { name:'Zambia',        flag:'🇿🇲', region:'Africa',      visa:'eVisa',          max_stay:'90 days', fee_usd:'$50',             alt:['ZM','Lusaka','Victoria Falls'], popular:78 },
  { name:'Zimbabwe',      flag:'🇿🇼', region:'Africa',      visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$30',             alt:['ZW','Harare'],            popular:110 },
  // ── Oceania ──────────────────────────────────────────────────────────────
  { name:'Australia',     flag:'🇦🇺', region:'Oceania',     visa:'eVisa',          max_stay:'3 months',fee_usd:'$20',             alt:['AU','Sydney','Melbourne','AUS'], popular:9 },
  { name:'Fiji',          flag:'🇫🇯', region:'Oceania',     visa:'Visa Free',      max_stay:'4 months',fee_usd:'Free',            alt:['FJ','Suva','Nadi'],       popular:42  },
  { name:'Kiribati',      flag:'🇰🇮', region:'Oceania',     visa:'Visa on Arrival',max_stay:'28 days', fee_usd:'$0',              alt:['KI','South Tarawa'],      popular:185 },
  { name:'Marshall Islands', flag:'🇲🇭', region:'Oceania',  visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['MH','Majuro'],            popular:180 },
  { name:'Micronesia',    flag:'🇫🇲', region:'Oceania',     visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['FM','Palikir'],           popular:180 },
  { name:'Nauru',         flag:'🇳🇷', region:'Oceania',     visa:'Visa Required',  max_stay:'30 days', fee_usd:'$100',            alt:['NR','Yaren'],             popular:190 },
  { name:'New Zealand',   flag:'🇳🇿', region:'Oceania',     visa:'eVisa',          max_stay:'3 months',fee_usd:'$9',              alt:['NZ','Auckland','Wellington','NZL'], popular:17 },
  { name:'Palau',         flag:'🇵🇼', region:'Oceania',     visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['PW','Ngerulmud'],         popular:135 },
  { name:'Papua New Guinea', flag:'🇵🇬', region:'Oceania',  visa:'Visa on Arrival',max_stay:'60 days', fee_usd:'$50',             alt:['PG','Port Moresby','PNG'], popular:155 },
  { name:'Samoa',         flag:'🇼🇸', region:'Oceania',     visa:'Visa Free',      max_stay:'60 days', fee_usd:'Free',            alt:['WS','Apia'],              popular:145 },
  { name:'Solomon Islands', flag:'🇸🇧', region:'Oceania',   visa:'Visa Free',      max_stay:'90 days', fee_usd:'Free',            alt:['SB','Honiara'],           popular:170 },
  { name:'Tonga',         flag:'🇹🇴', region:'Oceania',     visa:'Visa Free',      max_stay:'31 days', fee_usd:'Free',            alt:['TO','Nukualofa'],         popular:160 },
  { name:'Tuvalu',        flag:'🇹🇻', region:'Oceania',     visa:'Visa on Arrival',max_stay:'30 days', fee_usd:'$0',              alt:['TV','Funafuti'],          popular:190 },
  { name:'Vanuatu',       flag:'🇻🇺', region:'Oceania',     visa:'Visa Free',      max_stay:'30 days', fee_usd:'Free',            alt:['VU','Port Vila'],         popular:140 },
]

// ─── Constants ─────────────────────────────────────────────────────────────

const VISA_CATEGORIES: VisaCategory[] = [
  'Visa Free', 'eVisa', 'Visa on Arrival', 'Visa Required', 'Not Permitted',
]

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa', 'Oceania']

const POPULAR_SUGGESTIONS = ['Thailand', 'UAE', 'France']

const BADGE: Record<VisaCategory, { bg: string; text: string; border: string; dot: string }> = {
  'Visa Free':       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'eVisa':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-400'   },
  'Visa on Arrival': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30',    dot: 'bg-blue-400'    },
  'Visa Required':   { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30',    dot: 'bg-rose-400'    },
  'Not Permitted':   { bg: 'bg-gray-500/15',    text: 'text-gray-400',    border: 'border-gray-500/30',    dot: 'bg-gray-500'    },
}

const EASE_ORDER: Record<VisaCategory, number> = {
  'Visa Free': 0, 'eVisa': 1, 'Visa on Arrival': 2, 'Visa Required': 3, 'Not Permitted': 4,
}

// Highlight query match in a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-400/25 text-emerald-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function DestinationsClient() {
  const { countryName } = useUserCountry()

  const [passport, setPassport]           = useState('United States')
  const [showSwitcher, setShowSwitcher]   = useState(false)
  const [rawSearch, setRawSearch]         = useState('')
  const [search, setSearch]               = useState('')
  const [visaFilters, setVisaFilters]     = useState<VisaCategory[]>([])
  const [region, setRegion]               = useState('All')
  const [sort, setSort]                   = useState<'az' | 'za' | 'cheapest' | 'easiest' | 'popular'>('popular')
  const [passportReady, setPassportReady] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Hydrate passport from localStorage / geo ──────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('visitplane_passport')
      if (stored) { setPassport(stored); setPassportReady(true); return }
    } catch { /* ignore */ }
    setPassportReady(false)
  }, [])

  useEffect(() => {
    if (passportReady) return
    if (countryName) { setPassport(countryName); setPassportReady(true) }
  }, [countryName, passportReady])

  // ── Debounced search ──────────────────────────────────────────────────
  const handleSearchInput = useCallback((val: string) => {
    setRawSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setSearch(val), 150)
  }, [])

  // ── Toggle visa filter chip ───────────────────────────────────────────
  const toggleVisa = useCallback((cat: VisaCategory) => {
    setVisaFilters((prev) =>
      prev.includes(cat) ? prev.filter((v) => v !== cat) : [...prev, cat]
    )
  }, [])

  // ── Filtered + sorted list ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    let list = ALL_COUNTRIES.filter((c) => {
      if (q) {
        const inName = c.name.toLowerCase().includes(q)
        const inAlt  = c.alt.some((a) => a.toLowerCase().includes(q))
        if (!inName && !inAlt) return false
      }
      if (visaFilters.length && !visaFilters.includes(c.visa)) return false
      if (region !== 'All' && c.region !== region) return false
      return true
    })

    switch (sort) {
      case 'az':       list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':       list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break
      case 'cheapest': list = [...list].sort((a, b) => {
        const fa = a.fee_usd === 'Free' ? 0 : a.fee_usd === '—' || a.fee_usd.includes('Embassy') ? 9999 : parseInt(a.fee_usd.replace(/\D/g, '')) || 0
        const fb = b.fee_usd === 'Free' ? 0 : b.fee_usd === '—' || b.fee_usd.includes('Embassy') ? 9999 : parseInt(b.fee_usd.replace(/\D/g, '')) || 0
        return fa - fb
      }); break
      case 'easiest':  list = [...list].sort((a, b) => EASE_ORDER[a.visa] - EASE_ORDER[b.visa]); break
      case 'popular':  list = [...list].sort((a, b) => a.popular - b.popular); break
    }
    return list
  }, [search, visaFilters, region, sort])

  // ── Count badges for visa chips ───────────────────────────────────────
  const visaCounts = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = ALL_COUNTRIES.filter((c) => {
      if (q) {
        const inName = c.name.toLowerCase().includes(q)
        const inAlt  = c.alt.some((a) => a.toLowerCase().includes(q))
        if (!inName && !inAlt) return false
      }
      if (region !== 'All' && c.region !== region) return false
      return true
    })
    return VISA_CATEGORIES.reduce<Record<VisaCategory, number>>((acc, cat) => {
      acc[cat] = base.filter((c) => c.visa === cat).length
      return acc
    }, {} as Record<VisaCategory, number>)
  }, [search, region])

  const passportFlag = getPassportFlag(passport)

  return (
    <>
      {/* ── Passport switcher modal ────────────────────────────────────── */}
      {showSwitcher && (
        <PassportSwitcher
          current={passport}
          onSelect={setPassport}
          onClose={() => setShowSwitcher(false)}
        />
      )}

      <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.10),transparent_65%)]" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
              🌍 {ALL_COUNTRIES.length} Countries
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-[#0f0c29]">All </span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Destinations
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-gray-500">
              Visa requirements for {ALL_COUNTRIES.length} countries — fees, stay limits, and how to apply.
            </p>

            {/* Passport pill */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Your passport:</span>
              <button
                onClick={() => setShowSwitcher(true)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0f0c29] shadow-sm hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all"
                aria-label="Change passport country"
              >
                <span>{passportFlag}</span>
                <span>{passport}</span>
                <span className="text-xs text-emerald-500 font-normal">[Change]</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Sticky filter bar ───────────────────────────────────────── */}
        <div className="sticky top-16 z-30 border-b border-gray-200/70 bg-[#FAFAFA]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-3">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
              <input
                type="search"
                value={rawSearch}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search countries… (try &quot;Dubai&quot; or &quot;UAE&quot;)"
                aria-label="Search countries"
                className="w-full rounded-xl border border-gray-200 bg-white pl-11 pr-10 py-2.5 text-sm text-[#0f0c29] placeholder-gray-400 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition"
              />
              {rawSearch && (
                <button
                  onClick={() => { setRawSearch(''); setSearch('') }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-lg leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Visa filter chips */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* All chip */}
              <button
                onClick={() => setVisaFilters([])}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all border ${
                  visaFilters.length === 0
                    ? 'bg-[#0f0c29] text-white border-[#0f0c29] shadow'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                All <span className="opacity-60 font-normal ml-0.5">({ALL_COUNTRIES.length})</span>
              </button>
              {VISA_CATEGORIES.map((cat) => {
                const active = visaFilters.includes(cat)
                const b = BADGE[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => toggleVisa(cat)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold border transition-all ${
                      active
                        ? `${b.bg} ${b.text} ${b.border}`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cat}{' '}
                    <span className="opacity-60 font-normal ml-0.5">({visaCounts[cat]})</span>
                  </button>
                )
              })}
            </div>

            {/* Region + Sort row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Region dropdown */}
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                aria-label="Filter by region"
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>
                ))}
              </select>

              {/* Sort dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label="Sort destinations"
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500/60 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="cheapest">Cheapest First</option>
                <option value="easiest">Easiest First</option>
              </select>

              {/* Result count */}
              <span className="ml-auto text-xs text-gray-400 shrink-0">
                {filtered.length === ALL_COUNTRIES.length
                  ? `${ALL_COUNTRIES.length} countries`
                  : `${filtered.length} of ${ALL_COUNTRIES.length}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Grid ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center py-24 text-center">
              <span className="text-5xl mb-4">🔭</span>
              <p className="text-lg font-semibold text-[#0f0c29]">
                No countries match &ldquo;{search}&rdquo;
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search or{' '}
                <button
                  onClick={() => { setRawSearch(''); setSearch(''); setVisaFilters([]); setRegion('All') }}
                  className="text-emerald-500 underline underline-offset-2 hover:text-emerald-600"
                >
                  clear all filters
                </button>
              </p>
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Popular Destinations</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {POPULAR_SUGGESTIONS.map((name) => {
                    const c = ALL_COUNTRIES.find((x) => x.name === name)!
                    return (
                      <Link
                        key={name}
                        href={`/visa/${encodeURIComponent(passport)}/${encodeURIComponent(name)}`}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:border-emerald-500/40 hover:shadow transition"
                      >
                        <span>{c.flag}</span>
                        <span>{name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              role="list"
              aria-label="Destination countries"
            >
              {filtered.map((country) => {
                const badge = BADGE[country.visa]
                const href = `/visa/${encodeURIComponent(passport)}/${encodeURIComponent(country.name)}`
                return (
                  <Link
                    key={country.name}
                    href={href}
                    prefetch={country.popular <= 10}
                    role="listitem"
                    className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`${country.name} — ${country.visa}`}
                  >
                    {/* Flag + name */}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none" role="img" aria-label={country.name}>{country.flag}</span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="truncate text-sm font-bold text-[#0f0c29] leading-tight">
                          <Highlight text={country.name} query={search} />
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{country.region}</div>
                      </div>
                    </div>

                    {/* Visa badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                        {country.visa}
                      </span>
                    </div>

                    {/* Stay + fee */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span title="Max stay">✈ {country.max_stay}</span>
                      <span title="Approx. fee" className="font-medium">
                        {country.fee_usd === 'Free'
                          ? <span className="text-emerald-500 font-bold">Free</span>
                          : country.fee_usd === '—'
                          ? <span className="text-gray-300">—</span>
                          : country.fee_usd}
                      </span>
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute bottom-3 right-4 text-[11px] font-semibold text-gray-300 group-hover:text-emerald-500 transition-colors">
                      View details →
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
