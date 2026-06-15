import Link from 'next/link'

export interface Crumb {
  name: string
  /** Absolute path. Omit for the current (last) page. */
  href?: string
}

const SITE = 'https://www.visitplane.com'

/**
 * Renders a visible breadcrumb trail AND the matching BreadcrumbList
 * JSON-LD structured data (Google rich-result breadcrumbs).
 */
export default function BlogBreadcrumb({ items }: { items: Crumb[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${SITE}${c.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-gray-500">
          {items.map((c, i) => {
            const last = i === items.length - 1
            return (
              <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
                {c.href && !last ? (
                  <Link href={c.href} className="transition hover:text-[#10B981]">
                    {c.name}
                  </Link>
                ) : (
                  <span className={last ? 'font-medium text-gray-700' : ''} aria-current={last ? 'page' : undefined}>
                    {c.name}
                  </span>
                )}
                {!last && <span className="text-gray-300">›</span>}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
