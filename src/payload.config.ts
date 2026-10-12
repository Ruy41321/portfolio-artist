import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { it } from '@payloadcms/translations/languages/it'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Artworks } from './collections/Artworks'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Users } from './collections/Users'
import { Profile } from './globals/Profile'
import { SiteSettings } from './globals/SiteSettings'
import { defaultLocale, localeLabels, locales } from './i18n/config'
import { getServerURL } from './lib/env'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const secret = process.env.PAYLOAD_SECRET
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET must be set in production')
}

const maxUploadMB = Number(process.env.MAX_UPLOAD_MB || 20)

export default buildConfig({
  serverURL: getServerURL(),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Artworks, Categories, Media, Messages, Users],
  globals: [Profile, SiteSettings],
  localization: {
    locales: locales.map((code) => ({ code, label: localeLabels[code] })),
    defaultLocale,
    fallback: true,
  },
  i18n: {
    supportedLanguages: { it, en },
    fallbackLanguage: 'it',
  },
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
    // Tests (and anyone who sets PAYLOAD_DB_PUSH=false) build the schema from migrations only.
    push: process.env.PAYLOAD_DB_PUSH === 'false' ? false : undefined,
  }),
  upload: {
    limits: { fileSize: maxUploadMB * 1024 * 1024 },
  },
  sharp,
  telemetry: false,
  plugins: [],
})
