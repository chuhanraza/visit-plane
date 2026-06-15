/**
 * /api/photo
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a REAL, famous-sightseeing destination photo by PROXYING the image
 * bytes through our own domain (reliable in <img> tags, no redirect/CDN quirks,
 * no hotlink issues). Resolution order:
 *
 *   1. CURATED map (LANDMARKS) — verified Pexels CDN photos of each destination's
 *      most iconic landmark. NO API KEY required, so this always works.
 *   2. Pexels / Unsplash API search — only when a destination isn't in the map
 *      (and a key is configured).
 *   3. Branded SVG /api/cover — final guaranteed fallback, never 404s.
 *
 * Query: slug, v (hero|card|inline|alt), optional q / d overrides.
 */

import { getPostBySlug } from '@/src/lib/posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'   // never statically cache the route itself

const VARIANT_OFFSET: Record<string, number> = { hero: 0, card: 1, inline: 2, alt: 3 }

/**
 * Verified Pexels photo IDs of each destination's most famous sightseeing
 * landmarks. Each ID was confirmed to return real image bytes via the canonical
 * URL pattern below. Multiple IDs per destination give hero/card/inline/alt
 * variety. Keyed by lowercased destinationCountry.
 */
const LANDMARKS: Record<string, number[]> = {
  'france':                 [338515, 705764, 532826],         // Paris / Eiffel Tower
  'germany':                [109629, 1128408, 2570063],       // Berlin / Brandenburg Gate
  'united arab emirates':   [2044434, 1467300],               // Dubai / Burj Khalifa skyline
  'thailand':               [2070033, 1031659, 460376],       // Bangkok temples
  'united kingdom':         [460672, 77171, 672532],          // London / Big Ben
  'turkey':                 [1549326, 2048865, 1701595],      // Istanbul / Blue Mosque
  'malaysia':               [2603464, 1822605],               // Kuala Lumpur / Petronas Towers
  'japan':                  [590478, 402028, 248195],         // Mt Fuji / Tokyo
  'singapore':              [777059, 2027434, 1842332],       // Marina Bay
  'china':                  [2846217, 1653877],               // Great Wall
  'canada':                 [1750754, 2104151],               // Toronto / CN Tower
  'australia':              [1878293, 995764],                // Sydney Opera House
  'vietnam':                [2161467, 1051073],               // Ha Long Bay
  'united states':          [290386, 802024, 466685],         // New York City
  'indonesia':              [2474690, 1822458, 1694621, 1029604], // Bali
  'south korea':            [2614818, 237211, 373290, 1707310],   // Seoul
  'portugal':               [1534560, 2549018, 1837601],      // Lisbon
  'maldives':               [1483053, 1287460, 3601425, 1322183], // Maldives
  'italy':                  [2676642, 1797158, 532263],       // Rome / Colosseum
  'spain':                  [1388030, 819764, 2225442],       // Barcelona / Spain
  'netherlands':            [1796706, 967292, 2031706],       // Amsterdam canals
  'switzerland':            [290452, 350748, 1586298],        // Swiss Alps
  'greece':                 [1010657, 2087391, 1285625],      // Santorini / Greece
  'saudi arabia':           [4631059, 11195155, 30844810, 2233416], // Saudi / Mecca
  'qatar':                  [3573382, 2956376],               // Doha skyline
  'azerbaijan':             [14751708, 9482140, 17861470, 6271625], // Baku
}

const DEFAULT_LANDMARKS = [1008155, 346885, 2356045] // generic travel scenery

function pexelsCdnUrl(id: number, width = 1600): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`
}

// Redirect that is NOT cached, so a failed lookup never sticks in the CDN.
function redirectNoStore(url: string): Response {
  return new Response(null, { status: 307, headers: { Location: url, 'Cache-Control': 'no-store' } })
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

async function proxyImage(url: string): Promise<Response | null> {
  try {
    const imgRes = await fetch(url, { cache: 'no-store' })
    if (!imgRes.ok || !imgRes.body) {
      console.error(`[photo] image fetch HTTP ${imgRes.status} for ${url}`)
      return null
    }
    const buf = await imgRes.arrayBuffer()
    return new Response(buf, {
      headers: {
        'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400',
      },
    })
  } catch (e) {
    console.error(`[photo] proxy error for ${url}: ${String(e)}`)
    return null
  }
}

const apiCache = new Map<string, string[]>()

async function pexelsPhotos(query: string, key: string): Promise<string[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: key }, cache: 'no-store' })
  if (!res.ok) {
    console.error(`[photo] pexels HTTP ${res.status} for "${query}"`)
    return []
  }
  const data = (await res.json()) as { photos?: Array<{ src?: { landscape?: string; large2x?: string; large?: string } }> }
  return (data.photos ?? [])
    .map((p) => p.src?.large2x ?? p.src?.landscape ?? p.src?.large ?? '')
    .filter(Boolean)
}

async function unsplashPhotos(query: string, key: string): Promise<string[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape&client_id=${key}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  const data = (await res.json()) as { results?: Array<{ urls?: { regular?: string } }> }
  return (data.results ?? []).map((p) => p.urls?.regular ?? '').filter(Boolean)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const slug = searchParams.get('slug') ?? ''
  const v = searchParams.get('v') ?? 'hero'
  const post = slug ? getPostBySlug(slug) : undefined
  const destination = post?.destinationCountry ?? searchParams.get('d') ?? ''
  const offset = VARIANT_OFFSET[v] ?? 0
  const fallback = `${origin}/api/cover?slug=${encodeURIComponent(slug)}&v=${encodeURIComponent(v)}`

  // ── 1. Curated landmark photo (key-independent, always available) ──────────
  const key = destination.trim().toLowerCase()
  const ids = LANDMARKS[key] ?? (destination ? DEFAULT_LANDMARKS : null)
  if (ids && ids.length > 0) {
    // Deterministic per (destination, variant) so each variant differs but is stable.
    const idx = (hash(key) + offset) % ids.length
    const ordered = [ids[idx], ...ids.filter((_, i) => i !== idx)]
    for (const id of ordered) {
      const res = await proxyImage(pexelsCdnUrl(id))
      if (res) {
        console.log(`[photo] curated dest="${destination}" v=${v} id=${id}`)
        return res
      }
    }
    console.error(`[photo] all curated ids failed for "${destination}"`)
  }

  // ── 2. Live API search (only when not in the curated map) ──────────────────
  const query = searchParams.get('q') ?? `${destination} travel landmark skyline`.trim()
  const pexelsKey = process.env.PEXELS_API_KEY
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
  if (pexelsKey || unsplashKey) {
    try {
      let photos = apiCache.get(query)
      if (!photos || photos.length === 0) {
        photos = pexelsKey ? await pexelsPhotos(query, pexelsKey) : []
        if (photos.length === 0 && unsplashKey) photos = await unsplashPhotos(query, unsplashKey)
        if (photos.length > 0) apiCache.set(query, photos)
      }
      if (photos && photos.length > 0) {
        const idx = (hash(slug || query) + offset) % photos.length
        const res = await proxyImage(photos[idx])
        if (res) return res
      }
    } catch {
      /* fall through to cover */
    }
  }

  // ── 3. Branded SVG cover (guaranteed) ──────────────────────────────────────
  return redirectNoStore(fallback)
}
