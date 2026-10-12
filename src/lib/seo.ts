import type { Metadata } from 'next'

import { locales, type Locale } from '@/i18n/config'
import { artworkSegment } from '@/i18n/dictionaries'
import type { Artwork, Media, Profile, SiteSetting } from '@/payload-types'

import { absoluteUrl } from './env'
import { asMedia, imageData } from './media'
import { richTextToPlain } from './richtext'

const ogLocale: Record<Locale, string> = { it: 'it_IT', en: 'en_GB' }

/** Canonical URL plus hreflang alternates for a path that exists in every language. */
export function alternates(locale: Locale, path: string): Metadata['alternates'] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      'x-default': `/it${path}`,
    },
  }
}

function ogImage(media: Media | null | undefined) {
  const image = imageData(media, 'og')
  if (!image) return undefined
  return [{ url: absoluteUrl(image.url), width: image.width, height: image.height, alt: image.alt }]
}

function defaultShareImage(settings: SiteSetting, artworks: Artwork[]): Media | null {
  const configured = asMedia(settings.seo?.image)
  if (configured) return configured
  const featured = artworks.find((a) => a.featured) ?? artworks[0]
  return asMedia(featured?.images?.[0])
}

export function siteTitle(profile: Profile, settings: SiteSetting): string {
  return settings.seo?.title || profile.name || 'Portfolio'
}

export function homeMetadata(
  locale: Locale,
  profile: Profile,
  settings: SiteSetting,
  artworks: Artwork[],
): Metadata {
  const title = siteTitle(profile, settings)
  const description = settings.seo?.description || profile.tagline || undefined
  const images = ogImage(defaultShareImage(settings, artworks))
  return {
    title: { absolute: title },
    description,
    alternates: alternates(locale, ''),
    openGraph: {
      type: 'profile',
      title,
      description,
      url: `/${locale}`,
      siteName: profile.name || title,
      locale: ogLocale[locale],
      images,
    },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description },
  }
}

export function artworkMetadata(locale: Locale, artwork: Artwork, profile: Profile): Metadata {
  const path = `/${artworkSegment}/${artwork.slug}`
  const title = `${artwork.title} — ${profile.name}`
  const description =
    artwork.shortDescription || richTextToPlain(artwork.description).slice(0, 160) || undefined
  const images = ogImage(asMedia(artwork.images?.[0]))
  return {
    title: { absolute: title },
    description,
    alternates: alternates(locale, path),
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/${locale}${path}`,
      siteName: profile.name,
      locale: ogLocale[locale],
      images,
    },
    twitter: { card: images ? 'summary_large_image' : 'summary', title, description },
  }
}
