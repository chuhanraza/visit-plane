// ── Country → demonym lookup ──────────────────────────────────────────────────
// Used for natural-language headings like "Pakistanis also check…".
// Keyed on lowercased country name (and common aliases). Falls back to
// "{Country} citizens" when a country is not mapped, so it is always grammatical.
//
// Covers the top ~70 passports by traffic plus common aliases. Add entries as
// needed; the fallback keeps unmapped countries correct.

const DEMONYMS: Record<string, string> = {
  // ── South & Central Asia ──
  'pakistan': 'Pakistanis',
  'india': 'Indians',
  'bangladesh': 'Bangladeshis',
  'sri lanka': 'Sri Lankans',
  'nepal': 'Nepalis',
  'afghanistan': 'Afghans',
  'bhutan': 'Bhutanese',
  'maldives': 'Maldivians',
  'kazakhstan': 'Kazakhstanis',
  'uzbekistan': 'Uzbekistanis',

  // ── East & Southeast Asia ──
  'china': 'Chinese',
  'japan': 'Japanese',
  'south korea': 'South Koreans',
  'north korea': 'North Koreans',
  'taiwan': 'Taiwanese',
  'hong kong': 'Hong Kongers',
  'thailand': 'Thais',
  'vietnam': 'Vietnamese',
  'philippines': 'Filipinos',
  'indonesia': 'Indonesians',
  'malaysia': 'Malaysians',
  'singapore': 'Singaporeans',
  'cambodia': 'Cambodians',
  'myanmar': 'Burmese',
  'laos': 'Laotians',
  'mongolia': 'Mongolians',

  // ── Middle East ──
  'uae': 'Emiratis',
  'united arab emirates': 'Emiratis',
  'saudi arabia': 'Saudis',
  'qatar': 'Qataris',
  'kuwait': 'Kuwaitis',
  'oman': 'Omanis',
  'bahrain': 'Bahrainis',
  'jordan': 'Jordanians',
  'lebanon': 'Lebanese',
  'iraq': 'Iraqis',
  'iran': 'Iranians',
  'israel': 'Israelis',
  'turkey': 'Turks',
  'türkiye': 'Turks',
  'syria': 'Syrians',
  'yemen': 'Yemenis',
  'palestine': 'Palestinians',

  // ── Africa ──
  'nigeria': 'Nigerians',
  'egypt': 'Egyptians',
  'kenya': 'Kenyans',
  'ghana': 'Ghanaians',
  'south africa': 'South Africans',
  'ethiopia': 'Ethiopians',
  'tanzania': 'Tanzanians',
  'uganda': 'Ugandans',
  'morocco': 'Moroccans',
  'algeria': 'Algerians',
  'tunisia': 'Tunisians',
  'sudan': 'Sudanese',
  'cameroon': 'Cameroonians',
  'senegal': 'Senegalese',
  'zimbabwe': 'Zimbabweans',
  'zambia': 'Zambians',
  'rwanda': 'Rwandans',
  'ivory coast': 'Ivorians',

  // ── Europe ──
  'united kingdom': 'Britons',
  'uk': 'Britons',
  'ireland': 'Irish people',
  'france': 'French people',
  'germany': 'Germans',
  'italy': 'Italians',
  'spain': 'Spaniards',
  'portugal': 'Portuguese',
  'netherlands': 'Dutch people',
  'belgium': 'Belgians',
  'switzerland': 'Swiss people',
  'austria': 'Austrians',
  'sweden': 'Swedes',
  'norway': 'Norwegians',
  'denmark': 'Danes',
  'finland': 'Finns',
  'poland': 'Poles',
  'czech republic': 'Czechs',
  'czechia': 'Czechs',
  'hungary': 'Hungarians',
  'romania': 'Romanians',
  'bulgaria': 'Bulgarians',
  'greece': 'Greeks',
  'russia': 'Russians',
  'ukraine': 'Ukrainians',
  'serbia': 'Serbians',
  'croatia': 'Croatians',

  // ── Americas ──
  'united states': 'Americans',
  'usa': 'Americans',
  'canada': 'Canadians',
  'mexico': 'Mexicans',
  'brazil': 'Brazilians',
  'argentina': 'Argentinians',
  'colombia': 'Colombians',
  'chile': 'Chileans',
  'peru': 'Peruvians',
  'venezuela': 'Venezuelans',
  'ecuador': 'Ecuadorians',
  'cuba': 'Cubans',
  'jamaica': 'Jamaicans',

  // ── Oceania ──
  'australia': 'Australians',
  'new zealand': 'New Zealanders',
  'fiji': 'Fijians',
}

/**
 * Returns the plural demonym for a country (e.g. "Pakistan" → "Pakistanis").
 * Falls back to "{Country} citizens" so the result is always grammatical.
 */
export function getDemonym(country: string): string {
  if (!country) return 'Travellers'
  const key = country.trim().toLowerCase()
  return DEMONYMS[key] ?? `${country.trim()} citizens`
}
