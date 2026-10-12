'use client'

import { useParams } from 'next/navigation'

import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import type { NotFoundPageProps } from '@/themes/types'

/**
 * Themed 404 page. It reads the language from the URL on the client so that the
 * not-found boundary does not force every page of the site to render dynamically.
 */
export function NotFoundPage({ siteName }: NotFoundPageProps) {
  const params = useParams<{ locale?: string }>()
  const locale = isLocale(params?.locale) ? params.locale : 'it'
  const dict = getDictionary(locale)

  return (
    <main id="content" className="main main--standalone">
      <p className="standalone-brand">
        <a href={`/${locale}`}>
          <span className="dot" aria-hidden="true" />
          {siteName}
        </a>
      </p>
      <section className="page status-page" aria-labelledby="not-found-title">
        <p className="status-page__code" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className="page-title">
          {dict.notFound.title}
        </h1>
        <p>{dict.notFound.text}</p>
        <p>
          <a className="btn" href={`/${locale}`}>
            {dict.notFound.home}
          </a>
        </p>
      </section>
    </main>
  )
}
