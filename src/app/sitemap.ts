import type { MetadataRoute } from 'next'

import { locales } from '@/i18n/config'
import { artworkSegment } from '@/i18n/dictionaries'
import { getArtworks } from '@/lib/data'
import { absoluteUrl } from '@/lib/env'

// Built on request (data is cached) so that no database is needed at build time.
export const dynamic = 'force-dynamic'

function languageAlternates(path: string) {
  return {
    languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(`/${l}${path}`)])),
  }
}

/** Multilingual sitemap: home, privacy and every published artwork in each language. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await getArtworks('it')
  const lastModified = artworks.reduce<Date | undefined>((latest, a) => {
    const date = new Date(a.updatedAt)
    return !latest || date > latest ? date : latest
  }, undefined)

  const pages: { path: string; updatedAt?: Date; priority: number }[] = [
    { path: '', updatedAt: lastModified, priority: 1 },
    ...artworks.map((a) => ({
      path: `/${artworkSegment}/${a.slug}`,
      updatedAt: new Date(a.updatedAt),
      priority: 0.8,
    })),
    { path: '/privacy', priority: 0.2 },
  ]

  return pages.flatMap(({ path, updatedAt, priority }) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: updatedAt,
      priority,
      alternates: languageAlternates(path),
    })),
  )
}
