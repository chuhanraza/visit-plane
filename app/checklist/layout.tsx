import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Document Checklist Generator | VisitPlane',
  description:
    'Generate your personalized visa document checklist instantly. Never miss a document for your visa application.',
}

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
