import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/env'

// Uses the runtime public URL, not the one at build time.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/media/file/'],
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
