import { NextRequest, NextResponse } from 'next/server'

// MRZ parsing logic - manual implementation for TD3 passport format
// TD3: Two lines of 44 characters each
function parseMRZLine1(line: string) {
  // P<COUNTRY<SURNAME<<GIVEN<NAMES<<<<<<<<<<<<<<<<
  const documentType = line[0]
  const country = line.slice(2, 5).replace(/</g, '')
  const nameSection = line.slice(5, 44)
  const nameParts = nameSection.split('<<')
  const surname = nameParts[0]?.replace(/</g, ' ').trim() || ''
  const givenNames = nameParts.slice(1).join(' ').replace(/</g, ' ').trim() || ''
  return { documentType, country, surname, givenNames }
}

function parseMRZLine2(line: string) {
  // Passport number (9) + check + nationality (3) + DOB (6) + check + sex (1) + expiry (6) + check + personal (14) + check + composite check
  const passportNumber = line.slice(0, 9).replace(/</g, '')
  const nationality = line.slice(10, 13).replace(/</g, '')
  const dobRaw = line.slice(13, 19)
  const sex = line[20] === 'M' ? 'M' : line[20] === 'F' ? 'F' : 'X'
  const expiryRaw = line.slice(21, 27)

  // Parse dates (YYMMDD)
  const parseDate = (yymmdd: string): string => {
    if (!yymmdd || yymmdd.length !== 6) return ''
    const yy = parseInt(yymmdd.slice(0, 2))
    const mm = parseInt(yymmdd.slice(2, 4))
    const dd = parseInt(yymmdd.slice(4, 6))
    // Determine century: if yy > 30, assume 1900s, else 2000s
    const year = yy > 30 ? 1900 + yy : 2000 + yy
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${String(dd).padStart(2,'0')} ${months[mm-1]} ${year}`
  }

  return {
    passportNumber,
    nationality,
    dateOfBirth: parseDate(dobRaw),
    dateOfBirthRaw: dobRaw,
    expiryDate: parseDate(expiryRaw),
    expiryDateRaw: expiryRaw,
    gender: sex,
  }
}

const NATIONALITY_MAP: Record<string, string> = {
  PAK: 'Pakistan', IND: 'India', USA: 'United States', GBR: 'United Kingdom',
  ARE: 'UAE', SAU: 'Saudi Arabia', CAN: 'Canada', AUS: 'Australia',
  DEU: 'Germany', FRA: 'France', TUR: 'Turkey', JPN: 'Japan',
  CHN: 'China', NGA: 'Nigeria', BGD: 'Bangladesh', PHL: 'Philippines',
  MEX: 'Mexico', EGY: 'Egypt', IDN: 'Indonesia', MYS: 'Malaysia',
  SGP: 'Singapore', THA: 'Thailand', ITA: 'Italy', ESP: 'Spain',
  NLD: 'Netherlands', SWE: 'Sweden', NOR: 'Norway', DNK: 'Denmark',
  CHE: 'Switzerland', NZL: 'New Zealand', ZAF: 'South Africa',
  BRA: 'Brazil', ARG: 'Argentina', RUS: 'Russia', KOR: 'South Korea',
  PRT: 'Portugal', POL: 'Poland', GRC: 'Greece', IRL: 'Ireland',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Import Tesseract.js dynamically
    const Tesseract = await import('tesseract.js')

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Run OCR with Tesseract - optimized for MRZ (monospace, uppercase)
    const { data: { text } } = await Tesseract.default.recognize(
      imageBuffer,
      'eng',
      {
        // MRZ-optimized settings
      }
    )

    // Extract MRZ lines from OCR text
    // MRZ lines are 44 chars long, contain only: A-Z, 0-9, <
    const lines = text
      .split('\n')
      .map((l: string) => l.replace(/[^A-Z0-9<]/g, '').trim())
      .filter((l: string) => l.length >= 30) // MRZ lines are 44 chars, be lenient

    // Find TD3 passport MRZ (two lines of 44 chars starting with P)
    let mrz1 = ''
    let mrz2 = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Line 1 starts with P< or P followed by country code
      if ((line.startsWith('P<') || line.startsWith('P') && line.length >= 44) && i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        if (nextLine.length >= 30) {
          mrz1 = line.slice(0, 44).padEnd(44, '<')
          mrz2 = nextLine.slice(0, 44).padEnd(44, '<')
          break
        }
      }
    }

    if (!mrz1 || !mrz2) {
      // Try mrz package as fallback
      try {
        const { parse } = await import('mrz')
        // Find any two consecutive 44-char lines
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].length >= 30 && lines[i + 1].length >= 30) {
            const l1 = lines[i].slice(0, 44).padEnd(44, '<')
            const l2 = lines[i + 1].slice(0, 44).padEnd(44, '<')
            try {
              const result = parse([l1, l2])
              if (result.valid) {
                mrz1 = l1
                mrz2 = l2
                break
              }
            } catch {
              continue
            }
          }
        }
      } catch {
        // mrz package not available
      }
    }

    if (!mrz1 || !mrz2) {
      return NextResponse.json({
        error: 'Could not detect MRZ lines in image. Please ensure the passport data page is clearly visible and well-lit.',
        rawText: text.slice(0, 500),
      }, { status: 422 })
    }

    // Parse MRZ lines
    const line1Data = parseMRZLine1(mrz1)
    const line2Data = parseMRZLine2(mrz2)

    const nationalityCode = line2Data.nationality || line1Data.country
    const nationalityName = NATIONALITY_MAP[nationalityCode] || nationalityCode

    const response = {
      surname: line1Data.surname,
      givenNames: line1Data.givenNames,
      fullName: `${line1Data.givenNames} ${line1Data.surname}`.trim(),
      nationality: nationalityName,
      nationalityCode,
      passportNumber: line2Data.passportNumber,
      dateOfBirth: line2Data.dateOfBirth,
      expiryDate: line2Data.expiryDate,
      gender: line2Data.gender === 'M' ? 'Male' : line2Data.gender === 'F' ? 'Female' : 'Other',
      mrz1,
      mrz2,
      documentType: line1Data.documentType,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Passport scan error:', error)
    return NextResponse.json(
      { error: 'Failed to process passport image. Please try again.' },
      { status: 500 }
    )
  }
}
