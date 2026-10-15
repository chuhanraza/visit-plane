/**
 * Edge-cache TTLs for responses the app serves without a shareable Cache-Control.
 *
 * /sitemap.xml is ~4.7 MB (39k URLs) and is rebuilt from ~75 Supabase page reads on every
 * request — measured at 13+ seconds. Crawlers fetch it often, and with the no-op
 * incremental cache (see open-next.config.ts) nothing else stops each fetch from paying
 * that cost in full. The route's own header is `max-age=0, must-revalidate`, which the
 * Worker's edge cache (gated on s-maxage) ignores, so these paths get a TTL here instead.
 *
 * Six hours is short enough that a newly published letter page shows up in the sitemap the
 * same day, and long enough that a crawler hitting it repeatedly costs one render, not many.
 */
const FORCED_EDGE_TTL_SECONDS: Record<string, number> = {
  '/sitemap.xml': 6 * 3600,
  '/sitemap-blog.xml': 6 * 3600,
  '/robots.txt': 24 * 3600,
}

export function forcedEdgeTtl(pathname: string): number | null {
  return FORCED_EDGE_TTL_SECONDS[pathname] ?? null
}

/** Same response with a shared-cache lifetime, browsers still revalidate (max-age=0). */
export function withEdgeTtl(response: Response, ttlSeconds: number): Response {
  const headers = new Headers(response.headers)
  headers.set('cache-control', `public, max-age=0, s-maxage=${ttlSeconds}`)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}
