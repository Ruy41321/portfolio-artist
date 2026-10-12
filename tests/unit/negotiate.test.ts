import { describe, expect, it } from 'vitest'

import { negotiateLocale } from '@/i18n/negotiate'

describe('negotiateLocale', () => {
  it('defaults to Italian', () => {
    expect(negotiateLocale(null)).toBe('it')
    expect(negotiateLocale('fr-FR,de;q=0.8')).toBe('it')
  })

  it('honours the order and quality of Accept-Language', () => {
    expect(negotiateLocale('en-US,en;q=0.9,it;q=0.8')).toBe('en')
    expect(negotiateLocale('fr;q=1, it;q=0.5, en;q=0.7')).toBe('en')
    expect(negotiateLocale('it-IT,it;q=0.9,en;q=0.8')).toBe('it')
  })
})
