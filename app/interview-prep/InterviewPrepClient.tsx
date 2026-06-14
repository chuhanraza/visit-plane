'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InterviewHero from './components/InterviewHero'
import InterviewLandingSections from './components/InterviewLandingSections'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import { INTERVIEW_COUNTRIES } from '@/lib/data/interview-questions'

export default function InterviewPrepClient() {
  const router = useRouter()
  const [country, setCountry] = useState('') // country NAME (matches CountrySelect)
  const [visaType, setVisaType] = useState('') // visa CODE (e.g. B1B2)

  const handleEnter = () => {
    const c = INTERVIEW_COUNTRIES.find((x) => x.name === country)
    if (!c || !visaType) return
    router.push(`/interview-prep/${c.slug}/${visaType.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
      <ToolBreadcrumb toolName="Interview Prep" toolEmoji="🎤" />
      <InterviewHero
        country={country}
        visaType={visaType}
        onCountryChange={(v) => { setCountry(v); setVisaType('') }}
        onVisaTypeChange={setVisaType}
        onEnter={handleEnter}
      />
      <InterviewLandingSections
        onJumpToSelector={() => {
          document.getElementById('ip-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
      />
    </div>
  )
}
