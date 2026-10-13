import type { Metadata } from 'next'

const title = 'Free Visa Support Letter Generator: Cover, NOC, Invitation'
const description =
  'Free visa support letter generator: cover letter, employer NOC, invitation and sponsor letters. Live preview, PDF and Word download, no sign-up.'
const url = 'https://www.visitplane.com/support-letter'
const og = '/api/og?template=2&category=Visa%20letters&title=Free%20visa%20support%20letter%20generator'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: 'website', images: [{ url: og, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title, description, images: [og] },
}

export default function SupportLetterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
