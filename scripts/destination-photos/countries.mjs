/**
 * Country dimension + Unsplash/Pexels search-query disambiguation map for the
 * destination-photo pipeline (15-cheapest-countries template, Phase 1).
 *
 * Extracted from the true unique country set across all 15 in-scope posts
 * (12 "15-cheapest-countries-to-visit-from-*-in-2026" + USA/UK/India-visa-free).
 * "Turkey"/"Türkiye" and "UAE"/"United Arab Emirates" are merged to one
 * canonical entry each.
 *
 * searchQuery: hand-checked per country for name ambiguity. Countries with a
 * real collision risk (a US state, a food, a common first/last name, a
 * product brand, a near-homograph of an unrelated place) get an explicit
 * disambiguated query. Everything else defaults to
 * "{country} travel landscape landmark".
 *
 * avg_daily_cost_usd is a rough budget-traveller estimate (accommodation +
 * food + local transport), used only for the card's cost figure — not a
 * visa/pricing source of truth (see public.visa_requirements for that).
 */

export const COUNTRIES = [
  { code: 'AL', name: 'Albania', region: 'Europe', avgDailyCostUsd: 45 },
  { code: 'AZ', name: 'Azerbaijan', region: 'Caucasus', avgDailyCostUsd: 45 },
  { code: 'BB', name: 'Barbados', region: 'Caribbean', avgDailyCostUsd: 110 },
  { code: 'BJ', name: 'Benin', region: 'West Africa', avgDailyCostUsd: 35, searchQuery: 'Benin West Africa Cotonou travel landmark' },
  { code: 'BT', name: 'Bhutan', region: 'South Asia', avgDailyCostUsd: 65 },
  { code: 'BO', name: 'Bolivia', region: 'South America', avgDailyCostUsd: 35 },
  { code: 'BW', name: 'Botswana', region: 'Southern Africa', avgDailyCostUsd: 60 },
  { code: 'BN', name: 'Brunei', region: 'Southeast Asia', avgDailyCostUsd: 55 },
  { code: 'BG', name: 'Bulgaria', region: 'Europe', avgDailyCostUsd: 40 },
  { code: 'BF', name: 'Burkina Faso', region: 'West Africa', avgDailyCostUsd: 30 },
  { code: 'CV', name: 'Cabo Verde', region: 'West Africa', avgDailyCostUsd: 55 },
  { code: 'KH', name: 'Cambodia', region: 'Southeast Asia', avgDailyCostUsd: 30 },
  { code: 'CN', name: 'China', region: 'East Asia', avgDailyCostUsd: 55, searchQuery: 'China country Great Wall Beijing travel landmark' },
  { code: 'CO', name: 'Colombia', region: 'South America', avgDailyCostUsd: 35, searchQuery: 'Colombia country Bogota Cartagena travel landmark' },
  { code: 'CI', name: "Côte d'Ivoire", region: 'West Africa', avgDailyCostUsd: 45, searchQuery: "Cote d'Ivoire Abidjan West Africa travel landmark" },
  { code: 'EG', name: 'Egypt', region: 'North Africa', avgDailyCostUsd: 35 },
  { code: 'ET', name: 'Ethiopia', region: 'East Africa', avgDailyCostUsd: 30 },
  { code: 'FJ', name: 'Fiji', region: 'Pacific', avgDailyCostUsd: 75, searchQuery: 'Fiji islands South Pacific travel landmark' },
  { code: 'GE', name: 'Georgia', region: 'Caucasus', avgDailyCostUsd: 35, searchQuery: 'Georgia country Caucasus Tbilisi travel landmark' },
  { code: 'GH', name: 'Ghana', region: 'West Africa', avgDailyCostUsd: 40 },
  { code: 'GT', name: 'Guatemala', region: 'Central America', avgDailyCostUsd: 35 },
  { code: 'HK', name: 'Hong Kong', region: 'East Asia', avgDailyCostUsd: 90, searchQuery: 'Hong Kong skyline harbour travel landmark' },
  { code: 'IN', name: 'India', region: 'South Asia', avgDailyCostUsd: 30 },
  { code: 'ID', name: 'Indonesia', region: 'Southeast Asia', avgDailyCostUsd: 30 },
  { code: 'JO', name: 'Jordan', region: 'Middle East', avgDailyCostUsd: 55, searchQuery: 'Jordan country Petra Amman travel landmark' },
  { code: 'KE', name: 'Kenya', region: 'East Africa', avgDailyCostUsd: 45 },
  { code: 'KG', name: 'Kyrgyzstan', region: 'Central Asia', avgDailyCostUsd: 30 },
  { code: 'LA', name: 'Laos', region: 'Southeast Asia', avgDailyCostUsd: 30, searchQuery: 'Laos country Luang Prabang travel landmark' },
  { code: 'MY', name: 'Malaysia', region: 'Southeast Asia', avgDailyCostUsd: 35 },
  { code: 'MV', name: 'Maldives', region: 'South Asia', avgDailyCostUsd: 120 },
  { code: 'MU', name: 'Mauritius', region: 'East Africa', avgDailyCostUsd: 90 },
  { code: 'MX', name: 'Mexico', region: 'North America', avgDailyCostUsd: 45, searchQuery: 'Mexico country travel landmark -newmexico' },
  { code: 'MA', name: 'Morocco', region: 'North Africa', avgDailyCostUsd: 40 },
  { code: 'MM', name: 'Myanmar', region: 'Southeast Asia', avgDailyCostUsd: 30 },
  { code: 'NP', name: 'Nepal', region: 'South Asia', avgDailyCostUsd: 30 },
  { code: 'NG', name: 'Nigeria', region: 'West Africa', avgDailyCostUsd: 45, searchQuery: 'Nigeria country Lagos travel landmark' },
  { code: 'PE', name: 'Peru', region: 'South America', avgDailyCostUsd: 35 },
  { code: 'PH', name: 'Philippines', region: 'Southeast Asia', avgDailyCostUsd: 35 },
  { code: 'PT', name: 'Portugal', region: 'Europe', avgDailyCostUsd: 60 },
  { code: 'QA', name: 'Qatar', region: 'Middle East', avgDailyCostUsd: 90 },
  { code: 'RW', name: 'Rwanda', region: 'East Africa', avgDailyCostUsd: 45 },
  { code: 'SN', name: 'Senegal', region: 'West Africa', avgDailyCostUsd: 45 },
  { code: 'SC', name: 'Seychelles', region: 'East Africa', avgDailyCostUsd: 130 },
  { code: 'SL', name: 'Sierra Leone', region: 'West Africa', avgDailyCostUsd: 35 },
  { code: 'SG', name: 'Singapore', region: 'Southeast Asia', avgDailyCostUsd: 90 },
  { code: 'ZA', name: 'South Africa', region: 'Southern Africa', avgDailyCostUsd: 50 },
  { code: 'LK', name: 'Sri Lanka', region: 'South Asia', avgDailyCostUsd: 35 },
  { code: 'ST', name: 'São Tomé & Príncipe', region: 'West Africa', avgDailyCostUsd: 55, searchQuery: 'Sao Tome and Principe islands travel landmark' },
  { code: 'TZ', name: 'Tanzania', region: 'East Africa', avgDailyCostUsd: 50 },
  { code: 'TH', name: 'Thailand', region: 'Southeast Asia', avgDailyCostUsd: 35 },
  { code: 'GM', name: 'The Gambia', region: 'West Africa', avgDailyCostUsd: 35, searchQuery: 'The Gambia country West Africa travel landmark' },
  { code: 'TL', name: 'Timor-Leste', region: 'Southeast Asia', avgDailyCostUsd: 40, searchQuery: 'Timor-Leste East Timor Dili travel landmark' },
  { code: 'TG', name: 'Togo', region: 'West Africa', avgDailyCostUsd: 35, searchQuery: 'Togo country Lome West Africa travel landmark' },
  { code: 'TN', name: 'Tunisia', region: 'North Africa', avgDailyCostUsd: 35 },
  { code: 'TR', name: 'Turkey', region: 'Europe/Middle East', avgDailyCostUsd: 40, searchQuery: 'Turkey country Istanbul Cappadocia travel landmark' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East', avgDailyCostUsd: 90 },
  { code: 'UG', name: 'Uganda', region: 'East Africa', avgDailyCostUsd: 40 },
  { code: 'VN', name: 'Vietnam', region: 'Southeast Asia', avgDailyCostUsd: 30 },
  { code: 'ZM', name: 'Zambia', region: 'Southern Africa', avgDailyCostUsd: 50 },
  { code: 'ZW', name: 'Zimbabwe', region: 'Southern Africa', avgDailyCostUsd: 45 },
]

// Raw name variants seen in post content, normalized to the canonical entries above.
export const NAME_ALIASES = {
  Türkiye: 'Turkey',
  UAE: 'United Arab Emirates',
}

export function canonicalCountryName(rawName) {
  return NAME_ALIASES[rawName] ?? rawName
}

export function searchQueryFor(country) {
  return country.searchQuery ?? `${country.name} travel landscape landmark`
}
