import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listContent, contentStats, type ContentFilter } from '@/lib/admin/content'
import ContentManager from './ContentManager'

export const metadata: Metadata = { title: 'Content — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminContent({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAdmin()
  const sp = await searchParams
  const page = parseInt(sp.page ?? '1', 10) || 1
  const filters = { q: sp.q ?? '', filter: (sp.filter ?? '') as ContentFilter }

  const [{ rows, total, pageSize }, stats] = await Promise.all([
    listContent({ ...filters, page }),
    contentStats(),
  ])

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-0.5">{sub}</div>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Content manager <span className="text-gray-500 text-sm font-normal">— generated SEO pages</span></h1>
        <Link href="/admin/seo" className="text-sm text-gray-400 hover:text-white">SEO pipeline dashboard →</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Managed pages" value={String(stats.total)} sub="in seo_page_content" />
        <Stat label="Published" value={String(stats.published)} sub={`${stats.total - stats.published} draft`} />
        <Stat label="Quality-flagged" value={stats.flagged === 0 ? '0' : String(stats.flagged)} sub="failed detected gate" />
        <Stat label="GSC clicks" value={stats.gscClicks === 0 ? 'no data yet' : String(stats.gscClicks)} sub="from Search Console sync" />
      </div>

      <ContentManager rows={rows} filters={filters} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
