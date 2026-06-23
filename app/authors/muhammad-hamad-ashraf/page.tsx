import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthor, authorPersonSchema } from '@/lib/data/authors'

const author = getAuthor('muhammad-hamad-ashraf')

export const metadata: Metadata = {
  title: `${author.name} — ${author.role}`,
  description: author.bio,
  alternates: { canonical: author.url },
  openGraph: {
    title: `${author.name} — ${author.role}, VisitPlane`,
    description: author.bio,
    type: 'profile',
    url: author.url,
  },
}

export default function AuthorPage() {
  const personSchema = authorPersonSchema(author)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f1419] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <section className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Header card */}
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
          {author.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.image}
              alt={author.name}
              className="h-24 w-24 flex-shrink-0 rounded-full object-cover shadow"
            />
          ) : (
            <div
              className="grid h-24 w-24 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-2xl font-bold text-white shadow"
              aria-hidden="true"
            >
              {author.initials}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{author.name}</h1>
            <p className="mt-1 text-sm font-semibold text-[#10B981]">{author.role}, VisitPlane</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">{author.bio}</p>
            {author.sameAs.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {author.sameAs.map((href) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="text-xs font-semibold text-gray-500 hover:text-[#10B981]"
                  >
                    {new URL(href).hostname.replace('www.', '')}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">About {author.name.split(' ')[0]}</h2>
          <div className="space-y-4">
            {author.longBio.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-500">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* How content is verified */}
        <div className="mt-6 rounded-2xl border border-[#10B981]/20 bg-[#F0FDF9] p-8">
          <h2 className="mb-3 text-lg font-bold">How VisitPlane content is verified</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Every visa route is checked against official government immigration sites, embassy
            pages, and the IATA Travel Centre before it is published, and reviewed as rules change.
            AI is used to draft and flag possible discrepancies — never as the source of truth.
            Read the full process on the{' '}
            <Link href="/editorial-standards" className="font-semibold text-[#10B981] hover:underline">
              editorial standards page
            </Link>
            .
          </p>
        </div>

        {/* Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/about"
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#10B981]/40"
          >
            About VisitPlane
          </Link>
          <Link
            href="/editorial-standards"
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#10B981]/40"
          >
            Editorial Standards
          </Link>
          <Link
            href="/blog"
            className="rounded-full bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#059669]"
          >
            Read the visa guides →
          </Link>
        </div>
      </section>
    </div>
  )
}
