import path from 'path'
import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { t } from '@/i18n/admin'
import { requiredInDefaultLocale } from '@/fields/validation'

export const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const documentMimeTypes = ['application/pdf']

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: t('Immagine o file', 'Media file'), plural: t('Immagini e file', 'Media') },
  admin: {
    group: t('Portfolio', 'Portfolio'),
    description: t(
      'Tutte le immagini e i PDF caricati. Puoi trascinare qui più immagini insieme.',
      'All uploaded images and PDFs. You can drop several images at once.',
    ),
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    mimeTypes: [...imageMimeTypes, ...documentMimeTypes],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 400, withoutEnlargement: true },
      { name: 'card', width: 900, withoutEnlargement: true },
      { name: 'large', width: 2000, withoutEnlargement: true },
      { name: 'og', width: 1200, height: 630, position: 'centre', withoutEnlargement: false },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: t('Descrizione dell’immagine', 'Image description'),
      validate: requiredInDefaultLocale(
        'Scrivi una breve descrizione di cosa si vede: aiuta chi non vede le immagini e Google.',
      ),
      admin: {
        description: t(
          'Una frase su cosa mostra l’immagine (es. "Dipinto a olio di un lago al mattino"). Per un PDF scrivi il titolo del documento.',
          'One sentence on what the image shows. For a PDF write the document title.',
        ),
      },
    },
  ],
}
