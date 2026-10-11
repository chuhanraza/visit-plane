/**
 * Immigration support letters — field config, letter builders, notices, red-flag checks.
 *
 * Pure functions, no I/O. The same block model drives the live preview, the
 * copy-text button and the PDF, so what the user sees is exactly what they get.
 * Design rule: facts, not stories. Letters are short, bulleted and built only from
 * what the user typed — no adjectives or promises are added.
 */

export type LetterType = 'cover' | 'noc' | 'invitation' | 'sponsor'

export type FieldKind = 'text' | 'textarea' | 'date' | 'select' | 'checks'

export interface Field {
  id: string
  label: string
  kind: FieldKind
  placeholder?: string
  hint?: string
  options?: string[]
  /** Section heading the field belongs to in the form. */
  group: string
  /** Half-width on the desktop form grid. */
  half?: boolean
  /** Only show when another field has one of these values. */
  showIf?: { id: string; in: string[] }
  /** Free text that is scanned for risky wording. */
  scan?: boolean
}

export interface LetterMeta {
  type: LetterType
  label: string
  blurb: string
  fields: Field[]
}

export interface Seg {
  text: string
  filled: boolean
}

export type Block =
  | { kind: 'p'; segs: Seg[] }
  | { kind: 'h'; text: string }
  | { kind: 'lines'; lines: Seg[][] }
  | { kind: 'list'; items: Seg[][] }
  | { kind: 'gap' }

export type Data = Record<string, string>

export interface Notice {
  level: 'warn' | 'info'
  text: string
}

// ─── Shared option lists ─────────────────────────────────────────────────────

export const REGIONS = ['Schengen (Europe)', 'United Kingdom', 'Canada', 'United States', 'Australia', 'Other'] as const

const EMPLOYMENT = ['Employed', 'Self-employed / freelancer', 'Student', 'Homemaker', 'Retired']

const LETTER_DATE: Field = { id: 'letterDate', label: 'Letter date (leave empty for today)', kind: 'date', group: 'Letter date' }

// ─── Field sets ──────────────────────────────────────────────────────────────

const COVER_FIELDS: Field[] = [
  { id: 'fullName', label: 'Full name (as in passport)', kind: 'text', placeholder: 'Ayesha Khan', group: 'Your details', half: true },
  { id: 'passportNo', label: 'Passport number', kind: 'text', placeholder: 'AB1234567', group: 'Your details', half: true },
  { id: 'cnic', label: 'National ID / CNIC (optional)', kind: 'text', placeholder: '35202-0000000-0', group: 'Your details', half: true },
  { id: 'nationality', label: 'Nationality', kind: 'text', placeholder: 'Pakistani', group: 'Your details', half: true },
  { id: 'address', label: 'Home address', kind: 'textarea', placeholder: 'House 1, Street 2, Lahore, Pakistan', group: 'Your details' },
  { id: 'email', label: 'Email', kind: 'text', placeholder: 'you@example.com', group: 'Your details', half: true },
  { id: 'phone', label: 'Phone', kind: 'text', placeholder: '+92 300 0000000', group: 'Your details', half: true },

  { id: 'region', label: 'Where are you applying?', kind: 'select', options: [...REGIONS], group: 'The application', half: true },
  { id: 'destination', label: 'Destination country', kind: 'text', placeholder: 'Germany', group: 'The application', half: true },
  { id: 'embassyCity', label: 'Embassy / consulate city', kind: 'text', placeholder: 'Islamabad', group: 'The application', half: true },
  { id: 'visaType', label: 'Visa type', kind: 'select', options: ['Tourist', 'Business', 'Family / friends visit', 'Transit', 'Medical'], group: 'The application', half: true },

  { id: 'purpose', label: 'Purpose of travel', kind: 'text', placeholder: 'Tourism in Berlin and Munich', hint: 'One line. State the activity, not a story.', group: 'Trip', scan: true },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'Trip', half: true },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'Trip', half: true },
  { id: 'itinerary', label: 'Where and when (one line per place)', kind: 'textarea', placeholder: 'Berlin, 1–5 Dec\nMunich, 6–10 Dec', hint: 'Dates must match your flight and hotel bookings.', group: 'Trip' },
  { id: 'accommodation', label: 'Accommodation', kind: 'text', placeholder: 'Hotel Example, Berlin (booking attached)', group: 'Trip' },

  { id: 'employment', label: 'Your work status', kind: 'select', options: EMPLOYMENT, group: 'Your situation at home' },
  { id: 'employer', label: 'Employer', kind: 'text', placeholder: 'Example Ltd, Lahore', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'jobTitle', label: 'Job title', kind: 'text', placeholder: 'Software engineer', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'jobSince', label: 'Working there since', kind: 'text', placeholder: 'March 2021', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'leave', label: 'Leave approved by employer?', kind: 'select', options: ['Yes, NOC / leave letter attached', 'Not yet'], group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'business', label: 'Business name and what it does', kind: 'text', placeholder: 'Khan Digital, web design', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'ntn', label: 'NTN / registration number', kind: 'text', placeholder: '1234567-8', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'bizSince', label: 'In business since', kind: 'text', placeholder: '2019', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'school', label: 'Institution and programme', kind: 'text', placeholder: 'LUMS, BSc Computer Science, year 3', group: 'Your situation at home', showIf: { id: 'employment', in: ['Student'] } },
  { id: 'sponsorWho', label: 'Who supports you (name, relationship, job)', kind: 'text', placeholder: 'Imran Khan, husband, director at Example Traders', group: 'Your situation at home', showIf: { id: 'employment', in: ['Homemaker', 'Student', 'Retired'] } },
  { id: 'pension', label: 'Income source (pension, rent, savings)', kind: 'text', placeholder: 'Government pension, PKR 80,000 per month', group: 'Your situation at home', showIf: { id: 'employment', in: ['Retired'] } },

  { id: 'funding', label: 'Who pays for the trip', kind: 'select', options: ['Myself', 'A sponsor (letter enclosed)', 'My employer'], group: 'Money', half: true },
  { id: 'income', label: 'Monthly income (optional)', kind: 'text', placeholder: 'PKR 300,000', hint: 'Only what your documents show.', group: 'Money', half: true },
  { id: 'finDocs', label: 'Financial documents attached', kind: 'checks', options: ['Bank statements, last 6 months', 'Bank statements stamped and signed by the branch', 'Salary slips, last 3 months', 'Tax returns (FBR)', 'Business registration', 'Sponsor letter and sponsor documents'], group: 'Money' },

  { id: 'property', label: 'Property you own at home (optional)', kind: 'text', placeholder: '3-bedroom house, Lahore', group: 'Ties to home country', scan: true },
  { id: 'dependents', label: 'Family staying at home (optional)', kind: 'text', placeholder: 'Spouse and two children (school-age, enrolled in Lahore)', group: 'Ties to home country', scan: true },
  { id: 'otherTies', label: 'Other ties (optional)', kind: 'text', placeholder: 'Ongoing university enrolment until 2027', group: 'Ties to home country', scan: true },
  { id: 'priorTravel', label: 'Previous international travel (optional)', kind: 'text', placeholder: 'UAE 2023, Turkey 2024. No visa refusals.', group: 'Ties to home country' },
  { id: 'enclosures', label: 'Other documents attached', kind: 'checks', options: ['Passport copy', 'Flight reservation', 'Hotel booking', 'Travel insurance', 'Employer NOC / leave letter', 'Invitation letter', 'NADRA Family Registration Certificate (FRC)', 'Marriage certificate'], group: 'Ties to home country' },
  LETTER_DATE,
]

const NOC_FIELDS: Field[] = [
  { id: 'company', label: 'Company name', kind: 'text', placeholder: 'Example Ltd', group: 'Company', half: true },
  { id: 'companyAddress', label: 'Company address', kind: 'textarea', placeholder: 'Plot 5, Industrial Area, Lahore, Pakistan', group: 'Company' },
  { id: 'signerName', label: 'Signed by (name)', kind: 'text', placeholder: 'Sara Ahmed', group: 'Company', half: true },
  { id: 'signerTitle', label: 'Signer’s job title', kind: 'text', placeholder: 'HR Manager', group: 'Company', half: true },
  { id: 'signerContact', label: 'Company phone or email', kind: 'text', placeholder: 'hr@example.com, +92 42 0000000', group: 'Company' },

  { id: 'empName', label: 'Employee full name', kind: 'text', placeholder: 'Ayesha Khan', group: 'Employee', half: true },
  { id: 'empId', label: 'Employee ID (optional)', kind: 'text', placeholder: 'EMP-1042', group: 'Employee', half: true },
  { id: 'empIdentity', label: 'Passport or CNIC number', kind: 'text', placeholder: 'AB1234567', group: 'Employee', half: true },
  { id: 'empTitle', label: 'Job title', kind: 'text', placeholder: 'Software engineer', group: 'Employee', half: true },
  { id: 'joined', label: 'Joined on', kind: 'date', group: 'Employee', half: true },
  { id: 'empStatus', label: 'Employment type', kind: 'select', options: ['Permanent', 'Contract', 'Probation'], group: 'Employee', half: true },
  { id: 'salary', label: 'Monthly salary (optional)', kind: 'text', placeholder: 'PKR 300,000', group: 'Employee', half: true },

  { id: 'embassy', label: 'Addressed to (or leave for “To whom it may concern”)', kind: 'text', placeholder: 'The Embassy of Germany, Islamabad', group: 'Leave' },
  { id: 'destination', label: 'Destination country', kind: 'text', placeholder: 'Germany', group: 'Leave', half: true },
  { id: 'purpose', label: 'Purpose of travel', kind: 'text', placeholder: 'Tourism', group: 'Leave', half: true },
  { id: 'leaveFrom', label: 'Leave from', kind: 'date', group: 'Leave', half: true },
  { id: 'leaveTo', label: 'Leave to', kind: 'date', group: 'Leave', half: true },
  { id: 'resume', label: 'Expected back at work on', kind: 'date', group: 'Leave', half: true },
  { id: 'leaveType', label: 'Leave type', kind: 'select', options: ['Annual leave', 'Unpaid leave', 'Leave approved by management'], group: 'Leave', half: true },
  LETTER_DATE,
]

const INVITATION_FIELDS: Field[] = [
  { id: 'hostName', label: 'Your full name (the host)', kind: 'text', placeholder: 'Daniel Schmidt', group: 'Host details', half: true },
  { id: 'hostStatus', label: 'Your status in the country', kind: 'select', options: ['Citizen', 'Permanent resident', 'Resident (work or study permit)'], group: 'Host details', half: true },
  { id: 'hostId', label: 'ID or residence permit number', kind: 'text', placeholder: 'L1234567', group: 'Host details', half: true },
  { id: 'hostOccupation', label: 'Occupation', kind: 'text', placeholder: 'Teacher', group: 'Host details', half: true },
  { id: 'hostAddress', label: 'Your address', kind: 'textarea', placeholder: 'Example Str. 1, 10115 Berlin, Germany', group: 'Host details' },
  { id: 'hostEmail', label: 'Email', kind: 'text', placeholder: 'host@example.com', group: 'Host details', half: true },
  { id: 'hostPhone', label: 'Phone', kind: 'text', placeholder: '+49 30 0000000', group: 'Host details', half: true },

  { id: 'guestName', label: 'Guest full name', kind: 'text', placeholder: 'Ayesha Khan', group: 'Guest details', half: true },
  { id: 'guestNationality', label: 'Guest nationality', kind: 'text', placeholder: 'Pakistani', group: 'Guest details', half: true },
  { id: 'guestPassport', label: 'Guest passport number', kind: 'text', placeholder: 'AB1234567', group: 'Guest details', half: true },
  { id: 'guestDob', label: 'Guest date of birth', kind: 'date', group: 'Guest details', half: true },
  { id: 'relationship', label: 'Your relationship', kind: 'text', placeholder: 'Sister', group: 'Guest details', scan: true },

  { id: 'region', label: 'Where is the guest applying?', kind: 'select', options: [...REGIONS], group: 'The visit', half: true },
  { id: 'embassy', label: 'Addressed to', kind: 'text', placeholder: 'The Embassy of Germany, Islamabad', group: 'The visit', half: true },
  { id: 'purpose', label: 'Purpose of the visit', kind: 'text', placeholder: 'Family visit', group: 'The visit', scan: true },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'The visit', half: true },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'The visit', half: true },
  { id: 'stay', label: 'Where the guest will stay', kind: 'text', placeholder: 'At my home at the address above', group: 'The visit' },
  { id: 'space', label: 'Space available (optional)', kind: 'text', placeholder: '3 bedrooms, 2 occupants', group: 'The visit' },
  { id: 'costs', label: 'Who covers the costs', kind: 'select', options: ['The guest covers all costs', 'I cover accommodation only', 'I cover all costs of the stay'], group: 'The visit' },
  { id: 'enclosures', label: 'Documents you are attaching', kind: 'checks', options: ['Copy of my ID or residence permit', 'Proof of address', 'Proof of income', 'Proof of relationship'], group: 'The visit' },
  LETTER_DATE,
]

const SPONSOR_FIELDS: Field[] = [
  { id: 'sponsorName', label: 'Sponsor full name', kind: 'text', placeholder: 'Imran Khan', group: 'Sponsor details', half: true },
  { id: 'sponsorOccupation', label: 'Occupation and employer', kind: 'text', placeholder: 'Director, Example Traders', group: 'Sponsor details', half: true },
  { id: 'sponsorId', label: 'ID / CNIC / passport number', kind: 'text', placeholder: '35202-0000000-0', group: 'Sponsor details', half: true },
  { id: 'relationship', label: 'Relationship to the applicant', kind: 'text', placeholder: 'Father', group: 'Sponsor details', half: true, scan: true },
  { id: 'sponsorAddress', label: 'Sponsor address', kind: 'textarea', placeholder: 'House 1, Street 2, Lahore, Pakistan', group: 'Sponsor details' },
  { id: 'sponsorEmail', label: 'Email', kind: 'text', placeholder: 'sponsor@example.com', group: 'Sponsor details', half: true },
  { id: 'sponsorPhone', label: 'Phone', kind: 'text', placeholder: '+92 300 0000000', group: 'Sponsor details', half: true },

  { id: 'applicantName', label: 'Applicant full name', kind: 'text', placeholder: 'Ayesha Khan', group: 'Applicant and trip', half: true },
  { id: 'applicantPassport', label: 'Applicant passport number', kind: 'text', placeholder: 'AB1234567', group: 'Applicant and trip', half: true },
  { id: 'region', label: 'Where is the applicant applying?', kind: 'select', options: [...REGIONS], group: 'Applicant and trip', half: true },
  { id: 'embassy', label: 'Addressed to', kind: 'text', placeholder: 'The Embassy of Germany, Islamabad', group: 'Applicant and trip', half: true },
  { id: 'destination', label: 'Destination country', kind: 'text', placeholder: 'Germany', group: 'Applicant and trip', half: true },
  { id: 'purpose', label: 'Purpose of the trip', kind: 'text', placeholder: 'Tourism', group: 'Applicant and trip', half: true, scan: true },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'Applicant and trip', half: true },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'Applicant and trip', half: true },

  { id: 'covers', label: 'What you will pay for', kind: 'checks', options: ['Flights', 'Accommodation', 'Daily living expenses', 'Travel insurance', 'Visa fees', 'Tuition fees'], group: 'Support' },
  { id: 'income', label: 'Your monthly income and savings', kind: 'text', placeholder: 'PKR 500,000 per month; savings PKR 3,000,000', hint: 'Only what your documents show.', group: 'Support', scan: true },
  { id: 'enclosures', label: 'Documents you are attaching', kind: 'checks', options: ['ID / passport copy', 'Bank statements, last 6 months', 'Salary slips or business income proof', 'Tax returns (FBR)', 'Employment letter', 'NADRA Family Registration Certificate (FRC)', 'Marriage certificate'], group: 'Support' },
  LETTER_DATE,
]

export const LETTERS: LetterMeta[] = [
  { type: 'cover', label: 'Visa cover letter', blurb: 'You are the applicant. Facts about your trip, money and ties to home.', fields: COVER_FIELDS },
  { type: 'noc', label: 'Employer NOC letter', blurb: 'Your employer confirms your job and approved leave. Print on letterhead.', fields: NOC_FIELDS },
  { type: 'invitation', label: 'Invitation letter', blurb: 'A host in the destination country invites a guest to visit.', fields: INVITATION_FIELDS },
  { type: 'sponsor', label: 'Sponsor support letter', blurb: 'Someone pays for the applicant’s trip and confirms it in writing.', fields: SPONSOR_FIELDS },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clean = (s: string | undefined): string => (s ?? '').trim()

/** Whether a field is currently shown (its showIf condition holds). */
export function isVisible(f: Field, d: Data): boolean {
  if (!f.showIf) return true
  return f.showIf.in.includes(clean(d[f.showIf.id]))
}

function v(d: Data, id: string, placeholder: string): Seg {
  const val = clean(d[id])
  return val ? { text: val, filled: true } : { text: `[${placeholder}]`, filled: false }
}

const t = (text: string): Seg => ({ text, filled: true })
const ph = (placeholder: string): Seg => ({ text: `[${placeholder}]`, filled: false })

/** 2026-10-11 → 11 October 2026. Falls back to the raw string. */
export function formatDate(iso: string | undefined): string {
  const s = clean(iso)
  if (!s) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return s
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const mi = Number(m[2]) - 1
  if (mi < 0 || mi > 11) return s
  return `${Number(m[3])} ${months[mi]} ${m[1]}`
}

function dateSeg(d: Data, id: string, placeholder: string): Seg {
  const f = formatDate(d[id])
  return f ? { text: f, filled: true } : ph(placeholder)
}

function multiline(d: Data, id: string, placeholder: string): Seg[][] {
  const val = clean(d[id])
  if (!val) return [[ph(placeholder)]]
  return val.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => [t(l)])
}

function checks(d: Data, id: string): string[] {
  return clean(d[id]) ? clean(d[id]).split('|').filter(Boolean) : []
}

const lowerFirst = (s: string): string => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s)
const p = (...segs: Seg[]): Block => ({ kind: 'p', segs })
const h = (text: string): Block => ({ kind: 'h', text })
const gap: Block = { kind: 'gap' }
const bullets = (items: Seg[][]): Block => ({ kind: 'list', items })
const lines = (ls: Seg[][]): Block => ({ kind: 'lines', lines: ls })

// ─── Builders ────────────────────────────────────────────────────────────────

function buildCover(d: Data): Block[] {
  const visaType = clean(d.visaType) || 'Tourist'
  const employment = clean(d.employment)
  const funding = clean(d.funding) || 'Myself'
  const finDocs = checks(d, 'finDocs')
  const enclosures = checks(d, 'enclosures')

  // Who I am, as one factual phrase.
  const whoSegs: Seg[] = (() => {
    switch (employment) {
      case 'Employed':
        return [t('works as '), v(d, 'jobTitle', 'job title'), t(' at '), v(d, 'employer', 'employer')]
      case 'Self-employed / freelancer':
        return [t('is self-employed ('), v(d, 'business', 'business'), t(')')]
      case 'Student':
        return [t('is a student ('), v(d, 'school', 'institution and programme'), t(')')]
      case 'Homemaker':
        return [t('is a homemaker supported by '), v(d, 'sponsorWho', 'sponsor')]
      case 'Retired':
        return [t('is retired, with income from '), v(d, 'pension', 'income source')]
      default:
        return [t('has the work status: '), ph('work status')]
    }
  })()

  const payer =
    funding === 'Myself'
      ? 'The trip is paid by me.'
      : funding === 'My employer'
        ? 'The trip is paid by my employer.'
        : 'The trip is paid by my sponsor; the sponsor letter is attached.'

  const idLine: Seg[] = [t('Passport no. '), v(d, 'passportNo', 'passport number')]
  if (clean(d.cnic)) idLine.push(t(' | National ID '), t(clean(d.cnic)))

  const blocks: Block[] = [
    lines([[v(d, 'fullName', 'Your full name')], idLine, ...multiline(d, 'address', 'Your address'), [t('Email: '), v(d, 'email', 'email'), t(' | Phone: '), v(d, 'phone', 'phone')]]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    lines([[t('The Visa Officer')], [t('Embassy / Consulate of '), v(d, 'destination', 'Destination country'), t(', '), v(d, 'embassyCity', 'City')]]),
    gap,
    p(t(`REQUEST FOR ${visaType.toUpperCase()} VISA — TRAVEL DATES: `), dateSeg(d, 'arrival', 'ARRIVAL'), t(' TO '), dateSeg(d, 'departure', 'DEPARTURE')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('I am '), v(d, 'fullName', 'Your full name'), t(', a citizen of '), v(d, 'nationality', 'nationality'), t(' who '), ...whoSegs, t('. I am applying for a '), t(`${lowerFirst(visaType)} visa to `), v(d, 'destination', 'Destination country'), t('. ' + payer)),
    gap,
    h('1. Purpose and itinerary'),
    bullets([[t('Purpose: '), v(d, 'purpose', 'purpose of travel')], ...multiline(d, 'itinerary', 'Where and when').map((l) => [t('Stay: '), ...l]), [t('Accommodation: '), v(d, 'accommodation', 'accommodation')]]),
    gap,
    h('2. Finances'),
  ]

  const fin: Seg[][] = []
  if (clean(d.income)) fin.push([t('Monthly income: '), t(clean(d.income))])
  fin.push([t('Paid by: '), t(funding === 'Myself' ? 'Myself' : funding === 'My employer' ? 'My employer' : 'Sponsor (letter attached)')])
  if (finDocs.length) finDocs.forEach((x) => fin.push([t('Attached: '), t(x)]))
  else fin.push([ph('Tick the financial documents you attach')])
  blocks.push(bullets(fin))

  // Ties to home country: facts only.
  const ties: Seg[][] = []
  if (employment === 'Employed') {
    ties.push([t('Employment: '), v(d, 'jobTitle', 'job title'), t(' at '), v(d, 'employer', 'employer'), t(', since '), v(d, 'jobSince', 'start date')])
    ties.push([t(clean(d.leave) === 'Not yet' ? 'Leave: not yet approved' : 'Leave: approved by employer, NOC attached')])
  } else if (employment === 'Self-employed / freelancer') {
    ties.push([t('Business: '), v(d, 'business', 'business'), t(', since '), v(d, 'bizSince', 'year')])
    ties.push([t('Registration / NTN: '), v(d, 'ntn', 'NTN')])
  } else if (employment === 'Student') {
    ties.push([t('Studies: '), v(d, 'school', 'institution and programme')])
  } else if (employment === 'Homemaker') {
    ties.push([t('Household supported by: '), v(d, 'sponsorWho', 'sponsor')])
  } else if (employment === 'Retired') {
    ties.push([t('Income: '), v(d, 'pension', 'income source')])
  } else {
    ties.push([ph('Choose your work status')])
  }
  if (clean(d.dependents)) ties.push([t('Family at home: '), t(clean(d.dependents))])
  if (clean(d.property)) ties.push([t('Property: '), t(clean(d.property))])
  if (clean(d.otherTies)) ties.push([t(clean(d.otherTies))])
  if (clean(d.priorTravel)) ties.push([t('Travel history: '), t(clean(d.priorTravel))])

  blocks.push(gap, h('3. Ties to home country'), bullets(ties))

  if (enclosures.length) {
    blocks.push(gap, h('4. Other documents attached'), bullets(enclosures.map((e) => [t(e)])))
  }

  blocks.push(
    gap,
    p(t('The information above is true and matches my documents. Thank you for considering my application.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    p(v(d, 'fullName', 'Your full name')),
  )
  return blocks
}

function buildNoc(d: Data): Block[] {
  const status = clean(d.empStatus)
  const addressee: Seg[] = clean(d.embassy) ? [v(d, 'embassy', 'Addressed to')] : [t('To whom it may concern')]
  const idBits: Seg[] = clean(d.empId) ? [t(', employee ID '), t(clean(d.empId))] : []
  const salary: Seg[][] = clean(d.salary) ? [[t('Current monthly salary: '), t(clean(d.salary))]] : []
  const contact: Seg[][] = clean(d.signerContact) ? [[t(clean(d.signerContact))]] : []

  return [
    p(t('[Print on company letterhead]')),
    gap,
    lines([[v(d, 'company', 'Company name')], ...multiline(d, 'companyAddress', 'Company address'), ...contact]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    p(...addressee),
    gap,
    p(t('SUBJECT: NO OBJECTION CERTIFICATE — '), v(d, 'empName', 'EMPLOYEE NAME')),
    gap,
    p(t('This is to confirm that '), v(d, 'empName', 'Employee name'), t(' (ID / passport no. '), v(d, 'empIdentity', 'number'), ...idBits, t(') is employed by '), v(d, 'company', 'Company name'), t(' as '), v(d, 'empTitle', 'job title'), t(status ? ` on a ${status.toLowerCase()} basis` : ''), t(', since '), dateSeg(d, 'joined', 'joining date'), t('.')),
    gap,
    h('Leave details'),
    bullets([
      [t('Leave type: '), t(clean(d.leaveType) || 'Annual leave')],
      [t('Leave period: '), dateSeg(d, 'leaveFrom', 'start date'), t(' to '), dateSeg(d, 'leaveTo', 'end date')],
      [t('Purpose: '), v(d, 'purpose', 'purpose'), t(' in '), v(d, 'destination', 'destination country')],
      [t('Expected to resume duty on: '), dateSeg(d, 'resume', 'return date')],
      ...salary,
    ]),
    gap,
    p(t('The company has no objection to this travel. The employee’s position remains open and the employment continues during and after the leave.')),
    gap,
    p(t('For verification, please contact the undersigned.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    lines([[v(d, 'signerName', 'Signer name')], [v(d, 'signerTitle', 'Job title')], [v(d, 'company', 'Company name')], [t('(Signature and company stamp)')]]),
  ]
}

function buildInvitation(d: Data): Block[] {
  const costs = clean(d.costs) || 'The guest covers all costs'
  const costsLine =
    costs === 'I cover all costs of the stay'
      ? 'I will cover all costs of the stay, including accommodation and living expenses.'
      : costs === 'I cover accommodation only'
        ? 'I will provide accommodation. The guest covers all other costs.'
        : 'The guest covers all costs of the trip.'
  const enclosures = checks(d, 'enclosures')

  const stay: Seg[][] = [[t('Accommodation: '), v(d, 'stay', 'where the guest will stay')]]
  if (clean(d.space)) stay.push([t('Space available: '), t(clean(d.space))])

  const blocks: Block[] = [
    lines([[v(d, 'hostName', 'Your full name')], ...multiline(d, 'hostAddress', 'Your address'), [t('Email: '), v(d, 'hostEmail', 'email'), t(' | Phone: '), v(d, 'hostPhone', 'phone')]]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    p(v(d, 'embassy', 'Embassy or consulate')),
    gap,
    p(t('INVITATION FOR '), v(d, 'guestName', 'GUEST NAME'), t(' — PASSPORT NO. '), v(d, 'guestPassport', 'NUMBER')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('I am '), v(d, 'hostName', 'Your full name'), t(', '), v(d, 'hostOccupation', 'occupation'), t(', a '), t(lowerFirst(clean(d.hostStatus) || 'resident')), t(' (ID / permit no. '), v(d, 'hostId', 'number'), t('). I am inviting '), v(d, 'guestName', 'Guest full name'), t(', a citizen of '), v(d, 'guestNationality', 'nationality'), t(', born '), dateSeg(d, 'guestDob', 'date of birth'), t('.')),
    gap,
    h('Details of the visit'),
    bullets([
      [t('Relationship: '), v(d, 'relationship', 'relationship')],
      [t('Purpose: '), v(d, 'purpose', 'purpose')],
      [t('Dates: '), dateSeg(d, 'arrival', 'arrival date'), t(' to '), dateSeg(d, 'departure', 'departure date')],
      ...stay,
      [t('Costs: '), t(costsLine)],
    ]),
  ]
  if (enclosures.length) blocks.push(gap, h('Attached'), bullets(enclosures.map((e) => [t(e)])))
  blocks.push(
    gap,
    p(t('The information above is true. I can provide further documents on request.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    p(v(d, 'hostName', 'Your full name')),
  )
  return blocks
}

function buildSponsor(d: Data): Block[] {
  const covers = checks(d, 'covers')
  const enclosures = checks(d, 'enclosures')

  const blocks: Block[] = [
    lines([[v(d, 'sponsorName', 'Sponsor full name')], ...multiline(d, 'sponsorAddress', 'Sponsor address'), [t('Email: '), v(d, 'sponsorEmail', 'email'), t(' | Phone: '), v(d, 'sponsorPhone', 'phone')]]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    p(v(d, 'embassy', 'Embassy or consulate')),
    gap,
    p(t('SPONSORSHIP LETTER FOR '), v(d, 'applicantName', 'APPLICANT NAME'), t(' — PASSPORT NO. '), v(d, 'applicantPassport', 'NUMBER')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('I am '), v(d, 'sponsorName', 'Sponsor full name'), t(' (ID no. '), v(d, 'sponsorId', 'number'), t('), '), v(d, 'sponsorOccupation', 'occupation'), t('. I am the '), v(d, 'relationship', 'relationship'), t(' of '), v(d, 'applicantName', 'Applicant full name'), t(' and I will sponsor the trip below.')),
    gap,
    h('The trip'),
    bullets([
      [t('Destination: '), v(d, 'destination', 'destination')],
      [t('Purpose: '), v(d, 'purpose', 'purpose')],
      [t('Dates: '), dateSeg(d, 'arrival', 'arrival date'), t(' to '), dateSeg(d, 'departure', 'departure date')],
    ]),
    gap,
    h('What I will pay for'),
    covers.length ? bullets(covers.map((c) => [t(c)])) : bullets([[ph('Select what you will pay for')]]),
    gap,
    h('My finances'),
    bullets([[t('Income and savings: '), v(d, 'income', 'income and savings')]]),
  ]
  if (enclosures.length) blocks.push(gap, h('Attached'), bullets(enclosures.map((e) => [t(e)])))
  blocks.push(
    gap,
    p(t('The information above is true and matches the attached documents.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    p(v(d, 'sponsorName', 'Sponsor full name')),
  )
  return blocks
}

/** Build the letter body. `today` is an ISO date used when no letter date is set. */
export function buildLetter(type: LetterType, data: Data, today: string): Block[] {
  const d: Data = { ...data, today: clean(data.letterDate) || today }
  switch (type) {
    case 'cover':
      return buildCover(d)
    case 'noc':
      return buildNoc(d)
    case 'invitation':
      return buildInvitation(d)
    case 'sponsor':
      return buildSponsor(d)
  }
}

// ─── Text export + counting ──────────────────────────────────────────────────

export function blocksToText(blocks: Block[]): string {
  const segText = (segs: Seg[]) => segs.map((s) => s.text).join('')
  return blocks
    .map((b) => {
      switch (b.kind) {
        case 'p':
          return segText(b.segs)
        case 'h':
          return b.text
        case 'lines':
          return b.lines.map(segText).join('\n')
        case 'list':
          return b.items.map((i) => `- ${segText(i)}`).join('\n')
        case 'gap':
          return ''
      }
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function countPlaceholders(blocks: Block[]): number {
  let n = 0
  const walk = (segs: Seg[]) => segs.forEach((s) => { if (!s.filled) n++ })
  for (const b of blocks) {
    if (b.kind === 'p') walk(b.segs)
    else if (b.kind === 'lines') b.lines.forEach(walk)
    else if (b.kind === 'list') b.items.forEach(walk)
  }
  return n
}

// ─── Notices (by country and letter type) ────────────────────────────────────

/**
 * Plain warnings about what a letter can and cannot do, by destination.
 * Wording is deliberately cautious: the user must check the official embassy page.
 */
export function getNotices(type: LetterType, d: Data): Notice[] {
  const region = clean(d.region)
  const out: Notice[] = []

  if (type === 'noc') {
    out.push({ level: 'info', text: 'Your employer must print this on company letterhead, sign it and stamp it. Change nothing after it is signed.' })
    return out
  }

  if (region === 'United States') {
    if (type === 'invitation') {
      out.push({ level: 'warn', text: 'The US State Department says visitor (B1/B2) applicants must qualify on their own merits. An invitation letter is not required and does not replace your own ties to home. Check travel.state.gov before you use one.' })
    } else {
      out.push({ level: 'warn', text: 'US visitor visas are decided at the interview from your DS-160 and your answers. A cover letter is usually not needed. Check travel.state.gov before you use one.' })
    }
  }

  if (region === 'Schengen (Europe)') {
    if (type === 'invitation' || type === 'sponsor') {
      out.push({ level: 'warn', text: 'Some Schengen countries ask for an official invitation or sponsorship form, for example Germany (Verpflichtungserklärung), France (attestation d’accueil) and Spain (carta de invitación). A plain letter does not replace it. Check the consulate’s checklist.' })
    }
    if (type === 'cover') {
      out.push({ level: 'info', text: 'Keep dates identical to your flight, hotel and insurance. Sign the printed letter in ink.' })
    }
  }

  if (region === 'United Kingdom' && type === 'cover') {
    out.push({ level: 'info', text: 'UK Visas and Immigration does not require a cover letter. If you add one, keep it to one page and do not repeat what your documents already show.' })
  }
  if (region === 'United Kingdom' && type === 'invitation') {
    out.push({ level: 'info', text: 'State how much space you have for the guest (for example, bedrooms). Do not offer more than your home can hold.' })
  }

  if (region === 'Canada') {
    if (type === 'cover') out.push({ level: 'info', text: 'For Canada this is usually called a letter of explanation. Address ties, funds and purpose in short bullet points.' })
    if (type === 'invitation') out.push({ level: 'info', text: 'State the host’s status in Canada (citizen or permanent resident).' })
  }

  if (region === 'Australia' && type === 'invitation') {
    out.push({ level: 'info', text: 'Australia may give a statutory declaration more weight than a plain letter from a host. Check the Home Affairs website.' })
  }

  return out
}

// ─── Red-flag check ──────────────────────────────────────────────────────────

export interface RedFlag {
  fieldLabel: string
  text: string
}

const FLAG_RULES: { re: RegExp; text: string }[] = [
  { re: /\b(promise|swear|guarantee|assure)\b/i, text: 'Promises and guarantees carry no weight. State a fact instead, such as your job, property or family at home.' },
  { re: /part[-\s]?time|look(ing)? for (a )?(job|work)|find (a )?(job|work)|work (there|abroad)|settle|stay permanently|immigrate/i, text: 'This can read as intent to work or stay. Remove it unless it is true and allowed by your visa.' },
  { re: /\b(dream|beautiful country|flourishing|contribute to (my|the) (home )?(country|economy)|strong desire|deeply passionate)\b/i, text: 'Generic, emotional wording looks like a template. Use plain facts and numbers.' },
  { re: /\b(rich|wealthy|millionaire|unlimited funds|plenty of money)\b/i, text: 'Vague money claims are weak. Give the actual amount shown in your bank statement.' },
]

export function findRedFlags(type: LetterType, d: Data): RedFlag[] {
  const meta = LETTERS.find((l) => l.type === type)
  if (!meta) return []
  const flags: RedFlag[] = []
  for (const f of meta.fields) {
    if (!f.scan || !isVisible(f, d)) continue
    const val = clean(d[f.id])
    if (!val) continue
    for (const r of FLAG_RULES) {
      if (r.re.test(val)) flags.push({ fieldLabel: f.label, text: r.text })
    }
  }
  return flags
}
