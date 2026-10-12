import { ValidationError, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { findArtworkBySlug, findPublishedArtworks } from '@/lib/queries'
import type { Category, Media } from '@/payload-types'

import {
  createArtwork,
  createCategory,
  createTestImage,
  getTestPayload,
  resetContent,
} from '../helpers/payload'

let payload: Payload
let image: Media
let category: Category

describe('Artworks', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  beforeEach(async () => {
    await resetContent(payload)
    image = await createTestImage(payload)
    category = await createCategory(payload, 'Pittura')
  })

  afterAll(async () => {
    await resetContent(payload)
    await payload.destroy()
  })

  it('creates an artwork with a slug generated from the title', async () => {
    const artwork = await createArtwork(payload, {
      title: 'Mattino sul lago',
      category: category.id,
      images: [image.id],
      year: 2025,
    })
    expect(artwork.slug).toBe('mattino-sul-lago')
    expect(artwork._status).toBe('published')
  })

  it('keeps slugs unique by adding a numeric suffix', async () => {
    const first = await createArtwork(payload, {
      title: 'Isola',
      category: category.id,
      images: [image.id],
    })
    const second = await createArtwork(payload, {
      title: 'Isola',
      category: category.id,
      images: [image.id],
    })
    expect(first.slug).toBe('isola')
    expect(second.slug).toBe('isola-2')

    const updated = await payload.update({
      collection: 'artworks',
      id: first.id,
      data: { dimensions: '30 × 30 cm' },
      locale: 'it',
    })
    expect(updated.slug).toBe('isola')
  })

  it('requires at least one image with a clear Italian message', async () => {
    const error = await createArtwork(payload, {
      title: 'Senza immagini',
      category: category.id,
      images: [],
    }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    const messages = (error as ValidationError).data.errors.map((e) => e.message)
    expect(messages).toContain('Aggiungi almeno un’immagine dell’opera.')
  })

  it('does not expose drafts to the public', async () => {
    await createArtwork(
      payload,
      { title: 'Bozza segreta', category: category.id, images: [image.id] },
      'draft',
    )
    await createArtwork(payload, {
      title: 'Opera pubblica',
      category: category.id,
      images: [image.id],
    })

    const publicList = await findPublishedArtworks(payload, 'it')
    expect(publicList.map((a) => a.title)).toEqual(['Opera pubblica'])
    expect(await findArtworkBySlug(payload, 'it', 'bozza-segreta')).toBeNull()

    const anonymous = await payload.find({ collection: 'artworks', overrideAccess: false })
    expect(anonymous.docs.map((a) => a.title)).toEqual(['Opera pubblica'])
  })

  it('stores localized fields and falls back to Italian', async () => {
    const artwork = await createArtwork(payload, {
      title: 'Campo d’estate',
      technique: 'Olio su tela',
      category: category.id,
      images: [image.id],
    })
    await payload.update({
      collection: 'artworks',
      id: artwork.id,
      locale: 'en',
      data: { title: 'Summer field', technique: 'Oil on canvas' },
    })

    const en = await findArtworkBySlug(payload, 'en', artwork.slug!)
    const it = await findArtworkBySlug(payload, 'it', artwork.slug!)
    expect(en?.title).toBe('Summer field')
    expect(en?.technique).toBe('Oil on canvas')
    expect(en?.shortDescription).toBe('Descrizione breve') // fallback to Italian
    expect(it?.title).toBe('Campo d’estate')
  })
})
