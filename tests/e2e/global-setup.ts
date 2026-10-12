import { execSync } from 'node:child_process'
import fs from 'node:fs'

import pg from 'pg'

import { e2eEnv } from './env'

/**
 * Prepares a clean, seeded test database before the e2e run:
 * drop schema → migrations → demo seed (with the e2e admin user).
 */
export default async function globalSetup(): Promise<void> {
  const env = e2eEnv()
  const client = new pg.Client({ connectionString: env.DATABASE_URL })
  await client.connect()
  await client.query('drop schema if exists public cascade; create schema public;')
  await client.end()

  fs.rmSync(env.MEDIA_DIR, { recursive: true, force: true })
  execSync('pnpm seed', { stdio: 'inherit', env: { ...process.env, ...env } })
}
