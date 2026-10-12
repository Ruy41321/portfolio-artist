import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { requiredInDefaultLocale } from '@/fields/validation'
import { t } from '@/i18n/admin'

export const socialPlatforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'threads', label: 'Threads' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'behance', label: 'Behance' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'website', label: t('Sito web', 'Website') },
  { value: 'other', label: t('Altro', 'Other') },
]

export const cvEntryTypes = [
  { value: 'exhibition', label: t('Mostra', 'Exhibition') },
  { value: 'award', label: t('Premio', 'Award') },
  { value: 'education', label: t('Formazione', 'Education') },
  { value: 'other', label: t('Altro', 'Other') },
]

export const Profile: GlobalConfig = {
  slug: 'profile',
  label: t('Il mio profilo', 'My profile'),
  admin: {
    group: t('Il mio profilo', 'My profile'),
    description: t(
      'Chi sei: nome, biografia, foto e curriculum. Questi testi compaiono nella sezione Biografia del sito.',
      'Who you are: name, biography, photo and CV, shown in the Biography section.',
    ),
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('Chi sono', 'About me'),
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: t('Nome e cognome', 'Full name'),
              admin: {
                description: t(
                  'Il nome che compare in alto nel sito.',
                  'The name shown at the top of the site.',
                ),
              },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: t('Sottotitolo', 'Tagline'),
              admin: {
                description: t(
                  'Una riga sotto il nome (es. "Pittrice e illustratrice — Milano").',
                  'One line under your name.',
                ),
              },
            },
            {
              name: 'portrait',
              type: 'upload',
              relationTo: 'media',
              label: t('Ritratto', 'Portrait'),
              filterOptions: { mimeType: { contains: 'image' } },
              admin: {
                description: t(
                  'Una tua foto. Sul sito viene mostrata in bianco e nero.',
                  'A photo of you. Shown in black and white.',
                ),
              },
            },
            {
              name: 'bio',
              type: 'richText',
              localized: true,
              label: t('Biografia', 'Biography'),
              validate: requiredInDefaultLocale('Scrivi qualche riga su di te.'),
              admin: {
                description: t(
                  'Racconta chi sei e come lavori.',
                  'Tell who you are and how you work.',
                ),
              },
            },
            {
              name: 'statement',
              type: 'textarea',
              localized: true,
              label: t('Dichiarazione d’artista', 'Artist statement'),
              admin: {
                description: t(
                  'Facoltativo. Una breve frase sulla tua poetica, mostrata in evidenza.',
                  'Optional. A short statement, shown highlighted.',
                ),
              },
            },
            {
              name: 'location',
              type: 'text',
              localized: true,
              label: t('Dove lavori', 'Location'),
              admin: { description: t('Es. "Milano, Italia".', 'E.g. "Milan, Italy".') },
            },
          ],
        },
        {
          label: t('Curriculum', 'CV'),
          fields: [
            {
              name: 'cv',
              type: 'array',
              label: t('Voci del curriculum', 'CV entries'),
              labels: { singular: t('Voce', 'Entry'), plural: t('Voci', 'Entries') },
              admin: {
                description: t(
                  'Mostre, premi e formazione. Aggiungi una riga per ogni voce; trascinale per ordinarle.',
                  'Exhibitions, awards and education. One row per entry; drag to reorder.',
                ),
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'year',
                      type: 'text',
                      required: true,
                      label: t('Anno', 'Year'),
                      admin: {
                        width: '25%',
                        description: t('Es. 2024 o 2019–2021.', 'E.g. 2024 or 2019–2021.'),
                      },
                    },
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      defaultValue: 'exhibition',
                      label: t('Tipo', 'Type'),
                      options: cvEntryTypes,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'text',
                      type: 'text',
                      localized: true,
                      label: t('Descrizione', 'Description'),
                      validate: requiredInDefaultLocale('Scrivi la voce del curriculum.'),
                      admin: {
                        width: '50%',
                        description: t(
                          'Es. "Personale, Galleria Aurora, Torino".',
                          'E.g. "Solo show, Aurora Gallery, Turin".',
                        ),
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'cvPdf',
              type: 'upload',
              relationTo: 'media',
              label: t('Curriculum in PDF', 'CV as PDF'),
              filterOptions: { mimeType: { equals: 'application/pdf' } },
              admin: {
                description: t(
                  'Facoltativo. Se lo carichi, sul sito compare il link "Scarica il CV".',
                  'Optional. Adds a "Download CV" link.',
                ),
              },
            },
          ],
        },
        {
          label: t('Contatti e social', 'Contacts and social'),
          fields: [
            {
              name: 'email',
              type: 'email',
              label: t('Email pubblica', 'Public email'),
              admin: {
                description: t(
                  'L’indirizzo mostrato sul sito. I messaggi del modulo contatti arrivano qui se l’email è configurata.',
                  'Shown on the site. Contact form messages are sent here when email is configured.',
                ),
              },
            },
            {
              name: 'contactIntro',
              type: 'textarea',
              localized: true,
              label: t('Testo della sezione Contatti', 'Contact section text'),
              admin: {
                description: t(
                  'Qualche riga di invito (es. "Per commissioni e mostre scrivimi").',
                  'A short invitation text.',
                ),
              },
            },
            {
              name: 'socials',
              type: 'array',
              label: t('Social e link', 'Social links'),
              labels: { singular: t('Link', 'Link'), plural: t('Link', 'Links') },
              admin: {
                description: t(
                  'I tuoi profili social, mostrati in basso nel menu.',
                  'Your social profiles, shown in the menu.',
                ),
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      label: t('Piattaforma', 'Platform'),
                      options: socialPlatforms,
                      admin: { width: '30%' },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      label: t('Indirizzo (link)', 'URL'),
                      validate: (value: unknown) =>
                        typeof value === 'string' && /^https?:\/\/\S+$/i.test(value.trim())
                          ? true
                          : 'Incolla il link completo, che inizia con https://',
                      admin: {
                        width: '70%',
                        description: t(
                          'Es. https://instagram.com/tuonome',
                          'E.g. https://instagram.com/yourname',
                        ),
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
