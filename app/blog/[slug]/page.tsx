import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug, getRelatedPosts, getPostTags, toSlug } from '@/src/lib/posts'
import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { ReadingProgressBar, TableOfContents, SocialShare } from './BlogPostClient'
import {
  getBlogHeroImage,
  getBlogCardImage,
  getArticleInlineImage,
  getDestinationCaption,
  CATEGORY_COLORS,
} from '@/utils/blogPhotos'
import BlogTripBox from '@/components/affiliate/BlogTripBox'
import AffiliateDisclosure from '@/components/affiliate/AffiliateDisclosure'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'
import BlogBreadcrumb from '@/components/blog/BlogBreadcrumb'
import { isInsuranceRequired, affiliateTrackingUrl } from '@/src/lib/affiliates'

// ── Static params ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  const ogUrl = `https://www.visitplane.com/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}&emoji=${encodeURIComponent(post.coverEmoji)}`
  const canonical = `https://www.visitplane.com/blog/${post.slug}`
  const tags = getPostTags(post)

  return {
    title: `${post.title} — VisitPlane Visa Blog`,
    description: post.excerpt.slice(0, 155),
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: canonical,
      siteName: 'VisitPlane',
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ['VisitPlane Editorial'],
      section: post.category,
      tags,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@visitplane',
      creator: '@visitplane',
      title: post.title,
      description: post.excerpt,
      images: [ogUrl],
    },
  }
}

// ── Markdown loader ───────────────────────────────────────────────────────────
async function getPostContent(slug: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(raw)
    const result = await remark().use(remarkHtml).process(content)
    // Inject sequential IDs into h2/h3 tags for TOC scroll-spy
    let idx = 0
    const html = result.toString().replace(/<(h[23])([^>]*)>/g, (_match, tag, rest) => {
      return `<${tag}${rest} id="heading-${idx++}">`
    })
    return html
  } catch {
    return '<p>Content not available.</p>'
  }
}

// ── Split HTML at </h2> boundaries near the given fractions ───────────────────
// Returns up to (fractions.length + 1) parts so we can inject inline photos
// between major sections. Falls back gracefully for short posts.
function splitAtHeadings(html: string, fractions: number[]): string[] {
  const positions: number[] = []
  const re = /<\/h2>/gi
  let m
  while ((m = re.exec(html)) !== null) positions.push(m.index + m[0].length)
  if (positions.length < fractions.length + 1) {
    // Not enough sections — split once near the middle if possible.
    if (positions.length >= 2) {
      const target = Math.floor(html.length * 0.45)
      const best = positions.reduce((p, c) =>
        Math.abs(c - target) < Math.abs(p - target) ? c : p)
      return [html.slice(0, best), html.slice(best)]
    }
    return [html]
  }
  const cuts: number[] = []
  for (const f of fractions) {
    const target = Math.floor(html.length * f)
    let best = positions.reduce((p, c) =>
      Math.abs(c - target) < Math.abs(p - target) ? c : p)
    // Avoid duplicate cut points
    if (cuts.includes(best)) {
      const alt = positions.find((p) => p > best && !cuts.includes(p))
      if (alt) best = alt
    }
    cuts.push(best)
  }
  cuts.sort((a, b) => a - b)
  const parts: string[] = []
  let prev = 0
  for (const c of cuts) { parts.push(html.slice(prev, c)); prev = c }
  parts.push(html.slice(prev))
  return parts
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function ArrowLeft({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const contentHtml = await getPostContent(slug)
  const relatedPosts = getRelatedPosts(slug, 3)
  const parts = splitAtHeadings(contentHtml, [0.33, 0.66])

  const heroImg = getBlogHeroImage(slug)
  const inlineImg = getArticleInlineImage(slug)
  // Second image to break up the article (real photo when key set, else cover).
  const secondaryImg = `/api/photo?slug=${encodeURIComponent(slug)}&v=alt&cb=6`
  const caption = getDestinationCaption(slug)
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }

  // FAQPage JSON-LD schema (only when post has faqs)
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  // BreadcrumbList JSON-LD schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.visitplane.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.category, item: `https://www.visitplane.com/blog/category/${toSlug(post.category)}` },
      { '@type': 'ListItem', position: 4, name: post.title, item: `https://www.visitplane.com/blog/${post.slug}` },
    ],
  }

  // BlogPosting JSON-LD schema
  const wordCount = contentHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const canonicalUrl = `https://www.visitplane.com/blog/${post.slug}`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: `https://www.visitplane.com/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}&emoji=${encodeURIComponent(post.coverEmoji)}`,
    url: canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleSection: post.category,
    keywords: getPostTags(post).join(', '),
    wordCount,
    author: { '@type': 'Organization', name: 'VisitPlane Editorial', url: 'https://www.visitplane.com' },
    publisher: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: 'https://www.visitplane.com',
      logo: { '@type': 'ImageObject', url: 'https://www.visitplane.com/logo-v2.png' },
    },
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased">

      {/* JSON-LD: BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* JSON-LD: Article schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* JSON-LD: FAQPage schema (when faqs present — enables Google rich results) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Preload hero image — critical for LCP score */}
      <link rel="preload" as="image" href={heroImg} fetchPriority="high" />

      {/* Reading progress bar — teal, fixed at very top */}
      <ReadingProgressBar />

      {/* Social share — fixed vertical strip on desktop left */}
      <SocialShare title={post.title} slug={slug} />

      {/* ── STICKY HEADER ────────────────────────────────────────────────── */}{/* ── IMMERSIVE HERO ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '70vh', minHeight: '480px', maxHeight: '780px' }}
      >
        {/* Country photo — LCP element, loaded eagerly */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ pointerEvents: 'none' }}
        />
        {/* Multi-stop gradient — dark at top-left and bottom, lighter in centre */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {/* Back link + category — top-left */}
        <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2 sm:left-8 sm:top-7">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            <ArrowLeft className="h-3 w-3" />
            All Guides
          </Link>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold text-white shadow"
            style={{ backgroundColor: catColor.bg }}
          >
            {post.category}
          </span>
        </div>

        {/* Title + meta — bottom centre */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-10 text-center sm:px-8 sm:pb-14">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {post.readTime}
            </span>
            <span>·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
            <span>·</span>
            <span>VisitPlane Editorial</span>
          </div>
          {/* Scroll indicator */}
          <div className="mt-5 animate-bounce text-lg text-white/50">↓</div>
        </div>
      </div>

      {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <BlogBreadcrumb
          items={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: '/blog' },
            { name: post.category, href: `/blog/category/${toSlug(post.category)}` },
            { name: post.title },
          ]}
        />
      </div>

      {/* ── TWO-COLUMN LAYOUT: article + TOC sidebar ─────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-12 xl:gap-16">

          {/* ── Main article ────────────────────────────────────────────── */}
          <article className="min-w-0 flex-1">

            {/* Author card */}
            <div className="mb-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 shadow-sm">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-xl text-white shadow-sm">
                ✈️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A]">VisitPlane Editorial</p>
                <p className="text-xs text-gray-500">Verified by Official Embassy Sources</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    Updated {new Date(post.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {post.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-[#10B981]">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Embassy-verified
                  </span>
                </div>
              </div>
            </div>

            {/* ── AT A GLANCE — quick-facts card ─────────────────────────── */}
            <div className="mb-10 rounded-2xl border border-[#10B981]/20 bg-gradient-to-br from-[#F0FDF9] to-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#059669]">✈️ At a glance</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Route</p>
                  <p className="text-sm font-bold text-[#0f1419]">{post.coverEmoji} {post.passportCountry} → {post.destinationCountry}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Guide type</p>
                  <p className="text-sm font-bold text-[#0f1419]">{post.category}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Read time</p>
                  <p className="text-sm font-bold text-[#0f1419]">{post.readTime}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Updated</p>
                  <p className="text-sm font-bold text-[#0f1419]">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <Link href={post.visaLink} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#059669] hover:underline">
                Check full {post.passportCountry} → {post.destinationCountry} requirements →
              </Link>
            </div>

            {/* ── Article body — rich prose, with inline photos between sections ── */}
            <div className="blog-prose max-w-none" dangerouslySetInnerHTML={{ __html: parts[0] }} />

            {parts.length > 1 && (
              <figure className="my-12">
                <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inlineImg} alt={caption} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <figcaption className="mt-3 text-center text-sm italic text-gray-400">{caption}</figcaption>
              </figure>
            )}

            {parts.length > 1 && (
              <div className="blog-prose max-w-none" dangerouslySetInnerHTML={{ __html: parts[1] }} />
            )}

            {/* ── MID-ARTICLE EMAIL CTA ──────────────────────────────────── */}
            <div className="my-12">
              <BlogEmailCapture
                variant="inline"
                capturedFrom="blog_post"
                passport={post.passportCountry}
                destination={post.destinationCountry}
              />
            </div>

            {parts.length > 2 && (
              <figure className="my-12">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={secondaryImg} alt={`Travel and visa planning for ${post.destinationCountry}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <figcaption className="mt-3 text-center text-sm italic text-gray-400">Plan your {post.destinationCountry} trip with confidence</figcaption>
              </figure>
            )}

            {parts.length > 2 && (
              <div className="blog-prose max-w-none" dangerouslySetInnerHTML={{ __html: parts[2] }} />
            )}

            {/* ── MID-ARTICLE CTA CARD ──────────────────────────────────── */}
            <div
              className="mt-12 overflow-hidden rounded-3xl p-8 text-center text-white shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #0d9488 100%)' }}
            >
              <div className="mb-2 text-4xl">🛫</div>
              <p className="text-xl font-bold leading-tight">{post.ctaTitle}</p>
              <p className="mt-2 text-sm text-white/80">
                Get instant visa requirements, fees, and processing times — completely free.
              </p>
              <Link
                href={post.visaLink}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0d9488] shadow-lg transition hover:scale-105 hover:shadow-xl"
              >
                Check Visa Requirements →
              </Link>
            </div>

            {/* ── INTERNAL VISA LINKS ───────────────────────────────────── */}
            <div className="mt-12 rounded-2xl border border-[#10B981]/20 bg-[#F0FDF9] p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#059669] mb-3">
                📋 Check Visa Requirements
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={post.visaLink}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#059669] transition"
                >
                  {post.passportCountry} → {post.destinationCountry} Requirements →
                </Link>
                <Link
                  href={`/visa-free-countries-for-${post.passportCountry.toLowerCase().replace(/\s+/g, '-')}-passport`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981] px-4 py-2 text-sm font-semibold text-[#10B981] hover:bg-[#10B981]/10 transition"
                >
                  All Visa-Free for {post.passportCountry} →
                </Link>
                <Link
                  href={`/visa-requirements-for-${post.passportCountry.toLowerCase().replace(/\s+/g, '-')}-citizens`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#10B981]/40 transition"
                >
                  Full Requirements Matrix →
                </Link>
                <Link
                  href="/checklist"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#10B981]/40 transition"
                >
                  Document Checklist →
                </Link>
              </div>
            </div>

            {/* ── FAQ SECTION ───────────────────────────────────────────────── */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {post.faqs.map(({ q, a }) => (
                    <details
                      key={q}
                      className="group rounded-xl border border-gray-200 bg-white open:shadow-sm transition-shadow"
                    >
                      <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4">
                        <span className="font-semibold text-[#1A1A1A] text-sm leading-snug">{q}</span>
                        <span className="mt-0.5 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                        {a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAGS ──────────────────────────────────────────────────────── */}
            <div className="mt-12 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Tags:</span>
              {getPostTags(post).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${toSlug(tag)}`}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-[#10B981]/10 hover:text-[#10B981]"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* ── AFFILIATE: Recommended for this trip ────────────────────── */}
            <BlogTripBox
              destinationName={post.destinationCountry}
              passportCountry={post.passportCountry}
              blogSlug={slug}
            />

            {/* ── AFFILIATE: Inline insurance callout (Schengen only) ─────── */}
            {isInsuranceRequired(post.destinationCountry) && (
              <div className="mt-8 rounded-xl border border-red-200 bg-red-50/60 p-4 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">⚠️</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-700">
                    Required: Travel insurance covering {post.destinationCountry}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Your {post.destinationCountry} visa application requires proof of travel
                    insurance covering €30,000+ medical emergencies. SafetyWing meets all
                    Schengen requirements from $1.50/day.
                  </p>
                  <a
                    href={affiliateTrackingUrl('safetywing', {
                      placement: 'blog_post',
                      blogSlug: slug,
                    })}
                    rel="nofollow sponsored"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                  >
                    Get quote — meets Schengen requirements →
                  </a>
                </div>
              </div>
            )}

            {/* Social share (mobile — inline below FAQ) */}
            <SocialShare title={post.title} slug={slug} />

            {/* ── ABOUT VISITPLANE — brand + internal links ─────────────────── */}
            <div className="mt-12 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-2xl text-white shadow-sm">
                  ✈️
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#0f1419]">About VisitPlane</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    <strong className="text-[#0f1419]">VisitPlane</strong> is a free visa-requirements
                    platform covering 197 countries. The VisitPlane Editorial team verifies every
                    route against official embassy and government sources, so you get accurate,
                    up-to-date guidance — no signup required. Explore more VisitPlane tools below.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={post.visaLink} className="rounded-full bg-[#10B981] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#059669]">
                      {post.passportCountry} → {post.destinationCountry} requirements →
                    </Link>
                    <Link href="/wizard" className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-[#10B981]/40">
                      VisitPlane Visa Wizard
                    </Link>
                    <Link href="/passport-strength" className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-[#10B981]/40">
                      Passport Strength
                    </Link>
                    <Link href="/destinations" className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-[#10B981]/40">
                      All destinations
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BRAND TAGLINE ────────────────────────────────────────────── */}
            <p className="mt-12 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
              <strong className="text-[#10B981]">VisitPlane</strong> — visa requirements, decoded
              in seconds. Free, accurate, always updated.{' '}
              <Link href="/destinations" className="font-semibold text-[#10B981] hover:underline">
                Check your visa requirements →
              </Link>
            </p>

          </article>

          {/* ── TOC Sidebar (desktop only) ─────────────────────────────── */}
          <aside className="hidden w-64 flex-shrink-0 xl:block">
            <TableOfContents contentHtml={contentHtml} />
          </aside>
        </div>
      </div>

      {/* ── AFFILIATE DISCLOSURE ───────────────────────────────────────────── */}
      <AffiliateDisclosure />

      {/* ── RELATED POSTS ──────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-1 text-2xl font-bold text-[#1A1A1A]">Related Visa Guides</h2>
          <p className="mb-8 text-sm text-gray-500">
            More guides for {post.passportCountry} passport holders and {post.destinationCountry} travelers
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => {
              const relCat = CATEGORY_COLORS[related.category] ?? { bg: '#0d9488', text: '#fff' }
              return (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-[#10B981]/30"
                >
                  {/* Photo */}
                  <div className="relative h-44 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${getBlogCardImage(related.slug)})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                    {/* Category badge */}
                    <div className="absolute left-3 top-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
                        style={{ backgroundColor: relCat.bg }}
                      >
                        {related.category}
                      </span>
                    </div>
                    {/* Title overlaid on photo bottom */}
                    <p className="absolute bottom-3 left-3 right-3 text-sm font-bold leading-snug text-white line-clamp-2 drop-shadow">
                      {related.title}
                    </p>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">
                      {related.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{related.readTime}</span>
                      <span className="text-xs font-semibold text-[#10B981] transition group-hover:text-[#059669]">
                        Read more →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[#10B981] px-6 py-2.5 text-sm font-semibold text-[#10B981] transition hover:bg-[#10B981] hover:text-white"
            >
              View all visa guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section></div>
  )
}
