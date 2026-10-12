import type { SiteContext } from '@/themes/types'

import { ContactForm } from './ContactForm'

export function ContactSection({ locale, dict, profile, settings }: SiteContext) {
  return (
    <section className="page" id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="section-title">
        {dict.nav.contact}
      </h2>
      {profile.contactIntro && <p className="contact-intro">{profile.contactIntro}</p>}
      {settings.enableContactForm !== false ? (
        <ContactForm locale={locale} labels={dict.contact} />
      ) : null}
      {profile.email && (
        <p className="contact-email">
          {dict.contact.writeTo} <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
      )}
    </section>
  )
}
