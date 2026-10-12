import type { Metadata, Viewport } from 'next'
import type { CSSProperties, ReactNode } from 'react'

import { contrastText, normalizeHex } from '@/lib/color'
import { getSiteSettings } from '@/lib/data'
import { getServerURL } from '@/lib/env'
import { resolveLocale } from '@/lib/site'
import { fontPairingStyle } from '@/themes/fonts'

export const metadata: Metadata = {
  metadataBase: new URL(getServerURL()),
}

export const viewport: Viewport = {
  themeColor: '#0e0e0f',
  colorScheme: 'dark',
}

// Pages are rendered on first request (no database is needed at build time) and then
// cached until something changes in the admin (see src/hooks/revalidate.ts).
export function generateStaticParams() {
  return []
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const locale = resolveLocale((await params).locale)
  const settings = await getSiteSettings(locale)
  const accent = normalizeHex(settings.accentColor)
  const fonts = fontPairingStyle(settings.fontPairing)
  const style = {
    '--accent': accent,
    '--accent-contrast': contrastText(accent),
    '--font-body': fonts.body,
    '--font-heading': fonts.heading,
  } as CSSProperties

  return (
    <html lang={locale} className={fonts.className} style={style}>
      <body>{children}</body>
    </html>
  )
}
