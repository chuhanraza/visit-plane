import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

// Photo specs for each country (dimensions at 300 DPI)
const PHOTO_SPECS: Record<string, {
  width: number
  height: number
  maxKB: number
  bg: string
  dpi: number
  label: string
}> = {
  usa: {
    width: 600,   // 2x2 inch at 300dpi = 600x600px
    height: 600,
    maxKB: 240,
    bg: 'white',
    dpi: 300,
    label: '2×2 inch (51×51mm)',
  },
  uk: {
    width: 413,   // 35mm at 300dpi
    height: 531,  // 45mm at 300dpi
    maxKB: 10240,
    bg: 'white',
    dpi: 300,
    label: '35×45mm',
  },
  australia: {
    width: 413,
    height: 531,
    maxKB: 10240,
    bg: 'white',
    dpi: 300,
    label: '35×45mm',
  },
  canada: {
    width: 591,   // 50mm at 300dpi
    height: 827,  // 70mm at 300dpi
    maxKB: 4096,
    bg: 'white',
    dpi: 300,
    label: '50×70mm',
  },
  schengen: {
    width: 413,
    height: 531,
    maxKB: 50,
    bg: 'white',
    dpi: 300,
    label: '35×45mm',
  },
  saudi: {
    width: 472,   // 40mm at 300dpi
    height: 709,  // 60mm at 300dpi (≈ 566, use 709 for full 60mm)
    maxKB: 100,
    bg: 'white',
    dpi: 300,
    label: '40×60mm',
  },
  uae: {
    width: 472,
    height: 709,
    maxKB: 100,
    bg: 'white',
    dpi: 300,
    label: '40×60mm',
  },
  pakistan: {
    width: 413,
    height: 531,
    maxKB: 50,
    bg: 'white',
    dpi: 300,
    label: '35×45mm',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, country } = body

    if (!imageBase64 || !country) {
      return NextResponse.json({ error: 'Image and country are required' }, { status: 400 })
    }

    const spec = PHOTO_SPECS[country.toLowerCase()]
    if (!spec) {
      return NextResponse.json({ error: 'Unknown country specification' }, { status: 400 })
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const { width, height, maxKB, dpi } = spec

    // Process image with Sharp:
    // 1. Get original image metadata
    const metadata = await sharp(imageBuffer).metadata()
    const origW = metadata.width || width
    const origH = metadata.height || height

    // 2. Smart crop: take the top 80% of the image for face area
    //    (passport/visa photos usually have face in upper portion)
    const cropHeight = Math.min(origH, Math.round(origW * (height / width) * 1.2))
    const cropTop = Math.max(0, Math.round(origH * 0.05)) // slight top offset

    // 3. Process: flatten to white bg, resize with cover, add white padding
    let processed = sharp(imageBuffer)
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // remove transparency → white
      .extract({
        left: 0,
        top: cropTop,
        width: origW,
        height: Math.min(cropHeight, origH - cropTop),
      })
      .resize(width, height, {
        fit: 'cover',
        position: 'top',       // face tends to be at top of photo
        background: { r: 255, g: 255, b: 255 },
      })

    // 4. Convert to JPEG, optimize to fit within maxKB
    let quality = 95
    let outputBuffer: Buffer
    let sizeKB: number

    // Iteratively reduce quality to meet size constraint
    do {
      outputBuffer = await processed
        .clone()
        .withMetadata({ density: dpi })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer()

      sizeKB = Math.round(outputBuffer.length / 1024)
      quality -= 5
    } while (sizeKB > maxKB && quality > 20)

    // If still too large (very strict specs like schengen 50KB), resize smaller
    if (sizeKB > maxKB) {
      const scale = Math.sqrt(maxKB / sizeKB)
      const newW = Math.round(width * scale)
      const newH = Math.round(height * scale)
      outputBuffer = await sharp(imageBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize(newW, newH, {
          fit: 'cover',
          position: 'top',
          background: { r: 255, g: 255, b: 255 },
        })
        .withMetadata({ density: dpi })
        .jpeg({ quality: 70, mozjpeg: true })
        .toBuffer()
      sizeKB = Math.round(outputBuffer.length / 1024)
    }

    const resultBase64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`

    return NextResponse.json({
      imageBase64: resultBase64,
      spec: spec.label,
      sizeKB,
      dpi: spec.dpi,
      width,
      height,
      withinLimit: sizeKB <= maxKB,
      maxKB,
    })

  } catch (error) {
    console.error('Photo processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process photo. Please try again.' },
      { status: 500 }
    )
  }
}
