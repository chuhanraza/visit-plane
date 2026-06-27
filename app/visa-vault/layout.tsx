import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visa Vault — Save Your Visa Application Details Securely | VisitPlane',
  description:
    'Visa Vault keeps your reusable visa application details — passport info, addresses, employment — in one place on your device, so you never re-type them per form.',
  alternates: { canonical: 'https://www.visitplane.com/visa-vault' },
  openGraph: {
    title: 'Visa Vault — Save Your Visa Application Details Securely',
    description:
      'Keep your reusable visa application details in one place so you never re-type them for each form.',
    url: 'https://www.visitplane.com/visa-vault',
    type: 'website',
  },
}

export default function VisaVaultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
