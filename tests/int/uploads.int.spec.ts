import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createTestImage, getTestPayload, resetContent } from '../helpers/payload'

let payload: Payload

describe('Uploads', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetContent(payload)
  })

  afterAll(async () => {
    await resetContent(payload)
    await payload.destroy()
  })

  it('accepts images and stores the configured sizes and a blur placeholder', async () => {
    const media = await createTestImage(payload, 'size-check.jpg')
    expect(Object.keys(media.sizes ?? {})).toEqual(
      expect.arrayContaining(['thumb', 'card', 'large', 'og']),
    )
    expect(media.blurDataURL).toMatch(/^data:image\/webp;base64,/)
  })

  it.each([
    ['page.html', 'text/html', '<script>alert(1)</script>'],
    ['vector.svg', 'image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
    ['archive.zip', 'application/zip', 'PK'],
  ])('rejects %s (%s)', async (name, mimetype, content) => {
    const data = Buffer.from(content)
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'Non valido' },
        file: { data, mimetype, name, size: data.length },
      }),
    ).rejects.toThrow()
  })
})
