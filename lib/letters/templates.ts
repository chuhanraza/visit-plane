/**
 * Immigration support letters — field config, letter builders, notices, red-flag checks.
 *
 * Pure functions, no I/O. The same block model drives the live preview, the
 * copy-text button and the PDF, so what the user sees is exactly what they get.
 * Design rule: facts, not stories. Letters are short, bulleted and built only from
 * what the user typed — no adjectives or promises are added.
 */

import { localizeFields, type OriginId } from './origins'

export type LetterType = 'cover' | 'noc' | 'invitation' | 'sponsor'

export type FieldKind = 'text' | 'textarea' | 'date' | 'select' | 'checks'

export interface Cond {
  id: string
  in: string[]
  orEmpty?: boolean
}

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
  showIf?: Cond | Cond[]
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

const ISSUER_EMPLOYER = 'Employer (HR or manager signs)'
const ISSUER_OWNER = 'Business owner (self-issued, a partner or co-director signs)'
const ISSUER_GOV = 'Government department (an authorised officer signs)'

const SHORT = 'Short stay (up to 90 days)'
const LONG = 'Long stay (national / D visa)'
const IS_SHORT = { id: 'visaTerm', in: [SHORT], orEmpty: true }
const IS_LONG = { id: 'visaTerm', in: [LONG] }
const LONG_TYPES = ['Study', 'Employment', 'Family reunification', 'Research / au pair / volunteer']

const LETTER_DATE: Field = { id: 'letterDate', label: 'Letter date (leave empty for today)', kind: 'date', group: 'Letter date' }

// ─── Field sets ──────────────────────────────────────────────────────────────

const COVER_FIELDS: Field[] = [
  { id: 'fullName', label: 'Full name (as in passport)', kind: 'text', placeholder: 'Ayesha Khan', group: 'Your details', half: true },
  { id: 'passportNo', label: 'Passport number', kind: 'text', placeholder: 'AB1234567', group: 'Your details', half: true },
  { id: 'passportExpiry', label: 'Passport expiry date', kind: 'date', group: 'Your details', half: true },
  { id: 'cnic', label: 'National ID / CNIC (optional)', kind: 'text', placeholder: '35202-0000000-0', group: 'Your details', half: true },
  { id: 'nationality', label: 'Nationality', kind: 'text', placeholder: 'Pakistani', group: 'Your details', half: true },
  { id: 'address', label: 'Home address', kind: 'textarea', placeholder: 'House 1, Street 2, Lahore, Pakistan', group: 'Your details' },
  { id: 'email', label: 'Email', kind: 'text', placeholder: 'you@example.com', group: 'Your details', half: true },
  { id: 'phone', label: 'Phone', kind: 'text', placeholder: '+92 300 0000000', group: 'Your details', half: true },

  { id: 'region', label: 'Where are you applying?', kind: 'select', options: [...REGIONS], group: 'The application', half: true },
  { id: 'destination', label: 'Destination country', kind: 'text', placeholder: 'Germany', group: 'The application', half: true },
  { id: 'embassyCity', label: 'Embassy / consulate city', kind: 'text', placeholder: 'Islamabad', group: 'The application', half: true },
  { id: 'visaTerm', label: 'Length of stay', kind: 'select', options: [SHORT, LONG], hint: 'Short stay (C) = a trip with a return date. Long stay (D) = study, work or family move.', group: 'The application', half: true },
  { id: 'visaType', label: 'Visa type', kind: 'select', options: ['Tourist', 'Business', 'Family / friends visit', 'Transit', 'Medical'], group: 'The application', half: true, showIf: IS_SHORT },
  { id: 'longType', label: 'Visa type', kind: 'select', options: LONG_TYPES, group: 'The application', half: true, showIf: IS_LONG },

  { id: 'purpose', label: 'Purpose of travel', kind: 'text', placeholder: 'Tourism in Berlin and Munich', hint: 'One line. State the activity, not a story.', group: 'Trip', scan: true, showIf: IS_SHORT },
  { id: 'eventName', label: 'Event or meeting', kind: 'text', placeholder: 'EICMA motorcycle exhibition, Milan', group: 'Trip', showIf: [IS_SHORT, { id: 'visaType', in: ['Business'] }] },
  { id: 'eventHost', label: 'Inviting company or organiser (optional)', kind: 'text', placeholder: 'Example Srl, Milan (invitation attached)', group: 'Trip', showIf: [IS_SHORT, { id: 'visaType', in: ['Business'] }] },
  { id: 'familyHost', label: 'Who you are visiting (name and relationship)', kind: 'text', placeholder: 'Daniel Schmidt, brother, German citizen', group: 'Trip', showIf: [IS_SHORT, { id: 'visaType', in: ['Family / friends visit'] }] },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'Trip', half: true, showIf: IS_SHORT },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'Trip', half: true, showIf: IS_SHORT },
  { id: 'itinerary', label: 'Where and when (one line per place)', kind: 'textarea', placeholder: 'Berlin, 1–5 Dec\nMunich, 6–10 Dec', hint: 'Dates must match your flight and hotel bookings.', group: 'Trip', showIf: IS_SHORT },
  { id: 'accommodation', label: 'Accommodation', kind: 'text', placeholder: 'Hotel Example, Berlin (booking attached)', group: 'Trip', showIf: IS_SHORT },

  { id: 'institution', label: 'University or employer in the destination country', kind: 'text', placeholder: 'Technical University of Munich', group: 'Long-stay plan', showIf: IS_LONG },
  { id: 'programme', label: 'Programme, job title or project', kind: 'text', placeholder: 'MSc Data Engineering (2 years)', group: 'Long-stay plan', showIf: IS_LONG },
  { id: 'startDate', label: 'Start date', kind: 'date', group: 'Long-stay plan', half: true, showIf: IS_LONG },
  { id: 'endDate', label: 'End date (contract, semester or programme end)', kind: 'date', group: 'Long-stay plan', half: true, showIf: IS_LONG },
  { id: 'longAccommodation', label: 'Where you will live', kind: 'text', placeholder: 'University dormitory (contract attached)', group: 'Long-stay plan', showIf: IS_LONG },
  { id: 'longFunding', label: 'How you will fund your stay', kind: 'select', options: ['Blocked account', 'Scholarship', 'Salary from the destination employer', 'Family sponsor', 'My savings and income from home'], group: 'Long-stay plan', half: true, showIf: IS_LONG },
  { id: 'longFundingDetail', label: 'Funding details (amount, provider)', kind: 'text', placeholder: 'EUR 11,904 in blocked account at Example Bank', group: 'Long-stay plan', half: true, showIf: IS_LONG },
  { id: 'longDocs', label: 'Institutional documents attached', kind: 'checks', options: ['Admission / acceptance letter', 'Signed employment contract', 'Police clearance certificate', 'Apostilled marriage certificate', 'Apostilled birth certificate', 'Health insurance policy', 'Degree certificates and transcripts', 'Language certificate'], group: 'Long-stay plan', showIf: IS_LONG },

  { id: 'employment', label: 'Your work status', kind: 'select', options: EMPLOYMENT, group: 'Your situation at home' },
  { id: 'employer', label: 'Employer', kind: 'text', placeholder: 'Example Ltd, Lahore', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'jobTitle', label: 'Job title', kind: 'text', placeholder: 'Software engineer', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'jobSince', label: 'Working there since', kind: 'text', placeholder: 'March 2021', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'leave', label: 'Leave approved by employer?', kind: 'select', options: ['Yes, NOC / leave letter attached', 'Not yet'], group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Employed'] } },
  { id: 'business', label: 'Business name and what it does', kind: 'text', placeholder: 'Khan Digital, web design', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'ntn', label: 'NTN / registration number', kind: 'text', placeholder: '1234567-8', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'bizSince', label: 'In business since', kind: 'text', placeholder: '2019', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'bizModel', label: 'How the business earns money (one line)', kind: 'text', placeholder: 'Exports garments to B2B buyers in Europe', group: 'Your situation at home', showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'bizScale', label: 'Size of the business', kind: 'text', placeholder: 'About 40 employees, 2 workshops in Sialkot', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'bizDelegate', label: 'Who runs operations while you are away', kind: 'text', placeholder: 'Head of Production (daily operations); Sales Manager (clients)', group: 'Your situation at home', half: true, showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'bizObligations', label: 'Work waiting for you on return (optional)', kind: 'text', placeholder: 'Two export orders ship in the second week after my return', group: 'Your situation at home', showIf: { id: 'employment', in: ['Self-employed / freelancer'] } },
  { id: 'school', label: 'Institution and programme', kind: 'text', placeholder: 'LUMS, BSc Computer Science, year 3', group: 'Your situation at home', showIf: { id: 'employment', in: ['Student'] } },
  { id: 'sponsorWho', label: 'Who supports you (name, relationship, job)', kind: 'text', placeholder: 'Imran Khan, husband, director at Example Traders', group: 'Your situation at home', showIf: { id: 'employment', in: ['Homemaker', 'Student', 'Retired'] } },
  { id: 'pension', label: 'Income source (pension, rent, savings)', kind: 'text', placeholder: 'Government pension, PKR 80,000 per month', group: 'Your situation at home', showIf: { id: 'employment', in: ['Retired'] } },

  { id: 'funding', label: 'Who pays for the trip', kind: 'select', options: ['Myself', 'A sponsor (letter enclosed)', 'My employer', 'My own company'], group: 'Money', half: true, showIf: IS_SHORT },
  { id: 'income', label: 'Monthly income (optional)', kind: 'text', placeholder: 'PKR 300,000', hint: 'Only what your documents show.', group: 'Money', half: true },
  { id: 'finDocs', label: 'Financial documents attached', kind: 'checks', options: ['Bank statements, last 6 months', 'Bank statements stamped and signed by the branch', 'Salary slips, last 3 months', 'Tax returns (FBR)', 'Business registration', 'Company bank statements, last 6 months', 'Business tax registration (NTN) and returns', 'Sponsor letter and sponsor documents'], group: 'Money' },

  { id: 'property', label: 'Property you own at home (optional)', kind: 'text', placeholder: '3-bedroom house, Lahore', group: 'Ties to home country', scan: true },
  { id: 'dependents', label: 'Family staying at home (optional)', kind: 'text', placeholder: 'Spouse and two children (school-age, enrolled in Lahore)', group: 'Ties to home country', scan: true },
  { id: 'otherTies', label: 'Other ties (optional)', kind: 'text', placeholder: 'Ongoing university enrolment until 2027', group: 'Ties to home country', scan: true },
  { id: 'priorTravel', label: 'Previous international travel (optional)', kind: 'text', placeholder: 'UAE 2023, Turkey 2024. No visa refusals.', group: 'Ties to home country' },
  { id: 'enclosures', label: 'Other documents attached', kind: 'checks', options: ['Passport copy', 'Flight reservation', 'Hotel booking', 'Travel insurance', 'Employer NOC / leave letter', 'Invitation letter', 'NADRA Family Registration Certificate (FRC)', 'Marriage certificate'], group: 'Ties to home country' },
  LETTER_DATE,
]

const NOC_FIELDS: Field[] = [
  { id: 'issuer', label: 'Who is issuing this letter?', kind: 'select', options: [ISSUER_EMPLOYER, ISSUER_OWNER, ISSUER_GOV], hint: 'Owners have no boss to write a NOC, so the company issues one for them. Government employees ask their own department.', group: 'Company' },
  { id: 'company', label: 'Company or department name', kind: 'text', placeholder: 'Example Ltd', group: 'Company', half: true },
  { id: 'companyAddress', label: 'Company or department address', kind: 'textarea', placeholder: 'Plot 5, Industrial Area, Lahore, Pakistan', group: 'Company' },
  { id: 'signerName', label: 'Signed by (name)', kind: 'text', placeholder: 'Sara Ahmed', group: 'Company', half: true },
  { id: 'signerTitle', label: 'Signer’s job title', kind: 'text', placeholder: 'HR Manager', group: 'Company', half: true },
  { id: 'signerContact', label: 'Company or department phone or email', kind: 'text', placeholder: 'hr@example.com, +92 42 0000000', group: 'Company' },

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
  { id: 'leaveType', label: 'Leave type', kind: 'select', options: ['Annual leave', 'Unpaid leave', 'Leave approved by management'], group: 'Leave', half: true, showIf: { id: 'issuer', in: [ISSUER_EMPLOYER, ISSUER_GOV], orEmpty: true } },
  { id: 'ownerCosts', label: 'Who pays for the trip', kind: 'select', options: ['The company pays all costs', 'The traveller pays personally'], group: 'Leave', half: true, showIf: { id: 'issuer', in: [ISSUER_OWNER] } },
  { id: 'ownerDelegate', label: 'Who runs operations while the owner is away', kind: 'text', placeholder: 'Head of Production (daily operations); Marketing Director (clients)', group: 'Leave', showIf: { id: 'issuer', in: [ISSUER_OWNER] } },
  { id: 'ownerScale', label: 'Size of the company (optional)', kind: 'text', placeholder: 'About 40 employees across 2 sites', group: 'Leave', showIf: { id: 'issuer', in: [ISSUER_OWNER] } },
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

  { id: 'studyDetails', label: 'If the trip is for study: institution and programme (optional)', kind: 'text', placeholder: 'University of Example, MSc Data Science', group: 'Support' },
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

/** The field list for a letter type, localized to where the applicant lives. */
export function getFields(type: LetterType, origin: OriginId = 'pakistan'): Field[] {
  const meta = LETTERS.find((l) => l.type === type)
  return meta ? localizeFields(type, meta.fields, origin) : []
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clean = (s: string | undefined): string => (s ?? '').trim()

/** Whether a field is currently shown (its showIf condition holds). */
export function isVisible(f: Field, d: Data): boolean {
  if (!f.showIf) return true
  const conds = Array.isArray(f.showIf) ? f.showIf : [f.showIf]
  return conds.every((c) => {
    const val = clean(d[c.id])
    return c.in.includes(val) || (!!c.orEmpty && val === '')
  })
}

function v(d: Data, id: string, placeholder: string): Seg {
  const val = clean(d[id])
  return val ? { text: val, filled: true } : { text: `[${placeholder}]`, filled: false }
}

/** "United Kingdom" → "the United Kingdom". Names that take no article are returned unchanged. */
function withThe(name: string): string {
  return /^(united kingdom|united states( of america)?|united arab emirates|uae|netherlands|philippines|czech republic|maldives|bahamas|gambia)$/i.test(name.trim()) ? `the ${name.trim()}` : name
}
function vDest(d: Data, placeholder: string): Seg {
  const val = clean(d.destination)
  return val ? { text: withThe(val), filled: true } : { text: `[${placeholder}]`, filled: false }
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
  const isLong = clean(d.visaTerm) === LONG
  const longType = clean(d.longType)
  const visaType = clean(d.visaType) || 'Tourist'
  const longFunding = clean(d.longFunding)
  const employment = clean(d.employment)
  const funding = clean(d.funding) || 'Myself'
  const finDocs = checks(d, 'finDocs')
  const enclosures = checks(d, 'enclosures')

  // Who I am, as one factual phrase.
  const whoSegs: Seg[] = (() => {
    switch (employment) {
      case 'Employed':
        return [t('works at '), v(d, 'employer', 'employer'), t(' (job title: '), v(d, 'jobTitle', 'job title'), t(')')]
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

  const payer = isLong
    ? ({
        'Blocked account': 'My stay is funded through a blocked account.',
        Scholarship: 'My stay is funded by a scholarship.',
        'Salary from the destination employer': 'My stay is funded by my salary from the employer in the destination country.',
        'Family sponsor': 'My stay is funded by a family sponsor.',
        'My savings and income from home': 'My stay is funded from my own savings and income.',
      }[longFunding] ?? 'My stay is funded as set out in section 2.')
    : funding === 'Myself'
      ? 'The trip is paid by me.'
      : funding === 'My employer'
        ? 'The trip is paid by my employer.'
        : funding === 'My own company'
          ? 'The trip is paid by my company.'
          : 'The trip is paid by my sponsor; the sponsor letter is attached.'
  const visaPhrase = isLong ? `national long-stay ${longType ? lowerFirst(longType) + ' ' : ''}visa` : `${lowerFirst(visaType)} visa`

  const idLine: Seg[] = [t('Passport no. '), v(d, 'passportNo', 'passport number')]
  if (clean(d.passportExpiry)) idLine.push(t(', valid until '), dateSeg(d, 'passportExpiry', 'expiry'))
  if (clean(d.cnic)) idLine.push(t(' | National ID '), t(clean(d.cnic)))

  const blocks: Block[] = [
    lines([[v(d, 'fullName', 'Your full name')], idLine, ...multiline(d, 'address', 'Your address'), [t('Email: '), v(d, 'email', 'email'), t(' | Phone: '), v(d, 'phone', 'phone')]]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    lines([[t('The Visa Officer')], [t('Embassy / Consulate of '), vDest(d, 'Destination country'), t(', '), v(d, 'embassyCity', 'City')]]),
    gap,
    isLong
      ? p(t(`REQUEST FOR NATIONAL (D) ${longType ? longType.toUpperCase() + ' ' : ''}VISA — START DATE: `), dateSeg(d, 'startDate', 'START DATE'))
      : p(t(`${clean(d.region) === 'Canada' ? 'LETTER OF EXPLANATION — ' : ''}REQUEST FOR ${visaType.toUpperCase()} VISA — TRAVEL DATES: `), dateSeg(d, 'arrival', 'ARRIVAL'), t(' TO '), dateSeg(d, 'departure', 'DEPARTURE')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('I am '), v(d, 'fullName', 'Your full name'), t(', a '), v(d, 'nationality', 'nationality'), t(' national'), ...(employment ? [t(' who '), ...whoSegs] : []), t('. I am applying for a '), t(`${visaPhrase} to `), vDest(d, 'Destination country'), t('. ' + payer)),
    gap,
    ...(isLong
      ? [
          h('1. Purpose and timeline'),
          bullets([
            [t('Purpose: '), t(longType || 'long-stay residence'), t(' at '), v(d, 'institution', 'university or employer')],
            [t('Programme / role: '), v(d, 'programme', 'programme, job title or project')],
            [t('Period: '), dateSeg(d, 'startDate', 'start date'), t(' to '), dateSeg(d, 'endDate', 'end date')],
            [t('Where I will live: '), v(d, 'longAccommodation', 'accommodation')],
          ]),
        ]
      : [
          h('1. Purpose and itinerary'),
          bullets([
            [t('Purpose: '), v(d, 'purpose', 'purpose of travel')],
            ...(visaType === 'Business' && clean(d.eventName) ? [[t('Event / meeting: '), t(clean(d.eventName))]] : []),
            ...(visaType === 'Business' && clean(d.eventHost) ? [[t('Invited by: '), t(clean(d.eventHost))]] : []),
            ...(visaType === 'Family / friends visit' && clean(d.familyHost) ? [[t('Visiting: '), t(clean(d.familyHost))]] : []),
            ...multiline(d, 'itinerary', 'Where and when').map((l) => [t('Stay: '), ...l]),
            [t('Accommodation: '), v(d, 'accommodation', 'accommodation')],
          ]),
        ]),
    gap,
    h('2. Finances'),
  ]

  const fin: Seg[][] = []
  if (clean(d.income)) fin.push([t('Monthly income: '), t(clean(d.income))])
  if (isLong) {
    fin.push([t('Funding: '), v(d, 'longFunding', 'how you will fund your stay'), ...(clean(d.longFundingDetail) ? [t(' — '), t(clean(d.longFundingDetail))] : [])])
  } else {
    fin.push([t('Paid by: '), t(funding === 'Myself' ? 'Myself' : funding === 'My employer' ? 'My employer' : funding === 'My own company' ? 'My own company' : 'Sponsor (letter attached)')])
  }
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
    const reg = clean(d.origin)
    ties.push(
      reg === 'india'
        ? [t('Registration (GST / Udyam / company): '), v(d, 'ntn', 'registration number')]
        : reg === 'other'
          ? [t('Business registration: '), v(d, 'ntn', 'registration number')]
          : [t('Registration / NTN: '), v(d, 'ntn', 'NTN')],
    )
    if (clean(d.bizModel)) ties.push([t('Business model: '), t(clean(d.bizModel))])
    if (clean(d.bizScale)) ties.push([t('Scale: '), t(clean(d.bizScale))])
    if (clean(d.bizDelegate)) ties.push([t('Operations while I am away: '), t(clean(d.bizDelegate))])
    if (clean(d.bizObligations)) ties.push([t('Work waiting on my return: '), t(clean(d.bizObligations))])
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

  blocks.push(gap, h(isLong ? '3. Background and ties to home country' : '3. Ties to home country'), bullets(ties))

  const allDocs = isLong ? [...checks(d, 'longDocs'), ...enclosures] : enclosures
  if (allDocs.length) {
    blocks.push(gap, h(isLong ? '4. Documents attached' : '4. Other documents attached'), bullets(allDocs.map((e) => [t(e)])))
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

function buildOwnerNoc(d: Data): Block[] {
  const addressee: Seg[] = clean(d.embassy) ? [v(d, 'embassy', 'Addressed to')] : [t('To whom it may concern')]
  const contact: Seg[][] = clean(d.signerContact) ? [[t(clean(d.signerContact))]] : []
  const paysAll = clean(d.ownerCosts) !== 'The traveller pays personally'
  const scale: Seg[] = clean(d.ownerScale) ? [t(' The company operates with '), t(clean(d.ownerScale)), t('.')] : []
  return [
    p(t('[Print on company letterhead]')),
    gap,
    lines([[v(d, 'company', 'Company name')], ...multiline(d, 'companyAddress', 'Company address'), ...contact]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    p(...addressee),
    gap,
    p(t('SUBJECT: NO OBJECTION CERTIFICATE AND TRAVEL AUTHORISATION — '), v(d, 'empName', 'NAME')),
    gap,
    p(t('This letter confirms that '), v(d, 'empName', 'Name'), t(' (ID / passport no. '), v(d, 'empIdentity', 'number'), t(') is '), v(d, 'empTitle', 'role in the company'), t(' of '), v(d, 'company', 'Company name'), t(', and has been so since '), dateSeg(d, 'joined', 'start date'), t('.'), ...scale),
    gap,
    h('Travel details'),
    bullets([
      [t('Destination: '), v(d, 'destination', 'destination country')],
      [t('Purpose: '), v(d, 'purpose', 'purpose (for example, a trade fair or buyer meetings)')],
      [t('Travel period: '), dateSeg(d, 'leaveFrom', 'start date'), t(' to '), dateSeg(d, 'leaveTo', 'end date')],
      [t('Expected back at work on: '), dateSeg(d, 'resume', 'return date')],
      [t('Costs: '), clean(d.ownerCosts) ? t(paysAll ? 'All costs of the trip are paid by the company.' : 'The traveller pays personally.') : ph('who pays for the trip')],
      [t('Operations during the absence: '), v(d, 'ownerDelegate', 'who runs operations')],
    ]),
    gap,
    p(t('The company has no objection to this travel. The business continues to operate during the absence, and '), v(d, 'empName', 'the traveller'), t(' will resume full duties on the return date above.')),
    gap,
    p(t('For verification, please contact the undersigned.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    lines([[v(d, 'signerName', 'Signer name')], [v(d, 'signerTitle', 'Job title (partner, co-director or senior manager)')], [v(d, 'company', 'Company name')], [t('(Signature and company stamp)')]]),
  ]
}

function buildNoc(d: Data): Block[] {
  if (clean(d.issuer).startsWith('Business owner')) return buildOwnerNoc(d)
  const status = clean(d.empStatus)
  const isGov = clean(d.issuer) === ISSUER_GOV
  const org = isGov ? 'department' : 'company'
  const addressee: Seg[] = clean(d.embassy) ? [v(d, 'embassy', 'Addressed to')] : [t('To whom it may concern')]
  const idBits: Seg[] = clean(d.empId) ? [t(', employee ID '), t(clean(d.empId))] : []
  const salary: Seg[][] = clean(d.salary) ? [[t('Current monthly salary: '), t(clean(d.salary))]] : []
  const contact: Seg[][] = clean(d.signerContact) ? [[t(clean(d.signerContact))]] : []

  return [
    p(t(isGov ? '[Print on official departmental letterhead]' : '[Print on company letterhead]')),
    gap,
    lines([[v(d, 'company', isGov ? 'Department name' : 'Company name')], ...multiline(d, 'companyAddress', isGov ? 'Department address' : 'Company address'), ...contact]),
    gap,
    p(dateSeg(d, 'today', 'Date')),
    gap,
    p(...addressee),
    gap,
    p(t('SUBJECT: NO OBJECTION CERTIFICATE — '), v(d, 'empName', 'EMPLOYEE NAME')),
    gap,
    p(t('This is to confirm that '), v(d, 'empName', 'Employee name'), t(' (ID / passport no. '), v(d, 'empIdentity', 'number'), ...idBits, t(') is employed by '), v(d, 'company', isGov ? 'Department name' : 'Company name'), t(' as '), v(d, 'empTitle', 'job title'), t(status ? ` on a ${status.toLowerCase()} basis` : ''), t(', since '), dateSeg(d, 'joined', 'joining date'), t('.')),
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
    p(t(`The ${org} has no objection to this travel. The employee’s position remains open and the employment continues during and after the leave.`)),
    gap,
    p(t('For verification, please contact the undersigned.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    lines([[v(d, 'signerName', 'Signer name')], [v(d, 'signerTitle', isGov ? 'Designation' : 'Job title')], [v(d, 'company', isGov ? 'Department name' : 'Company name')], [t(isGov ? '(Signature and official stamp)' : '(Signature and company stamp)')]]),
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
    p(t('I am '), v(d, 'hostName', 'Your full name'), t(', a '), t(lowerFirst(clean(d.hostStatus) || 'resident')), t(' (ID / permit no. '), v(d, 'hostId', 'number'), t('). My occupation: '), v(d, 'hostOccupation', 'occupation'), t('. I am inviting '), v(d, 'guestName', 'Guest full name'), t(', a '), v(d, 'guestNationality', 'nationality'), t(' national, born '), dateSeg(d, 'guestDob', 'date of birth'), t('.')),
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
    p(t('I am '), v(d, 'sponsorName', 'Sponsor full name'), t(' (ID no. '), v(d, 'sponsorId', 'number'), t('), '), v(d, 'sponsorOccupation', 'occupation'), t('. I am the '), (clean(d.relationship) ? t(lowerFirst(clean(d.relationship))) : ph('relationship')), t(' of '), v(d, 'applicantName', 'Applicant full name'), t(' and I will sponsor the trip below.')),
    gap,
    h('The trip'),
    bullets([
      [t('Destination: '), v(d, 'destination', 'destination')],
      [t('Purpose: '), v(d, 'purpose', 'purpose')],
      ...(clean(d.studyDetails) ? [[t('Study: '), t(clean(d.studyDetails))]] : []),
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
function baseNotices(type: LetterType, d: Data): Notice[] {
  const region = clean(d.region)
  const out: Notice[] = []

  if (type === 'noc') {
    out.push({ level: 'info', text: 'Print this on company letterhead, sign it and stamp it with a real ink stamp. Change nothing after it is signed.' })
    if (clean(d.issuer) === ISSUER_GOV) {
      out.push({ level: 'info', text: 'Government employees: the letter normally comes from your own department and names the exact leave dates. Some consulates also ask for it to be attested, for example by the Ministry of Foreign Affairs, so check the checklist. Official travel is usually covered by a different document.' })
    }
    if (clean(d.issuer).startsWith('Business owner')) {
      out.push({ level: 'info', text: 'A self-issued letter carries more weight when a partner, co-director or senior manager signs it, not you. Only name a signer who really holds that role, and keep every statement true and matching your registration documents.' })
    }
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
      out.push({ level: 'info', text: 'Check your consulate’s checklist first: some Schengen countries list a cover letter and many do not. A letter helps most when it explains what the documents cannot, such as self-employed income, a sponsor paying, or a first trip. Keep dates identical to your flight, hotel and insurance, and sign it in ink.' })
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


// ─── Consistency check ───────────────────────────────────────────────────────

const isoOk = (x: string) => /^\d{4}-\d{2}-\d{2}$/.test(x)

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

/** Facts that contradict each other. Shown as warnings next to the preview. */
export function getConsistency(type: LetterType, d: Data): Notice[] {
  const out: Notice[] = []
  const warn = (text: string) => out.push({ level: 'warn', text })
  const today = new Date().toISOString().slice(0, 10)
  const region = clean(d.region)

  const range = (fromId: string, toId: string, label: string) => {
    const a = clean(d[fromId])
    const b = clean(d[toId])
    if (isoOk(a) && isoOk(b) && dayDiff(a, b) < 0) warn(`${label}: the end date is before the start date.`)
    return isoOk(a) && isoOk(b) ? dayDiff(a, b) + 1 : 0
  }

  if (type === 'cover') {
    const isLong = clean(d.visaTerm) === LONG
    if (isLong) {
      range('startDate', 'endDate', 'Long-stay plan')
      if (clean(d.longFunding) === 'Blocked account' && !clean(d.longFundingDetail)) warn('You chose a blocked account. Add the amount so it can be matched to your bank letter.')
    } else {
      const days = range('arrival', 'departure', 'Trip')
      const arrival = clean(d.arrival)
      if (isoOk(arrival) && arrival < today) warn('The arrival date is in the past.')
      if (days > 90) warn(`This trip is ${days} days. Short-stay visas allow at most 90 days in any 180. Choose long stay if you will stay longer.`)
      const expiry = clean(d.passportExpiry)
      const dep = clean(d.departure)
      const enc0 = checks(d, 'enclosures')
      if (isoOk(expiry)) {
        if (expiry < today) warn('Your passport has expired.')
        else if (isoOk(dep)) {
          const left = dayDiff(dep, expiry)
          if (left < 90) warn(`Your passport expires ${left < 0 ? 'before you leave' : 'only ' + left + ' days after you leave'}. Schengen needs at least 3 months after departure, and many embassies ask for 6.`)
          else if (left < 180) warn('Your passport has under 6 months left after your trip. Many embassies require 6 months. Check the checklist.')
        }
      }
      if (days > 7 && !clean(d.itinerary)) warn('For a trip over a week, list where you will be on which dates.')
      if (region === 'Schengen (Europe)' && days > 0 && days <= 90 && !clean(d.accommodation)) warn('Add your accommodation. Schengen officers check it against your bookings.')
      if (clean(d.accommodation) && !enc0.includes('Hotel booking') && !/host|family|friend|invit/i.test(clean(d.accommodation))) warn('You list accommodation but Hotel booking is not ticked under attached documents.')
      if (days > 0 && !enc0.includes('Flight reservation')) warn('Flight reservation is not ticked. Most embassies expect one with the application.')
      if (region === 'Schengen (Europe)' && days > 0 && !enc0.includes('Travel insurance')) warn('Schengen requires travel medical insurance (at least EUR 30,000). Tick it once you have it.')
    }
    const docs = checks(d, 'finDocs')
    const enc = checks(d, 'enclosures')
    const funding = clean(d.funding)
    if (!isLong && funding === 'A sponsor (letter enclosed)' && !docs.includes('Sponsor letter and sponsor documents')) warn('You say a sponsor pays, but the sponsor documents are not ticked under Money.')
    if (!isLong && funding === 'My employer' && clean(d.employment) !== 'Employed') warn('You say your employer pays, but your work status is not Employed.')
    if (!isLong && funding === 'My own company' && clean(d.employment) !== 'Self-employed / freelancer') warn('You say your company pays, but your work status is not Self-employed.')
    if (clean(d.employment) === 'Employed') {
      if (clean(d.leave).startsWith('Yes') && !enc.includes('Employer NOC / leave letter')) warn('You say leave is approved, but the NOC / leave letter is not ticked under attached documents.')
      if (clean(d.leave) === 'Not yet') warn('Get the NOC or leave approval before you apply. Many embassies ask for it.')
    }
    if (clean(d.employment) === 'Self-employed / freelancer' && !docs.some((x) => /registration|NTN|GST|Udyam/i.test(x))) warn('You are self-employed. Tick your business registration documents under Money.')
    if (docs.some((x) => /salary slips/i.test(x)) && clean(d.employment) !== 'Employed') warn('Salary slips are ticked, but your work status is not Employed.')
  }

  if (type === 'noc') {
    const a = clean(d.leaveFrom)
    const b = clean(d.leaveTo)
    const r = clean(d.resume)
    range('leaveFrom', 'leaveTo', 'Leave')
    if (isoOk(b) && isoOk(r) && dayDiff(b, r) < 0) warn('The return-to-work date is before the leave ends.')
    if (isoOk(a) && a < today) warn('The leave start date is in the past.')
    if (isoOk(clean(d.joined)) && clean(d.joined) > today) warn('The joining date is in the future.')
  }

  if (type === 'invitation' || type === 'sponsor') {
    range('arrival', 'departure', type === 'invitation' ? 'Visit' : 'Trip')
    const arrival = clean(d.arrival)
    if (isoOk(arrival) && arrival < today) warn('The arrival date is in the past.')
  }

  return out
}

export function getNotices(type: LetterType, d: Data): Notice[] {
  return [...getConsistency(type, d), ...baseNotices(type, d)]
}
