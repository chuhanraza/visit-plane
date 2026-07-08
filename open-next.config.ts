import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Card-free by design: R2 requires a payment method on file even to use its
// free tier (confirmed against current Cloudflare docs/community reports),
// and the user isn't adding one. Workers KV doesn't require a card, but its
// free tier is only 1,000 writes/day — the exact ceiling that caused the
// original Vercel ISR-write outage, so it's not a safe default either.
//
// No `incrementalCache` override is passed here, which falls back to
// OpenNext's documented default: a no-op "dummy" incremental cache. Every
// ISR page still renders correctly, it just isn't persisted between
// invocations — no persistent storage layer means nothing to bind, nothing
// to bill. This is an acceptable tradeoff now that ISR churn is low (bots
// blocked at the Cloudflare edge, revalidate lengthened to 30 days on the
// heaviest templates — see prior commits), so per-request regeneration
// should stay well within the Workers free tier's request/CPU budget.
//
// (Workers Static Assets also has a built-in read-only incremental-cache
// option, but it explicitly does not support revalidation — unsuitable here
// since several templates rely on `export const revalidate`, not full static
// export.)
export default defineCloudflareConfig({})
