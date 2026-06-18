import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import WizardClient from '../../WizardClient'
import type { WizardAnswers } from '../../components/WizardStep'
import { shortName } from '@/lib/visa-engine'
import { getVisaData } from '@/lib/visa-engine'

// Param-dependent route — render on demand (avoids Next 16 empty-param prerender crash).
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ state: string }>
}

function decodeState(encoded: string): WizardAnswers | null {
  try {
    // Accept base64url (and tolerate standard base64): restore +/ and padding
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const decoded = typeof atob !== 'undefined'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('utf-8')
    const json = decodeURIComponent(decoded)
    const obj = JSON.parse(json)
    if (!obj.p || !obj.d) return null
    return {
      passport: obj.p,
      destination: obj.d,
      purpose: obj.pu ?? 'Tourism',
      duration: obj.du ?? '7',
      travelDate: obj.dt ?? '',
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const answers = decodeState(state)
  if (!answers) return { title: 'Visa Plan | VisitPlane' }

  const from = shortName(answers.passport)
  const to = shortName(answers.destination)
  const visaData = getVisaData(answers.passport, answers.destination, answers.purpose)

  return {
    title: `${from} → ${to} Visa Plan | VisitPlane`,
    description: `${visaData.icon} ${visaData.visaLabel} for ${from} passport holders visiting ${to}. ${answers.purpose} trip, ${answers.duration} days. Get your personalized visa guide free.`,
    openGraph: {
      title: `${from} → ${to} Visa Plan`,
      description: `${visaData.visaLabel} · ${visaData.costUSD != null ? `$${visaData.costUSD}` : 'Free'} · Up to ${visaData.maxStayDays} days`,
      url: `https://visitplane.com/wizard/result/${state}`,
      siteName: 'VisitPlane',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${from} → ${to} Visa Plan | VisitPlane`,
      description: `${visaData.visaLabel} · ${visaData.processingDays}`,
    },
  }
}

export default async function WizardResultPage({ params }: Props) {
  const { state } = await params
  const answers = decodeState(state)
  if (!answers) notFound()

  const visaData = getVisaData(answers.passport, answers.destination, answers.purpose)

  const from = shortName(answers.passport)
  const to = shortName(answers.destination)

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Do ${answers.passport} passport holders need a visa for ${answers.destination}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${visaData.visaLabel}. ${visaData.costUSD != null ? `Fee: $${visaData.costUSD} USD. ` : ''}Processing: ${visaData.processingDays}. Maximum stay: ${visaData.maxStayDays} days.`,
        },
      },
      {
        '@type': 'Question',
        name: `What documents do ${answers.passport} citizens need to travel to ${answers.destination}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: visaData.requiredDocs.join(', '),
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Shareable banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 py-2 text-center text-xs font-medium text-white/90">
        📤 Shared visa plan: {from} → {to} — generated free at visitplane.com/wizard
      </div>
      <WizardClient initialAnswers={answers} />
    </>
  )
}
