/** Trim to `max` chars at a word boundary, no trailing punctuation clutter. */
function clamp(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max + 1)
  const i = cut.lastIndexOf(' ')
  return cut.slice(0, i > 0 ? i : max).replace(/[\s,;:—–-]+$/, '')
}

/** SERP-safe title (≤60). */
export const clampTitle = (s: string): string => clamp(s, 60)

/** SERP-safe meta description (≤155), ends on a full stop when trimmed. */
export function clampDesc(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= 155) return t
  const c = clamp(t, 154)
  return /[.!?]$/.test(c) ? c : c + '.'
}
