import Link from 'next/link'
import { type BlogPost } from '@/src/lib/posts'
import { getBlogCardImage, CATEGORY_COLORS } from '@/utils/blogPhotos'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Server-rendered responsive grid of blog post cards (used on landing pages). */
export default function PostGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const catColor = CATEGORY_COLORS[post.category] ?? { bg: '#0d9488', text: '#fff' }
        return (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-[#10B981]/30"
          >
            <div className="relative h-52 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
                style={{ backgroundImage: `url(${getBlogCardImage(post.slug)})` }}
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute left-3 top-3">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
                  style={{ backgroundColor: catColor.bg }}
                >
                  {post.category}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <p className="text-xs text-gray-400">
                {post.coverEmoji} {post.passportCountry} → {post.destinationCountry}
              </p>
              <h2 className="text-base font-bold leading-snug text-[#1A1A1A] transition group-hover:text-[#10B981] line-clamp-2">
                {post.title}
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
                <span className="text-xs font-semibold text-[#10B981] transition group-hover:text-[#059669]">
                  Read Guide →
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
