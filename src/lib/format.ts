import type { Locale } from '@/i18n/config'

export function formatPrice(value: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}
