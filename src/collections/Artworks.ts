import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '@/access'
import { slugField } from '@/fields/slug'
import { requiredInDefaultLocale } from '@/fields/validation'
import { t } from '@/i18n/admin'

export const availabilityOptions = [
  { value: 'available', label: t('Disponibile', 'Available') },
  { value: 'sold', label: t('Venduta', 'Sold') },
  { value: 'private', label: t('Collezione privata', 'Private collection') },
  { value: 'notForSale', label: t('Non in vendita', 'Not for sale') },
] as const

export const SHORT_DESCRIPTION_MAX = 160

export const Artworks: CollectionConfig = {
  slug: 'artworks',
  labels: { singular: t('Opera', 'Artwork'), plural: t('Opere', 'Artworks') },
  orderable: true,
  defaultSort: '_order',
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  admin: {
    useAsTitle: 'title',
    group: t('Portfolio', 'Portfolio'),
    defaultColumns: ['title', 'category', 'year', 'availability', '_status'],
    listSearchableFields: ['title', 'technique'],
    description: t(
      'Le tue opere. Trascina le righe per decidere l’ordine sul sito. Un’opera compare sul sito solo dopo "Pubblica".',
      'Your works. Drag rows to set their order on the site. A work appears on the site only after "Publish".',
    ),
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: t('Titolo', 'Title'),
      validate: requiredInDefaultLocale('Scrivi il titolo dell’opera.'),
      admin: { description: t('Il nome dell’opera.', 'The title of the work.') },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: t('Immagini', 'Images'),
      filterOptions: { mimeType: { contains: 'image' } },
      validate: (value: unknown) =>
        Array.isArray(value) && value.length > 0 ? true : 'Aggiungi almeno un’immagine dell’opera.',
      admin: {
        description: t(
          'Carica una o più foto dell’opera. La prima è la copertina: trascinale per cambiare l’ordine.',
          'Upload one or more photos. The first one is the cover: drag to reorder.',
        ),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          label: t('Categoria', 'Category'),
          validate: (value: unknown) =>
            value ? true : 'Scegli una categoria (es. Pittura). Serve per i filtri del sito.',
          admin: {
            width: '50%',
            description: t(
              'Il filtro in cui compare l’opera.',
              'The filter in which the work appears.',
            ),
          },
        },
        {
          name: 'year',
          type: 'number',
          label: t('Anno', 'Year'),
          min: 1000,
          max: 2100,
          admin: {
            width: '50%',
            description: t('Anno di realizzazione (es. 2025).', 'Year (e.g. 2025).'),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'technique',
          type: 'text',
          localized: true,
          label: t('Tecnica', 'Technique'),
          validate: requiredInDefaultLocale('Scrivi la tecnica (es. "Olio su tela").'),
          admin: {
            width: '50%',
            description: t('Es. "Olio su tela".', 'E.g. "Oil on canvas".'),
          },
        },
        {
          name: 'dimensions',
          type: 'text',
          label: t('Misure', 'Dimensions'),
          admin: {
            width: '50%',
            description: t('Es. "80 × 100 cm". Facoltativo.', 'E.g. "80 × 100 cm". Optional.'),
          },
        },
      ],
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: t('Descrizione breve', 'Short description'),
      maxLength: SHORT_DESCRIPTION_MAX,
      validate: requiredInDefaultLocale('Scrivi una descrizione breve (una o due frasi).'),
      admin: {
        rows: 2,
        description: t(
          `Una o due frasi, al massimo ${SHORT_DESCRIPTION_MAX} caratteri. Compare nelle schede delle opere.`,
          `One or two sentences, up to ${SHORT_DESCRIPTION_MAX} characters. Shown on the cards.`,
        ),
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: t('Descrizione', 'Description'),
      validate: requiredInDefaultLocale('Scrivi la descrizione dell’opera.'),
      admin: {
        description: t(
          'Il testo completo, mostrato nella pagina dell’opera.',
          'The full text, shown on the work page.',
        ),
      },
    },
    slugField('title', 'artworks'),
    {
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'available',
      label: t('Disponibilità', 'Availability'),
      options: availabilityOptions.map((o) => ({ ...o })),
      admin: {
        position: 'sidebar',
        description: t('Compare come etichetta sulla scheda.', 'Shown as a tag on the card.'),
      },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      label: t('Prezzo', 'Price'),
      admin: {
        position: 'sidebar',
        description: t(
          'Facoltativo. Si vede sul sito solo se attivi "Mostra i prezzi" nelle Impostazioni del sito.',
          'Optional. Visible only if "Show prices" is enabled in Site settings.',
        ),
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: t('In evidenza', 'Featured'),
      admin: {
        position: 'sidebar',
        description: t(
          'Le opere in evidenza vengono usate per l’anteprima del sito sui social.',
          'Featured works are used for social previews.',
        ),
      },
    },
  ],
}
