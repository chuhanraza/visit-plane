/**
 * SEO content model for the support-letter landing pages.
 *
 *   /support-letter/[type]               one guide per letter type (4)
 *   /support-letter/[type]/[destination] one guide per type x destination
 *
 * Everything here is deterministic and rendered on the server. Nothing is
 * fabricated: sample letters are built by the same code the tool uses, with
 * clearly fictional people, and rules are limited to what the tool already
 * warns about plus a link to the official source.
 */
import {
  buildLetter,
  formatDate,
  getNotices,
  countPlaceholders,
  type Block,
  type Data,
  type LetterType,
} from './templates'
import { LETTER_DESTINATIONS, toolDestinationName, type LetterDestination } from './destinations'
import { PERSONAS, type OriginId } from './origins'
import { liveCorridors } from './corridors'

export const SITE = 'https://www.visitplane.com'
/** Bump when the guides are reviewed. Used for sitemap lastModified and visible "reviewed" labels. */
export const CONTENT_REVIEWED = '2026-10-15'
export const CONTENT_YEAR = 2026

export interface Faq { q: string; a: string }

export interface TypeGuide {
  type: LetterType
  slug: string
  /** Short label used in titles and links, e.g. "Visa cover letter". */
  label: string
  /** Lower-case noun phrase used in running text. */
  noun: string
  title: string
  description: string
  h1: string
  intro: string[]
  need: string[]
  notNeed: string[]
  include: string[]
  mistakes: { title: string; body: string }[]
  steps: string[]
  pakistan: string[]
  faqs: Faq[]
}

export const TYPE_GUIDES: TypeGuide[] = [
  {
    type: 'cover',
    slug: 'cover-letter',
    label: 'Visa cover letter',
    noun: 'visa cover letter',
    title: `Visa Cover Letter Sample & Free Generator (${CONTENT_YEAR})`,
    description: 'Write a visa cover letter that states your trip, money and ties to home in plain facts. Free generator with a worked sample. PDF and Word, no sign-up.',
    h1: 'Visa cover letter: sample, checklist and free generator',
    intro: [
      'A visa cover letter is a one-page letter from you to the visa officer. It explains the trip in the order an officer checks it: who you are, where you are going and when, who pays, and why you will return home.',
      'It does not replace your documents. It points to them. Every date, name and amount in the letter has to match your flight booking, hotel booking, bank statements and employment papers, because the officer compares them.',
    ],
    need: [
      'The consulate checklist lists a cover letter, a letter of explanation or a statement of purpose.',
      'Your case has something an officer will otherwise question: a gap in your history, a self-employed income, a sponsor paying for the trip, or a first international trip.',
      'You are applying for a Canada visitor visa, where a short letter of explanation is common, or for a Schengen visa whose checklist lists a personal covering letter. Several Schengen checklists do not, so check yours first.',
    ],
    notNeed: [
      'The official page says a cover letter is not required and your documents already tell the whole story. The UK and the US are typical examples. A letter that only repeats your documents adds nothing.',
      'You would have to invent or round up details to fill the page. Leave it out rather than guess.',
    ],
    include: [
      'Your full name as in the passport, passport number, nationality and home address.',
      'The visa type, the embassy or consulate you are applying to, and the purpose of travel in one line.',
      'Arrival and departure dates, with the place you will stay each night. These must match the bookings.',
      'Who pays for the trip, and which documents prove it (bank statements, salary slips, sponsor letter).',
      'Your job or business, how long you have been there, and whether leave is approved.',
      'Your ties to home: property, family staying behind, ongoing study, a business waiting for you, and past travel with no overstays.',
      'A list of what you attach, so the officer can find each document.',
    ],
    mistakes: [
      { title: 'Dates that do not match the bookings', body: 'An arrival date one day off the flight reservation is the easiest thing for an officer to catch. Copy the dates from the bookings, not from memory.' },
      { title: 'A story instead of facts', body: 'Long accounts of why you love the destination do not help. Officers read many letters a day. State the activity, the dates and the money.' },
      { title: 'Claims your documents do not show', body: 'If the letter says you earn a figure, your statements must show that figure. If it says leave is approved, the leave letter must be attached.' },
      { title: 'Copying a sample word for word', body: 'Consulates see the same template many times a day. Use a sample for the structure, then write your own facts.' },
      { title: 'Promising too much', body: 'Phrases such as "I guarantee I will return" prove nothing. Show the reasons you will return: a job, family, a lease, a business.' },
    ],
    steps: [
      'Open the official checklist for your destination and note whether a cover letter or letter of explanation is listed.',
      'Collect the facts first: passport details, bookings, employer details and income figures.',
      'Fill in the generator. The letter builds live on the right as you type.',
      'Read the notices under the form. They flag mismatched dates, an expired passport and risky wording.',
      'Download the PDF or Word file, print it, and sign it by hand.',
      'Attach it on top of the supporting documents, in the same order the letter lists them.',
    ],
    pakistan: [
      'The generator has fields that Pakistani applicants usually need: CNIC, NTN, FBR tax returns, NADRA Family Registration Certificate and bank statements stamped by the branch.',
      'If you run a business, there are separate fields for what the business does, its size and who runs it while you travel. Officers read a sole proprietor’s letter differently from an employee’s.',
    ],
    faqs: [
      { q: 'How long should a visa cover letter be?', a: 'One page. Short, formal and specific works better than a long letter. Put the facts in the first half and the list of attached documents at the end.' },
      { q: 'Does a cover letter guarantee a visa?', a: 'No. A letter explains your documents. The decision rests on the documents, your ties to home and the officer’s assessment.' },
      { q: 'Should I sign the letter?', a: 'Yes. Print it and sign it by hand unless the embassy gives different instructions about signatures.' },
      { q: 'Can I use the same letter for several countries?', a: 'Only the structure. Names, dates, bookings and the embassy line change for each application. Rewrite the destination-specific facts each time.' },
      { q: 'Is the generator free?', a: 'Yes. There is no sign-up and no payment. The letter is built in your browser and your answers are not stored on our servers.' },
    ],
  },
  {
    type: 'noc',
    slug: 'noc-letter',
    label: 'NOC letter for visa',
    noun: 'employer NOC letter',
    title: `NOC Letter for Visa: Free Sample & Generator (${CONTENT_YEAR})`,
    description: 'Make a No Objection Certificate (NOC) letter for a visa: employer confirmation of your job and approved leave. Sample, checklist and a version for business owners.',
    h1: 'NOC letter for visa: sample, checklist and generator',
    intro: [
      'A No Objection Certificate (NOC) for a visa is a letter from your employer. It confirms that you work there, in what role and since when, that your leave is approved for the travel dates, and that you are expected back on a named date.',
      'Visa officers use it as proof that you have a job to return to. For that reason a vague NOC without dates, a signer’s title and company contact details carries little weight.',
    ],
    need: [
      'You are employed and the consulate checklist lists an employer letter, NOC or leave letter.',
      'You are applying for a tourist, business or family visit visa and want to show approved leave.',
      'You own or run a company. Owners have no boss to write the letter, so the company issues one and a partner, co-director or senior manager signs it.',
    ],
    notNeed: [
      'You are a student, a homemaker or retired. Use the cover letter instead and describe your situation there.',
      'The embassy asks for an employment contract or a recent salary slip only. Follow the checklist.',
    ],
    include: [
      'Company letterhead with the full name, address, phone and email.',
      'Your name, employee ID, passport or CNIC number, job title and joining date.',
      'Employment type (permanent, contract or probation) and, if you choose to show it, monthly salary.',
      'The destination, purpose and exact leave dates, and the date you are expected back at work.',
      'Who signs: name, title, signature, company stamp and a contact the consulate can call.',
      'The date of the letter. Officers prefer a recent date close to the application.',
    ],
    mistakes: [
      { title: 'No return date', body: 'A NOC that approves leave but never says when you resume work does not prove you will return. State the exact date.' },
      { title: 'No way to verify', body: 'Consulates sometimes call the company. A letter without a working phone number or email, or signed by someone with no stated title, invites doubt.' },
      { title: 'Leave dates that differ from the trip', body: 'Leave must cover the whole trip, including travel days. Check it against the flights.' },
      { title: 'Self-signing as an owner', body: 'If you own the company, a letter that only you sign reads as self-certification. A partner, co-director or senior manager who really holds that role should sign, and every statement must match your registration documents.' },
      { title: 'Altering a signed letter', body: 'Change nothing after it is signed and stamped. Reprint instead.' },
    ],
    steps: [
      'Ask whether your HR team has a standard NOC format. Use it if it does.',
      'Otherwise fill in the generator with the company, employee and leave details.',
      'If you own the business, choose the owner option and name who runs operations while you are away.',
      'Print on company letterhead, sign, and add a real ink stamp.',
      'Keep a scan. You may need the same letter for a second application.',
    ],
    pakistan: [
      'The generator accepts CNIC or passport numbers and PKR salary figures, and has an owner version for sole proprietors and partners in Pakistani firms.',
      'The owner version asks who runs operations and what work waits for you on return, which are the questions officers ask when they read a self-issued letter.',
    ],
    faqs: [
      { q: 'What does NOC stand for?', a: 'No Objection Certificate. For a visa it means your employer has no objection to your travel and confirms your job and leave.' },
      { q: 'Who signs a NOC letter?', a: 'An HR manager or your line manager signs it, with title and contact details. For a business owner, a partner, co-director or senior manager who actually holds that role should sign.' },
      { q: 'Does the NOC need to be on letterhead?', a: 'Yes, print it on company letterhead and add a company stamp. A plain-paper letter is easier to doubt.' },
      { q: 'Should the NOC mention my salary?', a: 'Optional. Show it only if it matches your salary slips and bank statements.' },
      { q: 'How recent should a NOC be?', a: 'Recent. A date within a few weeks of your application is the safe choice, and the leave dates must still be in the future.' },
    ],
  },
  {
    type: 'invitation',
    slug: 'invitation-letter',
    label: 'Visa invitation letter',
    noun: 'visa invitation letter',
    title: `Visa Invitation Letter: Free Sample & Generator (${CONTENT_YEAR})`,
    description: 'Write an invitation letter for a visa: the host’s details, the guest, dates, where they will stay and who pays. Free sample, checklist and generator.',
    h1: 'Invitation letter for a visa: sample, checklist and generator',
    intro: [
      'An invitation letter is written by a host who lives in the destination country. It names the guest, states how the two are related, gives the visit dates and the address where the guest will stay, and says who pays for what.',
      'It supports the guest’s application. It does not guarantee a visa, and in several countries it does not replace an official invitation form, so check what the consulate accepts before you rely on a plain letter.',
    ],
    need: [
      'The guest is visiting family or friends and the consulate checklist lists an invitation letter.',
      'The guest will stay at the host’s address and the officer needs to see that accommodation exists.',
      'The host is paying for part of the stay.',
    ],
    notNeed: [
      'The destination does not use invitation letters. For US visitor visas, applicants must qualify on their own merits and a host’s letter does not replace that.',
      'The country requires an official invitation form instead, and a plain letter would not be accepted.',
    ],
    include: [
      'The host’s full name, status in the country (citizen, permanent resident or permit holder), ID or permit number, address, phone and email.',
      'The guest’s full name, date of birth, nationality and passport number.',
      'The relationship between host and guest.',
      'The purpose of the visit and exact arrival and departure dates.',
      'Where the guest will stay, and how much space the home has.',
      'Who pays for the flights, accommodation and daily costs.',
      'The documents the host attaches: ID or residence permit, proof of address, proof of income and proof of relationship.',
    ],
    mistakes: [
      { title: 'Using a letter where a form is required', body: 'Some countries want an official invitation or a formal declaration of commitment. A letter then supports it but does not replace it.' },
      { title: 'Promising more space than the home has', body: 'State the real number of rooms and occupants. Officers treat an unrealistic claim as a warning sign.' },
      { title: 'Open-ended dates', body: 'Give arrival and departure dates. "As long as they like" suggests the guest may not leave.' },
      { title: 'No proof the host can support the guest', body: 'Attach proof of the host’s status, address and income so the claim can be checked.' },
      { title: 'Treating the letter as the whole case', body: 'The guest’s own ties to home and finances decide most outcomes. The invitation only explains the visit.' },
    ],
    steps: [
      'The guest checks the consulate checklist for the invitation document it accepts.',
      'The host gathers ID or residence permit, proof of address and income.',
      'The host fills in the generator with the guest’s passport details and the visit dates.',
      'The host prints, signs and, where the destination requires, has the letter certified.',
      'The host sends the original and copies of the attachments to the guest to include in the application.',
    ],
    pakistan: [
      'Most invitation letters for Pakistani guests come from relatives abroad. The generator has a relationship field and lets the host list what proof of relationship is attached.',
      'The guest still has to show ties to Pakistan, such as a job, a business or family, in their own cover letter.',
    ],
    faqs: [
      { q: 'Who writes an invitation letter?', a: 'The host in the destination country: a relative, friend or business contact who invites the guest and, if stated, pays for part of the stay.' },
      { q: 'Does an invitation letter guarantee a visa?', a: 'No. It supports the application. The guest’s documents and ties to home still decide the outcome.' },
      { q: 'Does the letter need to be notarised?', a: 'It depends on the destination and the consulate. Some countries want an official form or certified signature. Check the checklist.' },
      { q: 'What should the host attach?', a: 'A copy of their ID or residence permit, proof of address, proof of income, and proof of relationship to the guest.' },
      { q: 'Can I use this for a business invitation?', a: 'Use it for personal visits. For a business invitation, the inviting company normally writes on its letterhead and the traveller adds an event or meeting line in their cover letter.' },
    ],
  },
  {
    type: 'sponsor',
    slug: 'sponsorship-letter',
    label: 'Sponsorship letter for visa',
    noun: 'sponsor support letter',
    title: `Sponsorship Letter for Visa: Free Sample & Template (${CONTENT_YEAR})`,
    description: 'Write a sponsorship letter for a visa: who pays, how they are related, what they cover and which documents prove it. Free sample and generator.',
    h1: 'Sponsorship letter for a visa: sample, checklist and generator',
    intro: [
      'A sponsorship letter, also called a sponsor support letter or affidavit of support, is written by the person who pays for the applicant’s trip. It says who the sponsor is, how they are related to the applicant, what they will cover and which documents prove they can.',
      'The letter is only as strong as the attachments. The sponsor’s bank statements, tax records and proof of employment or business are what an officer actually weighs.',
    ],
    need: [
      'Someone other than the applicant pays for the trip, for example a parent, spouse, sibling or employer.',
      'The applicant has little or no income of their own, such as a student or homemaker.',
      'The funding line on the applicant’s cover letter says "a sponsor" and the checklist asks for a sponsor letter.',
    ],
    notNeed: [
      'The applicant pays for the whole trip from their own documented funds.',
      'The destination’s official guidance says a sponsor letter does not replace the applicant’s own financial evidence.',
    ],
    include: [
      'The sponsor’s full name, ID or passport number, occupation, employer, address, phone and email.',
      'The applicant’s name, passport number and the relationship to the sponsor.',
      'The destination, embassy, purpose of the trip and travel dates.',
      'Exactly what the sponsor will pay for: flights, accommodation, daily costs, insurance, visa fees or tuition.',
      'The sponsor’s income and savings, stated only as far as the attached documents show them.',
      'The list of attached documents: ID, bank statements for six months, salary slips or business income proof, tax returns, and proof of relationship.',
    ],
    mistakes: [
      { title: 'Figures that the bank statements do not support', body: 'State an income or balance only if the attached statements show it. Round numbers with no paper trail raise questions.' },
      { title: 'No proof of relationship', body: 'Attach the document that proves the link, such as a family registration certificate or marriage certificate.' },
      { title: 'A vague promise to "support"', body: 'List what is covered. "All expenses" is less useful than flights, accommodation and daily costs.' },
      { title: 'A sponsor with no visible income', body: 'A sponsor needs recent statements and employment or business proof. A letter alone does not show ability to pay.' },
      { title: 'Relying on the sponsor and ignoring the applicant', body: 'The applicant still has to show ties to home. A strong sponsor does not remove that.' },
    ],
    steps: [
      'The sponsor reads the destination’s official guidance on sponsors and affidavits.',
      'The sponsor collects ID, six months of bank statements, salary or business proof and tax records.',
      'The sponsor fills in the generator, choosing exactly what they will cover.',
      'The sponsor prints and signs the letter and sends it with certified copies of the attachments.',
      'The applicant adds the letter to their own application and mentions the sponsor in their cover letter.',
    ],
    pakistan: [
      'The generator supports CNIC numbers, FBR tax returns and NADRA Family Registration Certificates as attachments, which are the documents Pakistani sponsors usually hold.',
      'Bank statements stamped by the branch are listed as a separate option because many consulates prefer them over a plain download.',
    ],
    faqs: [
      { q: 'Who can be a sponsor?', a: 'Usually a close relative or an employer. The consulate decides whether a sponsor is acceptable, so check its guidance for your destination.' },
      { q: 'What is the difference between a sponsor letter and an invitation letter?', a: 'A sponsor letter says who pays. An invitation letter says who hosts. One person can write both, but they answer different questions.' },
      { q: 'What documents should the sponsor attach?', a: 'ID, bank statements for the last six months, salary slips or business income proof, tax returns, and proof of relationship to the applicant.' },
      { q: 'Does the sponsor need to sign in front of a notary?', a: 'It depends on the destination. Some consulates accept a signed letter; others want a certified or sworn statement. Check the checklist.' },
      { q: 'Is the sponsorship letter generator free?', a: 'Yes. No sign-up and no payment. The letter is built in your browser.' },
    ],
  },
]

export const GUIDE_BY_SLUG = Object.fromEntries(TYPE_GUIDES.map((g) => [g.slug, g])) as Record<string, TypeGuide>
export const GUIDE_BY_TYPE = Object.fromEntries(TYPE_GUIDES.map((g) => [g.type, g])) as Record<LetterType, TypeGuide>

/** Letter types that can have destination pages. NOC letters barely depend on the destination, so they stay a single page. */
export const DEST_TYPES: LetterType[] = ['cover', 'invitation', 'sponsor']

/** Destinations that have an indexable page for this letter type. */
export function destinationsWithPage(type: LetterType): LetterDestination[] {
  return LETTER_DESTINATIONS.filter((d) => d.pages.includes(type))
}

export function typePath(type: LetterType): string {
  return `/support-letter/${GUIDE_BY_TYPE[type].slug}`
}
export function destPath(type: LetterType, d: LetterDestination): string {
  return `${typePath(type)}/${d.slug}`
}
export function toolHref(type: LetterType, d?: LetterDestination): string {
  const q = new URLSearchParams({ type })
  if (d) q.set('destination', toolDestinationName(d))
  return `/support-letter?${q.toString()}`
}

/** Every indexable letter URL, for the sitemap. */
export function allLetterPaths(): string[] {
  const out: string[] = []
  for (const g of TYPE_GUIDES) {
    out.push(typePath(g.type))
    for (const d of destinationsWithPage(g.type)) out.push(destPath(g.type, d))
  }
  // Corridor pages go live on their own dates, so the sitemap only lists the ones that are up.
  for (const c of liveCorridors()) out.push(`${typePath(c.type)}/${c.slug}`)
  return out
}

// ─── Sample letters ──────────────────────────────────────────────────────────

/**
 * Sample dates are anchored to the review date, not to "now", so a statically cached
 * page never shows dates that drift into the past between reviews.
 */
function isoPlus(days: number): string {
  const d = new Date(`${CONTENT_REVIEWED}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Fictional sample data. Names and numbers are invented and obviously fake. */
export function sampleData(type: LetterType, dest?: LetterDestination, origin: Exclude<OriginId, 'other'> = 'pakistan', overrides: Data = {}): Data {
  return { ...baseSampleData(type, dest, origin), ...overrides }
}

function baseSampleData(type: LetterType, dest: LetterDestination | undefined, origin: Exclude<OriginId, 'other'>): Data {
  const P = PERSONAS[origin]
  const country = dest ? (dest.sampleCountry ?? toolDestinationName(dest)) : 'Germany'
  const region = dest?.region ?? 'Schengen (Europe)'
  const [c1, c2] = dest?.cities ?? ['Berlin', 'Munich']
  const arrival = isoPlus(45)
  const mid = isoPlus(50)
  const departure = isoPlus(55)
  const the = /^(United Kingdom|United States|United Arab Emirates|Netherlands)$/.test(country) ? 'the ' : ''
  // The UK has no embassy letter: visitor applications go to UK Visas and Immigration.
  const embassy = dest?.slug === 'united-kingdom' ? 'The Entry Clearance Officer, UK Visas and Immigration' : `The Embassy of ${the}${country}, ${P.embassyCity}`
  const letterDate = isoPlus(0)
  const fd = (iso: string) => formatDate(iso)

  switch (type) {
    case 'cover':
      return {
        fullName: P.fullName, passportNo: 'AB1234567', passportExpiry: isoPlus(1500),
        nationality: P.nationality, address: P.address,
        email: `${P.fullName.toLowerCase().replace(' ', '.')}@example.com`, phone: P.phone,
        region, destination: country, embassyCity: P.embassyCity,
        visaTerm: 'Short stay (up to 90 days)', visaType: 'Tourist',
        purpose: `Tourism in ${c1} and ${c2}`,
        arrival, departure,
        itinerary: `${c1}, ${fd(arrival)} to ${fd(mid)}\n${c2}, ${fd(mid)} to ${fd(departure)}`,
        accommodation: `Hotels in ${c1} and ${c2} (bookings attached)`,
        employment: 'Employed', employer: P.employer, jobTitle: P.jobTitle,
        jobSince: 'March 2021', leave: 'Yes, NOC / leave letter attached',
        funding: 'Myself', income: P.income,
        finDocs: P.finDocs,
        property: `Family home in ${P.city}`, dependents: P.family,
        priorTravel: P.priorTravel,
        enclosures: 'Passport copy|Flight reservation|Hotel booking|Travel insurance|Employer NOC / leave letter',
        letterDate,
      }
    case 'noc':
      return {
        issuer: 'Employer (HR or manager signs)', company: P.employer.split(',')[0],
        companyAddress: P.companyAddress,
        signerName: P.signerName, signerTitle: 'HR Manager', signerContact: P.signerContact,
        empName: P.fullName, empId: 'EMP-1042', empIdentity: 'AB1234567', empTitle: P.jobTitle,
        joined: '2021-03-01', empStatus: 'Permanent', salary: P.salary,
        embassy, destination: country, purpose: 'Tourism',
        leaveFrom: arrival, leaveTo: departure, resume: isoPlus(57), leaveType: 'Annual leave',
        letterDate,
      }
    case 'invitation':
      return {
        hostName: 'Daniel Schmidt', hostStatus: 'Citizen', hostId: 'L1234567', hostOccupation: 'Teacher',
        hostAddress: `Example Street 1, ${c1}, ${country}`, hostEmail: 'host@example.com', hostPhone: '+00 000 0000000',
        guestName: P.fullName, guestNationality: P.nationality, guestPassport: 'AB1234567', guestDob: '1994-05-12',
        relationship: 'Sister', region, embassy, purpose: 'Family visit',
        arrival, departure, stay: 'At my home at the address above', space: '3 bedrooms, 2 occupants',
        costs: 'I cover accommodation only',
        enclosures: 'Copy of my ID or residence permit|Proof of address|Proof of income',
        letterDate,
      }
    case 'sponsor':
      return {
        sponsorName: P.sponsor.name, sponsorOccupation: P.sponsor.occupation, sponsorId: P.sponsor.idNumber,
        relationship: 'Father', sponsorAddress: P.address,
        sponsorEmail: 'sponsor@example.com', sponsorPhone: P.phone,
        applicantName: P.fullName, applicantPassport: 'AB1234567', region, embassy, destination: country,
        purpose: 'Tourism', arrival, departure,
        covers: 'Flights|Accommodation|Daily living expenses|Travel insurance',
        income: P.sponsor.income,
        enclosures: P.sponsor.enclosures,
        letterDate,
      }
  }
}

export function sampleLetter(type: LetterType, dest?: LetterDestination, origin: Exclude<OriginId, 'other'> = 'pakistan', overrides: Data = {}): Block[] {
  return buildLetter(type, { ...sampleData(type, dest, origin, overrides), origin }, isoPlus(0))
}

export function samplePlaceholderCount(type: LetterType, dest?: LetterDestination, origin: Exclude<OriginId, 'other'> = 'pakistan', overrides: Data = {}): number {
  return countPlaceholders(sampleLetter(type, dest, origin, overrides))
}

// ─── Destination page content ────────────────────────────────────────────────

const REGION_DOCS: Record<LetterType, Record<string, string[]>> = {
  cover: {
    default: ['Passport copy (bio page) with at least the validity the destination requires', 'Flight reservation and accommodation bookings with dates matching the letter', 'Travel insurance where required', 'Bank statements, salary slips and tax records that support every figure in the letter', 'Employer NOC or leave letter, or business registration for self-employed applicants'],
  },
  invitation: {
    default: ['Copy of the host’s ID or residence permit', 'Proof of the host’s address, such as a utility bill or tenancy agreement', 'Proof of the host’s income', 'Proof of the relationship between host and guest', 'Any official invitation form the consulate requires'],
  },
  sponsor: {
    default: ['Copy of the sponsor’s ID or passport', 'Sponsor’s bank statements for the last six months', 'Salary slips or business income proof, and tax returns', 'Proof of the relationship to the applicant', 'Any official sponsorship or affidavit form the consulate requires'],
  },
  noc: { default: [] },
}

export function destDocs(type: LetterType, d?: LetterDestination): string[] {
  const base = REGION_DOCS[type].default
  if (d?.region === 'United States') return base.filter((x) => !/Travel insurance|Flight reservation/.test(x)).concat(['Your DS-160 confirmation page and appointment letter'])
  if (d?.region === 'Schengen (Europe)' && type === 'cover') return base.concat(['Travel insurance with at least EUR 30,000 medical cover for the whole stay'])
  return base
}

/** Region-level points that are true for every destination in the region. Kept short and cautious. */
const REGION_POINTS: Partial<Record<string, Partial<Record<LetterType, string[]>>>> = {
  'Schengen (Europe)': {
    cover: [
      'Apply at the consulate of the Schengen country where you will spend the most days. If the days are equal, apply to the country of first entry.',
      'A short-stay visa allows up to 90 days in any 180-day period across the whole Schengen Area.',
      'List the places in the order you will visit them, with a date for each, and match them to your bookings and your travel insurance. Schengen travel insurance must cover at least EUR 30,000 in medical costs.',
    ],
    invitation: [
      'A host’s letter supports a Schengen application, but several countries ask for their own official invitation or commitment form. Germany, France and Spain are the best-known examples, and each has a page here.',
      'The guest still needs travel insurance, funds for the stay and a return plan. A host’s offer of accommodation does not replace them.',
    ],
    sponsor: [
      'Schengen consulates check who pays and whether that person can. State exactly which costs the sponsor covers.',
      'Some countries use a formal sponsorship or commitment form for hosts who live in the country. A sponsor abroad usually supports the application with a letter and financial documents. Check the consulate checklist.',
    ],
  },
  'United Kingdom': {
    cover: [
      'The Standard Visitor visa normally allows stays of up to six months. The application asks where you will stay, how long, what you will do and who will pay.',
      'Because the form already asks those questions, a cover letter should add context, not repeat the form. Keep it to one page.',
      'Decisions turn on your funds, your ties to your home country and whether you intend to leave at the end of the visit.',
    ],
    invitation: [
      'A guest does not need an invitation for the UK, so a host’s letter is optional supporting evidence. Say how long the guest will stay and where.',
      'State the real space the home has. Do not offer more than it can hold.',
    ],
    sponsor: [
      'The UK application asks who is paying for the trip. If someone else pays, a letter from them with their bank statements and proof of relationship supports your answer.',
      'The sponsor’s documents carry the weight. Attach recent statements that match the figures in the letter.',
    ],
  },
  'United States': {
    cover: [
      'A US visitor visa is decided at the interview, based on your DS-160 form and your answers. A cover letter is usually not needed.',
      'If you bring one, keep it consistent with the DS-160. Any difference between the two is a problem.',
      'The officer is looking for evidence that you will return home: work, family, property and a clear purpose for a short trip.',
    ],
    invitation: [
      'The State Department says visitor applicants must qualify on their own merits. An invitation is not required and does not replace your own ties to home.',
      'If a host writes one, it should explain the relationship and the dates only. It is not a substitute for the applicant’s own documents.',
    ],
    sponsor: [
      'A sponsor can help show how the trip is paid for, but the applicant still has to qualify on their own merits and be ready to answer questions at the interview.',
      'Bring the sponsor’s letter and financial documents to the interview in case the officer asks for them.',
    ],
  },
  Canada: {
    cover: [
      'Applicants for a Canadian visitor visa often add a short letter of explanation. Cover three points: the purpose of the trip, how you will pay, and why you will leave Canada at the end.',
      'Short bullet points work well. Put the dates and amounts where the officer can see them quickly.',
      'Make every figure match the proof of funds you upload with the application.',
    ],
    invitation: [
      'A host in Canada can write an invitation to explain the visit. State whether the host is a citizen or a permanent resident, and give their address and contact details.',
      'IRCC lists the details an invitation should contain, so check its current guidance and cover each item.',
    ],
    sponsor: [
      'If a sponsor pays for the trip, explain their relationship to you and attach their bank statements and proof of income.',
      'Make clear which costs the sponsor covers and for how long.',
    ],
  },
  Australia: {
    cover: [
      'The Visitor visa (subclass 600) is applied for online. Officers assess whether you intend a genuine, temporary visit and have the funds to support it.',
      'Use the letter to explain the purpose, the length of stay, your funds and your reasons to return home. Keep it consistent with the online form.',
    ],
    invitation: [
      'A host’s letter can support a subclass 600 application. Australia may give a statutory declaration more weight than a plain letter, so check the Home Affairs guidance for your stream.',
      'Give the host’s status in Australia, address, the dates, and who covers the costs.',
    ],
    sponsor: [
      'The subclass 600 has a Sponsored Family stream in which an Australian sponsor is required. Check on the Home Affairs website whether your case falls under it.',
      'If someone else pays for a tourist trip, a sponsor letter with their bank statements explains the funding.',
    ],
  },
}

export function destPoints(type: LetterType, d: LetterDestination): string[] {
  const own = d.points?.[type]
  if (own) return own
  return REGION_POINTS[d.region]?.[type] ?? []
}

/** Does this destination require the letter? Stated conservatively, region by region. */
export function needAnswer(type: LetterType, d: LetterDestination): string {
  const dn = d.name
  const portal = `Always confirm on the official page (${d.authority.name}).`
  if (type === 'cover') {
    switch (d.region) {
      case 'United Kingdom': return `UK Visas and Immigration does not require a cover letter for a ${d.visaName}. If you add one, keep it to one page and do not repeat what your documents already show. ${portal}`
      case 'United States': return `A cover letter is usually not needed for a ${d.visaName}. The visa is decided at the interview from your DS-160 and your answers. ${portal}`
      case 'Canada': return `Canada does not set a mandatory format, but applicants often add a short letter of explanation covering purpose, funds and ties to home. ${portal}`
      case 'Schengen (Europe)': return `Some Schengen consulates list a personal cover letter for a ${d.visaName}, and many do not. Check the checklist of the consulate that handles your application. Where it is not listed, a short letter still helps with what the documents cannot show, such as self-employed income, a sponsor paying or a first trip. ${portal}`
      case 'Australia': return `A letter is not a required form for a ${d.visaName}, but a short statement can explain your purpose, funds and ties to home. ${portal}`
      default: return `Requirements for the ${d.visaName} vary by nationality and consulate. If the checklist for ${dn} lists a cover letter or statement of purpose, this is the format to use. ${portal}`
    }
  }
  if (type === 'invitation') {
    switch (d.region) {
      case 'United States': return `For US visitor visas the State Department says applicants must qualify on their own merits. An invitation letter is not required and does not replace your own ties to home. ${portal}`
      case 'Schengen (Europe)': return `Schengen consulates often accept a host’s letter as supporting evidence, but some countries want an official invitation or commitment form instead. ${portal}`
      case 'United Kingdom': return `A host’s letter is not a UK requirement, but it can explain where you will stay and who pays. State the real space available. ${portal}`
      case 'Canada': return `A host in Canada can write an invitation to explain the visit. State the host’s status (citizen or permanent resident). ${portal}`
      case 'Australia': return `A host’s letter can support a ${d.visaName} application. Australia may give a statutory declaration more weight than a plain letter. ${portal}`
      default: return `Whether ${dn} accepts a host’s letter, or wants its own form, depends on the consulate. If the checklist lists an invitation letter, use this format. ${portal}`
    }
  }
  if (type === 'sponsor') {
    switch (d.region) {
      case 'United States': return `A sponsor can support a ${d.visaName} application, but the applicant still has to qualify on their own merits. ${portal}`
      case 'Schengen (Europe)': return `Schengen consulates look at who pays and whether that person can. Where a sponsor pays, a signed letter and the sponsor’s financial documents are normally expected. ${portal}`
      default: return `Where someone else pays for a trip to ${dn}, a signed sponsor letter and that person’s financial documents explain how the trip is funded. Follow the checklist for the exact form. ${portal}`
    }
  }
  return portal
}

const REGION_FAQ: Partial<Record<string, Partial<Record<LetterType, Faq>>>> = {
  'Schengen (Europe)': {
    cover: { q: 'Which Schengen consulate do I apply to?', a: 'The consulate of the Schengen country where you will spend the most days. If the days are equal, apply to the country of first entry.' },
    invitation: { q: 'Does a host’s letter replace the official invitation form?', a: 'No. Some Schengen countries ask for their own invitation or commitment form. The letter supports it; it does not replace it.' },
    sponsor: { q: 'How does a Schengen consulate check a sponsor?', a: 'It looks at who pays, what they cover and whether their bank statements and income documents support it. State the covered costs exactly.' },
  },
  'United Kingdom': {
    cover: { q: 'How long can I stay on a UK Standard Visitor visa?', a: 'Normally up to six months. Your stated dates should match your plans and your bookings.' },
    invitation: { q: 'Does a UK visitor need an invitation from a host?', a: 'No. A host’s letter is optional supporting evidence about where the guest will stay and who pays.' },
    sponsor: { q: 'What if someone else is paying for my UK trip?', a: 'The application asks who is paying. A letter from that person with bank statements and proof of relationship supports your answer.' },
  },
  'United States': {
    cover: { q: 'Should I bring a cover letter to a US visa interview?', a: 'It is usually not needed, because the visa is decided from your DS-160 and your answers. If you bring one, keep it consistent with the form.' },
    invitation: { q: 'Does an invitation help a US B-1/B-2 application?', a: 'The State Department says applicants must qualify on their own merits. An invitation does not replace your ties to home.' },
    sponsor: { q: 'Can a sponsor’s letter replace my own evidence for a US visa?', a: 'No. It can show how the trip is paid for, but you still have to qualify on your own merits at the interview.' },
  },
  Canada: {
    cover: { q: 'What is a letter of explanation for a Canadian visitor visa?', a: 'A short letter covering the purpose of the trip, how you will pay and why you will leave Canada at the end. Bullet points with dates and amounts work well.' },
    invitation: { q: 'What should a Canadian host’s invitation say?', a: 'The host’s status (citizen or permanent resident), address and contact details, their relationship to the guest, the dates and who pays. IRCC lists the details it expects, so check its guidance.' },
    sponsor: { q: 'What should a sponsor letter for Canada cover?', a: 'The relationship, exactly which costs the sponsor pays and for how long, with bank statements and proof of income attached.' },
  },
  Australia: {
    cover: { q: 'What do officers look for in an Australian visitor visa?', a: 'Whether you intend a genuine, temporary visit and have the funds for it. Explain your purpose, length of stay, funds and reasons to return home.' },
    invitation: { q: 'Is a statutory declaration better than a plain letter?', a: 'Australia may give a statutory declaration more weight than a plain host letter. Check the Home Affairs guidance for your stream.' },
    sponsor: { q: 'Does the Australian visitor visa have a sponsored stream?', a: 'Yes, the subclass 600 has a Sponsored Family stream where an Australian sponsor is required. Check the Home Affairs website for whether your case falls under it.' },
  },
}

export function destFaqs(type: LetterType, d: LetterDestination): Faq[] {
  const g = GUIDE_BY_TYPE[type]
  const out: Faq[] = [{ q: `Do I need a ${g.noun} for ${d.name}?`, a: needAnswer(type, d) }]
  const specific = d.faq?.[type] ?? REGION_FAQ[d.region]?.[type]
  if (specific) out.push(specific)
  out.push({ q: `Can I use the generator for ${d.name}?`, a: `Yes. Choose the letter type and destination, fill in your facts and download a PDF or Word file. It is free and needs no sign-up.` })
  return out
}

export function destTitle(type: LetterType, d: LetterDestination): string {
  switch (type) {
    case 'cover': return `Visa Cover Letter for ${d.name}: Free Sample`
    case 'invitation': return `Invitation Letter for ${d.name}: Free Sample`
    case 'sponsor': return `Sponsorship Letter for ${d.name}: Free Sample`
    default: return GUIDE_BY_TYPE[type].title
  }
}

export function destDescription(type: LetterType, d: LetterDestination): string {
  switch (type) {
    case 'cover': return `Visa cover letter for ${d.name}: what to include, a worked sample set in ${d.cities[0]} and ${d.cities[1]}, and a free generator. PDF and Word, no sign-up.`
    case 'invitation': return `Invitation letter for a visa to ${d.name}: host details, dates, accommodation and costs. Worked sample, what to attach and a free generator.`
    case 'sponsor': return `Sponsorship letter for a visa to ${d.name}: who pays, what they cover and which documents to attach. Worked sample and a free generator.`
    default: return GUIDE_BY_TYPE[type].description
  }
}

export function destIntro(type: LetterType, d: LetterDestination): string[] {
  const g = GUIDE_BY_TYPE[type]
  const first = {
    cover: `This page is for applicants preparing a ${g.noun} for ${d.name}. The visa in question is the ${d.visaName}. Below is what the letter has to say, a worked sample set in ${d.cities[0]} and ${d.cities[1]}, and what to attach.`,
    invitation: `This page is for hosts in ${d.name} writing a ${g.noun} for a guest who needs the ${d.visaName}. Below is what the letter has to say, a worked sample, and what the host attaches.`,
    sponsor: `This page is for sponsors paying for a trip to ${d.name}. The applicant is applying for the ${d.visaName}. Below is what the sponsor letter has to say, a worked sample, and what the sponsor attaches.`,
    noc: g.intro[0],
  }[type]
  return [first, g.intro[1]]
}

export function destNotices(type: LetterType, d: LetterDestination): string[] {
  const own = d.notes?.[type]
  // Country pages carry their own note; region pages carry the tool's regional warnings.
  if (own) return [own]
  return getNotices(type, { region: d.region }).map((n) => n.text)
}

/** Related pages for internal linking. */
export function relatedForDestination(type: LetterType, d: LetterDestination) {
  const sameDestOtherTypes = DEST_TYPES.filter((t) => t !== type && d.pages.includes(t)).map((t) => ({
    href: destPath(t, d),
    label: `${GUIDE_BY_TYPE[t].label} for ${d.name}`,
  }))
  const pool = destinationsWithPage(type).filter((x) => x.slug !== d.slug)
  const sameRegion = pool.filter((x) => x.region === d.region)
  const others = [...sameRegion, ...pool.filter((x) => x.region !== d.region)].slice(0, 6)
  const sameTypeOthers = others.map((x) => ({
    href: destPath(type, x),
    label: `${GUIDE_BY_TYPE[type].label} for ${x.name}`,
  }))
  return { sameDestOtherTypes, sameTypeOthers }
}

/** Word counter for build-time quality checks. */
export function wordCount(parts: string[]): number {
  return parts.join(' ').split(/\s+/).filter(Boolean).length
}
