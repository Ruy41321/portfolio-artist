import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { contactRateLimiter, submitContactMessage } from '@/lib/contact'
import { paragraphs } from '@/lib/richtext'

import { getTestPayload, resetContent } from '../helpers/payload'

let payload: Payload

const valid = { name: 'Mario Rossi', email: 'mario@example.com', message: 'Vorrei informazioni.' }
const options = { ip: '203.0.113.7', locale: 'it' as const }

describe('Contact form', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  beforeEach(async () => {
    await resetContent(payload)
    contactRateLimiter.reset()
    await payload.updateGlobal({ slug: 'site-settings', data: { enableContactForm: true } })
    await payload.updateGlobal({
      slug: 'profile',
      data: { name: 'Artista Demo', email: 'artista@example.com', bio: paragraphs('Bio') },
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await resetContent(payload)
    await payload.destroy()
  })

  it('stores the message without SMTP and does not send email', async () => {
    vi.stubEnv('SMTP_HOST', '')
    const sendEmail = vi.spyOn(payload, 'sendEmail')

    const result = await submitContactMessage(payload, valid, options)

    expect(result).toEqual({ status: 'ok' })
    const messages = await payload.find({ collection: 'messages' })
    expect(messages.docs).toHaveLength(1)
    expect(messages.docs[0]).toMatchObject({ ...valid, read: false, locale: 'it' })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('stores the message and emails the artist when SMTP is configured', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com')
    const sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    const result = await submitContactMessage(payload, valid, options)

    expect(result).toEqual({ status: 'ok' })
    expect(await payload.count({ collection: 'messages' })).toMatchObject({ totalDocs: 1 })
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'artista@example.com', replyTo: valid.email }),
    )
  })

  it('keeps the message even if sending the email fails', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.example.com')
    vi.spyOn(payload, 'sendEmail').mockRejectedValue(new Error('SMTP down'))

    expect(await submitContactMessage(payload, valid, options)).toEqual({ status: 'ok' })
    expect(await payload.count({ collection: 'messages' })).toMatchObject({ totalDocs: 1 })
  })

  it('validates the fields', async () => {
    const result = await submitContactMessage(
      payload,
      { name: '', email: 'not-an-email', message: 'short' },
      options,
    )
    expect(result).toEqual({
      status: 'invalid',
      fieldErrors: {
        name: 'nameRequired',
        email: 'emailInvalid',
        message: 'messageRequired',
      },
    })
    expect(await payload.count({ collection: 'messages' })).toMatchObject({ totalDocs: 0 })
  })

  it('silently drops submissions that fill the honeypot', async () => {
    const result = await submitContactMessage(payload, valid, { ...options, honeypot: 'spam' })
    expect(result).toEqual({ status: 'ok' })
    expect(await payload.count({ collection: 'messages' })).toMatchObject({ totalDocs: 0 })
  })

  it('rate limits by IP address', async () => {
    const limit = Number(process.env.CONTACT_RATE_LIMIT || 5)
    for (let i = 0; i < limit; i++) {
      expect(await submitContactMessage(payload, valid, options)).toEqual({ status: 'ok' })
    }
    expect(await submitContactMessage(payload, valid, options)).toEqual({ status: 'rate-limited' })
    expect(await submitContactMessage(payload, valid, { ...options, ip: '198.51.100.1' })).toEqual({
      status: 'ok',
    })
  })

  it('refuses messages when the form is disabled', async () => {
    await payload.updateGlobal({ slug: 'site-settings', data: { enableContactForm: false } })
    expect(await submitContactMessage(payload, valid, options)).toEqual({ status: 'disabled' })
  })
})
