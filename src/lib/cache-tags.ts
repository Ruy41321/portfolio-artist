/** Cache tags used by the public site and invalidated by the Payload hooks. */
export const cacheTags = {
  artworks: 'artworks',
  categories: 'categories',
  media: 'media',
  profile: 'profile',
  siteSettings: 'site-settings',
} as const

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags]
