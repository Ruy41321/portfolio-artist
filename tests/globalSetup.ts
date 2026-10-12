// Runs once before all test files: rebuilds the test database from the migrations,
// so that every run also checks that the migrations match the schema.
import type { Migration } from 'payload'

import '../vitest.setup'

export default async function setup(): Promise<void> {
  const [{ getPayload }, { default: config }, { migrations }, { sql }] = await Promise.all([
    import('payload'),
    import('@/payload.config'),
    import('@/migrations'),
    import('@payloadcms/db-postgres'),
  ])
  const payload = await getPayload({ config: await config })
  const db = payload.db as unknown as { drizzle: { execute: (query: unknown) => Promise<unknown> } }
  await db.drizzle.execute(sql`drop schema if exists public cascade; create schema public;`)
  await payload.db.migrate({ migrations: migrations as unknown as Migration[] })
  await payload.destroy()
}
