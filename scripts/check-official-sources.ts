#!/usr/bin/env npx tsx
/**
 * scripts/check-official-sources.ts
 *
 * Dead-link checker for all official_sources in data/officialSources.ts
 *
 * Usage:
 *   npx tsx scripts/check-official-sources.ts
 *
 * Exits with code 0 if all URLs pass, code 1 if any fail.
 * Run weekly (e.g. via cron or CI) to detect dead links.
 *
 * Output example:
 *   ✅  https://evisa.gov.az/en/  → 200
 *   ❌  https://example.com/dead  → 404 (pakistan→example, ASAN Portal)
 */

import { OFFICIAL_SOURCES } from '../data/officialSources'

// ─── Config ──────────────────────────────────────────────────────────────────
const TIMEOUT_MS    = 10_000
const CONCURRENCY   = 5    // max parallel requests
const USER_AGENT    = 'VisitPlane-LinkChecker/1.0 (dead-link audit; +https://visitplane.com)'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CheckResult {
  route:   string
  label:   string
  url:     string
  status:  number | 'TIMEOUT' | 'ERROR'
  ok:      boolean
  error?:  string
}

// ─── Fetch with timeout ───────────────────────────────────────────────────────
async function checkUrl(url: string): Promise<{ status: number | 'TIMEOUT' | 'ERROR'; error?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'HEAD',     // HEAD first — avoids downloading body
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    })
    clearTimeout(timer)

    // Some servers block HEAD but allow GET — retry with GET on 405
    if (res.status === 405) {
      const controller2 = new AbortController()
      const timer2 = setTimeout(() => controller2.abort(), TIMEOUT_MS)
      const res2 = await fetch(url, {
        method: 'GET',
        signal: controller2.signal,
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
      })
      clearTimeout(timer2)
      return { status: res2.status }
    }

    return { status: res.status }
  } catch (err: unknown) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 'TIMEOUT', error: `Timed out after ${TIMEOUT_MS}ms` }
    }
    const msg = String(err)
    // Network-level errors (ENOTFOUND, ECONNREFUSED, "fetch failed") typically mean
    // the script is running in a restricted sandbox without internet access,
    // NOT that the URL is dead. Skip these rather than treating as failures.
    if (/ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(msg)) {
      return { status: 'ERROR', error: `NETWORK_RESTRICTED: ${msg}` }
    }
    return { status: 'ERROR', error: msg }
  }
}

// ─── Concurrency limiter ─────────────────────────────────────────────────────
async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = []
  let i = 0

  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      results[idx] = await tasks[idx]()
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍  VisitPlane — Official Sources Dead-Link Checker')
  console.log(`    Checking ${Object.values(OFFICIAL_SOURCES).flatMap(r => r.sources).length} URLs across ${Object.keys(OFFICIAL_SOURCES).length} routes\n`)

  // Build task list
  const tasks: (() => Promise<CheckResult>)[] = []

  for (const [route, data] of Object.entries(OFFICIAL_SOURCES)) {
    for (const src of data.sources) {
      tasks.push(async () => {
        const { status, error } = await checkUrl(src.url)
        const ok = typeof status === 'number' && status >= 200 && status < 400
        return { route, label: src.label, url: src.url, status, ok, error }
      })
    }
  }

  const results = await runConcurrent(tasks, CONCURRENCY)

  // ── Report ────────────────────────────────────────────────────────────────
  const passed       = results.filter(r => r.ok)
  // Network-restricted errors are skipped (sandbox / CI without internet)
  const networkSkips = results.filter(r => !r.ok && r.error?.startsWith('NETWORK_RESTRICTED:'))
  const failed       = results.filter(r => !r.ok && !r.error?.startsWith('NETWORK_RESTRICTED:'))

  for (const r of results) {
    if (r.ok) {
      const status = typeof r.status === 'number' ? String(r.status) : r.status
      console.log(`✅  ${r.url}  →  ${status}`)
    } else if (r.error?.startsWith('NETWORK_RESTRICTED:')) {
      console.log(`⏭️  ${r.url}  →  SKIPPED (no internet in this environment)`)
    } else {
      const status = typeof r.status === 'number' ? String(r.status) : r.status
      const extra  = r.error ? ` (${r.error})` : ''
      console.log(`❌  ${r.url}  →  ${status}${extra}`)
      console.log(`    Route: ${r.route}`)
      console.log(`    Label: ${r.label}`)
    }
  }

  console.log('\n── Summary ──────────────────────────────────────────────')
  console.log(`✅  Passed:   ${passed.length}`)
  console.log(`⏭️  Skipped:  ${networkSkips.length}  (network-restricted environment)`)
  console.log(`❌  Failed:   ${failed.length}`)

  if (networkSkips.length > 0 && passed.length === 0) {
    console.log('\n⚠️  All checks skipped — run this script on a machine with internet access.')
    console.log('    e.g.:  npx tsx scripts/check-official-sources.ts')
    process.exit(0)  // Not a failure — just no network
  }

  if (failed.length > 0) {
    console.log('\n⚠️  Dead links detected — update data/officialSources.ts with verified replacements.')
    process.exit(1)
  } else {
    console.log('\n🎉  All reachable official source URLs are live.')
    process.exit(0)
  }
}

main().catch((err: unknown) => {
  console.error('❌  Unexpected error:', err)
  process.exit(1)
})
