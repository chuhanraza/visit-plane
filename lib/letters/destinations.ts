/**
 * Destination data for the support-letter landing pages.
 *
 * Only facts we can state safely live here: the visa's name, the official
 * source, example cities for the sample itinerary, and the few well-known
 * destination rules the letter tool already warns about. Anything else is
 * left to the official page, which every destination page links to.
 */
import type { LetterType } from './templates'

export type DestRegion = 'Schengen (Europe)' | 'United Kingdom' | 'Canada' | 'United States' | 'Australia' | 'Other'

export interface LetterDestination {
  slug: string
  name: string
  /** Value for the tool's "region" select. */
  region: DestRegion
  /** Name of the short-stay visitor visa, as used by the destination. */
  visaName: string
  authority: { name: string; url: string }
  /** Example cities used in the sample letter itinerary. */
  cities: [string, string]
  /** Letter types that get an indexable landing page. Only destinations with distinct, verifiable content get pages. */
  pages: LetterType[]
  /** Extra destination-specific points for the landing page, by letter type. */
  points?: Partial<Record<LetterType, string[]>>
  /** Destination-specific question and answer, by letter type. */
  faq?: Partial<Record<LetterType, { q: string; a: string }>>
  /** Destination-specific rules by letter type. Keep cautious and verifiable. */
  notes?: Partial<Record<LetterType, string>>
}

const SCHENGEN: DestRegion = 'Schengen (Europe)'
const SCHENGEN_VISA = 'Schengen short-stay visa (Type C)'

export const LETTER_DESTINATIONS: LetterDestination[] = [
  {
    pages: ['cover', 'invitation', 'sponsor'],
    slug: 'schengen', name: 'the Schengen Area', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'European Commission, Migration and Home Affairs', url: 'https://home-affairs.ec.europa.eu' },
    cities: ['Paris', 'Rome'],
  },
  {
    pages: ['invitation', 'sponsor'],
    slug: 'germany', name: 'Germany', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'German Federal Foreign Office', url: 'https://www.auswaertiges-amt.de' },
    cities: ['Berlin', 'Munich'],
    points: {
      invitation: [
        'The Verpflichtungserklärung is a formal declaration in which the host agrees to cover the guest’s costs. The host normally makes it at the local foreigners’ authority (Ausländerbehörde) in Germany.',
        'A letter still helps because it explains the relationship, the dates and where the guest will stay. If the consulate asks for the formal declaration, the letter alone will not be accepted.',
      ],
      sponsor: [
        'If the sponsor lives in Germany, the formal declaration (Verpflichtungserklärung) is the document that binds them to the costs.',
        'A sponsor outside Germany, such as a parent in Pakistan, normally supports the application with a signed letter and financial documents instead. Ask the consulate which it accepts.',
      ],
    },
    faq: {
      invitation: { q: 'What is the Verpflichtungserklärung?', a: 'A formal declaration in which a host in Germany agrees to cover the guest’s costs. It is normally made at the local foreigners’ authority, and the consulate may ask for it instead of, or with, a letter.' },
      sponsor: { q: 'Can a sponsor outside Germany support a German visa application?', a: 'Usually through a signed letter and financial documents, since the formal declaration is made in Germany. Ask the consulate which it accepts for your case.' },
    },
    notes: {
      invitation: 'Germany uses a formal declaration of commitment (Verpflichtungserklärung) for many private invitations. A plain letter from your host does not replace it, so ask the German consulate which document it wants.',
      sponsor: 'For private sponsorship Germany may ask for the formal declaration of commitment (Verpflichtungserklärung) from the host, in addition to a letter. Check the consulate checklist.',
    },
  },
  {
    pages: ['invitation', 'sponsor'],
    slug: 'france', name: 'France', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'France-Visas', url: 'https://france-visas.gouv.fr' },
    cities: ['Paris', 'Lyon'],
    points: {
      invitation: [
        'An accommodation certificate (attestation d’accueil) is issued through the host’s local authority in France. The process has changed over the years, so check the current steps before the host starts.',
        'The France-Visas portal builds the document list for your exact case. Follow that list first, and use the host’s letter as supporting evidence.',
      ],
      sponsor: [
        'France-Visas generates the document list for your trip. A sponsor letter supports that list; check whether it asks for a specific sponsorship form.',
        'Attach the sponsor’s identity document, six months of bank statements and proof of income so the consulate can check the claim.',
      ],
    },
    faq: {
      invitation: { q: 'What is the attestation d’accueil?', a: 'An accommodation certificate for private stays, issued through the host’s local authority in France. The process has changed over time, so confirm the current steps on France-Visas.' },
      sponsor: { q: 'Does France use a special sponsor form?', a: 'The France-Visas portal generates the document list for your case. If a specific sponsorship form is on that list, use it; if not, a signed sponsor letter with financial documents supports the application.' },
    },
    notes: {
      invitation: 'For private stays France can ask for an accommodation certificate (attestation d’accueil) from the host. A plain letter may not be enough. Confirm on the France-Visas checklist for your case.',
      sponsor: 'Apply through the France-Visas portal and follow the document list it generates for your trip. A sponsor letter supports the list; it does not replace anything on it.',
    },
  },
  {
    pages: [],
    slug: 'italy', name: 'Italy', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Visa for Italy (Ministry of Foreign Affairs)', url: 'https://vistoperitalia.esteri.it' },
    cities: ['Rome', 'Florence'],
  },
  {
    pages: ['invitation'],
    slug: 'spain', name: 'Spain', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Spanish Ministry of Foreign Affairs', url: 'https://www.exteriores.gob.es' },
    cities: ['Madrid', 'Barcelona'],
    points: {
      invitation: [
        'The Spanish letter of invitation (carta de invitación) is typically validated by the Spanish police in the host’s area before the guest applies. A plain letter does not replace it.',
        'Ask the Spanish consulate whether your case needs the validated letter, and use a personal letter alongside it to explain the relationship and dates.',
      ],
    },
    faq: {
      invitation: { q: 'What is the carta de invitación?', a: 'A letter of invitation for private visits that is typically validated by the Spanish police in the host’s area before the guest applies. A plain letter does not replace it.' },
    },
    notes: {
      invitation: 'Spain can ask for a formal letter of invitation (carta de invitación) for private visits. A plain letter does not replace it. Check the consulate’s requirements first.',
    },
  },
  {
    pages: [],
    slug: 'netherlands', name: 'the Netherlands', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Netherlands & You', url: 'https://www.netherlandsandyou.nl' },
    cities: ['Amsterdam', 'Utrecht'],
  },
  {
    pages: [],
    slug: 'switzerland', name: 'Switzerland', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'State Secretariat for Migration (SEM)', url: 'https://www.sem.admin.ch' },
    cities: ['Zurich', 'Lucerne'],
  },
  {
    pages: [],
    slug: 'austria', name: 'Austria', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Austrian Federal Ministry for European and International Affairs', url: 'https://www.bmeia.gv.at' },
    cities: ['Vienna', 'Salzburg'],
  },
  {
    pages: [],
    slug: 'belgium', name: 'Belgium', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Belgian Foreign Affairs', url: 'https://diplomatie.belgium.be' },
    cities: ['Brussels', 'Bruges'],
  },
  {
    pages: [],
    slug: 'greece', name: 'Greece', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Greek Ministry of Foreign Affairs', url: 'https://www.mfa.gr' },
    cities: ['Athens', 'Thessaloniki'],
  },
  {
    pages: [],
    slug: 'portugal', name: 'Portugal', region: SCHENGEN, visaName: SCHENGEN_VISA,
    authority: { name: 'Portuguese visa portal', url: 'https://vistos.mne.gov.pt' },
    cities: ['Lisbon', 'Porto'],
  },
  {
    pages: ['cover', 'invitation', 'sponsor'],
    slug: 'united-kingdom', name: 'the United Kingdom', region: 'United Kingdom', visaName: 'Standard Visitor visa',
    authority: { name: 'UK Visas and Immigration', url: 'https://www.gov.uk/apply-to-come-to-the-uk' },
    cities: ['London', 'Manchester'],
  },
  {
    pages: ['cover', 'invitation', 'sponsor'],
    slug: 'united-states', name: 'the United States', region: 'United States', visaName: 'B-1/B-2 visitor visa',
    authority: { name: 'US Department of State', url: 'https://travel.state.gov' },
    cities: ['New York', 'Washington, DC'],
  },
  {
    pages: ['cover', 'invitation', 'sponsor'],
    slug: 'canada', name: 'Canada', region: 'Canada', visaName: 'visitor visa (temporary resident visa)',
    authority: { name: 'Immigration, Refugees and Citizenship Canada (IRCC)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship' },
    cities: ['Toronto', 'Vancouver'],
  },
  {
    pages: ['cover', 'invitation', 'sponsor'],
    slug: 'australia', name: 'Australia', region: 'Australia', visaName: 'Visitor visa (subclass 600)',
    authority: { name: 'Australian Department of Home Affairs', url: 'https://immi.homeaffairs.gov.au' },
    cities: ['Sydney', 'Melbourne'],
  },
  {
    pages: [],
    slug: 'new-zealand', name: 'New Zealand', region: 'Other', visaName: 'Visitor visa',
    authority: { name: 'Immigration New Zealand', url: 'https://www.immigration.govt.nz' },
    cities: ['Auckland', 'Queenstown'],
  },
  {
    pages: [],
    slug: 'ireland', name: 'Ireland', region: 'Other', visaName: 'short-stay (C) visa',
    authority: { name: 'Irish Immigration Service', url: 'https://www.irishimmigration.ie' },
    cities: ['Dublin', 'Galway'],
  },
  {
    pages: [],
    slug: 'uae', name: 'the United Arab Emirates', region: 'Other', visaName: 'tourist visa',
    authority: { name: 'UAE ICP Smart Services', url: 'https://smartservices.icp.gov.ae' },
    cities: ['Dubai', 'Abu Dhabi'],
  },
  {
    pages: [],
    slug: 'turkey', name: 'Turkey', region: 'Other', visaName: 'visitor visa (e-Visa where available)',
    authority: { name: 'Turkey e-Visa', url: 'https://www.evisa.gov.tr' },
    cities: ['Istanbul', 'Antalya'],
  },
  {
    pages: [],
    slug: 'japan', name: 'Japan', region: 'Other', visaName: 'temporary visitor visa',
    authority: { name: 'Ministry of Foreign Affairs of Japan', url: 'https://www.mofa.go.jp' },
    cities: ['Tokyo', 'Kyoto'],
  },
  {
    pages: [],
    slug: 'south-korea', name: 'South Korea', region: 'Other', visaName: 'short-term visit (C-3) visa',
    authority: { name: 'Korea Visa Portal', url: 'https://www.visa.go.kr' },
    cities: ['Seoul', 'Busan'],
  },
]

export const DEST_BY_SLUG = Object.fromEntries(LETTER_DESTINATIONS.map((d) => [d.slug, d])) as Record<string, LetterDestination>

/** The tool's destination field takes a plain country name ("Germany", "the Netherlands" → "Netherlands"). */
export function toolDestinationName(d: LetterDestination): string {
  return d.name.replace(/^the /, '')
}

/** Look up a destination from free text such as the tool's destination field. */
export function findDestinationByName(input: string): LetterDestination | undefined {
  const q = input.trim().toLowerCase().replace(/^the /, '')
  if (!q) return undefined
  return LETTER_DESTINATIONS.find(
    (d) => d.slug === q || toolDestinationName(d).toLowerCase() === q || d.slug.replace(/-/g, ' ') === q,
  )
}
