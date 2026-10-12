import { describe, expect, it } from 'vitest'

import { titleFromMedia } from '@/endpoints/artworkFromMedia'

describe('titleFromMedia', () => {
  it('derives a readable title from the file name', () => {
    expect(titleFromMedia(null, 'campo_d-estate.jpg')).toBe('Campo d estate')
  })

  it('falls back to the alt text and then to a default', () => {
    expect(titleFromMedia('Ritratto', '')).toBe('Ritratto')
    expect(titleFromMedia(null, null)).toBe('Nuova opera')
  })
})
