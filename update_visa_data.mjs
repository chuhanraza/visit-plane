#!/usr/bin/env node
/**
 * update_visa_data.mjs
 * Complete world visa data update from Wikipedia – May 2026
 * Run: node update_visa_data.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, appendFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Load env ───────────────────────────────────────────────────────────────────
const envContent = readFileSync(path.join(__dirname, '.env.local'), 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Logging ────────────────────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, 'visa_update_log.txt')
writeFileSync(LOG_FILE, `Visa Update Run: ${new Date().toISOString()}\n${'='.repeat(60)}\n`)

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  appendFileSync(LOG_FILE, line + '\n')
}

// ─── Stats ──────────────────────────────────────────────────────────────────────
const stats = {
  processed: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  noMatch: 0,
}

// ─── Visa type mapping ──────────────────────────────────────────────────────────
function mapVisaType(raw) {
  if (!raw) return null
  const r = raw.toLowerCase().replace(/\s+/g, ' ').trim()

  if (r.includes('freedom of movement')) return 'Visa Free'
  if (r.includes('visa not required')) return 'Visa Free'
  if (r.includes('visa free') || r === 'visa-free' || r.startsWith('visa-free')) return 'Visa Free'
  if (r.includes('visa on arrival') || r.includes('on arrival') || r === 'voa') return 'Visa on Arrival'
  if (r.includes('evisa') || r.includes('e-visa') || r.includes('electronic visa') ||
      r.includes('electronic visa on arrival')) return 'e-Visa'
  if (r.includes('electronic travel authorization') || r === 'eta' || r.includes('eta required')) return 'ETA Required'
  if (r.includes('visa required') || r === 'required') return 'Visa Required'
  if (r.includes('admission refused') || r.includes('travel banned') || r.includes('not admitted')) return 'Visa Required'
  if (r.includes('visa obtained on arrival')) return 'Visa on Arrival'
  if (r.includes('reciprocity')) return 'Visa Required'

  return null
}

// ─── Country name normalization (Wikipedia → DB) ────────────────────────────────
const WIKI_TO_DB = {
  'United States': 'United States',
  'United States of America': 'United States',
  'United Kingdom': 'United Kingdom',
  'United Arab Emirates': 'UAE',
  'Republic of Korea': 'South Korea',
  'South Korea': 'South Korea',
  'North Korea': 'North Korea',
  "Democratic People's Republic of Korea": 'North Korea',
  'Democratic Republic of the Congo': 'DR Congo',
  'DR Congo': 'DR Congo',
  'Republic of the Congo': 'Republic of the Congo',
  'Congo': 'Republic of the Congo',
  'Czech Republic': 'Czech Republic',
  'Czechia': 'Czech Republic',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Central African Republic': 'Central African Republic',
  'Dominican Republic': 'Dominican Republic',
  'Equatorial Guinea': 'Equatorial Guinea',
  'South Sudan': 'South Sudan',
  'Eswatini': 'Eswatini',
  'Swaziland': 'Eswatini',
  'Solomon Islands': 'Solomon Islands',
  "Côte d'Ivoire": 'Ivory Coast',
  'Ivory Coast': 'Ivory Coast',
  "Cote d'Ivoire": 'Ivory Coast',
  'Laos': 'Laos',
  "Lao People's Democratic Republic": 'Laos',
  'Russia': 'Russia',
  'Russian Federation': 'Russia',
  'North Macedonia': 'North Macedonia',
  'Republic of North Macedonia': 'North Macedonia',
  'Brunei': 'Brunei',
  'Brunei Darussalam': 'Brunei',
  'Vietnam': 'Vietnam',
  'Viet Nam': 'Vietnam',
  'Iran': 'Iran',
  'Islamic Republic of Iran': 'Iran',
  'Syria': 'Syria',
  'Syrian Arab Republic': 'Syria',
  'Myanmar': 'Myanmar',
  'Burma': 'Myanmar',
  'Palestine': 'Palestine',
  'State of Palestine': 'Palestine',
  'Taiwan': 'Taiwan',
  'Republic of China': 'Taiwan',
  'Republic of China (Taiwan)': 'Taiwan',
  'Kosovo': 'Kosovo',
  'Republic of Kosovo': 'Kosovo',
  'Timor-Leste': 'Timor-Leste',
  'East Timor': 'Timor-Leste',
  'Papua New Guinea': 'Papua New Guinea',
  'New Zealand': 'New Zealand',
  'Saudi Arabia': 'Saudi Arabia',
  'South Africa': 'South Africa',
  'Turkey': 'Turkey',
  'Türkiye': 'Turkey',
  'Republic of Türkiye': 'Turkey',
  'Libya': 'Libya',
  'Morocco': 'Morocco',
  'Algeria': 'Algeria',
  'Tunisia': 'Tunisia',
  'Egypt': 'Egypt',
  'Ethiopia': 'Ethiopia',
  'Kenya': 'Kenya',
  'Nigeria': 'Nigeria',
  'Ghana': 'Ghana',
  'Tanzania': 'Tanzania',
  'Uganda': 'Uganda',
  'Sudan': 'Sudan',
  'South Africa': 'South Africa',
  'Mozambique': 'Mozambique',
  'Zambia': 'Zambia',
  'Zimbabwe': 'Zimbabwe',
  'Rwanda': 'Rwanda',
  'Malawi': 'Malawi',
  'Namibia': 'Namibia',
  'Botswana': 'Botswana',
  'Madagascar': 'Madagascar',
  'Mauritius': 'Mauritius',
  'Somalia': 'Somalia',
  'Sierra Leone': 'Sierra Leone',
  'Liberia': 'Liberia',
  'Guinea': 'Guinea',
  'Mali': 'Mali',
  'Niger': 'Niger',
  'Burkina Faso': 'Burkina Faso',
  'Togo': 'Togo',
  'Benin': 'Benin',
  'Gabon': 'Gabon',
  'Cameroon': 'Cameroon',
  'Angola': 'Angola',
  'Chad': 'Chad',
  'Eritrea': 'Eritrea',
  'Djibouti': 'Djibouti',
  'Burundi': 'Burundi',
  'Gambia': 'Gambia',
  'The Gambia': 'Gambia',
  'Guinea-Bissau': 'Guinea-Bissau',
  'Cape Verde': 'Cape Verde',
  'Cabo Verde': 'Cape Verde',
  'São Tomé and Príncipe': 'Sao Tome and Principe',
  'Sao Tome and Principe': 'Sao Tome and Principe',
  'Comoros': 'Comoros',
  'Lesotho': 'Lesotho',
  'Senegal': 'Senegal',
  'Japan': 'Japan',
  'China': 'China',
  "People's Republic of China": 'China',
  'India': 'India',
  'Indonesia': 'Indonesia',
  'Philippines': 'Philippines',
  'Malaysia': 'Malaysia',
  'Singapore': 'Singapore',
  'Thailand': 'Thailand',
  'Bangladesh': 'Bangladesh',
  'Pakistan': 'Pakistan',
  'Sri Lanka': 'Sri Lanka',
  'Nepal': 'Nepal',
  'Bhutan': 'Bhutan',
  'Maldives': 'Maldives',
  'Afghanistan': 'Afghanistan',
  'Kazakhstan': 'Kazakhstan',
  'Uzbekistan': 'Uzbekistan',
  'Tajikistan': 'Tajikistan',
  'Kyrgyzstan': 'Kyrgyzstan',
  'Turkmenistan': 'Turkmenistan',
  'Armenia': 'Armenia',
  'Azerbaijan': 'Azerbaijan',
  'Georgia': 'Georgia',
  'Mongolia': 'Mongolia',
  'Cambodia': 'Cambodia',
  'Laos': 'Laos',
  'Iraq': 'Iraq',
  'Kuwait': 'Kuwait',
  'Bahrain': 'Bahrain',
  'Qatar': 'Qatar',
  'Oman': 'Oman',
  'Yemen': 'Yemen',
  'Jordan': 'Jordan',
  'Lebanon': 'Lebanon',
  'Israel': 'Israel',
  'Germany': 'Germany',
  'France': 'France',
  'Italy': 'Italy',
  'Spain': 'Spain',
  'Portugal': 'Portugal',
  'Netherlands': 'Netherlands',
  'Belgium': 'Belgium',
  'Austria': 'Austria',
  'Switzerland': 'Switzerland',
  'Sweden': 'Sweden',
  'Norway': 'Norway',
  'Denmark': 'Denmark',
  'Finland': 'Finland',
  'Iceland': 'Iceland',
  'Ireland': 'Ireland',
  'Luxembourg': 'Luxembourg',
  'Poland': 'Poland',
  'Romania': 'Romania',
  'Bulgaria': 'Bulgaria',
  'Croatia': 'Croatia',
  'Serbia': 'Serbia',
  'Slovenia': 'Slovenia',
  'Slovakia': 'Slovakia',
  'Hungary': 'Hungary',
  'Estonia': 'Estonia',
  'Latvia': 'Latvia',
  'Lithuania': 'Lithuania',
  'Ukraine': 'Ukraine',
  'Belarus': 'Belarus',
  'Moldova': 'Moldova',
  'Albania': 'Albania',
  'Montenegro': 'Montenegro',
  'Liechtenstein': 'Liechtenstein',
  'Monaco': 'Monaco',
  'San Marino': 'San Marino',
  'Andorra': 'Andorra',
  'Malta': 'Malta',
  'Cyprus': 'Cyprus',
  'Greece': 'Greece',
  'Canada': 'Canada',
  'Mexico': 'Mexico',
  'United States': 'United States',
  'Brazil': 'Brazil',
  'Argentina': 'Argentina',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Peru': 'Peru',
  'Venezuela': 'Venezuela',
  'Ecuador': 'Ecuador',
  'Bolivia': 'Bolivia',
  'Paraguay': 'Paraguay',
  'Uruguay': 'Uruguay',
  'Guyana': 'Guyana',
  'Suriname': 'Suriname',
  'Cuba': 'Cuba',
  'Haiti': 'Haiti',
  'Jamaica': 'Jamaica',
  'Trinidad and Tobago': 'Trinidad and Tobago',
  'Barbados': 'Barbados',
  'Bahamas': 'Bahamas',
  'The Bahamas': 'Bahamas',
  'Grenada': 'Grenada',
  'Saint Lucia': 'Saint Lucia',
  'Saint Vincent and the Grenadines': 'Saint Vincent and the Grenadines',
  'Saint Kitts and Nevis': 'Saint Kitts and Nevis',
  'Antigua and Barbuda': 'Antigua and Barbuda',
  'Dominica': 'Dominica',
  'Costa Rica': 'Costa Rica',
  'Panama': 'Panama',
  'Guatemala': 'Guatemala',
  'Honduras': 'Honduras',
  'El Salvador': 'El Salvador',
  'Nicaragua': 'Nicaragua',
  'Belize': 'Belize',
  'Dominican Republic': 'Dominican Republic',
  'Australia': 'Australia',
  'New Zealand': 'New Zealand',
  'Fiji': 'Fiji',
  'Papua New Guinea': 'Papua New Guinea',
  'Samoa': 'Samoa',
  'Tonga': 'Tonga',
  'Nauru': 'Nauru',
  'Palau': 'Palau',
  'Federated States of Micronesia': 'Micronesia',
  'Micronesia': 'Micronesia',
  'Marshall Islands': 'Marshall Islands',
  'Solomon Islands': 'Solomon Islands',
  'Vanuatu': 'Vanuatu',
  'Tuvalu': 'Tuvalu',
  'Kiribati': 'Kiribati',
}

function normalizeCountryName(wikiName) {
  if (!wikiName) return null
  const trimmed = wikiName.trim()
    .replace(/\[.*?\]/g, '')  // remove footnote refs like [1]
    .replace(/\(.*?\)/g, '')  // remove parenthetical
    .trim()

  // Direct match
  if (WIKI_TO_DB[trimmed]) return WIKI_TO_DB[trimmed]
  // Try case-insensitive
  for (const [key, val] of Object.entries(WIKI_TO_DB)) {
    if (key.toLowerCase() === trimmed.toLowerCase()) return val
  }
  return trimmed  // fallback: use as-is
}

// ─── Parse validity ──────────────────────────────────────────────────────────────
function parseValidity(raw) {
  if (!raw) return null
  const cleaned = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  if (!cleaned || cleaned === '—' || cleaned === '-' || cleaned === 'N/A') return null
  // Normalize "days" references
  const m = cleaned.match(/(\d+)\s*days?/i)
  if (m) return `${m[1]} days`
  if (/unlimited|indefinite/i.test(cleaned)) return 'Unlimited'
  if (/subject to/i.test(cleaned)) return 'Subject to stamp'
  return cleaned.substring(0, 50)  // cap length
}

// ─── Strip HTML tags ─────────────────────────────────────────────────────────────
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\[.*?\]/g, '')  // remove footnotes
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Extract cell text (handles rowspan, colspan) ───────────────────────────────
function extractCellText(cellHtml) {
  return stripHtml(cellHtml)
}

// ─── Parse Wikipedia visa table HTML ────────────────────────────────────────────
function parseVisaTableHtml(html) {
  const results = []

  // Find all wikitables
  const tableRegex = /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi
  let tableMatch

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableContent = tableMatch[1]

    // Extract all rows
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    const rows = []
    let rowMatch
    while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
      rows.push(rowMatch[1])
    }

    if (rows.length < 2) continue

    // Skip header row(s) - look for first data row
    let headerSkipped = false
    for (const rowHtml of rows) {
      // Check if it's a header row (contains <th> tags)
      if (/<th[^>]*>/i.test(rowHtml) && !headerSkipped) {
        headerSkipped = true
        continue
      }

      // Extract cells
      const cells = []
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
      let cellMatch
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(cellMatch[1])
      }

      if (cells.length < 2) continue

      // Get country name from first cell
      // Try to find country link first
      const linkMatch = cells[0].match(/<a[^>]*href="\/wiki\/([^"]*)"[^>]*>([^<]*)<\/a>/)
      let countryName
      if (linkMatch) {
        countryName = decodeURIComponent(linkMatch[2].replace(/_/g, ' ')).trim()
      } else {
        countryName = extractCellText(cells[0])
      }

      // Also try flag template text: often "{{flag|Country}}" renders with link
      const flagMatch = cells[0].match(/title="([^"]+)"\s*>/)
      if (!countryName && flagMatch) {
        countryName = flagMatch[1]
      }

      if (!countryName || countryName.length < 2) continue

      // Skip section headers embedded in tables
      if (countryName.length > 60) continue
      if (/^[A-Z\s]+$/.test(countryName) && countryName === countryName.toUpperCase() && countryName.length > 20) continue

      const rawVisaType = extractCellText(cells[1])
      const rawValidity = cells[2] ? extractCellText(cells[2]) : null

      const visaType = mapVisaType(rawVisaType)
      const validity = parseValidity(rawValidity)

      const normalizedName = normalizeCountryName(countryName)

      if (normalizedName && visaType) {
        results.push({
          countryName: normalizedName,
          visaType,
          validity,
          rawVisaType,
        })
      }
    }
  }

  return results
}

// ─── Fetch Wikipedia page HTML via API ──────────────────────────────────────────
async function fetchWikiPage(pageTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json&disablelimitreport=1&disabletoc=1`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VisitPlane/1.0 (visa data update; contact: relianmfg@gmail.com)' },
    })

    if (!response.ok) {
      log(`  ⚠ HTTP ${response.status} for ${pageTitle}`)
      return null
    }

    const json = await response.json()
    if (json.error) {
      log(`  ⚠ Wiki API error: ${json.error.info} for ${pageTitle}`)
      return null
    }

    return json.parse?.text?.['*'] ?? null
  } catch (err) {
    log(`  ⚠ Fetch error for ${pageTitle}: ${err.message}`)
    return null
  }
}

// ─── Update Supabase for one country ────────────────────────────────────────────
async function updateCountry(passportDbName, wikiPageTitle) {
  log(`\n▶ Processing: ${passportDbName} (${wikiPageTitle})`)

  // Fetch HTML
  const html = await fetchWikiPage(wikiPageTitle)
  if (!html) {
    stats.errors++
    log(`  ✗ Failed to fetch Wikipedia page`)
    return
  }

  // Parse visa data
  const visaData = parseVisaTableHtml(html)
  log(`  📊 Found ${visaData.length} destinations in Wikipedia table`)

  if (visaData.length === 0) {
    stats.errors++
    log(`  ✗ No visa data parsed from page`)
    return
  }

  // Batch updates
  let countUpdated = 0
  let countNoMatch = 0
  const BATCH_SIZE = 20

  for (let i = 0; i < visaData.length; i += BATCH_SIZE) {
    const batch = visaData.slice(i, i + BATCH_SIZE)

    for (const item of batch) {
      const { countryName, visaType, validity } = item

      const updateData = { visa_type: visaType }
      if (validity) updateData.validity = validity

      const { data, error } = await supabase
        .from('destinations')
        .update(updateData)
        .eq('passport_country', passportDbName)
        .ilike('country_name', countryName)
        .select('id, country_name')

      if (error) {
        log(`    ✗ DB error for ${countryName}: ${error.message}`)
        stats.errors++
      } else if (data && data.length > 0) {
        countUpdated++
        stats.updated++
      } else {
        countNoMatch++
        stats.noMatch++
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < visaData.length) {
      await new Promise(r => setTimeout(r, 100))
    }
  }

  log(`  ✓ Updated: ${countUpdated} | No DB match: ${countNoMatch}`)
  stats.processed++
}

// ─── All 197 countries to process ───────────────────────────────────────────────
const COUNTRIES = [
  // BATCH 1
  { db: 'Pakistan',       wiki: 'Visa_requirements_for_Pakistani_citizens' },
  { db: 'India',          wiki: 'Visa_requirements_for_Indian_citizens' },
  { db: 'Nigeria',        wiki: 'Visa_requirements_for_Nigerian_citizens' },
  { db: 'Bangladesh',     wiki: 'Visa_requirements_for_Bangladeshi_citizens' },
  { db: 'Philippines',    wiki: 'Visa_requirements_for_Filipino_citizens' },
  { db: 'China',          wiki: 'Visa_requirements_for_Chinese_citizens' },
  { db: 'United States',  wiki: 'Visa_requirements_for_United_States_citizens' },
  { db: 'United Kingdom', wiki: 'Visa_requirements_for_British_citizens' },
  { db: 'UAE',            wiki: 'Visa_requirements_for_Emirati_citizens' },
  { db: 'Saudi Arabia',   wiki: 'Visa_requirements_for_Saudi_Arabian_citizens' },
  // BATCH 2
  { db: 'Indonesia',      wiki: 'Visa_requirements_for_Indonesian_citizens' },
  { db: 'Egypt',          wiki: 'Visa_requirements_for_Egyptian_citizens' },
  { db: 'Turkey',         wiki: 'Visa_requirements_for_Turkish_citizens' },
  { db: 'Mexico',         wiki: 'Visa_requirements_for_Mexican_citizens' },
  { db: 'Brazil',         wiki: 'Visa_requirements_for_Brazilian_citizens' },
  { db: 'Germany',        wiki: 'Visa_requirements_for_German_citizens' },
  { db: 'France',         wiki: 'Visa_requirements_for_French_citizens' },
  { db: 'Canada',         wiki: 'Visa_requirements_for_Canadian_citizens' },
  { db: 'Australia',      wiki: 'Visa_requirements_for_Australian_citizens' },
  { db: 'Japan',          wiki: 'Visa_requirements_for_Japanese_citizens' },
  // BATCH 3
  { db: 'South Korea',    wiki: 'Visa_requirements_for_South_Korean_citizens' },
  { db: 'Malaysia',       wiki: 'Visa_requirements_for_Malaysian_citizens' },
  { db: 'Singapore',      wiki: 'Visa_requirements_for_Singaporean_citizens' },
  { db: 'Thailand',       wiki: 'Visa_requirements_for_Thai_citizens' },
  { db: 'Ghana',          wiki: 'Visa_requirements_for_Ghanaian_citizens' },
  { db: 'Kenya',          wiki: 'Visa_requirements_for_Kenyan_citizens' },
  { db: 'Ethiopia',       wiki: 'Visa_requirements_for_Ethiopian_citizens' },
  { db: 'Tanzania',       wiki: 'Visa_requirements_for_Tanzanian_citizens' },
  { db: 'Uganda',         wiki: 'Visa_requirements_for_Ugandan_citizens' },
  { db: 'South Africa',   wiki: 'Visa_requirements_for_South_African_citizens' },
  // BATCH 4
  { db: 'Morocco',        wiki: 'Visa_requirements_for_Moroccan_citizens' },
  { db: 'Algeria',        wiki: 'Visa_requirements_for_Algerian_citizens' },
  { db: 'Tunisia',        wiki: 'Visa_requirements_for_Tunisian_citizens' },
  { db: 'Libya',          wiki: 'Visa_requirements_for_Libyan_citizens' },
  { db: 'Sudan',          wiki: 'Visa_requirements_for_Sudanese_citizens' },
  { db: 'Senegal',        wiki: 'Visa_requirements_for_Senegalese_citizens' },
  { db: 'Ivory Coast',    wiki: 'Visa_requirements_for_Ivorian_citizens' },
  { db: 'Cameroon',       wiki: 'Visa_requirements_for_Cameroonian_citizens' },
  { db: 'Angola',         wiki: 'Visa_requirements_for_Angolan_citizens' },
  { db: 'Mozambique',     wiki: 'Visa_requirements_for_Mozambican_citizens' },
  // BATCH 5
  { db: 'Zambia',         wiki: 'Visa_requirements_for_Zambian_citizens' },
  { db: 'Zimbabwe',       wiki: 'Visa_requirements_for_Zimbabwean_citizens' },
  { db: 'Rwanda',         wiki: 'Visa_requirements_for_Rwandan_citizens' },
  { db: 'Malawi',         wiki: 'Visa_requirements_for_Malawian_citizens' },
  { db: 'Namibia',        wiki: 'Visa_requirements_for_Namibian_citizens' },
  { db: 'Botswana',       wiki: 'Visa_requirements_for_Botswana_citizens' },
  { db: 'Madagascar',     wiki: 'Visa_requirements_for_Malagasy_citizens' },
  { db: 'Mauritius',      wiki: 'Visa_requirements_for_Mauritian_citizens' },
  { db: 'Somalia',        wiki: 'Visa_requirements_for_Somali_citizens' },
  { db: 'Sierra Leone',   wiki: 'Visa_requirements_for_Sierra_Leonean_citizens' },
  // BATCH 6
  { db: 'Liberia',        wiki: 'Visa_requirements_for_Liberian_citizens' },
  { db: 'Guinea',         wiki: 'Visa_requirements_for_Guinean_citizens' },
  { db: 'Mali',           wiki: 'Visa_requirements_for_Malian_citizens' },
  { db: 'Niger',          wiki: 'Visa_requirements_for_Nigerien_citizens' },
  { db: 'Burkina Faso',   wiki: 'Visa_requirements_for_Burkinabé_citizens' },
  { db: 'Togo',           wiki: 'Visa_requirements_for_Togolese_citizens' },
  { db: 'Benin',          wiki: 'Visa_requirements_for_Beninese_citizens' },
  { db: 'Gabon',          wiki: 'Visa_requirements_for_Gabonese_citizens' },
  { db: 'Republic of the Congo', wiki: 'Visa_requirements_for_Republic_of_the_Congo_citizens' },
  { db: 'DR Congo',       wiki: 'Visa_requirements_for_citizens_of_the_Democratic_Republic_of_the_Congo' },
  // BATCH 7
  { db: 'Chad',           wiki: 'Visa_requirements_for_Chadian_citizens' },
  { db: 'Central African Republic', wiki: 'Visa_requirements_for_Central_African_Republic_citizens' },
  { db: 'Eritrea',        wiki: 'Visa_requirements_for_Eritrean_citizens' },
  { db: 'Djibouti',       wiki: 'Visa_requirements_for_Djiboutian_citizens' },
  { db: 'Burundi',        wiki: 'Visa_requirements_for_Burundian_citizens' },
  { db: 'South Sudan',    wiki: 'Visa_requirements_for_South_Sudanese_citizens' },
  { db: 'Gambia',         wiki: 'Visa_requirements_for_Gambian_citizens' },
  { db: 'Guinea-Bissau',  wiki: 'Visa_requirements_for_Guinea-Bissau_citizens' },
  { db: 'Cape Verde',     wiki: 'Visa_requirements_for_Cape_Verdean_citizens' },
  { db: 'Sao Tome and Principe', wiki: 'Visa_requirements_for_São_Tomé_and_Príncipe_citizens' },
  // BATCH 8
  { db: 'Comoros',        wiki: 'Visa_requirements_for_Comorian_citizens' },
  { db: 'Lesotho',        wiki: 'Visa_requirements_for_Mosotho_citizens' },
  { db: 'Eswatini',       wiki: 'Visa_requirements_for_Swazi_citizens' },
  { db: 'Equatorial Guinea', wiki: 'Visa_requirements_for_Equatorial_Guinean_citizens' },
  { db: 'Iran',           wiki: 'Visa_requirements_for_Iranian_citizens' },
  { db: 'Iraq',           wiki: 'Visa_requirements_for_Iraqi_citizens' },
  { db: 'Syria',          wiki: 'Visa_requirements_for_Syrian_citizens' },
  { db: 'Lebanon',        wiki: 'Visa_requirements_for_Lebanese_citizens' },
  { db: 'Jordan',         wiki: 'Visa_requirements_for_Jordanian_citizens' },
  { db: 'Yemen',          wiki: 'Visa_requirements_for_Yemeni_citizens' },
  // BATCH 9
  { db: 'Kuwait',         wiki: 'Visa_requirements_for_Kuwaiti_citizens' },
  { db: 'Bahrain',        wiki: 'Visa_requirements_for_Bahraini_citizens' },
  { db: 'Qatar',          wiki: 'Visa_requirements_for_Qatari_citizens' },
  { db: 'Oman',           wiki: 'Visa_requirements_for_Omani_citizens' },
  { db: 'Israel',         wiki: 'Visa_requirements_for_Israeli_citizens' },
  { db: 'Afghanistan',    wiki: 'Visa_requirements_for_Afghan_citizens' },
  { db: 'Sri Lanka',      wiki: 'Visa_requirements_for_Sri_Lankan_citizens' },
  { db: 'Nepal',          wiki: 'Visa_requirements_for_Nepali_citizens' },
  { db: 'Bhutan',         wiki: 'Visa_requirements_for_Bhutanese_citizens' },
  { db: 'Maldives',       wiki: 'Visa_requirements_for_Maldivian_citizens' },
  // BATCH 10
  { db: 'Myanmar',        wiki: 'Visa_requirements_for_Burmese_citizens' },
  { db: 'Cambodia',       wiki: 'Visa_requirements_for_Cambodian_citizens' },
  { db: 'Laos',           wiki: 'Visa_requirements_for_Lao_citizens' },
  { db: 'Vietnam',        wiki: 'Visa_requirements_for_Vietnamese_citizens' },
  { db: 'Mongolia',       wiki: 'Visa_requirements_for_Mongolian_citizens' },
  { db: 'Kazakhstan',     wiki: 'Visa_requirements_for_Kazakhstani_citizens' },
  { db: 'Uzbekistan',     wiki: 'Visa_requirements_for_Uzbek_citizens' },
  { db: 'Tajikistan',     wiki: 'Visa_requirements_for_Tajik_citizens' },
  { db: 'Kyrgyzstan',     wiki: 'Visa_requirements_for_Kyrgyz_citizens' },
  { db: 'Turkmenistan',   wiki: 'Visa_requirements_for_Turkmen_citizens' },
  // BATCH 11
  { db: 'Armenia',        wiki: 'Visa_requirements_for_Armenian_citizens' },
  { db: 'Azerbaijan',     wiki: 'Visa_requirements_for_Azerbaijani_citizens' },
  { db: 'Georgia',        wiki: 'Visa_requirements_for_Georgian_citizens' },
  { db: 'Brunei',         wiki: 'Visa_requirements_for_Bruneian_citizens' },
  { db: 'Timor-Leste',    wiki: 'Visa_requirements_for_Timorese_citizens' },
  { db: 'North Korea',    wiki: 'Visa_requirements_for_North_Korean_citizens' },
  { db: 'Taiwan',         wiki: 'Visa_requirements_for_Republic_of_China_(Taiwan)_citizens' },
  { db: 'Russia',         wiki: 'Visa_requirements_for_Russian_citizens' },
  { db: 'Ukraine',        wiki: 'Visa_requirements_for_Ukrainian_citizens' },
  { db: 'Belarus',        wiki: 'Visa_requirements_for_Belarusian_citizens' },
  // BATCH 12
  { db: 'Poland',         wiki: 'Visa_requirements_for_Polish_citizens' },
  { db: 'Czech Republic', wiki: 'Visa_requirements_for_Czech_citizens' },
  { db: 'Slovakia',       wiki: 'Visa_requirements_for_Slovak_citizens' },
  { db: 'Hungary',        wiki: 'Visa_requirements_for_Hungarian_citizens' },
  { db: 'Romania',        wiki: 'Visa_requirements_for_Romanian_citizens' },
  { db: 'Bulgaria',       wiki: 'Visa_requirements_for_Bulgarian_citizens' },
  { db: 'Croatia',        wiki: 'Visa_requirements_for_Croatian_citizens' },
  { db: 'Serbia',         wiki: 'Visa_requirements_for_Serbian_citizens' },
  { db: 'Bosnia and Herzegovina', wiki: 'Visa_requirements_for_Bosnian_and_Herzegovinian_citizens' },
  { db: 'Albania',        wiki: 'Visa_requirements_for_Albanian_citizens' },
  // BATCH 13
  { db: 'Montenegro',     wiki: 'Visa_requirements_for_Montenegrin_citizens' },
  { db: 'North Macedonia', wiki: 'Visa_requirements_for_North_Macedonian_citizens' },
  { db: 'Kosovo',         wiki: 'Visa_requirements_for_Kosovar_citizens' },
  { db: 'Moldova',        wiki: 'Visa_requirements_for_Moldovan_citizens' },
  { db: 'Estonia',        wiki: 'Visa_requirements_for_Estonian_citizens' },
  { db: 'Latvia',         wiki: 'Visa_requirements_for_Latvian_citizens' },
  { db: 'Lithuania',      wiki: 'Visa_requirements_for_Lithuanian_citizens' },
  { db: 'Finland',        wiki: 'Visa_requirements_for_Finnish_citizens' },
  { db: 'Sweden',         wiki: 'Visa_requirements_for_Swedish_citizens' },
  { db: 'Norway',         wiki: 'Visa_requirements_for_Norwegian_citizens' },
  // BATCH 14
  { db: 'Denmark',        wiki: 'Visa_requirements_for_Danish_citizens' },
  { db: 'Iceland',        wiki: 'Visa_requirements_for_Icelandic_citizens' },
  { db: 'Ireland',        wiki: 'Visa_requirements_for_Irish_citizens' },
  { db: 'Netherlands',    wiki: 'Visa_requirements_for_Dutch_citizens' },
  { db: 'Belgium',        wiki: 'Visa_requirements_for_Belgian_citizens' },
  { db: 'Luxembourg',     wiki: 'Visa_requirements_for_Luxembourgish_citizens' },
  { db: 'Austria',        wiki: 'Visa_requirements_for_Austrian_citizens' },
  { db: 'Switzerland',    wiki: 'Visa_requirements_for_Swiss_citizens' },
  { db: 'Italy',          wiki: 'Visa_requirements_for_Italian_citizens' },
  { db: 'Spain',          wiki: 'Visa_requirements_for_Spanish_citizens' },
  // BATCH 15
  { db: 'Portugal',       wiki: 'Visa_requirements_for_Portuguese_citizens' },
  { db: 'Greece',         wiki: 'Visa_requirements_for_Greek_citizens' },
  { db: 'Malta',          wiki: 'Visa_requirements_for_Maltese_citizens' },
  { db: 'Cyprus',         wiki: 'Visa_requirements_for_Cypriot_citizens' },
  { db: 'Slovenia',       wiki: 'Visa_requirements_for_Slovenian_citizens' },
  { db: 'Liechtenstein',  wiki: 'Visa_requirements_for_Liechtenstein_citizens' },
  { db: 'Monaco',         wiki: 'Visa_requirements_for_Monégasque_citizens' },
  { db: 'San Marino',     wiki: 'Visa_requirements_for_Sammarinese_citizens' },
  { db: 'Andorra',        wiki: 'Visa_requirements_for_Andorran_citizens' },
  { db: 'Argentina',      wiki: 'Visa_requirements_for_Argentine_citizens' },
  // BATCH 16 (Brazil duplicated in original list, using Chile next)
  // Brazil already done in Batch 2, so skip and use Chile
  { db: 'Chile',          wiki: 'Visa_requirements_for_Chilean_citizens' },
  { db: 'Colombia',       wiki: 'Visa_requirements_for_Colombian_citizens' },
  { db: 'Peru',           wiki: 'Visa_requirements_for_Peruvian_citizens' },
  { db: 'Venezuela',      wiki: 'Visa_requirements_for_Venezuelan_citizens' },
  { db: 'Ecuador',        wiki: 'Visa_requirements_for_Ecuadorian_citizens' },
  { db: 'Bolivia',        wiki: 'Visa_requirements_for_Bolivian_citizens' },
  { db: 'Paraguay',       wiki: 'Visa_requirements_for_Paraguayan_citizens' },
  { db: 'Uruguay',        wiki: 'Visa_requirements_for_Uruguayan_citizens' },
  { db: 'Guyana',         wiki: 'Visa_requirements_for_Guyanese_citizens' },
  // BATCH 17
  { db: 'Suriname',       wiki: 'Visa_requirements_for_Surinamese_citizens' },
  { db: 'Cuba',           wiki: 'Visa_requirements_for_Cuban_citizens' },
  { db: 'Haiti',          wiki: 'Visa_requirements_for_Haitian_citizens' },
  { db: 'Dominican Republic', wiki: 'Visa_requirements_for_Dominican_Republic_citizens' },
  { db: 'Jamaica',        wiki: 'Visa_requirements_for_Jamaican_citizens' },
  { db: 'Trinidad and Tobago', wiki: 'Visa_requirements_for_Trinidadian_and_Tobagonian_citizens' },
  { db: 'Barbados',       wiki: 'Visa_requirements_for_Barbadian_citizens' },
  { db: 'Bahamas',        wiki: 'Visa_requirements_for_Bahamian_citizens' },
  { db: 'Grenada',        wiki: 'Visa_requirements_for_Grenadian_citizens' },
  { db: 'Saint Lucia',    wiki: 'Visa_requirements_for_Saint_Lucian_citizens' },
  // BATCH 18
  { db: 'Saint Vincent and the Grenadines', wiki: 'Visa_requirements_for_Vincentian_citizens' },
  { db: 'Saint Kitts and Nevis', wiki: 'Visa_requirements_for_Kittitian_and_Nevisian_citizens' },
  { db: 'Antigua and Barbuda', wiki: 'Visa_requirements_for_Antiguan_and_Barbudan_citizens' },
  { db: 'Dominica',       wiki: 'Visa_requirements_for_Dominican_citizens' },
  { db: 'Belize',         wiki: 'Visa_requirements_for_Belizean_citizens' },
  { db: 'Guatemala',      wiki: 'Visa_requirements_for_Guatemalan_citizens' },
  { db: 'Honduras',       wiki: 'Visa_requirements_for_Honduran_citizens' },
  { db: 'El Salvador',    wiki: 'Visa_requirements_for_Salvadoran_citizens' },
  { db: 'Nicaragua',      wiki: 'Visa_requirements_for_Nicaraguan_citizens' },
  { db: 'Costa Rica',     wiki: 'Visa_requirements_for_Costa_Rican_citizens' },
  // BATCH 19
  { db: 'Panama',         wiki: 'Visa_requirements_for_Panamanian_citizens' },
  // Australia already done in Batch 2
  { db: 'New Zealand',    wiki: 'Visa_requirements_for_New_Zealand_citizens' },
  { db: 'Fiji',           wiki: 'Visa_requirements_for_Fijian_citizens' },
  { db: 'Papua New Guinea', wiki: 'Visa_requirements_for_Papua_New_Guinean_citizens' },
  { db: 'Samoa',          wiki: 'Visa_requirements_for_Samoan_citizens' },
  { db: 'Tonga',          wiki: 'Visa_requirements_for_Tongan_citizens' },
  { db: 'Nauru',          wiki: 'Visa_requirements_for_Nauruan_citizens' },
  { db: 'Palau',          wiki: 'Visa_requirements_for_Palauan_citizens' },
  { db: 'Micronesia',     wiki: 'Visa_requirements_for_Micronesian_citizens' },
  // BATCH 20
  { db: 'Marshall Islands', wiki: 'Visa_requirements_for_Marshallese_citizens' },
  { db: 'Solomon Islands', wiki: 'Visa_requirements_for_Solomon_Islander_citizens' },
  { db: 'Vanuatu',        wiki: 'Visa_requirements_for_Ni-Vanuatu_citizens' },
  { db: 'Tuvalu',         wiki: 'Visa_requirements_for_Tuvaluan_citizens' },
  { db: 'Kiribati',       wiki: 'Visa_requirements_for_I-Kiribati_citizens' },
]

// Remove duplicates
const seen = new Set()
const UNIQUE_COUNTRIES = COUNTRIES.filter(c => {
  if (seen.has(c.db)) return false
  seen.add(c.db)
  return true
})

// ─── Main execution ──────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now()
  log(`\n${'═'.repeat(60)}`)
  log(`🌍 VisitPlane Complete World Visa Update – May 2026`)
  log(`${'═'.repeat(60)}`)
  log(`Total countries to process: ${UNIQUE_COUNTRIES.length}`)
  log(`Supabase: ${SUPABASE_URL}`)
  log(`${'═'.repeat(60)}\n`)

  // Process each country with delay between requests
  for (let i = 0; i < UNIQUE_COUNTRIES.length; i++) {
    const country = UNIQUE_COUNTRIES[i]
    log(`[${i + 1}/${UNIQUE_COUNTRIES.length}] Starting ${country.db}`)

    await updateCountry(country.db, country.wiki)

    // Delay between countries to be respectful of Wikipedia
    if (i < UNIQUE_COUNTRIES.length - 1) {
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  log(`\n${'═'.repeat(60)}`)
  log(`✅ COMPLETE! Final Report:`)
  log(`${'═'.repeat(60)}`)
  log(`  Countries processed:  ${stats.processed}`)
  log(`  DB records updated:   ${stats.updated}`)
  log(`  No DB match:          ${stats.noMatch}`)
  log(`  Errors:               ${stats.errors}`)
  log(`  Time elapsed:         ${minutes}m ${seconds}s`)
  log(`${'═'.repeat(60)}`)
  log(`\nLog saved to: visa_update_log.txt`)

  console.log(`\n\n✅ ALL DONE! Updated ${stats.updated} records across ${stats.processed} countries.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
