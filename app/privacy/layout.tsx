import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | VisitPlane',
  description:
    'How VisitPlane handles your data: what we collect, how analytics and cookies work, and your choices. We never ask for an account to use the free tools.',
  alternates: { canonical: 'https://www.visitplane.com/privacy' },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
