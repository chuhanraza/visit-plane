export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  category: string
  readTime: string
  coverEmoji: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'schengen-visa-guide-pakistani-travelers-2026',
    title: 'Schengen Visa Guide for Pakistani Travelers 2026',
    date: '2026-05-01',
    excerpt:
      'Planning a European adventure? This comprehensive guide walks Pakistani citizens through every step of the Schengen Visa process — eligibility, documents, costs, and timelines.',
    category: 'Schengen',
    readTime: '8 min read',
    coverEmoji: '🇪🇺',
  },
  {
    slug: 'dubai-tourist-visa-complete-guide-indians',
    title: 'Dubai Tourist Visa: Complete Guide for Indians',
    date: '2026-05-02',
    excerpt:
      'Dubai is one of the most visited destinations for Indian travelers. This complete guide covers eligibility, documentation, processing times, and costs for a Dubai Tourist Visa.',
    category: 'UAE',
    readTime: '7 min read',
    coverEmoji: '🇦🇪',
  },
  {
    slug: 'uk-student-visa-requirements-2026',
    title: 'UK Student Visa Requirements 2026: Complete Guide',
    date: '2026-05-03',
    excerpt:
      'Dreaming of studying at Oxford or LSE? This guide covers all UK Student Visa requirements for 2026, including eligibility, documents, processing timelines, and costs.',
    category: 'United Kingdom',
    readTime: '8 min read',
    coverEmoji: '🇬🇧',
  },
  {
    slug: 'canada-tourist-visa-pakistanis-step-by-step',
    title: 'Canada Tourist Visa for Pakistanis: Step by Step',
    date: '2026-05-04',
    excerpt:
      'Canada is a dream destination for Pakistani travelers. This step-by-step guide provides complete information on the Temporary Resident Visa — requirements, process, costs, and tips.',
    category: 'Canada',
    readTime: '8 min read',
    coverEmoji: '🇨🇦',
  },
  {
    slug: 'australia-work-visa-guide-indians-2026',
    title: 'Australia Work Visa Guide for Indians 2026',
    date: '2026-05-05',
    excerpt:
      'Australia attracts thousands of Indian professionals every year. This comprehensive guide covers visa categories, eligibility, skills assessment, processing timelines, and costs.',
    category: 'Australia',
    readTime: '9 min read',
    coverEmoji: '🇦🇺',
  },
  {
    slug: 'germany-job-seeker-visa-complete-requirements',
    title: 'Germany Job Seeker Visa: Complete Requirements',
    date: '2026-05-06',
    excerpt:
      "Germany's Job Seeker Visa lets skilled professionals enter Europe's largest economy to find employment. This guide covers eligibility, documentation, timelines, and costs.",
    category: 'Germany',
    readTime: '7 min read',
    coverEmoji: '🇩🇪',
  },
  {
    slug: 'japan-tourist-visa-pakistanis-how-to-apply',
    title: 'Japan Tourist Visa for Pakistanis: How to Apply',
    date: '2026-05-07',
    excerpt:
      'Japan blends ancient tradition with futuristic technology. This guide walks Pakistani citizens through the complete Japan Tourist Visa application process, requirements, and costs.',
    category: 'Japan',
    readTime: '8 min read',
    coverEmoji: '🇯🇵',
  },
  {
    slug: 'usa-student-visa-f1-complete-guide-2026',
    title: 'USA Student Visa (F1): Complete Guide 2026',
    date: '2026-05-08',
    excerpt:
      "The F-1 Visa opens doors to America's world-class universities. This complete guide covers eligibility, documentation, SEVIS fees, interview tips, and OPT privileges.",
    category: 'United States',
    readTime: '9 min read',
    coverEmoji: '🇺🇸',
  },
  {
    slug: 'uae-residence-visa-complete-requirements-guide',
    title: 'UAE Residence Visa: Complete Requirements Guide',
    date: '2026-05-09',
    excerpt:
      'The UAE Residence Visa is essential for anyone planning to live and work in the Emirates. This guide covers visa categories, eligibility, documentation, timelines, and costs.',
    category: 'UAE',
    readTime: '8 min read',
    coverEmoji: '🇦🇪',
  },
  {
    slug: 'schengen-visa-indians-requirements-tips',
    title: 'Schengen Visa for Indians: Requirements & Tips',
    date: '2026-05-10',
    excerpt:
      "The Schengen Visa lets Indian citizens access 27 European countries with a single visa. This guide covers eligibility, documentation, step-by-step procedures, and insider tips.",
    category: 'Schengen',
    readTime: '9 min read',
    coverEmoji: '🇪🇺',
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
