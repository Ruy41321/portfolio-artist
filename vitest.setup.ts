// Shared test environment: dedicated test database, migrations instead of schema push,
// and a temporary media folder.
import 'dotenv/config'
import os from 'os'
import path from 'path'

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}
process.env.PAYLOAD_SECRET ||= 'test-secret'
process.env.PAYLOAD_DB_PUSH = 'false'
process.env.MEDIA_DIR = path.join(os.tmpdir(), 'portfolio-artist-test-media')
process.env.PAYLOAD_DISABLE_REVALIDATE = 'true'
