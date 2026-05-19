import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug } from '@/src/lib/posts'
import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

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
  return {
    title: `${post.title} — VisitPlane Blog`,
    description: post.excerpt,
  }
}

// ── Markdown loader ───────────────────────────────────────────────────────────
async function getPostContent(slug: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(raw)
    const result = await remark().use(remarkHtml).process(content)
    return result.toString()
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

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] antialiased">

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
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="transition hover:text-gray-600">Home</Link>
            <span>/</span>
            <Link href="/blog" className="transition hover:text-gray-600">Blog</Link>
            <span>/</span>
            <span className="truncate text-gray-600">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

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

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-medium text-[#10B981] ring-1 ring-inset ring-[#10B981]/20">
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
        <h1 className="mb-8 text-3xl font-semibold leading-tight tracking-tight text-[#1A1A1A] sm:text-4xl">
          {post.title}
        </h1>

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

        {/* CTA card */}
        <div className="mt-12 rounded-2xl border border-[#10B981]/20 bg-gradient-to-br from-[#F0FDF4] to-white p-8 text-center">
          <p className="text-lg font-semibold text-[#1A1A1A]">
            Ready to check your visa requirements?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Get instant, accurate visa information for 197 countries — completely free.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#059669]"
          >
            Check Visa Requirements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      {/* Related posts */}
      <section className="border-t border-gray-100 bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-semibold text-[#1A1A1A]">More Visa Guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#10B981]/30 hover:shadow-md"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#F0FDF4] text-2xl">
                  {related.coverEmoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981] line-clamp-2">
                    {related.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{related.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#10B981] transition hover:text-[#059669]"
            >
              View all posts
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
