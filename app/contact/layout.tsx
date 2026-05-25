import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact VisitPlane | Get In Touch',
  description:
    'Have questions or feedback? Contact the VisitPlane team. We\'re here to help with your visa queries.',
  alternates: {
    canonical: 'https://www.visitplane.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
