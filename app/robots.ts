import { MetadataRoute } from 'next'

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
    ],
    sitemap: [
      'https://www.visitplane.com/sitemap.xml',
    ],
    host: 'https://www.visitplane.com',
  }
}
