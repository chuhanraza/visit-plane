/**
 * Real, accountable author identities for VisitPlane (E-E-A-T).
 *
 * INTEGRITY: every value here must be TRUE. Do not invent co-authors,
 * degrees, certifications, years of experience, or social profiles. Leave a
 * field undefined rather than fabricating it. The only author today is the
 * real founder/operator of VisitPlane.
 */

export interface Author {
  /** URL slug → /authors/[slug] */
  slug: string
  /** Full real name */
  name: string
  /** Real role at VisitPlane */
  role: string
  /** Short honest bio (one paragraph) */
  bio: string
  /** Longer honest bio for the author page (markdown-free paragraphs) */
  longBio: string[]
  /**
   * Real profile photo in /public/authors/. Undefined until the founder
   * supplies a real photo — never use an AI-generated face. The byline/author
   * page fall back to an initials avatar while this is undefined.
   */
  image?: string
  /** Initials shown in the fallback avatar when no real photo exists yet */
  initials: string
  /** Real, verified external profiles only (LinkedIn, X, etc.). */
  sameAs: string[]
  /** Canonical author-page URL */
  url: string
}

export const AUTHORS: Record<string, Author> = {
  'muhammad-hamad-ashraf': {
    slug: 'muhammad-hamad-ashraf',
    name: 'Muhammad Hamad Ashraf',
    role: 'Founder & Editor',
    bio: 'Founder and editor of VisitPlane. Built VisitPlane as a free visa-information platform covering 197 countries, focused on accurate, official-source-verified guidance for travelers from emerging-market passports.',
    longBio: [
      'Muhammad Hamad Ashraf is the founder and editor of VisitPlane. He built and operates the platform single-handedly — a free, no-signup visa-information service covering 197 countries.',
      'His focus is accuracy for travelers who get the least reliable visa information online: holders of emerging-market passports, who often face the most complex requirements and the highest stakes when a document is wrong. Every visa route on VisitPlane is checked against official government immigration sites, embassy pages, and the IATA Travel Centre before it is published.',
      'He reviews and updates the platform’s guidance as visa rules change, and treats VisitPlane as a YMYL (Your Money or Your Life) resource: the honest position is always that visa rules change without notice and travelers must confirm the final requirements with the official embassy or consulate before booking.',
      'VisitPlane is independent — not a visa agency, not a funded startup, and not a faceless content farm. It is one operator accountable for what the site publishes.',
    ],
    // No real founder photo supplied yet — falls back to an initials avatar.
    // Hamad should provide a real photo at /public/authors/muhammad-hamad-ashraf.jpg.
    image: undefined,
    initials: 'MH',
    // No verified personal profiles provided yet. Add real LinkedIn / X URLs
    // here when available — do NOT invent them.
    sameAs: [],
    url: 'https://www.visitplane.com/authors/muhammad-hamad-ashraf',
  },
}

/** The default author/editor accountable for site content. */
export const DEFAULT_AUTHOR_SLUG = 'muhammad-hamad-ashraf'

export function getAuthor(slug: string = DEFAULT_AUTHOR_SLUG): Author {
  return AUTHORS[slug] ?? AUTHORS[DEFAULT_AUTHOR_SLUG]
}

/** Person JSON-LD for the given author (real fields only). */
export function authorPersonSchema(author: Author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: author.url,
    worksFor: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: 'https://www.visitplane.com',
    },
    ...(author.image
      ? { image: `https://www.visitplane.com${author.image}` }
      : {}),
    ...(author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
  }
}
