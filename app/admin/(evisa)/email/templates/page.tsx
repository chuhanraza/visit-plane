import Link from 'next/link'
import type { Metadata } from 'next'
import { requirePermission } from '@/lib/admin/guard'
import { listTemplates } from '@/lib/admin/templates'
import TemplateEditor from './TemplateEditor'

export const metadata: Metadata = { title: 'Email templates — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminEmailTemplates() {
  await requirePermission('email', 'view')
  const templates = await listTemplates()
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Email templates</h1>
        <Link href="/admin/email" className="text-sm text-gray-400 hover:text-white">← Email campaigns</Link>
      </div>
      <TemplateEditor templates={templates} />
      <p className="text-xs text-gray-600">Templates are reusable subject + HTML bodies. Load one into the broadcast composer on the Email page.</p>
    </div>
  )
}
