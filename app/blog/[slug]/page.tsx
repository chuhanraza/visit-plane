import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug, getRelatedPosts } from '@/src/lib/posts'
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

  const ogUrl = `https://visitplane.com/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}&emoji=${encodeURIComponent(post.coverEmoji)}`

  return {
    title: `${post.title} — VisitPlane Visa Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://visitplane.com/blog/${post.slug}`,
      publishedTime: post.date,
      authors: ['VisitPlane Visa Team'],
      images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
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

// ── Split HTML for inline photo injection ─────────────────────────────────────
// Finds the </h2> boundary closest to the 40 % mark and splits there.
function splitAtMidHeading(html: string): [string, string] {
  const positions: number[] = []
  const re = /<\/h2>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    positions.push(m.index + m[0].length)
  }
  if (positions.length < 2) return [html, '']
  const target = Math.floor(html.length * 0.4)
  const best = positions.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
  )
  return [html.substring(0, best), html.substring(best)]
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
  const [part1, part2] = splitAtMidHeading(contentHtml)

  const heroImg = getBlogHeroImage(slug)
  const inlineImg = getArticleInlineImage(slug)
  const caption = getDestinationCaption(slug)
  const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }

  // Article JSON-LD schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: `https://visitplane.com/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}&emoji=${encodeURIComponent(post.coverEmoji)}`,
    url: `https://visitplane.com/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'VisitPlane', url: 'https://visitplane.com' },
    publisher: { '@type': 'Organization', name: 'VisitPlane', url: 'https://visitplane.com' },
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased">

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Reading progress bar — teal, fixed at very top */}
      <ReadingProgressBar />

      {/* Social share — fixed vertical strip on desktop left */}
      <SocialShare title={post.title} slug={slug} />

      {/* ── STICKY HEADER ────────────────────────────────────────────────── */}{/* ── IMMERSIVE HERO ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '70vh', minHeight: '480px', maxHeight: '780px' }}
      >
        {/* Country photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
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
            <span>VisitPlane Visa Team</span>
          </div>
          {/* Scroll indicator */}
          <div className="mt-5 animate-bounce text-lg text-white/50">↓</div>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT: article + TOC sidebar ─────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-12 xl:gap-16">

          {/* ── Main article ────────────────────────────────────────────── */}
          <article className="min-w-0 flex-1">

            {/* Author card */}
            <div className="mb-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 shadow-sm">
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-xl text-white shadow-sm">
                ✈️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A]">VisitPlane Visa Team</p>
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

            {/* ── Article part 1 ─────────────────────────────────────────── */}
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#111827]
                prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl prose-h2:text-[#111827]
                prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
                prose-p:text-[#374151] prose-p:leading-[1.85] prose-p:text-lg
                prose-li:text-[#374151] prose-li:leading-relaxed
                prose-strong:text-[#111827] prose-strong:font-semibold
                prose-a:text-[#0d9488] prose-a:no-underline hover:prose-a:underline
                prose-ul:my-4 prose-ol:my-4
                prose-hr:border-gray-200"
              dangerouslySetInnerHTML={{ __html: part1 }}
            />

            {/* ── INLINE COUNTRY PHOTO ───────────────────────────────────── */}
            {part2 && (
              <div className="my-12">
                <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inlineImg}
                    alt={caption}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 text-center text-sm italic text-gray-400">{caption}</p>
              </div>
            )}

            {/* ── Article part 2 ─────────────────────────────────────────── */}
            {part2 && (
              <div
                className="prose prose-gray max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#111827]
                  prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl
                  prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
                  prose-p:text-[#374151] prose-p:leading-[1.85] prose-p:text-lg
                  prose-li:text-[#374151] prose-li:leading-relaxed
                  prose-strong:text-[#111827] prose-strong:font-semibold
                  prose-a:text-[#0d9488] prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-4 prose-ol:my-4
                  prose-hr:border-gray-200"
                dangerouslySetInnerHTML={{ __html: part2 }}
              />
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

            {/* Social share (mobile — inline below CTA) */}
            <SocialShare title={post.title} slug={slug} />

          </article>

          {/* ── TOC Sidebar (desktop only) ─────────────────────────────── */}
          <aside className="hidden w-64 flex-shrink-0 xl:block">
            <TableOfContents contentHtml={contentHtml} />
          </aside>
        </div>
      </div>

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
