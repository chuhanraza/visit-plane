import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/guard'
import { listAdmins, keyStatus } from '@/lib/admin/admins'
import { getSettings } from '@/lib/admin/settings'
import { AdminAllowlist, FeatureFlags } from './SettingsClient'

export const metadata: Metadata = { title: 'Settings — VisitPlane Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function AdminSettings() {
  await requireAdmin()
  const [admins, settings] = await Promise.all([listAdmins(), getSettings()])
  const keys = keyStatus()

  const flags = [
    { key: 'payments_enabled', label: 'Payments enabled', value: settings.payments_enabled === true, hint: 'Master switch for live payment processing (kept OFF).' },
    { key: 'email_broadcasts_enabled', label: 'Email broadcasts', value: settings.email_broadcasts_enabled === true, hint: 'Allow real marketing broadcasts from the Email module.' },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <AdminAllowlist admins={admins} />
      <FeatureFlags flags={flags} />

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold text-white">API keys & secrets <span className="text-gray-500 text-sm font-normal">(status only)</span></h2>
        <p className="text-xs text-gray-500">Presence is read from the server environment. Values are never displayed or transmitted to the browser.</p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {keys.map(k => (
            <li key={k.key} className="flex items-center justify-between bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2">
              <div>
                <div className="text-gray-200 text-sm">{k.label}</div>
                <code className="text-[11px] text-gray-600">{k.key}</code>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${k.configured ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-600/30 text-gray-400'}`}>
                {k.configured ? 'configured' : 'missing'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
