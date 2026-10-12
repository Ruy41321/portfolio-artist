import config from '@payload-config'
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/** Liveness/readiness probe used by Docker: verifies that the database answers. */
export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    await (payload.db as unknown as PostgresAdapter).drizzle.execute(sql`select 1`)
    return Response.json({ status: 'ok' }, { headers: noStore })
  } catch (error) {
    console.error('[health] database check failed:', error instanceof Error ? error.message : error)
    return Response.json({ status: 'error' }, { status: 503, headers: noStore })
  }
}
