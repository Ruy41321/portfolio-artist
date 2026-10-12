import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/config'
import type { Artwork, Category, Profile, SiteSetting } from '@/payload-types'

import { cacheTags } from './cache-tags'
import {
  filterCategoriesWithWorks,
  findAllCategories,
  findArtworkBySlug,
  findProfile,
  findPublishedArtworks,
  findSiteSettings,
} from './queries'

/**
 * Cached data access for the public site. Results are cached by Next.js and
 * invalidated on demand by the Payload hooks in src/hooks/revalidate.ts.
 * In draft mode (admin preview) the cache is bypassed and drafts are included.
 */

export const getPayloadClient = cache((): Promise<Payload> => getPayload({ config }))

const allTags = Object.values(cacheTags)

async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

const cachedArtworks = unstable_cache(
  async (locale: Locale) => findPublishedArtworks(await getPayloadClient(), locale),
  ['artworks'],
  { tags: allTags },
)

const cachedCategories = unstable_cache(
  async (locale: Locale) => findAllCategories(await getPayloadClient(), locale),
  ['categories'],
  { tags: [cacheTags.categories] },
)

const cachedArtworkBySlug = unstable_cache(
  async (locale: Locale, slug: string) => findArtworkBySlug(await getPayloadClient(), locale, slug),
  ['artwork-by-slug'],
  { tags: allTags },
)

const cachedProfile = unstable_cache(
  async (locale: Locale) => findProfile(await getPayloadClient(), locale),
  ['profile'],
  { tags: [cacheTags.profile, cacheTags.media] },
)

const cachedSiteSettings = unstable_cache(
  async (locale: Locale) => findSiteSettings(await getPayloadClient(), locale),
  ['site-settings'],
  { tags: [cacheTags.siteSettings, cacheTags.media] },
)

async function findDraftArtworks(locale: Locale): Promise<Artwork[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'artworks',
    locale,
    fallbackLocale: 'it',
    depth: 2,
    sort: '_order',
    pagination: false,
    draft: true,
    overrideAccess: true,
  })
  return result.docs
}

export async function getArtworks(locale: Locale): Promise<Artwork[]> {
  return (await isPreview()) ? findDraftArtworks(locale) : cachedArtworks(locale)
}

export async function getArtworkBySlug(locale: Locale, slug: string): Promise<Artwork | null> {
  if (await isPreview()) {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'artworks',
      locale,
      fallbackLocale: 'it',
      depth: 2,
      limit: 1,
      draft: true,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    return result.docs[0] ?? null
  }
  return cachedArtworkBySlug(locale, slug)
}

/** Categories shown as filters: admin order, only those with published works. */
export async function getFilterCategories(
  locale: Locale,
  artworks: Pick<Artwork, 'category'>[],
): Promise<Category[]> {
  return filterCategoriesWithWorks(await cachedCategories(locale), artworks)
}

export async function getProfile(locale: Locale): Promise<Profile> {
  return cachedProfile(locale)
}

export async function getSiteSettings(locale: Locale): Promise<SiteSetting> {
  return cachedSiteSettings(locale)
}

export async function getPreviewState(): Promise<boolean> {
  return isPreview()
}
