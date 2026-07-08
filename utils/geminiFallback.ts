/**
 * geminiFallback.ts
 * Optional cloud-assisted MRZ extraction via Gemini Flash (free tier).
 * NEVER called automatically — requires explicit user consent.
 */

import { orderMRZLines } from './mrzParser';

export const GEMINI_CONSENT_PROMPT =
  'Your passport image could not be read locally. To try a cloud-assisted scan, ' +
  'we need to send your passport image securely to Google\'s Gemini AI service. ' +
  'The image is transmitted over HTTPS and is not stored by Google after processing. ' +
  'Do you consent to this?';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const MRZ_PROMPT =
  'This is a passport data page. Extract ONLY the two-line Machine Readable Zone (MRZ) ' +
  'at the very bottom. Each line is exactly 44 characters: uppercase A-Z, digits 0-9, and < only. ' +
  'Return EXACTLY two raw lines of text, nothing else — no explanation, no formatting, no JSON. ' +
  'If the MRZ is not clearly visible, return only: MRZ_NOT_VISIBLE';

export type GeminiResult =
  | { success: true;  lines: [string, string] }
  | { success: false; error: string };

export async function extractMRZWithGemini(
  imageBase64: string,
  apiKey: string,
  mimeType = 'image/jpeg',
): Promise<GeminiResult> {
  if (!apiKey) return { success: false, error: 'No API key provided.' };

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: imageBase64 } }, { text: MRZ_PROMPT }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 200 },
      }),
    });
    if (!res.ok) return { success: false, error: `Gemini ${res.status}: ${(await res.text()).slice(0,200)}` };

    const json = await res.json();
    const text = (json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '') as string;

    if (text.includes('MRZ_NOT_VISIBLE'))
      return { success: false, error: 'Gemini: MRZ not visible in image.' };

    const lines = parseResponse(text);
    if (!lines) return { success: false, error: `Gemini response invalid. Raw: ${text.slice(0,120)}` };
    return { success: true, lines };
  } catch (err) {
    return { success: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

function parseResponse(text: string): [string, string] | null {
  const candidates = text
    .split(/[\n\r]+/)
    .map(l => l.trim().toUpperCase().replace(/[^A-Z0-9<]/g, ''))
    .filter(l => l.length >= 40);
  if (candidates.length < 2) return null;
  // Line 1 vs line 2 decided by MRZ structure, never by length or output
  // order — swapped lines scramble every parsed field downstream.
  const top = [...candidates].sort((a, b) => b.length - a.length).slice(0, 2);
  const [raw1, raw2] = orderMRZLines(top[0], top[1]);
  const pad = (s: string, n: number) => s.length > n ? s.slice(0,n) : s.padEnd(n,'<');
  const l1 = pad(raw1, 44), l2 = pad(raw2, 44);
  return /^[A-Z0-9<]{44}$/.test(l1) && /^[A-Z0-9<]{44}$/.test(l2) ? [l1, l2] : null;
}

export function dataUrlToBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',');
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}
