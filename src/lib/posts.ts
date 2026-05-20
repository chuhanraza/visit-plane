export type BlogCategory =
  | 'Visa Guides'
  | 'Country Guides'
  | 'Interview Prep'
  | 'Document Help'
  | 'Travel Tips'

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  category: BlogCategory
  readTime: string
  coverEmoji: string
  passportCountry: string
  destinationCountry: string
  visaLink: string
  ctaTitle: string
  /** Optional hero/card photo — resolved via utils/blogPhotos if not set */
  heroImage?: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'schengen-visa-guide-pakistani-travelers-2026',
    title: 'Schengen Visa Guide for Pakistani Travelers 2026',
    date: '2026-05-01',
    excerpt:
      'Planning a European adventure? This comprehensive guide walks Pakistani citizens through every step of the Schengen Visa process — eligibility, documents, costs, and timelines.',
    category: 'Visa Guides',
    readTime: '8 min read',
    coverEmoji: '🇪🇺',
    passportCountry: 'Pakistan',
    destinationCountry: 'Germany',
    visaLink: '/visa/Pakistan/Germany',
    ctaTitle: 'Check Pakistan to Schengen Visa Requirements',
  },
  {
    slug: 'dubai-tourist-visa-complete-guide-indians',
    title: 'Dubai Tourist Visa: Complete Guide for Indians',
    date: '2026-05-02',
    excerpt:
      'Dubai is one of the most visited destinations for Indian travelers. This complete guide covers eligibility, documentation, processing times, and costs for a Dubai Tourist Visa.',
    category: 'Country Guides',
    readTime: '7 min read',
    coverEmoji: '🇦🇪',
    passportCountry: 'India',
    destinationCountry: 'United Arab Emirates',
    visaLink: '/visa/India/United%20Arab%20Emirates',
    ctaTitle: 'Check India to UAE Visa Requirements',
  },
  {
    slug: 'uk-student-visa-requirements-2026',
    title: 'UK Student Visa Requirements 2026: Complete Guide',
    date: '2026-05-03',
    excerpt:
      'Dreaming of studying at Oxford or LSE? This guide covers all UK Student Visa requirements for 2026, including eligibility, documents, processing timelines, and costs.',
    category: 'Document Help',
    readTime: '8 min read',
    coverEmoji: '🇬🇧',
    passportCountry: 'India',
    destinationCountry: 'United Kingdom',
    visaLink: '/visa/India/United%20Kingdom',
    ctaTitle: 'Check India to UK Visa Requirements',
  },
  {
    slug: 'canada-tourist-visa-pakistanis-step-by-step',
    title: 'Canada Tourist Visa for Pakistanis: Step by Step',
    date: '2026-05-04',
    excerpt:
      'Canada is a dream destination for Pakistani travelers. This step-by-step guide provides complete information on the Temporary Resident Visa — requirements, process, costs, and tips.',
    category: 'Visa Guides',
    readTime: '8 min read',
    coverEmoji: '🇨🇦',
    passportCountry: 'Pakistan',
    destinationCountry: 'Canada',
    visaLink: '/visa/Pakistan/Canada',
    ctaTitle: 'Check Pakistan to Canada Visa Requirements',
  },
  {
    slug: 'australia-work-visa-guide-indians-2026',
    title: 'Australia Work Visa Guide for Indians 2026',
    date: '2026-05-05',
    excerpt:
      'Australia attracts thousands of Indian professionals every year. This comprehensive guide covers visa categories, eligibility, skills assessment, processing timelines, and costs.',
    category: 'Visa Guides',
    readTime: '9 min read',
    coverEmoji: '🇦🇺',
    passportCountry: 'India',
    destinationCountry: 'Australia',
    visaLink: '/visa/India/Australia',
    ctaTitle: 'Check India to Australia Visa Requirements',
  },
  {
    slug: 'germany-job-seeker-visa-complete-requirements',
    title: 'Germany Job Seeker Visa: Complete Requirements',
    date: '2026-05-06',
    excerpt:
      "Germany's Job Seeker Visa lets skilled professionals enter Europe's largest economy to find employment. This guide covers eligibility, documentation, timelines, and costs.",
    category: 'Visa Guides',
    readTime: '7 min read',
    coverEmoji: '🇩🇪',
    passportCountry: 'Pakistan',
    destinationCountry: 'Germany',
    visaLink: '/visa/Pakistan/Germany',
    ctaTitle: 'Check Pakistan to Germany Visa Requirements',
  },
  {
    slug: 'japan-tourist-visa-pakistanis-how-to-apply',
    title: 'Japan Tourist Visa for Pakistanis: How to Apply',
    date: '2026-05-07',
    excerpt:
      'Japan blends ancient tradition with futuristic technology. This guide walks Pakistani citizens through the complete Japan Tourist Visa application process, requirements, and costs.',
    category: 'Country Guides',
    readTime: '8 min read',
    coverEmoji: '🇯🇵',
    passportCountry: 'Pakistan',
    destinationCountry: 'Japan',
    visaLink: '/visa/Pakistan/Japan',
    ctaTitle: 'Check Pakistan to Japan Visa Requirements',
  },
  {
    slug: 'usa-student-visa-f1-complete-guide-2026',
    title: 'USA Student Visa (F1): Complete Guide 2026',
    date: '2026-05-08',
    excerpt:
      "The F-1 Visa opens doors to America's world-class universities. This complete guide covers eligibility, documentation, SEVIS fees, interview tips, and OPT privileges.",
    category: 'Interview Prep',
    readTime: '9 min read',
    coverEmoji: '🇺🇸',
    passportCountry: 'India',
    destinationCountry: 'United States',
    visaLink: '/visa/India/United%20States',
    ctaTitle: 'Check India to USA Visa Requirements',
  },
  {
    slug: 'uae-residence-visa-complete-requirements-guide',
    title: 'UAE Residence Visa: Complete Requirements Guide',
    date: '2026-05-09',
    excerpt:
      'The UAE Residence Visa is essential for anyone planning to live and work in the Emirates. This guide covers visa categories, eligibility, documentation, timelines, and costs.',
    category: 'Country Guides',
    readTime: '8 min read',
    coverEmoji: '🇦🇪',
    passportCountry: 'Pakistan',
    destinationCountry: 'United Arab Emirates',
    visaLink: '/visa/Pakistan/United%20Arab%20Emirates',
    ctaTitle: 'Check Pakistan to UAE Visa Requirements',
  },
  {
    slug: 'schengen-visa-indians-requirements-tips',
    title: 'Schengen Visa for Indians: Requirements & Tips',
    date: '2026-05-10',
    excerpt:
      "The Schengen Visa lets Indian citizens access 27 European countries with a single visa. This guide covers eligibility, documentation, step-by-step procedures, and insider tips.",
    category: 'Visa Guides',
    readTime: '9 min read',
    coverEmoji: '🇪🇺',
    passportCountry: 'India',
    destinationCountry: 'Germany',
    visaLink: '/visa/India/Germany',
    ctaTitle: 'Check India to Schengen Visa Requirements',
  },
  {
    slug: 'schengen-visa-nigerians',
    title: 'Schengen Visa for Nigerians: Complete 2026 Guide',
    date: '2026-05-20',
    excerpt:
      'Everything Nigerian passport holders need to know about applying for a Schengen visa in 2026, including eligibility, documents, processing times, and insider tips for approval.',
    category: 'Visa Guides',
    readTime: '8 min read',
    coverEmoji: '🇪🇺',
    passportCountry: 'Nigeria',
    destinationCountry: 'Germany',
    visaLink: '/visa/Nigeria/Germany',
    ctaTitle: 'Check Schengen Visa Requirements for Nigerians',
  },
  {
    slug: 'thailand-visa-indians',
    title: 'Thailand Tourist Visa for Indians: Everything You Need',
    date: '2026-05-20',
    excerpt:
      'Complete guide for Indian travelers planning to visit Thailand, covering visa types, requirements, processing times, and expert tips for a smooth application.',
    category: 'Country Guides',
    readTime: '8 min read',
    coverEmoji: '🇹🇭',
    passportCountry: 'India',
    destinationCountry: 'Thailand',
    visaLink: '/visa/India/Thailand',
    ctaTitle: 'Check India to Thailand Visa Requirements',
  },
  {
    slug: 'malaysia-visa-pakistanis',
    title: 'Malaysia Visa for Pakistanis: Entry Requirements 2026',
    date: '2026-05-20',
    excerpt:
      'Complete entry requirements for Pakistani passport holders visiting Malaysia, covering visa options, documents needed, processing procedures, and approval tips.',
    category: 'Visa Guides',
    readTime: '8 min read',
    coverEmoji: '🇲🇾',
    passportCountry: 'Pakistan',
    destinationCountry: 'Malaysia',
    visaLink: '/visa/Pakistan/Malaysia',
    ctaTitle: 'Check Pakistan to Malaysia Visa Requirements',
  },
  {
    slug: 'turkey-evisa-indians',
    title: 'Turkey e-Visa Guide for Indians: Apply in Minutes',
    date: '2026-05-20',
    excerpt:
      'Quickest way for Indians to visit Turkey - apply for an e-Visa online in minutes. Complete guide covering requirements, costs, processing time, and travel tips.',
    category: 'Visa Guides',
    readTime: '8 min read',
    coverEmoji: '🇹🇷',
    passportCountry: 'India',
    destinationCountry: 'Turkey',
    visaLink: '/visa/India/Turkey',
    ctaTitle: 'Check India to Turkey Visa Requirements',
  },
  {
    slug: 'canada-student-visa-indians',
    title: 'Canada Student Visa for Indians: Complete Process',
    date: '2026-05-20',
    excerpt:
      'Comprehensive guide for Indian students applying for Canadian study permits, covering eligibility, documentation, timeline, and approval strategies for 2026.',
    category: 'Document Help',
    readTime: '9 min read',
    coverEmoji: '🇨🇦',
    passportCountry: 'India',
    destinationCountry: 'Canada',
    visaLink: '/visa/India/Canada',
    ctaTitle: 'Check India to Canada Student Visa Requirements',
  },
  {
    slug: 'dubai-work-visa-pakistanis',
    title: 'Dubai Work Visa for Pakistani Workers 2026',
    date: '2026-05-20',
    excerpt:
      'Complete guide for Pakistani professionals seeking employment in Dubai, covering visa types, requirements, employer sponsorship, processing timeline, and salary expectations.',
    category: 'Visa Guides',
    readTime: '9 min read',
    coverEmoji: '🇦🇪',
    passportCountry: 'Pakistan',
    destinationCountry: 'United Arab Emirates',
    visaLink: '/visa/Pakistan/United%20Arab%20Emirates',
    ctaTitle: 'Check Pakistan to Dubai Work Visa Requirements',
  },
  {
    slug: 'uk-skilled-worker-visa-indians',
    title: 'UK Skilled Worker Visa for Indians 2026',
    date: '2026-05-20',
    excerpt:
      'Complete guide for Indian professionals applying for UK Skilled Worker Visa, covering eligibility, required documents, points system, employer sponsorship, and approval tips.',
    category: 'Visa Guides',
    readTime: '9 min read',
    coverEmoji: '🇬🇧',
    passportCountry: 'India',
    destinationCountry: 'United Kingdom',
    visaLink: '/visa/India/United%20Kingdom',
    ctaTitle: 'Check India to UK Skilled Worker Visa Requirements',
  },
  {
    slug: 'schengen-visa-bangladeshis',
    title: 'Schengen Visa for Bangladeshis: Step by Step',
    date: '2026-05-20',
    excerpt:
      'Complete step-by-step guide for Bangladeshi passport holders applying for Schengen visa, covering requirements, documents, interviews, and insider approval tips.',
    category: 'Visa Guides',
    readTime: '8 min read',
    coverEmoji: '🇪🇺',
    passportCountry: 'Bangladesh',
    destinationCountry: 'Germany',
    visaLink: '/visa/Bangladesh/Germany',
    ctaTitle: 'Check Schengen Visa Requirements for Bangladeshis',
  },
  {
    slug: 'south-korea-visa-indians',
    title: 'South Korea Tourist Visa for Indians 2026',
    date: '2026-05-20',
    excerpt:
      'Complete guide for Indian travelers applying for South Korea tourist visa, covering entry requirements, documents needed, processing times, and approval tips for 2026.',
    category: 'Country Guides',
    readTime: '8 min read',
    coverEmoji: '🇰🇷',
    passportCountry: 'India',
    destinationCountry: 'South Korea',
    visaLink: '/visa/India/South%20Korea',
    ctaTitle: 'Check India to South Korea Visa Requirements',
  },
  {
    slug: 'singapore-visa-pakistanis',
    title: 'Singapore Visa for Pakistanis: Full Guide',
    date: '2026-05-20',
    excerpt:
      'Complete guide for Pakistani travelers applying for Singapore visit visa, covering eligibility, required documents, online application, processing time, and approval tips.',
    category: 'Country Guides',
    readTime: '8 min read',
    coverEmoji: '🇸🇬',
    passportCountry: 'Pakistan',
    destinationCountry: 'Singapore',
    visaLink: '/visa/Pakistan/Singapore',
    ctaTitle: 'Check Pakistan to Singapore Visa Requirements',
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

/** Returns up to 3 related posts scored by passport/destination/category overlap */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug)
  if (!current) return []

  return blogPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0
      if (p.passportCountry === current.passportCountry) score += 2
      if (p.destinationCountry === current.destinationCountry) score += 2
      if (p.category === current.category) score += 1
      return { post: p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post)
}
