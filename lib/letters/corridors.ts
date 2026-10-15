/**
 * Corridor pages: one page per "applicant situation + country they live in".
 *
 *   /support-letter/cover-letter/pakistan-to-schengen
 *   /support-letter/noc-letter/pakistan-business-owner
 *   /support-letter/sponsorship-letter/pakistan-to-uk
 *
 * What makes each page different from the next is not a swapped place name. It is the
 * published document list the page is built on. Embassy checklists for applicants in
 * Pakistan ask for NADRA, FBR and NTN papers; checklists for applicants in India ask for
 * ITR-V, Form 16 and GST papers. Every checklist row below was read from the published
 * list named in `sources` (checked October 2026). When a list changes, the row is wrong,
 * so the page says what edition it read and links to it.
 *
 * Rules for editing this file:
 *  - A row states what a named list says, or is labelled as our suggestion. Nothing else.
 *  - No claim that a letter improves the odds of approval.
 *  - Pages go live on `liveFrom`; the sitemap and internal links only include live pages.
 *  - Do not import seo.ts from here (seo.ts imports this file).
 */
import type { LetterType } from './templates'
import type { OriginId } from './origins'

export interface Faq { q: string; a: string }
export interface CorridorSource { name: string; url: string }
export interface ChecklistRow { label: string; text: string; suggestion?: boolean }

export interface Corridor {
  slug: string
  type: LetterType
  origin: Exclude<OriginId, 'other'>
  /** Destination entry (destinations.ts slug) used to set the sample letter's addressee and cities. */
  destSlug: string
  /** Tool preset passed as ?variant= (see VARIANTS in LetterBuilder). */
  variant?: string
  /** First date (YYYY-MM-DD, UTC) the page exists. */
  liveFrom: string
  title: string
  description: string
  h1: string
  intro: string[]
  checklistHeading: string
  checklistIntro: string
  checklist: ChecklistRow[]
  fit: { heading: string; items: string[] }
  mistakes: { title: string; body: string }[]
  faqs: Faq[]
  sources: CorridorSource[]
  /** Field overrides for the worked sample letter. */
  sampleOverrides?: Record<string, string>
  /** Slugs of other corridors worth linking to. */
  related: string[]
  /** Text for the line under the sample letter. */
  sampleNote: string
}

const SRC = {
  ptPk: { name: 'Embassy of Portugal, Islamabad: checklist for tourism (Nov 2022)', url: 'https://www.vfsglobal.com/one-pager/portugal/pakistan/english/pdf/checklist_PT_schengen_tourism.pdf' },
  czPk: { name: 'Czech Republic, Pakistan: visa requirements checklist', url: 'https://www.vfsglobal.com/one-pager/czechrepublic/pakistan/english/pdf/Check-list.pdf' },
  huPk: { name: 'Hungary, Pakistan: documents for visits to family and friends', url: 'https://www.vfsglobal.com/one-pager/hungary/pakistan/english/pdf/Checklist_C_Visit_visa.pdf' },
  noPk: { name: 'Norway, Pakistan: visa checklist 2025', url: 'https://www.norway.no/contentassets/5384b6a9bab04220aed6c5e60b664caa/checklist-visa-pakistan-2025.pdf' },
  dkPk: { name: 'Denmark, Pakistan: checklist for family visits', url: 'https://visa.vfsglobal.com/one-pager/denmark/pakistan/english/pdf/checklist_familyvisit.pdf' },
  ptIn: { name: 'Embassy of Portugal, New Delhi: checklist for Schengen tourism', url: 'https://www.vfsglobal.com/one-pager/portugal/india/english/pdf/Checklist-For-Schengen-Visa-Tourism.pdf' },
  deIn: { name: 'Germany, India: visit and family checklist (June 2025 edition)', url: 'https://www.vfsglobal.com/one-pager/germany/india/mumbai/english/pdf/visit-data-july-2025.pdf' },
  chIn: { name: 'Switzerland, India: checklist for tourists (09.2023)', url: 'https://visa.vfsglobal.com/one-pager/switzerland/india/english/pdf/Checklist_Tourist_new.pdf' },
  ltIn: { name: 'Lithuania, India: checklist (Rev. April 2024)', url: 'https://visa.vfsglobal.com/one-pager/lithuania/india/english/pdf/checklist_April2024.pdf' },
  ukDocs: { name: 'GOV.UK: Standard Visitor visa, documents you must provide', url: 'https://www.gov.uk/standard-visitor/documents-you-must-provide' },
  ukGuide: { name: 'Home Office: visit caseworker guidance, section 8.2 (third-party support)', url: 'https://www.gov.uk/government/publications/visit-guidance/visit-caseworker-guidance-accessible--2' },
} satisfies Record<string, CorridorSource>

export const CORRIDORS: Corridor[] = [
  // ── Pakistan ────────────────────────────────────────────────────────────
  {
    slug: 'pakistan-to-schengen',
    type: 'cover',
    origin: 'pakistan',
    destSlug: 'schengen',
    liveFrom: '2026-10-15',
    title: 'Schengen Visa Cover Letter from Pakistan: Sample (2026)',
    description: 'Do you need a cover letter for a Schengen visa from Pakistan? What five published checklists ask for, when a short letter helps, and a free sample.',
    h1: 'Schengen visa cover letter from Pakistan: do you need one?',
    intro: [
      'We read five published Schengen checklists for applicants in Pakistan: Portugal, Czechia, Hungary, Norway and Denmark. None of them asks the applicant for a personal cover letter. Hungary’s list for family visits asks for a covering letter from the person you are visiting, not from you, and Denmark’s list has an item called “cover letter” that is only the confirmation page printed from the online application. Norway asks tourists for a detailed travel plan.',
      'So check your own consulate’s list first. If it does not name a cover letter, you are not required to write one. A short letter still earns its place in four situations the documents cannot explain alone: self-employed income, someone else paying, a first trip abroad, and an unusual item in your bank statements.',
    ],
    checklistHeading: 'What the Pakistan checklists actually ask for',
    checklistIntro: 'The rows below come from the Portugal (dated November 2022), Czechia and Hungary lists. Your consulate’s list is the one that counts.',
    checklist: [
      { label: 'Identity and family', text: 'Copy of the CNIC, and a Family Registration Certificate issued in English by NADRA (Portugal and Czechia).' },
      { label: 'Passport', text: 'Portugal asks for at least 3 months’ validity after the intended stay, issue within the previous 10 years and 2 blank pages.' },
      { label: 'Bank statements', text: 'Six months of movements, signed and stamped by the bank. Czechia adds that the statement date must be less than 15 days old when you apply, and that cash is not accepted as proof of funds.' },
      { label: 'Tax records', text: 'An NTN certificate (or proof of exemption) and Federal Board of Revenue acknowledgements of tax returns for the last two fiscal years (Portugal, Czechia). Hungary lists them as options.' },
      { label: 'Travel insurance', text: 'Minimum EUR 30,000 medical cover for the whole stay (Portugal, Czechia). Czechia requires an insurer registered in Pakistan or Czechia.' },
      { label: 'Bookings', text: 'A return flight reservation and confirmed accommodation for the entire stay. Czechia and Portugal also ask for an intra-Schengen plan if you visit several countries.' },
      { label: 'Employed', text: 'Payslips for the last three months, the employment contract and an employer letter. See the employer NOC page for the exact contents.' },
      { label: 'Company owner or self-employed', text: 'A certificate of registration of the company (all three lists).' },
      { label: 'Civil servant', text: 'A NOC from the administration employing you, stating the dates of the visit.' },
      { label: 'Attestation', text: 'Portugal marks several documents (the FRC, proof of financial means, company registration, the civil-servant NOC) for translation into English or Portuguese and attestation by the Ministry of Foreign Affairs.' },
    ],
    fit: {
      heading: 'When a short cover letter is worth writing',
      items: [
        'You are self-employed. The lists ask for a registration certificate and tax records but not what the business does, how big it is or who runs it while you are away. The letter can say so, as long as every line matches the certificate.',
        'Someone else pays. Name who, which costs, and attach the sponsor’s own letter and statements. The sponsor’s papers carry the weight.',
        'It is your first trip abroad. A dated itinerary that matches your bookings answers the question an officer would otherwise ask.',
        'Your statements contain something unusual, such as a large recent deposit. Czechia’s list says the balance should reflect your real financial situation, so explain the item and attach the document that shows where it came from.',
      ],
    },
    mistakes: [
      { title: 'Treating the letter as required', body: 'If your consulate’s list does not name it, nothing is refused for leaving it out. Put the time into the documents that are named: stamped statements, FBR acknowledgements, the FRC.' },
      { title: 'Statements that are too old', body: 'Czechia’s list wants a statement dated less than 15 days before you apply. A letter cannot fix an old statement.' },
      { title: 'Counting cash', body: 'Czechia’s list says cash is not accepted as proof of funds. Only money that shows in a statement counts, so the letter should quote the statement, not savings at home.' },
      { title: 'Skipping the attestation check', body: 'Portugal’s list marks some papers for attestation by the Ministry of Foreign Affairs. Check which marks apply to you before the appointment, not at the counter.' },
      { title: 'Dates that differ from the bookings', body: 'The arrival and departure dates in the letter must equal the flight, hotel and insurance dates.' },
    ],
    faqs: [
      { q: 'Do I need a cover letter for a Schengen visa from Pakistan?', a: 'Not on the five lists we read (Portugal, Czechia, Hungary, Norway, Denmark). Check the list of the consulate that handles your application, because lists change and differ by country. Denmark’s “cover letter” item is the printed online-application confirmation, not a letter you write.' },
      { q: 'Which Schengen country do I apply to?', a: 'The country where you will spend the most days. If the days are equal, the country of first entry.' },
      { q: 'Should the letter include my CNIC number?', a: 'Only if your list asks for it. The generator has an optional ID field. The CNIC copy is a separate document on the lists we read.' },
      { q: 'How many months of bank statements do I need?', a: 'Six months, signed and stamped by the bank, on the Portugal, Czechia and Hungary lists. Czechia wants the statement dated less than 15 days before you apply.' },
    ],
    sources: [SRC.ptPk, SRC.czPk, SRC.huPk, SRC.noPk, SRC.dkPk],
    related: ['pakistan-private-employee', 'pakistan-business-owner', 'pakistan-government-employee', 'pakistan-to-uk'],
    sampleNote: 'A sample set in Rome and Florence for an applicant in Lahore. The person, employer and numbers are invented.',
  },
  {
    slug: 'pakistan-private-employee',
    type: 'noc',
    origin: 'pakistan',
    destSlug: 'schengen',
    variant: 'employee',
    liveFrom: '2026-10-15',
    title: 'Employer NOC Letter for a Schengen Visa from Pakistan',
    description: 'The employer letter Pakistan’s Schengen checklists describe: leave dates, position, salary, length of employment, purpose and a contact number. Sample.',
    h1: 'Employer NOC letter for a Schengen visa (applying from Pakistan)',
    intro: [
      'The Portugal, Czechia and Hungary lists for Pakistan describe the employer letter in nearly the same words. It must state the approval for leave of absence, the dates of absence, the employee’s position and salary, the duration of employment, the purpose of the absence and a contact number for the employer. Czechia calls it “an employer’s letter (NOC)”.',
      'Portugal adds three details: address it to the Embassy of Portugal in Islamabad, print it on the company letterhead, and date it not more than one month before you apply. All three lists also want the last three months’ payslips and a copy of the employment contract, so the letter must agree with both.',
    ],
    checklistHeading: 'What the letter has to contain, item by item',
    checklistIntro: 'Each row is one item from the lists, with the place in the generator where you enter it.',
    checklist: [
      { label: 'Approval for leave of absence', text: 'A plain statement that the company has no objection and the leave is approved. Generator: “Leave type”.' },
      { label: 'Dates of absence', text: 'Exact start and end dates covering every travel day. Generator: “Leave from” and “Leave to”.' },
      { label: 'Position and salary', text: 'Job title and monthly salary. The generator treats salary as optional because some countries do not ask; these three lists do, so fill it in and match your payslips.' },
      { label: 'Duration of employment', text: 'The joining date, so the officer can see how long you have worked there. Generator: “Joined on”.' },
      { label: 'Purpose of absence', text: 'The reason for the leave, such as tourism, and the destination. Generator: “Purpose” and “Destination country”.' },
      { label: 'Contact number of employer', text: 'A working phone or email for someone who can confirm the letter. Generator: “Company or department phone or email”.' },
      { label: 'Letterhead, addressee and date', text: 'Company letterhead; Portugal wants it addressed to its Embassy in Islamabad and dated within one month of the application.' },
      { label: 'Papers that go with it', text: 'Payslips for the last three months and a copy of the employment contract. Figures and titles must match the letter.' },
    ],
    fit: {
      heading: 'Use this version if',
      items: [
        'You are a salaried employee of a private company and your list names an employer letter or NOC.',
        'You own the company or are self-employed: use the business-owner version instead.',
        'You work for a government department: use the government-employee version instead.',
      ],
    },
    mistakes: [
      { title: 'Leaving the salary out', body: 'Three lists name it. Leave it out and the letter is missing a listed item. Make the figure match the payslips.' },
      { title: 'A letter older than a month', body: 'Portugal’s list says the letter must not be older than one month. Date it close to the application.' },
      { title: 'No contact number', body: 'Several lists name it, and a consulate that wants to verify the letter needs someone to call.' },
      { title: 'Leave that stops short of the trip', body: 'The leave period must cover the flights as well as the stay.' },
      { title: 'A title or start date that differs from the contract', body: 'The employment contract goes in the same file. A different job title or joining date is easy to spot.' },
    ],
    faqs: [
      { q: 'What must an employer letter say for a Schengen visa from Pakistan?', a: 'On the Portugal, Czechia and Hungary lists: approval for leave of absence, the dates of absence, position and salary, duration of employment, purpose of absence and the employer’s contact number.' },
      { q: 'Who should sign it?', a: 'An HR manager or your line manager, with their title, a phone or email, and the company stamp.' },
      { q: 'Does the employer letter need attestation?', a: 'On Portugal’s list the employee row carries no attestation mark, while the company-owner and civil-servant rows do. Check the mark on your own consulate’s list.' },
      { q: 'What if the list does not name an addressee?', a: 'The generator’s “To whom it may concern” line is the neutral choice. Name the embassy only where the list asks for it.' },
    ],
    sources: [SRC.ptPk, SRC.czPk, SRC.huPk],
    related: ['pakistan-to-schengen', 'pakistan-business-owner', 'pakistan-government-employee'],
    sampleNote: 'A sample employer letter for a salaried employee in Lahore. The company, employee and numbers are invented.',
  },
  {
    slug: 'pakistan-business-owner',
    type: 'noc',
    origin: 'pakistan',
    destSlug: 'schengen',
    variant: 'business-owner',
    liveFrom: '2026-10-15',
    title: 'NOC Letter for Business Owners Applying from Pakistan',
    description: 'Owners have no boss to write a NOC. What Pakistan’s Schengen checklists ask of company owners, plus an optional letter signed by a partner or director.',
    h1: 'Business owner NOC letter for a Schengen visa (applying from Pakistan)',
    intro: [
      'For company owners and the self-employed, the Portugal, Czechia and Hungary lists for Pakistan name one document: a certificate of registration of the company. None of them names an employer NOC for owners, because an owner has no employer.',
      'A letter from the company is therefore optional. It is useful for one reason: it tells the consulate who runs the business while you are away. Because you cannot sign off your own absence, a partner, co-director or senior manager who really holds that role should sign it, and every line must match your registration papers.',
    ],
    checklistHeading: 'What the lists ask of owners and the self-employed',
    checklistIntro: 'The document the lists name is the registration certificate. The company letter sits beside it.',
    checklist: [
      { label: 'Certificate of registration', text: 'The named document on all three lists. Portugal marks this row for attestation by the Ministry of Foreign Affairs.' },
      { label: 'Which certificate counts', text: 'A company registered with SECP, a partnership and a sole proprietorship hold different papers. We could not find a list that says which one each consulate accepts, so ask the visa application centre before you apply.', suggestion: true },
      { label: 'Tax records', text: 'The NTN certificate and Federal Board of Revenue acknowledgements for the last two fiscal years (Portugal, Czechia).' },
      { label: 'Bank statements', text: 'Six months, signed and stamped by the bank. Czechia says that if you submit the company’s statement you must also enclose your personal statement for at least six months.' },
      { label: 'The company letter', text: 'Optional. Generator: choose “Business owner”, name the signer, who runs operations while you are away and how big the company is.', suggestion: true },
    ],
    fit: {
      heading: 'Write the company letter if',
      items: [
        'The business depends on you and the consulate will want to see that someone else keeps it running.',
        'A partner, co-director or senior manager who actually holds that role is willing to sign.',
        'Every statement in it, such as company name, your role and the size of the business, matches the registration certificate.',
      ],
    },
    mistakes: [
      { title: 'Signing your own letter', body: 'A letter only you sign reads as self-certification. Have a partner, co-director or senior manager sign, and only name someone who really holds that role.' },
      { title: 'Treating the letter as a replacement for the certificate', body: 'The lists name the registration certificate. The company letter does not stand in for it.' },
      { title: 'Company statements without personal ones', body: 'Czechia’s list says to enclose your personal six-month statement when you submit the company’s.' },
      { title: 'Claims the registration does not support', body: 'Employee numbers, years in business and your title must agree with the papers on file.' },
    ],
    faqs: [
      { q: 'Does a business owner need a NOC for a Schengen visa from Pakistan?', a: 'Not on the lists we read. They ask owners for the certificate of registration of the company. A company letter is optional supporting context.' },
      { q: 'Who can sign for the company?', a: 'A partner, co-director or senior manager who really holds that role. Do not name a signer who does not.' },
      { q: 'Does the registration certificate need attestation?', a: 'Portugal’s list marks the company-owner row for attestation by the Ministry of Foreign Affairs. Check the mark on your own list.' },
      { q: 'Can I pay for the trip from the company?', a: 'The generator has a choice for who pays. If the company pays, say so and attach the company statements. Czechia also wants your personal statements.' },
    ],
    sources: [SRC.ptPk, SRC.czPk, SRC.huPk],
    sampleOverrides: {
      issuer: 'Business owner (self-issued, a partner or co-director signs)',
      company: 'Example Exports (Pvt) Ltd', empTitle: 'Managing Director', signerName: 'Bilal Raza', signerTitle: 'Co-director',
      ownerCosts: 'The traveller pays personally', ownerDelegate: 'Head of Production (daily operations); Sales Manager (clients)',
      ownerScale: 'about 40 employees across 2 sites',
    },
    related: ['pakistan-to-schengen', 'pakistan-private-employee', 'pakistan-government-employee'],
    sampleNote: 'A sample company letter for an owner in Lahore, signed by a co-director. The company and people are invented.',
  },
  {
    slug: 'pakistan-government-employee',
    type: 'noc',
    origin: 'pakistan',
    destSlug: 'schengen',
    variant: 'government',
    liveFrom: '2026-10-15',
    title: 'Government Employee NOC for a Schengen Visa (Pakistan)',
    description: 'What Pakistan’s Schengen checklists ask of civil servants: a NOC from the employing administration with the visit dates, and when it needs attestation.',
    h1: 'Government employee NOC for a Schengen visa (applying from Pakistan)',
    intro: [
      'The Portugal, Czechia and Hungary lists treat civil servants and government employees as their own group. They ask for a Non Objection Certificate issued by the administration or public service that employs the applicant, stating the dates of the intended visit.',
      'Czechia and Hungary add that this is for travel other than for official purposes, so a posting or an official delegation is handled differently. Portugal marks the row for translation and attestation by the Ministry of Foreign Affairs. Retired civil servants fall under the retired row: pension statements for the last six months.',
    ],
    checklistHeading: 'What the lists say about civil servants',
    checklistIntro: 'The civil-servant row names a single document. The papers every applicant needs still apply.',
    checklist: [
      { label: 'The NOC', text: 'Issued by the administration or public service that employs you, stating the dates of the intended visit. Generator: choose “Government department”.' },
      { label: 'Private visits only', text: 'Czechia and Hungary word the requirement as covering travel other than for official purposes.' },
      { label: 'Attestation', text: 'Portugal marks the civil-servant row for attestation by the Ministry of Foreign Affairs and translation into English or Portuguese. Ask the department how it handles that step.' },
      { label: 'Retired', text: 'Pension statements for the last six months (Portugal, Czechia).' },
      { label: 'Everyone else’s papers', text: 'Six months of stamped bank statements, the NADRA FRC, tax records, bookings and insurance still apply. The civil-servant row adds to them; it does not replace them.' },
    ],
    fit: {
      heading: 'Use this version if',
      items: [
        'You are employed by a government department or public service and the trip is private.',
        'The department will issue the letter on official letterhead with a stamp and an authorised officer’s signature.',
        'The leave dates are approved and the same dates appear on your bookings.',
      ],
    },
    mistakes: [
      { title: 'No exact dates', body: 'The lists ask the NOC to state the dates of the visit. “For a short period” does not.' },
      { title: 'Using it for official travel', body: 'Czechia and Hungary word the NOC for private travel. Official visits have their own paperwork.' },
      { title: 'Forgetting the attestation step', body: 'Portugal’s list marks the row. Ask early, since a department may need time.' },
      { title: 'No official letterhead or stamp', body: 'The letter is a certificate from an administration. A plain page with no stamp invites doubt.' },
    ],
    faqs: [
      { q: 'Do government employees need a NOC for a Schengen visa from Pakistan?', a: 'On the Portugal, Czechia and Hungary lists, yes: a NOC issued by the employing administration, stating the dates of the visit.' },
      { q: 'Is the NOC needed for official travel?', a: 'Czechia and Hungary word it for travel other than for official purposes. Ask the consulate what applies to an official trip.' },
      { q: 'Does it need attestation?', a: 'Portugal’s list marks it for attestation by the Ministry of Foreign Affairs. Check your consulate’s list.' },
      { q: 'What if I am a retired civil servant?', a: 'The lists we read ask retired applicants for pension statements for the last six months.' },
    ],
    sources: [SRC.ptPk, SRC.czPk, SRC.huPk],
    sampleOverrides: {
      issuer: 'Government department (an authorised officer signs)',
      company: 'Example Department', companyAddress: 'Block 1, Government Offices, Lahore, Pakistan',
      signerName: 'Tariq Mehmood', signerTitle: 'Section Officer', signerContact: 'establishment@example.gov.pk, +92 42 0000000',
      empTitle: 'Assistant Director', empStatus: 'Permanent',
    },
    related: ['pakistan-to-schengen', 'pakistan-private-employee', 'pakistan-business-owner'],
    sampleNote: 'A sample departmental NOC for a government employee in Lahore. The department and people are invented.',
  },
  {
    slug: 'pakistan-to-uk',
    type: 'sponsor',
    origin: 'pakistan',
    destSlug: 'united-kingdom',
    liveFrom: '2026-10-15',
    title: 'Sponsor Letter for a UK Visit Visa from Pakistan',
    description: 'If someone else pays for your UK Standard Visitor trip: what the Home Office guidance tests, and what a Pakistani sponsor can attach. Sample letter.',
    h1: 'Sponsor letter for a UK visit visa (applying from Pakistan)',
    intro: [
      'GOV.UK lists funding from someone else as an accepted way to pay for a Standard Visitor trip. The Home Office guidance for officers, section 8.2, says what they then test: the person paying must show they have enough funds to support themselves and their dependants as well as you, and officers may ask where and how you met and how often you talk.',
      'The official pages do not give the sponsor a list of papers. The suggestions below are ours, based on documents Pakistani sponsors usually hold. They are labelled so you can tell them apart from what the guidance says.',
    ],
    checklistHeading: 'What the guidance tests, and what a sponsor can attach',
    checklistIntro: 'The first rows come from the Home Office guidance. Rows marked “Our suggestion” are ours.',
    checklist: [
      { label: 'Enough funds', text: 'The sponsor must satisfy the officer that they have enough funds to adequately support themselves and their dependants as well as you.' },
      { label: 'A genuine relationship', text: 'Officers assess whether the relationship is genuine and whether the sponsor really intends to provide the support. They may ask where and how you met and how often you communicate.' },
      { label: 'Immigration status', text: 'If the sponsor is in the UK, they must not be in breach of immigration law.' },
      { label: 'Likelihood of support', text: 'Where an officer believes it more likely than not that the sponsor cannot provide the support, the application may be refused.' },
      { label: 'Proof of identity', text: 'A copy of the sponsor’s CNIC or passport.', suggestion: true },
      { label: 'Money', text: 'The last six months of the sponsor’s bank statements, plus salary slips or business income proof and FBR tax returns, with figures that match the letter.', suggestion: true },
      { label: 'Relationship', text: 'A NADRA Family Registration Certificate or birth certificate showing how you are related.', suggestion: true },
      { label: 'Exact costs', text: 'State which costs the sponsor pays (flights, accommodation, daily expenses, insurance) so the officer does not have to guess.', suggestion: true },
    ],
    fit: {
      heading: 'A sponsor letter helps when',
      items: [
        'Someone other than you pays part or all of the trip and the application asks who is paying.',
        'The sponsor can show the funds in their own bank statements, not just state them.',
        'You can describe the relationship and how often you are in contact, in case you are asked.',
      ],
    },
    mistakes: [
      { title: 'A sponsor who cannot cover everyone', body: 'The guidance says the sponsor must support themselves and their dependants as well as you. A statement that shows only enough for the trip falls short.' },
      { title: 'Figures that differ from the statements', body: 'Quote the income and savings from the attached statements and nothing else.' },
      { title: 'Vague promises', body: '“I will take care of everything” says less than a list of the costs covered and the period.' },
      { title: 'An unexplained relationship', body: 'If you are not close family, say how you know each other and how long. Officers may ask.' },
    ],
    faqs: [
      { q: 'Does the UK require a sponsor letter?', a: 'GOV.UK does not list one by name on its documents page. A letter is supporting evidence for your answer about who pays, not a form.' },
      { q: 'Does the sponsor have to live in the UK?', a: 'The pages we read do not say. The guidance adds one condition for a sponsor who is in the UK: they must not be in breach of immigration law. Check the current guidance for your case.' },
      { q: 'Who is the letter addressed to?', a: 'The generator addresses it to the Entry Clearance Officer, UK Visas and Immigration, the role that decides a visit visa application made from abroad.' },
      { q: 'Can someone else pay and I still add my own savings?', a: 'Yes. State what each person pays so the costs add up.' },
    ],
    sources: [SRC.ukDocs, SRC.ukGuide],
    related: ['pakistan-to-schengen'],
    sampleNote: 'A sample sponsor letter from a father in Lahore for a visit to London and Manchester. The people and numbers are invented.',
  },

  // ── India (goes live a week later) ─────────────────────────────────────
  {
    slug: 'india-to-schengen',
    type: 'cover',
    origin: 'india',
    destSlug: 'schengen',
    liveFrom: '2026-10-22',
    title: 'Schengen Visa Cover Letter from India: Sample (2026)',
    description: 'Checklists for Schengen visas from India name a personal covering letter. What Portugal, Germany, Switzerland and Lithuania ask for, with a free sample.',
    h1: 'Schengen visa cover letter from India: what the checklists ask for',
    intro: [
      'Unlike the Pakistan lists, several Schengen checklists for applicants in India name a personal covering letter. Portugal’s list asks for an original letter in which you explain the plan of your visit, with reference to your proof of transport and itinerary. Germany’s list for visits (June 2025 edition) has “Personal covering letter / Proof of intended means of transport and itinerary” as item 5. Switzerland lists a “Personal cover letter”, and Lithuania asks for one signed by the applicant explaining the purpose of the visit.',
      'The letter is a short plan, not a story. Tie each part of it to a document in the file: the flight reservation, the hotel bookings and the money.',
    ],
    checklistHeading: 'What the India checklists actually ask for',
    checklistIntro: 'The rows below come from the Portugal (New Delhi), Germany (June 2025), Switzerland (09.2023) and Lithuania (Rev. April 2024) lists.',
    checklist: [
      { label: 'Personal covering letter', text: 'Portugal: an original letter explaining the plan of the visit with reference to transport and itinerary. Germany: item 5 of the visit list. Lithuania: signed by the applicant, with the purpose of the visit and the travel plan.' },
      { label: 'Bank statements', text: 'Three months, stamped by the bank. Germany says pages in continuation must be separated and passbook copies are not accepted.' },
      { label: 'Income tax returns', text: 'Portugal accepts only ITR-V (the verification form or acknowledgement) for the last 2 assessment years. Germany accepts the acknowledgement for the last two assessment years or Form 16. Lithuania asks for three assessment years.' },
      { label: 'Employed', text: 'Payslips for the last three months and the employer’s statement approving the holiday, called a leave sanction letter on Germany’s list (Germany, Portugal, Lithuania). Germany and Lithuania also ask for the employment contract.' },
      { label: 'Company owner or self-employed', text: 'Business registration certificate / GST registration (Portugal, Switzerland), and for Germany and Lithuania a company registration certificate including its GST number.' },
      { label: 'Insurance', text: 'Minimum EUR 30,000 medical cover. Germany accepts Indian insurers only from its approved list, and Portugal links an approved list.' },
      { label: 'Timing (Germany)', text: 'Apply no earlier than six months and no later than 15 working days before travel; processing takes 15 working days.' },
    ],
    fit: {
      heading: 'Where the covering letter does its work',
      items: [
        'Your list names it, so leave it out and a listed item is missing.',
        'It links the file together: the dates in the letter equal the flight, hotel and insurance dates.',
        'It names who pays and which papers prove it. A sponsor’s papers go behind it.',
        'It states the facts that sit across several documents, such as your employer, tenure and leave in one line.',
      ],
    },
    mistakes: [
      { title: 'Ignoring the transport reference', body: 'Portugal asks the letter to refer to your proof of transport and itinerary. A letter that only describes your hopes for the trip misses that.' },
      { title: 'Returns that are not ITR-V', body: 'Portugal accepts only ITR-V. A printed computation or a draft is not what the list names.' },
      { title: 'Passbook copies', body: 'Germany does not accept them. Use stamped statements, with pages in continuation separated.' },
      { title: 'An insurer not on the list', body: 'Germany accepts Indian travel insurance only from approved insurers. Check the list before you buy.' },
      { title: 'Applying outside the window', body: 'For Germany the window is six months before to 15 working days before travel.' },
    ],
    faqs: [
      { q: 'Is a cover letter mandatory for a Schengen visa from India?', a: 'It is a listed item on the Portugal, Germany, Switzerland and Lithuania lists we read. Treat it as expected unless your consulate’s list omits it.' },
      { q: 'Should I put my Aadhaar number in the letter?', a: 'Only if your list asks for it. The letter does not need an ID number for an officer to match it to your passport.' },
      { q: 'Who signs the covering letter?', a: 'You do. Lithuania’s list asks for a letter signed by the applicant. Sign the printed copy in ink.' },
      { q: 'Does the letter replace the leave sanction letter?', a: 'No. Employed applicants submit the employer’s statement approving the holiday as a separate document.' },
    ],
    sources: [SRC.ptIn, SRC.deIn, SRC.chIn, SRC.ltIn],
    related: ['india-private-employee', 'india-business-owner', 'pakistan-to-schengen'],
    sampleNote: 'A sample set in Rome and Florence for an applicant in Pune. The person, employer and numbers are invented.',
  },
  {
    slug: 'india-private-employee',
    type: 'noc',
    origin: 'india',
    destSlug: 'schengen',
    variant: 'employee',
    liveFrom: '2026-10-22',
    title: 'Employer Leave Letter for a Schengen Visa from India',
    description: 'What the Germany, Portugal and Switzerland checklists for India ask of the employer: leave sanction, HR signature, position, service, dates, purpose.',
    h1: 'Employer leave letter for a Schengen visa (applying from India)',
    intro: [
      'The India lists describe the employer’s part in different words. Germany asks for the employer’s statement on approval for holidays, called a leave sanction letter, along with the payslips for the last three months and the employment contract. Portugal asks for the employer’s letter on approval for holidays.',
      'Switzerland’s list is the most detailed. The introduction letter must be an original on the employer’s letterhead, signed and stamped by HR or directorate, mentioning position and duration of service, with a “no objection” statement about the planned trip, the travel dates and the purpose of the trip.',
    ],
    checklistHeading: 'What the letter has to contain, item by item',
    checklistIntro: 'Switzerland (09.2023) supplies the most complete description, so the rows follow it. Germany and Portugal ask for less.',
    checklist: [
      { label: 'Original on letterhead', text: 'Switzerland: an original on the employer’s business letterhead. Print on the company letterhead, not plain paper.' },
      { label: 'Signed and stamped by HR or directorate', text: 'Switzerland: signed and stamped, mentioning position and duration of service. Generator: signer name, signer title and company stamp line.' },
      { label: 'A no-objection statement', text: 'Switzerland: a “no objection” statement about the planned trip. The generator’s NOC wording includes it.' },
      { label: 'Travel dates and purpose', text: 'Switzerland: dates and purpose of the trip. Generator: “Leave from”, “Leave to”, “Purpose” and “Destination country”.' },
      { label: 'Position and tenure', text: 'Job title and joining date. Generator: “Job title” and “Joined on”.' },
      { label: 'Papers that go with it', text: 'Payslips for the last three months and, on Germany’s list, the employment contract. For tax, Portugal accepts only ITR-V; Germany accepts the ITR acknowledgement for two assessment years or Form 16. Figures must match the letter.' },
    ],
    fit: {
      heading: 'Use this version if',
      items: [
        'You are a salaried employee and the list asks for a leave sanction letter or employer’s approval of the holiday.',
        'HR will sign and stamp it, so it carries a name, a designation and a stamp.',
        'You own the company: use the business-owner version, since an owner issues the letter through a partner or director.',
      ],
    },
    mistakes: [
      { title: 'No stamp or HR signature', body: 'Switzerland’s list says signed and stamped by HR or directorate. An unsigned export from a payroll tool does not meet that.' },
      { title: 'Missing position or length of service', body: 'Switzerland asks for both, and the employment contract and payslips back them.' },
      { title: 'Dates that do not match the bookings', body: 'The leave dates should equal the flight dates, including travel days.' },
      { title: 'A scanned copy where the list wants an original', body: 'Switzerland describes the letter as an original document.' },
    ],
    faqs: [
      { q: 'What is a leave sanction letter?', a: 'The employer’s written approval of your leave. Germany’s India list calls it that, and asks for it with payslips for three months and the employment contract.' },
      { q: 'Is a NOC the same thing for the India lists?', a: 'The lists use different words (leave sanction letter, employer’s statement on approval for holidays, introduction letter). The generator’s employer letter covers all of the elements they name.' },
      { q: 'Who signs it?', a: 'HR or the directorate, with their designation and the company stamp.' },
      { q: 'Do I attach Form 16 or ITR-V?', a: 'Germany accepts the ITR acknowledgement for two assessment years or Form 16. Portugal accepts only ITR-V. Follow your consulate’s list.' },
    ],
    sources: [SRC.deIn, SRC.ptIn, SRC.chIn],
    related: ['india-to-schengen', 'india-business-owner'],
    sampleNote: 'A sample employer letter for a salaried employee in Pune. The company, employee and numbers are invented.',
  },
  {
    slug: 'india-business-owner',
    type: 'noc',
    origin: 'india',
    destSlug: 'schengen',
    variant: 'business-owner',
    liveFrom: '2026-10-22',
    title: 'Business Owner Letter for a Schengen Visa from India',
    description: 'What the Portugal, Germany and Switzerland lists for India ask of business owners: GST or registration papers, ITR-V and business statements.',
    h1: 'Business owner letter for a Schengen visa (applying from India)',
    intro: [
      'For company owners and the self-employed, the India lists name proof of the business rather than an employer’s letter. Portugal lists a business registration certificate or GST registration with annexes A and B, a partnership deed or proof of proprietorship. Germany and Lithuania ask for a certificate of registration of the company including its GST number.',
      'A company letter is optional. It tells the consulate who runs the business while you are away, and it should be signed by a partner, co-director or senior manager who really holds that role, not by you.',
    ],
    checklistHeading: 'What the India lists ask of owners and the self-employed',
    checklistIntro: 'The named documents are registration papers and tax returns. The company letter sits beside them.',
    checklist: [
      { label: 'Proof of the business', text: 'Portugal and Switzerland: business registration certificate or GST registration with annex A and B, a partnership deed, or proof of proprietorship. Germany and Lithuania: certificate of registration including the GST number.' },
      { label: 'Tax returns', text: 'Portugal and Switzerland: company and personal ITR for the last 2 assessment years, ITR-V only. Germany: the ITR acknowledgement for the last two assessment years or Form 16. Lithuania: three assessment years.' },
      { label: 'Bank statements', text: 'Three months of personal and business bank statements (Portugal, Switzerland), stamped by the bank.' },
      { label: 'The company letter', text: 'Optional. Generator: choose “Business owner”, name the signer, who runs operations while you are away and how big the company is.', suggestion: true },
    ],
    fit: {
      heading: 'Write the company letter if',
      items: [
        'The business depends on you and the consulate will want to see that someone else keeps it running.',
        'A partner, co-director or senior manager who holds that role is willing to sign.',
        'Every figure and title in it matches the registration, GST and tax papers.',
      ],
    },
    mistakes: [
      { title: 'Self-signing', body: 'A letter signed only by the owner reads as self-certification. Have a partner or director sign.' },
      { title: 'ITR in the wrong form', body: 'Portugal and Switzerland accept only ITR-V. Check the form before you print it.' },
      { title: 'One statement instead of two', body: 'Portugal and Switzerland ask for both personal and business statements.' },
      { title: 'Describing the business differently across documents', body: 'The letter, the GST registration and the ITR should tell the same story about what the business does and its size.' },
    ],
    faqs: [
      { q: 'Does a business owner need an employer letter for a Schengen visa from India?', a: 'Not on the lists we read. They ask for proof of the business, tax returns and statements. A company letter is optional context.' },
      { q: 'Do I need GST registration?', a: 'Germany and Lithuania ask for the registration certificate including its GST number for companies based in India. Portugal lists GST registration as one of several accepted proofs.' },
      { q: 'Who signs the company letter?', a: 'A partner, co-director or senior manager who really holds that role.' },
      { q: 'How many years of ITR do I attach?', a: 'Two assessment years on the Portugal, Switzerland and Germany lists, three on Lithuania’s.' },
    ],
    sources: [SRC.ptIn, SRC.deIn, SRC.chIn, SRC.ltIn],
    sampleOverrides: {
      issuer: 'Business owner (self-issued, a partner or co-director signs)',
      company: 'Example Exports Pvt Ltd', empTitle: 'Managing Director', signerName: 'Arjun Mehta', signerTitle: 'Co-director',
      ownerCosts: 'The traveller pays personally', ownerDelegate: 'Operations Head (daily operations); Sales Manager (clients)',
      ownerScale: 'about 40 employees across 2 sites',
    },
    related: ['india-to-schengen', 'india-private-employee'],
    sampleNote: 'A sample company letter for an owner in Pune, signed by a co-director. The company and people are invented.',
  },
]

export const CORRIDOR_BY_KEY = new Map(CORRIDORS.map((c) => [`${c.type}/${c.slug}`, c]))

const todayUtc = () => new Date().toISOString().slice(0, 10)

export function isCorridorLive(c: Corridor, today: string = todayUtc()): boolean {
  return c.liveFrom <= today
}

export function liveCorridors(today: string = todayUtc()): Corridor[] {
  return CORRIDORS.filter((c) => isCorridorLive(c, today))
}

/** Look up a corridor by the URL's letter-type slug context and corridor slug. Returns null if unknown or not yet live. */
export function findLiveCorridor(type: LetterType, slug: string, today: string = todayUtc()): Corridor | null {
  const c = CORRIDOR_BY_KEY.get(`${type}/${slug}`)
  return c && isCorridorLive(c, today) ? c : null
}
