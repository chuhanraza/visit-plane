export type Airport = {
  code: string
  city: string
  country: string
  name: string
}

export const AIRPORTS: Record<string, Omit<Airport, 'code'>> = {
  // ── Pakistan ──────────────────────────────────────────────────────────────
  KHI: { city: 'Karachi',      country: 'Pakistan',      name: 'Jinnah International' },
  LHE: { city: 'Lahore',       country: 'Pakistan',      name: 'Allama Iqbal International' },
  ISB: { city: 'Islamabad',    country: 'Pakistan',      name: 'Islamabad International' },
  PEW: { city: 'Peshawar',     country: 'Pakistan',      name: 'Bacha Khan International' },
  SKT: { city: 'Sialkot',      country: 'Pakistan',      name: 'Sialkot International' },
  MUX: { city: 'Multan',       country: 'Pakistan',      name: 'Multan International' },
  // ── Middle East ────────────────────────────────────────────────────────────
  DXB: { city: 'Dubai',        country: 'UAE',           name: 'Dubai International' },
  AUH: { city: 'Abu Dhabi',    country: 'UAE',           name: 'Abu Dhabi International' },
  SHJ: { city: 'Sharjah',      country: 'UAE',           name: 'Sharjah International' },
  DOH: { city: 'Doha',         country: 'Qatar',         name: 'Hamad International' },
  RUH: { city: 'Riyadh',       country: 'Saudi Arabia',  name: 'King Khalid International' },
  JED: { city: 'Jeddah',       country: 'Saudi Arabia',  name: 'King Abdulaziz International' },
  MED: { city: 'Medina',       country: 'Saudi Arabia',  name: 'Prince Mohammad Bin Abdulaziz' },
  MCT: { city: 'Muscat',       country: 'Oman',          name: 'Muscat International' },
  BAH: { city: 'Bahrain',      country: 'Bahrain',       name: 'Bahrain International' },
  KWI: { city: 'Kuwait City',  country: 'Kuwait',        name: 'Kuwait International' },
  AMM: { city: 'Amman',        country: 'Jordan',        name: 'Queen Alia International' },
  BEY: { city: 'Beirut',       country: 'Lebanon',       name: 'Rafic Hariri International' },
  // ── Europe ─────────────────────────────────────────────────────────────────
  LHR: { city: 'London',       country: 'UK',            name: 'Heathrow' },
  LGW: { city: 'London',       country: 'UK',            name: 'Gatwick' },
  MAN: { city: 'Manchester',   country: 'UK',            name: 'Manchester Airport' },
  CDG: { city: 'Paris',        country: 'France',        name: 'Charles de Gaulle' },
  ORY: { city: 'Paris',        country: 'France',        name: 'Orly' },
  FRA: { city: 'Frankfurt',    country: 'Germany',       name: 'Frankfurt Airport' },
  MUC: { city: 'Munich',       country: 'Germany',       name: 'Munich Airport' },
  AMS: { city: 'Amsterdam',    country: 'Netherlands',   name: 'Schiphol' },
  MAD: { city: 'Madrid',       country: 'Spain',         name: 'Adolfo Suárez Barajas' },
  BCN: { city: 'Barcelona',    country: 'Spain',         name: 'El Prat' },
  FCO: { city: 'Rome',         country: 'Italy',         name: 'Fiumicino' },
  MXP: { city: 'Milan',        country: 'Italy',         name: 'Malpensa' },
  IST: { city: 'Istanbul',     country: 'Turkey',        name: 'Istanbul Airport' },
  ZRH: { city: 'Zurich',       country: 'Switzerland',   name: 'Zürich Airport' },
  VIE: { city: 'Vienna',       country: 'Austria',       name: 'Vienna International' },
  BRU: { city: 'Brussels',     country: 'Belgium',       name: 'Brussels Airport' },
  CPH: { city: 'Copenhagen',   country: 'Denmark',       name: 'Copenhagen Airport' },
  ARN: { city: 'Stockholm',    country: 'Sweden',        name: 'Arlanda' },
  WAW: { city: 'Warsaw',       country: 'Poland',        name: 'Chopin Airport' },
  ATH: { city: 'Athens',       country: 'Greece',        name: 'Eleftherios Venizelos' },
  // ── North America ──────────────────────────────────────────────────────────
  JFK: { city: 'New York',     country: 'USA',           name: 'John F. Kennedy' },
  EWR: { city: 'Newark',       country: 'USA',           name: 'Newark Liberty' },
  LAX: { city: 'Los Angeles',  country: 'USA',           name: 'Los Angeles International' },
  ORD: { city: 'Chicago',      country: 'USA',           name: "O'Hare International" },
  IAD: { city: 'Washington',   country: 'USA',           name: 'Dulles International' },
  DFW: { city: 'Dallas',       country: 'USA',           name: 'Dallas/Fort Worth' },
  MIA: { city: 'Miami',        country: 'USA',           name: 'Miami International' },
  YYZ: { city: 'Toronto',      country: 'Canada',        name: 'Pearson International' },
  YVR: { city: 'Vancouver',    country: 'Canada',        name: 'Vancouver International' },
  YUL: { city: 'Montreal',     country: 'Canada',        name: 'Trudeau International' },
  // ── Asia Pacific ───────────────────────────────────────────────────────────
  KUL: { city: 'Kuala Lumpur', country: 'Malaysia',      name: 'KLIA' },
  SIN: { city: 'Singapore',    country: 'Singapore',     name: 'Changi Airport' },
  BKK: { city: 'Bangkok',      country: 'Thailand',      name: 'Suvarnabhumi' },
  NRT: { city: 'Tokyo',        country: 'Japan',         name: 'Narita International' },
  HND: { city: 'Tokyo',        country: 'Japan',         name: 'Haneda Airport' },
  ICN: { city: 'Seoul',        country: 'South Korea',   name: 'Incheon International' },
  HKG: { city: 'Hong Kong',    country: 'Hong Kong',     name: 'Hong Kong International' },
  PEK: { city: 'Beijing',      country: 'China',         name: 'Capital International' },
  PVG: { city: 'Shanghai',     country: 'China',         name: 'Pudong International' },
  DEL: { city: 'New Delhi',    country: 'India',         name: 'Indira Gandhi International' },
  BOM: { city: 'Mumbai',       country: 'India',         name: 'Chhatrapati Shivaji' },
  SYD: { city: 'Sydney',       country: 'Australia',     name: 'Kingsford Smith' },
  MEL: { city: 'Melbourne',    country: 'Australia',     name: 'Tullamarine' },
  MNL: { city: 'Manila',       country: 'Philippines',   name: 'Ninoy Aquino International' },
  CGK: { city: 'Jakarta',      country: 'Indonesia',     name: 'Soekarno-Hatta International' },
  DAC: { city: 'Dhaka',        country: 'Bangladesh',    name: 'Hazrat Shahjalal International' },
  CMB: { city: 'Colombo',      country: 'Sri Lanka',     name: 'Bandaranaike International' },
  KTM: { city: 'Kathmandu',    country: 'Nepal',         name: 'Tribhuvan International' },
  // ── Africa ─────────────────────────────────────────────────────────────────
  CAI: { city: 'Cairo',        country: 'Egypt',         name: 'Cairo International' },
  NBO: { city: 'Nairobi',      country: 'Kenya',         name: 'Jomo Kenyatta International' },
  LOS: { city: 'Lagos',        country: 'Nigeria',       name: 'Murtala Muhammed International' },
  JNB: { city: 'Johannesburg', country: 'South Africa',  name: 'O.R. Tambo International' },
  CPT: { city: 'Cape Town',    country: 'South Africa',  name: 'Cape Town International' },
  // ── Others ─────────────────────────────────────────────────────────────────
  GVA: { city: 'Geneva',       country: 'Switzerland',   name: 'Geneva Airport' },
  DUB: { city: 'Dublin',       country: 'Ireland',       name: 'Dublin Airport' },
  OSL: { city: 'Oslo',         country: 'Norway',        name: 'Gardermoen' },
  HEL: { city: 'Helsinki',     country: 'Finland',       name: 'Vantaa Airport' },
}

/** Return an array of Airport objects filtered by a search string */
export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 1) return []
  const q = query.toLowerCase()
  return Object.entries(AIRPORTS)
    .filter(([code, data]) =>
      code.toLowerCase().includes(q) ||
      data.city.toLowerCase().includes(q) ||
      data.country.toLowerCase().includes(q) ||
      data.name.toLowerCase().includes(q)
    )
    .map(([code, data]) => ({ code, ...data }))
    .slice(0, 8)
}

/** Format airport for display: "DXB - Dubai International (UAE)" */
export function formatAirport(code: string): string {
  const a = AIRPORTS[code]
  if (!a) return code
  return `${code} - ${a.name} (${a.country})`
}

export const NATIONALITIES = [
  'Afghan','Albanian','Algerian','American','Andorran','Angolan','Antiguan',
  'Argentine','Armenian','Australian','Austrian','Azerbaijani','Bahamian',
  'Bahraini','Bangladeshi','Barbadian','Belarusian','Belgian','Belizean',
  'Beninese','Bhutanese','Bolivian','Bosnian','Botswanan','Brazilian','British',
  'Bruneian','Bulgarian','Burkinabé','Burundian','Cambodian','Cameroonian',
  'Canadian','Cape Verdean','Central African','Chadian','Chilean','Chinese',
  'Colombian','Comorian','Congolese','Costa Rican','Croatian','Cuban','Cypriot',
  'Czech','Danish','Djiboutian','Dominican','Dutch','Ecuadorian','Egyptian',
  'Emirati','Eritrean','Estonian','Ethiopian','Fijian','Filipino','Finnish',
  'French','Gabonese','Gambian','Georgian','German','Ghanaian','Greek',
  'Grenadian','Guatemalan','Guinean','Guyanese','Haitian','Honduran',
  'Hungarian','Icelandic','Indian','Indonesian','Iranian','Iraqi','Irish',
  'Israeli','Italian','Ivorian','Jamaican','Japanese','Jordanian','Kazakh',
  'Kenyan','Kuwaiti','Kyrgyz','Laotian','Latvian','Lebanese','Lesothan',
  'Liberian','Libyan','Liechtensteinish','Lithuanian','Luxembourgish',
  'Madagascan','Malawian','Malaysian','Maldivian','Malian','Maltese',
  'Mauritanian','Mauritian','Mexican','Moldovan','Monacan','Mongolian',
  'Montenegrin','Moroccan','Mozambican','Namibian','Nepali','New Zealander',
  'Nicaraguan','Nigerien','Nigerian','Norwegian','Omani','Pakistani',
  'Panamanian','Paraguayan','Peruvian','Polish','Portuguese','Qatari',
  'Romanian','Russian','Rwandan','Saudi','Senegalese','Serbian','Singaporean',
  'Slovak','Slovenian','Somali','South African','South Korean','Spanish',
  'Sri Lankan','Sudanese','Swedish','Swiss','Syrian','Taiwanese','Tajik',
  'Tanzanian','Thai','Togolese','Trinidadian','Tunisian','Turkish','Turkmen',
  'Ugandan','Ukrainian','Uruguayan','Uzbek','Venezuelan','Vietnamese',
  'Yemeni','Zambian','Zimbabwean',
]

export const AIRLINES = [
  { code: 'PK', name: 'PIA – Pakistan International Airlines' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'TK', name: 'Turkish Airlines' },
  { code: 'G9', name: 'Air Arabia' },
  { code: 'EY', name: 'Etihad Airways' },
  { code: 'SV', name: 'Saudi Airlines (Saudia)' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'MH', name: 'Malaysia Airlines' },
  { code: 'TG', name: 'Thai Airways' },
  { code: 'CX', name: 'Cathay Pacific' },
  { code: 'AI', name: 'Air India' },
  { code: 'QF', name: 'Qantas' },
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'AC', name: 'Air Canada' },
  { code: 'OT', name: 'Other' },
]
