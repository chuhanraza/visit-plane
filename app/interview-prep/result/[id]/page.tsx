import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCountryBySlug } from '@/lib/data/interview-questions'
import ResultClient from './ResultClient'

interface Props {
  params: Promise<{ id: string }>
}

interface Decoded {
  c: string // country slug
  v: string // visa code
  s: number // overall score 0-100
  cat: Record<string, number>
}

function decode(id: string): Decoded | null {
  try {
    // Accept base64url (and tolerate standard base64): restore +/ and padding
    let b64 = id.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const json =
      typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf-8')
    const obj = JSON.parse(decodeURIComponent(json))
    if (typeof obj.s !== 'number' || !obj.c || !obj.v) return null
    return { c: obj.c, v: obj.v, s: obj.s, cat: obj.cat ?? {} }
  } catch {
    return null
  }
}

function resolve(d: Decoded) {
  const country = getCountryBySlug(d.c)
  if (!country) return null
  const visa = country.visa_types.find((x) => x.code.toLowerCase() === d.v.toLowerCase())
  return { country, visaLabel: visa?.label ?? d.v }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const d = decode(id)
  if (!d) return { title: 'Interview Readiness Score | VisitPlane' }
  const r = resolve(d)
  const name = r ? `${r.country.name} ${r.visaLabel}` : 'visa'
  const title = `I scored ${d.s}/100 on my ${name} mock interview | VisitPlane`
  const description = `See how ready you are for your ${name} visa interview — practice free with AI mock interviews on VisitPlane.`
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', siteName: 'VisitPlane' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params
  const d = decode(id)
  if (!d) notFound()
  const r = resolve(d)
  if (!r) notFound()

  return (
    <ResultClient
      countryName={r.country.name}
      countryFlag={r.country.flag}
      countrySlug={r.country.slug}
      visaCode={d.v}
      visaLabel={r.visaLabel}
      overall={d.s}
      categories={d.cat}
    />
  )
}
