import { localeLabels, locales, type Locale } from '@/i18n/config'

type Props = {
  locale: Locale
  /** Current path without the locale prefix, e.g. "/opere/isola" or "". */
  path: string
  label: string
  className?: string
}

/** IT / EN switch linking to the same page in the other language. */
export function LocaleSwitch({ locale, path, label, className }: Props) {
  return (
    <nav className={className} aria-label={label}>
      {locales.map((code, index) => (
        <span key={code}>
          {index > 0 && <span aria-hidden="true"> / </span>}
          <a
            href={`/${code}${path}`}
            hrefLang={code}
            lang={code}
            aria-current={code === locale ? 'true' : undefined}
            aria-label={localeLabels[code]}
            className={code === locale ? 'is-active' : undefined}
          >
            {code.toUpperCase()}
          </a>
        </span>
      ))}
    </nav>
  )
}
