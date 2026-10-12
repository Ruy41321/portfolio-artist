import Script from 'next/script'

import type { SiteSetting } from '@/payload-types'

const defaults = {
  plausible: 'https://plausible.io/js/script.js',
  umami: 'https://cloud.umami.is/script.js',
} as const

/** Optional cookie-less analytics (Plausible or Umami), configured in Site settings. */
export function Analytics({ settings }: { settings: SiteSetting }) {
  const analytics = settings.analytics
  const provider = analytics?.provider
  const siteId = analytics?.siteId?.trim()
  if (!siteId || (provider !== 'plausible' && provider !== 'umami')) return null
  const src = analytics?.scriptUrl?.trim() || defaults[provider]
  if (!/^https:\/\//i.test(src)) return null

  return provider === 'plausible' ? (
    <Script src={src} data-domain={siteId} strategy="afterInteractive" defer />
  ) : (
    <Script src={src} data-website-id={siteId} strategy="afterInteractive" defer />
  )
}
