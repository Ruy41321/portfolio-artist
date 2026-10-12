import type { Metadata } from 'next'

import { getArtworks, getFilterCategories } from '@/lib/data'
import { getSiteContext, resolveLocale } from '@/lib/site'
import { getTheme } from '@/themes'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale)
  const { profile, settings } = await getSiteContext(locale)
  return {
    title: settings.seo?.title || profile.name || 'Portfolio',
    description: settings.seo?.description || profile.tagline || undefined,
    alternates: {
      canonical: `/${locale}`,
      languages: { it: '/it', en: '/en', 'x-default': '/it' },
    },
  }
}

export default async function HomeRoute({ params }: Props) {
  const locale = resolveLocale((await params).locale)
  const [context, artworks] = await Promise.all([getSiteContext(locale), getArtworks(locale)])
  const categories = await getFilterCategories(locale, artworks)
  const theme = getTheme(context.settings.theme)

  return (
    <theme.Layout {...context} currentPath="">
      <theme.HomePage {...context} artworks={artworks} categories={categories} />
    </theme.Layout>
  )
}
