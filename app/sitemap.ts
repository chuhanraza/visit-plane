import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // re-generate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.visitplane.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  // Dynamic visa route pages
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Fetch all unique passport + destination combos
    const { data, error } = await supabase
      .from('destinations')
      .select('passport_country, country_name')
      .order('passport_country')

    if (error || !data) return staticPages

    const visaPages: MetadataRoute.Sitemap = data.map((row) => ({
      url: `${base}/visa/${encodeURIComponent(row.passport_country)}/${encodeURIComponent(row.country_name)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...visaPages]
  } catch {
    return staticPages
  }
}
