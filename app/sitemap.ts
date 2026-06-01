import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { blogPosts } from '@/src/lib/posts'

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
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // ── Dynamic visa + programmatic SEO pages ───────────────────────────────────
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data, error } = await supabase
      .from('destinations')
      .select('passport_country, country_name')
      .order('passport_country')

    if (error || !data) return [...staticPages, ...blogPages]

    // Template B: /{passport}-to-{destination}-visa-requirements (38,809 pages)
    const visaPages: MetadataRoute.Sitemap = data.map((row) => ({
      url: `${base}/visa/${encodeURIComponent(row.passport_country)}/${encodeURIComponent(row.country_name)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    // Unique passport countries
    const passports = [...new Set(data.map((r) => r.passport_country))]
    // Unique destination countries
    const destinations = [...new Set(data.map((r) => r.country_name))]

    // Template A: /visa-free-countries-for-{nationality}-passport (197 pages)
    const templateAPages: MetadataRoute.Sitemap = passports.map((passport) => ({
      url: `${base}/visa-free-countries-for-${getNationality(passport)}-passport`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }))

    // Template C: /visa-requirements-for-{nationality}-citizens (197 pages)
    const templateCPages: MetadataRoute.Sitemap = passports.map((passport) => ({
      url: `${base}/visa-requirements-for-${getNationality(passport)}-citizens`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }))

    // Template D: /cheapest-visa-from-{passport} (197 pages)
    const templateDPages: MetadataRoute.Sitemap = passports.map((passport) => ({
      url: `${base}/cheapest-visa-from-${getNationality(passport)}-passport`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    // Destination hub pages: /destinations/{country} (197 pages)
    const destinationHubPages: MetadataRoute.Sitemap = destinations.map((dest) => ({
      url: `${base}/destinations/${encodeURIComponent(dest)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))

    return [
      ...staticPages,
      ...blogPages,
      ...visaPages,
      ...templateAPages,
      ...templateCPages,
      ...templateDPages,
      ...destinationHubPages,
    ]
  } catch {
    return [...staticPages, ...blogPages]
  }
}
