/**
 * /api/photo
 * ─────────────────────────────────────────────────────────────────────────────
 * Resolves a REAL destination photo (Pexels, then Unsplash) and 302-redirects
 * the <img> to it. The API key stays server-side and is never exposed.
 *
 * If no key is configured, or the lookup fails, it gracefully falls back to the
 * branded same-origin /api/cover image — so blog images NEVER break.
 *
 * Query params:
 *   slug  string  — blog post slug (used to look up the destination)
 *   v     string  — variant: hero | card | inline | alt (picks a different photo)
 *   q     string  — optional explicit search query override
 */

import { getPostBySlug } from '@/src/lib/posts'

export const runtime = 'nodejs'

// Per-destination photo URL cache (per server instance) to limit API calls.
const cache = new Map<string, string[]>()

const VARIANT_OFFSET: Record<string, number> = { hero: 0, card: 1, inline: 2, alt: 3 }

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

async function pexelsPhotos(query: string, key: string): Promise<string[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: key }, next: { revalidate: 604800 } })
  if (!res.ok) return []
  const data = (await res.json()) as { photos?: Array<{ src?: { landscape?: string; large?: string } }> }
  return (data.photos ?? [])
    .map((p) => p.src?.landscape ?? p.src?.large ?? '')
    .filter(Boolean)
}

async function unsplashPhotos(query: string, key: string): Promise<string[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape&client_id=${key}`
  const res = await fetch(url, { next: { revalidate: 604800 } })
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
    // No key configured — use the branded cover so images still render.
    return Response.redirect(fallback, 302)
  }

  try {
    let photos = cache.get(query)
    if (!photos) {
      photos = pexelsKey ? await pexelsPhotos(query, pexelsKey) : []
      if (photos.length === 0 && unsplashKey) photos = await unsplashPhotos(query, unsplashKey)
      if (photos.length > 0) cache.set(query, photos)
    }
    if (!photos || photos.length === 0) return Response.redirect(fallback, 302)

    const idx = (hash(slug) + (VARIANT_OFFSET[v] ?? 0)) % photos.length
    const target = photos[idx]
    return new Response(null, {
      status: 302,
      headers: {
        Location: target,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    })
  } catch {
    return Response.redirect(fallback, 302)
  }
}
