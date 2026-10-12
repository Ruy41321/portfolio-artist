import type { Metadata } from 'next'

import { getDictionary } from '@/i18n/dictionaries'
import { alternates } from '@/lib/seo'
import { getSiteContext, resolveLocale } from '@/lib/site'
import { getTheme } from '@/themes'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale)
  const { profile } = await getSiteContext(locale)
  return {
    title: { absolute: `${getDictionary(locale).privacy.title} — ${profile.name}` },
    description: getDictionary(locale).privacy.description,
    alternates: alternates(locale, '/privacy'),
  }
}

export default async function PrivacyRoute({ params }: Props) {
  const locale = resolveLocale((await params).locale)
  const context = await getSiteContext(locale)
  const theme = getTheme(context.settings.theme)
  return (
    <theme.Layout {...context} currentPath="/privacy">
      <theme.PrivacyPage {...context} />
    </theme.Layout>
  )
}
