'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LANGUAGES = [
  { code: 'en', name: 'English',    flag: '🇬🇧', native: 'English',    rtl: false },
  { code: 'ar', name: 'Arabic',     flag: '🇸🇦', native: 'العربية',   rtl: true  },
  { code: 'ur', name: 'Urdu',       flag: '🇵🇰', native: 'اردو',      rtl: true  },
  { code: 'hi', name: 'Hindi',      flag: '🇮🇳', native: 'हिन्दी',   rtl: false },
  { code: 'zh', name: 'Chinese',    flag: '🇨🇳', native: '中文',       rtl: false },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸', native: 'Español',   rtl: false },
  { code: 'fr', name: 'French',     flag: '🇫🇷', native: 'Français',  rtl: false },
  { code: 'de', name: 'German',     flag: '🇩🇪', native: 'Deutsch',   rtl: false },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português', rtl: false },
  { code: 'bn', name: 'Bengali',    flag: '🇧🇩', native: 'বাংলা',    rtl: false },
]

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const currentLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0]

  const switchLanguage = (langCode: string) => {
    document.cookie = `NEXT_LOCALE=${langCode};max-age=${60 * 60 * 24 * 365};path=/;SameSite=Lax`
    setIsOpen(false)
    router.refresh()
    window.location.reload()
  }

  const resetToAutoDetect = () => {
    document.cookie = 'NEXT_LOCALE=;max-age=0;path=/;SameSite=Lax'
    window.location.reload()
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          bg-white/10 hover:bg-white/20 transition-all duration-200
          text-white text-sm font-medium border border-white/20"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="hidden sm:block">{currentLang.native}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-56
          bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Select Language
            </p>
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5
                  hover:bg-emerald-50 transition-colors duration-100
                  ${currentLocale === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'}`}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <div className="flex-1 text-left" dir={lang.rtl ? 'rtl' : 'ltr'}>
                  <p className="text-sm font-semibold leading-tight">{lang.native}</p>
                  <p className="text-[11px] text-gray-400">{lang.name}</p>
                </div>
                {currentLocale === lang.code && (
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <button
              onClick={resetToAutoDetect}
              className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 transition-colors"
            >
              📍 Reset to auto-detect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
