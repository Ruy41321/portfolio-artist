import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { socialPlatforms } from '@/globals/Profile'
import type { LayoutProps } from '@/themes/types'

import { SideNav } from './SideNav'

const platformLabel = (value: string): string => {
  const option = socialPlatforms.find((o) => o.value === value)
  if (!option) return value
  return typeof option.label === 'string' ? option.label : option.label.it
}

export function Layout({ locale, dict, profile, preview, currentPath, children }: LayoutProps) {
  const onHome = currentPath === ''
  const year = new Date().getFullYear()
  const name = profile.name || 'Portfolio'

  return (
    <div className="site">
      <a className="skip-link" href="#content">
        {dict.skipToContent}
      </a>
      {preview && (
        <div className="preview-banner" role="status">
          {dict.preview.banner}{' '}
          <a href={`/api/exit-preview?path=${encodeURIComponent(`/${locale}${currentPath}`)}`}>
            {dict.preview.exit}
          </a>
        </div>
      )}
      <header className="sidebar">
        <div className="sidebar__brand">
          <a href={`/${locale}`} className="sidebar__name">
            <span className="dot" aria-hidden="true" />
            <span>{name}</span>
          </a>
          {profile.tagline && <p className="sidebar__tagline">{profile.tagline}</p>}
        </div>
        <SideNav
          onHome={onHome}
          basePath={onHome ? '' : `/${locale}`}
          menuLabel={dict.nav.menu}
          closeLabel={dict.nav.close}
          links={[
            { id: 'about', label: dict.nav.about },
            { id: 'works', label: dict.nav.works },
            { id: 'contact', label: dict.nav.contact },
          ]}
        >
          <LocaleSwitch
            locale={locale}
            path={currentPath}
            label={dict.languageSwitch}
            className="lang"
          />
        </SideNav>
        <footer className="sidebar__foot">
          <LocaleSwitch
            locale={locale}
            path={currentPath}
            label={dict.languageSwitch}
            className="lang"
          />
          {profile.socials?.map((social) => (
            <a key={social.id ?? social.url} href={social.url} rel="me noopener" target="_blank">
              {platformLabel(social.platform)}
            </a>
          ))}
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          <span>
            © {year} {name}
          </span>
          <a href={`/${locale}/privacy`}>{dict.footer.privacy}</a>
        </footer>
      </header>
      <main id="content" className="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
