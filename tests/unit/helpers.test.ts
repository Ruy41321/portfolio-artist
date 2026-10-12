import { describe, expect, it } from 'vitest'

import { contrastText, normalizeHex } from '@/lib/color'
import { localMediaUrl } from '@/lib/media'
import { safePreviewTarget } from '@/lib/preview'
import { createRateLimiter } from '@/lib/rate-limit'

describe('color helpers', () => {
  it('normalizes hex colors and falls back to the default accent', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('red')).toBe('#d7ff3a')
  })

  it('picks a readable text color on top of the accent', () => {
    expect(contrastText('#d7ff3a')).toBe('#000000')
    expect(contrastText('#1d3557')).toBe('#ffffff')
  })
})

describe('localMediaUrl', () => {
  it('turns absolute media URLs into local paths', () => {
    expect(localMediaUrl('http://localhost:3000/api/media/file/a.jpg')).toBe(
      '/api/media/file/a.jpg',
    )
    expect(localMediaUrl('https://example.org/api/media/file/b.jpg?x=1')).toBe(
      '/api/media/file/b.jpg?x=1',
    )
    expect(localMediaUrl('https://cdn.example.org/c.jpg')).toBe('https://cdn.example.org/c.jpg')
  })
})

describe('safePreviewTarget', () => {
  it('only allows local page paths', () => {
    expect(safePreviewTarget('/en/opere/isola')).toBe('/en/opere/isola')
    expect(safePreviewTarget('//evil.example')).toBe('/it')
    expect(safePreviewTarget('https://evil.example')).toBe('/it')
    expect(safePreviewTarget('/api/users')).toBe('/it')
  })
})

describe('rate limiter', () => {
  it('blocks after the limit within the window', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limiter.check('ip', 0)).toBe(true)
    expect(limiter.check('ip', 10)).toBe(true)
    expect(limiter.check('ip', 20)).toBe(false)
    expect(limiter.check('ip', 1500)).toBe(true)
  })
})
