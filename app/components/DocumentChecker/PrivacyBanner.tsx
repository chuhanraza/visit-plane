'use client'
export default function PrivacyBanner() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-sm shrink-0">🔒</span>
      <p className="text-xs text-gray-500">
        Files are <strong className="text-gray-400 font-medium">compressed on your device</strong> and never stored — deleted from memory immediately after analysis.
      </p>
    </div>
  )
}
