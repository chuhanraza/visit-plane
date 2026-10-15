#!/usr/bin/env node
/**
 * Tell IndexNow search engines (Bing, Yandex, Naver, Seznam, Yep) about new or changed URLs.
 * Google does not use IndexNow — use Search Console for Google.
 *
 *   node scripts/indexnow.mjs --letters           every /support-letter URL in the live sitemap
 *   node scripts/indexnow.mjs https://www.visitplane.com/blog/x ...
 *
 * The key file lives at /a5a9a1312685f6f632460ef4c5ac9530.txt (public/). Submit only URLs that are new or changed.
 */
const HOST = 'www.visitplane.com'
const KEY = 'a5a9a1312685f6f632460ef4c5ac9530'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`

async function lettersFromSitemap() {
  const res = await fetch(`https://${HOST}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('/support-letter'))
}

const args = process.argv.slice(2)
const urls = args.includes('--letters') ? await lettersFromSitemap() : args.filter((a) => a.startsWith('https://'))
if (!urls.length) {
  console.error('No URLs. Pass --letters or one or more https:// URLs.')
  process.exit(1)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls.slice(0, 10000) }),
})
console.log(`IndexNow: ${res.status} for ${Math.min(urls.length, 10000)} URL(s)`)
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text())
  process.exit(1)
}
