import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload

describe('Payload smoke test', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    await payload?.destroy()
  })

  it('loads the config and connects to the database', async () => {
    expect(payload.config.collections.map((c) => c.slug)).toContain('users')
    const users = await payload.find({ collection: 'users', limit: 1 })
    expect(users.docs).toBeInstanceOf(Array)
  })
})
