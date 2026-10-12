import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import { paragraphs } from '@/lib/richtext'
import config from '@/payload.config'
import type { Artwork, Category, Media } from '@/payload-types'

export async function getTestPayload(): Promise<Payload> {
  return getPayload({ config: await config })
}

/** Removes every document from the content collections (test database only). */
export async function resetContent(payload: Payload): Promise<void> {
  for (const collection of ['messages', 'artworks', 'categories', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
  }
}

export async function createTestImage(payload: Payload, name = 'test.jpg'): Promise<Media> {
  const data = await sharp({
    create: { width: 64, height: 48, channels: 3, background: { r: 200, g: 120, b: 40 } },
  })
    .jpeg()
    .toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt: 'Immagine di prova' },
    file: { data, mimetype: 'image/jpeg', name, size: data.length },
  })
}

export async function createCategory(payload: Payload, name: string): Promise<Category> {
  return payload.create({ collection: 'categories', data: { name }, locale: 'it' })
}

export async function createArtwork(
  payload: Payload,
  data: Partial<Artwork> & { title: string; category: number; images: number[] },
  status: 'draft' | 'published' = 'published',
): Promise<Artwork> {
  return payload.create({
    collection: 'artworks',
    locale: 'it',
    draft: status === 'draft',
    data: {
      technique: 'Olio su tela',
      shortDescription: 'Descrizione breve',
      description: paragraphs('Descrizione completa'),
      availability: 'available',
      ...data,
      _status: status,
    },
  })
}
