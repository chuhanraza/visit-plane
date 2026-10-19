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

/**
 * SERP-safe meta description (≤155).
 * Keeps whole sentences: takes as many leading sentences as fit. Only when the
 * first sentence alone is too long does it fall back to a word-boundary cut
 * with an ellipsis, so a snippet never ends mid-thought with a fake full stop.
 */
export function clampDesc(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= 155) return t
  const sentences = t.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? []
  let out = ''
  for (const raw of sentences) {
    const next = (out ? out + ' ' : '') + raw.trim()
    if (next.length > 155) break
    out = next
  }
  if (out.length >= 60) return out
  const c = clamp(t, 154)
  return /[.!?]$/.test(c) ? c : c + '…'
}
