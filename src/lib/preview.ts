import { isLocale, defaultLocale } from '@/i18n/config'

/**
 * Admin "Preview" link: goes through /api/preview, which enables Next.js draft mode
 * for logged-in users and then redirects to the public page.
 */
export function previewPath(locale: string | undefined, path: string): string {
  const lang = isLocale(locale) ? locale : defaultLocale
  const target = `/${lang}${path}`
  return `/api/preview?path=${encodeURIComponent(target)}`
}

/** Only allows redirects to local site pages (no open redirects). */
export function safePreviewTarget(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/api')) {
    return `/${defaultLocale}`
  }
  return path
}
