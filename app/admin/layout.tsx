import type { Metadata } from 'next'

// Operator back office. Never indexable, and the root layout's default canonical (the
// homepage) must not leak onto these pages. Auth is enforced per page by requireAdmin().
export const metadata: Metadata = {
  title: 'Admin | VisitPlane',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
