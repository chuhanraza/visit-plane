import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { blogPosts, getAllCategories, getAllTags, toSlug as postTaxonomySlug } from '@/src/lib/posts'
import { COUNTRIES, TOP_50_ROUTES, BY_ISO3 } from '@/lib/seo/countries'
import { getSitemapPriority } from '@/lib/seo/internalLinks'
import { noindexedPostSet } from '@/lib/data/noindexedPosts'
import { redirectedSlugSet } from '@/lib/data/blogRedirectSlugs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // re-generate once per day

// Slug-ify a country name for programmatic SEO URLs
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Nationality adjective map (used for Template A/C slugs)
// Falls back to "{country}-passport" / "{country}-citizens" when missing
const NATIONALITY_MAP: Record<string, string> = {
  'pakistan': 'pakistani',
  'india': 'indian',
  'bangladesh': 'bangladeshi',
  'nigeria': 'nigerian',
  'ghana': 'ghanaian',
  'kenya': 'kenyan',
  'ethiopia': 'ethiopian',
  'tanzania': 'tanzanian',
  'south africa': 'south-african',
  'egypt': 'egyptian',
  'morocco': 'moroccan',
  'algeria': 'algerian',
  'tunisia': 'tunisian',
  'china': 'chinese',
  'japan': 'japanese',
  'south korea': 'south-korean',
  'indonesia': 'indonesian',
  'malaysia': 'malaysian',
  'philippines': 'filipino',
  'vietnam': 'vietnamese',
  'thailand': 'thai',
  'cambodia': 'cambodian',
  'myanmar': 'myanmar',
  'sri lanka': 'sri-lankan',
  'nepal': 'nepali',
  'iran': 'iranian',
  'iraq': 'iraqi',
  'jordan': 'jordanian',
  'lebanon': 'lebanese',
  'qatar': 'qatari',
  'kuwait': 'kuwaiti',
  'oman': 'omani',
  'bahrain': 'bahraini',
  'saudi arabia': 'saudi',
  'uae': 'emirati',
  'turkey': 'turkish',
  'russia': 'russian',
  'ukraine': 'ukrainian',
  'poland': 'polish',
  'romania': 'romanian',
  'hungary': 'hungarian',
  'czechia': 'czech',
  'germany': 'german',
  'france': 'french',
  'italy': 'italian',
  'spain': 'spanish',
  'portugal': 'portuguese',
  'netherlands': 'dutch',
  'belgium': 'belgian',
  'switzerland': 'swiss',
  'austria': 'austrian',
  'sweden': 'swedish',
  'norway': 'norwegian',
  'denmark': 'danish',
  'finland': 'finnish',
  'greece': 'greek',
  'united kingdom': 'british',
  'united states': 'american',
  'canada': 'canadian',
  'australia': 'australian',
  'new zealand': 'new-zealand',
  'brazil': 'brazilian',
  'argentina': 'argentinian',
  'colombia': 'colombian',
  'chile': 'chilean',
  'peru': 'peruvian',
  'mexico': 'mexican',
  'singapore': 'singaporean',
}

function getNationality(country: string): string {
  return NATIONALITY_MAP[country.toLowerCase()] ?? toSlug(country)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.visitplane.com'

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/about`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/passport-strength`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/visa-free-map`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/compare`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/checklist`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/embassy-finder`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/cost-calculator`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/processing-times`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/visa-tracker`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/visa-checker`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/destinations`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/itinerary-generator`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/currency-converter`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/travel-insurance`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/interview-prep`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/visa-vault`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/passport-scanner`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/how-it-works`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/visa-requirements`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/faq`,                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`,                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,                   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // ── Blog post pages ─────────────────────────────────────────────────────────
  // Sprint 5 content prune: exclude noindexed dead clones and 301-redirected
  // merge duplicates. Sitemap lists only LIVE + LIVE_DEEPEN_QUEUE pages.
  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((post) => !noindexedPostSet.has(post.slug) && !redirectedSlugSet.has(post.slug))
    .map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  // ── Blog category + tag landing pages ────────────────────────────────────────
  const blogTaxonomyPages: MetadataRoute.Sitemap = [
    ...getAllCategories().map((c) => ({
      url: `${base}/blog/category/${postTaxonomySlug(c)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...getAllTags().map((t) => ({
      url: `${base}/blog/tag/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ]

  // ── Dynamic visa + programmatic SEO pages ───────────────────────────────────
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data, error } = await supabase
      .from('destinations')
      .select('passport_country, country_name')
      .order('passport_country')

    if (error || !data) return [...staticPages, ...blogPages, ...blogTaxonomyPages]

    // Legacy visa pages: /visa/{passport}/{destination}
    const visaPages: MetadataRoute.Sitemap = data.map((row) => ({
      url: `${base}/visa/${encodeURIComponent(row.passport_country)}/${encodeURIComponent(row.country_name)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Unique passport countries from legacy data (for old templates)
    const legacyPassports = [...new Set(data.map((r) => r.passport_country))]
    const legacyDests     = [...new Set(data.map((r) => r.country_name))]

    // ── NEW programmatic SEO templates (from lib/seo/countries.ts) ────────────

    // Template 1: /visa-requirements-for-{nationality}-citizens-to-{destination}
    // Priority scaled by traffic potential (high-traffic passport+dest combos get 0.95)
    const template1Pages: MetadataRoute.Sitemap = TOP_50_ROUTES.flatMap(([passportIso, destIso]) => {
      const pp   = BY_ISO3[passportIso]
      const dest = BY_ISO3[destIso]
      if (!pp || !dest) return []
      return [{
        url:             `${base}/visa-requirements-for-${pp.nationality}-citizens-to-${dest.slug}`,
        lastModified:    new Date(),
        changeFrequency: 'weekly' as const,
        priority:        getSitemapPriority(1, passportIso, destIso),
      }]
    })

    // Template 1: full matrix from seo_page_content (published pages only)
    const { data: publishedT1 } = await supabase
      .from('seo_page_content')
      .select('url_slug, updated_at')
      .eq('template', 'template1')
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(20000)

    const template1Full: MetadataRoute.Sitemap = (publishedT1 ?? []).map((row) => ({
      url:             `${base}/${row.url_slug}`,
      lastModified:    new Date(row.updated_at),
      changeFrequency: 'weekly' as const,
      priority:        0.85,
    }))

    // Template 2: /visa-free-countries-for-{nationality}-passport
    const template2Pages: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
      url:             `${base}/visa-free-countries-for-${c.nationality}-passport`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        getSitemapPriority(2, c.iso3),
    }))

    // Template 3: /cheapest-visas-from-{slug}-passport
    const template3Pages: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
      url:             `${base}/cheapest-visas-from-${c.slug}-passport`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        getSitemapPriority(3, c.iso3),
    }))

    // Template 4: /{destination}-visa-guide-for-{nationality}
    // NOTE: Use nationality adjective (URL-safe), NOT nounPlural which contains spaces.
    // The page's resolvePassportFromNounSlug() accepts nationality slugs directly.
    const template4Pages: MetadataRoute.Sitemap = TOP_50_ROUTES.flatMap(([passportIso, destIso]) => {
      const pp   = BY_ISO3[passportIso]
      const dest = BY_ISO3[destIso]
      if (!pp || !dest) return []
      return [{
        url:             `${base}/${dest.slug}-visa-guide-for-${pp.nationality}`,
        lastModified:    new Date(),
        changeFrequency: 'weekly' as const,
        priority:        getSitemapPriority(4, passportIso, destIso),
      }]
    })

    // Template 4: full published matrix
    const { data: publishedT4 } = await supabase
      .from('seo_page_content')
      .select('url_slug, updated_at')
      .eq('template', 'template4')
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(20000)

    const template4Full: MetadataRoute.Sitemap = (publishedT4 ?? []).map((row) => ({
      url:             `${base}/${row.url_slug}`,
      lastModified:    new Date(row.updated_at),
      changeFrequency: 'weekly' as const,
      priority:        0.9,
    }))

    // Legacy old templates (kept for backwards compat)
    // IMPORTANT: Only include passports that are in NATIONALITY_MAP so we produce
    // a real nationality adjective (e.g. "pakistani"). Countries not in the map fall
    // back to toSlug(country) which the legacy page components cannot resolve → 404.
    const oldTemplateAPages: MetadataRoute.Sitemap = legacyPassports
      .filter((passport) => NATIONALITY_MAP[passport.toLowerCase()] !== undefined)
      .map((passport) => ({
        url: `${base}/visa-requirements-for-${getNationality(passport)}-citizens`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      }))

    const oldTemplateDPages: MetadataRoute.Sitemap = legacyPassports
      .filter((passport) => NATIONALITY_MAP[passport.toLowerCase()] !== undefined)
      .map((passport) => ({
        url: `${base}/cheapest-visa-from-${getNationality(passport)}-passport`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))

    const destinationHubPages: MetadataRoute.Sitemap = legacyDests.map((dest) => ({
      url: `${base}/destinations/${encodeURIComponent(dest)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))

    // Deduplicate by URL
    const allPages = [
      ...staticPages,
      ...blogPages,
      ...blogTaxonomyPages,
      ...template1Pages,
      ...template1Full,
      ...template2Pages,
      ...template3Pages,
      ...template4Pages,
      ...template4Full,
      ...visaPages,
      ...oldTemplateAPages,
      ...oldTemplateDPages,
      ...destinationHubPages,
    ]

    const seen = new Set<string>()
    const deduped = allPages.filter(p => {
      if (seen.has(p.url)) return false
      seen.add(p.url)
      return true
    })

    return deduped
  } catch {
    return [...staticPages, ...blogPages, ...blogTaxonomyPages]
  }
}
