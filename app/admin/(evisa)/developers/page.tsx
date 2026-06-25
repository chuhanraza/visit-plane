import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listApiKeys } from '@/lib/admin/apikeys'
import { listEndpoints, listDeliveries } from '@/lib/admin/webhooks'
import DevConsole from './DevConsole'

export const metadata: Metadata = { title: 'Developers — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.visitplane.com').replace(/\/$/, '')

export default async function AdminDevelopers() {
  await requireAdmin()
  const [keys, endpoints, deliveries] = await Promise.all([listApiKeys(), listEndpoints(), listDeliveries(50)])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Developers <span className="text-gray-500 text-sm font-normal">API keys · webhooks · postbacks</span></h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2">
        <h2 className="font-semibold text-white">Affiliate conversion postback</h2>
        <p className="text-sm text-gray-400">Point a partner network here to auto-log confirmed conversions. Authenticate with an API key (scope <code className="text-gray-300">affiliate:write</code>) via <code className="text-gray-300">?key=</code>, <code className="text-gray-300">Authorization: Bearer</code>, or <code className="text-gray-300">x-api-key</code>. Repeat calls with the same <code className="text-gray-300">external_ref</code> are de-duplicated.</p>
        <code className="block bg-gray-950 rounded-lg px-3 py-2 text-xs text-emerald-200 break-all">
          {SITE}/api/affiliate/postback?key=YOUR_KEY&amp;partner_slug=safetywing&amp;amount=49&amp;commission_amount=10&amp;external_ref=ORDER123
        </code>
        <p className="text-xs text-gray-600">POST with a JSON body is also supported. Fires the <code>affiliate.conversion</code> webhook and writes to the audit log.</p>
      </div>

      <DevConsole keys={keys} endpoints={endpoints} deliveries={deliveries} />
    </div>
  )
}
