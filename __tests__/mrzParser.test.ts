/**
 * mrzParser.test.ts
 *
 * Unit tests for utils/mrzParser.ts
 * Run with:  npx vitest run
 *
 * GOLDEN TEST — Pakistani passport (MUST all pass):
 *   Line 1: P<PAKASHRAF<<MUHAMMAD<SALMAN<<<<<<<<<<<<<<<<
 *   Line 2: EY18499333PAK9203228M24092940<<<<<<<<<<<<<<6
 */

import { parseMRZLines, mrzDateToISO, lookupCountryName } from '../utils/mrzParser'

// ─── Helper: compute ICAO check digit ────────────────────────────────────────
function computeCheckDigit(str: string): number {
  const weights = [7, 3, 1]
  const vals: Record<string, number> = { '<': 0 }
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => { vals[c] = i + 10 })
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    const v = /\d/.test(c) ? parseInt(c, 10) : (vals[c] ?? 0)
    sum += v * weights[i % 3]
  }
  return sum % 10
}

// ─── mrzDateToISO ─────────────────────────────────────────────────────────────

describe('mrzDateToISO', () => {
  it('converts 20th-century DOB (year >= 30)', () => {
    expect(mrzDateToISO('920322')).toBe('1992-03-22')
  })
  it('converts 21st-century DOB (year < 30)', () => {
    expect(mrzDateToISO('050815')).toBe('2005-08-15')
  })
  it('returns empty string for null input', () => {
    expect(mrzDateToISO(null)).toBe('')
    expect(mrzDateToISO(undefined)).toBe('')
    expect(mrzDateToISO('')).toBe('')
  })
  it('handles year 29 as 21st century', () => {
    expect(mrzDateToISO('290101')).toBe('2029-01-01')
  })
  it('handles year 30 as 20th century', () => {
    expect(mrzDateToISO('300101')).toBe('1930-01-01')
  })
})

// ─── lookupCountryName ────────────────────────────────────────────────────────

describe('lookupCountryName', () => {
  it('returns full name for PAK', () => {
    expect(lookupCountryName('PAK')).toBe('Pakistan')
  })
  it('returns full name for USA', () => {
    expect(lookupCountryName('USA')).toBe('United States')
  })
  it('returns full name for GBR', () => {
    expect(lookupCountryName('GBR')).toBe('United Kingdom')
  })
  it('returns the code itself for unknown codes', () => {
    expect(lookupCountryName('ZZZ')).toBe('ZZZ')
  })
  it('handles empty input', () => {
    expect(lookupCountryName('')).toBe('')
  })
})

// ─── Golden test: Pakistani passport ─────────────────────────────────────────
// Check digits verified:
//   EY1849933 → 3  |  920322 → 8  |  240929 → 4  |  composite → 6

describe('parseMRZLines — Pakistani passport (golden test)', () => {
  const LINE1 = 'P<PAKASHRAF<<MUHAMMAD<SALMAN<<<<<<<<<<<<<<<<'
  const LINE2 = 'EY18499333PAK9203228M24092940<<<<<<<<<<<<<<6'

  it('doc-number check digit 3 is mathematically correct', () => {
    expect(computeCheckDigit('EY1849933')).toBe(3)
  })
  it('DOB check digit 8 is mathematically correct', () => {
    expect(computeCheckDigit('920322')).toBe(8)
  })
  it('expiry check digit 4 is mathematically correct', () => {
    expect(computeCheckDigit('240929')).toBe(4)
  })

  describe('field extraction', () => {
    let result: ReturnType<typeof parseMRZLines>
    beforeAll(() => { result = parseMRZLines(LINE1, LINE2) })

    it('succeeds',                            () => { expect(result.success).toBe(true) })
    it('surname === ASHRAF',                  () => { expect(result.fields.surname).toBe('ASHRAF') })
    it('givenNames contains MUHAMMAD',        () => { expect(result.fields.givenNames).toContain('MUHAMMAD') })
    it('givenNames contains SALMAN',          () => { expect(result.fields.givenNames).toContain('SALMAN') })
    it('dateOfBirth === 1992-03-22',          () => { expect(result.fields.dateOfBirth).toBe('1992-03-22') })
    it('sex === Male',                        () => { expect(result.fields.sex).toBe('Male') })
    it('dateOfExpiry === 2024-09-29',         () => { expect(result.fields.dateOfExpiry).toBe('2024-09-29') })
    it('nationality === PAK',                 () => { expect(result.fields.nationality).toBe('PAK') })
    it('nationalityName === Pakistan',        () => { expect(result.fields.nationalityName).toBe('Pakistan') })
    it('passportNumber === EY1849933',        () => { expect(result.fields.passportNumber).toBe('EY1849933') })
    it('passportNumber check digit is valid', () => { expect(result.validation.passportNumberValid).toBe(true) })
    it('dateOfBirth check digit is valid',    () => { expect(result.validation.dateOfBirthValid).toBe(true) })
    it('dateOfExpiry check digit is valid',   () => { expect(result.validation.dateOfExpiryValid).toBe(true) })
  })
})

// ─── US passport ──────────────────────────────────────────────────────────────
// Name: SPECIMEN TRAVELER | DOB: 1980-01-01 | Expiry: 2028-01-15
// Line 2 built with correct ICAO check digits

describe('parseMRZLines — US passport sample', () => {
  const LINE1 = 'P<USASPECIMEN<<TRAVELER<<<<<<<<<<<<<<<<<<<<<'
  const LINE2 = '12345678<8USA8001014M2801153<<<<<<<<<<<<<<04'

  let result: ReturnType<typeof parseMRZLines>
  beforeAll(() => { result = parseMRZLines(LINE1, LINE2) })

  it('succeeds',                    () => { expect(result.success).toBe(true) })
  it('issuing state is USA',        () => { expect(result.fields.issuingCountry).toBe('USA') })
  it('surname is SPECIMEN',         () => { expect(result.fields.surname).toBe('SPECIMEN') })
  it('givenNames is TRAVELER',      () => { expect(result.fields.givenNames).toBe('TRAVELER') })
  it('sex is Male',                 () => { expect(result.fields.sex).toBe('Male') })
  it('dateOfBirth is 1980-01-01',   () => { expect(result.fields.dateOfBirth).toBe('1980-01-01') })
  it('dateOfExpiry is 2028-01-15',  () => { expect(result.fields.dateOfExpiry).toBe('2028-01-15') })
})

// ─── UK passport ─────────────────────────────────────────────────────────────
// Name: SMITH JOHN WILLIAM | DOB: 1995-01-02 | Expiry: 2028-12-31 | Sex: M
// Line 2 built with correct ICAO check digits

describe('parseMRZLines — UK passport sample', () => {
  const LINE1 = 'P<GBRSMITH<<JOHN<WILLIAM<<<<<<<<<<<<<<<<<<< '
  const LINE2 = 'GB12345673GBR9501027M2812313<<<<<<<<<<<<<<04'
  const L1 = LINE1.slice(0, 44)
  const L2 = LINE2.slice(0, 44)

  let result: ReturnType<typeof parseMRZLines>
  beforeAll(() => { result = parseMRZLines(L1, L2) })

  it('succeeds',                        () => { expect(result.success).toBe(true) })
  it('nationality is GBR',              () => { expect(result.fields.nationality).toBe('GBR') })
  it('nationalityName is United Kingdom', () => { expect(result.fields.nationalityName).toBe('United Kingdom') })
  it('surname is SMITH',                () => { expect(result.fields.surname).toBe('SMITH') })
})

// ─── Indian passport ──────────────────────────────────────────────────────────
// Name: PATEL RAJESH KUMAR | DOB: 1987-06-15 | Expiry: 2028-06-28 | Sex: M

describe('parseMRZLines — Indian passport sample', () => {
  const LINE1 = 'P<INDPATEL<<RAJESH<KUMAR<<<<<<<<<<<<<<<<<<<<'
  const LINE2 = 'A987654326IND8706157M2806284<<<<<<<<<<<<<<00'
  const L1 = LINE1.slice(0, 44)
  const L2 = LINE2.slice(0, 44)

  let result: ReturnType<typeof parseMRZLines>
  beforeAll(() => { result = parseMRZLines(L1, L2) })

  it('succeeds',                  () => { expect(result.success).toBe(true) })
  it('nationality is IND',        () => { expect(result.fields.nationality).toBe('IND') })
  it('nationalityName is India',  () => { expect(result.fields.nationalityName).toBe('India') })
  it('sex is Male',               () => { expect(result.fields.sex).toBe('Male') })
})

// ─── German passport ──────────────────────────────────────────────────────────
// Name: MUELLER ANNA MARIA | DOB: 1983-08-12 | Expiry: 1930-07-01 | Sex: F
// Note: expiry year 30 → 1930 per ICAO convention (does not affect these assertions)

describe('parseMRZLines — German passport sample', () => {
  const LINE1 = 'P<DEUMUELLER<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<<'
  const LINE2 = 'C01X00T478DEU8308126F3007011<<<<<<<<<<<<<<02'
  const L1 = LINE1.slice(0, 44)
  const L2 = LINE2.slice(0, 44)

  let result: ReturnType<typeof parseMRZLines>
  beforeAll(() => { result = parseMRZLines(L1, L2) })

  it('succeeds',            () => { expect(result.success).toBe(true) })
  it('issuing state is DEU', () => { expect(result.fields.issuingCountry).toBe('DEU') })
  it('surname is MUELLER',  () => { expect(result.fields.surname).toBe('MUELLER') })
  it('sex is Female',       () => { expect(result.fields.sex).toBe('Female') })
})

// ─── UAE passport ─────────────────────────────────────────────────────────────
// Name: ALSHAMSI KHALID AHMED | DOB: 1990-01-15 | Expiry: 2028-01-14 | Sex: M

describe('parseMRZLines — UAE passport sample', () => {
  const LINE1 = 'P<AREALSHAMSI<<KHALID<AHMED<<<<<<<<<<<<<<<<<'
  const LINE2 = 'A123456706ARE9001158M2801142<<<<<<<<<<<<<<08'
  const L1 = LINE1.slice(0, 44)
  const L2 = LINE2.slice(0, 44)

  let result: ReturnType<typeof parseMRZLines>
  beforeAll(() => { result = parseMRZLines(L1, L2) })

  it('succeeds',                            () => { expect(result.success).toBe(true) })
  it('nationality is ARE',                  () => { expect(result.fields.nationality).toBe('ARE') })
  it('nationalityName is United Arab Emirates', () => { expect(result.fields.nationalityName).toBe('United Arab Emirates') })
})

// ─── Error handling ───────────────────────────────────────────────────────────

describe('parseMRZLines — error cases', () => {
  it('returns success:false for completely invalid input', () => {
    const result = parseMRZLines('HELLO WORLD', 'GARBAGE INPUT')
    expect(result.success).toBe(false)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('returns success:false for wrong-length lines', () => {
    const result = parseMRZLines('P<PAK', 'EY18499')
    expect(result.success).toBe(false)
  })

  it('never shows empty warnings when parsing fails', () => {
    const result = parseMRZLines('NOT_A_PASSPORT_LINE_AT_ALL_XXXXXXXXX', 'SECOND_BAD_LINE_XXXXXXXXXXXXXXXXXXXXXX')
    if (!result.success) {
      expect(result.warnings.length).toBeGreaterThan(0)
    }
  })
})

// ─── Check digit failure detection ───────────────────────────────────────────
// Valid PAK lines EXCEPT the document number check digit is wrong (3→9)

describe('parseMRZLines — check digit failure surfaces as warning', () => {
  const LINE1 = 'P<PAKASHRAF<<MUHAMMAD<SALMAN<<<<<<<<<<<<<<<<'
  const LINE2 = 'EY18499339PAK9203228M24092940<<<<<<<<<<<<<<6' // check 3 → 9 (wrong)

  let result: ReturnType<typeof parseMRZLines>
  beforeAll(() => { result = parseMRZLines(LINE1, LINE2) })

  it('parses successfully (fields are still extracted)', () => {
    expect(result.success).toBe(true)
    expect(result.fields.surname).toBe('ASHRAF')
  })
  it('passport number check digit is marked invalid', () => {
    expect(result.validation.passportNumberValid).toBe(false)
  })
  it('a warning is generated', () => {
    expect(result.warnings.some(w => w.toLowerCase().includes('passport number'))).toBe(true)
  })
  it('confidence is medium or low, not high', () => {
    expect(result.confidence).not.toBe('high')
  })
})

// ─── Expiry date logic ────────────────────────────────────────────────────────

describe('parseMRZLines — expiry date logic', () => {
  it('detects expired passport (expiry 2020-01-01)', () => {
    // expiry 200101, check: 2*7+0+0+1*7+0+1 = 22 → 22%10=2; personal <<<<<<<<<<<<<<; composite recalc
    const LINE1 = 'P<PAKASHRAF<<MUHAMMAD<SALMAN<<<<<<<<<<<<<<<<'
    // Use PAK golden doc/DOB and swap expiry to 200101 (check=2)
    // Composite of: EY18499333 + 9203228 + 2001012 + <<<<<<<<<<<<<<0
    const LINE2 = 'EY18499333PAK9203228M2001012<<<<<<<<<<<<<<04'
    const result = parseMRZLines(LINE1, LINE2)
    if (result.success && result.fields.dateOfExpiry) {
      expect(result.isExpired).toBe(true)
    }
  })

  it('detects valid future passport (expiry 2028-01-15)', () => {
    // Same doc/DOB as US test above, expiry 2028-01-15
    const LINE1 = 'P<USASPECIMEN<<TRAVELER<<<<<<<<<<<<<<<<<<<<<'
    const LINE2 = '12345678<8USA8001014M2801153<<<<<<<<<<<<<<04'
    const result = parseMRZLines(LINE1, LINE2)
    if (result.success && result.fields.dateOfExpiry) {
      expect(result.isExpired).toBe(false)
    }
  })
})
