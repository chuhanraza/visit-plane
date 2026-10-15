import { MetadataRoute } from 'next'
import {
  AI_SEARCH_ALLOWED_PREFIXES,
  AI_SEARCH_BOT_USER_AGENTS,
  BLOCKED_BOT_USER_AGENTS,
} from '@/lib/security/botBlocklist'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/photo', '/api/og'],
        // Block internal/utility routes from crawl budget
        disallow: [
          '/api/',
          '/passport-scanner', // App-like page, not SEO content
        ],
      },
      {
        // Allow Google to crawl everything it needs for indexing
        userAgent: 'Googlebot',
        allow: ['/', '/api/photo', '/api/og'],
        disallow: ['/api/', '/passport-scanner'],
      },
      {
        // Allow Bing to crawl everything it needs for indexing
        userAgent: 'Bingbot',
        allow: ['/', '/api/photo', '/api/og'],
        disallow: ['/api/', '/passport-scanner'],
      },
      // AI search crawlers: welcome on the letter tool and the blog, nowhere else.
      // (Most-specific rule wins, so these Allow lines override the Disallow below.)
      {
        userAgent: [...AI_SEARCH_BOT_USER_AGENTS],
        allow: [...AI_SEARCH_ALLOWED_PREFIXES],
        disallow: '/',
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
  }
}
