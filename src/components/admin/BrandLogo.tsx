import type { ServerProps } from 'payload'

import type { Media } from '@/payload-types'
import { defaultAccentColor } from '@/themes/options'

import './admin.scss'

/** Login page logo: the artist's logo from Site settings, or their name with the accent dot. */
export default async function BrandLogo({ payload }: ServerProps) {
  const [settings, profile] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
    payload.findGlobal({ slug: 'profile', depth: 0 }),
  ])
  const logo = settings?.logo as Media | null | undefined
  const accent = settings?.accentColor || defaultAccentColor

  if (logo?.url) {
    return (
      <div className="pa-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url} alt={profile?.name || 'Logo'} />
      </div>
    )
  }
  return (
    <div className="pa-brand" style={{ ['--pa-accent' as string]: accent }}>
      <span className="pa-brand__dot" aria-hidden="true" />
      <span>{profile?.name || 'Portfolio'}</span>
    </div>
  )
}
