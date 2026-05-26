/**
 * mrzExtractor.ts
 *
 * Tesseract.js OCR wrapper for MRZ extraction.
 * Character whitelist enforces ICAO 9303 character set: A-Z, 0-9, <
 * Numeric-field OCR substitution corrections applied ONLY at known digit positions.
 */

export interface MRZExtractResult {
  lines: [string, string] | null;
  confidence: number;
  rawOcr: string;
  error?: string;
}

export type ProgressCallback = (percent: number, status: string) => void;

// ICAO TD3 line 2 positions that MUST be digits — substitution applied only here
const NUMERIC_POS_LINE2 = new Set<number>([
  9,                                    // doc-number check digit
  13,14,15,16,17,18,                    // DOB (YYMMDD)
  19,                                   // DOB check digit
  21,22,23,24,25,26,                    // expiry (YYMMDD)
  27,                                   // expiry check digit
  42,                                   // personal-number check digit
  43,                                   // composite check digit
]);

export async function extractMRZLines(
  canvas: HTMLCanvasElement,
  onProgress?: ProgressCallback,
  maxRetries = 2,
): Promise<MRZExtractResult> {
  let last: MRZExtractResult = { lines: null, confidence: 0, rawOcr: '', error: 'OCR did not run' };
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    onProgress?.(attempt * 5, `OCR attempt ${attempt + 1}…`);
    const result = await runTesseract(canvas, (pct, status) => {
      const base  = attempt * (85 / maxRetries);
      const slice = 85 / maxRetries;
      onProgress?.(Math.round(base + pct * slice), status);
    });
    last = result;
    if (result.lines !== null) { onProgress?.(95, 'Validating…'); return result; }
  }
  onProgress?.(100, 'Done');
  return last;
}

async function runTesseract(canvas: HTMLCanvasElement, onProgress: ProgressCallback): Promise<MRZExtractResult> {
  const { createWorker, PSM } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text')
        onProgress(Math.round(m.progress * 100), 'Reading MRZ characters…');
      else
        onProgress(0, m.status);
    },
  });
  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '0',
    });
    const { data } = await worker.recognize(canvas);
    const lines    = postProcessOcr(data.text);
    return {
      lines,
      confidence: Math.round(data.confidence),
      rawOcr: data.text,
      error: lines ? undefined : buildError(data.text),
    };
  } finally {
    await worker.terminate();
  }
}

function postProcessOcr(raw: string): [string, string] | null {
  const segments = raw
    .split(/[\n\r]+/)
    .map(l => l.replace(/\s+/g, '').toUpperCase())
    .filter(l => /^[A-Z0-9<]{30,}$/.test(l));

  if (segments.length < 2) return null;
  segments.sort((a, b) => b.length - a.length);

  let line1: string | null = null, line2: string | null = null;
  for (let i = 0; i < segments.length && !line1; i++) {
    for (let j = i + 1; j < segments.length && !line2; j++) {
      if (/^[A-Z]/.test(segments[i]) && /^[A-Z0-9]/.test(segments[j])) {
        line1 = segments[i]; line2 = segments[j];
      }
    }
  }
  if (!line1 || !line2) { line1 = segments[0]; line2 = segments[1]; }

  line1 = norm(line1!, 44);
  line2 = norm(correctNumeric(norm(line2!, 44)), 44);

  return /^[A-Z0-9<]{44}$/.test(line1) && /^[A-Z0-9<]{44}$/.test(line2)
    ? [line1, line2]
    : null;
}

function norm(s: string, len: number): string {
  return s.length > len ? s.slice(0, len) : s.padEnd(len, '<');
}

function correctNumeric(line2: string): string {
  const c = line2.split('');
  const fix = (pos: number) => { c[pos] = subDigit(c[pos]); };
  NUMERIC_POS_LINE2.forEach(p => p < c.length && fix(p));
  // Also fix every character in DOB + expiry zones
  for (let i = 13; i <= 27; i++) { if (i !== 20 && i < c.length) c[i] = subDigit(c[i]); }
  return c.join('');
}

function subDigit(ch: string): string {
  const map: Record<string, string> = { O:'0', Q:'0', I:'1', L:'1', Z:'2', S:'5', G:'6', B:'8' };
  return map[ch] ?? ch;
}

function buildError(raw: string): string {
  const n = raw.split(/[\n\r]+/).filter(l => l.replace(/\s/g,'').length >= 10).length;
  if (n === 0) return 'No text detected. Ensure the bottom of the passport (MRZ strip) is clearly visible.';
  if (n === 1) return 'Only one MRZ line detected. Ensure both bottom lines are fully in frame.';
  return 'MRZ lines detected but could not be validated to 44 characters each. Try better lighting or higher resolution.';
}
