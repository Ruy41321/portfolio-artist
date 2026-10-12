// Entry point for `pnpm seed` (executed with `payload run`).
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './index'

const payload = await getPayload({ config })
try {
  await seed(payload)
  payload.logger.info('[seed] done')
} finally {
  await payload.destroy()
}
process.exit(0)
