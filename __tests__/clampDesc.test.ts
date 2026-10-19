import { describe, it, expect } from 'vitest'
import { clampDesc } from '@/lib/seo/clamp'

describe('clampDesc', () => {
  it('returns short text unchanged', () => {
    expect(clampDesc('Short and sweet.')).toBe('Short and sweet.')
  })
  it('keeps whole sentences that fit within 155 chars', () => {
    const s =
      'A UK Standard Visitor visa costs about £135 (around PKR 50,000) for Pakistanis in 2026. This guide breaks down every fee — visa charge, VFS service fee, biometrics and the optional extras most applicants overlook.'
    const out = clampDesc(s)
    expect(out.length).toBeLessThanOrEqual(155)
    expect(out.endsWith('2026.')).toBe(true)
  })
  it('falls back to a word cut with an ellipsis when the first sentence is too long', () => {
    const s = 'word '.repeat(60).trim() + '.'
    const out = clampDesc(s)
    expect(out.length).toBeLessThanOrEqual(155)
    expect(out.endsWith('…')).toBe(true)
  })
})
