/**
 * "Applying from" — the country the applicant lives in.
 *
 * The letter text is built only from what the user types, but the form around it is
 * not neutral: the labels, examples and tick-box documents differ by country. A
 * Pakistani applicant ticks FBR returns and a NADRA Family Registration Certificate;
 * an Indian applicant ticks ITR-V and Form 16; the embassy city, the currency and the
 * ID number are different too. Each origin patches the base field set below.
 *
 * Pakistan is the base: its field definitions are the defaults in templates.ts, so it
 * needs no patches. Anything not patched falls through unchanged.
 */
import type { Field, LetterType } from './templates'

export type OriginId = 'pakistan' | 'india' | 'other'

export const ORIGINS: { id: OriginId; label: string }[] = [
  { id: 'pakistan', label: 'Pakistan' },
  { id: 'india', label: 'India' },
  { id: 'other', label: 'Another country' },
]

export function isOriginId(x: unknown): x is OriginId {
  return x === 'pakistan' || x === 'india' || x === 'other'
}

type Patch = Partial<Pick<Field, 'label' | 'placeholder' | 'hint' | 'options'>>
/** Keys are "fieldId" (all letter types) or "type:fieldId" (one letter type). */
type PatchSet = Record<string, Patch>

const INDIA: PatchSet = {
  // Your details
  fullName: { placeholder: 'Priya Sharma' },
  cnic: { label: 'PAN (optional)', placeholder: 'ABCDE1234F', hint: 'Only if the checklist asks for an ID number. Leave Aadhaar out unless it is requested.' },
  nationality: { placeholder: 'Indian' },
  address: { placeholder: 'Flat 12, Sector 5, Pune, Maharashtra, India' },
  phone: { placeholder: '+91 98000 00000' },
  embassyCity: { placeholder: 'New Delhi' },
  // Situation at home
  employer: { placeholder: 'Example Technologies Pvt Ltd, Pune' },
  ntn: { label: 'GST / Udyam / company registration number', placeholder: 'UDYAM-MH-00-0000000' },
  business: { placeholder: 'Sharma Exports, garment sourcing' },
  bizScale: { placeholder: 'About 40 employees, 2 units near Ludhiana' },
  school: { placeholder: 'University of Pune, BSc Computer Science, year 3' },
  sponsorWho: { placeholder: 'Rahul Sharma, husband, director at Example Traders' },
  pension: { placeholder: 'Pension, INR 40,000 per month' },
  // Money
  income: { placeholder: 'INR 95,000' },
  'cover:finDocs': {
    options: [
      'Bank statements, last 3 months',
      'Bank statements, last 6 months',
      'Bank statements stamped and signed by the bank',
      'Salary slips, last 3 months',
      'Income tax return acknowledgements (ITR-V)',
      'Form 16',
      'Company registration (with GST number)',
      'Company bank statements, last 3 months',
      'Sponsor letter and sponsor documents',
    ],
  },
  // Ties
  property: { placeholder: '3-bedroom flat, Pune' },
  dependents: { placeholder: 'Spouse and two children (school-age, enrolled in Pune)' },
  'cover:enclosures': {
    options: [
      'Passport copy',
      'Flight reservation',
      'Hotel booking',
      'Travel insurance',
      'Employer NOC / leave letter',
      'Invitation letter',
      'Marriage certificate',
      'Birth certificates of children',
    ],
  },
  // NOC
  companyAddress: { placeholder: 'Plot 5, MIDC Industrial Area, Pune, India' },
  signerContact: { placeholder: 'hr@example.com, +91 20 0000 0000' },
  empName: { placeholder: 'Priya Sharma' },
  empIdentity: { label: 'Passport or PAN number', placeholder: 'M1234567' },
  salary: { placeholder: 'INR 95,000' },
  'noc:embassy': { placeholder: 'The Embassy of Germany, New Delhi' },
  // Invitation
  guestName: { placeholder: 'Priya Sharma' },
  guestNationality: { placeholder: 'Indian' },
  guestPassport: { placeholder: 'M1234567' },
  'invitation:embassy': { placeholder: 'The Embassy of Germany, New Delhi' },
  // Sponsor
  sponsorName: { placeholder: 'Rahul Sharma' },
  sponsorId: { label: 'ID / PAN / passport number', placeholder: 'ABCDE1234F' },
  sponsorAddress: { placeholder: 'Flat 12, Sector 5, Pune, Maharashtra, India' },
  sponsorPhone: { placeholder: '+91 98000 00000' },
  applicantName: { placeholder: 'Priya Sharma' },
  applicantPassport: { placeholder: 'M1234567' },
  'sponsor:embassy': { placeholder: 'The Embassy of Germany, New Delhi' },
  'sponsor:income': { placeholder: 'INR 1,50,000 per month; savings INR 12,00,000' },
  'sponsor:enclosures': {
    options: [
      'ID / passport copy',
      'Bank statements, last 6 months',
      'Salary slips or business income proof',
      'Income tax return acknowledgements (ITR-V)',
      'Employment letter',
      'Marriage certificate',
      'Birth certificate (proof of relationship)',
    ],
  },
}

const OTHER: PatchSet = {
  fullName: { placeholder: 'Your full name' },
  cnic: { label: 'National ID number (optional)', placeholder: 'ID number' },
  nationality: { placeholder: 'Your nationality' },
  address: { placeholder: 'Street, city, country' },
  phone: { placeholder: '+00 000 000 0000' },
  embassyCity: { placeholder: 'City where the embassy or visa centre is' },
  employer: { placeholder: 'Example Ltd, your city' },
  ntn: { label: 'Business registration or tax number', placeholder: 'Registration number' },
  business: { placeholder: 'Your business and what it does' },
  bizScale: { placeholder: 'About 40 employees, 2 sites' },
  school: { placeholder: 'University, programme, year' },
  sponsorWho: { placeholder: 'Name, relationship, job' },
  pension: { placeholder: 'Pension, amount per month' },
  income: { placeholder: 'Currency and amount, e.g. USD 1,500' },
  'cover:finDocs': {
    options: [
      'Bank statements, last 6 months',
      'Bank statements stamped and signed by the bank',
      'Salary slips, last 3 months',
      'Tax returns',
      'Business registration',
      'Company bank statements, last 6 months',
      'Business tax registration and returns',
      'Sponsor letter and sponsor documents',
    ],
  },
  property: { placeholder: 'Home or land you own' },
  dependents: { placeholder: 'Spouse and children staying at home' },
  'cover:enclosures': {
    options: [
      'Passport copy',
      'Flight reservation',
      'Hotel booking',
      'Travel insurance',
      'Employer NOC / leave letter',
      'Invitation letter',
      'Family registration or civil status certificate',
      'Marriage certificate',
    ],
  },
  companyAddress: { placeholder: 'Street, city, country' },
  signerContact: { placeholder: 'hr@example.com, +00 000 000 0000' },
  empName: { placeholder: 'Employee full name' },
  empIdentity: { label: 'Passport or national ID number', placeholder: 'AB1234567' },
  salary: { placeholder: 'Currency and amount' },
  'noc:embassy': { placeholder: 'The Embassy of Germany, your capital city' },
  guestName: { placeholder: 'Guest full name' },
  guestNationality: { placeholder: 'Guest nationality' },
  'invitation:embassy': { placeholder: 'The Embassy of Germany, your capital city' },
  sponsorName: { placeholder: 'Sponsor full name' },
  sponsorId: { label: 'ID / passport number', placeholder: 'ID number' },
  sponsorAddress: { placeholder: 'Street, city, country' },
  sponsorPhone: { placeholder: '+00 000 000 0000' },
  applicantName: { placeholder: 'Applicant full name' },
  'sponsor:embassy': { placeholder: 'The Embassy of Germany, your capital city' },
  'sponsor:income': { placeholder: 'Currency and amount per month; savings amount' },
  'sponsor:enclosures': {
    options: [
      'ID / passport copy',
      'Bank statements, last 6 months',
      'Salary slips or business income proof',
      'Tax returns',
      'Employment letter',
      'Family registration or civil status certificate',
      'Marriage certificate',
    ],
  },
}

const PATCHES: Record<OriginId, PatchSet> = { pakistan: {}, india: INDIA, other: OTHER }

/** Apply an origin's patches to a base field list. Pakistan returns the list unchanged. */
export function localizeFields(type: LetterType, fields: Field[], origin: OriginId): Field[] {
  const set = PATCHES[origin]
  if (!Object.keys(set).length) return fields
  return fields.map((f) => {
    const patch = { ...set[f.id], ...set[`${type}:${f.id}`] }
    return Object.keys(patch).length ? { ...f, ...patch } : f
  })
}

// ─── Sample personas (landing pages) ─────────────────────────────────────────

export interface Persona {
  nationality: string
  fullName: string
  city: string
  address: string
  phone: string
  embassyCity: string
  employer: string
  jobTitle: string
  currency: string
  income: string
  salary: string
  companyAddress: string
  signerContact: string
  signerName: string
  idNumber: string
  family: string
  priorTravel: string
  finDocs: string
  enclosures: string
  sponsor: { name: string; occupation: string; idNumber: string; income: string; enclosures: string }
}

export const PERSONAS: Record<Exclude<OriginId, 'other'>, Persona> = {
  pakistan: {
    nationality: 'Pakistani', fullName: 'Ayesha Khan', city: 'Lahore',
    address: 'House 1, Street 2, Lahore, Pakistan', phone: '+92 300 0000000', embassyCity: 'Islamabad',
    employer: 'Example Ltd, Lahore', jobTitle: 'Software engineer', currency: 'PKR', income: 'PKR 300,000', salary: 'PKR 300,000',
    companyAddress: 'Plot 5, Industrial Area, Lahore, Pakistan', signerContact: 'hr@example.com, +92 42 0000000', signerName: 'Sara Ahmed',
    idNumber: '35202-0000000-0',
    family: 'Parents and two siblings in Lahore',
    priorTravel: 'UAE 2023, Turkey 2024. No visa refusals.',
    finDocs: 'Bank statements stamped and signed by the branch|Salary slips, last 3 months|Tax returns (FBR)',
    enclosures: 'Passport copy|Flight reservation|Hotel booking|Travel insurance|Employer NOC / leave letter|NADRA Family Registration Certificate (FRC)',
    sponsor: {
      name: 'Imran Khan', occupation: 'Director, Example Traders', idNumber: '35202-0000000-0',
      income: 'PKR 500,000 per month; savings PKR 3,000,000',
      enclosures: 'ID / passport copy|Bank statements, last 6 months|Salary slips or business income proof|Tax returns (FBR)|NADRA Family Registration Certificate (FRC)',
    },
  },
  india: {
    nationality: 'Indian', fullName: 'Priya Sharma', city: 'Pune',
    address: 'Flat 12, Sector 5, Pune, Maharashtra, India', phone: '+91 98000 00000', embassyCity: 'New Delhi',
    employer: 'Example Technologies Pvt Ltd, Pune', jobTitle: 'Software engineer', currency: 'INR', income: 'INR 95,000', salary: 'INR 95,000',
    companyAddress: 'Plot 5, MIDC Industrial Area, Pune, India', signerContact: 'hr@example.com, +91 20 0000 0000', signerName: 'Neha Verma',
    idNumber: 'ABCDE1234F',
    family: 'Parents in Pune; spouse and one child',
    priorTravel: 'UAE 2023, Thailand 2024. No visa refusals.',
    finDocs: 'Bank statements, last 3 months|Bank statements stamped and signed by the bank|Salary slips, last 3 months|Income tax return acknowledgements (ITR-V)|Form 16',
    enclosures: 'Passport copy|Flight reservation|Hotel booking|Travel insurance|Employer NOC / leave letter|Marriage certificate',
    sponsor: {
      name: 'Rahul Sharma', occupation: 'Director, Example Traders', idNumber: 'ABCDE1234F',
      income: 'INR 1,50,000 per month; savings INR 12,00,000',
      enclosures: 'ID / passport copy|Bank statements, last 6 months|Salary slips or business income proof|Income tax return acknowledgements (ITR-V)|Birth certificate (proof of relationship)',
    },
  },
}
