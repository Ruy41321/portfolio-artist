import type { Field, FieldHook, Where } from 'payload'

import { defaultLocale } from '@/i18n/config'
import { slugify } from '@/lib/slugify'

import { t } from '@/i18n/admin'

/**
 * Generates a unique slug from `sourceField` (in the default language) when the slug is empty.
 * If the slug is already used by another document a numeric suffix is added (-2, -3…).
 */
const formatSlug =
  (sourceField: string, collection: string): FieldHook =>
  async ({ value, data, originalDoc, req, operation }) => {
    const locale = req.locale
    let base = typeof value === 'string' ? slugify(value) : ''

    if (!base) {
      if (locale && locale !== defaultLocale) return originalDoc?.slug ?? value
      const source = data?.[sourceField] ?? originalDoc?.[sourceField]
      base = typeof source === 'string' ? slugify(source) : ''
    }
    if (!base) return value

    const currentId = originalDoc?.id ?? data?.id
    let candidate = base
    for (let attempt = 2; attempt < 1000; attempt++) {
      const where: Where = { slug: { equals: candidate } }
      if (operation === 'update' && currentId) where.id = { not_equals: currentId }
      const existing = await req.payload.find({
        collection: collection as 'artworks',
        where,
        limit: 1,
        depth: 0,
        draft: true,
        pagination: false,
        req,
        overrideAccess: true,
      })
      if (existing.docs.length === 0) return candidate
      candidate = `${base}-${attempt}`
    }
    return `${base}-${Date.now()}`
  }

export function slugField(sourceField: string, collection: string): Field {
  return {
    name: 'slug',
    type: 'text',
    label: t('Indirizzo della pagina', 'Page address'),
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: t(
        'Si crea da solo dal titolo. Compare nel link della pagina (es. /it/opere/mattino-sul-lago). Cambialo solo se serve.',
        'Generated from the title. It appears in the page link (e.g. /en/opere/morning-on-the-lake). Change it only if needed.',
      ),
    },
    hooks: {
      beforeValidate: [formatSlug(sourceField, collection)],
    },
  }
}
