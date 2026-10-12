import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { findFilterCategories, findPublishedArtworks } from '@/lib/queries'
import type { Media } from '@/payload-types'

import {
  createArtwork,
  createCategory,
  createTestImage,
  getTestPayload,
  resetContent,
} from '../helpers/payload'

let payload: Payload
let image: Media

describe('Categories', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  beforeEach(async () => {
    await resetContent(payload)
    image = await createTestImage(payload)
  })

  afterAll(async () => {
    await resetContent(payload)
    await payload.destroy()
  })

  it('reflects a rename in the filters', async () => {
    const category = await createCategory(payload, 'Pittura')
    await createArtwork(payload, { title: 'Uno', category: category.id, images: [image.id] })

    await payload.update({
      collection: 'categories',
      id: category.id,
      locale: 'it',
      data: { name: 'Pittura a olio' },
    })

    const filters = await findFilterCategories(payload, 'it')
    expect(filters.map((c) => c.name)).toEqual(['Pittura a olio'])
    expect(filters[0].slug).toBe('pittura')
  })

  it('keeps the admin order and hides categories without published works', async () => {
    const painting = await createCategory(payload, 'Pittura')
    const drawing = await createCategory(payload, 'Disegno')
    const print = await createCategory(payload, 'Grafica')
    const empty = await createCategory(payload, 'Scultura')
    await createArtwork(payload, { title: 'A', category: drawing.id, images: [image.id] })
    await createArtwork(payload, { title: 'B', category: painting.id, images: [image.id] })
    await createArtwork(payload, { title: 'C', category: print.id, images: [image.id] }, 'draft')

    const filters = await findFilterCategories(payload, 'it')
    expect(filters.map((c) => c.name)).toEqual(['Pittura', 'Disegno'])
    expect(filters.find((c) => c.id === empty.id)).toBeUndefined()
  })

  it('deletes a category that has works, leaving them without a category', async () => {
    const category = await createCategory(payload, 'Illustrazione')
    const artwork = await createArtwork(payload, {
      title: 'Bolla',
      category: category.id,
      images: [image.id],
    })

    await payload.delete({ collection: 'categories', id: category.id })

    const works = await findPublishedArtworks(payload, 'it')
    expect(works.map((w) => w.id)).toEqual([artwork.id])
    expect(works[0].category ?? null).toBeNull()
    expect(await findFilterCategories(payload, 'it')).toEqual([])
  })
})
