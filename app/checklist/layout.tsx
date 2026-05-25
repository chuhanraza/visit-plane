import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Document Checklist Generator | VisitPlane',
  description:
    'Generate your personalized visa document checklist instantly. Never miss a document for your visa application.',
  alternates: {
    canonical: 'https://www.visitplane.com/checklist',
  },
}

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
