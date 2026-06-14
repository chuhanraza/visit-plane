import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getCountryBySlug,
  getQuestions,
  type InterviewQuestion,
} from '@/lib/data/interview-questions'
import PrepModeClient from './PrepModeClient'

interface Props {
  params: Promise<{ country: string; visaType: string }>
}

function resolve(countrySlug: string, visaSlug: string) {
  const country = getCountryBySlug(countrySlug)
  if (!country) return null
  const visa = country.visa_types.find((v) => v.code.toLowerCase() === visaSlug.toLowerCase())
  if (!visa) return null
  const questions = getQuestions(country.iso, visa.code)
  return { country, visa, questions }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, visaType } = await params
  const r = resolve(country, visaType)
  if (!r) return { title: 'Visa Interview Prep | VisitPlane' }
  const title = `${r.country.name} ${r.visa.label} Visa Interview Questions (2026) | VisitPlane`
  const description = `Practice real ${r.country.name} ${r.visa.label} visa interview questions with strong vs weak answer examples, pro tips, and AI feedback. Free.`
  return {
    title,
    description,
    alternates: { canonical: `/interview-prep/${r.country.slug}/${r.visa.code.toLowerCase()}` },
    openGraph: { title, description, type: 'website', siteName: 'VisitPlane' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function jsonLd(countryName: string, visaLabel: string, slug: string, visaSlug: string, questions: InterviewQuestion[]) {
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.slice(0, 10).map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: `${q.why_asked} Example: ${q.strong_answer_pattern}` },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visitplane.com' },
      { '@type': 'ListItem', position: 2, name: 'Interview Prep', item: 'https://www.visitplane.com/interview-prep' },
      { '@type': 'ListItem', position: 3, name: `${countryName} ${visaLabel}`, item: `https://www.visitplane.com/interview-prep/${slug}/${visaSlug}` },
    ],
  }
  return [faq, breadcrumb]
}

export default async function PrepModePage({ params }: Props) {
  const { country, visaType } = await params
  const r = resolve(country, visaType)
  if (!r) notFound()

  const schemas = jsonLd(r.country.name, r.visa.label, r.country.slug, r.visa.code.toLowerCase(), r.questions)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <PrepModeClient
        countryName={r.country.name}
        countryFlag={r.country.flag}
        countrySlug={r.country.slug}
        visaCode={r.visa.code}
        visaLabel={r.visa.label}
        questions={r.questions}
      />
    </>
  )
}
