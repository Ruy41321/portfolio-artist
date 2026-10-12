import Image from 'next/image'

import type { ImageData } from '@/lib/media'

type Props = {
  image: ImageData
  sizes: string
  className?: string
  priority?: boolean
  alt?: string
}

/** Artwork image: responsive next/image fed by a Payload image size, with blur placeholder. */
export function ArtImage({ image, sizes, className, priority, alt }: Props) {
  return (
    <Image
      src={image.url}
      width={image.width}
      height={image.height}
      alt={alt ?? image.alt}
      sizes={sizes}
      className={className}
      priority={priority}
      placeholder={image.blurDataURL ? 'blur' : 'empty'}
      blurDataURL={image.blurDataURL}
    />
  )
}
