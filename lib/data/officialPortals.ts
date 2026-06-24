// ─────────────────────────────────────────────────────────────────────────────
// Official immigration / e-visa / foreign-ministry portals, keyed by DESTINATION
// country. This is the per-destination fallback that lets EVERY destination and
// visa page link travellers to a real government source.
//
// YMYL SAFETY RULES (do not break):
//  • Every URL here must be a well-established OFFICIAL government domain that we
//    are confident is correct. When in doubt, the value is `null` — a wrong
//    "official" link is more dangerous than none, so unknowns fall back to a
//    safe "search the official source" instruction and are flagged in
//    visa-data-review.md for a human to fill in.
//  • This file contains NO visa rules, statuses, fees, or durations — only links
//    to where the traveller can read the authoritative rules themselves.
// ─────────────────────────────────────────────────────────────────────────────

export type OfficialPortal = {
  /** Real, official government URL (immigration dept / e-visa portal / MFA). */
  url: string
  /** Human label for the source, e.g. "U.S. Department of State – Visas". */
  label: string
}

// Canonical-name → portal. Keys are lowercased country names matching the
// destination names used across the site. Aliases are resolved separately.
const PORTALS: Record<string, OfficialPortal> = {
  // ── North America ──────────────────────────────────────────────────────────
  'united states': { url: 'https://travel.state.gov/content/travel/en/us-visas.html', label: 'U.S. Department of State — U.S. Visas' },
  'canada':        { url: 'https://www.canada.ca/en/services/immigration-citizenship.html', label: 'Government of Canada — Immigration & Citizenship (IRCC)' },

  // ── United Kingdom & Ireland ───────────────────────────────────────────────
  'united kingdom': { url: 'https://www.gov.uk/browse/visas-immigration', label: 'GOV.UK — Visas and Immigration' },
  'ireland':        { url: 'https://www.irishimmigration.ie/', label: 'Irish Immigration Service Delivery' },

  // ── Schengen / wider Europe ────────────────────────────────────────────────
  'germany':     { url: 'https://www.auswaertiges-amt.de/en/visa-service', label: 'German Federal Foreign Office — Visa Service' },
  'france':      { url: 'https://france-visas.gouv.fr/en/', label: 'France-Visas — Official Visa Website' },
  'italy':       { url: 'https://vistoperitalia.esteri.it/home/en', label: 'Italy — Ministry of Foreign Affairs Visa Portal' },
  'spain':       { url: 'https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Visados.aspx', label: 'Spain — Ministry of Foreign Affairs (Visas)' },
  'netherlands': { url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands', label: 'Government of the Netherlands — Visa Information' },
  'switzerland': { url: 'https://www.sem.admin.ch/sem/en/home/themen/einreise.html', label: 'State Secretariat for Migration (SEM) — Entry to Switzerland' },
  'sweden':      { url: 'https://www.migrationsverket.se/English.html', label: 'Swedish Migration Agency' },
  'norway':      { url: 'https://www.udi.no/en/', label: 'Norwegian Directorate of Immigration (UDI)' },
  'denmark':     { url: 'https://www.nyidanmark.dk/en-GB', label: 'New to Denmark — Danish Immigration Service' },
  'finland':     { url: 'https://migri.fi/en/home', label: 'Finnish Immigration Service (Migri)' },
  'austria':     { url: 'https://www.bmeia.gv.at/en/travel-stay/entry-and-residence-in-austria', label: 'Austria — Federal Ministry for European & International Affairs' },
  'portugal':    { url: 'https://vistos.mne.gov.pt/en/', label: 'Portugal — Ministry of Foreign Affairs Visa Portal' },

  // ── Middle East / Gulf ─────────────────────────────────────────────────────
  'uae':          { url: 'https://icp.gov.ae/en/', label: 'UAE — Federal Authority for Identity & Citizenship (ICP)' },
  'saudi arabia': { url: 'https://visa.visitsaudi.com/', label: 'Visit Saudi — Official eVisa Portal' },
  'qatar':        { url: 'https://portal.moi.gov.qa/qatarvisas/', label: 'Qatar — Ministry of Interior Visa Services' },
  'oman':         { url: 'https://evisa.rop.gov.om/', label: 'Royal Oman Police — Official eVisa Portal' },
  'bahrain':      { url: 'https://www.evisa.gov.bh/', label: 'Kingdom of Bahrain — Official eVisa Portal' },
  'turkey':       { url: 'https://www.evisa.gov.tr/en/', label: 'Republic of Türkiye — Official eVisa System' },
  'israel':       { url: 'https://www.gov.il/en/departments/population_and_immigration_authority/govil-landing-page', label: 'Israel — Population & Immigration Authority' },

  // ── South & Central Asia ───────────────────────────────────────────────────
  'india':      { url: 'https://indianvisaonline.gov.in/evisa/', label: 'Government of India — Official e-Visa Portal' },
  'pakistan':   { url: 'https://visa.nadra.gov.pk/', label: 'Pakistan — Official Online Visa System (NADRA)' },
  'sri lanka':  { url: 'https://eta.gov.lk/slvisa/', label: 'Sri Lanka ETA — Official Electronic Travel Authorization' },
  'nepal':      { url: 'https://www.immigration.gov.np/', label: 'Nepal — Department of Immigration' },
  'maldives':   { url: 'https://www.immigration.gov.mv/', label: 'Maldives Immigration' },
  'uzbekistan': { url: 'https://e-visa.gov.uz/main', label: 'Republic of Uzbekistan — Official e-Visa Portal' },

  // ── East & Southeast Asia ──────────────────────────────────────────────────
  'china':       { url: 'https://en.nia.gov.cn/', label: 'China — National Immigration Administration' },
  'japan':       { url: 'https://www.mofa.go.jp/j_info/visit/visa/index.html', label: 'Japan — Ministry of Foreign Affairs (Visa)' },
  'south korea': { url: 'https://www.k-eta.go.kr/portal/apply/index.do', label: 'Republic of Korea — Official K-ETA Portal' },
  'thailand':    { url: 'https://www.thaievisa.go.th/', label: 'Royal Thai MFA — Official Thailand eVisa' },
  'malaysia':    { url: 'https://malaysiavisa.imi.gov.my/', label: 'Malaysia — Official eVisa Portal (Immigration Dept.)' },
  'singapore':   { url: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements', label: 'Singapore — Immigration & Checkpoints Authority (ICA)' },
  'indonesia':   { url: 'https://evisa.imigrasi.go.id/', label: 'Indonesia — Official eVisa (Directorate General of Immigration)' },
  'vietnam':     { url: 'https://evisa.xuatnhapcanh.gov.vn/', label: 'Vietnam — Official National e-Visa Portal' },
  'cambodia':    { url: 'https://www.evisa.gov.kh/', label: 'Kingdom of Cambodia — Official eVisa Portal' },

  // ── Oceania ────────────────────────────────────────────────────────────────
  'australia':    { url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing', label: 'Australia — Department of Home Affairs (Visas)' },
  'new zealand':  { url: 'https://www.immigration.govt.nz/', label: 'Immigration New Zealand' },

  // ── Africa ─────────────────────────────────────────────────────────────────
  'egypt':        { url: 'https://www.visa2egypt.gov.eg/', label: 'Egypt — Official e-Visa Portal' },
  'south africa': { url: 'https://www.dha.gov.za/index.php/immigration-services', label: 'South Africa — Department of Home Affairs' },
  'nigeria':      { url: 'https://immigration.gov.ng/', label: 'Nigeria Immigration Service' },
  'ethiopia':     { url: 'https://www.evisa.gov.et/', label: 'Ethiopia — Official eVisa Portal' },
  'tanzania':     { url: 'https://eservices.immigration.go.tz/visa/', label: 'Tanzania — Immigration Services (eVisa)' },
  'morocco':      { url: 'https://www.acces-maroc.ma/', label: 'Kingdom of Morocco — Official Electronic Visa' },

  // ── Eurasia / Caucasus ─────────────────────────────────────────────────────
  'russia':      { url: 'https://evisa.kdmid.ru/', label: 'Russian Federation — Official Unified e-Visa Portal' },
  'azerbaijan':  { url: 'https://evisa.gov.az/en/', label: 'Republic of Azerbaijan — Official ASAN e-Visa Portal' },
  'georgia':     { url: 'https://www.evisa.gov.ge/GeoVisa/en/VisaApp', label: 'Georgia — Official e-Visa Portal' },
}

// Alias map → canonical key. Lets us resolve common name variants used across
// the codebase / passport lists to the right portal.
const ALIASES: Record<string, string> = {
  'usa': 'united states',
  'u.s.': 'united states',
  'us': 'united states',
  'united states of america': 'united states',
  'america': 'united states',
  'uk': 'united kingdom',
  'great britain': 'united kingdom',
  'britain': 'united kingdom',
  'england': 'united kingdom',
  'united arab emirates': 'uae',
  'u.a.e.': 'uae',
  'türkiye': 'turkey',
  'turkiye': 'turkey',
  'korea': 'south korea',
  'republic of korea': 'south korea',
  's. korea': 'south korea',
}

/**
 * Look up the official portal for a destination country.
 * Returns `null` when we do not have a confident official URL — callers must
 * then show the honest "search the official source" fallback.
 */
export function getOfficialPortal(destinationName: string): OfficialPortal | null {
  if (!destinationName) return null
  const key = destinationName.trim().toLowerCase()
  const canonical = ALIASES[key] ?? key
  return PORTALS[canonical] ?? null
}

/** Total destinations with a confident official URL (for reporting). */
export const OFFICIAL_PORTAL_COUNT = Object.keys(PORTALS).length
