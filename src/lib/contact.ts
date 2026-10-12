import type { Payload } from 'payload'
import { z } from 'zod'

import type { Locale } from '@/i18n/config'

import { createRateLimiter } from './rate-limit'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'nameRequired').max(120, 'nameRequired'),
  email: z.string().trim().max(200, 'emailInvalid').email('emailInvalid'),
  message: z.string().trim().min(10, 'messageRequired').max(5000, 'messageRequired'),
})

export type ContactField = keyof z.infer<typeof contactSchema>
export type ContactErrorKey = 'nameRequired' | 'emailInvalid' | 'messageRequired'

export type ContactResult =
  | { status: 'ok' }
  | { status: 'invalid'; fieldErrors: Partial<Record<ContactField, ContactErrorKey>> }
  | { status: 'rate-limited' }
  | { status: 'disabled' }
  | { status: 'error' }

export const contactRateLimiter = createRateLimiter({
  limit: Number(process.env.CONTACT_RATE_LIMIT || 5),
  windowMs: 10 * 60 * 1000,
})

type SubmitOptions = {
  ip: string
  locale: Locale
  /** Value of the hidden honeypot field: filled only by bots. */
  honeypot?: string | null
}

/**
 * Handles a contact form submission: validation, anti-spam, storage in the
 * Messages collection and (when SMTP is configured) an email to the artist.
 */
export async function submitContactMessage(
  payload: Payload,
  input: Record<string, unknown>,
  { ip, locale, honeypot }: SubmitOptions,
): Promise<ContactResult> {
  // Bots that fill the hidden field get a fake success and nothing is stored.
  if (honeypot) return { status: 'ok' }

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (settings.enableContactForm === false) return { status: 'disabled' }

  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, ContactErrorKey>> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField
      fieldErrors[field] ??= issue.message as ContactErrorKey
    }
    return { status: 'invalid', fieldErrors }
  }

  if (!contactRateLimiter.check(ip)) return { status: 'rate-limited' }

  const { name, email, message } = parsed.data
  try {
    await payload.create({
      collection: 'messages',
      data: { name, email, message, locale, read: false },
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error({ msg: 'Could not store contact message', err: error })
    return { status: 'error' }
  }

  await notifyArtist(payload, { name, email, message }).catch((error) => {
    // The message is already saved in the admin: a mail problem must not fail the form.
    payload.logger.error({ msg: 'Could not send contact email', err: error })
  })
  return { status: 'ok' }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST)
}

async function notifyArtist(
  payload: Payload,
  { name, email, message }: { name: string; email: string; message: string },
): Promise<void> {
  if (!isEmailConfigured()) return
  const profile = await payload.findGlobal({ slug: 'profile', depth: 0 })
  const to = process.env.CONTACT_EMAIL_TO || profile.email
  if (!to) return
  await payload.sendEmail({
    to,
    replyTo: email,
    subject: `Nuovo messaggio dal sito da ${name}`,
    text: `${message}\n\n— ${name} <${email}>`,
  })
}

/** Client IP as seen through the reverse proxy (first X-Forwarded-For entry). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip')?.trim() || 'unknown'
}
