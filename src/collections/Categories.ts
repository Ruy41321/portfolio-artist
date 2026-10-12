import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { slugField } from '@/fields/slug'
import { requiredInDefaultLocale } from '@/fields/validation'
import { t } from '@/i18n/admin'
import { revalidateCollection, revalidateCollectionDelete } from '@/hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: t('Categoria', 'Category'), plural: t('Categorie', 'Categories') },
  orderable: true,
  defaultSort: '_order',
  admin: {
    useAsTitle: 'name',
    group: t('Portfolio', 'Portfolio'),
    defaultColumns: ['name', 'slug'],
    description: t(
      'Le categorie sono i filtri sopra le opere (es. Pittura, Disegno). Trascina le righe per cambiare l’ordine in cui compaiono sul sito.',
      'Categories are the filters above the works. Drag rows to change their order on the site.',
    ),
  },
  hooks: {
    afterChange: [revalidateCollection('categories', 'artworks')],
    afterDelete: [revalidateCollectionDelete('categories', 'artworks')],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'usage',
      type: 'ui',
      admin: {
        components: { Field: '@/components/admin/CategoryInfo' },
      },
    },
    {
      name: 'name',
      type: 'text',
      localized: true,
      label: t('Nome', 'Name'),
      validate: requiredInDefaultLocale('Scrivi il nome della categoria.'),
      admin: {
        description: t(
          'Come appare nel filtro sul sito (es. "Pittura").',
          'How it appears in the filter on the site.',
        ),
      },
    },
    slugField('name', 'categories'),
  ],
}
