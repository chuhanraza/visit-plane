/**
 * Immigration support letters — field config + letter text builders.
 *
 * Pure functions, no I/O: the same model drives the live preview and the PDF,
 * so what the user sees on the right is exactly what they download.
 * Nothing here is sent anywhere; all data stays in the browser.
 */

export type LetterType = 'cover' | 'invitation' | 'sponsor'

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
  /** Half-width on desktop form grid. */
  half?: boolean
}

export interface LetterMeta {
  type: LetterType
  label: string
  short: string
  blurb: string
  fields: Field[]
}

/** One piece of letter text; `filled:false` means an unfilled [placeholder]. */
export interface Seg {
  text: string
  filled: boolean
}

export type Block =
  | { kind: 'p'; segs: Seg[] }
  | { kind: 'lines'; lines: Seg[][] }
  | { kind: 'list'; items: Seg[][] }
  | { kind: 'gap' }

export type Data = Record<string, string>

// ─── Field sets ──────────────────────────────────────────────────────────────

const SENDER_GROUP = 'Your details'

const COVER_FIELDS: Field[] = [
  { id: 'fullName', label: 'Full name (as in passport)', kind: 'text', placeholder: 'Ayesha Khan', group: SENDER_GROUP, half: true },
  { id: 'nationality', label: 'Nationality', kind: 'text', placeholder: 'Pakistani', group: SENDER_GROUP, half: true },
  { id: 'passportNo', label: 'Passport number', kind: 'text', placeholder: 'AB1234567', group: SENDER_GROUP, half: true },
  { id: 'occupation', label: 'Occupation and employer', kind: 'text', placeholder: 'Software engineer at Example Ltd', group: SENDER_GROUP, half: true },
  { id: 'address', label: 'Home address', kind: 'textarea', placeholder: 'House 1, Street 2, Lahore, Pakistan', group: SENDER_GROUP },
  { id: 'email', label: 'Email', kind: 'text', placeholder: 'you@example.com', group: SENDER_GROUP, half: true },
  { id: 'phone', label: 'Phone', kind: 'text', placeholder: '+92 300 0000000', group: SENDER_GROUP, half: true },

  { id: 'destination', label: 'Destination country', kind: 'text', placeholder: 'Germany', group: 'Where you are applying', half: true },
  { id: 'embassyCity', label: 'Embassy / consulate city', kind: 'text', placeholder: 'Islamabad', group: 'Where you are applying', half: true },
  { id: 'visaType', label: 'Visa type', kind: 'select', options: ['Tourist', 'Business', 'Family / friends visit', 'Transit', 'Study (short course)', 'Medical'], group: 'Where you are applying', half: true },

  { id: 'purpose', label: 'Purpose of your trip', kind: 'textarea', placeholder: 'A 10-day holiday visiting Berlin and Munich.', hint: 'Be specific: events, meetings, people, places.', group: 'Trip details' },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'Trip details', half: true },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'Trip details', half: true },
  { id: 'itinerary', label: 'Cities / route', kind: 'text', placeholder: 'Berlin (5 nights), then Munich (5 nights)', group: 'Trip details' },
  { id: 'accommodation', label: 'Where you will stay', kind: 'text', placeholder: 'Hotel Example, Berlin (booking attached)', group: 'Trip details' },

  { id: 'funding', label: 'Who pays for the trip', kind: 'select', options: ['Myself', 'A sponsor (letter enclosed)', 'My employer'], group: 'Money and ties', half: true },
  { id: 'finances', label: 'Financial summary', kind: 'textarea', placeholder: 'Monthly salary of PKR 300,000; bank statements for the last 6 months are enclosed.', hint: 'Only state what your documents show.', group: 'Money and ties' },
  { id: 'ties', label: 'Ties to your home country', kind: 'textarea', placeholder: 'I have worked at Example Ltd since 2021 and have approved leave. My family lives in Lahore.', hint: 'The most important paragraph: job, family, property.', group: 'Money and ties' },
  { id: 'priorTravel', label: 'Previous international travel (optional)', kind: 'text', placeholder: 'UAE 2023, Turkey 2024, no visa refusals', group: 'Money and ties' },
  { id: 'enclosures', label: 'Documents you are enclosing', kind: 'checks', options: ['Passport copy', 'Flight reservation', 'Hotel booking', 'Travel insurance', 'Bank statements', 'Employment letter', 'Tax records', 'Invitation letter'], group: 'Enclosures' },
]

const INVITATION_FIELDS: Field[] = [
  { id: 'hostName', label: 'Your full name (the host)', kind: 'text', placeholder: 'Daniel Schmidt', group: 'Host details', half: true },
  { id: 'hostStatus', label: 'Your status in the country', kind: 'text', placeholder: 'German citizen / permanent resident', group: 'Host details', half: true },
  { id: 'hostId', label: 'ID or residence permit number', kind: 'text', placeholder: 'L1234567', group: 'Host details', half: true },
  { id: 'hostOccupation', label: 'Occupation', kind: 'text', placeholder: 'Teacher', group: 'Host details', half: true },
  { id: 'hostAddress', label: 'Your address', kind: 'textarea', placeholder: 'Example Str. 1, 10115 Berlin, Germany', group: 'Host details' },
  { id: 'hostEmail', label: 'Email', kind: 'text', placeholder: 'host@example.com', group: 'Host details', half: true },
  { id: 'hostPhone', label: 'Phone', kind: 'text', placeholder: '+49 30 0000000', group: 'Host details', half: true },

  { id: 'guestName', label: 'Guest full name', kind: 'text', placeholder: 'Ayesha Khan', group: 'Guest details', half: true },
  { id: 'guestNationality', label: 'Guest nationality', kind: 'text', placeholder: 'Pakistani', group: 'Guest details', half: true },
  { id: 'guestPassport', label: 'Guest passport number', kind: 'text', placeholder: 'AB1234567', group: 'Guest details', half: true },
  { id: 'guestDob', label: 'Guest date of birth', kind: 'date', group: 'Guest details', half: true },
  { id: 'relationship', label: 'Your relationship', kind: 'text', placeholder: 'Close friend since university', group: 'Guest details' },

  { id: 'embassy', label: 'Addressed to', kind: 'text', placeholder: 'The German Embassy, Islamabad', group: 'The visit' },
  { id: 'purpose', label: 'Purpose of the visit', kind: 'textarea', placeholder: 'A family holiday and to attend my wedding.', group: 'The visit' },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'The visit', half: true },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'The visit', half: true },
  { id: 'stay', label: 'Where the guest will stay', kind: 'text', placeholder: 'At my home at the address above', group: 'The visit' },
  { id: 'costs', label: 'Who covers the costs', kind: 'select', options: ['The guest covers all costs', 'I cover accommodation only', 'I cover all costs of the stay'], group: 'The visit' },
  { id: 'costDetails', label: 'Details of support (optional)', kind: 'textarea', placeholder: 'Meals and local transport are covered by me.', group: 'The visit' },
]

const SPONSOR_FIELDS: Field[] = [
  { id: 'sponsorName', label: 'Sponsor full name', kind: 'text', placeholder: 'Imran Khan', group: 'Sponsor details', half: true },
  { id: 'sponsorOccupation', label: 'Occupation and employer', kind: 'text', placeholder: 'Director, Example Traders', group: 'Sponsor details', half: true },
  { id: 'sponsorId', label: 'ID / passport number', kind: 'text', placeholder: '35202-0000000-0', group: 'Sponsor details', half: true },
  { id: 'relationship', label: 'Relationship to the applicant', kind: 'text', placeholder: 'Father', group: 'Sponsor details', half: true },
  { id: 'sponsorAddress', label: 'Sponsor address', kind: 'textarea', placeholder: 'House 1, Street 2, Lahore, Pakistan', group: 'Sponsor details' },
  { id: 'sponsorEmail', label: 'Email', kind: 'text', placeholder: 'sponsor@example.com', group: 'Sponsor details', half: true },
  { id: 'sponsorPhone', label: 'Phone', kind: 'text', placeholder: '+92 300 0000000', group: 'Sponsor details', half: true },

  { id: 'applicantName', label: 'Applicant full name', kind: 'text', placeholder: 'Ayesha Khan', group: 'Applicant and trip', half: true },
  { id: 'applicantPassport', label: 'Applicant passport number', kind: 'text', placeholder: 'AB1234567', group: 'Applicant and trip', half: true },
  { id: 'embassy', label: 'Addressed to', kind: 'text', placeholder: 'The German Embassy, Islamabad', group: 'Applicant and trip' },
  { id: 'destination', label: 'Destination country', kind: 'text', placeholder: 'Germany', group: 'Applicant and trip', half: true },
  { id: 'purpose', label: 'Purpose of the trip', kind: 'text', placeholder: 'Tourism', group: 'Applicant and trip', half: true },
  { id: 'arrival', label: 'Arrival date', kind: 'date', group: 'Applicant and trip', half: true },
  { id: 'departure', label: 'Departure date', kind: 'date', group: 'Applicant and trip', half: true },

  { id: 'covers', label: 'What you will pay for', kind: 'checks', options: ['Flights', 'Accommodation', 'Daily living expenses', 'Travel insurance', 'Visa fees'], group: 'Support' },
  { id: 'income', label: 'Your financial position', kind: 'textarea', placeholder: 'I earn PKR 500,000 per month; my bank statements and employment letter are enclosed.', hint: 'Only state what your documents show.', group: 'Support' },
  { id: 'enclosures', label: 'Documents you are enclosing', kind: 'checks', options: ['ID / passport copy', 'Bank statements', 'Employment letter', 'Tax records', 'Proof of relationship'], group: 'Support' },
]

const LETTER_DATE: Field = { id: 'letterDate', label: 'Letter date (leave empty for today)', kind: 'date', group: 'Letter date' }

export const LETTERS: LetterMeta[] = [
  {
    type: 'cover',
    label: 'Visa cover letter',
    short: 'Cover letter',
    blurb: 'You are the applicant. Explains your trip and why you will return home.',
    fields: [...COVER_FIELDS, LETTER_DATE],
  },
  {
    type: 'invitation',
    label: 'Invitation letter',
    short: 'Invitation',
    blurb: 'A host in the destination country invites a guest to visit.',
    fields: [...INVITATION_FIELDS, LETTER_DATE],
  },
  {
    type: 'sponsor',
    label: 'Sponsor support letter',
    short: 'Sponsor letter',
    blurb: 'Someone pays for the applicant’s trip and confirms it in writing.',
    fields: [...SPONSOR_FIELDS, LETTER_DATE],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clean = (s: string | undefined): string => (s ?? '').trim()

/** Value if present, otherwise a visible [placeholder]. */
function v(d: Data, id: string, placeholder: string): Seg {
  const val = clean(d[id])
  return val ? { text: val, filled: true } : { text: `[${placeholder}]`, filled: false }
}

const t = (text: string): Seg => ({ text, filled: true })

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
  return f ? { text: f, filled: true } : { text: `[${placeholder}]`, filled: false }
}

function multiline(d: Data, id: string, placeholder: string): Seg[][] {
  const val = clean(d[id])
  if (!val) return [[{ text: `[${placeholder}]`, filled: false }]]
  return val.split(/\r?\n/).map((l) => [{ text: l.trim(), filled: true }]).filter((l) => l[0].text)
}

function checks(d: Data, id: string): string[] {
  return clean(d[id]) ? clean(d[id]).split('|').filter(Boolean) : []
}

/** Join items as "a, b and c". */
function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

const p = (...segs: Seg[]): Block => ({ kind: 'p', segs })
const gap: Block = { kind: 'gap' }

/** Sentence-ending guard so "…Lahore." never becomes "…Lahore.." */
function endSentence(seg: Seg): Seg[] {
  if (!seg.filled) return [seg, t('.')]
  return /[.!?]$/.test(seg.text) ? [seg] : [seg, t('.')]
}

// ─── Builders ────────────────────────────────────────────────────────────────

function buildCover(d: Data, today: string): Block[] {
  const enclosures = checks(d, 'enclosures')
  const visaType = clean(d.visaType) || 'Tourist'
  const funding = clean(d.funding) || 'Myself'

  const fundingLine: Seg[] =
    funding === 'Myself'
      ? [t('I will fund this trip myself. ')]
      : funding === 'My employer'
        ? [t('My employer will fund this trip. ')]
        : [t('This trip will be funded by a sponsor, whose support letter is enclosed. ')]

  const blocks: Block[] = [
    { kind: 'lines', lines: [[v(d, 'fullName', 'Your full name')], ...multiline(d, 'address', 'Your address'), [t('Email: '), v(d, 'email', 'email')], [t('Phone: '), v(d, 'phone', 'phone')]] },
    gap,
    p(dateSeg({ ...d, today }, 'today', 'Date')),
    gap,
    { kind: 'lines', lines: [[t('The Visa Section')], [t('Embassy / Consulate of '), v(d, 'destination', 'Destination country')], [v(d, 'embassyCity', 'City')]] },
    gap,
    p(t(`Subject: ${visaType} visa application for `), v(d, 'destination', 'Destination country'), t(' — Passport no. '), v(d, 'passportNo', 'Passport number')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('My name is '), v(d, 'fullName', 'Your full name'), t(', a citizen of '), v(d, 'nationality', 'Nationality'), t('. I work as '), ...endSentence(v(d, 'occupation', 'Occupation and employer')), t(' I am writing to apply for a '), t(`${lowerFirst(visaType)} visa to `), v(d, 'destination', 'Destination country'), t('.')),
    gap,
    p(t('Purpose of travel. '), ...endSentence(v(d, 'purpose', 'Purpose of your trip'))),
    gap,
    p(t('Travel plan. I plan to arrive on '), dateSeg(d, 'arrival', 'Arrival date'), t(' and leave on '), dateSeg(d, 'departure', 'Departure date'), t('. My route is: '), ...endSentence(v(d, 'itinerary', 'Cities and route')), t(' I will stay at '), ...endSentence(v(d, 'accommodation', 'Accommodation'))),
    gap,
    p(t('Finances. '), ...fundingLine, ...endSentence(v(d, 'finances', 'Financial summary'))),
    gap,
    p(t('Ties to my home country. '), ...endSentence(v(d, 'ties', 'Ties to your home country'))),
  ]

  if (clean(d.priorTravel)) {
    blocks.push(gap, p(t('Previous travel. '), ...endSentence(v(d, 'priorTravel', 'Previous travel'))))
  }

  if (enclosures.length) {
    blocks.push(gap, p(t('I enclose the following documents to support my application:')), { kind: 'list', items: enclosures.map((e) => [t(e)]) })
  }

  blocks.push(
    gap,
    p(t('I confirm that the information in this letter is true. I will follow the rules of my visa and return home before it expires. Thank you for considering my application. Please contact me if you need any further information.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    p(v(d, 'fullName', 'Your full name')),
  )
  return blocks
}

function buildInvitation(d: Data, today: string): Block[] {
  const costs = clean(d.costs) || 'The guest covers all costs'
  const costsLine =
    costs === 'I cover all costs of the stay'
      ? 'I will cover all costs of the stay, including accommodation and living expenses.'
      : costs === 'I cover accommodation only'
        ? 'I will provide accommodation. My guest will cover all other costs of the trip.'
        : 'My guest will cover all costs of the trip.'

  const blocks: Block[] = [
    { kind: 'lines', lines: [[v(d, 'hostName', 'Your full name')], ...multiline(d, 'hostAddress', 'Your address'), [t('Email: '), v(d, 'hostEmail', 'email')], [t('Phone: '), v(d, 'hostPhone', 'phone')]] },
    gap,
    p(dateSeg({ ...d, today }, 'today', 'Date')),
    gap,
    p(v(d, 'embassy', 'Embassy or consulate')),
    gap,
    p(t('Subject: Invitation for '), v(d, 'guestName', 'Guest full name'), t(' — Passport no. '), v(d, 'guestPassport', 'Passport number')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('I, '), v(d, 'hostName', 'Your full name'), t(', '), v(d, 'hostOccupation', 'occupation'), t(' and '), v(d, 'hostStatus', 'status in the country'), t(' (ID / permit no. '), v(d, 'hostId', 'number'), t('), am writing to invite '), v(d, 'guestName', 'Guest full name'), t(', a citizen of '), v(d, 'guestNationality', 'Nationality'), t(', born on '), dateSeg(d, 'guestDob', 'Date of birth'), t('.')),
    gap,
    p(t('Our relationship. '), v(d, 'guestName', 'Guest full name'), t(' is my '), ...endSentence(v(d, 'relationship', 'Your relationship'))),
    gap,
    p(t('Purpose of the visit. '), ...endSentence(v(d, 'purpose', 'Purpose of the visit'))),
    gap,
    p(t('Dates and accommodation. My guest plans to arrive on '), dateSeg(d, 'arrival', 'Arrival date'), t(' and leave on '), dateSeg(d, 'departure', 'Departure date'), t('. During the visit my guest will stay: '), ...endSentence(v(d, 'stay', 'where the guest will stay'))),
    gap,
    p(t('Costs. '), t(costsLine + (clean(d.costDetails) ? ' ' : '')), ...(clean(d.costDetails) ? endSentence(v(d, 'costDetails', 'details')) : [])),
    gap,
    p(t('I confirm that my guest intends to return home at the end of the visit and that I will help make sure the visa conditions are respected. I am glad to provide any further documents or information you need.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    p(v(d, 'hostName', 'Your full name')),
  ]
  return blocks
}

function buildSponsor(d: Data, today: string): Block[] {
  const covers = checks(d, 'covers')
  const enclosures = checks(d, 'enclosures')

  const blocks: Block[] = [
    { kind: 'lines', lines: [[v(d, 'sponsorName', 'Sponsor full name')], ...multiline(d, 'sponsorAddress', 'Sponsor address'), [t('Email: '), v(d, 'sponsorEmail', 'email')], [t('Phone: '), v(d, 'sponsorPhone', 'phone')]] },
    gap,
    p(dateSeg({ ...d, today }, 'today', 'Date')),
    gap,
    p(v(d, 'embassy', 'Embassy or consulate')),
    gap,
    p(t('Subject: Sponsorship letter for '), v(d, 'applicantName', 'Applicant full name'), t(' — Passport no. '), v(d, 'applicantPassport', 'Passport number')),
    gap,
    p(t('Dear Visa Officer,')),
    gap,
    p(t('I, '), v(d, 'sponsorName', 'Sponsor full name'), t(' (ID / passport no. '), v(d, 'sponsorId', 'number'), t('), '), v(d, 'sponsorOccupation', 'occupation and employer'), t(', confirm that I am the '), v(d, 'relationship', 'relationship'), t(' of '), v(d, 'applicantName', 'Applicant full name'), t(' and that I will sponsor the trip described below.')),
    gap,
    p(t('The trip. '), v(d, 'applicantName', 'Applicant full name'), t(' is travelling to '), v(d, 'destination', 'Destination country'), t(' for '), v(d, 'purpose', 'purpose'), t(', from '), dateSeg(d, 'arrival', 'Arrival date'), t(' to '), dateSeg(d, 'departure', 'Departure date'), t('.')),
    gap,
  ]

  if (covers.length) {
    blocks.push(p(t(`What I will pay for. I will cover the cost of ${joinList(covers.map(lowerFirst))} for this trip.`)))
  } else {
    blocks.push(p(t('What I will pay for. '), t('[Select what you will pay for]')))
  }

  blocks.push(
    gap,
    p(t('My financial position. '), ...endSentence(v(d, 'income', 'Your financial position'))),
  )

  if (enclosures.length) {
    blocks.push(gap, p(t('I enclose the following documents:')), { kind: 'list', items: enclosures.map((e) => [t(e)]) })
  }

  blocks.push(
    gap,
    p(t('I confirm that this information is true. I understand the applicant must return home at the end of the stay, and I am happy to provide any further information you need.')),
    gap,
    p(t('Yours faithfully,')),
    gap,
    gap,
    p(v(d, 'sponsorName', 'Sponsor full name')),
  )
  return blocks
}

/** Build the letter body. `today` is an ISO date used for the letter date. */
export function buildLetter(type: LetterType, data: Data, today: string): Block[] {
  const d: Data = { ...data, today: clean(data.letterDate) || today }
  switch (type) {
    case 'cover':
      return buildCover(d, today)
    case 'invitation':
      return buildInvitation(d, today)
    case 'sponsor':
      return buildSponsor(d, today)
  }
}

/** Plain text for copy / PDF. */
export function blocksToText(blocks: Block[]): string {
  const segText = (segs: Seg[]) => segs.map((s) => s.text).join('')
  return blocks
    .map((b) => {
      switch (b.kind) {
        case 'p':
          return segText(b.segs)
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

/** Count of unfilled [placeholders] in a built letter. */
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
