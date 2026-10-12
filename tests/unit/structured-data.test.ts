import { describe, expect, it } from 'vitest'

import { paragraphs } from '@/lib/richtext'
import { artworkJsonLd, personJsonLd, serializeJsonLd } from '@/lib/structured-data'
import type { Artwork, Media, Profile } from '@/payload-types'

const image = {
  id: 1,
  alt: 'Lago al mattino',
  url: 'http://localhost:3000/api/media/file/lago.jpg',
  mimeType: 'image/jpeg',
  width: 1600,
  height: 2000,
  sizes: { large: { url: '/api/media/file/lago-1600x2000.jpg', width: 1600, height: 2000 } },
} as unknown as Media

const profile = {
  id: 1,
  name: 'Artista Demo',
  tagline: 'Pittrice',
  email: 'studio@example.com',
  location: 'Milano',
  bio: paragraphs('Biografia di prova.'),
  socials: [{ id: 'a', platform: 'instagram', url: 'https://instagram.com/demo' }],
} as unknown as Profile

const artwork = {
  id: 7,
  title: 'Mattino sul lago',
  slug: 'mattino-sul-lago',
  year: 2025,
  technique: 'Olio su tela',
  dimensions: '80 × 100 cm',
  shortDescription: 'Il colore dell’acqua all’alba.',
  category: { id: 2, name: 'Pittura' },
  images: [image],
  availability: 'available',
} as unknown as Artwork

describe('JSON-LD', () => {
  it('describes the artist as a schema.org Person', () => {
    const data = personJsonLd('it', profile)
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Artista Demo',
      url: 'http://localhost:3000/it',
      email: 'mailto:studio@example.com',
      sameAs: ['https://instagram.com/demo'],
      homeLocation: { '@type': 'Place', name: 'Milano' },
    })
    expect(data.description).toBe('Biografia di prova.')
  })

  it('describes an artwork as a schema.org VisualArtwork linked to its creator', () => {
    const data = artworkJsonLd('en', artwork, profile)
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: 'Mattino sul lago',
      url: 'http://localhost:3000/en/opere/mattino-sul-lago',
      image: ['http://localhost:3000/api/media/file/lago-1600x2000.jpg'],
      dateCreated: '2025',
      artMedium: 'Olio su tela',
      artform: 'Pittura',
      size: '80 × 100 cm',
      inLanguage: 'en',
      creator: { '@type': 'Person', name: 'Artista Demo' },
    })
    expect(Object.values(data)).not.toContain(undefined)
  })

  it('serializes safely inside a script tag', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(json).not.toContain('</script>')
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>')
  })
})
