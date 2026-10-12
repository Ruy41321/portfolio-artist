import { Forbidden, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getTestPayload, resetContent } from '../helpers/payload'

let payload: Payload

describe('Access control', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    await resetContent(payload)
  })

  afterAll(async () => {
    await resetContent(payload)
    await payload.destroy()
  })

  it('does not let the public create or read messages through the API', async () => {
    await expect(
      payload.create({
        collection: 'messages',
        overrideAccess: false,
        data: { name: 'Mario', email: 'mario@example.com', message: 'Ciao' },
      }),
    ).rejects.toBeInstanceOf(Forbidden)

    await payload.create({
      collection: 'messages',
      data: { name: 'Mario', email: 'mario@example.com', message: 'Ciao' },
    })
    await expect(
      payload.find({ collection: 'messages', overrideAccess: false }),
    ).rejects.toBeInstanceOf(Forbidden)
  })

  it('lets the public read the profile and site settings but not change them', async () => {
    await expect(
      payload.findGlobal({ slug: 'profile', overrideAccess: false }),
    ).resolves.toBeDefined()
    await expect(
      payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    ).resolves.toBeDefined()
    await expect(
      payload.updateGlobal({ slug: 'profile', overrideAccess: false, data: { name: 'Hacker' } }),
    ).rejects.toBeInstanceOf(Forbidden)
  })

  it('does not let the public list users', async () => {
    await expect(
      payload.find({ collection: 'users', overrideAccess: false }),
    ).rejects.toBeInstanceOf(Forbidden)
  })
})
