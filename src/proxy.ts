import { NextResponse, type NextRequest } from 'next/server'

import { isLocale } from '@/i18n/config'
import { negotiateLocale } from '@/i18n/negotiate'

/**
 * Public site routing: every page lives under /it or /en.
 * - Paths that already start with a locale pass through.
 * - Other paths are redirected to the visitor's preferred language (Accept-Language).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const first = pathname.split('/')[1]

  if (isLocale(first)) return NextResponse.next()

  const locale = negotiateLocale(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  url.search = search
  const response = NextResponse.redirect(url, 307)
  response.headers.set('Vary', 'Accept-Language')
  return response
}

export const config = {
  // Skip Payload (admin, API), Next.js internals and files with an extension.
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
