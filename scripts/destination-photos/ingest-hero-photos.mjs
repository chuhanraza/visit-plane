// Ingests one candidate "hero_iconic" photo per country from hero-landmark-seed.json.
// Hotlinks Unsplash/Pexels CDN URLs — never downloads/rehosts. Every insert lands
// with is_active = false; only a human approving in /admin/destination-photos
// (see app/api/admin/destination-photos/[id]/status/route.ts) can make it live.
// Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and at least one of
// UNSPLASH_ACCESS_KEY / PEXELS_API_KEY in the environment.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DRY_RUN = process.argv.includes('--dry-run');
const onlyCodes = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]?.split(',');

async function searchUnsplash(query) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return [];
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', '3');
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

async function searchPexels(query) {
  if (!process.env.PEXELS_API_KEY) return [];
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=3`;
  const res = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.photos || []).map((p) => ({
    urls: { raw: p.src.original },
    user: { name: p.photographer, links: { html: p.photographer_url } },
    width: p.width,
    height: p.height,
    alt_description: p.alt,
    links: {},
  }));
}

async function triggerUnsplashDownload(downloadLocation) {
  if (!downloadLocation) return;
  await fetch(downloadLocation, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
  }).catch(() => {});
}

async function ingestCountry(countryCode, seed) {
  const { data: countryRow } = await supabase
    .from('destination_photo_countries')
    .select('id, country_name')
    .eq('country_code', countryCode)
    .single();

  if (!countryRow) {
    console.error(`  ❌ [${countryCode}] not found in destination_photo_countries — run the migration first`);
    return { countryCode, status: 'skipped_missing_country' };
  }

  // Skip if a hero_iconic candidate already exists for this country.
  const { data: existing } = await supabase
    .from('destination_photos')
    .select('id')
    .eq('destination_id', countryRow.id)
    .eq('role', 'hero_iconic')
    .limit(1);
  if (existing && existing.length > 0) {
    console.log(`  ⏭️  [${countryCode}] hero_iconic candidate already exists — skipping`);
    return { countryCode, status: 'already_has_candidate' };
  }

  let results = await searchUnsplash(seed.primary_query);
  let source = 'unsplash';
  if (results.length === 0 && seed.fallback_query) {
    results = await searchUnsplash(seed.fallback_query);
  }
  if (results.length === 0) {
    results = await searchPexels(seed.primary_query);
    source = 'pexels';
  }
  if (results.length === 0) {
    console.error(`  ❌ [${countryCode}] no results from any provider`);
    return { countryCode, status: 'no_results' };
  }

  const photo = results[0];
  const imageUrl = source === 'unsplash'
    ? `${photo.urls.raw}&w=1600&q=80&auto=format&fit=crop`
    : photo.urls.raw;

  if (DRY_RUN) {
    console.log(`  [DRY RUN] [${countryCode}] would ingest from ${source}: ${imageUrl}`);
    return { countryCode, status: 'dry_run_ok', source, imageUrl };
  }

  if (source === 'unsplash' && photo.links?.download_location) {
    await triggerUnsplashDownload(photo.links.download_location);
  }

  const { error } = await supabase.from('destination_photos').insert({
    destination_id: countryRow.id,
    provider: source,
    provider_asset_id: String(photo.id ?? photo.urls.raw),
    image_url: imageUrl,
    download_tracking_url: photo.links?.download_location ?? null,
    width: photo.width ?? null,
    height: photo.height ?? null,
    blurhash: photo.blur_hash ?? null,
    photographer_name: photo.user.name,
    photographer_url: photo.user.links.html,
    is_primary: false,
    is_active: false, // NEVER true here — human approval only
    role: 'hero_iconic',
    landmark_caption: seed.landmark_caption,
    focal_point_x: 0.5,
    focal_point_y: 0.5,
  });

  if (error) {
    console.error(`  ❌ [${countryCode}] DB insert failed:`, error.message);
    return { countryCode, status: 'db_error', error: error.message };
  }
  console.log(`  ✅ [${countryCode}] ingested (pending review) via ${source}`);
  return { countryCode, status: 'ingested', source };
}

async function main() {
  const seedPath = new URL('./hero-landmark-seed.json', import.meta.url);
  const seed = JSON.parse(await readFile(seedPath, 'utf-8'));
  const entries = Object.entries(seed).filter(([code]) => !onlyCodes || onlyCodes.includes(code));
  const results = [];
  for (const [countryCode, entry] of entries) {
    console.log(`🔍 [${countryCode}] ${entry.landmark_caption}`);
    results.push(await ingestCountry(countryCode, entry));
    await new Promise((r) => setTimeout(r, 1200)); // respect Unsplash rate limits
  }
  const summary = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log('\n=== INGESTION SUMMARY ===', summary);
}

main();
