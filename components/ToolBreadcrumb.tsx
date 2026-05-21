'use client'

import Link from 'next/link'

interface ToolBreadcrumbProps {
  toolName: string
  toolEmoji?: string
  variant?: 'light' | 'dark'
}

export default function ToolBreadcrumb({ toolName, toolEmoji = '🛠️', variant = 'light' }: ToolBreadcrumbProps) {
  const isDark = variant === 'dark'
  return (
    <nav className={
      isDark
        ? 'border-b border-white/5 bg-white/[0.03] backdrop-blur-sm'
        : 'bg-white/60 border-b border-gray-100 backdrop-blur-sm'
    }>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center gap-1.5 py-2.5 text-xs ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
          <Link
            href="/"
            className={`flex items-center gap-1 transition-colors ${isDark ? 'hover:text-teal-400' : 'hover:text-teal-500'}`}
          >
            <span>🏠</span>
            <span>Home</span>
          </Link>
          <span className={isDark ? 'text-white/15' : 'text-gray-300'}>/</span>
          <span className="flex items-center gap-1 cursor-default">
            <span>🛠️</span>
            <span>Tools</span>
          </span>
          <span className={isDark ? 'text-white/15' : 'text-gray-300'}>/</span>
          <span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-teal-400' : 'text-teal-500'}`}>
            <span>{toolEmoji}</span>
            <span>{toolName}</span>
          </span>
        </div>
      </div>
    </nav>
  )
}
