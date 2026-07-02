/**
 * Minimal in-memory sliding-window rate limiter for public API routes.
 *
 * Serverless caveat: the window lives per lambda instance, so the effective
 * global limit is (limit × warm instances). That still stops the cheap abuse
 * this protects against — burst spam into public inserts and email-sending
 * endpoints — without adding an external dependency. Swap the store for
 * Upstash/Redis if per-user precision ever matters.
 */

const buckets = new Map<string, number[]>()
const MAX_KEYS = 10_000

/**
 * Returns true when the caller is within `limit` hits per `windowMs`.
 * Callers should respond 429 when this returns false.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)

  // Opportunistic cleanup so the map can't grow unbounded on a long-lived instance.
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k)
    }
  }
  return true
}

/** Best-effort client identifier: first hop of x-forwarded-for, else a shared bucket. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get('x-forwarded-for') ?? ''
  const ip = fwd.split(',')[0]?.trim() || 'unknown'
  return `${scope}:${ip}`
}
