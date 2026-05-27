/**
 * imagePreprocessor.ts
 * Pipeline: EXIF rotation → resize (max 2000px) → crop bottom 35% → grayscale → adaptive threshold
 * Pure Canvas 2D API — no opencv, no server, no dependencies.
 */

export interface PreprocessResult {
  canvas: HTMLCanvasElement;
  fullPreviewUrl: string;
  cropWidth: number;
  cropHeight: number;
}

export async function preprocessForMRZ(file: File): Promise<PreprocessResult> {
  const orientation    = await getExifOrientation(file);
  const corrected      = await loadAndCorrectRotation(file, orientation);
  const resized        = resizeCanvas(corrected, 2000);
  const fullPreviewUrl = resized.toDataURL('image/jpeg', 0.85);
  const cropped        = cropBottomPercent(resized, 0.35);
  toGrayscale(cropped);
  adaptiveThreshold(cropped, 21, 8);
  return { canvas: cropped, fullPreviewUrl, cropWidth: cropped.width, cropHeight: cropped.height };
}

async function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) return resolve(1);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      if (!buf || buf.byteLength < 12) return resolve(1);
      const view = new DataView(buf);
      if (view.getUint16(0) !== 0xFFD8) return resolve(1);
      let offset = 2;
      while (offset < view.byteLength - 2) {
        const marker = view.getUint16(offset);
        offset += 2;
        if (marker === 0xFFE1) {
          const exifHdr = view.getUint32(offset + 2);
          if (exifHdr !== 0x45786966) break;
          const tiffOffset   = offset + 8;
          const littleEndian = view.getUint16(tiffOffset) === 0x4949;
          const getU16 = (o: number) => view.getUint16(tiffOffset + o, littleEndian);
          const getU32 = (o: number) => view.getUint32(tiffOffset + o, littleEndian);
          const ifdOffset = getU32(4);
          const entries   = getU16(ifdOffset);
          for (let i = 0; i < entries; i++) {
            if (getU16(ifdOffset + 2 + i * 12) === 0x0112)
              return resolve(getU16(ifdOffset + 2 + i * 12 + 8));
          }
          break;
        } else if ((marker & 0xFF00) !== 0xFF00) break;
        else offset += view.getUint16(offset);
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

function loadAndCorrectRotation(file: File, orientation: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img    = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const { naturalWidth: w, naturalHeight: h } = img;
      const swapped = orientation >= 5 && orientation <= 8;
      const cw = swapped ? h : w;
      const ch = swapped ? w : h;
      const canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext('2d')!;
      ctx.save();
      switch (orientation) {
        case 2: ctx.transform(-1,0,0,1,cw,0);    break;
        case 3: ctx.transform(-1,0,0,-1,cw,ch);  break;
        case 4: ctx.transform(1,0,0,-1,0,ch);    break;
        case 5: ctx.transform(0,1,1,0,0,0);      break;
        case 6: ctx.transform(0,1,-1,0,ch,0);    break;
        case 7: ctx.transform(0,-1,-1,0,ch,cw);  break;
        case 8: ctx.transform(0,-1,1,0,0,cw);    break;
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      resolve(canvas);
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Failed to load image')); };
    img.src = objUrl;
  });
}

function resizeCanvas(src: HTMLCanvasElement, maxDim: number): HTMLCanvasElement {
  const { width: w, height: h } = src;
  if (w <= maxDim && h <= maxDim) return src;
  const scale = maxDim / Math.max(w, h);
  const nw = Math.round(w * scale), nh = Math.round(h * scale);
  const canvas = document.createElement('canvas');
  canvas.width = nw; canvas.height = nh;
  canvas.getContext('2d')!.drawImage(src, 0, 0, nw, nh);
  return canvas;
}

function cropBottomPercent(src: HTMLCanvasElement, fraction: number): HTMLCanvasElement {
  const { width: w, height: h } = src;
  const cropH  = Math.round(h * fraction);
  const startY = h - cropH;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = cropH;
  canvas.getContext('2d')!.drawImage(src, 0, startY, w, cropH, 0, 0, w, cropH);
  return canvas;
}

function toGrayscale(canvas: HTMLCanvasElement): void {
  const ctx  = canvas.getContext('2d')!;
  const imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgd.data;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = lum;
  }
  ctx.putImageData(imgd, 0, 0);
}

/**
 * Local-mean adaptive threshold using a summed-area table (O(1) per pixel).
 * Equivalent to cv.ADAPTIVE_THRESH_MEAN_C with blockSize×blockSize neighbourhood.
 */
function adaptiveThreshold(canvas: HTMLCanvasElement, blockSize = 21, C = 8): void {
  const ctx  = canvas.getContext('2d')!;
  const w    = canvas.width, h = canvas.height;
  const imgd = ctx.getImageData(0, 0, w, h);
  const data = imgd.data;
  const half = Math.floor(blockSize / 2);
  const sat  = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const lum = data[(y * w + x) * 4];
      sat[(y+1)*(w+1)+(x+1)] =
        lum + sat[y*(w+1)+(x+1)] + sat[(y+1)*(w+1)+x] - sat[y*(w+1)+x];
    }
  }
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x-half), y1 = Math.max(0, y-half);
      const x2 = Math.min(w-1, x+half), y2 = Math.min(h-1, y+half);
      const area = (x2-x1+1) * (y2-y1+1);
      const sum  = sat[(y2+1)*(w+1)+(x2+1)]
                 - sat[y1*(w+1)+(x2+1)]
                 - sat[(y2+1)*(w+1)+x1]
                 + sat[y1*(w+1)+x1];
      const bin  = data[(y*w+x)*4] > (sum/area - C) ? 255 : 0;
      const idx  = (y*w+x)*4;
      out[idx] = out[idx+1] = out[idx+2] = bin;
      out[idx+3] = 255;
    }
  }
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
}
