import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { leadSources } from '@/lib/admin/leads'
import { listSegments, resolveSegment } from '@/lib/admin/segments'
import SegmentBuilder, { DeleteSegmentButton } from './SegmentBuilder'

export const metadata: Metadata = { title: 'Marketing — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminMarketing() {
  await requireAdmin()
  const svc = getServiceClient()
  const [sources, segments, metricsRes] = await Promise.all([
    leadSources(),
    listSegments(),
    svc.from('marketing_metrics').select('name').order('name'),
  ])
  const metrics = (metricsRes.data ?? []).map((m: { name: string }) => m.name)

  // Resolve live counts for each saved segment.
  const withCounts = await Promise.all(segments.map(async s => ({ ...s, count: (await resolveSegment(s.definition)).count })))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Marketing <span className="text-gray-500 text-sm font-normal">— segments & automation</span></h1>
        <a href="/admin/email" className="text-sm text-gray-400 hover:text-white">Email campaigns →</a>
      </div>

      <SegmentBuilder sources={sources.map(s => s.source)} metrics={metrics} />

      <div>
        <h2 className="font-semibold text-white mb-2">Saved segments <span className="text-gray-500 text-sm font-normal">({segments.length})</span></h2>
        {withCounts.length === 0 ? (
          <p className="text-gray-500 text-sm">No segments yet. Build one above — they’re usable as email audiences.</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
            {withCounts.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-white text-sm">{s.name} <span className="text-gray-500">· {s.count} member{s.count === 1 ? '' : 's'}</span></div>
                  <div className="text-xs text-gray-600">{s.definition.match?.toUpperCase()} of: {s.definition.conditions?.map(c => `${c.type}=${c.value}${c.days ? `/${c.days}d` : ''}`).join(', ')}</div>
                </div>
                <DeleteSegmentButton id={s.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600">Automated flows (triggered email sequences) are wired in the next sub-phase. Segments here already power audience targeting in the Email module.</p>
    </div>
  )
}
