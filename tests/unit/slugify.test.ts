import { describe, expect, it } from 'vitest'

import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('lowercases, strips accents and joins words with dashes', () => {
    expect(slugify('Città d’Estate n.3')).toBe('citta-destate-n-3')
    expect(slugify('  Mattino sul lago  ')).toBe('mattino-sul-lago')
  })

  it('returns an empty string for text without letters or digits', () => {
    expect(slugify('—')).toBe('')
  })
})
