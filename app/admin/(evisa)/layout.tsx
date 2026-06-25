import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/admin/guard'
import CommandPalette from './CommandPalette'
import NotificationBell from './NotificationBell'

export const dynamic = 'force-dynamic'

// Grouped operator navigation. New operator modules live alongside the existing
// e-Visa order back-office. Legacy flat pages (/admin/affiliates, /admin/subscribers,
// /admin/data-quality, /admin/seo) remain reachable via Settings + the SEO link.
const NAV: { href: string; label: string }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/leads', label: 'Leads / CRM' },
  { href: '/admin/orders', label: 'e-Visa orders' },
  { href: '/admin/revenue', label: 'Revenue' },
  { href: '/admin/affiliate-mgmt', label: 'Affiliates' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/email', label: 'Email' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/audit', label: 'Audit' },
  { href: '/admin/developers', label: 'Developers' },
  { href: '/admin/settings', label: 'Settings' },
]

export default async function AdminEvisaLayout({ children }: { children: ReactNode }) {
  // Hard gate the whole back-office shell. Each page re-checks too.
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/admin" className="font-bold text-white whitespace-nowrap">VisitPlane <span className="text-blue-400">Admin</span></Link>
            <nav className="hidden xl:flex items-center gap-0.5 text-sm">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} className="px-2.5 py-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white whitespace-nowrap">{n.label}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <NotificationBell />
            <Link href="/admin/seo" className="hidden sm:inline text-gray-400 hover:text-white">SEO</Link>
            <Link href="/" className="text-gray-400 hover:text-white whitespace-nowrap">Site ↗</Link>
          </div>
        </div>
        <nav className="xl:hidden flex items-center gap-1 text-sm px-4 pb-2 overflow-x-auto">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white whitespace-nowrap">{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <CommandPalette />
    </div>
  )
}
