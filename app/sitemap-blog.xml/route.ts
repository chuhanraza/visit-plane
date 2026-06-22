import {
  blogPosts,
  getAllCategories,
  getAllTags,
  toSlug,
} from '@/src/lib/posts'
import { noindexedPostSet } from '@/lib/data/noindexedPosts'
import { redirectedSlugSet } from '@/lib/data/blogRedirectSlugs'

export const dynamic = 'force-static'
export const revalidate = 3600

const BASE = 'https://www.visitplane.com'

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * Standalone blog sitemap — lists every blog post plus the category and
 * tag landing pages. Referenced from robots.txt alongside the main sitemap.
 */
export async function GET() {
  const now = new Date().toISOString()

  // Sprint 5 content prune: omit noindexed clones and 301-redirected duplicates.
  const posts = blogPosts
    .filter((p) => !noindexedPostSet.has(p.slug) && !redirectedSlugSet.has(p.slug))
    .map((p) =>
      urlEntry(`${BASE}/blog/${p.slug}`, new Date(p.date).toISOString(), 'monthly', '0.7'),
    )
  const categories = getAllCategories().map((c) =>
    urlEntry(`${BASE}/blog/category/${toSlug(c)}`, now, 'weekly', '0.6'),
  )
  const tags = getAllTags().map((t) =>
    urlEntry(`${BASE}/blog/tag/${t.slug}`, now, 'weekly', '0.5'),
  )

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntry(`${BASE}/blog`, now, 'weekly', '0.9')}
${[...posts, ...categories, ...tags].join('\n')}
</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
