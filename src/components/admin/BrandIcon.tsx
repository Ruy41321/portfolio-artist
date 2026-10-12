import type { ServerProps } from 'payload'

import type { Media } from '@/payload-types'
import { defaultAccentColor } from '@/themes/options'

import './admin.scss'

/** Small icon in the admin navigation: favicon/logo from Site settings, or the accent dot. */
export default async function BrandIcon({ payload }: ServerProps) {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const image = (settings?.favicon || settings?.logo) as Media | null | undefined
  const accent = settings?.accentColor || defaultAccentColor

  return (
    <span className="pa-icon">
      {image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.url} alt="" />
      ) : (
        <span className="pa-brand__dot" style={{ ['--pa-accent' as string]: accent }} />
      )}
    </span>
  )
}
