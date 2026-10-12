'use client'

import { useActionState } from 'react'

import { sendContactMessage } from '@/actions/contact'
import type { Dictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'
import type { ContactResult } from '@/lib/contact'

type Props = { locale: Locale; labels: Dictionary['contact'] }

export function ContactForm({ locale, labels }: Props) {
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(
    sendContactMessage,
    null,
  )
  const errors = state?.status === 'invalid' ? state.fieldErrors : {}

  if (state?.status === 'ok') {
    return (
      <p className="form-status form-status--ok" role="status">
        {labels.sent}
      </p>
    )
  }

  const errorText = (key?: keyof typeof labels) => (key ? labels[key] : null)

  return (
    <form action={action} className="contact-form" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people, often filled in by spam bots. */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="field">
        <label htmlFor="contact-name">{labels.name}</label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        {errors.name && (
          <p id="contact-name-error" className="field__error">
            {errorText(errors.name)}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="contact-email">{labels.email}</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        {errors.email && (
          <p id="contact-email-error" className="field__error">
            {errorText(errors.email)}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="contact-message">{labels.message}</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" className="field__error">
            {errorText(errors.message)}
          </p>
        )}
      </div>
      <p className="form-note">
        {labels.privacyNote}
        <a href={`/${locale}/privacy`}>{labels.privacyLink}</a>.
      </p>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? labels.sending : labels.send}
      </button>
      <div aria-live="polite" className="form-status-wrap">
        {state?.status === 'invalid' && (
          <p className="form-status form-status--error">{labels.invalid}</p>
        )}
        {state?.status === 'rate-limited' && (
          <p className="form-status form-status--error">{labels.rateLimited}</p>
        )}
        {(state?.status === 'error' || state?.status === 'disabled') && (
          <p className="form-status form-status--error">{labels.error}</p>
        )}
      </div>
    </form>
  )
}
