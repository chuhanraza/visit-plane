/**
 * /api/photo
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a REAL destination photo (Pexels, then Unsplash) by PROXYING the image
 * bytes through our domain — reliable in <img> tags (no redirect quirks). The API
 * key stays server-side. On any failure (no key, no match, fetch error) it
 * redirects to the always-renders SVG /api/cover so images never break.
 *
 * Query: slug, v (hero|card|inline|alt), optional q / d overrides.
 */

import { getPostBySlug } from '@/src/lib/posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'   // never statically cache the route itself

const cache = new Map<string, string[]>()
const VARIANT_OFFSET: Record<string, number> = { hero: 0, card: 1, inline: 2, alt: 3 }

// Redirect that is NOT cached, so a failed lookup never sticks in the CDN.
function redirectNoStore(url: string): Response {
  return new Response(null, { status: 307, headers: { Location: url, 'Cache-Control': 'no-store' } })
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

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
  const query = searchParams.get('q') ?? `${destination} travel landmark skyline`.trim()

  const fallback = `${origin}/api/cover?slug=${encodeURIComponent(slug)}&v=${encodeURIComponent(v)}`
  const pexelsKey = process.env.PEXELS_API_KEY
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY

  if (!pexelsKey && !unsplashKey) {
    console.error('[photo] no PEXELS_API_KEY / UNSPLASH_ACCESS_KEY in env')
    return redirectNoStore(fallback)
  }

  try {
    let photos = cache.get(query)
    if (!photos || photos.length === 0) {
      photos = pexelsKey ? await pexelsPhotos(query, pexelsKey) : []
      if (photos.length === 0 && unsplashKey) photos = await unsplashPhotos(query, unsplashKey)
      if (photos.length > 0) cache.set(query, photos)
    }
    console.log(`[photo] key=${pexelsKey ? 'pexels' : unsplashKey ? 'unsplash' : 'none'} query="${query}" photos=${photos?.length ?? 0}`)
    if (!photos || photos.length === 0) return redirectNoStore(fallback)

    const idx = (hash(slug || query) + (VARIANT_OFFSET[v] ?? 0)) % photos.length
    const imgRes = await fetch(photos[idx], { cache: 'no-store' })
    if (!imgRes.ok || !imgRes.body) {
      console.error(`[photo] image fetch HTTP ${imgRes.status}`)
      return redirectNoStore(fallback)
    }

    const buf = await imgRes.arrayBuffer()
    return new Response(buf, {
      headers: {
        'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400',
      },
    })
  } catch {
    return redirectNoStore(fallback)
  }
}
