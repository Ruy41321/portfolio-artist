import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { artworkSegment } from '@/i18n/dictionaries'
import { getArtworkBySlug, getArtworks } from '@/lib/data'
import { getSiteContext, resolveLocale } from '@/lib/site'
import { getTheme } from '@/themes'

type Props = { params: Promise<{ locale: string; slug: string }> }

// Rendered on first request, then cached until the artwork changes.
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const locale = resolveLocale(rawLocale)
  const [artwork, { profile }] = await Promise.all([
    getArtworkBySlug(locale, slug),
    getSiteContext(locale),
  ])
  if (!artwork) return {}
  const path = `/${artworkSegment}/${slug}`
  return {
    title: `${artwork.title} — ${profile.name}`,
    description: artwork.shortDescription || undefined,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { it: `/it${path}`, en: `/en${path}`, 'x-default': `/it${path}` },
    },
  }
}

export default async function ArtworkRoute({ params }: Props) {
  const { locale: rawLocale, slug } = await params
  const locale = resolveLocale(rawLocale)
  const [context, artwork, artworks] = await Promise.all([
    getSiteContext(locale),
    getArtworkBySlug(locale, slug),
    getArtworks(locale),
  ])
  if (!artwork) notFound()

  const index = artworks.findIndex((a) => a.id === artwork.id)
  const previous = index > 0 ? artworks[index - 1] : null
  const next = index >= 0 && index < artworks.length - 1 ? artworks[index + 1] : null
  const theme = getTheme(context.settings.theme)

  return (
    <theme.Layout {...context} currentPath={`/${artworkSegment}/${slug}`}>
      <theme.ArtworkPage {...context} artwork={artwork} previous={previous} next={next} />
    </theme.Layout>
  )
}
