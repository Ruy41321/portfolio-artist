import type { Validate } from 'payload'

import { defaultLocale } from '@/i18n/config'

/**
 * Makes a localized field mandatory only in the default language (Italian):
 * translations stay optional and fall back to Italian on the site.
 */
export function requiredInDefaultLocale(message: string): Validate {
  return (value, { req }) => {
    const locale = req?.locale
    if (locale && locale !== defaultLocale && locale !== 'all') return true
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      isEmptyRichText(value)
    return isEmpty ? message : true
  }
}

function isEmptyRichText(value: unknown): boolean {
  if (!value || typeof value !== 'object' || !('root' in value)) return false
  const root = (value as { root?: { children?: unknown[] } }).root
  const children = root?.children ?? []
  if (children.length === 0) return true
  return children.every((child) => {
    const node = child as { children?: Array<{ text?: string }> }
    return (node.children ?? []).every((leaf) => !leaf.text || leaf.text.trim() === '')
  })
}
