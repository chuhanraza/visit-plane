/**
 * Server-side blurhash → data URL. Decodes to a tiny raw pixel buffer and
 * wraps it in a hand-built BMP (uncompressed, trivial header — no canvas or
 * PNG encoder dependency needed for a 32×32 placeholder). Used as a CSS
 * background-image behind lazy-loaded destination photos so there's no
 * layout flash while the real image streams in.
 */
import { decode } from 'blurhash'

export function blurhashToDataUrl(hash: string, size = 32): string | null {
  try {
    const pixels = decode(hash, size, size)
    return rgbaToBmpDataUrl(pixels, size, size)
  } catch {
    return null
  }
}

function rgbaToBmpDataUrl(pixels: Uint8ClampedArray, width: number, height: number): string {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4
  const pixelArraySize = rowSize * height
  const fileSize = 54 + pixelArraySize
  const buf = Buffer.alloc(fileSize)

  buf.write('BM', 0)
  buf.writeUInt32LE(fileSize, 2)
  buf.writeUInt32LE(0, 6)
  buf.writeUInt32LE(54, 10)
  buf.writeUInt32LE(40, 14)
  buf.writeInt32LE(width, 18)
  buf.writeInt32LE(height, 22)
  buf.writeUInt16LE(1, 26)
  buf.writeUInt16LE(24, 28)
  buf.writeUInt32LE(0, 30)
  buf.writeUInt32LE(pixelArraySize, 34)
  buf.writeInt32LE(2835, 38)
  buf.writeInt32LE(2835, 42)
  buf.writeUInt32LE(0, 46)
  buf.writeUInt32LE(0, 50)

  let offset = 54
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      buf[offset++] = pixels[i + 2]
      buf[offset++] = pixels[i + 1]
      buf[offset++] = pixels[i]
    }
    offset += rowSize - width * 3
  }

  return `data:image/bmp;base64,${buf.toString('base64')}`
}
