'use client'

import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Full-width illustrated hero banner — a warm, shaded flat-illustration travel
// scene: sun, clouds and distant birds, layered green hills with trees, and two
// friendly VisitPlane traveller birds (one waving, one walking off with a yellow
// suitcase) on a sandy path with the brand-green route + paper plane. Hand-built
// inline vector (gradient shading for depth), edge-to-edge, responsive. The
// headline lives as crisp HTML above this in DifferenceSection.
// ─────────────────────────────────────────────────────────────────────────────
export default function BirdHeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative left-1/2 mb-10 w-screen max-w-[1280px] -translate-x-1/2 px-4 sm:mb-12"
    >
      <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-200/70">
        <svg viewBox="0 0 1200 440" className="block h-auto w-full" role="img" aria-label="Two friendly VisitPlane traveller birds — one waving, one walking off with a suitcase — in a warm illustrated travel scene with hills, trees and a flight route.">
          <defs>
            <linearGradient id="bhx-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBF1DD" /><stop offset="0.5" stopColor="#EAF4EE" /><stop offset="1" stopColor="#D6EEF6" /></linearGradient>
            <linearGradient id="bhx-case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F8D766" /><stop offset="1" stopColor="#E2B032" /></linearGradient>
            <linearGradient id="bhx-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A8CFD9" /><stop offset="1" stopColor="#7BAAB9" /></linearGradient>
            <linearGradient id="bhx-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B9D6B3" /><stop offset="1" stopColor="#93B98C" /></linearGradient>
            <linearGradient id="bhx-belly" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F8F2E6" /><stop offset="1" stopColor="#E7DCC4" /></linearGradient>
          </defs>
          <rect x="0" y="0" width="1200" height="440" fill="url(#bhx-sky)" />
          <circle cx="1015" cy="86" r="128" fill="#FBE2A8" opacity="0.5" />
          <circle cx="1015" cy="86" r="72" fill="#FCEFC9" opacity="0.9" />
          <g stroke="#F4D790" strokeWidth="3" strokeLinecap="round" opacity="0.6"><line x1="950" y1="20" x2="965" y2="35" /><line x1="1080" y1="20" x2="1065" y2="35" /><line x1="1109" y1="86" x2="1129" y2="86" /></g>
          <g fill="#FFFFFF" opacity="0.92"><ellipse cx="250" cy="92" rx="48" ry="22" /><ellipse cx="294" cy="80" rx="34" ry="22" /><ellipse cx="206" cy="80" rx="30" ry="18" /></g>
          <g fill="#FFFFFF" opacity="0.85"><ellipse cx="660" cy="64" rx="40" ry="18" /><ellipse cx="700" cy="54" rx="27" ry="17" /></g>
          <g fill="none" stroke="#7C98A6" strokeWidth="2.4" strokeLinecap="round" opacity="0.6"><path d="M520 120 q10 -8 20 0 q10 -8 20 0" /><path d="M470 150 q8 -6 16 0 q8 -6 16 0" /><path d="M576 96 q7 -5 14 0 q7 -5 14 0" /></g>

          <path d="M0 252 Q 320 222 660 248 T 1200 238 L1200 440 L0 440 Z" fill="#D2E8DC" />
          <path d="M0 286 Q 300 250 640 280 T 1200 268 L1200 440 L0 440 Z" fill="#BBE0CC" />
          <g><path d="M150 286 q-32 -58 0 -90 q32 32 0 90 z" fill="#7FBE99" /><path d="M118 288 q-26 -46 0 -74 q26 28 0 74 z" fill="#92CBA8" /><rect x="146" y="280" width="8" height="20" fill="#9C6B3F" /></g>
          <g><path d="M1052 280 q-36 -62 0 -96 q36 34 0 96 z" fill="#E59E55" /><path d="M1024 282 q-26 -46 0 -72 q26 28 0 72 z" fill="#EBB068" /><rect x="1048" y="274" width="8" height="22" fill="#9C6B3F" /></g>
          <g><path d="M470 282 q-24 -44 0 -68 q24 26 0 68 z" fill="#86C29F" /><rect x="466" y="276" width="7" height="16" fill="#9C6B3F" /></g>

          <path d="M0 330 Q 360 296 720 326 T 1200 314 L1200 440 L0 440 Z" fill="#9FD4BB" />
          <path d="M0 370 Q 320 348 640 368 T 1200 362 L1200 440 L0 440 Z" fill="#E7D8B6" />
          <path d="M0 370 Q 320 348 640 368 T 1200 362" fill="none" stroke="#34D399" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
          <g fill="#D8C7A0"><ellipse cx="120" cy="392" rx="14" ry="4" /><ellipse cx="520" cy="404" rx="16" ry="4" /><ellipse cx="980" cy="396" rx="14" ry="4" /></g>

          <path d="M120 150 Q 600 66 1060 138" fill="none" stroke="#16C95C" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2 10" opacity="0.55" />
          <g transform="translate(1060 132) rotate(24)"><path d="M0 -10 L 17 0 L 0 10 L 5 0 Z" fill="#16C95C" /></g>

          <ellipse cx="700" cy="410" rx="92" ry="13" fill="#34465A" opacity="0.09" />
          <ellipse cx="330" cy="410" rx="80" ry="12" fill="#34465A" opacity="0.09" />

          <g stroke="#34465A" strokeWidth="2.4" strokeLinejoin="round">
            <rect x="744" y="320" width="58" height="74" rx="12" fill="url(#bhx-case)" />
            <line x1="762" y1="332" x2="762" y2="382" stroke="#D9A93A" strokeWidth="3.5" /><line x1="784" y1="332" x2="784" y2="382" stroke="#D9A93A" strokeWidth="3.5" />
            <rect x="760" y="310" width="26" height="9" rx="4.5" fill="#C9CFD6" />
            <circle cx="757" cy="398" r="7" fill="#34465A" /><circle cx="789" cy="398" r="7" fill="#34465A" />
          </g>
          <rect x="748" y="326" width="7" height="14" rx="2" fill="#E58E6E" stroke="#34465A" strokeWidth="1.6" />
          <line x1="700" y1="330" x2="772" y2="316" stroke="#8FA0A8" strokeWidth="6" strokeLinecap="round" />

          <g stroke="#34465A" strokeWidth="2.4" strokeLinecap="round"><line x1="660" y1="372" x2="650" y2="402" /><line x1="690" y1="374" x2="700" y2="402" /></g>
          <g stroke="#F0A15C" strokeWidth="6" strokeLinecap="round"><line x1="660" y1="372" x2="650" y2="402" /><line x1="690" y1="374" x2="700" y2="402" /></g>
          <path d="M620 250 q-22 18 -18 40 q9 -2 13 -10 q1 9 9 9 q5 -10 1 -20 z" fill="#7DAE94" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M628 312 C 622 258 660 232 700 232 C 740 232 772 262 760 312 C 756 350 728 372 690 372 C 652 372 632 348 628 312 Z" fill="url(#bhx-b)" stroke="#34465A" strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="668" cy="262" rx="26" ry="20" fill="#FFFFFF" opacity="0.22" />
          <path d="M652 322 C 660 356 726 356 734 322 C 729 302 657 302 652 322 Z" fill="url(#bhx-belly)" />
          <path d="M620 300 C 600 310 602 338 622 346 C 635 341 638 312 633 302 Z" fill="#7DAE94" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M608 330 q12 6 22 2 M610 340 q11 5 20 1" fill="none" stroke="#34465A" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
          <path d="M735 300 C 752 296 770 304 768 286 C 756 280 740 286 732 294 Z" fill="#7DAE94" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M636 252 q-6 -12 -16 -12 q5 8 4 16 q6 -2 12 -4 z" fill="#A7C8A0" stroke="#34465A" strokeWidth="2" />
          <path d="M648 250 q2 -13 12 -15 q-1 9 -5 16 q-4 -1 -7 -1 z" fill="#A7C8A0" stroke="#34465A" strokeWidth="2" />
          <path d="M636 296 q56 24 110 0 q6 9 -1 17 q-54 22 -108 0 q-7 -8 -1 -17 z" fill="#E58E6E" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M642 310 q-28 4 -42 18 q-4 8 4 10 q20 -14 40 -16 z" fill="#E07E5C" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <ellipse cx="667" cy="290" rx="9" ry="7" fill="#F2C0A8" opacity="0.6" /><ellipse cx="713" cy="290" rx="9" ry="7" fill="#F2C0A8" opacity="0.6" />
          <ellipse cx="672" cy="286" rx="8.5" ry="11" fill="#2A3645" /><ellipse cx="710" cy="286" rx="8.5" ry="11" fill="#2A3645" />
          <circle cx="675" cy="281" r="2.6" fill="#FFFFFF" /><circle cx="713" cy="281" r="2.6" fill="#FFFFFF" />
          <path d="M662 274 q9 -4 18 0 M702 274 q9 -4 18 0" fill="none" stroke="#34465A" strokeWidth="2" strokeLinecap="round" />
          <path d="M691 296 q9 4 0 15 q-9 -4 0 -15 z" fill="#F0A15C" stroke="#34465A" strokeWidth="2" strokeLinejoin="round" />

          <g stroke="#34465A" strokeWidth="2.4" strokeLinecap="round"><line x1="316" y1="378" x2="316" y2="404" /><line x1="346" y1="378" x2="346" y2="404" /></g>
          <g stroke="#F0A15C" strokeWidth="6" strokeLinecap="round"><line x1="316" y1="378" x2="316" y2="404" /><line x1="346" y1="378" x2="346" y2="404" /></g>
          <path d="M392 318 C 422 298 442 244 416 230 C 398 240 388 286 386 312 Z" fill="#5E94A3" stroke="#34465A" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M404 252 q8 30 -8 56 M414 258 q6 26 -10 48" fill="none" stroke="#34465A" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
          <path d="M258 330 C 252 278 290 250 330 250 C 370 250 408 278 402 330 C 398 370 370 392 330 392 C 290 392 262 368 258 330 Z" fill="url(#bhx-a)" stroke="#34465A" strokeWidth="2.4" strokeLinejoin="round" />
          <ellipse cx="298" cy="284" rx="26" ry="20" fill="#FFFFFF" opacity="0.25" />
          <path d="M288 340 C 296 374 364 374 372 340 C 367 320 293 320 288 340 Z" fill="url(#bhx-belly)" />
          <path d="M250 322 C 232 332 234 360 254 368 C 267 363 270 334 265 324 Z" fill="#5E94A3" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M240 344 q12 6 22 2 M242 354 q11 5 20 1" fill="none" stroke="#34465A" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
          <path d="M322 248 q-6 -12 -16 -12 q5 8 4 16 q6 -2 12 -4 z" fill="#8FBAC6" stroke="#34465A" strokeWidth="2" />
          <path d="M334 247 q2 -13 12 -15 q-1 9 -5 16 q-4 -1 -7 -1 z" fill="#8FBAC6" stroke="#34465A" strokeWidth="2" />
          <path d="M278 326 q52 22 104 0 q6 9 -1 17 q-50 20 -102 0 q-7 -8 -1 -17 z" fill="#E8B25C" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M284 340 q-26 2 -42 16 q-5 8 3 10 q20 -12 40 -14 z" fill="#DCA23F" stroke="#34465A" strokeWidth="2.2" strokeLinejoin="round" />
          <ellipse cx="300" cy="300" rx="10" ry="7" fill="#F2C0A8" opacity="0.7" /><ellipse cx="362" cy="300" rx="10" ry="7" fill="#F2C0A8" opacity="0.7" />
          <ellipse cx="315" cy="288" rx="8.5" ry="11" fill="#2A3645" /><ellipse cx="349" cy="288" rx="8.5" ry="11" fill="#2A3645" />
          <circle cx="318" cy="283" r="2.8" fill="#FFFFFF" /><circle cx="352" cy="283" r="2.8" fill="#FFFFFF" />
          <path d="M305 276 q9 -4 18 0 M345 276 q9 -4 18 0" fill="none" stroke="#34465A" strokeWidth="2" strokeLinecap="round" />
          <path d="M331 296 q9 4 0 15 q-9 -4 0 -15 z" fill="#F0A15C" stroke="#34465A" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  )
}
