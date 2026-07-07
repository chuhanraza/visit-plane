import { MetadataRoute } from 'next'
import { BLOCKED_BOT_USER_AGENTS } from '@/lib/security/botBlocklist'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block internal/utility routes from crawl budget
        disallow: [
          '/api/',
          '/_next/',
          '/passport-scanner', // App-like page, not SEO content
        ],
      },
      {
        // Allow Google to crawl everything it needs for indexing
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        // Allow Bing to crawl everything it needs for indexing
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Advisory block for aggressive/non-essential crawlers (SEO scrapers,
      // AI training/browsing bots) — polite bots honor this; rude ones don't,
      // which is why middleware.ts also hard-blocks the same list at the edge.
      ...BLOCKED_BOT_USER_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: [
      'https://www.visitplane.com/sitemap.xml',
      'https://www.visitplane.com/sitemap-blog.xml',
    ],
    host: 'https://www.visitplane.com',
  }
}
