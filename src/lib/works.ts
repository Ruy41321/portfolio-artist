import type { Dictionary } from '@/i18n/dictionaries'
import { artworkSegment } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'
import type { Artwork, SiteSetting } from '@/payload-types'

import { formatPrice } from './format'
import { asMedia, imageData, type ImageData } from './media'
import { categoryIdOf } from './queries'

/** Serializable view model of an artwork, passed to client components. */
export type WorkItem = {
  id: number
  slug: string
  href: string
  title: string
  year: number | null
  technique: string
  dimensions: string | null
  shortDescription: string
  categoryId: number | null
  categoryName: string | null
  availability: Artwork['availability']
  availabilityLabel: string
  price: string | null
  cover: ImageData | null
  large: ImageData | null
}

export function artworkHref(locale: Locale, slug: string): string {
  return `/${locale}/${artworkSegment}/${slug}`
}

export function priceLabel(artwork: Artwork, settings: SiteSetting, locale: Locale): string | null {
  if (!settings.showPrices || artwork.availability !== 'available') return null
  if (typeof artwork.price !== 'number') return null
  return formatPrice(artwork.price, settings.currency || 'EUR', locale)
}

export function toWorkItem(
  artwork: Artwork,
  { locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: SiteSetting },
): WorkItem {
  const first = asMedia(artwork.images?.[0])
  const category = typeof artwork.category === 'object' ? artwork.category : null
  return {
    id: artwork.id,
    slug: artwork.slug ?? String(artwork.id),
    href: artworkHref(locale, artwork.slug ?? String(artwork.id)),
    title: artwork.title ?? '',
    year: artwork.year ?? null,
    technique: artwork.technique ?? '',
    dimensions: artwork.dimensions ?? null,
    shortDescription: artwork.shortDescription ?? '',
    categoryId: categoryIdOf(artwork),
    categoryName: category?.name ?? null,
    availability: artwork.availability,
    availabilityLabel: dict.availability[artwork.availability ?? 'available'],
    price: priceLabel(artwork, settings, locale),
    cover: imageData(first, 'card'),
    large: imageData(first, 'large'),
  }
}
