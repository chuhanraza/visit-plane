/**
 * Blog photo utility
 * Maps each post slug to a beautiful destination photo from Pexels CDN.
 * All photos are free to use — no API key or attribution required.
 *
 * Pexels URL pattern:
 *   https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w={width}
 */

// Verified Pexels photo IDs, one per destination
const PHOTO_IDS: Record<string, number> = {
  'schengen-visa-guide-pakistani-travelers-2026': 161853,   // Paris / Eiffel Tower
  'dubai-tourist-visa-complete-guide-indians':    2034335,  // Dubai skyline
  'uk-student-visa-requirements-2026':            1796715,  // London / Big Ben
  'canada-tourist-visa-pakistanis-step-by-step':  1519088,  // Toronto / CN Tower
  'australia-work-visa-guide-indians-2026':        1878293,  // Sydney Opera House
  'germany-job-seeker-visa-complete-requirements': 1308940,  // City skyline
  'japan-tourist-visa-pakistanis-how-to-apply':    208701,   // Great Wall / Asia
  'usa-student-visa-f1-complete-guide-2026':       1486222,  // New York City
  'uae-residence-visa-complete-requirements-guide':2034335,  // Dubai / UAE
  'schengen-visa-indians-requirements-tips':       1559825,  // Travel destination
  'schengen-visa-nigerians':                       161853,   // Paris / Eiffel Tower
  'thailand-visa-indians':                         2048968,  // Thailand temple
  'malaysia-visa-pakistanis':                      1994407,  // Petronas Twin Towers
  'turkey-evisa-indians':                          1509667,  // Istanbul / Blue Mosque
  'canada-student-visa-indians':                   1519088,  // Toronto / CN Tower
  'dubai-work-visa-pakistanis':                    2034335,  // Dubai / Burj Khalifa
  'uk-skilled-worker-visa-indians':                1796715,  // London / Big Ben
  'schengen-visa-bangladeshis':                    1604950,  // Amsterdam canals
  'south-korea-visa-indians':                      1416829,  // Seoul / Korean architecture
  'singapore-visa-pakistanis':                     2045103,  // Marina Bay Sands
  'india-to-australia-visa-requirements-2026':     1878293,  // Sydney Opera House
  'india-to-malaysia-visa-requirements-2026':      1994407,  // Petronas Twin Towers
  'india-to-singapore-visa-requirements-2026':     2045103,  // Marina Bay Sands
  'india-to-france-schengen-visa-requirements-2026': 161853, // Paris / Eiffel Tower
  'india-to-qatar-visa-requirements-2026':         1308940,  // Modern skyline (Doha)
  'india-to-china-visa-requirements-2026':         208701,   // Great Wall of China
  'india-to-indonesia-visa-requirements-2026':     2048968,  // SE Asia temple (Bali)
  'india-to-japan-visa-requirements-2026':         1559825,  // Travel destination (Japan)
  'pakistan-to-thailand-visa-requirements-2026':   2048968,  // Thailand temple
  'pakistan-to-qatar-visa-requirements-2026':      1308940,  // Modern skyline (Doha)
  'pakistan-to-italy-schengen-visa-requirements-2026': 1559825, // Europe travel (Italy)
  'pakistan-to-china-visa-requirements-2026':      208701,   // Great Wall of China
  'pakistan-to-indonesia-visa-requirements-2026':  2048968,  // SE Asia temple (Bali)
}

const DEFAULT_ID = 1486222 // New York City — beautiful fallback

function pexelsUrl(id: number, width: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`
}

// NOTE: External photo hotlinks (Pexels) proved unreliable (broken images), so
// blog imagery is now generated on-brand and same-origin via /api/cover, which
// never 404s. The pexelsUrl helper + PHOTO_IDS map are retained for reference.
void pexelsUrl

// Images resolve via /api/photo, which returns a real destination photo when a
// Pexels/Unsplash key is configured, and falls back to the branded /api/cover
// image otherwise — so blog images always render.

/** Full-width hero image. */
export function getBlogHeroImage(slug: string): string {
  return `/api/photo?slug=${encodeURIComponent(slug)}&v=hero`
}

/** Card thumbnail. */
export function getBlogCardImage(slug: string): string {
  return `/api/photo?slug=${encodeURIComponent(slug)}&v=card`
}

/** Inline article image. */
export function getArticleInlineImage(slug: string): string {
  return `/api/photo?slug=${encodeURIComponent(slug)}&v=inline`
}

/** Human-readable photo caption for inline images */
export function getDestinationCaption(slug: string): string {
  const captions: Record<string, string> = {
    'schengen-visa-guide-pakistani-travelers-2026': '📍 Paris, France — Gateway to Schengen Europe',
    'dubai-tourist-visa-complete-guide-indians':    '📍 Dubai, United Arab Emirates',
    'uk-student-visa-requirements-2026':            '📍 London, United Kingdom',
    'canada-tourist-visa-pakistanis-step-by-step':  '📍 Toronto, Canada',
    'australia-work-visa-guide-indians-2026':        '📍 Sydney, Australia',
    'germany-job-seeker-visa-complete-requirements': '📍 Berlin, Germany',
    'japan-tourist-visa-pakistanis-how-to-apply':    '📍 Tokyo, Japan',
    'usa-student-visa-f1-complete-guide-2026':       '📍 New York City, United States',
    'uae-residence-visa-complete-requirements-guide':'📍 Dubai, United Arab Emirates',
    'schengen-visa-indians-requirements-tips':       '📍 Europe — Your Next Adventure Awaits',
    'schengen-visa-nigerians':                       '📍 Paris, France — Most Popular Schengen Destination',
    'thailand-visa-indians':                         '📍 Bangkok, Thailand — Temple of the Emerald Buddha',
    'malaysia-visa-pakistanis':                      '📍 Kuala Lumpur, Malaysia — Petronas Twin Towers',
    'turkey-evisa-indians':                          '📍 Istanbul, Turkey — Blue Mosque at Sunset',
    'canada-student-visa-indians':                   '📍 Toronto, Canada — World-Class Education Hub',
    'dubai-work-visa-pakistanis':                    '📍 Dubai, UAE — City of Opportunity',
    'uk-skilled-worker-visa-indians':                '📍 London, United Kingdom — Global Financial Hub',
    'schengen-visa-bangladeshis':                    '📍 Amsterdam, Netherlands — Heart of Schengen Zone',
    'south-korea-visa-indians':                      '📍 Seoul, South Korea — Where Tradition Meets Modernity',
    'singapore-visa-pakistanis':                     '📍 Singapore — The Lion City Skyline',
    'india-to-australia-visa-requirements-2026':     '📍 Sydney, Australia — Opera House & Harbour',
    'india-to-malaysia-visa-requirements-2026':      '📍 Kuala Lumpur, Malaysia — Petronas Twin Towers',
    'india-to-singapore-visa-requirements-2026':     '📍 Singapore — Marina Bay Skyline',
    'india-to-france-schengen-visa-requirements-2026': '📍 Paris, France — Gateway to Schengen Europe',
    'india-to-qatar-visa-requirements-2026':         '📍 Doha, Qatar — Modern Gulf Skyline',
    'india-to-china-visa-requirements-2026':         '📍 China — The Great Wall',
    'india-to-indonesia-visa-requirements-2026':     '📍 Bali, Indonesia — Temples & Beaches',
    'india-to-japan-visa-requirements-2026':         '📍 Japan — Tradition Meets Modernity',
    'pakistan-to-thailand-visa-requirements-2026':   '📍 Thailand — Temples & Tropical Beaches',
    'pakistan-to-qatar-visa-requirements-2026':      '📍 Doha, Qatar — Modern Gulf Skyline',
    'pakistan-to-italy-schengen-visa-requirements-2026': '📍 Italy — Heart of Schengen Europe',
    'pakistan-to-china-visa-requirements-2026':      '📍 China — The Great Wall',
    'pakistan-to-indonesia-visa-requirements-2026':  '📍 Bali, Indonesia — Temples & Beaches',
  }
  return captions[slug] ?? '📍 Your destination awaits'
}

/** Category colour palette — bg colour + white text */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Visa Guides':    { bg: '#0d9488', text: '#ffffff' },
  'Country Guides': { bg: '#3b82f6', text: '#ffffff' },
  'Interview Prep': { bg: '#8b5cf6', text: '#ffffff' },
  'Document Help':  { bg: '#f59e0b', text: '#ffffff' },
  'Travel Tips':    { bg: '#10b981', text: '#ffffff' },
}
