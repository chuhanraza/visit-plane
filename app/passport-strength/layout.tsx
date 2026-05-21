import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Passport Strength Checker 2026 | VisitPlane',
  description:
    'Check how powerful your passport is. See visa-free countries, on arrival access, and your global passport ranking instantly.',
}

export default function PassportStrengthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
