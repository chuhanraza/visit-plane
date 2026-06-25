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

  // ── Visa-free / VoA destinations that headline the homepage marquee ──────
  // Each photo was downloaded and visually confirmed to show that country's
  // recognisable landmark/scene before being added (June 2026). Anything that
  // couldn't be confidently verified is intentionally left to the branded
  // fallback rather than risk a wrong-country photo.
  'Peru':           U('photo-1526392060635-9d6019884377'), // Machu Picchu
  'Brazil':         U('photo-1516306580123-e6e52b1b7b5f'), // Rio — Christ the Redeemer
  'Georgia':        U('photo-1621868811134-2548d9e7f147'), // Tbilisi old town
  'Seychelles':     U('photo-1693260741045-2c136abbb95f'), // granite-boulder beach
  'Colombia':       U('photo-1714686495394-73e2bb1bbd39'), // Cartagena old town
  'Bosnia and Herzegovina': U('photo-1544329095-a7c19df83018'), // Mostar bridge
  'Fiji':           U('photo-1483683804023-6ccdb62f86ef'), // island aerial
  'Bahamas':        U('photo-1562036861-44811e0b4481'), // turquoise beach
  'Albania':        U('photo-1742243910186-c31c321abb53'), // Riviera cove
  'Chile':          U('photo-1658312627438-30d1299683fd'), // Torres del Paine
  'Mexico':         U('photo-1620636607286-087f5a7b5716'), // Chichén Itzá
  'Argentina':      U('photo-1725499267114-15531716d101'), // Buenos Aires Obelisco
  'Costa Rica':     U('photo-1647016110502-be875ea1b7d3'), // Arenal volcano
  'Jamaica':        U('photo-1506953823976-52e1fdc0149a'), // Caribbean beach
  'Antigua and Barbuda': U('photo-1753114089234-3d57fdf57a7a'), // coastline
  'Barbados':       U('photo-1636728163078-59ea0afb7665'), // beach
  'Armenia':        U('photo-1745817238984-ecdc3877d066'), // Yerevan + Ararat
  'Tunisia':        U('photo-1726428977623-39f687724a40'), // Sidi Bou Said
  'Mauritius':      U('photo-1513415277900-a62401e19be4'), // Le Morne lagoon
  'Kazakhstan':     U('photo-1659651117607-d2b397cf100f'), // Almaty + Tian Shan
  'Vanuatu':        U('photo-1720041802374-db32d4263016'), // tropical lagoon
  'Ecuador':        U('photo-1748211856747-6a37861a2021'), // Galápagos coast
  'Grenada':        U('photo-1616555846456-6d53b92669a8'), // Caribbean beach
  'Botswana':       U('photo-1573707627676-eda00266adce'), // Okavango Delta sunset
  'El Salvador':    U('photo-1717938137671-4b2f46e1e63f'), // Pacific surf beach
  'Saint Vincent and the Grenadines': U('photo-1742905347624-3894ce421ef6'), // hillside town + beach
  'Saint Kitts and Nevis': U('photo-1643148610662-bcb78a841790'), // island harbour
}

/** Returns a verified photo URL for the country, or null if none is mapped. */
export function getCountryImage(name: string): string | null {
  return COUNTRY_IMAGES[name] ?? null
}
