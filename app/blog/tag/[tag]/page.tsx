import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllTags, tagFromSlug, getPostsByTag } from '@/src/lib/posts'
import BlogBreadcrumb from '@/components/blog/BlogBreadcrumb'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'
import PostGrid from '@/components/blog/PostGrid'

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const name = tagFromSlug(tag)
  if (!name) return { title: 'Tag Not Found' }
  const canonical = `https://www.visitplane.com/blog/tag/${tag}`
  const description = `Visa guides and travel articles tagged “${name}” — verified against official sources by the VisitPlane Editorial team.`
  return {
    title: `${name} — VisitPlane Visa Blog`,
    description: description.slice(0, 155),
    alternates: { canonical },
    openGraph: {
      title: `${name} visa guides — VisitPlane`,
      description,
      type: 'website',
      url: canonical,
      siteName: 'VisitPlane',
    },
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params
  const name = tagFromSlug(tag)
  if (!name) notFound()

  const posts = getPostsByTag(tag)
  const relatedTags = getAllTags().filter((t) => t.slug !== tag).slice(0, 12)

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
              { name: `#${name}` },
            ]}
          />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            All VisitPlane guides tagged <strong>{name}</strong>.
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/50">
            {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PostGrid posts={posts} />

        {relatedTags.length > 0 && (
          <div className="mt-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Browse other tags
            </p>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/blog/tag/${t.slug}`}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 transition hover:text-[#10B981] hover:ring-[#10B981]/40"
                >
                  {t.tag} <span className="text-gray-300">{t.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16">
          <BlogEmailCapture capturedFrom="blog_tag" variant="strip" />
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
