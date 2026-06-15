import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getAllCategories,
  categoryFromSlug,
  getPostsByCategory,
  toSlug,
  type BlogCategory,
} from '@/src/lib/posts'
import BlogBreadcrumb from '@/components/blog/BlogBreadcrumb'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'
import PostGrid from '@/components/blog/PostGrid'

const CATEGORY_INTRO: Record<BlogCategory, string> = {
  'Visa Guides':
    'Step-by-step visa guides for every major route — eligibility, documents, fees, processing times, and approval tips, verified against official embassy sources.',
  'Country Guides':
    'Destination-by-destination travel and visa guides covering entry rules, requirements, and what to expect on arrival.',
  'Document Help':
    'Get your paperwork right the first time — cover letters, proof of funds, dummy tickets, and the documents embassies actually want.',
  'Travel Tips':
    'Practical, insider knowledge for travelers — visa-free routes, cheapest destinations, and tips that save time and money.',
  'Interview Prep':
    'Walk into your visa interview prepared — common questions, what officers look for, and how to answer with confidence.',
}

export function generateStaticParams() {
  return getAllCategories().map((c) => ({ category: toSlug(c) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const name = categoryFromSlug(category)
  if (!name) return { title: 'Category Not Found' }
  const canonical = `https://www.visitplane.com/blog/category/${category}`
  return {
    title: `${name} — VisitPlane Visa Blog`,
    description: CATEGORY_INTRO[name].slice(0, 155),
    alternates: { canonical },
    openGraph: {
      title: `${name} — VisitPlane Visa Blog`,
      description: CATEGORY_INTRO[name],
      type: 'website',
      url: canonical,
      siteName: 'VisitPlane',
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const name = categoryFromSlug(category)
  if (!name) notFound()

  const posts = getPostsByCategory(name)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] antialiased">
      <section
        className="px-4 py-14 text-white sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #0d9488 100%)' }}
      >
        <div className="mx-auto max-w-5xl">
          <BlogBreadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Blog', href: '/blog' },
              { name },
            ]}
          />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            {CATEGORY_INTRO[name]}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/50">
            {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PostGrid posts={posts} />

        <div className="mt-16">
          <BlogEmailCapture capturedFrom="blog_category" variant="strip" />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-[#10B981] px-6 py-2.5 text-sm font-semibold text-[#10B981] transition hover:bg-[#10B981] hover:text-white"
          >
            ← All visa guides
          </Link>
        </div>
      </div>
    </div>
  )
}
