import Link from 'next/link'
import { getAuthor, type Author } from '@/lib/data/authors'

function AuthorAvatar({ author, size = 'h-12 w-12' }: { author: Author; size?: string }) {
  if (author.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.image}
        alt={author.name}
        className={`${size} flex-shrink-0 rounded-full object-cover shadow-sm`}
        loading="lazy"
      />
    )
  }
  return (
    <div
      className={`${size} grid flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-sm font-bold text-white shadow-sm`}
      aria-hidden="true"
    >
      {author.initials}
    </div>
  )
}

/**
 * E-E-A-T byline: ties content to a real, accountable human.
 * "Written & reviewed by [Author], Founder & Editor" + last-updated date,
 * linking to the author page and the editorial-standards page.
 */
export default function Byline({
  authorSlug,
  updatedISO,
  readTime,
}: {
  authorSlug?: string
  /** ISO date string for the last update */
  updatedISO: string
  readTime?: string
}) {
  const author = getAuthor(authorSlug)
  const updated = new Date(updatedISO).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="mb-10 flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 shadow-sm">
      <AuthorAvatar author={author} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">
          Written &amp; reviewed by{' '}
          <Link
            href={`/authors/${author.slug}`}
            className="font-semibold text-[#0f1419] hover:text-[#10B981]"
          >
            {author.name}
          </Link>
          <span className="text-gray-400"> · {author.role}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Last updated {updated}
          </span>
          {readTime && (
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {readTime}
            </span>
          )}
          <Link
            href="/editorial-standards"
            className="flex items-center gap-1 text-[#10B981] hover:underline"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
            </svg>
            How we verify
          </Link>
        </div>
      </div>
    </div>
  )
}
