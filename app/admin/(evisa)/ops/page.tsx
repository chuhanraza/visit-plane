import type { Metadata } from 'next'
import { requirePermission } from '@/lib/admin/guard'
import { opsOverview, listAlertRules } from '@/lib/admin/ops'
import OpsClient from './OpsClient'

export const metadata: Metadata = { title: 'Ops — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOps() {
  await requirePermission('ops', 'view')
  const [ops, rules] = await Promise.all([opsOverview(), listAlertRules()])

  const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-white mt-1">{value}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Ops <span className="text-gray-500 text-sm font-normal">— background work & alerts</span></h1>

      {/* Live metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="New leads today" value={ops.metrics.leads_today} />
        <Stat label="Pending corrections" value={ops.metrics.pending_corrections} />
        <Stat label="Pending opt-ins" value={ops.metrics.pending_optins} />
        <Stat label="Failed webhooks 24h" value={ops.metrics.failed_webhooks_24h} />
        <Stat label="Active flow runs" value={ops.metrics.active_flow_runs} />
      </div>

      <OpsClient rules={rules} metrics={ops.metrics} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SEO generation jobs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">SEO generation jobs</h2>
          {ops.seoJobs.length === 0 ? <p className="text-gray-500 text-sm">No jobs yet.</p> : (
            <ul className="divide-y divide-gray-800 text-sm">
              {ops.seoJobs.map((j: Record<string, unknown>) => (
                <li key={j.id as string} className="flex items-center justify-between py-2">
                  <span className="text-gray-300">Phase {String(j.phase)} · {String(j.completed)}/{String(j.total_routes)} {Number(j.failed) > 0 && <span className="text-red-400">({String(j.failed)} failed)</span>}</span>
                  <span className="text-xs text-gray-500">{j.status as string}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Webhook deliveries */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-3">Webhook deliveries <span className="text-gray-500 text-sm font-normal">(7d: {ops.whStats.success}✓ / {ops.whStats.failed}✗)</span></h2>
          {ops.webhookRecent.length === 0 ? <p className="text-gray-500 text-sm">No deliveries yet.</p> : (
            <ul className="divide-y divide-gray-800 text-sm">
              {ops.webhookRecent.map((d, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="text-gray-300 font-mono text-xs">{d.event}</span>
                  <span className={`text-xs ${d.status === 'success' ? 'text-emerald-400' : d.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>{d.status}{d.response_code ? ` ${d.response_code}` : ''}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-gray-800 text-sm text-gray-400">Flow runs: {ops.flowStats.active} active · {ops.flowStats.completed} completed · {ops.flowStats.cancelled} cancelled</div>
        </div>
      </div>
    </div>
  )
}
