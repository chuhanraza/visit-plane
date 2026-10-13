import Link from 'next/link'
import type { Block, Seg } from '@/lib/letters/templates'
import type { Faq } from '@/lib/letters/seo'

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

function Segs({ segs }: { segs: Seg[] }) {
  return <>{segs.map((s, i) => <span key={i}>{s.text}</span>)}</>
}

/** Static, read-only letter. Server rendered so the sample text is in the HTML for crawlers. */
export function SampleLetter({ blocks, caption }: { blocks: Block[]; caption: string }) {
  return (
    <figure className="m-0">
      <div
        className="mx-auto w-full max-w-[640px] rounded-sm bg-white px-6 py-8 text-[13px] leading-[1.65] text-gray-900 shadow-lg ring-1 ring-black/5 sm:px-12 sm:py-12"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {blocks.map((b, i) => {
          if (b.kind === 'gap') return <div key={i} className="h-3" />
          if (b.kind === 'h') return <p key={i} className="font-bold">{b.text}</p>
          if (b.kind === 'p') return <p key={i}><Segs segs={b.segs} /></p>
          if (b.kind === 'lines')
            return <div key={i}>{b.lines.map((l, j) => <div key={j}><Segs segs={l} /></div>)}</div>
          return (
            <ul key={i} className="ml-5 list-disc">
              {b.items.map((it, j) => <li key={j}><Segs segs={it} /></li>)}
            </ul>
          )
        })}
      </div>
      <figcaption className="mt-3 text-center text-xs text-gray-500">{caption}</figcaption>
    </figure>
  )
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      {faqs.map((f) => (
        <div key={f.q} className="px-5 py-4">
          <dt className="text-sm font-bold text-gray-900">{f.q}</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.a}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800"
    >
      {children}
    </Link>
  )
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-sm leading-relaxed text-gray-700">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-emerald-600" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function LinkList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  if (!links.length) return null
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-emerald-800 underline-offset-2 hover:underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Disclaimer() {
  return (
    <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
      This page explains how to write supporting letters. It is general information, not legal or immigration advice, and no letter guarantees a visa.
      Requirements change and differ by consulate and nationality, so check the official page before you apply. Names and numbers in samples are invented.
    </p>
  )
}

export function Crumbs({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-gray-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((c, i) => (
          <li key={c.name} className="flex items-center gap-1.5">
            {c.href ? <Link href={c.href} className="hover:text-emerald-800 hover:underline">{c.name}</Link> : <span aria-current="page" className="text-gray-700">{c.name}</span>}
            {i < trail.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
