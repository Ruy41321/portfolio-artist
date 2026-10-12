import type { Media } from '@/payload-types'

import { getServerURL } from './env'

export type ImageSize = 'thumb' | 'card' | 'large' | 'og'

export type ImageData = {
  url: string
  width: number
  height: number
  alt: string
  blurDataURL?: string
  /** Focal point in percent, used as object-position when the image is cropped. */
  focalX?: number
  focalY?: number
}

/**
 * Payload returns absolute URLs (built from the public server URL): files served by
 * this app are turned into relative paths so next/image treats them as local images.
 */
export function localMediaUrl(url: string): string {
  const base = getServerURL()
  if (url.startsWith(base + '/')) return url.slice(base.length)
  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/api/media/file/')) return parsed.pathname + parsed.search
  } catch {
    // Already a relative URL.
  }
  return url
}

/** Returns the populated media document, or null when the relation is not populated. */
export function asMedia(value: number | Media | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

/**
 * Picks a Payload image size (falling back to the original) and returns what an
 * <Image> needs. Sizes keep the original aspect ratio except `og`.
 */
export function imageData(
  media: Media | null | undefined,
  size: ImageSize = 'large',
): ImageData | null {
  if (!media?.url || !media.mimeType?.startsWith('image/')) return null
  const variant = media.sizes?.[size]
  const useVariant = Boolean(variant?.url && variant.width && variant.height)
  return {
    url: localMediaUrl(useVariant ? variant!.url! : media.url),
    width: (useVariant ? variant!.width : media.width) ?? 1200,
    height: (useVariant ? variant!.height : media.height) ?? 900,
    alt: media.alt ?? '',
    blurDataURL: media.blurDataURL ?? undefined,
    focalX: media.focalX ?? undefined,
    focalY: media.focalY ?? undefined,
  }
}
