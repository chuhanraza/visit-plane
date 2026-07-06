/**
 * Flight Delay / Cancellation / Denied-Boarding compensation checker — pure logic.
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT — SCOPE:
 *   This module is a plain-language ESTIMATOR based ONLY on what the user types
 *   into the form. It does NOT call any flight-status/tracking API, does NOT
 *   look up real flight data, and does NOT submit anything anywhere. All inputs
 *   are self-reported by the traveler. Every "eligible" result is a probabilistic
 *   read of public regulation text, not legal advice or a guaranteed outcome.
 *
 * SOURCES (also linked on the page itself):
 *   - EU Regulation (EC) 261/2004 — https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:32004R0261
 *   - UK CAA (retained EU law, UK261) — https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/
 *   - US DOT — https://www.transportation.gov/airconsumer/fly-rights
 *     14 CFR 250.5 (denied boarding formula, in force for travel on/after 2026-01-22... )
 *     https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-250/section-250.5
 *
 * NOTE ON THE JUNE-2026 EU261 REFORM: EU institutions reached a *provisional*
 * political deal on 15 June 2026 to reform Regulation 261/2004. As of this
 * writing the reform has NOT been formally adopted or published in the Official
 * Journal — the current 3-hour flat delay threshold and €250/€400/€600 tiers
 * modeled below remain the law in force. If you are reading this well after
 * 2027, double-check the CURRENT rule against the eur-lex source link above,
 * since the reform may have entered into force by then.
 */

export type DisruptionType = 'delay' | 'cancelled' | 'denied_boarding'
export type CarrierRegion = 'eu_eea' | 'uk' | 'other'
export type DistanceBand = 'short' | 'medium' | 'long'
export type ExtraordinaryAnswer = 'no' | 'yes' | 'unsure'
export type RegimeId = 'eu261' | 'uk261' | 'us_dot'

export interface FlightComplaintInput {
  departureCountry: string
  arrivalCountry: string
  carrierRegion: CarrierRegion
  distanceBand: DistanceBand
  disruption: DisruptionType
  /** Hours late arriving at final destination vs. the scheduled arrival time. Used for 'delay' and 'denied_boarding'. */
  delayHours: number | null
  /** Days of advance notice given before the ORIGINAL scheduled departure. Used for 'cancelled'. */
  cancellationNoticeDays: number | null
  /** Only asked for 'delay' and 'cancelled' — denied boarding has no such exemption under EU/UK law. */
  extraordinaryCircumstances: ExtraordinaryAnswer
  /** Only asked for 'denied_boarding'. */
  deniedBoardingVoluntary: boolean | null
}

export interface EligibilityResult {
  regime: RegimeId
  regimeName: string
  /** Does this regulation's jurisdiction even cover a flight with this departure/arrival/carrier combo? */
  inScope: boolean
  /** Best-guess read on whether compensation is likely owed, given only what was typed in. */
  eligible: 'yes' | 'no' | 'maybe'
  amountBand: string | null
  headline: string
  reasoning: string[]
  caveats: string[]
}

// ─── Static reference data (NOT live — a fixed membership list, same kind of
// static data as the country picker) ───────────────────────────────────────────
export const EU_EEA_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden', 'Iceland', 'Liechtenstein', 'Norway',
])
export const UK_COUNTRY = 'United Kingdom'
export const US_COUNTRY = 'United States'

export function isEuEea(country: string): boolean {
  return EU_EEA_COUNTRIES.has(country)
}
export function isUk(country: string): boolean {
  return country === UK_COUNTRY
}
export function isUs(country: string): boolean {
  return country === US_COUNTRY
}

const DISTANCE_LABEL: Record<DistanceBand, string> = {
  short: 'up to 1,500 km (~932 mi)',
  medium: '1,500–3,500 km (~932–2,175 mi)',
  long: 'over 3,500 km (~2,175 mi)',
}
export { DISTANCE_LABEL }

// ─── EU261 ─────────────────────────────────────────────────────────────────────
const EU261_AMOUNTS: Record<DistanceBand, string> = { short: '€250', medium: '€400', long: '€600' }

export function checkEU261(input: FlightComplaintInput): EligibilityResult {
  const { departureCountry, arrivalCountry, carrierRegion, distanceBand, disruption } = input
  const departureScope = isEuEea(departureCountry)
  const arrivalScope = isEuEea(arrivalCountry) && carrierRegion === 'eu_eea'
  const inScope = departureScope || arrivalScope

  const base: Omit<EligibilityResult, 'eligible' | 'amountBand' | 'headline' | 'reasoning' | 'caveats'> = {
    regime: 'eu261',
    regimeName: 'EU261 (Regulation (EC) 261/2004)',
    inScope,
  }

  if (!inScope) {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'EU261 does not apply to this flight',
      reasoning: [
        'EU261 covers flights departing an EU/EEA airport on any airline, or flights arriving in the EU/EEA operated by an EU/EEA airline.',
        'Based on what you entered, neither leg of this trip is EU/EEA-departing, and it is not an EU/EEA-arriving flight on an EU/EEA carrier.',
      ],
      caveats: [],
    }
  }

  const amountBand = EU261_AMOUNTS[distanceBand]

  if (disruption === 'denied_boarding') {
    if (input.deniedBoardingVoluntary) {
      return {
        ...base,
        eligible: 'no',
        amountBand: null,
        headline: 'Voluntary bumping — no fixed statutory amount',
        reasoning: [
          'You said you volunteered to give up your seat. EU261 does not set a fixed compensation figure for voluntary bumping — whatever you agreed with the airline at the gate is the deal.',
          'If the airline did not honor what it verbally promised you, that is a contract dispute, not a regulatory compensation claim.',
        ],
        caveats: [],
      }
    }
    return {
      ...base,
      eligible: 'yes',
      amountBand,
      headline: `Likely eligible — ${amountBand} (involuntary denied boarding)`,
      reasoning: [
        `Involuntary denied boarding (being bumped against your will, usually due to overbooking) entitles you to the same fixed compensation as a cancellation: ${amountBand} for a ${DISTANCE_LABEL[distanceBand]} flight.`,
        'Unlike delays and cancellations, there is no "extraordinary circumstances" exemption for denied boarding — overbooking is always considered within the airline\'s control.',
      ],
      caveats: [
        'Compensation can be reduced by 50% if the airline re-routes you and you still arrive within a set number of hours of your original arrival time (Art. 7(2)).',
      ],
    }
  }

  if (disruption === 'cancelled') {
    const notice = input.cancellationNoticeDays
    if (notice !== null && notice >= 14) {
      return {
        ...base,
        eligible: 'no',
        amountBand: null,
        headline: '14+ days notice — no compensation owed',
        reasoning: [
          `You were told ${notice} days before departure. Under Art. 5(1)(c)(i), 14+ days' advance notice of a cancellation removes the right to compensation (though you still get a choice of refund, re-routing, or rebooking).`,
        ],
        caveats: [],
      }
    }
    if (input.extraordinaryCircumstances === 'yes') {
      return {
        ...base,
        eligible: 'no',
        amountBand: null,
        headline: 'Airline cited extraordinary circumstances',
        reasoning: [
          'You indicated the cancellation was caused by something like weather, air traffic control restrictions, a security risk, or a strike by airport/ATC staff.',
          'Under Art. 5(3), airlines are exempt from paying compensation for cancellations caused by genuinely extraordinary circumstances that could not have been avoided with reasonable measures.',
        ],
        caveats: [
          'Extraordinary circumstances are narrowly defined — the airline still has to prove it. If you are not certain the reason truly qualifies, it is still worth filing a claim.',
        ],
      }
    }
    const maybe = input.extraordinaryCircumstances === 'unsure'
    return {
      ...base,
      eligible: maybe ? 'maybe' : 'yes',
      amountBand,
      headline: maybe
        ? `Possibly eligible — up to ${amountBand} (depends on the reason given)`
        : `Likely eligible — ${amountBand} (cancellation, <14 days' notice)`,
      reasoning: [
        `You were given ${notice === null ? 'less than 14' : notice} days' notice, which is inside the window where compensation is normally owed.`,
        `A ${DISTANCE_LABEL[distanceBand]} flight falls into the ${amountBand} compensation tier under Art. 7.`,
        'Technical/mechanical faults and routine crew issues are generally NOT considered "extraordinary circumstances" by EU courts (Wallentin-Hermann) — airlines often wrongly deny claims citing them.',
      ],
      caveats: [
        'If you were re-booked and still arrived close to your original arrival time, compensation can be reduced or removed depending on the exact notice/rebooking window (Art. 5(1)(c)(ii)–(iii)).',
      ],
    }
  }

  // disruption === 'delay'
  const hours = input.delayHours ?? 0
  if (hours < 3) {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'Delay under 3 hours — no compensation',
      reasoning: [
        `You entered a ${hours}-hour arrival delay. EU case law (Sturgeon/Nelson) only extends Art. 7 cancellation-style compensation to delays of 3 hours or more at the final destination.`,
      ],
      caveats: ['You may still be owed EU261 "care" — meals, hotel, communication — for shorter delays. Ask the airline directly.'],
    }
  }
  if (input.extraordinaryCircumstances === 'yes') {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'Airline cited extraordinary circumstances',
      reasoning: [
        'You indicated the delay was caused by something like weather, ATC restrictions, a security risk, or a third-party strike outside the airline\'s control.',
        'Under Art. 5(3), that removes the right to compensation for the delay (assistance/care obligations still apply).',
      ],
      caveats: ['Technical/mechanical faults are usually NOT "extraordinary" (Wallentin-Hermann) — if that is the real reason, push back.'],
    }
  }
  const maybe = input.extraordinaryCircumstances === 'unsure'
  return {
    ...base,
    eligible: maybe ? 'maybe' : 'yes',
    amountBand,
    headline: maybe
      ? `Possibly eligible — up to ${amountBand} (depends on the reason given)`
      : `Likely eligible — ${amountBand} (delay of ${hours}h+)`,
    reasoning: [
      `A ${hours}-hour arrival delay clears the 3-hour compensation threshold.`,
      `A ${DISTANCE_LABEL[distanceBand]} flight falls into the ${amountBand} tier under Art. 7.`,
    ],
    caveats: ['Compensation only applies if the delay is NOT due to genuinely extraordinary circumstances (Art. 5(3)).'],
  }
}

// ─── UK261 (mirrors EU261 structure, GBP amounts, UK scope) ───────────────────
const UK261_AMOUNTS: Record<DistanceBand, string> = { short: '£220', medium: '£350', long: '£520' }

export function checkUK261(input: FlightComplaintInput): EligibilityResult {
  const { departureCountry, arrivalCountry, carrierRegion, distanceBand, disruption } = input
  const departureScope = isUk(departureCountry)
  const arrivalScope = isUk(arrivalCountry) && (carrierRegion === 'uk' || carrierRegion === 'eu_eea')
  const inScope = departureScope || arrivalScope

  const base = { regime: 'uk261' as const, regimeName: 'UK261 (UK CAA-enforced retained EU law)', inScope }

  if (!inScope) {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'UK261 does not apply to this flight',
      reasoning: [
        'UK261 covers flights departing a UK airport on any airline, or flights arriving in the UK operated by a UK or EU/EEA airline.',
        'Based on what you entered, this flight does not meet either condition.',
      ],
      caveats: [],
    }
  }

  const amountBand = UK261_AMOUNTS[distanceBand]

  if (disruption === 'denied_boarding') {
    if (input.deniedBoardingVoluntary) {
      return {
        ...base,
        eligible: 'no',
        amountBand: null,
        headline: 'Voluntary bumping — no fixed statutory amount',
        reasoning: [
          'You volunteered to give up your seat — UK261 does not fix a compensation figure for voluntary bumping, only for involuntary denied boarding.',
        ],
        caveats: [],
      }
    }
    return {
      ...base,
      eligible: 'yes',
      amountBand,
      headline: `Likely eligible — ${amountBand} (involuntary denied boarding)`,
      reasoning: [
        `Involuntary denied boarding entitles you to the same fixed compensation as a cancellation: ${amountBand} for a ${DISTANCE_LABEL[distanceBand]} flight.`,
        'There is no extraordinary-circumstances exemption for denied boarding.',
      ],
      caveats: ['Compensation can be reduced by 50% if you are re-routed and still arrive within a set number of hours of your original time.'],
    }
  }

  if (disruption === 'cancelled') {
    const notice = input.cancellationNoticeDays
    if (notice !== null && notice >= 14) {
      return {
        ...base,
        eligible: 'no',
        amountBand: null,
        headline: '14+ days notice — no compensation owed',
        reasoning: [`You were told ${notice} days before departure — 14+ days' notice removes the right to compensation under UK261.`],
        caveats: [],
      }
    }
    if (input.extraordinaryCircumstances === 'yes') {
      return {
        ...base,
        eligible: 'no',
        amountBand: null,
        headline: 'Airline cited extraordinary circumstances',
        reasoning: ['You indicated the cancellation was caused by genuinely extraordinary circumstances outside the airline\'s control, which is a valid exemption under UK261.'],
        caveats: ['Extraordinary circumstances are narrowly defined and the airline has to prove it.'],
      }
    }
    const maybe = input.extraordinaryCircumstances === 'unsure'
    return {
      ...base,
      eligible: maybe ? 'maybe' : 'yes',
      amountBand,
      headline: maybe ? `Possibly eligible — up to ${amountBand}` : `Likely eligible — ${amountBand} (cancellation, <14 days' notice)`,
      reasoning: [
        `You were given ${notice === null ? 'less than 14' : notice} days' notice.`,
        `A ${DISTANCE_LABEL[distanceBand]} flight falls into the ${amountBand} tier.`,
        'Technical/mechanical faults are generally NOT considered "extraordinary circumstances".',
      ],
      caveats: ['If re-booked close to your original arrival time, compensation can be reduced depending on the exact notice/rebooking window.'],
    }
  }

  // delay
  const hours = input.delayHours ?? 0
  if (hours < 3) {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'Delay under 3 hours — no compensation',
      reasoning: [`A ${hours}-hour delay is under the 3-hour threshold UK261 uses for compensation (mirrors EU case law).`],
      caveats: ['You may still be owed "care" (meals, hotel, communication) for shorter delays.'],
    }
  }
  if (input.extraordinaryCircumstances === 'yes') {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'Airline cited extraordinary circumstances',
      reasoning: ['You indicated the delay was caused by genuinely extraordinary circumstances, which is a valid exemption under UK261.'],
      caveats: ['Technical/mechanical faults are usually NOT "extraordinary" — if that is the real reason, push back.'],
    }
  }
  const maybe = input.extraordinaryCircumstances === 'unsure'
  return {
    ...base,
    eligible: maybe ? 'maybe' : 'yes',
    amountBand,
    headline: maybe ? `Possibly eligible — up to ${amountBand}` : `Likely eligible — ${amountBand} (delay of ${hours}h+)`,
    reasoning: [`A ${hours}-hour arrival delay clears the 3-hour threshold.`, `A ${DISTANCE_LABEL[distanceBand]} flight falls into the ${amountBand} tier.`],
    caveats: ['Only applies if the delay is not due to genuinely extraordinary circumstances.'],
  }
}

// ─── US DOT ────────────────────────────────────────────────────────────────────
function usDeniedBoardingAmount(hoursLate: number, domestic: boolean): string {
  if (domestic) {
    if (hoursLate < 1) return '$0 (arrived within 1 hour — no compensation owed)'
    if (hoursLate < 2) return '200% of one-way fare, capped at $1,075'
    return '400% of one-way fare, capped at $2,150'
  }
  if (hoursLate < 1) return '$0 (arrived within 1 hour — no compensation owed)'
  if (hoursLate < 4) return '200% of one-way fare, capped at $1,075'
  return '400% of one-way fare, capped at $2,150'
}

export function checkUSDOT(input: FlightComplaintInput): EligibilityResult {
  const { departureCountry, arrivalCountry, disruption } = input
  const inScope = isUs(departureCountry) || isUs(arrivalCountry)
  const domestic = isUs(departureCountry) && isUs(arrivalCountry)

  const base = { regime: 'us_dot' as const, regimeName: 'US DOT (14 CFR Part 250 / fly-rights)', inScope }

  if (!inScope) {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'US DOT rules do not apply to this flight',
      reasoning: ['US DOT oversales rules and refund rights apply to flights departing or arriving in the United States. Neither leg of this trip is a US flight.'],
      caveats: [],
    }
  }

  if (disruption === 'delay' || disruption === 'cancelled') {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'No federal cash-compensation mandate — refund right may still apply',
      reasoning: [
        'The US has NO federal law requiring airlines to pay cash compensation for a delayed or cancelled flight, regardless of the cause (including reasons within the airline\'s control).',
        'You DO have a right to a refund (not a fixed compensation amount) if the airline cancels or significantly changes your flight and you choose not to accept the rebooking offered.',
      ],
      caveats: ['Some airlines voluntarily offer travel credit/vouchers for controllable delays under their customer service commitments — that is a company policy, not a federal requirement.'],
    }
  }

  // denied_boarding
  if (input.deniedBoardingVoluntary) {
    return {
      ...base,
      eligible: 'no',
      amountBand: null,
      headline: 'Voluntary bumping — negotiated, not a fixed formula',
      reasoning: ['You volunteered to give up your seat. The compensation for voluntary bumping is whatever you negotiated with the gate agent — 14 CFR 250.5\'s fixed formula only applies to involuntary denied boarding.'],
      caveats: [],
    }
  }
  const hours = input.delayHours ?? 0
  const amountBand = usDeniedBoardingAmount(hours, domestic)
  const eligible: EligibilityResult['eligible'] = hours < 1 ? 'no' : 'yes'
  return {
    ...base,
    eligible,
    amountBand: hours < 1 ? null : amountBand,
    headline: eligible === 'yes'
      ? `Likely eligible — ${amountBand}`
      : 'Rerouted within 1 hour — no compensation owed',
    reasoning: [
      `You said you were bumped involuntarily and arrived at your final destination ${hours} hour(s) later than planned on a ${domestic ? 'domestic' : 'international'} itinerary.`,
      '14 CFR 250.5 sets a formula based on how late you actually arrive, not a flat figure — caps effective for travel on/after 2025-01-22 are $1,075 (200% of fare) and $2,150 (400% of fare).',
    ],
    caveats: ['The airline must also give you a written statement of your rights at the airport (14 CFR 250.9).'],
  }
}

export function evaluateFlightCompensation(input: FlightComplaintInput): {
  eu261: EligibilityResult
  uk261: EligibilityResult
  usDot: EligibilityResult
} {
  return {
    eu261: checkEU261(input),
    uk261: checkUK261(input),
    usDot: checkUSDOT(input),
  }
}

// ─── DIY complaint template (plain text, for the guide section) ───────────────
export interface ComplaintTemplateInput {
  airlineName: string
  departureCountry: string
  arrivalCountry: string
  flightDate: string
  disruption: DisruptionType
  delayHours: number | null
  passengerName?: string
}

export function buildComplaintTemplate(input: ComplaintTemplateInput): string {
  const { airlineName, departureCountry, arrivalCountry, flightDate, disruption, delayHours, passengerName } = input
  const who = passengerName?.trim() || '[Your name]'
  const airline = airlineName.trim() || '[Airline name]'
  const date = flightDate || '[Flight date]'
  const disruptionText =
    disruption === 'cancelled' ? 'was cancelled'
    : disruption === 'denied_boarding' ? 'involved my being denied boarding (bumped) involuntarily'
    : `arrived ${delayHours ?? '[X]'} hours late`

  return [
    `Subject: Compensation claim — flight ${date}, ${departureCountry} to ${arrivalCountry}`,
    '',
    `Dear ${airline} Customer Relations,`,
    '',
    `I am writing to request compensation under applicable air passenger rights regulation for my flight from ${departureCountry} to ${arrivalCountry} on ${date}, operated by ${airline}, which ${disruptionText}.`,
    '',
    'Please provide:',
    '1. Confirmation of the exact cause of the disruption and whether you consider it an "extraordinary circumstance".',
    '2. The compensation amount you calculate I am owed, and the basis for that figure.',
    '3. Your timeline for payment.',
    '',
    'If I do not receive a satisfactory response within a reasonable timeframe, I intend to escalate this complaint to the relevant national enforcement body / aviation authority.',
    '',
    'Regards,',
    who,
  ].join('\n')
}
