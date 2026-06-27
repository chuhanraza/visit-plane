import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireAdmin, getAdminContext } from '@/lib/admin/guard'
import { can, type Module } from '@/lib/admin/rbac'
import CommandPalette from './CommandPalette'
import NotificationBell from './NotificationBell'
import KeyboardShortcuts from './KeyboardShortcuts'

export const dynamic = 'force-dynamic'

// Grouped operator navigation. Each entry maps to an RBAC module so the nav
// hides what a staff role cannot view. Owner / secret-login sees everything.
const NAV: { href: string; label: string; mod: Module }[] = [
  { href: '/admin', label: 'Dashboard', mod: 'dashboard' },
  { href: '/admin/analytics', label: 'Analytics', mod: 'analytics' },
  { href: '/admin/funnel', label: 'Revenue & Funnel', mod: 'analytics' },
  { href: '/admin/leads', label: 'Leads / CRM', mod: 'leads' },
  { href: '/admin/orders', label: 'e-Visa orders', mod: 'orders' },
  { href: '/admin/revenue', label: 'Revenue', mod: 'revenue' },
  { href: '/admin/promos', label: 'Discounts', mod: 'revenue' },
  { href: '/admin/affiliate-mgmt', label: 'Affiliates', mod: 'affiliates' },
  { href: '/admin/content', label: 'Content', mod: 'content' },
  { href: '/admin/email', label: 'Email', mod: 'email' },
  { href: '/admin/marketing', label: 'Marketing', mod: 'marketing' },
  { href: '/admin/customers', label: 'Customers', mod: 'orders' },
  { href: '/admin/invoices', label: 'Invoices', mod: 'revenue' },
  { href: '/admin/services', label: 'Services', mod: 'orders' },
  { href: '/admin/audit', label: 'Audit', mod: 'audit' },
  { href: '/admin/ops', label: 'Ops', mod: 'ops' },
  { href: '/admin/developers', label: 'Developers', mod: 'developers' },
  { href: '/admin/settings', label: 'Settings', mod: 'settings' },
]

export default async function AdminEvisaLayout({ children }: { children: ReactNode }) {
  // Hard gate the whole back-office shell. Each page re-checks too.
  await requireAdmin()
  const ctx = await getAdminContext()
  const nav = NAV.filter(n => can(ctx, n.mod, 'view'))

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/admin" className="font-bold text-white whitespace-nowrap">VisitPlane <span className="text-blue-400">Admin</span></Link>
            <nav className="hidden xl:flex items-center gap-0.5 text-sm">
              {nav.map(n => (
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
          {nav.map(n => (
            <Link key={n.href} href={n.href} className="px-3 py-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white whitespace-nowrap">{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <CommandPalette />
      <KeyboardShortcuts />
    </div>
  )
}
