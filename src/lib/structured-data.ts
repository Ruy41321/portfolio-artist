import type { Locale } from '@/i18n/config'
import type { Artwork, Profile } from '@/payload-types'

import { absoluteUrl } from './env'
import { asMedia, imageData } from './media'
import { richTextToPlain } from './richtext'
import { artworkHref } from './works'

type JsonLd = Record<string, unknown>

/** schema.org Person describing the artist. */
export function personJsonLd(locale: Locale, profile: Profile): JsonLd {
  const portrait = imageData(asMedia(profile.portrait), 'card')
  const sameAs = (profile.socials ?? []).map((s) => s.url).filter(Boolean)
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/#artist'),
    name: profile.name,
    jobTitle: profile.tagline || undefined,
    description: profile.statement || richTextToPlain(profile.bio).slice(0, 300) || undefined,
    url: absoluteUrl(`/${locale}`),
    image: portrait ? absoluteUrl(portrait.url) : undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    homeLocation: profile.location ? { '@type': 'Place', name: profile.location } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  })
}

/** schema.org VisualArtwork for an artwork page. */
export function artworkJsonLd(locale: Locale, artwork: Artwork, profile: Profile): JsonLd {
  const images = (artwork.images ?? [])
    .map((image) => imageData(asMedia(image), 'large'))
    .filter((image) => image !== null)
    .map((image) => absoluteUrl(image.url))
  const category = typeof artwork.category === 'object' ? artwork.category : null
  return clean({
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    url: absoluteUrl(artworkHref(locale, artwork.slug ?? '')),
    image: images.length ? images : undefined,
    description: artwork.shortDescription || undefined,
    dateCreated: artwork.year ? String(artwork.year) : undefined,
    artMedium: artwork.technique || undefined,
    artform: category?.name || undefined,
    size: artwork.dimensions || undefined,
    inLanguage: locale,
    creator: { '@type': 'Person', '@id': absoluteUrl('/#artist'), name: profile.name },
  })
}

/** Serializes JSON-LD for a <script> tag, escaping characters that could close it. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

function clean(data: JsonLd): JsonLd {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}
