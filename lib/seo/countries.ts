/**
 * Visitplane — Programmatic SEO country data library
 *
 * Single source of truth for:
 *  - Country ISO codes (alpha-2, alpha-3)
 *  - Display names (canonical)
 *  - URL slugs
 *  - Nationality adjectives
 *  - Flag emojis
 *  - Region / continent
 *
 * Used by all 4 programmatic SEO templates, sitemap generator,
 * content pipeline, and internal linking algorithm.
 */

export type Country = {
  iso2: string       // ISO 3166-1 alpha-2
  iso3: string       // ISO 3166-1 alpha-3
  name: string       // canonical display name (matches DB)
  slug: string       // URL-safe slug
  nationality: string // adjective for URL slugs ("pakistani", "british")
  nounPlural: string  // noun plural ("Pakistanis", "British citizens")
  flag: string        // flag emoji
  continent: string   // AF, AS, EU, NA, SA, OC, AN
}

export const COUNTRIES: Country[] = [
  // ── South Asia ─────────────────────────────────────────────────────────────
  { iso2: 'PK', iso3: 'PAK', name: 'Pakistan',        slug: 'pakistan',        nationality: 'pakistani',     nounPlural: 'Pakistani citizens',   flag: '🇵🇰', continent: 'AS' },
  { iso2: 'IN', iso3: 'IND', name: 'India',           slug: 'india',           nationality: 'indian',        nounPlural: 'Indian citizens',      flag: '🇮🇳', continent: 'AS' },
  { iso2: 'BD', iso3: 'BGD', name: 'Bangladesh',      slug: 'bangladesh',      nationality: 'bangladeshi',   nounPlural: 'Bangladeshi citizens',  flag: '🇧🇩', continent: 'AS' },
  { iso2: 'LK', iso3: 'LKA', name: 'Sri Lanka',       slug: 'sri-lanka',       nationality: 'sri-lankan',    nounPlural: 'Sri Lankan citizens',   flag: '🇱🇰', continent: 'AS' },
  { iso2: 'NP', iso3: 'NPL', name: 'Nepal',           slug: 'nepal',           nationality: 'nepali',        nounPlural: 'Nepali citizens',       flag: '🇳🇵', continent: 'AS' },
  { iso2: 'AF', iso3: 'AFG', name: 'Afghanistan',     slug: 'afghanistan',     nationality: 'afghan',        nounPlural: 'Afghan citizens',       flag: '🇦🇫', continent: 'AS' },
  { iso2: 'MV', iso3: 'MDV', name: 'Maldives',        slug: 'maldives',        nationality: 'maldivian',     nounPlural: 'Maldivian citizens',    flag: '🇲🇻', continent: 'AS' },
  { iso2: 'BT', iso3: 'BTN', name: 'Bhutan',          slug: 'bhutan',          nationality: 'bhutanese',     nounPlural: 'Bhutanese citizens',    flag: '🇧🇹', continent: 'AS' },

  // ── Middle East ─────────────────────────────────────────────────────────────
  { iso2: 'AE', iso3: 'ARE', name: 'UAE',             slug: 'uae',             nationality: 'emirati',       nounPlural: 'Emirati citizens',      flag: '🇦🇪', continent: 'AS' },
  { iso2: 'SA', iso3: 'SAU', name: 'Saudi Arabia',    slug: 'saudi-arabia',    nationality: 'saudi',         nounPlural: 'Saudi citizens',        flag: '🇸🇦', continent: 'AS' },
  { iso2: 'QA', iso3: 'QAT', name: 'Qatar',           slug: 'qatar',           nationality: 'qatari',        nounPlural: 'Qatari citizens',       flag: '🇶🇦', continent: 'AS' },
  { iso2: 'KW', iso3: 'KWT', name: 'Kuwait',          slug: 'kuwait',          nationality: 'kuwaiti',       nounPlural: 'Kuwaiti citizens',      flag: '🇰🇼', continent: 'AS' },
  { iso2: 'BH', iso3: 'BHR', name: 'Bahrain',         slug: 'bahrain',         nationality: 'bahraini',      nounPlural: 'Bahraini citizens',     flag: '🇧🇭', continent: 'AS' },
  { iso2: 'OM', iso3: 'OMN', name: 'Oman',            slug: 'oman',            nationality: 'omani',         nounPlural: 'Omani citizens',        flag: '🇴🇲', continent: 'AS' },
  { iso2: 'JO', iso3: 'JOR', name: 'Jordan',          slug: 'jordan',          nationality: 'jordanian',     nounPlural: 'Jordanian citizens',    flag: '🇯🇴', continent: 'AS' },
  { iso2: 'LB', iso3: 'LBN', name: 'Lebanon',         slug: 'lebanon',         nationality: 'lebanese',      nounPlural: 'Lebanese citizens',     flag: '🇱🇧', continent: 'AS' },
  { iso2: 'IL', iso3: 'ISR', name: 'Israel',          slug: 'israel',          nationality: 'israeli',       nounPlural: 'Israeli citizens',      flag: '🇮🇱', continent: 'AS' },
  { iso2: 'IR', iso3: 'IRN', name: 'Iran',            slug: 'iran',            nationality: 'iranian',       nounPlural: 'Iranian citizens',      flag: '🇮🇷', continent: 'AS' },
  { iso2: 'IQ', iso3: 'IRQ', name: 'Iraq',            slug: 'iraq',            nationality: 'iraqi',         nounPlural: 'Iraqi citizens',        flag: '🇮🇶', continent: 'AS' },
  { iso2: 'SY', iso3: 'SYR', name: 'Syria',           slug: 'syria',           nationality: 'syrian',        nounPlural: 'Syrian citizens',       flag: '🇸🇾', continent: 'AS' },
  { iso2: 'YE', iso3: 'YEM', name: 'Yemen',           slug: 'yemen',           nationality: 'yemeni',        nounPlural: 'Yemeni citizens',       flag: '🇾🇪', continent: 'AS' },
  { iso2: 'PS', iso3: 'PSE', name: 'Palestine',       slug: 'palestine',       nationality: 'palestinian',   nounPlural: 'Palestinian citizens',  flag: '🇵🇸', continent: 'AS' },

  // ── East & Southeast Asia ───────────────────────────────────────────────────
  { iso2: 'CN', iso3: 'CHN', name: 'China',           slug: 'china',           nationality: 'chinese',       nounPlural: 'Chinese citizens',      flag: '🇨🇳', continent: 'AS' },
  { iso2: 'JP', iso3: 'JPN', name: 'Japan',           slug: 'japan',           nationality: 'japanese',      nounPlural: 'Japanese citizens',     flag: '🇯🇵', continent: 'AS' },
  { iso2: 'KR', iso3: 'KOR', name: 'South Korea',     slug: 'south-korea',     nationality: 'south-korean',  nounPlural: 'South Korean citizens', flag: '🇰🇷', continent: 'AS' },
  { iso2: 'KP', iso3: 'PRK', name: 'North Korea',     slug: 'north-korea',     nationality: 'north-korean',  nounPlural: 'North Korean citizens', flag: '🇰🇵', continent: 'AS' },
  { iso2: 'TW', iso3: 'TWN', name: 'Taiwan',          slug: 'taiwan',          nationality: 'taiwanese',     nounPlural: 'Taiwanese citizens',    flag: '🇹🇼', continent: 'AS' },
  { iso2: 'HK', iso3: 'HKG', name: 'Hong Kong',       slug: 'hong-kong',       nationality: 'hong-kong',     nounPlural: 'Hong Kong residents',   flag: '🇭🇰', continent: 'AS' },
  { iso2: 'SG', iso3: 'SGP', name: 'Singapore',       slug: 'singapore',       nationality: 'singaporean',   nounPlural: 'Singaporean citizens',  flag: '🇸🇬', continent: 'AS' },
  { iso2: 'MY', iso3: 'MYS', name: 'Malaysia',        slug: 'malaysia',        nationality: 'malaysian',     nounPlural: 'Malaysian citizens',    flag: '🇲🇾', continent: 'AS' },
  { iso2: 'TH', iso3: 'THA', name: 'Thailand',        slug: 'thailand',        nationality: 'thai',          nounPlural: 'Thai citizens',         flag: '🇹🇭', continent: 'AS' },
  { iso2: 'ID', iso3: 'IDN', name: 'Indonesia',       slug: 'indonesia',       nationality: 'indonesian',    nounPlural: 'Indonesian citizens',   flag: '🇮🇩', continent: 'AS' },
  { iso2: 'PH', iso3: 'PHL', name: 'Philippines',     slug: 'philippines',     nationality: 'filipino',      nounPlural: 'Filipino citizens',     flag: '🇵🇭', continent: 'AS' },
  { iso2: 'VN', iso3: 'VNM', name: 'Vietnam',         slug: 'vietnam',         nationality: 'vietnamese',    nounPlural: 'Vietnamese citizens',   flag: '🇻🇳', continent: 'AS' },
  { iso2: 'KH', iso3: 'KHM', name: 'Cambodia',        slug: 'cambodia',        nationality: 'cambodian',     nounPlural: 'Cambodian citizens',    flag: '🇰🇭', continent: 'AS' },
  { iso2: 'MM', iso3: 'MMR', name: 'Myanmar',         slug: 'myanmar',         nationality: 'myanmar',       nounPlural: 'Myanmar citizens',      flag: '🇲🇲', continent: 'AS' },
  { iso2: 'LA', iso3: 'LAO', name: 'Laos',            slug: 'laos',            nationality: 'lao',           nounPlural: 'Lao citizens',          flag: '🇱🇦', continent: 'AS' },
  { iso2: 'BN', iso3: 'BRN', name: 'Brunei',          slug: 'brunei',          nationality: 'bruneian',      nounPlural: 'Bruneian citizens',     flag: '🇧🇳', continent: 'AS' },
  { iso2: 'TL', iso3: 'TLS', name: 'Timor-Leste',     slug: 'timor-leste',     nationality: 'timorese',      nounPlural: 'Timorese citizens',     flag: '🇹🇱', continent: 'AS' },

  // ── Central Asia ─────────────────────────────────────────────────────────────
  { iso2: 'KZ', iso3: 'KAZ', name: 'Kazakhstan',      slug: 'kazakhstan',      nationality: 'kazakhstani',   nounPlural: 'Kazakhstani citizens',  flag: '🇰🇿', continent: 'AS' },
  { iso2: 'UZ', iso3: 'UZB', name: 'Uzbekistan',      slug: 'uzbekistan',      nationality: 'uzbek',         nounPlural: 'Uzbek citizens',        flag: '🇺🇿', continent: 'AS' },
  { iso2: 'TM', iso3: 'TKM', name: 'Turkmenistan',    slug: 'turkmenistan',    nationality: 'turkmen',       nounPlural: 'Turkmen citizens',      flag: '🇹🇲', continent: 'AS' },
  { iso2: 'TJ', iso3: 'TJK', name: 'Tajikistan',      slug: 'tajikistan',      nationality: 'tajik',         nounPlural: 'Tajik citizens',        flag: '🇹🇯', continent: 'AS' },
  { iso2: 'KG', iso3: 'KGZ', name: 'Kyrgyzstan',      slug: 'kyrgyzstan',      nationality: 'kyrgyz',        nounPlural: 'Kyrgyz citizens',       flag: '🇰🇬', continent: 'AS' },

  // ── Caucasus ──────────────────────────────────────────────────────────────────
  { iso2: 'AZ', iso3: 'AZE', name: 'Azerbaijan',      slug: 'azerbaijan',      nationality: 'azerbaijani',   nounPlural: 'Azerbaijani citizens',  flag: '🇦🇿', continent: 'AS' },
  { iso2: 'AM', iso3: 'ARM', name: 'Armenia',         slug: 'armenia',         nationality: 'armenian',      nounPlural: 'Armenian citizens',     flag: '🇦🇲', continent: 'AS' },
  { iso2: 'GE', iso3: 'GEO', name: 'Georgia',         slug: 'georgia',         nationality: 'georgian',      nounPlural: 'Georgian citizens',     flag: '🇬🇪', continent: 'AS' },

  // ── Turkey (transcontinental) ─────────────────────────────────────────────
  { iso2: 'TR', iso3: 'TUR', name: 'Turkey',          slug: 'turkey',          nationality: 'turkish',       nounPlural: 'Turkish citizens',      flag: '🇹🇷', continent: 'AS' },

  // ── Mongolia ──────────────────────────────────────────────────────────────────
  { iso2: 'MN', iso3: 'MNG', name: 'Mongolia',        slug: 'mongolia',        nationality: 'mongolian',     nounPlural: 'Mongolian citizens',    flag: '🇲🇳', continent: 'AS' },

  // ── Western Europe ─────────────────────────────────────────────────────────
  { iso2: 'GB', iso3: 'GBR', name: 'United Kingdom',  slug: 'united-kingdom',  nationality: 'british',       nounPlural: 'British citizens',      flag: '🇬🇧', continent: 'EU' },
  { iso2: 'DE', iso3: 'DEU', name: 'Germany',         slug: 'germany',         nationality: 'german',        nounPlural: 'German citizens',       flag: '🇩🇪', continent: 'EU' },
  { iso2: 'FR', iso3: 'FRA', name: 'France',          slug: 'france',          nationality: 'french',        nounPlural: 'French citizens',       flag: '🇫🇷', continent: 'EU' },
  { iso2: 'IT', iso3: 'ITA', name: 'Italy',           slug: 'italy',           nationality: 'italian',       nounPlural: 'Italian citizens',      flag: '🇮🇹', continent: 'EU' },
  { iso2: 'ES', iso3: 'ESP', name: 'Spain',           slug: 'spain',           nationality: 'spanish',       nounPlural: 'Spanish citizens',      flag: '🇪🇸', continent: 'EU' },
  { iso2: 'NL', iso3: 'NLD', name: 'Netherlands',     slug: 'netherlands',     nationality: 'dutch',         nounPlural: 'Dutch citizens',        flag: '🇳🇱', continent: 'EU' },
  { iso2: 'BE', iso3: 'BEL', name: 'Belgium',         slug: 'belgium',         nationality: 'belgian',       nounPlural: 'Belgian citizens',      flag: '🇧🇪', continent: 'EU' },
  { iso2: 'CH', iso3: 'CHE', name: 'Switzerland',     slug: 'switzerland',     nationality: 'swiss',         nounPlural: 'Swiss citizens',        flag: '🇨🇭', continent: 'EU' },
  { iso2: 'AT', iso3: 'AUT', name: 'Austria',         slug: 'austria',         nationality: 'austrian',      nounPlural: 'Austrian citizens',     flag: '🇦🇹', continent: 'EU' },
  { iso2: 'PT', iso3: 'PRT', name: 'Portugal',        slug: 'portugal',        nationality: 'portuguese',    nounPlural: 'Portuguese citizens',   flag: '🇵🇹', continent: 'EU' },
  { iso2: 'SE', iso3: 'SWE', name: 'Sweden',          slug: 'sweden',          nationality: 'swedish',       nounPlural: 'Swedish citizens',      flag: '🇸🇪', continent: 'EU' },
  { iso2: 'NO', iso3: 'NOR', name: 'Norway',          slug: 'norway',          nationality: 'norwegian',     nounPlural: 'Norwegian citizens',    flag: '🇳🇴', continent: 'EU' },
  { iso2: 'DK', iso3: 'DNK', name: 'Denmark',         slug: 'denmark',         nationality: 'danish',        nounPlural: 'Danish citizens',       flag: '🇩🇰', continent: 'EU' },
  { iso2: 'FI', iso3: 'FIN', name: 'Finland',         slug: 'finland',         nationality: 'finnish',       nounPlural: 'Finnish citizens',      flag: '🇫🇮', continent: 'EU' },
  { iso2: 'IE', iso3: 'IRL', name: 'Ireland',         slug: 'ireland',         nationality: 'irish',         nounPlural: 'Irish citizens',        flag: '🇮🇪', continent: 'EU' },
  { iso2: 'GR', iso3: 'GRC', name: 'Greece',          slug: 'greece',          nationality: 'greek',         nounPlural: 'Greek citizens',        flag: '🇬🇷', continent: 'EU' },

  // ── Central & Eastern Europe ──────────────────────────────────────────────
  { iso2: 'PL', iso3: 'POL', name: 'Poland',          slug: 'poland',          nationality: 'polish',        nounPlural: 'Polish citizens',       flag: '🇵🇱', continent: 'EU' },
  { iso2: 'UA', iso3: 'UKR', name: 'Ukraine',         slug: 'ukraine',         nationality: 'ukrainian',     nounPlural: 'Ukrainian citizens',    flag: '🇺🇦', continent: 'EU' },
  { iso2: 'RU', iso3: 'RUS', name: 'Russia',          slug: 'russia',          nationality: 'russian',       nounPlural: 'Russian citizens',      flag: '🇷🇺', continent: 'EU' },
  { iso2: 'RO', iso3: 'ROU', name: 'Romania',         slug: 'romania',         nationality: 'romanian',      nounPlural: 'Romanian citizens',     flag: '🇷🇴', continent: 'EU' },
  { iso2: 'HU', iso3: 'HUN', name: 'Hungary',         slug: 'hungary',         nationality: 'hungarian',     nounPlural: 'Hungarian citizens',    flag: '🇭🇺', continent: 'EU' },
  { iso2: 'CZ', iso3: 'CZE', name: 'Czechia',         slug: 'czechia',         nationality: 'czech',         nounPlural: 'Czech citizens',        flag: '🇨🇿', continent: 'EU' },
  { iso2: 'SK', iso3: 'SVK', name: 'Slovakia',        slug: 'slovakia',        nationality: 'slovak',        nounPlural: 'Slovak citizens',       flag: '🇸🇰', continent: 'EU' },
  { iso2: 'BG', iso3: 'BGR', name: 'Bulgaria',        slug: 'bulgaria',        nationality: 'bulgarian',     nounPlural: 'Bulgarian citizens',    flag: '🇧🇬', continent: 'EU' },
  { iso2: 'HR', iso3: 'HRV', name: 'Croatia',         slug: 'croatia',         nationality: 'croatian',      nounPlural: 'Croatian citizens',     flag: '🇭🇷', continent: 'EU' },
  { iso2: 'RS', iso3: 'SRB', name: 'Serbia',          slug: 'serbia',          nationality: 'serbian',       nounPlural: 'Serbian citizens',      flag: '🇷🇸', continent: 'EU' },
  { iso2: 'BA', iso3: 'BIH', name: 'Bosnia and Herzegovina', slug: 'bosnia', nationality: 'bosnian',        nounPlural: 'Bosnian citizens',      flag: '🇧🇦', continent: 'EU' },
  { iso2: 'AL', iso3: 'ALB', name: 'Albania',         slug: 'albania',         nationality: 'albanian',      nounPlural: 'Albanian citizens',     flag: '🇦🇱', continent: 'EU' },
  { iso2: 'MK', iso3: 'MKD', name: 'North Macedonia', slug: 'north-macedonia', nationality: 'macedonian',    nounPlural: 'Macedonian citizens',   flag: '🇲🇰', continent: 'EU' },
  { iso2: 'LT', iso3: 'LTU', name: 'Lithuania',       slug: 'lithuania',       nationality: 'lithuanian',    nounPlural: 'Lithuanian citizens',   flag: '🇱🇹', continent: 'EU' },
  { iso2: 'LV', iso3: 'LVA', name: 'Latvia',          slug: 'latvia',          nationality: 'latvian',       nounPlural: 'Latvian citizens',      flag: '🇱🇻', continent: 'EU' },
  { iso2: 'EE', iso3: 'EST', name: 'Estonia',         slug: 'estonia',         nationality: 'estonian',      nounPlural: 'Estonian citizens',     flag: '🇪🇪', continent: 'EU' },
  { iso2: 'BY', iso3: 'BLR', name: 'Belarus',         slug: 'belarus',         nationality: 'belarusian',    nounPlural: 'Belarusian citizens',   flag: '🇧🇾', continent: 'EU' },
  { iso2: 'MD', iso3: 'MDA', name: 'Moldova',         slug: 'moldova',         nationality: 'moldovan',      nounPlural: 'Moldovan citizens',     flag: '🇲🇩', continent: 'EU' },
  { iso2: 'SI', iso3: 'SVN', name: 'Slovenia',        slug: 'slovenia',        nationality: 'slovenian',     nounPlural: 'Slovenian citizens',    flag: '🇸🇮', continent: 'EU' },
  { iso2: 'ME', iso3: 'MNE', name: 'Montenegro',      slug: 'montenegro',      nationality: 'montenegrin',   nounPlural: 'Montenegrin citizens',  flag: '🇲🇪', continent: 'EU' },

  // ── North America ─────────────────────────────────────────────────────────
  { iso2: 'US', iso3: 'USA', name: 'United States',   slug: 'united-states',   nationality: 'american',      nounPlural: 'American citizens',     flag: '🇺🇸', continent: 'NA' },
  { iso2: 'CA', iso3: 'CAN', name: 'Canada',          slug: 'canada',          nationality: 'canadian',      nounPlural: 'Canadian citizens',     flag: '🇨🇦', continent: 'NA' },
  { iso2: 'MX', iso3: 'MEX', name: 'Mexico',          slug: 'mexico',          nationality: 'mexican',       nounPlural: 'Mexican citizens',      flag: '🇲🇽', continent: 'NA' },
  { iso2: 'CU', iso3: 'CUB', name: 'Cuba',            slug: 'cuba',            nationality: 'cuban',         nounPlural: 'Cuban citizens',        flag: '🇨🇺', continent: 'NA' },
  { iso2: 'DO', iso3: 'DOM', name: 'Dominican Republic', slug: 'dominican-republic', nationality: 'dominican', nounPlural: 'Dominican citizens',  flag: '🇩🇴', continent: 'NA' },
  { iso2: 'HT', iso3: 'HTI', name: 'Haiti',           slug: 'haiti',           nationality: 'haitian',       nounPlural: 'Haitian citizens',      flag: '🇭🇹', continent: 'NA' },
  { iso2: 'JM', iso3: 'JAM', name: 'Jamaica',         slug: 'jamaica',         nationality: 'jamaican',      nounPlural: 'Jamaican citizens',     flag: '🇯🇲', continent: 'NA' },
  { iso2: 'TT', iso3: 'TTO', name: 'Trinidad and Tobago', slug: 'trinidad-and-tobago', nationality: 'trinidadian', nounPlural: 'Trinidadian citizens', flag: '🇹🇹', continent: 'NA' },
  { iso2: 'GT', iso3: 'GTM', name: 'Guatemala',       slug: 'guatemala',       nationality: 'guatemalan',    nounPlural: 'Guatemalan citizens',   flag: '🇬🇹', continent: 'NA' },
  { iso2: 'HN', iso3: 'HND', name: 'Honduras',        slug: 'honduras',        nationality: 'honduran',      nounPlural: 'Honduran citizens',     flag: '🇭🇳', continent: 'NA' },
  { iso2: 'SV', iso3: 'SLV', name: 'El Salvador',     slug: 'el-salvador',     nationality: 'salvadoran',    nounPlural: 'Salvadoran citizens',   flag: '🇸🇻', continent: 'NA' },
  { iso2: 'NI', iso3: 'NIC', name: 'Nicaragua',       slug: 'nicaragua',       nationality: 'nicaraguan',    nounPlural: 'Nicaraguan citizens',   flag: '🇳🇮', continent: 'NA' },
  { iso2: 'CR', iso3: 'CRI', name: 'Costa Rica',      slug: 'costa-rica',      nationality: 'costa-rican',   nounPlural: 'Costa Rican citizens',  flag: '🇨🇷', continent: 'NA' },
  { iso2: 'PA', iso3: 'PAN', name: 'Panama',          slug: 'panama',          nationality: 'panamanian',    nounPlural: 'Panamanian citizens',   flag: '🇵🇦', continent: 'NA' },

  // ── South America ─────────────────────────────────────────────────────────
  { iso2: 'BR', iso3: 'BRA', name: 'Brazil',          slug: 'brazil',          nationality: 'brazilian',     nounPlural: 'Brazilian citizens',    flag: '🇧🇷', continent: 'SA' },
  { iso2: 'AR', iso3: 'ARG', name: 'Argentina',       slug: 'argentina',       nationality: 'argentinian',   nounPlural: 'Argentine citizens',    flag: '🇦🇷', continent: 'SA' },
  { iso2: 'CO', iso3: 'COL', name: 'Colombia',        slug: 'colombia',        nationality: 'colombian',     nounPlural: 'Colombian citizens',    flag: '🇨🇴', continent: 'SA' },
  { iso2: 'CL', iso3: 'CHL', name: 'Chile',           slug: 'chile',           nationality: 'chilean',       nounPlural: 'Chilean citizens',      flag: '🇨🇱', continent: 'SA' },
  { iso2: 'PE', iso3: 'PER', name: 'Peru',            slug: 'peru',            nationality: 'peruvian',      nounPlural: 'Peruvian citizens',     flag: '🇵🇪', continent: 'SA' },
  { iso2: 'VE', iso3: 'VEN', name: 'Venezuela',       slug: 'venezuela',       nationality: 'venezuelan',    nounPlural: 'Venezuelan citizens',   flag: '🇻🇪', continent: 'SA' },
  { iso2: 'EC', iso3: 'ECU', name: 'Ecuador',         slug: 'ecuador',         nationality: 'ecuadorian',    nounPlural: 'Ecuadorian citizens',   flag: '🇪🇨', continent: 'SA' },
  { iso2: 'BO', iso3: 'BOL', name: 'Bolivia',         slug: 'bolivia',         nationality: 'bolivian',      nounPlural: 'Bolivian citizens',     flag: '🇧🇴', continent: 'SA' },
  { iso2: 'PY', iso3: 'PRY', name: 'Paraguay',        slug: 'paraguay',        nationality: 'paraguayan',    nounPlural: 'Paraguayan citizens',   flag: '🇵🇾', continent: 'SA' },
  { iso2: 'UY', iso3: 'URY', name: 'Uruguay',         slug: 'uruguay',         nationality: 'uruguayan',     nounPlural: 'Uruguayan citizens',    flag: '🇺🇾', continent: 'SA' },
  { iso2: 'GY', iso3: 'GUY', name: 'Guyana',          slug: 'guyana',          nationality: 'guyanese',      nounPlural: 'Guyanese citizens',     flag: '🇬🇾', continent: 'SA' },
  { iso2: 'SR', iso3: 'SUR', name: 'Suriname',        slug: 'suriname',        nationality: 'surinamese',    nounPlural: 'Surinamese citizens',   flag: '🇸🇷', continent: 'SA' },

  // ── Africa ────────────────────────────────────────────────────────────────
  { iso2: 'NG', iso3: 'NGA', name: 'Nigeria',         slug: 'nigeria',         nationality: 'nigerian',      nounPlural: 'Nigerian citizens',     flag: '🇳🇬', continent: 'AF' },
  { iso2: 'GH', iso3: 'GHA', name: 'Ghana',           slug: 'ghana',           nationality: 'ghanaian',      nounPlural: 'Ghanaian citizens',     flag: '🇬🇭', continent: 'AF' },
  { iso2: 'KE', iso3: 'KEN', name: 'Kenya',           slug: 'kenya',           nationality: 'kenyan',        nounPlural: 'Kenyan citizens',       flag: '🇰🇪', continent: 'AF' },
  { iso2: 'ET', iso3: 'ETH', name: 'Ethiopia',        slug: 'ethiopia',        nationality: 'ethiopian',     nounPlural: 'Ethiopian citizens',    flag: '🇪🇹', continent: 'AF' },
  { iso2: 'TZ', iso3: 'TZA', name: 'Tanzania',        slug: 'tanzania',        nationality: 'tanzanian',     nounPlural: 'Tanzanian citizens',    flag: '🇹🇿', continent: 'AF' },
  { iso2: 'ZA', iso3: 'ZAF', name: 'South Africa',    slug: 'south-africa',    nationality: 'south-african', nounPlural: 'South African citizens',flag: '🇿🇦', continent: 'AF' },
  { iso2: 'EG', iso3: 'EGY', name: 'Egypt',           slug: 'egypt',           nationality: 'egyptian',      nounPlural: 'Egyptian citizens',     flag: '🇪🇬', continent: 'AF' },
  { iso2: 'MA', iso3: 'MAR', name: 'Morocco',         slug: 'morocco',         nationality: 'moroccan',      nounPlural: 'Moroccan citizens',     flag: '🇲🇦', continent: 'AF' },
  { iso2: 'DZ', iso3: 'DZA', name: 'Algeria',         slug: 'algeria',         nationality: 'algerian',      nounPlural: 'Algerian citizens',     flag: '🇩🇿', continent: 'AF' },
  { iso2: 'TN', iso3: 'TUN', name: 'Tunisia',         slug: 'tunisia',         nationality: 'tunisian',      nounPlural: 'Tunisian citizens',     flag: '🇹🇳', continent: 'AF' },
  { iso2: 'LY', iso3: 'LBY', name: 'Libya',           slug: 'libya',           nationality: 'libyan',        nounPlural: 'Libyan citizens',       flag: '🇱🇾', continent: 'AF' },
  { iso2: 'SD', iso3: 'SDN', name: 'Sudan',           slug: 'sudan',           nationality: 'sudanese',      nounPlural: 'Sudanese citizens',     flag: '🇸🇩', continent: 'AF' },
  { iso2: 'SS', iso3: 'SSD', name: 'South Sudan',     slug: 'south-sudan',     nationality: 'south-sudanese',nounPlural: 'South Sudanese citizens',flag: '🇸🇸', continent: 'AF' },
  { iso2: 'UG', iso3: 'UGA', name: 'Uganda',          slug: 'uganda',          nationality: 'ugandan',       nounPlural: 'Ugandan citizens',      flag: '🇺🇬', continent: 'AF' },
  { iso2: 'RW', iso3: 'RWA', name: 'Rwanda',          slug: 'rwanda',          nationality: 'rwandan',       nounPlural: 'Rwandan citizens',      flag: '🇷🇼', continent: 'AF' },
  { iso2: 'CI', iso3: 'CIV', name: 'Ivory Coast',     slug: 'ivory-coast',     nationality: 'ivorian',       nounPlural: 'Ivorian citizens',      flag: '🇨🇮', continent: 'AF' },
  { iso2: 'SN', iso3: 'SEN', name: 'Senegal',         slug: 'senegal',         nationality: 'senegalese',    nounPlural: 'Senegalese citizens',   flag: '🇸🇳', continent: 'AF' },
  { iso2: 'CM', iso3: 'CMR', name: 'Cameroon',        slug: 'cameroon',        nationality: 'cameroonian',   nounPlural: 'Cameroonian citizens',  flag: '🇨🇲', continent: 'AF' },
  { iso2: 'AO', iso3: 'AGO', name: 'Angola',          slug: 'angola',          nationality: 'angolan',       nounPlural: 'Angolan citizens',      flag: '🇦🇴', continent: 'AF' },
  { iso2: 'ZM', iso3: 'ZMB', name: 'Zambia',          slug: 'zambia',          nationality: 'zambian',       nounPlural: 'Zambian citizens',      flag: '🇿🇲', continent: 'AF' },
  { iso2: 'ZW', iso3: 'ZWE', name: 'Zimbabwe',        slug: 'zimbabwe',        nationality: 'zimbabwean',    nounPlural: 'Zimbabwean citizens',   flag: '🇿🇼', continent: 'AF' },
  { iso2: 'MZ', iso3: 'MOZ', name: 'Mozambique',      slug: 'mozambique',      nationality: 'mozambican',    nounPlural: 'Mozambican citizens',   flag: '🇲🇿', continent: 'AF' },
  { iso2: 'MW', iso3: 'MWI', name: 'Malawi',          slug: 'malawi',          nationality: 'malawian',      nounPlural: 'Malawian citizens',     flag: '🇲🇼', continent: 'AF' },
  { iso2: 'MG', iso3: 'MDG', name: 'Madagascar',      slug: 'madagascar',      nationality: 'malagasy',      nounPlural: 'Malagasy citizens',     flag: '🇲🇬', continent: 'AF' },

  // ── Oceania ───────────────────────────────────────────────────────────────
  { iso2: 'AU', iso3: 'AUS', name: 'Australia',       slug: 'australia',       nationality: 'australian',    nounPlural: 'Australian citizens',   flag: '🇦🇺', continent: 'OC' },
  { iso2: 'NZ', iso3: 'NZL', name: 'New Zealand',     slug: 'new-zealand',     nationality: 'new-zealand',   nounPlural: 'New Zealand citizens',  flag: '🇳🇿', continent: 'OC' },
  { iso2: 'FJ', iso3: 'FJI', name: 'Fiji',            slug: 'fiji',            nationality: 'fijian',        nounPlural: 'Fijian citizens',       flag: '🇫🇯', continent: 'OC' },
  { iso2: 'PG', iso3: 'PNG', name: 'Papua New Guinea',slug: 'papua-new-guinea',nationality: 'papua-new-guinean', nounPlural: 'Papua New Guinean citizens', flag: '🇵🇬', continent: 'OC' },
]

// ── Lookup maps ───────────────────────────────────────────────────────────────

/** ISO-3 → Country */
export const BY_ISO3 = Object.fromEntries(COUNTRIES.map(c => [c.iso3, c])) as Record<string, Country>

/** ISO-2 → Country */
export const BY_ISO2 = Object.fromEntries(COUNTRIES.map(c => [c.iso2.toLowerCase(), c])) as Record<string, Country>

/** slug → Country */
export const BY_SLUG = Object.fromEntries(COUNTRIES.map(c => [c.slug, c])) as Record<string, Country>

/** nationality slug → Country */
export const BY_NATIONALITY = Object.fromEntries(COUNTRIES.map(c => [c.nationality, c])) as Record<string, Country>

/** canonical name (lowercase) → Country */
export const BY_NAME = Object.fromEntries(COUNTRIES.map(c => [c.name.toLowerCase(), c])) as Record<string, Country>

/** Resolve a country from any input: slug, nationality, ISO-3, ISO-2, or name */
export function resolveCountry(input: string): Country | undefined {
  const s = input.toLowerCase().trim()
  return (
    BY_SLUG[s] ??
    BY_NATIONALITY[s] ??
    BY_ISO3[input.toUpperCase()] ??
    BY_ISO2[s] ??
    BY_NAME[s]
  )
}

/** Convert any country name/slug to a URL slug */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/** Nationality adjective for a given passport slug */
export function getNationality(passportSlug: string): string {
  return BY_SLUG[passportSlug]?.nationality ?? passportSlug
}

/** Flag emoji for a slug */
export function getFlag(slug: string): string {
  return BY_SLUG[slug]?.flag ?? BY_NATIONALITY[slug]?.flag ?? '🌍'
}

/**
 * Top 50 high-traffic passport × destination combos for launch week.
 * These are route-pairs with the highest estimated monthly search volume
 * from SEMrush/Ahrefs data for visa requirement queries.
 */
export const TOP_50_ROUTES: Array<[string, string]> = [
  // Pakistan routes (enormous search volume)
  ['PAK', 'ARE'], ['PAK', 'SAU'], ['PAK', 'TUR'], ['PAK', 'THA'],
  ['PAK', 'MYS'], ['PAK', 'GBR'], ['PAK', 'DEU'], ['PAK', 'USA'],
  ['PAK', 'CHN'], ['PAK', 'QAT'], ['PAK', 'OMN'], ['PAK', 'BHR'],
  // India routes
  ['IND', 'ARE'], ['IND', 'USA'], ['IND', 'GBR'], ['IND', 'DEU'],
  ['IND', 'CAN'], ['IND', 'AUS'], ['IND', 'SGP'], ['IND', 'THA'],
  // Bangladesh routes
  ['BGD', 'ARE'], ['BGD', 'SAU'], ['BGD', 'MYS'], ['BGD', 'GBR'],
  // Nigeria routes
  ['NGA', 'GBR'], ['NGA', 'USA'], ['NGA', 'DEU'], ['NGA', 'ARE'],
  // Indonesia routes
  ['IDN', 'SAU'], ['IDN', 'MYS'], ['IDN', 'JPN'], ['IDN', 'AUS'],
  // Philippines routes
  ['PHL', 'JPN'], ['PHL', 'USA'], ['PHL', 'AUS'], ['PHL', 'KOR'],
  // Egypt routes
  ['EGY', 'SAU'], ['EGY', 'ARE'], ['EGY', 'DEU'],
  // Top passport → popular destinations
  ['USA', 'ARE'], ['USA', 'JPN'], ['GBR', 'ARE'], ['GBR', 'AUS'],
  ['DEU', 'ARE'], ['DEU', 'JPN'], ['CAN', 'ARE'],
  // African routes
  ['KEN', 'ARE'], ['ETH', 'ARE'], ['ZAF', 'ARE'],
]

/** Official visa portal URLs for destinations */
export const OFFICIAL_VISA_PORTALS: Record<string, { url: string; name: string }> = {
  'ARE': { url: 'https://smartservices.icp.gov.ae', name: 'UAE ICP Smart Services' },
  'SAU': { url: 'https://visa.visitsaudi.com',      name: 'Saudi eVisa Portal' },
  'QAT': { url: 'https://hukoomi.gov.qa',           name: 'Qatar eVisa Portal' },
  'KWT': { url: 'https://evisa.moi.gov.kw',         name: 'Kuwait eVisa System' },
  'BHR': { url: 'https://evisa.gov.bh',             name: 'Bahrain eVisa' },
  'OMN': { url: 'https://evisa.rop.gov.om',         name: 'Oman eVisa Portal' },
  'TUR': { url: 'https://www.evisa.gov.tr',         name: 'Turkey eVisa' },
  'THA': { url: 'https://www.thaievisa.go.th',      name: 'Thailand eVisa' },
  'MYS': { url: 'https://malaysiavisa.imi.gov.my',  name: 'Malaysia eVisa' },
  'SGP': { url: 'https://www.mom.gov.sg',           name: 'Singapore ICA' },
  'IND': { url: 'https://indianvisaonline.gov.in',  name: 'India eVisa Portal' },
  'CHN': { url: 'https://www.visaforchina.cn',      name: 'China Visa Portal' },
  'JPN': { url: 'https://www.mofa.go.jp',           name: 'Japan MOFA' },
  'KOR': { url: 'https://www.evisa.go.kr',          name: 'Korea eVisa' },
  'AUS': { url: 'https://immi.homeaffairs.gov.au',  name: 'Australia IMMI' },
  'NZL': { url: 'https://www.immigration.govt.nz',  name: 'New Zealand Immigration' },
  'GBR': { url: 'https://www.gov.uk/apply-to-come-to-the-uk', name: 'UK Visa & Immigration' },
  'USA': { url: 'https://travel.state.gov',          name: 'US Department of State' },
  'CAN': { url: 'https://www.canada.ca/en/immigration-refugees-citizenship', name: 'Canada IRCC' },
  'DEU': { url: 'https://www.auswaertiges-amt.de',  name: 'German Foreign Office' },
  'FRA': { url: 'https://france-visas.gouv.fr',     name: 'France Visas' },
  'MDV': { url: 'https://imuga.immigration.gov.mv', name: 'Maldives Immigration' },
  'AZE': { url: 'https://evisa.gov.az',             name: 'Azerbaijan eVisa' },
  'GEO': { url: 'https://www.evisa.gov.ge',         name: 'Georgia eVisa' },
  'KEN': { url: 'https://evisa.go.ke',              name: 'Kenya eTA' },
  'RWA': { url: 'https://irembo.gov.rw',            name: 'Rwanda Irembo' },
  'TZA': { url: 'https://eservices.immigration.go.tz', name: 'Tanzania eVisa' },
}
