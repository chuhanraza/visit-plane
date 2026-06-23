// ── Centralized, verified destination imagery ────────────────────────────────
// Single source of truth for country/destination card photos.
//
// Why this exists: card photos were previously hardcoded per-card with raw
// Unsplash photo IDs. Some IDs were dead (broken-image glyph) and some resolved
// to unrelated subjects (e.g. a country keyed to a photo of an apple). Mapping
// every country here — and pairing it with a guaranteed branded fallback in
// <DestinationImage> — means a card can only ever show a CORRECT photo or a
// clean branded placeholder, never a broken or mismatched image.
//
// Only add an entry you are confident shows that country's landmark/skyline.
// If unsure, leave it out: the branded fallback (flag + name on a teal
// gradient) is the safe, honest default.

const U = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`

export const COUNTRY_IMAGES: Record<string, string> = {
  'UAE':            U('photo-1512453979798-5ea266f8880c'), // Dubai skyline
  'Turkey':         U('photo-1541432901042-2d8bd64b4a9b'), // Istanbul
  'Japan':          U('photo-1540959733332-eab4deabeeaf'), // Mt Fuji / pagoda
  'United Kingdom': U('photo-1529655683826-aba9b3e77383'), // London
  'Singapore':      U('photo-1525625293386-3f8f99389edd'), // Marina Bay
  'France':         U('photo-1502602898657-3e91760cbb34'), // Paris
  'Maldives':       U('photo-1573843981267-be1999ff37cd'), // overwater villas
  'Nepal':          U('photo-1544735716-392fe2489ffa'),   // Himalayas
  'China':          U('photo-1508804185872-d7badad00f7d'), // Great Wall
  'Rwanda':         U('photo-1580060839134-75a5edca2e99'), // Kigali hills
  'Thailand':       U('photo-1528181304800-259b08848526'), // Bangkok temple
  'Malaysia':       U('photo-1596422846543-75c6fc197f07'), // KL towers
  'Indonesia':      U('photo-1537996194471-e657df975ab4'), // Bali
}

/** Returns a verified photo URL for the country, or null if none is mapped. */
export function getCountryImage(name: string): string | null {
  return COUNTRY_IMAGES[name] ?? null
}
