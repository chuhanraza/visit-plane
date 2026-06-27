// ─────────────────────────────────────────────────────────────────────────────
// Shared JSON-LD (schema.org) builders.
//
// WHY: structured data was previously inlined per page, which drifts over time.
// These small, pure builders return plain objects that callers stringify into a
// <script type="application/ld+json"> tag. No side effects, no React — safe to use
// in server components, client components, and route handlers alike.
//
// SCOPE: only schema we can populate honestly from real page content. We do NOT
// fabricate ratings, prices, or counts. Dataset schema (for the Phase-4 data
// resources) cites the real source + license.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://www.visitplane.com'

export type Crumb = { name: string; url: string }
export type Faq = { q: string; a: string }

/** Absolute-ise a path or pass through an already-absolute URL. */
function abs(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${BASE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/** BreadcrumbList — feed it the visible trail (Home first). */
export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  }
}

/** FAQPage — pass the same Q&A the page renders (don't invent answers). */
export function faqPage(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export type DatasetInput = {
  name: string
  description: string
  /** Canonical page URL the dataset is published at. */
  url: string
  /** ISO date (YYYY-MM-DD) the dataset was last compiled/verified. */
  dateModified: string
  /** Keywords/topics the dataset covers. */
  keywords?: string[]
  /** Source citations (name + url) — the provenance that makes it citable. */
  sources?: { name: string; url: string }[]
  /** Spatial coverage, e.g. "Worldwide" or a region. */
  spatialCoverage?: string
  /** License URL or short label. */
  license?: string
}

/**
 * Dataset schema (schema.org/Dataset) for the original-data research pages.
 * Credits VisitPlane as publisher and cites the upstream sources honestly.
 */
export function dataset(d: DatasetInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: d.name,
    description: d.description,
    url: abs(d.url),
    dateModified: d.dateModified,
    ...(d.keywords?.length ? { keywords: d.keywords } : {}),
    ...(d.spatialCoverage ? { spatialCoverage: d.spatialCoverage } : {}),
    ...(d.license ? { license: d.license } : {}),
    creator: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: BASE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: BASE,
      logo: `${BASE}/logo-v2.png`,
    },
    ...(d.sources?.length
      ? {
          isBasedOn: d.sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.name,
            url: s.url,
          })),
        }
      : {}),
  }
}

export type ArticleInput = {
  headline: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  /** Author Person (from lib/data/authors). */
  author: { name: string; url?: string; jobTitle?: string }
  image?: string
}

/** Article schema for editorial/data-led research pages. */
export function article(a: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(a.url) },
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: {
      '@type': 'Person',
      name: a.author.name,
      ...(a.author.url ? { url: a.author.url } : {}),
      ...(a.author.jobTitle ? { jobTitle: a.author.jobTitle } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'VisitPlane',
      logo: { '@type': 'ImageObject', url: `${BASE}/logo-v2.png` },
    },
    ...(a.image ? { image: a.image } : {}),
  }
}

/** Convenience: render a JSON-LD <script> innerHTML string. */
export function jsonLdHtml(schema: unknown): string {
  return JSON.stringify(schema)
}
