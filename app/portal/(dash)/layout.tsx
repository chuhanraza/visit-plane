import Link from 'next/link'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="inline-flex w-7 h-7 bg-blue-600 rounded-lg items-center justify-center text-white text-xs">VP</span>
            VisitPlane
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/portal" className="text-gray-600 hover:text-gray-900">My orders</Link>
            <Link href="/crew" className="text-gray-600 hover:text-gray-900">My crews</Link>
            <Link href="/order" className="text-gray-600 hover:text-gray-900">New order</Link>
            <form action="/portal/auth/signout" method="post">
              <button type="submit" className="text-gray-500 hover:text-red-600">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
