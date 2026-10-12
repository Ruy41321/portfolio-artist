/**
 * Runs once when the Next.js server starts.
 * In production it initializes Payload eagerly so that pending database
 * migrations (`prodMigrations` in payload.config.ts) are applied at boot,
 * before the first request is served.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  await getPayload({ config })
}
