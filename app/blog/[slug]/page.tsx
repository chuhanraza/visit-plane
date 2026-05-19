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

// ── Static params ────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

// ── Metadata ─────────────────────────────────────────────────────────────────
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
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogUrl],
    },
  }
}

// ── Markdown loader with heading IDs ─────────────────────────────────────────
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
    author: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: 'https://visitplane.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VisitPlane',
      url: 'https://visitplane.com',
    },
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased">

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Reading progress bar (client, fixed above everything) */}
      <ReadingProgressBar />

      {/* Social share (client, fixed on desktop left side) */}
      <SocialShare title={post.title} slug={slug} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1A1A1A]">Visit</span>
              <span className="text-[#10B981]">Plane</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/destinations" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Explore</Link>
            <Link href="/visa-requirements" className="text-sm text-gray-500 transition hover:text-[#1A1A1A]">Visa Requirements</Link>
            <Link href="/blog" className="text-sm font-medium text-[#10B981]">Blog</Link>
          </nav>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-[#10B981] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#059669]"
          >
            Check Visa
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="transition hover:text-gray-600">Home</Link>
            <span>/</span>
            <Link href="/blog" className="transition hover:text-gray-600">Blog</Link>
            <span>/</span>
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="transition hover:text-gray-600">{post.category}</Link>
            <span>/</span>
            <span className="truncate text-gray-600">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Two-column layout: Article + TOC sidebar */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-12 xl:gap-16">

          {/* Main article column */}
          <article className="min-w-0 flex-1">

            {/* Back link */}
            <Link
              href="/blog"
              className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#10B981]"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              Back to all posts
            </Link>

            {/* Cover emoji */}
            <div className="mb-8 flex h-48 items-center justify-center rounded-3xl bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] text-8xl shadow-sm">
              {post.coverEmoji}
            </div>

            {/* Category + Meta */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-[#10B981] ring-1 ring-inset ring-[#10B981]/20">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">{post.readTime}</span>
              <time className="text-xs text-gray-400" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-3xl font-semibold leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
              {post.title}
            </h1>

            {/* ── AUTHOR CARD ─────────────────────────────────────────────── */}
            <div className="mb-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
              {/* Avatar */}
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-xl text-white shadow-sm">
                ✈️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A]">VisitPlane Visa Team</p>
                <p className="text-xs text-gray-500">
                  Verified by Official Embassy Sources
                </p>
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

            {/* Markdown content */}
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#1A1A1A]
                prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl
                prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-li:text-gray-600
                prose-strong:text-[#1A1A1A] prose-strong:font-semibold
                prose-a:text-[#10B981] prose-a:no-underline hover:prose-a:underline
                prose-ul:my-4 prose-ol:my-4
                prose-hr:border-gray-200"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* ── VISA CHECKER CTA CARD ───────────────────────────────────── */}
            <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#4F46E5] p-8 text-center text-white shadow-lg">
              <div className="mb-2 text-3xl">🛂</div>
              <p className="text-xl font-bold leading-tight">{post.ctaTitle}</p>
              <p className="mt-2 text-sm text-white/80">
                Get instant visa requirements, fees, and processing times — free.
              </p>
              <Link
                href={post.visaLink}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0D9488] shadow-sm transition hover:bg-gray-50 hover:shadow-md"
              >
                Check Visa Requirements →
              </Link>
            </div>

            {/* Social share (mobile, renders inline below CTA) */}
            <SocialShare title={post.title} slug={slug} />

          </article>

          {/* ── TOC Sidebar (desktop only) ─────────────────────────────────── */}
          <aside className="hidden w-64 flex-shrink-0 xl:block">
            <TableOfContents contentHtml={contentHtml} />
          </aside>
        </div>
      </div>

      {/* ── RELATED POSTS ───────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-xl font-semibold text-[#1A1A1A]">Related Visa Guides</h2>
          <p className="mb-8 text-sm text-gray-500">
            More guides for {post.passportCountry} passport holders and {post.destinationCountry} travelers
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#10B981]/30 hover:shadow-md"
              >
                {/* Mini cover */}
                <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] text-5xl">
                  {related.coverEmoji}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="inline-flex w-fit items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-semibold text-[#10B981] ring-1 ring-inset ring-[#10B981]/20">
                    {related.category}
                  </span>
                  <p className="text-sm font-semibold leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981] line-clamp-2">
                    {related.title}
                  </p>
                  <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">
                    {related.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400">{related.readTime}</span>
                    <span className="text-xs font-semibold text-[#10B981]">Read more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#10B981] transition hover:text-[#059669]"
            >
              View all visa guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-v2.png" alt="VisitPlane" width={20} height={20} className="rounded" />
            <span>
              <span className="text-gray-600">Visit</span>
              <span className="text-[#10B981]">Plane</span>
              <span className="ml-2">© {new Date().getFullYear()}</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="transition hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="transition hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
