import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Embassy Finder 2026 | VisitPlane',
  description:
    'Find any embassy instantly. Addresses, phone numbers, opening hours and directions worldwide.',
  alternates: {
    canonical: 'https://www.visitplane.com/embassy-finder',
  },
}

export default function EmbassyFinderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
