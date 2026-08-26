#!/usr/bin/env node
/**
 * Destination photo ingestion — 15-cheapest-countries template, Phase 1.
 *
 * For each country in ./countries.mjs: search Unsplash first, fall back to
 * Pexels if no good result, fire the Unsplash download_location tracking
 * request (required by Unsplash API terms — must happen at selection time,
 * not at render time), compute a blurhash, and upsert into
 * public.destination_photos.
 *
 * Run manually — this is NOT a live edge function / cron job. Ingested
 * photos land with is_active = false; a human must approve them at the
 * /admin/(evisa)/destination-photos review page before they render publicly
 * (RLS on public.destination_photos only lets anon SELECT is_active = true).
 *
 * Usage:
 *   node scripts/destination-photos/ingest.mjs --dry-run           # log-only, no network calls, no keys needed
 *   node scripts/destination-photos/ingest.mjs --dry-run --country=Thailand
 *   node scripts/destination-photos/ingest.mjs                     # real run — needs UNSPLASH_ACCESS_KEY / PEXELS_API_KEY
 *
 * Required env for a real run (not yet configured in this project):
 *   UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, SUPABASE_SERVICE_ROLE_KEY,
 *   NEXT_PUBLIC_SUPABASE_URL
 */

import { COUNTRIES, searchQueryFor } from './countries.mjs'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const countryFilter = args.find((a) => a.startsWith('--country='))?.split('=')[1]

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const UTM = 'utm_source=visitplane&utm_medium=referral'

function log(...a) {
  console.log(...a)
}

async function searchUnsplash(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&content_filter=high`
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } })
  if (!res.ok) throw new Error(`Unsplash search HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const first = data.results?.[0]
  if (!first) return null
  return {
    provider: 'unsplash',
    providerAssetId: first.id,
    imageUrl: `${first.urls.raw}&w=800&q=80&auto=format&fit=crop`,
    downloadTrackingUrl: first.links.download_location,
    width: first.width,
    height: first.height,
    photographerName: first.user?.name,
    photographerUrl: first.user?.links?.html ? `${first.user.links.html}?${UTM}` : undefined,
  }
}

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } })
  if (!res.ok) throw new Error(`Pexels search HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const first = data.photos?.[0]
  if (!first) return null
  return {
    provider: 'pexels',
    providerAssetId: String(first.id),
    imageUrl: `${first.src.original}?w=800&q=80&auto=format&fit=crop`,
    downloadTrackingUrl: null, // Pexels has no download_location tracking requirement
    width: first.width,
    height: first.height,
    photographerName: first.photographer,
    photographerUrl: first.photographer_url ? `${first.photographer_url}?${UTM}` : undefined,
  }
}

/** Fire Unsplash's mandatory download tracking GET at selection time. */
async function fireDownloadTracking(trackingUrl) {
  if (!trackingUrl) return
  const res = await fetch(trackingUrl, { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } })
  if (!res.ok) log(`  [warn] download_location tracking returned HTTP ${res.status}`)
}

async function computeBlurhash(imageUrl) {
  const { encode } = await import('blurhash')
  const sharp = (await import('sharp')).default
  const res = await fetch(imageUrl)
  const buf = Buffer.from(await res.arrayBuffer())
  const { data, info } = await sharp(buf).raw().ensureAlpha().resize(32, 32, { fit: 'inside' }).toBuffer({ resolveWithObject: true })
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
}

async function upsert(supabase, destinationId, candidate, blurhash) {
  const { error } = await supabase
    .from('destination_photos')
    .upsert(
      {
        destination_id: destinationId,
        provider: candidate.provider,
        provider_asset_id: candidate.providerAssetId,
        image_url: candidate.imageUrl,
        download_tracking_url: candidate.downloadTrackingUrl,
        width: candidate.width,
        height: candidate.height,
        blurhash,
        photographer_name: candidate.photographerName,
        photographer_url: candidate.photographerUrl,
        is_primary: true,
        is_active: false, // human review gate — see Task 5 admin page
      },
      { onConflict: 'provider,provider_asset_id' }
    )
  if (error) throw error
}

async function main() {
  const countries = countryFilter
    ? COUNTRIES.filter((c) => c.name.toLowerCase() === countryFilter.toLowerCase())
    : COUNTRIES

  if (countries.length === 0) {
    console.error(`No country matched --country=${countryFilter}`)
    process.exit(1)
  }

  if (!DRY_RUN) {
    const missing = []
    if (!UNSPLASH_ACCESS_KEY && !PEXELS_API_KEY) missing.push('UNSPLASH_ACCESS_KEY or PEXELS_API_KEY')
    if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (missing.length) {
      console.error(`Missing required env for a real run: ${missing.join(', ')}`)
      console.error('Run with --dry-run to verify ingestion logic without real credentials.')
      process.exit(1)
    }
  }

  let supabase
  let getServiceClientForCountry
  if (!DRY_RUN) {
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    getServiceClientForCountry = async (countryCode) => {
      const { data, error } = await supabase
        .from('destination_photo_countries')
        .select('id')
        .eq('country_code', countryCode)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error(`destination_photo_countries row missing for ${countryCode} — run the seed migration first`)
      return data.id
    }
  }

  log(`${DRY_RUN ? '[DRY RUN] ' : ''}Ingesting photos for ${countries.length} destination(s)\n`)

  for (const country of countries) {
    const query = searchQueryFor(country)
    log(`── ${country.name} (${country.code}) ──`)
    log(`   query: "${query}"`)

    if (DRY_RUN) {
      log('   would search: Unsplash first, Pexels fallback')
      log('   would fire download_location tracking GET (Unsplash only, at selection time)')
      log('   would compute blurhash from the selected image')
      log(`   would upsert into destination_photos (destination_id for ${country.code}, is_active=false)`)
      log('')
      continue
    }

    try {
      let candidate = null
      if (UNSPLASH_ACCESS_KEY) candidate = await searchUnsplash(query)
      if (!candidate && PEXELS_API_KEY) candidate = await searchPexels(query)
      if (!candidate) {
        log(`   [skip] no result from any provider`)
        continue
      }
      log(`   selected: ${candidate.provider}/${candidate.providerAssetId} by ${candidate.photographerName ?? 'unknown'}`)

      if (candidate.provider === 'unsplash') {
        await fireDownloadTracking(candidate.downloadTrackingUrl)
        log('   fired Unsplash download_location tracking')
      }

      const blurhash = await computeBlurhash(candidate.imageUrl)
      const destinationId = await getServiceClientForCountry(country.code)
      await upsert(supabase, destinationId, candidate, blurhash)
      log(`   upserted (is_active=false — needs review)\n`)
    } catch (err) {
      console.error(`   [error] ${country.name}: ${err.message}\n`)
    }
  }

  log(DRY_RUN ? 'Dry run complete. No network calls made, no data written.' : 'Ingestion complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
