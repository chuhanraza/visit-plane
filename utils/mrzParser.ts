/**
 * mrzParser.ts
 * Wraps the `mrz` npm library (v5). Produces a fully structured, validated result.
 * DO NOT write a custom parser — mrz handles all TD1/TD2/TD3 edge-cases correctly.
 */

import { parse } from 'mrz';

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

// ── Main parser ─────────────────────────────────────────────────────────────
export function parseMRZLines(line1: string, line2: string): MRZParseResult {
  const emptyFields: PassportFields = {
    surname:'', givenNames:'', fullName:'', passportNumber:'',
    nationality:'', nationalityName:'', issuingCountry:'', issuingCountryName:'',
    dateOfBirth:'', dateOfExpiry:'', sex:'', personalNumber:'',
  };
  const emptyVal: ValidationResult = {
    passportNumberValid:false, dateOfBirthValid:false, dateOfExpiryValid:false,
    personalNumberValid:false, compositeValid:false, overallValid:false,
  };

  try {
    const result = parse([line1, line2]);
    const f      = result.fields;

    const surname    = f.lastName  ?? '';
    const givenNames = f.firstName ?? '';
    const dateOfBirth  = mrzDateToISO(f.birthDate);
    const dateOfExpiry = mrzDateToISO(f.expirationDate);

    const fields: PassportFields = {
      surname, givenNames,
      fullName: [givenNames, surname].filter(Boolean).join(' '),
      passportNumber:     f.documentNumber ?? '',
      nationality:        f.nationality    ?? '',
      nationalityName:    lookupCountryName(f.nationality ?? ''),
      issuingCountry:     f.issuingState   ?? '',
      issuingCountryName: lookupCountryName(f.issuingState ?? ''),
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
