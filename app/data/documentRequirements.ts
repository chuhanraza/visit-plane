export type Criterion = { id: string; label: string; critical: boolean }
export type DocumentSpec = { id: string; label: string; required: boolean; criteria: Criterion[] }
export type CountryRequirements = { documents: DocumentSpec[] }

export const DOCUMENT_REQUIREMENTS: Record<string, CountryRequirements> = {
  schengen: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport',  label: 'Is a valid passport',                   critical: true  },
        { id: 'readable',     label: 'All details clearly visible',            critical: true  },
        { id: 'validity_6mo', label: 'Valid for 6+ months beyond travel date', critical: true  },
        { id: 'blank_pages',  label: 'Has 2+ blank visa pages',               critical: false },
        { id: 'not_damaged',  label: 'No damage or tears',                    critical: false },
      ]},
      { id: 'photo', label: 'Passport Photo', required: true, criteria: [
        { id: 'white_background', label: 'White/light grey background',  critical: true  },
        { id: 'face_centered',    label: 'Face centered, eyes open',     critical: true  },
        { id: 'recent',           label: 'Appears recent (not aged)',    critical: false },
        { id: 'no_glasses',       label: 'No glasses',                  critical: false },
        { id: 'correct_size',     label: '35mm x 45mm standard size',   critical: false },
      ]},
      { id: 'bank_statement', label: 'Bank Statement', required: true, criteria: [
        { id: 'recent_3mo',       label: 'Issued within last 3 months',         critical: true  },
        { id: 'sufficient_funds', label: 'Sufficient funds (€50+/day of stay)', critical: true  },
        { id: 'account_holder',   label: 'Account holder name visible',         critical: true  },
        { id: 'official_bank',    label: 'Official bank letterhead/stamp',      critical: false },
      ]},
      { id: 'travel_insurance', label: 'Travel Insurance', required: true, criteria: [
        { id: 'coverage_35k',   label: 'Minimum €30,000 coverage',      critical: true  },
        { id: 'schengen_wide',  label: 'Covers all Schengen countries',  critical: true  },
        { id: 'dates_match',    label: 'Dates cover entire trip',        critical: true  },
        { id: 'med_evacuation', label: 'Includes medical evacuation',   critical: false },
      ]},
      { id: 'hotel_booking', label: 'Hotel / Accommodation Booking', required: true, criteria: [
        { id: 'confirmation_no', label: 'Confirmation number visible',        critical: true  },
        { id: 'dates_clear',     label: 'Check-in and check-out dates clear', critical: true  },
        { id: 'address',         label: 'Hotel address included',            critical: false },
        { id: 'name_match',      label: 'Booking name matches passport',     critical: false },
      ]},
      { id: 'flight_booking', label: 'Flight Booking / Itinerary', required: true, criteria: [
        { id: 'round_trip',     label: 'Shows both outbound and return flights', critical: true  },
        { id: 'passenger_name', label: 'Passenger name visible',               critical: true  },
        { id: 'flight_numbers', label: 'Flight numbers present',               critical: false },
        { id: 'dates_match',    label: 'Dates consistent with visa dates',     critical: false },
      ]},
    ],
  },
  usa: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport',  label: 'Valid passport',                    critical: true  },
        { id: 'validity_6mo', label: 'Valid 6+ months beyond stay',       critical: true  },
        { id: 'readable',     label: 'MRZ and photo clearly readable',    critical: true  },
        { id: 'biometric',    label: 'Biometric chip page visible',       critical: false },
      ]},
      { id: 'ds160_confirmation', label: 'DS-160 Confirmation Page', required: true, criteria: [
        { id: 'barcode',        label: 'Barcode/confirmation number visible',  critical: true },
        { id: 'applicant_name', label: 'Applicant name matches passport',      critical: true },
      ]},
      { id: 'bank_statement', label: 'Bank Statement', required: true, criteria: [
        { id: 'recent_3mo',       label: 'Last 3 months of statements', critical: true },
        { id: 'sufficient_funds', label: 'Sufficient funds for trip',   critical: true },
        { id: 'account_holder',   label: 'Account holder name visible', critical: true },
      ]},
      { id: 'photo', label: 'Passport Photo (US Format)', required: true, criteria: [
        { id: 'white_background', label: 'Plain white background',            critical: true  },
        { id: 'face_centered',    label: 'Face centered, neutral expression', critical: true  },
        { id: 'correct_size',     label: '2x2 inch (51x51mm) format',        critical: true  },
        { id: 'recent_6mo',       label: 'Taken within last 6 months',       critical: false },
      ]},
    ],
  },
  uk: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport', label: 'Valid passport',                   critical: true },
        { id: 'validity',    label: 'Covers planned stay duration',     critical: true },
        { id: 'readable',    label: 'All details clearly readable',     critical: true },
      ]},
      { id: 'bank_statement', label: 'Bank Statement (6 months)', required: true, criteria: [
        { id: 'six_months',        label: 'Covers last 6 months',                   critical: true  },
        { id: 'sufficient_funds',  label: 'Adequate funds (£1000+ recommended)',    critical: true  },
        { id: 'account_holder',    label: 'Account holder name visible',            critical: true  },
        { id: 'no_large_deposits', label: 'No unexplained large deposits',         critical: false },
      ]},
      { id: 'photo', label: 'Passport Photo', required: true, criteria: [
        { id: 'white_background', label: 'Plain white/cream background',     critical: true  },
        { id: 'face_visible',     label: 'Full face visible, no obstructions', critical: true },
        { id: 'correct_size',     label: '35mm x 45mm format',              critical: false },
      ]},
    ],
  },
  canada: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport',  label: 'Valid passport',                  critical: true },
        { id: 'validity_6mo', label: 'Valid 6+ months beyond stay',     critical: true },
        { id: 'readable',     label: 'All details clearly readable',    critical: true },
      ]},
      { id: 'bank_statement', label: 'Bank Statement', required: true, criteria: [
        { id: 'recent_3mo',       label: 'Last 3 months of statements',          critical: true  },
        { id: 'sufficient_funds', label: 'CAD $10,000+ or sufficient funds',     critical: true  },
        { id: 'account_holder',   label: 'Account holder name visible',          critical: true  },
        { id: 'official_bank',    label: 'Official bank letterhead/stamp',       critical: false },
      ]},
      { id: 'photo', label: 'Passport Photo', required: true, criteria: [
        { id: 'white_background', label: 'White or light background',    critical: true  },
        { id: 'face_centered',    label: 'Full face, neutral expression', critical: true },
        { id: 'correct_size',     label: '35mm x 45mm format',          critical: false },
      ]},
    ],
  },
  australia: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport',  label: 'Valid passport',                      critical: true  },
        { id: 'validity_6mo', label: 'Valid for intended stay duration',    critical: true  },
        { id: 'readable',     label: 'Biodata page clearly readable',       critical: true  },
        { id: 'biometric',    label: 'Biometric information page included', critical: false },
      ]},
      { id: 'bank_statement', label: 'Bank Statement', required: true, criteria: [
        { id: 'recent_3mo',       label: 'Last 3 months shown',       critical: true },
        { id: 'sufficient_funds', label: 'AUD $5,000+ available',     critical: true },
        { id: 'account_holder',   label: 'Account holder name visible', critical: true },
      ]},
      { id: 'photo', label: 'Passport Photo', required: true, criteria: [
        { id: 'white_background', label: 'Plain white/light background',     critical: true  },
        { id: 'face_centered',    label: 'Full face centered, eyes open',    critical: true  },
        { id: 'recent',           label: 'Taken within last 6 months',      critical: false },
      ]},
    ],
  },
  uae: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport',  label: 'Valid passport',                              critical: true  },
        { id: 'validity_6mo', label: 'Valid 6+ months from travel date',            critical: true  },
        { id: 'readable',     label: 'All details and MRZ clearly visible',         critical: true  },
        { id: 'not_damaged',  label: 'No damage, tears, or water marks',           critical: false },
      ]},
      { id: 'photo', label: 'Passport Photo', required: true, criteria: [
        { id: 'white_background', label: 'White background',                         critical: true  },
        { id: 'face_centered',    label: 'Full face visible, neutral expression',    critical: true  },
        { id: 'correct_size',     label: '35mm x 45mm',                             critical: false },
        { id: 'recent',           label: 'Taken within last 6 months',              critical: false },
      ]},
      { id: 'bank_statement', label: 'Bank Statement', required: true, criteria: [
        { id: 'recent_3mo',       label: 'Last 3 months of statements',    critical: true  },
        { id: 'sufficient_funds', label: 'Minimum balance of USD $4,000',  critical: true  },
        { id: 'account_holder',   label: 'Account holder name visible',    critical: true  },
        { id: 'official_stamp',   label: 'Bank official stamp or letterhead', critical: false },
      ]},
      { id: 'hotel_booking', label: 'Hotel Booking Confirmation', required: true, criteria: [
        { id: 'confirmation_no', label: 'Booking confirmation number',  critical: true  },
        { id: 'dates_clear',     label: 'Check-in/check-out dates',     critical: true  },
        { id: 'hotel_name',      label: 'Hotel name and address',       critical: false },
      ]},
    ],
  },
  turkey: {
    documents: [
      { id: 'passport', label: 'Passport', required: true, criteria: [
        { id: 'is_passport',  label: 'Valid passport',                       critical: true },
        { id: 'validity_6mo', label: 'Valid 6+ months beyond stay',          critical: true },
        { id: 'readable',     label: 'All information clearly readable',     critical: true },
      ]},
      { id: 'photo', label: 'Passport Photo', required: true, criteria: [
        { id: 'white_background', label: 'White background',                  critical: true  },
        { id: 'face_centered',    label: 'Face centered, ears visible',       critical: true  },
        { id: 'recent',           label: 'Recent photo (within 6 months)',   critical: false },
      ]},
      { id: 'bank_statement', label: 'Bank Statement', required: true, criteria: [
        { id: 'recent_3mo',       label: 'Last 3 months',                   critical: true },
        { id: 'sufficient_funds', label: 'Minimum USD $50/day of stay',     critical: true },
        { id: 'account_holder',   label: 'Account holder name visible',     critical: true },
      ]},
      { id: 'hotel_booking', label: 'Hotel / Accommodation Proof', required: true, criteria: [
        { id: 'confirmation_no', label: 'Booking reference number',   critical: true  },
        { id: 'dates_clear',     label: 'Stay dates clearly visible', critical: true  },
        { id: 'name_match',      label: 'Name matches passport',      critical: false },
      ]},
      { id: 'flight_booking', label: 'Return Flight Ticket', required: true, criteria: [
        { id: 'round_trip',     label: 'Return ticket confirmed',   critical: true  },
        { id: 'passenger_name', label: 'Passenger name visible',    critical: true  },
        { id: 'dates_clear',    label: 'Departure and return dates', critical: false },
      ]},
    ],
  },
}

const SLUG_MAP: Record<string, string> = {
  schengen: 'schengen', 'schengen-visa': 'schengen',
  france: 'schengen', germany: 'schengen', italy: 'schengen', spain: 'schengen',
  netherlands: 'schengen', belgium: 'schengen', austria: 'schengen',
  switzerland: 'schengen', sweden: 'schengen', norway: 'schengen',
  denmark: 'schengen', finland: 'schengen', greece: 'schengen', portugal: 'schengen',
  usa: 'usa', 'united states': 'usa', 'united-states': 'usa', us: 'usa', america: 'usa',
  uk: 'uk', 'united kingdom': 'uk', 'united-kingdom': 'uk', britain: 'uk', england: 'uk',
  canada: 'canada', australia: 'australia',
  uae: 'uae', 'united arab emirates': 'uae', dubai: 'uae', 'abu dhabi': 'uae',
  turkey: 'turkey', turkiye: 'turkey',
}

export function getCountryRequirements(countrySlug: string): CountryRequirements | null {
  const normalized = countrySlug.toLowerCase().trim()
  const key = SLUG_MAP[normalized] ?? normalized
  return DOCUMENT_REQUIREMENTS[key] ?? null
}
