import { NextRequest, NextResponse } from 'next/server';

// IP country to language mapping
const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  // Arabic countries
  SA: 'ar', AE: 'ar', EG: 'ar', KW: 'ar',
  QA: 'ar', BH: 'ar', OM: 'ar', JO: 'ar',
  LB: 'ar', IQ: 'ar', DZ: 'ar', MA: 'ar',
  TN: 'ar', LY: 'ar', SD: 'ar', YE: 'ar',

  // Urdu
  PK: 'ur',

  // Hindi
  IN: 'hi',

  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',

  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es',
  CL: 'es', PE: 'es', VE: 'es', EC: 'es',
  GT: 'es', CU: 'es', BO: 'es', DO: 'es',
  HN: 'es', PY: 'es', SV: 'es', NI: 'es',
  CR: 'es', PA: 'es', UY: 'es',

  // French
  FR: 'fr', BE: 'fr', CH: 'fr',
  SN: 'fr', CI: 'fr', CM: 'fr', ML: 'fr',

  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',

  // German
  DE: 'de', AT: 'de',

  // Bengali
  BD: 'bn',

  // English (default)
  US: 'en', GB: 'en', AU: 'en', NZ: 'en',
  CA: 'en', IE: 'en', ZA: 'en', NG: 'en',
  GH: 'en', KE: 'en', PH: 'en',
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
