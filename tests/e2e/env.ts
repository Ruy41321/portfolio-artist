import 'dotenv/config'
import path from 'node:path'

export const E2E_PORT = Number(process.env.E2E_PORT || 3100)
export const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${E2E_PORT}`

export const adminUser = { email: 'e2e-admin@example.com', password: 'e2e-password-123' }

/** Environment shared by the e2e server, the seed and the tests (test database only). */
export function e2eEnv(): Record<string, string> {
  const databaseUrl = process.env.TEST_DATABASE_URL
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required for e2e tests')
  return {
    DATABASE_URL: databaseUrl,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'e2e-secret',
    PAYLOAD_DB_PUSH: 'false',
    NEXT_PUBLIC_SERVER_URL: E2E_BASE_URL,
    MEDIA_DIR: path.resolve('.e2e-media'),
    SEED_ADMIN_EMAIL: adminUser.email,
    SEED_ADMIN_PASSWORD: adminUser.password,
    SMTP_HOST: '',
    CONTACT_RATE_LIMIT: '50',
    MAX_UPLOAD_MB: '5',
    PORT: String(E2E_PORT),
  }
}
