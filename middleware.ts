import { NextRequest, NextResponse } from 'next/server';

// IP country to language mapping
const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  // ═══ ENGLISH (Tier 1 - Native English) ═══
  US: 'en', // United States
  GB: 'en', // United Kingdom
  IE: 'en', // Ireland
  AU: 'en', // Australia
  NZ: 'en', // New Zealand

  // ═══ ENGLISH (Tier 2 - English dominant) ═══
  IN: 'en', // India
  PK: 'en', // Pakistan
  BD: 'en', // Bangladesh
  PH: 'en', // Philippines
  SG: 'en', // Singapore
  MY: 'en', // Malaysia
  LK: 'en', // Sri Lanka
  HK: 'en', // Hong Kong
  NG: 'en', // Nigeria
  KE: 'en', // Kenya
  GH: 'en', // Ghana
  ZA: 'en', // South Africa
  UG: 'en', // Uganda
  TZ: 'en', // Tanzania
  ZW: 'en', // Zimbabwe
  ZM: 'en', // Zambia
  BW: 'en', // Botswana
  NA: 'en', // Namibia
  RW: 'en', // Rwanda
  MW: 'en', // Malawi
  SL: 'en', // Sierra Leone
  LR: 'en', // Liberia
  GM: 'en', // Gambia
  MU: 'en', // Mauritius
  LS: 'en', // Lesotho
  SZ: 'en', // Eswatini
  CM: 'en', // Cameroon
  PG: 'en', // Papua New Guinea
  FJ: 'en', // Fiji
  BN: 'en', // Brunei
  MT: 'en', // Malta
  GI: 'en', // Gibraltar
  CY: 'en', // Cyprus

  // ═══ ENGLISH (Tier 3 - Caribbean) ═══
  JM: 'en', // Jamaica
  BS: 'en', // Bahamas
  BB: 'en', // Barbados
  BZ: 'en', // Belize
  TT: 'en', // Trinidad and Tobago
  GY: 'en', // Guyana
  AG: 'en', // Antigua and Barbuda
  LC: 'en', // Saint Lucia
  VC: 'en', // Saint Vincent and the Grenadines
  KN: 'en', // Saint Kitts and Nevis
  DM: 'en', // Dominica
  GD: 'en', // Grenada
  BM: 'en', // Bermuda
  KY: 'en', // Cayman Islands
  VG: 'en', // British Virgin Islands
  TC: 'en', // Turks and Caicos
  AI: 'en', // Anguilla
  MS: 'en', // Montserrat

  // ═══ ARABIC (Middle East + North Africa) ═══
  SA: 'ar', // Saudi Arabia
  AE: 'ar', // UAE
  EG: 'ar', // Egypt
  KW: 'ar', // Kuwait
  QA: 'ar', // Qatar
  BH: 'ar', // Bahrain
  OM: 'ar', // Oman
  JO: 'ar', // Jordan
  LB: 'ar', // Lebanon
  IQ: 'ar', // Iraq
  SY: 'ar', // Syria
  YE: 'ar', // Yemen
  DZ: 'ar', // Algeria
  MA: 'ar', // Morocco
  TN: 'ar', // Tunisia
  LY: 'ar', // Libya
  SD: 'ar', // Sudan
  MR: 'ar', // Mauritania
  SO: 'ar', // Somalia
  DJ: 'ar', // Djibouti

  // ═══ CHINESE (China + Chinese communities) ═══
  CN: 'zh', // China
  TW: 'zh', // Taiwan
  MO: 'zh', // Macau

  // ═══ SPANISH (Latin America + Spain) ═══
  ES: 'es', // Spain
  MX: 'es', // Mexico
  AR: 'es', // Argentina
  CO: 'es', // Colombia
  CL: 'es', // Chile
  PE: 'es', // Peru
  VE: 'es', // Venezuela
  EC: 'es', // Ecuador
  GT: 'es', // Guatemala
  CU: 'es', // Cuba
  BO: 'es', // Bolivia
  DO: 'es', // Dominican Republic
  HN: 'es', // Honduras
  PY: 'es', // Paraguay
  SV: 'es', // El Salvador
  NI: 'es', // Nicaragua
  CR: 'es', // Costa Rica
  PA: 'es', // Panama
  UY: 'es', // Uruguay

  // ═══ FRENCH (France + Francophone) ═══
  FR: 'fr', // France
  BE: 'fr', // Belgium
  CH: 'fr', // Switzerland (French part)
  SN: 'fr', // Senegal
  CI: 'fr', // Ivory Coast
  ML: 'fr', // Mali
  BF: 'fr', // Burkina Faso
  NE: 'fr', // Niger
  CD: 'fr', // DR Congo
  CG: 'fr', // Republic of Congo
  MG: 'fr', // Madagascar
  HT: 'fr', // Haiti
  BJ: 'fr', // Benin
  TG: 'fr', // Togo
  GA: 'fr', // Gabon
  GN: 'fr', // Guinea
  BI: 'fr', // Burundi
  MC: 'fr', // Monaco

  // ═══ PORTUGUESE (Brazil + Portugal) ═══
  BR: 'pt', // Brazil
  PT: 'pt', // Portugal
  AO: 'pt', // Angola
  MZ: 'pt', // Mozambique
  CV: 'pt', // Cape Verde
  GW: 'pt', // Guinea-Bissau
  ST: 'pt', // Sao Tome and Principe

  // ═══ GERMAN (DACH region) ═══
  DE: 'de', // Germany
  AT: 'de', // Austria

  // ═══ Canada → English default ═══
  CA: 'en', // Canada (English default)
};

export default async function middleware(request: NextRequest) {
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (!savedLocale) {
    // Auto-detect from Vercel IP header
    const countryCode = request.headers.get('x-vercel-ip-country') || 'US';
    const detectedLocale = COUNTRY_TO_LANGUAGE[countryCode] || 'en';

    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
