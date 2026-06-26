// ─────────────────────────────────────────────────────────────────────────────
// CURATED, OFFICIAL-SOURCED visa document requirements — per (passport → dest).
//
// The generic checklist (components/visa/DocumentChecklist resolveDocumentGroups)
// is a COUNTRY-NEUTRAL preparation baseline. It is NOT the exact official list,
// which is nationality- and visa-type-specific. This file holds routes we've
// transcribed from the destination's OFFICIAL requirement sheet, with the source
// cited. When a route exists here, the visa page shows these exact requirements
// (and the printable uses them); otherwise it shows the generic baseline clearly
// labelled as "general guide — confirm at the official source".
//
// MAINTENANCE: add a route only from an official consulate / VAC / government
// document. Keep `sourceUrl` + `lastVerified` accurate. Never invent items.
// ─────────────────────────────────────────────────────────────────────────────

export interface ReqDoc {
  name: string
  description?: string
  /** Shown as a condition chip, e.g. "If you are employed". */
  conditional?: string
}

export interface ReqGroup {
  tier: 'mandatory' | 'conditional' | 'recommended'
  label: string
  items: ReqDoc[]
}

export interface OfficialRequirements {
  visaType: string
  /** Important process caveat for this nationality (e.g. eVisa not available). */
  processNote?: string
  sourceLabel: string
  sourceUrl: string
  /** 'YYYY-MM' the route was transcribed/verified from the official document. */
  lastVerified: string
  groups: ReqGroup[]
}

const key = (p: string, d: string) => `${p.trim().toLowerCase()}→${d.trim().toLowerCase()}`

// ── Pakistan → Turkey (tourism, sticker visa via Anatolia VAC) ──────────────
// Transcribed from the official Türkiye Consulate / Anatolia Visa Application
// Centre tourism requirement sheet (provided 2026-06).
const PK_TR: OfficialRequirements = {
  visaType: 'Tourist visa (sticker, via Anatolia VAC)',
  processNote:
    'Pakistani passport holders apply for a sticker visa through the Anatolia Visa Application Centre — the Türkiye e-Visa is only open to holders of a valid Schengen, UK, US or Ireland visa/residence permit. The list below is the tourism category; business and conference visits add the items noted.',
  sourceLabel: 'Türkiye Consulate General (Pakistan) — official tourism visa requirement sheet',
  sourceUrl: 'https://www.konsolosluk.gov.tr/Visa/Index',
  lastVerified: '2026-06',
  groups: [
    {
      tier: 'mandatory',
      label: 'Mandatory — all tourism applicants',
      items: [
        { name: 'Visa application form', description: 'Completed online at konsolosluk.gov.tr, then printed and signed. Must include CNIC number, mother & father names, and full residential + host addresses.' },
        { name: 'Two biometric photos', description: 'Recent, colour, white background, 5×5 cm. The same photo must appear on the application form.' },
        { name: 'Visa interview form', description: 'Issued to you by the Anatolia Visa Application Centre.' },
        { name: 'Request (cover) letter', description: 'Signed by the applicant.' },
        { name: 'Passport + copies', description: 'Valid at least 6 months, with copies of your current and previous passports. If lost: attested police report + its English translation.' },
        { name: 'Travel health insurance', description: 'Covering €30,000 / US$50,000, the full period of stay in Turkey, and repatriation costs.' },
        { name: 'Polio vaccination certificate', description: 'From a government hospital or authorised lab; valid for the travel period and issued within the last year.' },
        { name: 'Flight reservation', description: 'Booking only (do not buy yet). Travel gap of 15 days for Islamabad & Lahore, or 17 days for Karachi, from the submission date.' },
        { name: 'Hotel reservation or invitation letter', description: 'Reservation only, or an invitation letter stating accommodation details (if applicable).' },
        { name: 'NADRA FRC / MRC', description: 'Updated Family Registration Certificate (or Marriage Registration Certificate if newly married). Also required for individual applicants.' },
        { name: 'Tax certificate (FBR / NTN)', description: 'FBR / NTN / income / Active Taxpayer certificate(s) for you and your company, recently issued.' },
        { name: 'Bank documents', description: 'Account maintenance certificate(s) (personal & company) + original last-3-months statements — signed, stamped, and not older than 7 days.' },
      ],
    },
    {
      tier: 'conditional',
      label: 'Proof of work & finances — by your situation',
      items: [
        { name: 'Business-owner statement', description: 'On company letterhead, stating the purpose of the visit.', conditional: 'If you own a business' },
        { name: 'Freelancer contract', description: 'Contract signed by the company and yourself.', conditional: 'If you are a freelancer' },
        { name: 'Employer statement + salary slips', description: 'Employer letter on letterhead stating your title, salary, employment duration and the purpose of the visit, plus the last 3 months’ salary slips.', conditional: 'If you are employed' },
        { name: 'Sponsor affidavit + income proof', description: 'Sponsor’s affidavit on stamp paper covering your expenses, plus proof of the sponsor’s income (business letter, NTN, bank statement, salary, employment duration).', conditional: 'If someone is sponsoring you' },
      ],
    },
    {
      tier: 'conditional',
      label: 'If travelling for business',
      items: [
        { name: 'Invitation letter', description: 'From the Turkish company / organisation / person, with your details.' },
        { name: 'Chamber recommendation letter', description: 'From the related Chamber of Commerce & Industry.' },
        { name: 'Chamber membership certificate', description: 'Of the related Chamber of Commerce & Industry.' },
      ],
    },
    {
      tier: 'conditional',
      label: 'If attending a conference',
      items: [
        { name: 'Conference invitation letter', description: 'From the organising authority in Turkey for the conference / seminar / meeting.' },
      ],
    },
  ],
}

export const OFFICIAL_REQUIREMENTS: Record<string, OfficialRequirements> = {
  [key('Pakistan', 'Turkey')]: PK_TR,
}

/** Returns the curated official requirements for a route, or null. */
export function getOfficialRequirements(passport: string, destination: string): OfficialRequirements | null {
  if (!passport || !destination) return null
  return OFFICIAL_REQUIREMENTS[key(passport, destination)] ?? null
}
