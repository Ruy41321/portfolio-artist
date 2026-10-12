import type { Metadata } from 'next'

import { defaultLocale } from '@/i18n/config'
import { getProfile, getSiteSettings } from '@/lib/data'
import { getTheme } from '@/themes'

export const metadata: Metadata = { title: '404', robots: { index: false } }

export default async function NotFound() {
  // Language-independent data only: the page localizes its texts from the URL.
  const [profile, settings] = await Promise.all([
    getProfile(defaultLocale),
    getSiteSettings(defaultLocale),
  ])
  const theme = getTheme(settings.theme)
  return <theme.NotFoundPage siteName={profile.name || 'Portfolio'} />
}
