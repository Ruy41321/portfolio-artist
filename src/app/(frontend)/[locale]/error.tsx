'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

/** Error boundary of the public site, styled with the active theme's CSS. */
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ locale: string }>()
  const locale = isLocale(params?.locale) ? params.locale : 'it'
  const dict = getDictionary(locale)

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="main main--standalone">
      <section className="page status-page" aria-labelledby="error-title">
        <h1 id="error-title" className="page-title">
          {dict.error.title}
        </h1>
        <p>{dict.error.text}</p>
        <p>
          <button type="button" className="btn" onClick={reset}>
            {dict.error.retry}
          </button>{' '}
          <a href={`/${locale}`} className="error-home">
            {dict.notFound.home}
          </a>
        </p>
      </section>
    </main>
  )
}
