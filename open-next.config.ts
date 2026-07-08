import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

// Incremental cache (ISR) backed by R2, not KV — see wrangler.jsonc for why.
// This wires the cache implementation into the built worker; it still needs
// the actual R2 bucket created + the r2_buckets binding uncommented in
// wrangler.jsonc before it can read/write for real (account-level action,
// not done by this commit).
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
})
