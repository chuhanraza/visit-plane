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

// ── Pakistan → United States (B1/B2 visitor visa) — travel.state.gov, 2026-06 ──
const PK_US: OfficialRequirements = {
  visaType: 'B1/B2 Visitor visa',
  processNote:
    'Complete the online DS-160 form, pay the MRV application fee (≈US$185), then book and attend an in-person interview at the U.S. Embassy Islamabad or Consulate General Karachi (via ustraveldocs.com/pk). The consulate publishes no fixed supporting-document checklist beyond the core items — bring evidence of your ties to Pakistan and purpose of travel.',
  sourceLabel: 'U.S. Department of State — Bureau of Consular Affairs (Visitor Visa)',
  sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid for at least 6 months beyond your intended stay in the U.S.' },
      { name: 'DS-160 confirmation page', description: 'Printed confirmation of your completed online nonimmigrant visa application.' },
      { name: 'MRV fee receipt', description: 'Proof of the visa application fee payment (≈US$185 for B1/B2).' },
      { name: 'Photo', description: 'Compliant photo uploaded during the DS-160; bring a printed copy if the upload fails.' },
    ]},
    { tier: 'conditional', label: 'Bring to support your case (officer may ask)', items: [
      { name: 'Purpose of trip', description: 'Documents showing the reason for your travel.', conditional: 'If requested at interview' },
      { name: 'Proof of ties to Pakistan', description: 'Evidence you intend to return — family, residence, etc.', conditional: 'If requested at interview' },
      { name: 'Proof of funds', description: 'Evidence you can pay for the trip — bank statements / employment.', conditional: 'If requested at interview' },
    ]},
  ],
}

// ── Pakistan → Canada (Visitor visa / TRV) — IRCC, 2026-06 ──
const PK_CA: OfficialRequirements = {
  visaType: 'Visitor visa (Temporary Resident Visa)',
  processNote:
    'Apply online to IRCC and pay the application + biometrics fees; you’ll get a Biometric Instruction Letter and have 30 days to give fingerprints + photo at a Canada Visa Application Centre (VFS Global) in Islamabad, Lahore or Karachi. There is no eTA option for Pakistani holders — the visa must be obtained before departure.',
  sourceLabel: 'IRCC — Temporary Resident Visa document checklist (IMM 5859)',
  sourceUrl: 'https://ircc.canada.ca/english/pdf/kits/forms/imm5859e.pdf',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Valid passport', description: 'Valid 6+ months from travel. Pakistan VAC applicants must also include copies of current & previous passports (bio page + all non-blank pages).' },
      { name: 'Two photographs', description: 'Meeting IRCC specs, taken within 6 months (not needed as paper photos if you give biometrics).' },
      { name: 'Biometrics', description: 'Fingerprints + photo in person at a VAC (ages 14–79); CAD$85 fee.' },
      { name: 'Proof of funds', description: 'Bank statements/book for the past 3–12 months, plus pay slips, property, investments.' },
      { name: 'Purpose of trip', description: 'Your itinerary and provisional travel/accommodation bookings.' },
      { name: 'Application form (IMM 5257)', description: 'Completed visitor-visa application (submitted online).' },
      { name: 'Family Information Form (IMM 5707)', description: 'Fully completed, dated and signed.' },
      { name: 'Certified translation', description: 'For any document not in English or French.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Schedule 1 (IMM 5257B)', description: 'Completed and signed.', conditional: 'If you answered “yes” to any background question' },
      { name: 'Letter of invitation', description: 'From the person/business you’ll visit, or conference/employer letter.', conditional: 'If visiting someone, a conference, or for work' },
      { name: 'Third-party funding documents', description: 'Signed letter from the payer + their ID and bank proof, dated within 3 months.', conditional: 'If someone else pays for your trip' },
      { name: 'Employment documents', description: 'Employer letter, leave authorisation, pay slips.', conditional: 'If employed' },
    ]},
  ],
}

// ── Pakistan → Germany / Schengen (short-stay C) — German Mission Pakistan, 2026-06 ──
const PK_DE: OfficialRequirements = {
  visaType: 'Schengen short-stay (tourist) visa — Category C',
  processNote:
    'Apply in person via the German Mission’s appointment system (Embassy Islamabad / Consulate Karachi), submitting at the VFS Global centre. Fill the Videx online form first; biometrics are required (exempt if taken at any Schengen mission within the past 59 months). Processing ~14 days; apply up to 6 months ahead.',
  sourceLabel: 'German Federal Foreign Office — German Missions in Pakistan (Tourist visa)',
  sourceUrl: 'https://pakistan.diplo.de/pk-en/service/3-tourist-visa-seite-1673122',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Application form (Videx)', description: 'Signed original printed from the Videx online system (with barcode page).' },
      { name: 'Passport + biodata copies', description: 'Original passport (valid ≥3 months beyond stay) plus copies of the biodata pages.' },
      { name: 'Copies of previous passports', description: 'Full copies of all previous passports.' },
      { name: 'Two biometric photos', description: 'Not older than 6 months, per the official examples.' },
      { name: 'Travel health insurance', description: 'Minimum €30,000 cover, valid across all Schengen states for the full stay (original + 1 copy).' },
      { name: 'Accommodation proof', description: 'Hotel reservations for the whole stay with addresses and a detailed itinerary.' },
      { name: 'Flight reservation', description: 'Confirmed round-trip booking covering the stay.' },
      { name: 'Employment proof', description: 'Employer letter stating position, length of employment and permission for the trip (or university confirmation).' },
      { name: 'Financial evidence', description: 'Bank statements for the last 6 months and salary slips for the last 3 months.' },
      { name: 'CNIC copy', description: 'Copy of your national ID card.' },
      { name: 'List of children & relatives abroad', description: 'Signed originals on the mission’s provided templates.' },
      { name: 'Appointment confirmation', description: 'Printout of the appointment confirmation email.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Family Registration Certificate (FRC)', description: 'Original NADRA FRC.', conditional: 'Family documentation as applicable' },
      { name: 'Marriage certificate', description: 'Original.', conditional: 'If married' },
      { name: 'Birth certificate', description: 'Original.', conditional: 'For minors / accompanying children' },
      { name: 'Previous visa refusal', description: 'Copy of any prior refusal (non-disclosure is treated as fraud).', conditional: 'If ever refused a visa' },
    ]},
  ],
}

// ── Pakistan → China (Tourist L visa) — Chinese Embassy in Pakistan, 2026-06 ──
const PK_CN: OfficialRequirements = {
  visaType: 'Tourist (L) visa',
  processNote:
    'Apply through Gerry’s Chinese Visa Application Service Center (Islamabad / Karachi / Lahore) by your district: complete the online form at bio.visaforchina.cn, upload documents, then submit originals after the “Online Visa Approved” notification (≈4 working days). The official L category is framed as group tourism — issued to tourists visiting China in a group of at least 5.',
  sourceLabel: 'Embassy of the People’s Republic of China in Pakistan — Instruction for Chinese Visa Application',
  sourceUrl: 'https://pk.china-embassy.gov.cn/eng/lsfw/va/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Original, valid 6+ months with a blank visa page.' },
      { name: 'Passport copy', description: 'Photocopy of the personal-information (data) page.' },
      { name: 'CNIC copy', description: 'Copy of the front and back of your national ID.' },
      { name: 'Photo', description: 'One recent colour ID photo, 2-inch, white background, bare-head full-face.' },
      { name: 'Visa application form', description: 'Completed online at bio.visaforchina.cn.' },
    ]},
    { tier: 'conditional', label: 'For tourist (L) applicants', items: [
      { name: 'Invitation letter for tourist group', description: 'Issued by an authorised tourism office in China (the L visa is for tour groups of at least 5).', conditional: 'Required for the L category' },
    ]},
  ],
}

// ── Pakistan → Australia (Visitor subclass 600, Tourist stream) — Home Affairs, 2026-06 ──
const PK_AU: OfficialRequirements = {
  visaType: 'Visitor visa (subclass 600), Tourist stream',
  processNote:
    'Apply online via ImmiAccount (attach documents, pay the charge). You must be outside Australia when you apply and when it’s decided. Home Affairs will tell you after applying if you need biometrics and/or health examinations. Pakistani passports aren’t eligible for the ETA/eVisitor.',
  sourceLabel: 'Australian Department of Home Affairs — Visitor visa (600), Tourist stream',
  sourceUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600/tourist-stream-overseas',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Valid passport', description: 'Pages showing your photo, personal details and issue/expiry dates.' },
      { name: 'Proof of funds', description: 'Evidence you can fund your stay and departure — e.g. 3 months of personal bank statements, pay slips, tax records.' },
      { name: 'Evidence of ties to home', description: 'Reasons to return — employer letter, proof of study, family, property or assets in Pakistan.' },
      { name: 'Your plans in Australia', description: 'A statement of what you intend to do during your visit.' },
      { name: 'English translations', description: 'All non-English documents translated, with originals, in clear colour scans.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'National identity card', description: 'Provide it if you have one.', conditional: 'If you hold a national ID' },
      { name: 'Invitation letter', description: 'From a relative/friend in Australia stating relationship, purpose and who pays (+ their funds if sponsoring).', conditional: 'If someone in Australia invites/sponsors you' },
      { name: 'Proof of name change', description: 'Marriage/divorce or change-of-name documents.', conditional: 'If your name has changed' },
      { name: 'Documents for under-18 applicants', description: 'Birth certificate, guardianship/consent (Form 1229) and host undertaking (Form 1257) as required.', conditional: 'If the applicant is under 18' },
      { name: 'Police certificate / biometrics / health exams', description: 'Provide if Home Affairs requests them.', conditional: 'If requested by Home Affairs' },
    ]},
  ],
}

// ── Pakistan → Azerbaijan (ASAN e-Visa) — evisa.gov.az, 2026-06 ──
const PK_AZ: OfficialRequirements = {
  visaType: 'ASAN e-Visa (single-entry)',
  processNote:
    'Fully online at evisa.gov.az in 3 steps (apply, pay, download) — Pakistan is on the e-Visa eligible list, so ordinary passport holders apply directly with no embassy visit. Single-entry, 90-day validity, up to 30-day stay.',
  sourceLabel: 'Republic of Azerbaijan Official Electronic Visa Portal (ASAN Visa)',
  sourceUrl: 'https://evisa.gov.az/en/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for the e-Visa', items: [
      { name: 'Valid passport / travel document', description: 'Valid at least 3 months beyond the e-Visa’s expiry date.' },
      { name: 'Scanned passport photo page', description: 'Upload the scanned bio-data (photo) page; if unreadable, the application is rejected.' },
      { name: 'Application data + fee', description: 'Enter your details online and pay the state fee (US$20) + service fee (US$9) by card.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Minor’s documents', description: 'Notarised birth certificate + parental/representative consent + ID copies.', conditional: 'If under 18 travelling unaccompanied' },
    ]},
  ],
}

// ── Pakistan → Sri Lanka (free Tourist ETA) — Sri Lanka Immigration, 2026-06 ──
const PK_LK: OfficialRequirements = {
  visaType: 'Tourist ETA (free for Pakistani holders)',
  processNote:
    'Pakistani ordinary passport holders must obtain an ETA online before arrival at eta.gov.lk. From 25 May 2026 Pakistan is among 40 nationalities granted a free-of-charge tourist ETA — 30 days, double-entry — but the ETA is still required even though it is free.',
  sourceLabel: 'Department of Immigration & Emigration, Sri Lanka — Tourist ETA',
  sourceUrl: 'https://eta.gov.lk/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid at least 6 months from your date of arrival.' },
      { name: 'Electronic Travel Authorization (ETA)', description: 'Obtained online before arrival; free for Pakistani holders, 30 days double-entry.' },
      { name: 'Adequate funds', description: 'Evidence of enough funds for your stay and return.' },
      { name: 'Return / onward ticket', description: 'A return ticket, or a visa for your next destination.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Visa extension fee', description: 'Pay the applicable fee.', conditional: 'If staying beyond the free 30-day period' },
    ]},
  ],
}

// ── Pakistan → Indonesia (Visit/Tourist e-Visa C1) — Indonesian Immigration, 2026-06 ──
const PK_ID: OfficialRequirements = {
  visaType: 'Tourist e-Visa (Visit / index C1)',
  processNote:
    'Pakistani passport holders are NOT on Indonesia’s Visa-on-Arrival / e-VOA list, so you cannot use VOA or visa-free entry — apply in advance for the electronic visit (tourist) e-Visa at evisa.imigrasi.go.id.',
  sourceLabel: 'Official Indonesian e-Visa — Directorate General of Immigration (Visit Visa)',
  sourceUrl: 'https://evisa.imigrasi.go.id/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for the e-Visa', items: [
      { name: 'Passport', description: 'Valid at least 6 months (12 months for non-passport travel documents).' },
      { name: 'Recent colour photograph', description: 'A recent colour photo of the applicant.' },
      { name: 'Bank statement', description: 'Personal bank statement showing a minimum balance of US$2,000 (or equivalent) over the last 3 months.' },
    ]},
  ],
}

// ══════════════════════════════ INDIA ROUTES ══════════════════════════════

// ── India → UAE (sponsored tourist e-Visa) — GDRFA Dubai / ICP, 2026-06 ──
const IN_AE: OfficialRequirements = {
  visaType: 'Tourist visa (sponsored e-Visa)',
  processNote:
    'Indian holders obtain a sponsored tourist visa in advance — via ICP smart services / GDRFA Dubai, or arranged through a UAE airline, hotel or travel agent (no embassy-issued tourist visas). Indians holding a US green card or a valid UK/EU residence (≥6 months) can instead get a 14-day visa on arrival.',
  sourceLabel: 'GDRFA Dubai — Issuance of a single-entry tourist visa (with ICP federal service)',
  sourceUrl: 'https://www.gdrfad.gov.ae/en/services/f9e586fe-0642-11ec-0320-0050569629e8',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required documents', items: [
      { name: 'Passport', description: 'At least 6 months’ remaining validity; passport copy submitted.' },
      { name: 'Personal photo', description: 'One recent photo, white background.' },
      { name: 'Onward / return ticket', description: 'A ticket to continue your journey or leave the UAE.' },
      { name: 'Medical insurance', description: 'A health insurance policy valid in the UAE.' },
    ]},
    { tier: 'conditional', label: 'May be requested (self-sponsored)', items: [
      { name: 'Tour itinerary', description: 'Statement of your tour programme.', conditional: 'For tourism-type applications via ICP' },
      { name: 'Bank statement', description: 'Around 6 months of statements showing sufficient funds.', conditional: 'Depending on visa type / channel' },
    ]},
  ],
}

// ── India → United States (B1/B2) — travel.state.gov, 2026-06 ──
const IN_US: OfficialRequirements = {
  visaType: 'B1/B2 Visitor visa',
  processNote:
    'Complete the online DS-160, pay the MRV fee (≈US$185), then book and attend an in-person interview at a U.S. Embassy/Consulate in India (via ustraveldocs.com/in). Bring evidence of your ties to India and purpose of travel.',
  sourceLabel: 'U.S. Department of State — Bureau of Consular Affairs (Visitor Visa)',
  sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid at least 6 months beyond your intended stay in the U.S.' },
      { name: 'DS-160 confirmation page', description: 'Printed confirmation of your completed online application.' },
      { name: 'MRV fee receipt', description: 'Proof of the visa application fee payment (≈US$185).' },
      { name: 'Photo', description: 'Uploaded during the DS-160; bring a printed copy if the upload fails.' },
    ]},
    { tier: 'conditional', label: 'Bring to support your case (officer may ask)', items: [
      { name: 'Purpose of trip', description: 'Documents showing the reason for travel.', conditional: 'If requested at interview' },
      { name: 'Proof of ties to India', description: 'Employment, family or residence showing you’ll return.', conditional: 'If requested at interview' },
      { name: 'Proof of funds', description: 'Evidence you can pay for the trip.', conditional: 'If requested at interview' },
    ]},
  ],
}

// ── India → United Kingdom (Standard Visitor) — GOV.UK, 2026-06 ──
const IN_GB: OfficialRequirements = {
  visaType: 'Standard Visitor visa',
  processNote:
    'Apply online at gov.uk, then give biometrics at a VFS Global centre in India. A TB test certificate (from a Home Office-approved clinic in India) is only required for stays of 6 months or more — not for an ordinary tourist visit.',
  sourceLabel: 'GOV.UK — Standard Visitor visa',
  sourceUrl: 'https://www.gov.uk/standard-visitor/apply-standard-visitor-visa',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport or travel document', description: 'Valid for the whole of your stay in the UK.' },
      { name: 'Biometrics', description: 'Fingerprints and a photo taken at the VFS Global centre in India.' },
      { name: 'Genuine-visitor evidence', description: 'Evidence you’ll leave at the end of your visit and can cover your costs.' },
    ]},
    { tier: 'conditional', label: 'Depending on your circumstances', items: [
      { name: 'Financial evidence', description: 'Bank statements showing access to and origin of funds.' },
      { name: 'Employer letter', description: 'On headed paper, stating role, salary and length of employment.', conditional: 'If employed' },
      { name: 'Self-employment documents', description: 'Business registration or recent invoices.', conditional: 'If self-employed' },
      { name: 'Sponsor documents', description: 'Who is paying + proof they can support you.', conditional: 'If someone funds your visit' },
      { name: 'TB test certificate', description: 'Chest X-ray certificate from a Home Office-approved clinic in India.', conditional: 'Only if staying 6 months or more' },
    ]},
  ],
}

// ── India → Canada (Visitor visa / TRV) — IRCC, 2026-06 ──
const IN_CA: OfficialRequirements = {
  visaType: 'Visitor visa (Temporary Resident Visa)',
  processNote:
    'Apply online to IRCC and pay the fees; give biometrics in person at a VFS Global centre in India. There is no eTA option for Indian holders — the visa must be obtained before departure.',
  sourceLabel: 'IRCC — Temporary Resident Visa (application kit & document checklist)',
  sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Application form (IMM 5257)', description: 'Completed visitor-visa application (submitted online).' },
      { name: 'Family Information Form (IMM 5707)', description: 'Fully completed, dated and signed.' },
      { name: 'Valid passport', description: 'Valid 6+ months from travel; include cancelled/expired passports if any.' },
      { name: 'Two photographs', description: 'Per IRCC specs, taken within 6 months (not needed as paper photos if you give biometrics).' },
      { name: 'Biometrics', description: 'Fingerprints + photo at a VAC; fee applies; processing starts once received.' },
      { name: 'Proof of funds', description: 'Bank statements for the past 3–12 months plus supporting documents.' },
      { name: 'Purpose of travel', description: 'Itinerary and provisional travel/accommodation bookings.' },
      { name: 'Certified translation', description: 'For any document not in English or French.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Schedule 1 (background)', description: 'Completed and signed.', conditional: 'If you answered “yes” to any background question' },
      { name: 'Letter of invitation', description: 'From the person/business you’ll visit.', conditional: 'If visiting someone or a conference' },
      { name: 'Employment / leave letter', description: 'Employer letter with role, salary and approved leave.', conditional: 'If employed' },
      { name: 'Third-party funding documents', description: 'Payer’s letter, ID and bank proof, dated within 3 months.', conditional: 'If someone else pays' },
    ]},
  ],
}

// ── India → Germany / Schengen (short-stay C) — German Missions in India, 2026-06 ──
const IN_DE: OfficialRequirements = {
  visaType: 'Schengen short-stay (tourist) visa — Category C',
  processNote:
    'Apply at a VFS Germany centre in India; complete the VIDEX online form and print all pages (incl. barcodes); give biometrics in person. Lodge no earlier than 6 months and no later than 15 days before travel.',
  sourceLabel: 'German Missions in India (Federal Foreign Office) — Schengen tourism checklist',
  sourceUrl: 'https://india.diplo.de/in-en/2674158-2674158',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'VIDEX application form', description: 'Completed online via VIDEX, all pages printed (with barcodes) and signed.' },
      { name: 'Signed declarations', description: 'Of true/complete information and of valid travel medical insurance.' },
      { name: 'Passport', description: 'Issued within the last 10 years, valid ≥3 months after return, with 2 blank pages.' },
      { name: 'Passport copy', description: 'Copy of the biometric (data) page and the address page.' },
      { name: 'Biometric photograph', description: '35×45 mm, white background, 70–80% face, not older than 6 months.' },
      { name: 'Cover letter / itinerary', description: 'Stating your means of transport and travel itinerary.' },
      { name: 'Flight reservation', description: 'Booked round-trip reservation.' },
      { name: 'Accommodation proof', description: 'Hotel confirmation for the full stay (or host documentation).' },
      { name: 'Travel medical insurance', description: 'Min. €30,000, valid for all Schengen states for the whole trip.' },
    ]},
    { tier: 'conditional', label: 'Proof of finances — by your situation', items: [
      { name: 'Employed', description: '3 months’ pay slips, employment contract, employer leave letter, 3 months’ stamped bank statements, ITR / Form 16.', conditional: 'If salaried' },
      { name: 'Self-employed', description: 'Company registration with GST, ITR, 3 months’ bank statements.', conditional: 'If you own a business' },
      { name: 'Student', description: 'Enrolment/bonafide certificate and no-objection letter (+ bank statements for university students).', conditional: 'If a student' },
      { name: 'Sponsorship documents', description: 'Sponsor’s documents (vary by sponsor type).', conditional: 'If your trip is sponsored' },
      { name: 'Minor’s documents', description: 'Both parents’ signatures, birth certificate, parents’ passport copies and consent.', conditional: 'If the applicant is a minor' },
    ]},
  ],
}

// ── India → Thailand (visa exemption, 60 days) — Royal Thai Embassy New Delhi, 2026-06 ──
const IN_TH: OfficialRequirements = {
  visaType: 'Visa exemption (visa-free, up to 60 days)',
  processNote:
    'Indian ordinary passport holders can enter Thailand visa-free for up to 60 days for tourism — no visa or fee. Complete the Thailand Digital Arrival Card (TDAC) online before arrival. A Tourist e-Visa (thaievisa.go.th) is optional only if you want a longer/pre-issued stay. (Thai visa policy for India is under review — reconfirm at the official source close to travel.)',
  sourceLabel: 'Royal Thai Embassy, New Delhi — Visa (visa exemption)',
  sourceUrl: 'https://newdelhi.thaiembassy.org/en/page/visa',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Carry at the border (visa-free entry)', items: [
      { name: 'Valid passport', description: 'Ordinary Indian passport (at least 6 months’ validity, 2 blank pages).' },
      { name: 'Proof of funds', description: 'Cash equivalent to ≈20,000 THB per person / 40,000 THB per family.' },
      { name: 'Thailand Digital Arrival Card (TDAC)', description: 'Completed online before arrival.' },
    ]},
    { tier: 'conditional', label: 'May be asked / optional', items: [
      { name: 'Onward / return ticket & accommodation', description: 'Proof of departure and where you’ll stay.', conditional: 'If asked at check-in or the border' },
      { name: 'Tourist e-Visa (TR)', description: 'Apply online at thaievisa.go.th.', conditional: 'Only if you want a longer / pre-issued stay' },
    ]},
  ],
}

// ── India → Malaysia (visa exemption, 30 days, through 31 Dec 2026) — Malaysian Immigration, 2026-06 ──
const IN_MY: OfficialRequirements = {
  visaType: 'Visa-free (visa exemption, up to 30 days)',
  processNote:
    'Indian passport holders enter Malaysia visa-free for up to 30 days for tourism — a temporary exemption currently extended through 31 December 2026 (a visa would be needed after that unless extended). The Malaysia Digital Arrival Card (MDAC) is mandatory and must be submitted online before arrival (up to 3 days prior).',
  sourceLabel: 'Malaysian Immigration Department — Visa Requirement by Country',
  sourceUrl: 'https://www.imi.gov.my/index.php/en/main-services/visa/visa-requirement-by-country/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Carry at the border (visa-free entry)', items: [
      { name: 'Passport', description: 'Valid at least 6 months from the date of entry.' },
      { name: 'MDAC (Digital Arrival Card)', description: 'Compulsory online submission before arrival (up to 3 days prior).' },
      { name: 'Return / onward ticket', description: 'A confirmed return or onward ticket.' },
      { name: 'Proof of accommodation', description: 'Confirmed hotel booking.' },
      { name: 'Proof of funds', description: 'Evidence of sufficient funds for your stay.' },
    ]},
    { tier: 'conditional', label: 'When a visa is needed instead', items: [
      { name: 'Visa (eVisa / standard)', description: 'Required for work or study, stays over 30 days, or after the exemption lapses.', conditional: 'If not a ≤30-day tourist visit' },
    ]},
  ],
}

// ── India → Singapore (tourist e-Visa via authorised agent) — ICA, 2026-06 ──
const IN_SG: OfficialRequirements = {
  visaType: 'Tourist e-Visa (via ICA-authorised agent)',
  processNote:
    'Indian nationals need a visa, applied through an ICA-authorised visa agent / Strategic Partner / Singapore local contact using the SAVE e-Service (S$30, processed in ~3 working days; apply within 30 days before arrival). Separately, submit the SG Arrival Card within 3 days before entry.',
  sourceLabel: 'Immigration & Checkpoints Authority (ICA), Singapore — India visa requirements',
  sourceUrl: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements/visa-detail-page/india',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Form 14A', description: 'Completed Application for Entry Visa, signed by the applicant.' },
      { name: 'Recent photograph', description: 'One passport-size colour photo taken within the last 3 months (ICA specs).' },
      { name: 'Passport biodata copy', description: 'Copy of the biodata page; passport valid at least 6 months from entry.' },
    ]},
    { tier: 'conditional', label: 'If requested', items: [
      { name: 'Form V39A (Letter of Introduction)', description: 'Supporting letter of introduction.', conditional: 'Case-by-case, if ICA asks' },
    ]},
  ],
}

// ══════════════════════ BANGLADESH / NIGERIA / PHILIPPINES / EGYPT ══════════════════════

// ── Bangladesh → Saudi Arabia (Group-B; embassy/VAC) — Visit Saudi Help Center, 2026-06 ──
const BD_SA: OfficialRequirements = {
  visaType: 'Tourist visit visa (via Saudi embassy / VAC)',
  processNote:
    'Bangladesh is a Saudi "Group B" nationality and is NOT eligible for the direct online e-Visa — apply for a visit visa through the Saudi embassy / official Visa Application Centre. Exception: if you hold a valid, already-used US, UK or Schengen visa — or US/UK/EU permanent residency — you can use the e-Visa or visa on arrival.',
  sourceLabel: 'Visit Saudi Help Center (Saudi Tourism Authority)',
  sourceUrl: 'https://www.visitsaudi.com/en/help-center',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid at least 6 months from entry, with at least 2 blank pages.' },
      { name: 'Visit-visa application (embassy / VAC)', description: 'Lodged at the Saudi embassy or official VAC — Bangladesh is not e-Visa-eligible on passport alone.' },
    ]},
    { tier: 'conditional', label: 'If you qualify for the e-Visa / visa on arrival', items: [
      { name: 'Valid US / UK / Schengen visa', description: 'Tourist or business, used (entered) at least once.', conditional: 'Using the e-Visa exception' },
      { name: 'US / UK / EU permanent residency', description: 'A valid permanent-resident permit.', conditional: 'Alternative basis for the exception' },
    ]},
  ],
}

// ── Bangladesh → Malaysia (eVisa) — Malaysian Immigration, 2026-06 ──
const BD_MY: OfficialRequirements = {
  visaType: 'Tourist eVisa (single-entry)',
  processNote:
    'Bangladesh is not visa-free and not eNTRI-eligible — apply online for the eVISA at malaysiavisa.imi.gov.my (the binding per-nationality document list is shown inside the logged-in application). Separately, submit the mandatory Malaysia Digital Arrival Card (MDAC) before arrival.',
  sourceLabel: 'Malaysian Immigration Department — Visa Requirement by Country / eVISA',
  sourceUrl: 'https://malaysiavisa.imi.gov.my/',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for the eVISA', items: [
      { name: 'Passport biodata page', description: 'Valid at least 6 months from entry, with blank pages.' },
      { name: 'Passport photo', description: 'Recent, white background.' },
      { name: 'Confirmed return / onward flight', description: 'Proof of a return or onward ticket.' },
      { name: 'Proof of accommodation', description: 'Hotel booking confirmation.' },
      { name: 'Proof of funds', description: 'Evidence of sufficient funds for your stay.' },
      { name: 'MDAC (Digital Arrival Card)', description: 'Submitted online before arrival (separate from the eVISA).' },
    ]},
    { tier: 'conditional', label: 'May be requested', items: [
      { name: 'Bank statement / employment proof', description: 'Recent statements or employer letter showing ties.', conditional: 'Commonly asked for Bangladeshi applicants' },
      { name: 'Sponsor / invitation letter', description: 'Host’s letter, ID and address proof.', conditional: 'If staying with a host' },
    ]},
  ],
}

// ── Bangladesh → UAE (sponsored tourist visa) — GDRFA Dubai, 2026-06 ──
const BD_AE: OfficialRequirements = {
  visaType: 'Tourist visa (single-entry, sponsored)',
  processNote:
    'A sponsored visa arranged through a UAE tourism-sector establishment (hotel, airline or licensed agent) or applied via GDRFA Dubai / ICP smart services (~48 hours). Unlike some nationalities, Bangladesh holders do NOT need to submit a home-country national ID.',
  sourceLabel: 'GDRFA Dubai — Issuance of a single-entry tourist visa',
  sourceUrl: 'https://www.gdrfad.gov.ae/en/services/f9e586fe-0642-11ec-0320-0050569629e8',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required documents', items: [
      { name: 'Personal photo', description: 'One recent passport-style photo.' },
      { name: 'Passport copy', description: 'Passport valid at least 6 months.' },
    ]},
    { tier: 'conditional', label: 'Entry conditions', items: [
      { name: 'Onward / return ticket & medical insurance', description: 'Proof of exit and UAE-valid health cover.', conditional: 'General conditions' },
    ]},
  ],
}

// ── Nigeria → United Kingdom (Standard Visitor) — GOV.UK, 2026-06 ──
const NG_GB: OfficialRequirements = {
  visaType: 'Standard Visitor visa',
  processNote:
    'Apply online at gov.uk, then give biometrics at a VFS Global centre in Nigeria. A TB test certificate (from a Home Office-approved clinic in Nigeria) is only required for stays of 6 months or more.',
  sourceLabel: 'GOV.UK — Standard Visitor visa',
  sourceUrl: 'https://www.gov.uk/standard-visitor/apply-standard-visitor-visa',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport or travel document', description: 'Valid for the whole of your stay in the UK.' },
      { name: 'Biometrics', description: 'Fingerprints and a photo taken at the VFS Global centre in Nigeria.' },
      { name: 'Genuine-visitor evidence', description: 'Evidence you’ll leave at the end of your visit and can cover your costs.' },
      { name: 'Certified translations', description: 'For any document not in English or Welsh.' },
    ]},
    { tier: 'conditional', label: 'Depending on your circumstances', items: [
      { name: 'Financial evidence', description: 'Bank statements showing access to and origin of funds.' },
      { name: 'Employer / study letter', description: 'Confirming your role and salary, or your enrolment.', conditional: 'If employed or studying' },
      { name: 'Sponsor / accommodation evidence', description: 'Who funds/hosts you and proof of their means.', conditional: 'If someone funds or hosts you' },
      { name: 'TB test certificate', description: 'From a Home Office-approved clinic in Nigeria.', conditional: 'Only if staying 6 months or more' },
    ]},
  ],
}

// ── Nigeria → Canada (Visitor visa / TRV) — IRCC, 2026-06 ──
const NG_CA: OfficialRequirements = {
  visaType: 'Visitor visa (Temporary Resident Visa)',
  processNote:
    'Apply online to IRCC and pay the fees; give biometrics in person at a VFS Global centre in Nigeria (Lagos or Abuja). There is no eTA option for Nigerian holders — the visa must be obtained before departure.',
  sourceLabel: 'IRCC — Temporary Resident Visa (document checklist)',
  sourceUrl: 'https://ircc.canada.ca/english/pdf/kits/forms/imm5859e.pdf',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Application form (IMM 5257)', description: 'Completed visitor-visa application (submitted online).' },
      { name: 'Family Information Form (IMM 5707)', description: 'Fully completed, dated and signed.' },
      { name: 'Valid passport', description: 'Valid 6+ months from travel; include cancelled/expired passports if any.' },
      { name: 'Two photographs', description: 'Per IRCC specs (not needed as paper photos if you give biometrics).' },
      { name: 'Biometrics', description: 'Fingerprints + photo at a VAC (Lagos/Abuja), ages 14–79.' },
      { name: 'Proof of funds', description: 'Bank statements for the past 3 months plus supporting documents.' },
      { name: 'Purpose of travel', description: 'Itinerary and provisional travel/accommodation bookings.' },
      { name: 'Certified translation', description: 'For any document not in English or French.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'Proof of immigration status', description: 'If you’re not a Nigerian citizen applying in Nigeria.', conditional: 'If a non-Nigerian resident' },
      { name: 'Schedule 1 (background)', description: 'Completed and signed.', conditional: 'If you answered “yes” to any background question' },
      { name: 'Employer / leave letter', description: 'With role, salary and approved leave.', conditional: 'If employed' },
      { name: 'Third-party funding documents', description: 'Payer’s letter, ID and bank proof, dated within 3 months.', conditional: 'If someone else pays' },
    ]},
  ],
}

// ── Philippines → United States (B1/B2) — travel.state.gov, 2026-06 ──
const PH_US: OfficialRequirements = {
  visaType: 'B1/B2 Visitor visa',
  processNote:
    'Complete the online DS-160, pay the MRV fee (≈US$185), then book and attend an interview at the U.S. Embassy Manila (via ustraveldocs.com/ph). Bring proof of employment, funds and ties to the Philippines.',
  sourceLabel: 'U.S. Department of State — Visitor Visa (corroborated by ustraveldocs.com/ph)',
  sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid at least 6 months beyond your intended stay in the U.S.' },
      { name: 'DS-160 confirmation page', description: 'Printed confirmation of your completed online application.' },
      { name: 'MRV fee receipt', description: 'Proof of the visa application fee payment (≈US$185).' },
      { name: 'Photo', description: 'Uploaded during the DS-160; bring a printed 2"×2" copy if the upload fails.' },
    ]},
    { tier: 'conditional', label: 'Bring to support your case', items: [
      { name: 'Employer letter + pay slips', description: 'Certificate of employment plus the last 3 months’ pay slips.', conditional: 'If employed' },
      { name: 'Proof of ties & funds', description: 'Family, property, and financial evidence showing you’ll return.', conditional: 'If requested at interview' },
    ]},
  ],
}

// ── Philippines → Japan (Temporary Visitor, tourism) — Japan MOFA, 2026-06 ──
const PH_JP: OfficialRequirements = {
  visaType: 'Temporary Visitor (tourist) visa — single entry',
  processNote:
    'Philippine nationals must apply through a travel agency accredited by the Embassy of Japan (not directly to the embassy). Documents must be issued within the last 3 months; processing ~1 week; the visa is valid 3 months and cannot be extended.',
  sourceLabel: 'Ministry of Foreign Affairs of Japan — Single Entry Visa for Philippine Nationals',
  sourceUrl: 'https://www.mofa.go.jp/j_info/visit/visa/short/philippine.html',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for tourism (self-funded)', items: [
      { name: 'Valid passport', description: 'Signed, valid for the trip.' },
      { name: 'Visa application form', description: 'Completed Japan visa application form.' },
      { name: 'Photograph', description: 'One recent passport-size photo.' },
      { name: 'PSA birth certificate', description: 'On security paper (add a local-government copy if illegible).' },
      { name: 'Proof of funds', description: 'Certificate of tax payment from a public agency, or a bank certificate of deposit balance.' },
    ]},
    { tier: 'conditional', label: 'If applicable', items: [
      { name: 'PSA marriage certificate', description: 'On security paper.', conditional: 'If you are married' },
      { name: 'Additional documents', description: 'e.g. certificate of employment, residence or school records.', conditional: 'Only if the embassy requests them' },
    ]},
  ],
}

// ── Egypt → Saudi Arabia (Group-B; embassy/VAC) — Visit Saudi Help Center, 2026-06 ──
const EG_SA: OfficialRequirements = {
  visaType: 'Tourist visit visa (via Saudi embassy / VAC)',
  processNote:
    'Egypt is a Saudi "Group B" nationality and is NOT eligible for the direct online e-Visa — apply through the Saudi embassy / official VAC. Exception: if you hold a valid, already-used US, UK or Schengen visa — or US/UK/EU permanent residency — you can use the e-Visa or visa on arrival.',
  sourceLabel: 'Visit Saudi Help Center (Saudi Tourism Authority)',
  sourceUrl: 'https://www.visitsaudi.com/en/help-center',
  lastVerified: '2026-06',
  groups: [
    { tier: 'mandatory', label: 'Required for all applicants', items: [
      { name: 'Passport', description: 'Valid at least 6 months from your date of entry.' },
      { name: 'Visit-visa application (embassy / VAC)', description: 'Lodged at the Saudi embassy or VAC — Egypt is not e-Visa-eligible on passport alone.' },
      { name: 'Recent photograph', description: 'Passport-size, for the visa application.' },
      { name: 'Travel / medical insurance', description: 'Health cover for the visit (bundled with the e-Visa fee where the exception applies).' },
    ]},
    { tier: 'conditional', label: 'If you qualify for the e-Visa / visa on arrival', items: [
      { name: 'Valid US / UK / Schengen visa or residency', description: 'A used US/UK/Schengen visa, or US/UK/EU permanent residency.', conditional: 'Using the e-Visa exception' },
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
  [key('Pakistan', 'United States')]: PK_US,
  [key('Pakistan', 'Canada')]: PK_CA,
  [key('Pakistan', 'Germany')]: PK_DE,
  [key('Pakistan', 'China')]: PK_CN,
  [key('Pakistan', 'Australia')]: PK_AU,
  [key('Pakistan', 'Azerbaijan')]: PK_AZ,
  [key('Pakistan', 'Sri Lanka')]: PK_LK,
  [key('Pakistan', 'Indonesia')]: PK_ID,
  [key('India', 'UAE')]: IN_AE,
  [key('India', 'United States')]: IN_US,
  [key('India', 'United Kingdom')]: IN_GB,
  [key('India', 'Canada')]: IN_CA,
  [key('India', 'Germany')]: IN_DE,
  [key('India', 'Thailand')]: IN_TH,
  [key('India', 'Malaysia')]: IN_MY,
  [key('India', 'Singapore')]: IN_SG,
  [key('Bangladesh', 'Saudi Arabia')]: BD_SA,
  [key('Bangladesh', 'Malaysia')]: BD_MY,
  [key('Bangladesh', 'UAE')]: BD_AE,
  [key('Nigeria', 'United Kingdom')]: NG_GB,
  [key('Nigeria', 'Canada')]: NG_CA,
  [key('Philippines', 'United States')]: PH_US,
  [key('Philippines', 'Japan')]: PH_JP,
  [key('Egypt', 'Saudi Arabia')]: EG_SA,
}

/** Returns the curated official requirements for a route, or null. */
export function getOfficialRequirements(passport: string, destination: string): OfficialRequirements | null {
  if (!passport || !destination) return null
  return OFFICIAL_REQUIREMENTS[key(passport, destination)] ?? null
}
