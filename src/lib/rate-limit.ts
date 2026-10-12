/**
 * Minimal in-memory sliding-window rate limiter (one app instance per artist,
 * so a process-local store is enough).
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()

  return {
    /** Records a hit for `key` and returns false when the limit is exceeded. */
    check(key: string, now = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
      if (recent.length >= limit) {
        hits.set(key, recent)
        return false
      }
      recent.push(now)
      hits.set(key, recent)
      if (hits.size > 10_000) {
        for (const [k, times] of hits) {
          if (times.every((time) => now - time >= windowMs)) hits.delete(k)
        }
      }
      return true
    },
    reset() {
      hits.clear()
    },
  }
}
