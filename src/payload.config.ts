import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { getServerURL } from './lib/env'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const secret = process.env.PAYLOAD_SECRET
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET must be set in production')
}

export default buildConfig({
  serverURL: getServerURL(),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: secret || 'dev-only-insecure-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // In production the schema is never pushed: migrations run when Payload boots.
    prodMigrations: migrations,
  }),
  sharp,
  telemetry: false,
  plugins: [],
})
