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

// ── Pakistan → Saudi Arabia (Group-B; via Tasheer VAC, or e-Visa with US/UK/Schengen) ──
// Sourced from the official Saudi e-Visa Help Center (help.visitsaudi.com), 2026-06.
const PK_SA: OfficialRequirements = {
  visaType: 'Tourist visit visa (via Tasheer VAC, or e-Visa if you hold a US/UK/Schengen visa)',
  processNote:
    'Saudi Arabia classes Pakistan as a "Group B" nationality, so Pakistani passport holders are NOT eligible for the direct online Saudi e-Visa. You apply through the Saudi embassy or the official Tasheer Visa Application Centre in Pakistan (Islamabad, Lahore, Karachi, Peshawar, Quetta, Multan), where biometrics are taken. Exception: if you hold a valid, already-used US, UK or Schengen visa — or US/UK/EU permanent residency — you can get the e-Visa or visa on arrival.',
  sourceLabel: 'Saudi e-Visa Help Center (Visit Saudi / Saudi Tourism Authority)',
  sourceUrl: 'https://help.visitsaudi.com/hc/en-us/articles/360009343980-Who-is-eligible-for-a-visit-visa-',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid at least 6 months on the date of entry.' },
      { name: 'Recent photo', description: 'White background, taken within the last 6 months (portal upload: 200×200 px, 5–100 KB).' },
    ]},
    { tier: 'conditional', label: 'If you qualify for the e-Visa / visa on arrival', items: [
      { name: 'Valid US / UK / Schengen visa', description: 'Tourist or business — it must have been used (you entered that country) at least once.', conditional: 'Using the e-Visa exception' },
      { name: 'US / UK / EU permanent residency', description: 'A valid permanent-resident card.', conditional: 'Alternative basis for the exception' },
    ]},
    { tier: 'conditional', label: 'Standard route — at the Tasheer VAC', items: [
      { name: 'Documents set by the embassy / Tasheer centre', description: 'Biometrics plus the documents the Saudi embassy or Tasheer VAC asks for at submission — the official portal does not publish a fixed online checklist for this route, so confirm directly with the centre.', conditional: 'If you don’t hold a qualifying US/UK/Schengen visa or residency' },
    ]},
  ],
}

// ── Pakistan → United Kingdom (Standard Visitor visa) — GOV.UK, 2026-06 ──
const PK_GB: OfficialRequirements = {
  visaType: 'Standard Visitor visa',
  processNote:
    'Pakistani nationals apply online for a Standard Visitor visa before travelling, then attend a UK Visa Application Centre (VFS Global) in Pakistan to give biometrics. A TB test certificate is only required for stays of 6 months or more — not for an ordinary tourist visit.',
  sourceLabel: 'GOV.UK — Standard Visitor visa',
  sourceUrl: 'https://www.gov.uk/standard-visitor/apply-standard-visitor-visa',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Provided in your online application & uploaded', items: [
      { name: 'Passport or travel document', description: 'Valid for the whole of your stay in the UK.' },
      { name: 'Travel & trip details', description: 'Your dates, where you’ll stay, and the estimated cost of the trip.' },
      { name: 'Home address & residence', description: 'Your current address and how long you’ve lived there.' },
      { name: 'Financial evidence', description: 'Proof you can support yourself — e.g. bank statements or payslips.' },
      { name: 'Certified translations', description: 'For any document not in English or Welsh.' },
    ]},
    { tier: 'conditional', label: 'Depending on your circumstances', items: [
      { name: 'Employer letter', description: 'On headed paper confirming your role, salary and length of employment.', conditional: 'If employed' },
      { name: 'Self-employment evidence', description: 'Business registration documents or recent invoices.', conditional: 'If self-employed' },
      { name: 'Education letter', description: 'From your school/university confirming enrolment and approved leave.', conditional: 'If a student' },
      { name: 'Sponsor / host details', description: 'Who is paying for your trip, proof of their funds and legal UK status, and any UK family details.', conditional: 'If someone funds your trip or you have a UK host' },
      { name: 'Travel history', description: 'Previous passports or a record of past trips.', conditional: 'If you have travel history to declare' },
      { name: 'TB test certificate', description: 'From a gov.uk-approved clinic in Pakistan.', conditional: 'Only if staying 6 months or more' },
    ]},
  ],
}

// ── Pakistan → Malaysia (Tourist eVisa) — Malaysian Immigration Dept, 2026-06 ──
const PK_MY: OfficialRequirements = {
  visaType: 'Tourist eVisa (single-entry, up to 30 days)',
  processNote:
    'Pakistani passport holders need a visa and can apply fully online for the eVISA (single-entry, up to 30 days) — no embassy visit. Pakistan is not eligible for eNTRI (China/India only). Separately, complete the free Malaysia Digital Arrival Card (MDAC) within 3 days before you arrive.',
  sourceLabel: 'Malaysian Immigration Department (Jabatan Imigresen Malaysia) — eVISA',
  sourceUrl: 'https://malaysiavisa.imi.gov.my/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for the eVISA', items: [
      { name: 'Passport biodata page', description: 'Scanned copy; passport valid more than 6 months from your travel date.' },
      { name: 'Passport photo', description: 'Recent, white background.' },
      { name: 'Confirmed return flight', description: 'Proof of a confirmed return / onward air ticket.' },
      { name: 'Proof of accommodation', description: 'Hotel booking confirmation or equivalent.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Birth certificate', description: 'Scanned copy.', conditional: 'For minor (under-age) applicants' },
      { name: 'Additional supporting documents', description: 'e.g. financial proof / sponsor or invitation letter.', conditional: 'If Immigration requests them during review' },
    ]},
  ],
}

// ── Pakistan → Thailand (Tourist Visa TR / e-Visa) — Royal Thai Embassy Islamabad, 2026-06 ──
const PK_TH: OfficialRequirements = {
  visaType: 'Tourist Visa (TR) — applied online as an e-Visa',
  processNote:
    'Pakistani passport holders apply online at thaievisa.go.th (no in-person embassy visit); the application routes to the Royal Thai Embassy Islamabad or Consulate-General Karachi by your residence, and you must be physically present in Pakistan throughout. Carry the printed e-Visa (not a phone copy) at check-in and immigration.',
  sourceLabel: 'Royal Thai e-Visa (Thai MFA) — Tourist Visa, per Royal Thai Embassy Islamabad requirements',
  sourceUrl: 'https://www.thaievisa.go.th/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport (biodata page)', description: 'Copy of the bio page (two copies); passport valid with blank pages.' },
      { name: 'Recent photo', description: 'Taken within the last 6 months; JPG, max 3 MB.' },
      { name: 'Personal cover letter', description: 'Your name, passport number, purpose of visit and travel dates.' },
      { name: 'Employer / organisation letter', description: 'Stating your relationship, no-objection to travel and approved leave.' },
      { name: 'Organisation registration paper', description: 'Of your employer (not needed for government or international organisations).' },
      { name: 'CNIC copies', description: 'Two copies of your national ID card.' },
      { name: 'Visa page copy', description: 'Copy of any visa pages in your passport.' },
      { name: 'Confirmed air ticket', description: 'A genuine confirmed ticket — fake tickets cause rejection and possible blacklisting.' },
      { name: 'Accommodation documents', description: 'A genuine hotel booking or proof of where you will stay.' },
      { name: 'Bank statement + bank letter', description: 'Original statement covering about 1 year, plus a certified bank covering letter.' },
      { name: 'Proof you are in Pakistan', description: 'e.g. rental agreement, utility bill, or recent Pakistan immigration stamps.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Higher bank balance', description: 'Account holding over PKR 650,000 for 6 consecutive months.', conditional: 'For the 6-month multiple-entry tourist visa' },
    ]},
  ],
}

// ── Pakistan → UAE (single-entry tourist e-Visa) — GDRFA Dubai, 2026-06 ──
const PK_AE: OfficialRequirements = {
  visaType: 'Tourist visa (single-entry e-Visa)',
  processNote:
    'Pakistani holders don’t get this from a UAE embassy — it’s applied for digitally via the immigration authority’s smart services (GDRFA Dubai / ICP) or arranged through UAE-licensed airlines, hotels or travel agents. Pakistani nationals must also submit their home-country national ID (CNIC).',
  sourceLabel: 'GDRFA Dubai — Issuance of a single-entry tourist visa',
  sourceUrl: 'https://www.gdrfad.gov.ae/en/services/f9e586fe-0642-11ec-0320-0050569629e8',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required documents', items: [
      { name: 'Personal photo', description: 'One recent passport-style photo.' },
      { name: 'Passport copy', description: 'Passport valid at least 6 months.' },
      { name: 'National ID (CNIC)', description: 'Copy of your Pakistan national ID — specifically required for Pakistani applicants.' },
    ]},
    { tier: 'conditional', label: 'Entry conditions', items: [
      { name: 'Onward / return ticket', description: 'Proof of exit from the UAE.', conditional: 'General condition' },
      { name: 'Medical insurance', description: 'Health cover valid in the UAE.', conditional: 'General condition' },
    ]},
  ],
}

// ── Pakistan → Qatar (Hayya A1 e-Visa / Visa on Arrival) — Discover Qatar + Qatar MOI, 2026-06 ──
const PK_QA: OfficialRequirements = {
  visaType: 'Hayya A1 tourist e-Visa or Visa on Arrival (hotel booking required)',
  processNote:
    'Pakistani passport holders are not visa-exempt and must hold a confirmed hotel booking made through the Discover Qatar platform before travel. You can either apply online in advance for the Hayya A1 visa or get a visa on arrival (QAR 100) at Hamad International Airport — but the Discover Qatar hotel booking is mandatory either way.',
  sourceLabel: 'Discover Qatar (official) & Qatar Ministry of Interior — Visit Visas',
  sourceUrl: 'https://www.discoverqatar.qa/mandatory-hotels-for-visa-on-arrival',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Valid passport', description: 'Valid at least 3 months from your date of arrival.' },
      { name: 'Discover Qatar hotel booking', description: 'Confirmed accommodation booked via the Discover Qatar platform — mandatory for Pakistani nationals.' },
      { name: 'Confirmed return / onward ticket', description: 'Proof of your departure from Qatar.' },
      { name: 'Health insurance', description: 'Compulsory cover for Qatar; can be bought on arrival if you don’t already hold it.' },
    ]},
    { tier: 'conditional', label: 'Choose your route', items: [
      { name: 'Apply ahead (Hayya A1)', description: 'Online tourist e-Visa via hayya.qa.', conditional: 'If applying before travel' },
      { name: 'Visa on arrival (QAR 100)', description: 'Issued at Hamad International Airport.', conditional: 'Still needs the Discover Qatar hotel booking' },
    ]},
  ],
}

export const OFFICIAL_REQUIREMENTS: Record<string, OfficialRequirements> = {
  [key('Pakistan', 'Turkey')]: PK_TR,
  [key('Pakistan', 'Saudi Arabia')]: PK_SA,
  [key('Pakistan', 'United Kingdom')]: PK_GB,
  [key('Pakistan', 'Malaysia')]: PK_MY,
  [key('Pakistan', 'Thailand')]: PK_TH,
  [key('Pakistan', 'UAE')]: PK_AE,
  [key('Pakistan', 'Qatar')]: PK_QA,
}

/** Returns the curated official requirements for a route, or null. */
export function getOfficialRequirements(passport: string, destination: string): OfficialRequirements | null {
  if (!passport || !destination) return null
  return OFFICIAL_REQUIREMENTS[key(passport, destination)] ?? null
}
