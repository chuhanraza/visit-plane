/**
 * mrzParser.ts
 * Wraps the `mrz` npm library (v5) for check-digit validation and line-2 fields,
 * with the ICAO 9303 name field parsed directly from its fixed position:
 * PRIMARY (surname) << SECONDARY (given names), single "<" = component
 * separator, trailing "<" = filler. The library nulls out fields it cannot
 * validate (e.g. specimen issuer "UTO"), so issuer/nationality fall back to
 * the raw positional slice when that happens.
 *
 * Callers MUST pass MRZ lines in document order (line 1 first). As defense in
 * depth, 2-line input is re-ordered structurally before parsing — see
 * orderMRZLines below.
 */

import { parse } from 'mrz';

export type MRZFormat = 'TD3' | 'TD2' | 'TD1' | 'UNKNOWN';

export interface PassportFields {
  surname: string;
  givenNames: string;
  fullName: string;
  passportNumber: string;
  nationality: string;
  nationalityName: string;
  issuingCountry: string;
  issuingCountryName: string;
  dateOfBirth: string;   // YYYY-MM-DD
  dateOfExpiry: string;  // YYYY-MM-DD
  sex: string;           // 'Male' | 'Female' | 'Unspecified'
  personalNumber: string;
}

export interface ValidationResult {
  passportNumberValid: boolean;
  dateOfBirthValid: boolean;
  dateOfExpiryValid: boolean;
  personalNumberValid: boolean;
  compositeValid: boolean;
  overallValid: boolean;
}

export interface MRZParseResult {
  success: boolean;
  confidence: 'high' | 'medium' | 'low';
  fields: PassportFields;
  validation: ValidationResult;
  warnings: string[];
  daysUntilExpiry: number | null;
  isExpired: boolean;
  expiresWithinSixMonths: boolean;
}

// ── Country lookup ──────────────────────────────────────────────────────────
const COUNTRIES: Record<string, string> = {
  AFG:'Afghanistan', ALB:'Albania', DZA:'Algeria', AND:'Andorra', AGO:'Angola',
  ARG:'Argentina', ARM:'Armenia', AUS:'Australia', AUT:'Austria', AZE:'Azerbaijan',
  BHS:'Bahamas', BHR:'Bahrain', BGD:'Bangladesh', BLR:'Belarus', BEL:'Belgium',
  BLZ:'Belize', BEN:'Benin', BTN:'Bhutan', BOL:'Bolivia', BIH:'Bosnia & Herzegovina',
  BWA:'Botswana', BRA:'Brazil', BRN:'Brunei', BGR:'Bulgaria', BFA:'Burkina Faso',
  BDI:'Burundi', CPV:'Cabo Verde', KHM:'Cambodia', CMR:'Cameroon', CAN:'Canada',
  CAF:'Central African Republic', TCD:'Chad', CHL:'Chile', CHN:'China',
  COL:'Colombia', COM:'Comoros', COD:'DR Congo', COG:'Republic of Congo',
  CRI:'Costa Rica', CIV:"Côte d'Ivoire", HRV:'Croatia', CUB:'Cuba',
  CYP:'Cyprus', CZE:'Czech Republic', DNK:'Denmark', DJI:'Djibouti',
  DOM:'Dominican Republic', ECU:'Ecuador', EGY:'Egypt', SLV:'El Salvador',
  GNQ:'Equatorial Guinea', ERI:'Eritrea', EST:'Estonia', SWZ:'Eswatini',
  ETH:'Ethiopia', FJI:'Fiji', FIN:'Finland', FRA:'France', GAB:'Gabon',
  GMB:'Gambia', GEO:'Georgia', DEU:'Germany', GHA:'Ghana', GRC:'Greece',
  GTM:'Guatemala', GIN:'Guinea', GNB:'Guinea-Bissau', GUY:'Guyana',
  HTI:'Haiti', HND:'Honduras', HUN:'Hungary', ISL:'Iceland', IND:'India',
  IDN:'Indonesia', IRN:'Iran', IRQ:'Iraq', IRL:'Ireland', ISR:'Israel',
  ITA:'Italy', JAM:'Jamaica', JPN:'Japan', JOR:'Jordan', KAZ:'Kazakhstan',
  KEN:'Kenya', PRK:'North Korea', KOR:'South Korea', KWT:'Kuwait',
  KGZ:'Kyrgyzstan', LAO:'Laos', LVA:'Latvia', LBN:'Lebanon', LSO:'Lesotho',
  LBR:'Liberia', LBY:'Libya', LIE:'Liechtenstein', LTU:'Lithuania',
  LUX:'Luxembourg', MDG:'Madagascar', MWI:'Malawi', MYS:'Malaysia',
  MDV:'Maldives', MLI:'Mali', MLT:'Malta', MRT:'Mauritania', MUS:'Mauritius',
  MEX:'Mexico', MDA:'Moldova', MCO:'Monaco', MNG:'Mongolia', MNE:'Montenegro',
  MAR:'Morocco', MOZ:'Mozambique', MMR:'Myanmar', NAM:'Namibia', NPL:'Nepal',
  NLD:'Netherlands', NZL:'New Zealand', NIC:'Nicaragua', NER:'Niger',
  NGA:'Nigeria', MKD:'North Macedonia', NOR:'Norway', OMN:'Oman',
  PAK:'Pakistan', PSE:'Palestine', PAN:'Panama', PNG:'Papua New Guinea',
  PRY:'Paraguay', PER:'Peru', PHL:'Philippines', POL:'Poland', PRT:'Portugal',
  QAT:'Qatar', ROU:'Romania', RUS:'Russia', RWA:'Rwanda', SAU:'Saudi Arabia',
  SEN:'Senegal', SRB:'Serbia', SLE:'Sierra Leone', SGP:'Singapore',
  SVK:'Slovakia', SVN:'Slovenia', SOM:'Somalia', ZAF:'South Africa',
  SSD:'South Sudan', ESP:'Spain', LKA:'Sri Lanka', SDN:'Sudan',
  SUR:'Suriname', SWE:'Sweden', CHE:'Switzerland', SYR:'Syria',
  TWN:'Taiwan', TJK:'Tajikistan', TZA:'Tanzania', THA:'Thailand',
  TLS:'Timor-Leste', TGO:'Togo', TTO:'Trinidad & Tobago', TUN:'Tunisia',
  TUR:'Turkey', TKM:'Turkmenistan', UGA:'Uganda', UKR:'Ukraine',
  ARE:'United Arab Emirates', GBR:'United Kingdom', USA:'United States',
  URY:'Uruguay', UZB:'Uzbekistan', VEN:'Venezuela', VNM:'Vietnam',
  YEM:'Yemen', ZMB:'Zambia', ZWE:'Zimbabwe',
  UTO:'Utopia (Specimen)', XXA:'Stateless', XXB:'Refugee',
  XXC:'Refugee (other)', XXX:'Unspecified nationality', D:'Germany',
};

export function lookupCountryName(code: string): string {
  if (!code) return '';
  return COUNTRIES[code.toUpperCase()] ?? code;
}

// ── Date helpers ────────────────────────────────────────────────────────────
export function mrzDateToISO(yymmdd: string | null | undefined): string {
  if (!yymmdd || yymmdd.length !== 6) return '';
  const yy   = parseInt(yymmdd.slice(0, 2), 10);
  const yyyy = yy >= 30 ? `19${yymmdd.slice(0,2)}` : `20${yymmdd.slice(0,2)}`;
  return `${yyyy}-${yymmdd.slice(2,4)}-${yymmdd.slice(4,6)}`;
}

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.floor((d.getTime() - today.getTime()) / 86_400_000);
}

function normSex(raw: string | null | undefined): string {
  switch ((raw ?? '').toLowerCase()) {
    case 'male':   return 'Male';
    case 'female': return 'Female';
    default:       return 'Unspecified';
  }
}

// ── ICAO 9303 structure helpers ─────────────────────────────────────────────
export function detectMRZFormat(lines: string[]): MRZFormat {
  if (lines.length === 2 && lines.every(l => l.length === 44)) return 'TD3';
  if (lines.length === 2 && lines.every(l => l.length === 36)) return 'TD2';
  if (lines.length === 3 && lines.every(l => l.length === 30)) return 'TD1';
  return 'UNKNOWN';
}

/**
 * ICAO 9303 name field: PRIMARY IDENTIFIER (surname) first, then "<<", then
 * SECONDARY IDENTIFIER (given names). A single "<" separates components
 * within each identifier; trailing "<" is filler. The surname is ALWAYS the
 * part before the first "<<" — never swap, regardless of how the country
 * prints the name on the visual page.
 */
export function parseNameField(nameField: string): { surname: string; givenNames: string } {
  const field = nameField.replace(/<+\s*$/, '');
  const sep = field.indexOf('<<');
  const primary   = sep === -1 ? field : field.slice(0, sep);
  const secondary = sep === -1 ? ''    : field.slice(sep + 2);
  const toWords = (s: string) => s.split('<').filter(Boolean).join(' ').trim();
  return { surname: toWords(primary), givenNames: toWords(secondary) };
}

/**
 * Restore document order for a 2-line MRZ (TD3/TD2). Line 1 is alphabetic
 * (doc code + issuer + name); line 2 carries the digit-heavy block (document
 * number, YYMMDD dates, check digits — 8+ digits on any real document), so
 * the line with fewer digits is line 1. OCR output order and line length are
 * NOT reliable signals and must never be used for this.
 */
export function orderMRZLines(a: string, b: string): [string, string] {
  const digits = (s: string) => (s.match(/[0-9]/g) ?? []).length;
  const da = digits(a), db = digits(b);
  if (da !== db) return da < db ? [a, b] : [b, a];
  // Tie-break: line 1 of a passport starts with the doc code + filler ("P<").
  if (/^[A-Z]</.test(b) && !/^[A-Z]</.test(a)) return [b, a];
  return [a, b];
}

function nameFieldFor(lines: string[], format: MRZFormat): string {
  switch (format) {
    case 'TD1': return lines[2] ?? '';               // TD1: full line 3
    case 'TD2': return (lines[0] ?? '').slice(5, 36); // TD2: line 1, pos 6-36
    default:    return (lines[0] ?? '').slice(5, 44); // TD3: line 1, pos 6-44
  }
}

function nationalityFor(lines: string[], format: MRZFormat): string {
  const raw = format === 'TD1'
    ? (lines[1] ?? '').slice(15, 18)  // TD1: line 2, pos 16-18
    : (lines[1] ?? '').slice(10, 13); // TD2/TD3: line 2, pos 11-13
  return raw.replace(/</g, '');
}

// ── Main parser ─────────────────────────────────────────────────────────────
// TD3 passports pass 2 lines; TD1 ID cards may pass a third line.
export function parseMRZLines(line1: string, line2: string, line3?: string): MRZParseResult {
  const emptyFields: PassportFields = {
    surname:'', givenNames:'', fullName:'', passportNumber:'',
    nationality:'', nationalityName:'', issuingCountry:'', issuingCountryName:'',
    dateOfBirth:'', dateOfExpiry:'', sex:'', personalNumber:'',
  };
  const emptyVal: ValidationResult = {
    passportNumberValid:false, dateOfBirthValid:false, dateOfExpiryValid:false,
    personalNumberValid:false, compositeValid:false, overallValid:false,
  };

  const lines = line3 !== undefined
    ? [line1, line2, line3]
    : orderMRZLines(line1, line2);
  const format = detectMRZFormat(lines);

  try {
    const result = parse(lines);
    const f      = result.fields;

    // Name field parsed directly per ICAO 9303 from its fixed position;
    // library result only as fallback (it nulls names it cannot validate).
    const icaoName   = parseNameField(nameFieldFor(lines, format));
    const surname    = icaoName.surname    || (f.lastName  ?? '');
    const givenNames = icaoName.givenNames || (f.firstName ?? '');
    const dateOfBirth  = mrzDateToISO(f.birthDate);
    const dateOfExpiry = mrzDateToISO(f.expirationDate);

    // Library nulls issuer/nationality codes outside its ISO table (e.g.
    // specimen "UTO") — fall back to the raw positional slice.
    const issuingCountry = f.issuingState ?? lines[0].slice(2, 5).replace(/</g, '');
    const nationality    = f.nationality  ?? nationalityFor(lines, format);

    const fields: PassportFields = {
      surname, givenNames,
      fullName: [givenNames, surname].filter(Boolean).join(' '),
      passportNumber:     f.documentNumber ?? '',
      nationality,
      nationalityName:    lookupCountryName(nationality),
      issuingCountry,
      issuingCountryName: lookupCountryName(issuingCountry),
      dateOfBirth, dateOfExpiry,
      sex:            normSex(f.sex),
      personalNumber: f.personalNumber ?? '',
    };

    const find = (field: string) => result.details.find(d => d.field === field);
    const validation: ValidationResult = {
      passportNumberValid: find('documentNumberCheckDigit')?.valid  ?? false,
      dateOfBirthValid:    find('birthDateCheckDigit')?.valid       ?? false,
      dateOfExpiryValid:   find('expirationDateCheckDigit')?.valid  ?? false,
      personalNumberValid: find('personalNumberCheckDigit')?.valid  ?? true,
      compositeValid:      find('compositeCheckDigit')?.valid       ?? false,
      overallValid:        result.valid,
    };

    const warnings: string[] = [];
    if (!validation.passportNumberValid) warnings.push('Passport number check digit failed — verify number manually.');
    if (!validation.dateOfBirthValid)    warnings.push('Date of birth check digit failed — verify DOB manually.');
    if (!validation.dateOfExpiryValid)   warnings.push('Expiry date check digit failed — verify expiry manually.');
    if (!validation.compositeValid)      warnings.push('Overall MRZ composite check digit failed — verify all fields.');

    const failCount = [
      !validation.passportNumberValid,
      !validation.dateOfBirthValid,
      !validation.dateOfExpiryValid,
      !validation.compositeValid,
    ].filter(Boolean).length;

    const confidence: 'high' | 'medium' | 'low' =
      failCount === 0 ? 'high' : failCount <= 1 ? 'medium' : 'low';

    const days = daysUntil(dateOfExpiry);
    return {
      success: true, confidence, fields, validation, warnings,
      daysUntilExpiry: days,
      isExpired: days !== null && days < 0,
      expiresWithinSixMonths: days !== null && days >= 0 && days < 180,
    };
  } catch (err) {
    return {
      success: false, confidence: 'low', fields: emptyFields, validation: emptyVal,
      warnings: [`MRZ parse error: ${err instanceof Error ? err.message : String(err)}`],
      daysUntilExpiry: null, isExpired: false, expiresWithinSixMonths: false,
    };
  }
}
