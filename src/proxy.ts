import { NextResponse, type NextRequest } from 'next/server'

import { isLocale } from '@/i18n/config'
import { negotiateLocale } from '@/i18n/negotiate'
import { getServerURL } from '@/lib/env'

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
  // Absolute URL from the public address, so redirects are right behind a reverse proxy.
  const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}${search}`, getServerURL())
  const response = NextResponse.redirect(url, 307)
  response.headers.set('Vary', 'Accept-Language')
  return response
}

export const config = {
  // Skip Payload (admin, API), Next.js internals and files with an extension.
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
