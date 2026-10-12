// Loads .env and points Payload to the dedicated test database.
import 'dotenv/config'

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}
process.env.PAYLOAD_SECRET ||= 'test-secret'
