'use client'

/**
 * This is the canonical global command palette for VisitPlane.
 * Opened by Cmd+K (Mac) / Ctrl+K (Windows/Linux) or the ⚡ icon in SiteHeader.
 * Do not create alternative command palette components.
 */

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useCommandPalette } from './CommandPaletteContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde',
  'Central African Republic','Chad','Chile','China','Colombia','Comoros',
  'Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominica','Dominican Republic','DR Congo','Ecuador','Egypt',
  'El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana',
  'Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti',
  'Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan',
  'Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho',
  'Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar',
  'Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands',
  'Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco',
  'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru',
  'Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','North Macedonia','Norway','Oman','Pakistan','Palau',
  'Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines',
  'Samoa','San Marino','Saudi Arabia','Senegal','Serbia','Seychelles',
  'Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands',
  'Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka',
  'Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan',
  'Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago',
  'Tunisia','Turkey','Turkmenistan','Tuvalu','UAE','Uganda','Ukraine',
  'United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu',
  'Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

const TOOLS = [
  { emoji: '🗺️', name: 'Visa-Free World Map',    href: '/visa-free-map'      },
  { emoji: '💪', name: 'Passport Strength',       href: '/passport-strength'  },
  { emoji: '🤖', name: 'AI Visa Wizard',          href: '/wizard'             },
  { emoji: '⚖️', name: 'Compare Visas',           href: '/compare'            },
  { emoji: '📋', name: 'Document Checklist',      href: '/checklist'          },
  { emoji: '⏱️', name: 'Processing Times',        href: '/processing-times'   },
  { emoji: '🎯', name: 'Visa Checker',            href: '/visa-checker'       },
  { emoji: '💰', name: 'Cost Calculator',         href: '/cost-calculator'    },
  { emoji: '🏛️', name: 'Embassy Finder',          href: '/embassy-finder'     },
  { emoji: '📷', name: 'Passport Scanner',        href: '/passport-scanner'   },
  { emoji: '🔐', name: 'Visa Vault',              href: '/visa-vault'         },
  { emoji: '📊', name: 'Visa Tracker',            href: '/visa-tracker'       },
  { emoji: '🎤', name: 'Interview Prep',          href: '/interview-prep'     },
  { emoji: '✈️', name: 'Itinerary Generator',     href: '/itinerary-generator'},
  { emoji: '💱', name: 'Currency Converter',      href: '/currency-converter' },
  { emoji: '🛡️', name: 'Travel Insurance',        href: '/travel-insurance'   },
]

const BLOG_POSTS = [
  { title: 'Schengen Visa Guide 2026',                     slug: 'schengen-visa-guide-pakistani-travelers-2026' },
  { title: 'Strongest Passports in the World 2026',        slug: 'strongest-passport-world-2026'               },
  { title: 'Dubai Tourist Visa: Complete Guide',           slug: 'dubai-tourist-visa-complete-guide-indians'   },
  { title: 'UK Student Visa Requirements 2026',            slug: 'uk-student-visa-requirements-2026'           },
  { title: 'USA Student Visa F1 Complete Guide',           slug: 'usa-student-visa-f1-complete-guide-2026'     },
  { title: 'Digital Nomad Visas 2026',                     slug: 'digital-nomad-visas-2026'                    },
  { title: 'Japan Tourist Visa for Pakistanis',            slug: 'japan-tourist-visa-pakistanis-how-to-apply'  },
  { title: 'Germany Job Seeker Visa Requirements',         slug: 'germany-job-seeker-visa-complete-requirements'},
  { title: 'Top 10 Visa Rejection Reasons',                slug: 'top-10-visa-rejection-reasons'               },
  { title: 'How to Write a Visa Cover Letter',             slug: 'how-to-write-visa-cover-letter'              },
  { title: 'Proof of Funds for Visa Applications',         slug: 'proof-of-funds-visa-applications'            },
  { title: 'Canada Tourist Visa: Step by Step',            slug: 'canada-tourist-visa-pakistanis-step-by-step' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommandPalette() {
  const { open, closePalette, openPalette } = useCommandPalette()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openPalette()
      }
      if (e.key === 'Escape') closePalette()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openPalette, closePalette])

  const navigate = useCallback((href: string) => {
    closePalette()
    router.push(href)
  }, [closePalette, router])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed left-1/2 top-[12%] z-[101] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0f0c29] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
      >
        <Command
          className="flex flex-col"
          shouldFilter={true}
          label="Command palette"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <Command.Input
              ref={inputRef}
              autoFocus
              placeholder="Search countries, tools, blog posts…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/30 sm:block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <Command.List className="max-h-[420px] overflow-y-auto overscroll-contain p-2">
            <Command.Empty className="py-10 text-center text-sm text-white/30">
              No results — try a different search
            </Command.Empty>

            {/* Countries */}
            <Command.Group
              heading="Countries"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-teal-400"
            >
              {COUNTRIES.map((country) => (
                <Command.Item
                  key={country}
                  value={`country-${country}`}
                  keywords={[country]}
                  onSelect={() => {
                    const slug = country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    navigate(`/destinations?country=${slug}`)
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none transition-colors data-[selected=true]:bg-white/8 data-[selected=true]:text-white hover:bg-white/5 hover:text-white"
                >
                  <span className="text-base">🌍</span>
                  <span>{country}</span>
                  <span className="ml-auto text-xs text-white/20">visa info →</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Tools */}
            <Command.Group
              heading="Tools"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-purple-400"
            >
              {TOOLS.map((tool) => (
                <Command.Item
                  key={tool.href}
                  value={`tool-${tool.name}`}
                  keywords={[tool.name, 'tool']}
                  onSelect={() => navigate(tool.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none transition-colors data-[selected=true]:bg-white/8 data-[selected=true]:text-white hover:bg-white/5 hover:text-white"
                >
                  <span className="text-base">{tool.emoji}</span>
                  <span>{tool.name}</span>
                  <span className="ml-auto text-xs text-white/20">open →</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Blog Posts */}
            <Command.Group
              heading="Blog"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-amber-400"
            >
              {BLOG_POSTS.map((post) => (
                <Command.Item
                  key={post.slug}
                  value={`blog-${post.title}`}
                  keywords={[post.title, 'blog', 'article']}
                  onSelect={() => navigate(`/blog/${post.slug}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none transition-colors data-[selected=true]:bg-white/8 data-[selected=true]:text-white hover:bg-white/5 hover:text-white"
                >
                  <span className="text-base">📝</span>
                  <span>{post.title}</span>
                  <span className="ml-auto text-xs text-white/20">read →</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer bar with keyboard hints */}
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-4 text-[10px] text-white/25">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1 py-0.5">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1 py-0.5">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1 py-0.5">ESC</kbd> close
              </span>
            </div>
            <span className="text-[10px] text-white/20">
              <kbd className="rounded border border-white/10 px-1 py-0.5">⌘K</kbd> to toggle
            </span>
          </div>
        </Command>
      </div>
    </>
  )
}
