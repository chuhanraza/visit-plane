'use client'

import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// VisitPlane's traveller-bird mascot — a friendly, round little bird perched on
// its rolling suitcase with a travel scarf and a boarding pass, plus a small
// green paper plane nodding to the "VisitPlane" name. Soft pastel, SafetyWing-
// style editorial illustration, hand-built as inline vector (crisp at any size,
// tiny payload). Sits under the "Visa research, without the guesswork" headline.
// ─────────────────────────────────────────────────────────────────────────────
export default function TravelerBird() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-10 mt-2 flex w-full justify-center sm:mb-12"
    >
      <svg
        viewBox="0 0 460 416"
        className="h-auto w-[280px] select-none sm:w-[350px] lg:w-[400px]"
        role="img"
        aria-label="VisitPlane traveller bird perched on a suitcase, holding a boarding pass"
      >
        <defs>
          <linearGradient id="tb-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#BFEBD8" stopOpacity="0.3" />
            <stop offset="0.5" stopColor="#9FE0C8" />
            <stop offset="1" stopColor="#CFEFE0" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <path d="M0 338 C 110 310 200 364 252 336 S 392 300 460 330" fill="none" stroke="url(#tb-wave)" strokeWidth="12" strokeLinecap="round" />
        <path d="M150 150 Q 250 96 332 142" fill="none" stroke="#16C95C" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 9" opacity="0.65" />
        <g transform="translate(332 136) rotate(26)"><path d="M0 -9 L 15 0 L 0 9 L 4 0 Z" fill="#16C95C" /></g>
        <ellipse cx="240" cy="372" rx="135" ry="13" fill="#34465A" opacity="0.07" />

        <g stroke="#34465A" strokeWidth="2.2" strokeLinecap="round"><line x1="214" y1="300" x2="214" y2="256" /><line x1="266" y1="300" x2="266" y2="256" /></g>
        <rect x="206" y="250" width="68" height="9" rx="4.5" fill="#C9CFD6" stroke="#34465A" strokeWidth="2" />

        <g stroke="#34465A" strokeWidth="2.4" strokeLinejoin="round">
          <rect x="158" y="298" width="164" height="86" rx="22" fill="#E68E72" />
          <line x1="194" y1="316" x2="194" y2="368" stroke="#CF6E54" strokeWidth="4" />
          <line x1="222" y1="316" x2="222" y2="368" stroke="#CF6E54" strokeWidth="4" />
          <line x1="258" y1="316" x2="258" y2="368" stroke="#CF6E54" strokeWidth="4" />
          <line x1="286" y1="316" x2="286" y2="368" stroke="#CF6E54" strokeWidth="4" />
          <circle cx="186" cy="388" r="9" fill="#34465A" /><circle cx="294" cy="388" r="9" fill="#34465A" />
        </g>

        <g stroke="#34465A" strokeWidth="2.4" strokeLinecap="round"><line x1="222" y1="296" x2="222" y2="320" /><line x1="258" y1="296" x2="258" y2="320" /></g>
        <g stroke="#F0A15C" strokeWidth="6" strokeLinecap="round"><line x1="222" y1="296" x2="222" y2="320" /><line x1="258" y1="296" x2="258" y2="320" /></g>
        <g stroke="#34465A" strokeWidth="2.2" strokeLinecap="round" fill="none"><path d="M222 320 l-6 5 M222 320 l0 6 M222 320 l6 5" /><path d="M258 320 l-6 5 M258 320 l0 6 M258 320 l6 5" /></g>

        <path d="M160 252 q-20 16 -16 38 q9 -2 13 -9 q1 9 9 9 q5 -10 1 -20 z" fill="#74A6B3" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />

        <path d="M168 244 C 162 188 200 160 240 160 C 280 160 318 188 312 244 C 309 278 282 300 240 300 C 198 300 171 278 168 244 Z" fill="#8FBAC6" stroke="#34465A" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M198 254 C 206 292 274 292 282 254 C 277 232 203 232 198 254 Z" fill="#F1EADA" />

        <path d="M232 158 q-6 -12 -16 -12 q5 8 4 16 q6 -2 12 -4 z" fill="#8FBAC6" stroke="#34465A" strokeWidth="2" />
        <path d="M244 157 q2 -13 12 -15 q-1 9 -5 16 q-4 -1 -7 -1 z" fill="#8FBAC6" stroke="#34465A" strokeWidth="2" />

        <path d="M158 236 C 138 246 138 276 162 286 C 175 281 178 250 173 238 Z" fill="#74A6B3" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />

        <path d="M306 238 C 326 232 344 240 344 220 C 332 214 312 220 304 230 Z" fill="#74A6B3" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
        <g transform="rotate(-12 330 206)">
          <rect x="306" y="190" width="56" height="32" rx="6" fill="#F6F1E6" stroke="#34465A" strokeWidth="2.2" />
          <rect x="306" y="190" width="18" height="32" rx="6" fill="#E68E72" />
          <line x1="330" y1="200" x2="354" y2="200" stroke="#C9B9A6" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="330" y1="208" x2="354" y2="208" stroke="#C9B9A6" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="330" y1="216" x2="346" y2="216" stroke="#C9B9A6" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        <path d="M186 244 q54 24 108 0 q6 9 -1 17 q-52 22 -106 0 q-7 -8 -1 -17 z" fill="#E8B25C" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M192 258 q-28 2 -44 16 q-5 8 3 11 q22 -14 44 -14 z" fill="#E8B25C" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />

        <ellipse cx="206" cy="222" rx="10" ry="7" fill="#F2C0A8" opacity="0.7" />
        <ellipse cx="274" cy="222" rx="10" ry="7" fill="#F2C0A8" opacity="0.7" />
        <ellipse cx="221" cy="210" rx="8" ry="10" fill="#2A3645" />
        <ellipse cx="259" cy="210" rx="8" ry="10" fill="#2A3645" />
        <circle cx="224" cy="206" r="2.6" fill="#FFFFFF" /><circle cx="262" cy="206" r="2.6" fill="#FFFFFF" />
        <path d="M240 218 q9 4 0 15 q-9 -4 0 -15 z" fill="#F0A15C" stroke="#34465A" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}
