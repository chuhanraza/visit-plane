import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/audit', label: 'Audit log' },
]

export default async function AdminEvisaLayout({ children }: { children: ReactNode }) {
  // Hard gate the whole back-office shell. Each page re-checks too.
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-white">VisitPlane <span className="text-blue-400">Admin</span></Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">{n.label}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/seo" className="text-gray-400 hover:text-white">SEO</Link>
            <Link href="/" className="text-gray-400 hover:text-white">Site ↗</Link>
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-1 text-sm px-4 pb-2 overflow-x-auto">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white whitespace-nowrap">{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
