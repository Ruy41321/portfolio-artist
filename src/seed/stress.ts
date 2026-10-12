// Stress data for the gallery (`payload run` does not forward arguments, so use env vars):
//   STRESS_COUNT=200 pnpm payload run src/seed/stress.ts
//   STRESS_CLEAN=1 pnpm payload run src/seed/stress.ts
// Adds published artworks (slug prefix "stress-") reusing the demo images.
import config from '@payload-config'
import { getPayload } from 'payload'

import { paragraphs } from '@/lib/richtext'

const payload = await getPayload({ config })

try {
  if (process.env.STRESS_CLEAN === '1') {
    const removed = await payload.delete({
      collection: 'artworks',
      where: { slug: { like: 'stress-' } },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`[stress] removed ${removed.docs.length} artworks`)
  } else {
    const count = Number(process.env.STRESS_COUNT || 200)
    const [media, categories] = await Promise.all([
      payload.find({ collection: 'media', where: { mimeType: { contains: 'image' } }, limit: 50 }),
      payload.find({ collection: 'categories', limit: 50 }),
    ])
    if (!media.docs.length || !categories.docs.length) throw new Error('Run `pnpm seed` first')
    for (let i = 1; i <= count; i++) {
      await payload.create({
        collection: 'artworks',
        locale: 'it',
        context: { disableRevalidate: true },
        data: {
          title: `Opera di prova ${i}`,
          slug: `stress-${i}`,
          images: [media.docs[i % media.docs.length].id],
          category: categories.docs[i % categories.docs.length].id,
          year: 2000 + (i % 26),
          technique: 'Tecnica mista',
          shortDescription: 'Opera generata per il test di carico della galleria.',
          description: paragraphs('Opera generata per il test di carico.'),
          availability: i % 3 === 0 ? 'sold' : 'available',
          _status: 'published',
        },
      })
    }
    payload.logger.info(`[stress] created ${count} artworks`)
  }
} finally {
  await payload.destroy()
}
process.exit(0)
