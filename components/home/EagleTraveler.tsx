'use client'

import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// "Captain Eagle" — VisitPlane's brand mascot, hand-built as inline vector art.
// A friendly anthropomorphic bald eagle in a travel hoodie + trekking backpack,
// aviators pushed up, gripping a boarding pass, perched on a rolling suitcase,
// riding the signature green wave. Crisp at any size, ~no payload, fully on-brand.
// Sits under the "Visa research, without the guesswork" headline in DifferenceSection.
// ─────────────────────────────────────────────────────────────────────────────
export default function EagleTraveler() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-10 mt-2 flex w-full justify-center sm:mb-12"
    >
      <svg
        viewBox="0 0 460 452"
        className="h-auto w-[290px] select-none sm:w-[360px] lg:w-[420px]"
        role="img"
        aria-label="VisitPlane eagle travel mascot riding a green wave on a suitcase, holding a boarding pass"
      >
        <defs>
          <linearGradient id="et-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5EEAD4" stopOpacity="0.25" />
            <stop offset="0.5" stopColor="#34D399" />
            <stop offset="1" stopColor="#86EFAC" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="et-case" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF8A6B" />
            <stop offset="1" stopColor="#EF6038" />
          </linearGradient>
          <linearGradient id="et-hoodie" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F9CB45" />
            <stop offset="1" stopColor="#EFAE1C" />
          </linearGradient>
          <linearGradient id="et-pack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9DA9B6" />
            <stop offset="1" stopColor="#7C8997" />
          </linearGradient>
        </defs>

        {/* signature wave */}
        <path d="M0 372 C 110 322 200 412 250 372 S 380 300 460 348" fill="none" stroke="url(#et-wave)" strokeWidth="14" strokeLinecap="round" />

        {/* dashed flight path + paper plane */}
        <path d="M120 120 Q 250 60 360 118" fill="none" stroke="#16C95C" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 9" opacity="0.7" />
        <g transform="translate(360 112) rotate(28)">
          <path d="M0 -10 L 16 0 L 0 10 L 4 0 Z" fill="#16C95C" />
        </g>

        {/* ground shadow */}
        <ellipse cx="232" cy="406" rx="120" ry="15" fill="#0F2A3A" opacity="0.08" />

        {/* telescoping handle (behind) */}
        <g stroke="#C9CFD6" strokeWidth="7" strokeLinecap="round">
          <line x1="205" y1="300" x2="205" y2="250" />
          <line x1="259" y1="300" x2="259" y2="250" />
        </g>
        <rect x="198" y="244" width="68" height="9" rx="4.5" fill="#C9CFD6" />

        {/* backpack body + passport (behind torso) */}
        <rect x="172" y="178" width="120" height="120" rx="34" fill="url(#et-pack)" />
        <rect x="196" y="196" width="72" height="58" rx="16" fill="#8B98A5" />
        <rect x="262" y="168" width="26" height="40" rx="4" fill="#1F4E63" transform="rotate(10 275 188)" />
        <rect x="266" y="174" width="18" height="9" rx="2" fill="#E6B84C" transform="rotate(10 275 178)" />

        {/* suitcase */}
        <rect x="150" y="300" width="164" height="88" rx="22" fill="url(#et-case)" />
        <g stroke="#DA5530" strokeWidth="4" strokeLinecap="round" opacity="0.85">
          <line x1="186" y1="320" x2="186" y2="372" />
          <line x1="214" y1="320" x2="214" y2="372" />
          <line x1="250" y1="320" x2="250" y2="372" />
          <line x1="278" y1="320" x2="278" y2="372" />
        </g>
        <rect x="150" y="334" width="164" height="6" fill="#DA5530" opacity="0.55" />
        <circle cx="178" cy="392" r="9" fill="#2E3A45" />
        <circle cx="286" cy="392" r="9" fill="#2E3A45" />

        {/* legs + sneakers */}
        <rect x="198" y="296" width="26" height="80" rx="12" fill="#BBD6EA" />
        <rect x="238" y="296" width="26" height="80" rx="12" fill="#A9C7DD" />
        <path d="M192 366 q-8 14 8 18 l30 0 q7 0 7 -9 l0 -12 q-24 5 -45 3 z" fill="#FFFFFF" />
        <path d="M236 366 q-6 14 10 18 l30 0 q7 0 7 -9 l0 -12 q-24 5 -47 3 z" fill="#F1F5F9" />
        <rect x="188" y="382" width="50" height="6" rx="3" fill="#14B8A6" />
        <rect x="240" y="382" width="50" height="6" rx="3" fill="#14B8A6" />

        {/* torso / hoodie */}
        <path d="M188 230 q-6 -42 44 -44 q50 2 44 44 q10 46 4 78 l-96 0 q-6 -32 4 -78 z" fill="url(#et-hoodie)" />
        <path d="M196 250 q36 16 72 0 l-3 13 q-33 13 -66 0 z" fill="#E5A91E" opacity="0.45" />
        <line x1="232" y1="206" x2="226" y2="252" stroke="#E5A91E" strokeWidth="3" strokeLinecap="round" />
        <line x1="232" y1="206" x2="238" y2="252" stroke="#E5A91E" strokeWidth="3" strokeLinecap="round" />
        <circle cx="226" cy="254" r="3" fill="#E5A91E" />
        <circle cx="238" cy="254" r="3" fill="#E5A91E" />

        {/* backpack straps */}
        <path d="M210 214 q-8 -10 4 -12 q16 36 36 0 q12 2 4 12 q-4 64 -8 84 l-12 0 q-3 -42 -28 -84 z" fill="#14B8A6" opacity="0" />
        <rect x="206" y="216" width="11" height="80" rx="5.5" fill="#13A89B" transform="rotate(-7 211 256)" />
        <rect x="247" y="216" width="11" height="80" rx="5.5" fill="#13A89B" transform="rotate(7 252 256)" />
        <rect x="203" y="258" width="17" height="10" rx="2" fill="#0E8F84" transform="rotate(-7 211 263)" />
        <rect x="245" y="258" width="17" height="10" rx="2" fill="#0E8F84" transform="rotate(7 253 263)" />

        {/* left arm resting */}
        <path d="M192 240 q-22 6 -22 30 q3 15 19 14 q11 -2 12 -16 q-4 -18 -9 -28 z" fill="url(#et-hoodie)" />
        <ellipse cx="180" cy="282" rx="11" ry="9" fill="#F6A823" />

        {/* right arm raised with boarding pass */}
        <path d="M270 236 q26 -10 36 8 q6 18 -6 30 q-16 4 -26 -8 q-8 -16 -4 -30 z" fill="url(#et-hoodie)" />
        <g transform="rotate(18 300 250)">
          <rect x="276" y="232" width="74" height="36" rx="6" fill="#FF6B4A" />
          <rect x="276" y="232" width="23" height="36" rx="6" fill="#FF8E74" />
          <circle cx="287" cy="250" r="6" fill="#FFE3DA" />
          <line x1="308" y1="242" x2="344" y2="242" stroke="#FFD7CC" strokeWidth="3" strokeLinecap="round" />
          <line x1="308" y1="251" x2="344" y2="251" stroke="#FFD7CC" strokeWidth="3" strokeLinecap="round" />
          <line x1="308" y1="260" x2="334" y2="260" stroke="#FFD7CC" strokeWidth="3" strokeLinecap="round" />
        </g>
        <ellipse cx="300" cy="244" rx="11" ry="9" fill="#F6A823" transform="rotate(18 300 244)" />

        {/* neck tuft */}
        <path d="M204 206 q28 22 56 0 q4 12 -6 18 q-22 10 -44 0 q-10 -6 -6 -18 z" fill="#EAEFF4" />

        {/* head */}
        <ellipse cx="232" cy="162" rx="52" ry="47" fill="#F8FAFC" />
        {/* crest tufts */}
        <path d="M188 138 q-18 -10 -28 -2 q16 4 22 16 q8 -4 6 -14 z" fill="#EEF2F6" />
        <path d="M276 138 q18 -10 28 -2 q-16 4 -22 16 q-8 -4 -6 -14 z" fill="#EEF2F6" />
        <path d="M232 118 q-20 2 -22 20 q12 -12 22 -12 q10 0 22 12 q-2 -18 -22 -20 z" fill="#EEF2F6" />
        {/* cheeks */}
        <ellipse cx="200" cy="178" rx="10" ry="7" fill="#FBD7C9" opacity="0.7" />
        <ellipse cx="264" cy="178" rx="10" ry="7" fill="#FBD7C9" opacity="0.7" />
        {/* eyes */}
        <ellipse cx="214" cy="158" rx="13" ry="15" fill="#FFFFFF" stroke="#DCE3EA" strokeWidth="1" />
        <ellipse cx="250" cy="158" rx="13" ry="15" fill="#FFFFFF" stroke="#DCE3EA" strokeWidth="1" />
        <circle cx="216" cy="160" r="7" fill="#23303B" />
        <circle cx="248" cy="160" r="7" fill="#23303B" />
        <circle cx="218" cy="157" r="2.4" fill="#FFFFFF" />
        <circle cx="250" cy="157" r="2.4" fill="#FFFFFF" />
        {/* brows */}
        <path d="M202 144 q12 -7 24 -2" fill="none" stroke="#C7D0D9" strokeWidth="3" strokeLinecap="round" />
        <path d="M238 142 q12 -5 24 2" fill="none" stroke="#C7D0D9" strokeWidth="3" strokeLinecap="round" />
        {/* beak */}
        <path d="M232 172 q14 0 15 12 q0 12 -15 18 q-15 -6 -15 -18 q1 -12 15 -12 z" fill="#F6A823" />
        <path d="M232 190 q9 0 13 5 q-13 7 -26 0 q4 -5 13 -5 z" fill="#E08A12" />
        <circle cx="226" cy="182" r="1.6" fill="#C9790E" />
        <circle cx="238" cy="182" r="1.6" fill="#C9790E" />
        {/* aviators pushed up on forehead */}
        <g>
          <ellipse cx="214" cy="132" rx="16" ry="11" fill="#0F2A3A" />
          <ellipse cx="214" cy="132" rx="13" ry="8.5" fill="#2DD4BF" opacity="0.85" />
          <ellipse cx="250" cy="132" rx="16" ry="11" fill="#0F2A3A" />
          <ellipse cx="250" cy="132" rx="13" ry="8.5" fill="#2DD4BF" opacity="0.85" />
          <path d="M229 130 q3 -4 6 0" fill="none" stroke="#0F2A3A" strokeWidth="3" />
          <line x1="198" y1="129" x2="190" y2="124" stroke="#0F2A3A" strokeWidth="3" strokeLinecap="round" />
          <line x1="266" y1="129" x2="274" y2="124" stroke="#0F2A3A" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  )
}
