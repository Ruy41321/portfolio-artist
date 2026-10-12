import 'server-only'

import { notFound } from 'next/navigation'

import { isLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import type { SiteContext } from '@/themes/types'

import { getPreviewState, getProfile, getSiteSettings } from './data'

/** Validates the [locale] route param, or renders the 404 page. */
export function resolveLocale(value: string): Locale {
  if (!isLocale(value)) notFound()
  return value
}

export async function getSiteContext(locale: Locale): Promise<SiteContext> {
  const [profile, settings, preview] = await Promise.all([
    getProfile(locale),
    getSiteSettings(locale),
    getPreviewState(),
  ])
  return { locale, dict: getDictionary(locale), profile, settings, preview }
}
