import type { Payload } from 'payload'

import type { Locale } from '@/i18n/config'
import type { Artwork, Category, Profile, SiteSetting } from '@/payload-types'

/**
 * Data access helpers built on the Payload Local API.
 * They always respect public access rules (`overrideAccess: false`, no user),
 * so drafts are never exposed on the public site.
 */

const publicAccess = { overrideAccess: false } as const

export async function findPublishedArtworks(
  payload: Payload,
  locale: Locale,
  options: { limit?: number } = {},
): Promise<Artwork[]> {
  const result = await payload.find({
    collection: 'artworks',
    locale,
    fallbackLocale: 'it',
    depth: 2,
    sort: '_order',
    limit: options.limit ?? 0,
    pagination: false,
    where: { _status: { equals: 'published' } },
    ...publicAccess,
  })
  return result.docs
}

export async function findArtworkBySlug(
  payload: Payload,
  locale: Locale,
  slug: string,
): Promise<Artwork | null> {
  const result = await payload.find({
    collection: 'artworks',
    locale,
    fallbackLocale: 'it',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    ...publicAccess,
  })
  return result.docs[0] ?? null
}

export async function findAllCategories(payload: Payload, locale: Locale): Promise<Category[]> {
  const result = await payload.find({
    collection: 'categories',
    locale,
    fallbackLocale: 'it',
    depth: 0,
    sort: '_order',
    pagination: false,
    ...publicAccess,
  })
  return result.docs
}

/** Category id of an artwork, whether the relation is populated or not. */
export function categoryIdOf(artwork: Pick<Artwork, 'category'>): number | null {
  const category = artwork.category
  if (category === null || category === undefined) return null
  return typeof category === 'object' ? category.id : category
}

/**
 * Categories shown as filters above the works: in the admin's order and only
 * those with at least one published artwork.
 */
export function filterCategoriesWithWorks(
  categories: Category[],
  artworks: Pick<Artwork, 'category'>[],
): Category[] {
  const used = new Set(artworks.map(categoryIdOf).filter((id): id is number => id !== null))
  return categories.filter((category) => used.has(category.id))
}

export async function findFilterCategories(payload: Payload, locale: Locale): Promise<Category[]> {
  const [categories, artworks] = await Promise.all([
    findAllCategories(payload, locale),
    findPublishedArtworks(payload, locale),
  ])
  return filterCategoriesWithWorks(categories, artworks)
}

export async function findProfile(payload: Payload, locale: Locale): Promise<Profile> {
  return payload.findGlobal({
    slug: 'profile',
    locale,
    fallbackLocale: 'it',
    depth: 1,
    ...publicAccess,
  })
}

export async function findSiteSettings(payload: Payload, locale: Locale): Promise<SiteSetting> {
  return payload.findGlobal({
    slug: 'site-settings',
    locale,
    fallbackLocale: 'it',
    depth: 1,
    ...publicAccess,
  })
}
