#!/usr/bin/env npx tsx
/**
 * scripts/check-official-sources.ts
 * Dead-link checker for all official_sources in data/officialSources.ts
 * Usage: npx tsx scripts/check-official-sources.ts
 * Exits 0 if all pass, 1 if any fail. Run weekly to detect dead links.
 */
import { OFFICIAL_SOURCES } from '../data/officialSources'

const TIMEOUT_MS  = 10_000
const CONCURRENCY = 5
const USER_AGENT  = 'VisitPlane-LinkChecker/1.0 (+https://visitplane.com)'

interface CheckResult {
  route: string; label: string; url: string
  status: number | 'TIMEOUT' | 'ERROR'; ok: boolean; error?: string
}

async function checkUrl(url: string): Promise<{ status: number | 'TIMEOUT' | 'ERROR'; error?: string }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' })
    clearTimeout(timer)
    if (res.status === 405) {
      const ctrl2 = new AbortController()
      const t2 = setTimeout(() => ctrl2.abort(), TIMEOUT_MS)
      const r2 = await fetch(url, { method: 'GET', signal: ctrl2.signal, headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' })
      clearTimeout(t2)
      return { status: r2.status }
    }
    return { status: res.status }
  } catch (err: unknown) {
    clearTimeout(timer)
    const msg = String(err)
    if (err instanceof Error && err.name === 'AbortError') return { status: 'TIMEOUT', error: `Timed out after ${TIMEOUT_MS}ms` }
    if (/ENOTFOUND|ECONNREFUSED|fetch failed|network/i.test(msg)) return { status: 'ERROR', error: `NETWORK_RESTRICTED: ${msg}` }
    return { status: 'ERROR', error: msg }
  }
}

async function runConcurrent<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = []; let i = 0
  async function worker() { while (i < tasks.length) { const idx = i++; results[idx] = await tasks[idx]() } }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

async function main() {
  const allSources = Object.values(OFFICIAL_SOURCES).flatMap(r => r.sources)
  console.log(`🔍  VisitPlane Dead-Link Checker — ${allSources.length} URLs across ${Object.keys(OFFICIAL_SOURCES).length} routes\n`)
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
  const passed = results.filter(r => r.ok)
  const skipped = results.filter(r => !r.ok && r.error?.startsWith('NETWORK_RESTRICTED:'))
  const failed = results.filter(r => !r.ok && !r.error?.startsWith('NETWORK_RESTRICTED:'))
  for (const r of results) {
    if (r.ok) console.log(`✅  ${r.url}  →  ${r.status}`)
    else if (r.error?.startsWith('NETWORK_RESTRICTED:')) console.log(`⏭️  ${r.url}  →  SKIPPED (no internet)`)
    else { console.log(`❌  ${r.url}  →  ${r.status} (${r.error})`); console.log(`    Route: ${r.route} | ${r.label}`) }
  }
  console.log(`\n✅ ${passed.length}  ⏭️ ${skipped.length}  ❌ ${failed.length}`)
  if (skipped.length > 0 && passed.length === 0) { console.log('\n⚠️  Run on a machine with internet access.'); process.exit(0) }
  if (failed.length > 0) { console.log('\n⚠️  Dead links found — update data/officialSources.ts'); process.exit(1) }
  console.log('\n🎉  All reachable URLs are live.'); process.exit(0)
}
main().catch((e: unknown) => { console.error(e); process.exit(1) })
