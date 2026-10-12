import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import type { CacheTag } from '@/lib/cache-tags'

/**
 * On-demand revalidation: when the artist saves something in the admin, the
 * cached public pages are invalidated so the change is visible immediately.
 * Outside a Next.js server (seed script, tests) there is nothing to revalidate.
 */
export async function revalidateSite(tags: CacheTag[]): Promise<void> {
  if (process.env.PAYLOAD_DISABLE_REVALIDATE === 'true') return
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    for (const tag of tags) revalidateTag(tag, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside Next.js (e.g. `pnpm seed`): nothing is cached.
  }
}

export const revalidateCollection =
  (...tags: CacheTag[]): CollectionAfterChangeHook =>
  async ({ doc, context }) => {
    if (!context?.disableRevalidate) await revalidateSite(tags)
    return doc
  }

export const revalidateCollectionDelete =
  (...tags: CacheTag[]): CollectionAfterDeleteHook =>
  async ({ doc, context }) => {
    if (!context?.disableRevalidate) await revalidateSite(tags)
    return doc
  }

export const revalidateGlobal =
  (...tags: CacheTag[]): GlobalAfterChangeHook =>
  async ({ doc, context }) => {
    if (!context?.disableRevalidate) await revalidateSite(tags)
    return doc
  }
