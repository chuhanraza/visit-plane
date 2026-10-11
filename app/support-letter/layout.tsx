import type { Metadata } from 'next'

const title = 'Free Visa Support Letter Generator (2026)'
const description =
  'Write a visa cover letter, invitation letter or sponsor letter. Fill in a form, watch the letter build live, then download a PDF. Free, private, no sign-up.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://www.visitplane.com/support-letter' },
  openGraph: { title, description, url: 'https://www.visitplane.com/support-letter', type: 'website' },
}

export default function SupportLetterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
