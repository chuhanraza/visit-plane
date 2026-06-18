import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCountryBySlug, getQuestions } from '@/lib/data/interview-questions'
import MockClient from './MockClient'

// Param-dependent route — render on demand (avoids Next 16 empty-param prerender crash).
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

function parseId(id: string) {
  const idx = id.indexOf('-')
  if (idx === -1) return null
  const slug = id.slice(0, idx)
  const code = id.slice(idx + 1)
  const country = getCountryBySlug(slug)
  if (!country) return null
  const visa = country.visa_types.find((v) => v.code.toLowerCase() === code.toLowerCase())
  if (!visa) return null
  const questions = getQuestions(country.iso, visa.code)
  return { country, visa, questions }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const r = parseId(id)
  if (!r) return { title: 'Mock Interview | VisitPlane' }
  return {
    title: `${r.country.name} ${r.visa.label} Mock Interview | VisitPlane`,
    description: `Practice a realistic ${r.country.name} ${r.visa.label} visa interview with AI. Get a readiness score and per-answer feedback.`,
    robots: { index: false, follow: true }, // practice sessions are not indexable
  }
}

export default async function MockPage({ params }: Props) {
  const { id } = await params
  const r = parseId(id)
  if (!r) notFound()
  if (r.questions.length === 0) notFound()

  return (
    <MockClient
      countryName={r.country.name}
      countryFlag={r.country.flag}
      countryIso={r.country.iso}
      countrySlug={r.country.slug}
      visaCode={r.visa.code}
      visaLabel={r.visa.label}
    />
  )
}
