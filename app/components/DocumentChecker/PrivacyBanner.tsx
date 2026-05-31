'use client'
export default function PrivacyBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-teal-500/30 bg-teal-900/20 px-5 py-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold text-teal-300">Your Privacy is Protected</p>
        <p className="mt-0.5 text-xs leading-relaxed text-teal-400/80">
          Documents are analyzed by AI and <strong className="text-teal-300">immediately deleted</strong>.
          We never store, share, or retain your personal files or document images.
        </p>
      </div>
    </div>
  )
}
