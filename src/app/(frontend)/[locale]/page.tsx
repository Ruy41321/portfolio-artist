import type { Metadata } from 'next'

import { JsonLd } from '@/components/ui/JsonLd'
import { getArtworks, getFilterCategories } from '@/lib/data'
import { homeMetadata } from '@/lib/seo'
import { personJsonLd } from '@/lib/structured-data'
import { getSiteContext, resolveLocale } from '@/lib/site'
import { getTheme } from '@/themes'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale)
  const [{ profile, settings }, artworks] = await Promise.all([
    getSiteContext(locale),
    getArtworks(locale),
  ])
  return homeMetadata(locale, profile, settings, artworks)
}

export default async function HomeRoute({ params }: Props) {
  const locale = resolveLocale((await params).locale)
  const [context, artworks] = await Promise.all([getSiteContext(locale), getArtworks(locale)])
  const categories = await getFilterCategories(locale, artworks)
  const theme = getTheme(context.settings.theme)

  return (
    <theme.Layout {...context} currentPath="">
      <JsonLd data={personJsonLd(locale, context.profile)} />
      <theme.HomePage {...context} artworks={artworks} categories={categories} />
    </theme.Layout>
  )
}
