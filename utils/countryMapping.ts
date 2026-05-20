/**
 * Maps world-atlas/topojson geo.properties.name values → DB country names.
 * Handles the common mismatches between Natural Earth naming and our DB.
 */
export const GEO_TO_DB: Record<string, string> = {
  'United States of America': 'United States',
  'United Arab Emirates': 'UAE',
  'Republic of Korea': 'South Korea',
  'Dem. Rep. Korea': 'North Korea',
  'Dem. Rep. Congo': 'DR Congo',
  'Congo': 'Republic of the Congo',
  'Czechia': 'Czech Republic',
  'Czech Rep.': 'Czech Republic',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Central African Rep.': 'Central African Republic',
  'Dominican Rep.': 'Dominican Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'S. Sudan': 'South Sudan',
  'eSwatini': 'Eswatini',
  'Solomon Is.': 'Solomon Islands',
  "Côte d'Ivoire": 'Ivory Coast',
  'Lao PDR': 'Laos',
  'Russian Federation': 'Russia',
  'N. Macedonia': 'North Macedonia',
  'Macedonia': 'North Macedonia',
  'W. Bank': 'Palestine',
  'Gaza': 'Palestine',
  'Brunei Darussalam': 'Brunei',
  'Viet Nam': 'Vietnam',
  'Korea': 'South Korea',
  'Syrian Arab Republic': 'Syria',
  'Islamic Republic of Iran': 'Iran',
  'Libya': 'Libya',
  'Myanmar': 'Myanmar',
  'Timor-Leste': 'Timor-Leste',
  'Papua New Guinea': 'Papua New Guinea',
  'New Zealand': 'New Zealand',
  'Sri Lanka': 'Sri Lanka',
  'Saudi Arabia': 'Saudi Arabia',
  'South Africa': 'South Africa',
  'North Korea': 'North Korea',
  'South Korea': 'South Korea',
}

/** Normalize a geo.properties.name to its DB country name */
export function normalizeGeoName(geoName: string): string {
  return GEO_TO_DB[geoName] ?? geoName
}

/**
 * Country name → alpha-3 ISO code mapping (as provided in spec).
 * Used as a reference; map coloring uses normalizeGeoName instead.
 */
export const COUNTRY_ALPHA3: Record<string, string> = {
  'United States': 'USA', 'United Kingdom': 'GBR', 'Pakistan': 'PAK',
  'India': 'IND', 'China': 'CHN', 'Saudi Arabia': 'SAU', 'UAE': 'ARE',
  'Turkey': 'TUR', 'Malaysia': 'MYS', 'Thailand': 'THA', 'Japan': 'JPN',
  'France': 'FRA', 'Germany': 'DEU', 'Canada': 'CAN', 'Australia': 'AUS',
  'Brazil': 'BRA', 'Indonesia': 'IDN', 'Nigeria': 'NGA', 'Egypt': 'EGY',
  'Iran': 'IRN', 'Iraq': 'IRQ', 'Afghanistan': 'AFG', 'Russia': 'RUS',
  'Mexico': 'MEX', 'South Africa': 'ZAF', 'Kenya': 'KEN', 'Ethiopia': 'ETH',
  'Bangladesh': 'BGD', 'Philippines': 'PHL', 'Vietnam': 'VNM', 'South Korea': 'KOR',
  'Spain': 'ESP', 'Italy': 'ITA', 'Portugal': 'PRT', 'Netherlands': 'NLD',
  'Belgium': 'BEL', 'Switzerland': 'CHE', 'Austria': 'AUT', 'Sweden': 'SWE',
  'Norway': 'NOR', 'Denmark': 'DNK', 'Finland': 'FIN', 'Poland': 'POL',
  'Ukraine': 'UKR', 'Romania': 'ROU', 'Greece': 'GRC', 'Singapore': 'SGP',
  'New Zealand': 'NZL', 'Ireland': 'IRL', 'Israel': 'ISR', 'Jordan': 'JOR',
  'Lebanon': 'LBN', 'Kuwait': 'KWT', 'Qatar': 'QAT', 'Bahrain': 'BHR',
  'Oman': 'OMN', 'Morocco': 'MAR', 'Tunisia': 'TUN', 'Ghana': 'GHA',
  'Tanzania': 'TZA', 'Sri Lanka': 'LKA', 'Nepal': 'NPL', 'Myanmar': 'MMR',
  'Cambodia': 'KHM', 'Mongolia': 'MNG', 'Kazakhstan': 'KAZ', 'Armenia': 'ARM',
  'Georgia': 'GEO', 'Azerbaijan': 'AZE', 'Croatia': 'HRV', 'Serbia': 'SRB',
  'Hungary': 'HUN', 'Czech Republic': 'CZE', 'Slovakia': 'SVK',
}
