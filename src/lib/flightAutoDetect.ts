// Auto-detection helpers for the /flight-compensation form.
//
// Goal: don't make the user manually classify things the tool can figure out
// itself from what they've already typed. Both helpers below are *suggestions*
// only — the page still lets the user override either one by hand, and if
// nothing matches, the existing manual toggle groups are the fallback.

// ─── Distance band, from departure/arrival country ────────────────────────────
// Approximate country centroids (lat, lng), used only to estimate a great-circle
// distance and bucket it into EU261's short/medium/long-haul bands. This is a
// deliberate approximation — the same order of precision already implied by the
// "Not sure? Paris–Rome ≈ 1,100 km" helper text next to the manual picker.
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  'Afghanistan': [34.13, 66.59],
  'Albania': [41.14, 20.06],
  'Algeria': [28.35, 2.66],
  'Andorra': [42.55, 1.58],
  'Angola': [-12.17, 17.65],
  'Antigua and Barbuda': [17.07, -61.79],
  'Argentina': [-35.7, -64.53],
  'Armenia': [40.18, 45.05],
  'Australia': [-25.7, 134.02],
  'Austria': [47.63, 13.8],
  'Azerbaijan': [40.39, 48.63],
  'Bahamas': [24.72, -78.07],
  'Bahrain': [26.05, 50.54],
  'Bangladesh': [23.67, 90.43],
  'Barbados': [13.18, -59.56],
  'Belarus': [53.47, 27.96],
  'Belgium': [50.62, 4.68],
  'Belize': [17.24, -88.68],
  'Benin': [9.5, 2.31],
  'Bhutan': [27.42, 90.47],
  'Bolivia': [-16.73, -64.45],
  'Bosnia and Herzegovina': [44.14, 17.83],
  'Botswana': [-22.24, 23.86],
  'Brazil': [-11.52, -54.36],
  'Brunei': [4.54, 114.64],
  'Bulgaria': [42.82, 25.25],
  'Burkina Faso': [12.11, -1.69],
  'Burundi': [-3.26, 29.89],
  'Cambodia': [12.7, 105.04],
  'Cameroon': [6.29, 12.95],
  'Canada': [57.55, -98.42],
  'Cape Verde': [15.08, -23.63],
  'Central African Republic': [6.33, 20.52],
  'Chad': [15.28, 18.43],
  'Chile': [-37.83, -70.77],
  'China': [38.07, 104.69],
  'Colombia': [4.19, -72.64],
  'Comoros': [-11.66, 43.35],
  'Congo': [-0.73, 14.88],
  'Costa Rica': [9.86, -84.15],
  'Croatia': [44.91, 16.63],
  'Cuba': [21.48, -79.7],
  'Cyprus': [35.12, 33.38],
  'Czech Republic': [49.75, 15.38],
  'DR Congo': [-3.34, 23.42],
  'Denmark': [56.0, 9.38],
  'Djibouti': [11.75, 42.61],
  'Dominica': [15.43, -61.36],
  'Dominican Republic': [18.78, -70.43],
  'Ecuador': [-1.56, -78.46],
  'Egypt': [26.61, 30.24],
  'El Salvador': [13.76, -88.86],
  'Equatorial Guinea': [1.6, 10.43],
  'Eritrea': [15.01, 39.27],
  'Estonia': [58.65, 25.92],
  'Eswatini': [-26.56, 31.51],
  'Ethiopia': [8.73, 39.91],
  'Fiji': [-17.82, 177.98],
  'Finland': [65.02, 25.66],
  'France': [46.64, 2.19],
  'Gabon': [-0.63, 11.84],
  'Gambia': [13.43, -15.38],
  'Georgia': [42.18, 43.38],
  'Germany': [51.08, 10.43],
  'Ghana': [7.95, -1.22],
  'Greece': [39.42, 23.11],
  'Grenada': [12.11, -61.68],
  'Guatemala': [15.82, -90.31],
  'Guinea': [10.26, -10.99],
  'Guinea-Bissau': [11.98, -14.98],
  'Guyana': [4.68, -58.91],
  'Haiti': [18.88, -72.89],
  'Honduras': [14.74, -86.49],
  'Hungary': [47.23, 19.4],
  'Iceland': [65.12, -19.06],
  'India': [23.59, 81.17],
  'Indonesia': [0.16, 113.97],
  'Iran': [32.91, 54.24],
  'Iraq': [33.11, 43.83],
  'Ireland': [53.3, -8.24],
  'Israel': [31.51, 35.03],
  'Italy': [42.98, 12.76],
  'Ivory Coast': [7.54, -5.57],
  'Jamaica': [18.12, -77.3],
  'Japan': [36.77, 137.47],
  'Jordan': [31.39, 36.96],
  'Kazakhstan': [47.64, 66.38],
  'Kenya': [0.69, 37.95],
  'Kiribati': [1.87, -157.39],
  'Kosovo': [42.6, 20.9],
  'Kuwait': [29.28, 47.56],
  'Kyrgyzstan': [41.36, 74.18],
  'Laos': [18.12, 103.76],
  'Latvia': [56.81, 24.69],
  'Lebanon': [33.91, 35.9],
  'Lesotho': [-29.6, 28.24],
  'Liberia': [6.52, -9.26],
  'Libya': [27.2, 17.91],
  'Liechtenstein': [47.15, 9.55],
  'Lithuania': [55.29, 23.95],
  'Luxembourg': [49.78, 6.1],
  'Madagascar': [-19.04, 46.68],
  'Malawi': [-13.13, 34.23],
  'Malaysia': [3.67, 114.63],
  'Maldives': [-0.61, 73.1],
  'Mali': [17.17, -4.35],
  'Malta': [35.89, 14.44],
  'Marshall Islands': [7.31, 168.72],
  'Mauritania': [20.47, -10.5],
  'Mauritius': [-20.28, 57.56],
  'Mexico': [23.87, -101.55],
  'Micronesia': [6.88, 158.23],
  'Moldova': [47.07, 28.39],
  'Monaco': [43.75, 7.41],
  'Mongolia': [47.09, 103.4],
  'Montenegro': [42.74, 19.3],
  'Morocco': [28.69, -8.82],
  'Mozambique': [-17.53, 35.21],
  'Myanmar': [19.9, 97.09],
  'Namibia': [-21.91, 18.16],
  'Nauru': [-0.52, 166.93],
  'Nepal': [28.3, 84.13],
  'Netherlands': [52.13, 5.55],
  'New Zealand': [-43.83, 170.69],
  'Nicaragua': [12.89, -85.02],
  'Niger': [17.08, 8.87],
  'Nigeria': [9.61, 8.15],
  'North Korea': [40.19, 127.34],
  'North Macedonia': [41.59, 21.71],
  'Norway': [64.98, 16.67],
  'Oman': [20.72, 55.84],
  'Pakistan': [30.12, 69.09],
  'Palau': [7.53, 134.58],
  'Palestine': [31.93, 35.24],
  'Panama': [8.44, -80.14],
  'Papua New Guinea': [-7.16, 144.83],
  'Paraguay': [-23.42, -58.39],
  'Peru': [-8.52, -74.11],
  'Philippines': [15.59, 121.82],
  'Poland': [52.07, 19.44],
  'Portugal': [39.68, -7.93],
  'Qatar': [25.32, 51.2],
  'Romania': [45.82, 25.09],
  'Russia': [59.04, 98.67],
  'Rwanda': [-2.01, 29.92],
  'Saint Kitts and Nevis': [17.31, -62.75],
  'Saint Lucia': [13.9, -60.97],
  'Saint Vincent and the Grenadines': [13.25, -61.19],
  'Samoa': [-13.63, -172.44],
  'San Marino': [43.94, 12.46],
  'Sao Tome and Principe': [0.23, 6.61],
  'Saudi Arabia': [24.14, 44.6],
  'Senegal': [14.23, -14.61],
  'Serbia': [44.03, 20.86],
  'Seychelles': [-4.66, 55.47],
  'Sierra Leone': [8.56, -11.79],
  'Singapore': [1.35, 103.81],
  'Slovakia': [48.7, 19.58],
  'Slovenia': [46.14, 14.89],
  'Solomon Islands': [-9.61, 160.16],
  'Somalia': [6.52, 45.4],
  'South Africa': [-28.55, 24.75],
  'South Korea': [36.4, 127.76],
  'South Sudan': [7.66, 30.39],
  'Spain': [28.3, -16.54],
  'Sri Lanka': [7.7, 80.67],
  'Sudan': [15.67, 29.95],
  'Suriname': [4.1, -55.86],
  'Sweden': [62.73, 17.06],
  'Switzerland': [46.74, 8.29],
  'Syria': [35.1, 38.51],
  'Taiwan': [23.7, 121.0],
  'Tajikistan': [38.57, 70.94],
  'Tanzania': [-6.36, 34.82],
  'Thailand': [13.66, 101.09],
  'Timor-Leste': [-8.81, 125.95],
  'Togo': [8.66, 0.9],
  'Tonga': [-21.16, -175.2],
  'Trinidad and Tobago': [10.42, -61.37],
  'Tunisia': [34.09, 9.66],
  'Turkey': [38.93, 35.57],
  'Turkmenistan': [39.06, 58.46],
  'Tuvalu': [-8.51, 179.22],
  'Uganda': [1.28, 32.34],
  'Ukraine': [48.66, 31.27],
  'United Arab Emirates': [24.18, 54.28],
  'United Kingdom': [53.98, -2.85],
  'United States': [38.82, -96.33],
  'Uruguay': [-32.78, -56.02],
  'Uzbekistan': [41.49, 63.85],
  'Vanuatu': [-15.19, 166.85],
  'Vatican City': [41.9, 12.45],
  'Venezuela': [7.15, -66.36],
  'Vietnam': [16.52, 105.91],
  'Yemen': [16.0, 47.47],
  'Zambia': [-13.16, 27.76],
  'Zimbabwe': [-18.93, 29.72],
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(s))
}

/**
 * Estimate an EU261 distance band from two country names. Returns null if
 * either country isn't in the lookup or they're the same country (domestic —
 * distance band is irrelevant since EU261 doesn't apply to purely domestic
 * flights the way this tool models routes), so the caller can fall back to
 * asking the user directly.
 */
export function estimateDistanceBand(
  departureCountry: string,
  arrivalCountry: string
): { band: 'short' | 'medium' | 'long'; km: number } | null {
  const a = COUNTRY_CENTROIDS[departureCountry]
  const b = COUNTRY_CENTROIDS[arrivalCountry]
  if (!a || !b || departureCountry === arrivalCountry) return null
  const km = haversineKm(a, b)
  const band = km <= 1500 ? 'short' : km <= 3500 ? 'medium' : 'long'
  return { band, km: Math.round(km) }
}

// ─── Carrier region, from a typed airline name ────────────────────────────────
// Case-insensitive substring match against common airline names. Not
// exhaustive — if nothing matches, the caller should fall back to asking the
// user directly (the manual toggle stays in place either way).
const AIRLINE_REGION_HINTS: { match: string; region: 'eu_eea' | 'uk' | 'other' }[] = [
  // EU/EEA (and Switzerland/Norway/Iceland, which EU261 also treats as in-scope
  // via bilateral agreement / EEA membership)
  { match: 'lufthansa', region: 'eu_eea' },
  { match: 'air france', region: 'eu_eea' },
  { match: 'klm', region: 'eu_eea' },
  { match: 'iberia', region: 'eu_eea' },
  { match: 'ita airways', region: 'eu_eea' },
  { match: 'alitalia', region: 'eu_eea' },
  { match: 'lot polish', region: 'eu_eea' },
  { match: 'finnair', region: 'eu_eea' },
  { match: 'sas', region: 'eu_eea' },
  { match: 'scandinavian airlines', region: 'eu_eea' },
  { match: 'tap air portugal', region: 'eu_eea' },
  { match: 'aer lingus', region: 'eu_eea' },
  { match: 'vueling', region: 'eu_eea' },
  { match: 'ryanair', region: 'eu_eea' },
  { match: 'wizz air', region: 'eu_eea' },
  { match: 'austrian airlines', region: 'eu_eea' },
  { match: 'brussels airlines', region: 'eu_eea' },
  { match: 'swiss', region: 'eu_eea' },
  { match: 'eurowings', region: 'eu_eea' },
  { match: 'norwegian', region: 'eu_eea' },
  { match: 'icelandair', region: 'eu_eea' },
  { match: 'transavia', region: 'eu_eea' },
  { match: 'tui fly', region: 'eu_eea' },
  { match: 'condor', region: 'eu_eea' },
  { match: 'air europa', region: 'eu_eea' },
  { match: 'luxair', region: 'eu_eea' },
  { match: 'croatia airlines', region: 'eu_eea' },
  { match: 'tarom', region: 'eu_eea' },

  // UK
  { match: 'british airways', region: 'uk' },
  { match: 'easyjet', region: 'uk' },
  { match: 'virgin atlantic', region: 'uk' },
  { match: 'tui airways', region: 'uk' },
  { match: 'jet2', region: 'uk' },
  { match: 'loganair', region: 'uk' },
  { match: 'bmi regional', region: 'uk' },

  // Elsewhere (major non-EU/UK carriers — not exhaustive, just common enough
  // to spare most users the manual toggle)
  { match: 'american airlines', region: 'other' },
  { match: 'delta', region: 'other' },
  { match: 'united airlines', region: 'other' },
  { match: 'southwest', region: 'other' },
  { match: 'jetblue', region: 'other' },
  { match: 'alaska airlines', region: 'other' },
  { match: 'spirit airlines', region: 'other' },
  { match: 'frontier airlines', region: 'other' },
  { match: 'air canada', region: 'other' },
  { match: 'westjet', region: 'other' },
  { match: 'emirates', region: 'other' },
  { match: 'etihad', region: 'other' },
  { match: 'qatar airways', region: 'other' },
  { match: 'saudia', region: 'other' },
  { match: 'turkish airlines', region: 'other' },
  { match: 'qantas', region: 'other' },
  { match: 'air new zealand', region: 'other' },
  { match: 'singapore airlines', region: 'other' },
  { match: 'cathay pacific', region: 'other' },
  { match: 'all nippon', region: 'other' },
  { match: 'ana ', region: 'other' },
  { match: 'japan airlines', region: 'other' },
  { match: 'china eastern', region: 'other' },
  { match: 'china southern', region: 'other' },
  { match: 'air china', region: 'other' },
  { match: 'korean air', region: 'other' },
  { match: 'asiana', region: 'other' },
  { match: 'eva air', region: 'other' },
  { match: 'thai airways', region: 'other' },
  { match: 'malaysia airlines', region: 'other' },
  { match: 'vietnam airlines', region: 'other' },
  { match: 'garuda indonesia', region: 'other' },
  { match: 'air india', region: 'other' },
  { match: 'indigo', region: 'other' },
  { match: 'egyptair', region: 'other' },
  { match: 'ethiopian airlines', region: 'other' },
  { match: 'kenya airways', region: 'other' },
  { match: 'south african airways', region: 'other' },
  { match: 'latam', region: 'other' },
  { match: 'avianca', region: 'other' },
  { match: 'aeromexico', region: 'other' },
  { match: 'copa airlines', region: 'other' },
]

/**
 * Guess a carrier's home region from a free-typed airline name. Returns null
 * if nothing recognizable matches (including an empty string), so the caller
 * can fall back to asking the user directly.
 */
export function detectCarrierRegion(airlineName: string): 'eu_eea' | 'uk' | 'other' | null {
  const needle = airlineName.trim().toLowerCase()
  if (!needle) return null
  const hit = AIRLINE_REGION_HINTS.find((h) => needle.includes(h.match))
  return hit ? hit.region : null
}
