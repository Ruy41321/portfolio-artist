import type { Endpoint } from 'payload'

/**
 * POST /api/artworks/from-media/:id
 * Creates a draft artwork whose first image is the given media document and
 * returns its id, so the admin can open it and complete the details.
 */
export const artworkFromMedia: Endpoint = {
  path: '/from-media/:id',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const mediaId = Number(req.routeParams?.id)
    if (!Number.isInteger(mediaId)) return Response.json({ error: 'Invalid id' }, { status: 400 })

    const media = await req.payload
      .findByID({ collection: 'media', id: mediaId, depth: 0, req })
      .catch(() => null)
    if (!media || !media.mimeType?.startsWith('image/')) {
      return Response.json({ error: 'Image not found' }, { status: 404 })
    }

    const title = titleFromMedia(media.alt, media.filename)
    const artwork = await req.payload.create({
      collection: 'artworks',
      locale: 'it',
      draft: true,
      data: { title, images: [media.id], _status: 'draft' },
      req,
    })
    return Response.json({ id: artwork.id }, { status: 201 })
  },
}

export function titleFromMedia(alt?: string | null, filename?: string | null): string {
  const fromFile = (filename ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()
  const base = fromFile || alt?.trim() || 'Nuova opera'
  return base.charAt(0).toUpperCase() + base.slice(1)
}
