import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '@/access'
import { t } from '@/i18n/admin'
import {
  defaultAccentColor,
  defaultFontPairing,
  defaultTheme,
  fontPairingOptions,
  themeOptions,
} from '@/themes/options'

export const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: t('Impostazioni del sito', 'Site settings'),
  admin: {
    group: t('Impostazioni', 'Settings'),
    description: t(
      'Aspetto del sito, opzioni e testi legali.',
      'Site appearance, options and legal texts.',
    ),
  },
  access: { read: anyone, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('Aspetto', 'Appearance'),
          fields: [
            {
              name: 'theme',
              type: 'select',
              required: true,
              defaultValue: defaultTheme,
              label: t('Tema grafico', 'Theme'),
              options: themeOptions.map((o) => ({ ...o })),
              admin: { description: t('Lo stile del sito.', 'The style of the site.') },
            },
            {
              name: 'accentColor',
              type: 'text',
              defaultValue: defaultAccentColor,
              label: t('Colore principale', 'Accent color'),
              validate: (value: unknown) =>
                !value || (typeof value === 'string' && HEX_COLOR.test(value.trim()))
                  ? true
                  : 'Scrivi il colore nel formato #RRGGBB, ad esempio #d7ff3a.',
              admin: {
                description: t(
                  'Il colore dei dettagli (puntino, link, pulsanti). Formato #RRGGBB, es. #d7ff3a.',
                  'Accent color for details. Format #RRGGBB.',
                ),
              },
            },
            {
              name: 'fontPairing',
              type: 'select',
              required: true,
              defaultValue: defaultFontPairing,
              label: t('Caratteri', 'Fonts'),
              options: fontPairingOptions.map((o) => ({ ...o })),
              admin: { description: t('La famiglia di caratteri del sito.', 'Site typefaces.') },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: t('Logo', 'Logo'),
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: {
                    width: '50%',
                    description: t(
                      'Facoltativo. Se manca, si usa il tuo nome.',
                      'Optional. Your name is used otherwise.',
                    ),
                  },
                },
                {
                  name: 'favicon',
                  type: 'upload',
                  relationTo: 'media',
                  label: t('Icona del sito', 'Favicon'),
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: {
                    width: '50%',
                    description: t(
                      'La piccola immagine nella scheda del browser. Meglio quadrata (PNG 512×512).',
                      'The small browser tab icon. Square PNG 512×512 recommended.',
                    ),
                  },
                },
              ],
            },
          ],
        },
        {
          label: t('Opzioni', 'Options'),
          fields: [
            {
              name: 'defaultWorksView',
              type: 'select',
              required: true,
              defaultValue: 'gallery',
              label: t('Vista predefinita delle opere', 'Default works view'),
              options: [
                { value: 'gallery', label: t('Galleria', 'Gallery') },
                { value: 'cards', label: t('Schede', 'Cards') },
              ],
              admin: {
                description: t(
                  'Come si vedono le opere la prima volta. Il visitatore può cambiarla.',
                  'How works are shown at first. Visitors can switch.',
                ),
              },
            },
            {
              name: 'showPrices',
              type: 'checkbox',
              defaultValue: false,
              label: t('Mostra i prezzi', 'Show prices'),
              admin: {
                description: t(
                  'Se attivo, il prezzo delle opere disponibili compare sul sito.',
                  'If enabled, prices of available works are shown.',
                ),
              },
            },
            {
              name: 'currency',
              type: 'select',
              defaultValue: 'EUR',
              label: t('Valuta', 'Currency'),
              options: ['EUR', 'USD', 'GBP', 'CHF'].map((c) => ({ value: c, label: c })),
              admin: { condition: (data) => Boolean(data?.showPrices) },
            },
            {
              name: 'enableContactForm',
              type: 'checkbox',
              defaultValue: true,
              label: t('Attiva il modulo contatti', 'Enable contact form'),
              admin: {
                description: t(
                  'Se disattivo, nella sezione Contatti compare solo la tua email.',
                  'If disabled, only your email is shown.',
                ),
              },
            },
          ],
        },
        {
          label: t('Google e social', 'SEO'),
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  label: t('Titolo del sito', 'Site title'),
                  admin: {
                    description: t(
                      'Il titolo che compare su Google e nella scheda del browser. Se vuoto si usa il tuo nome.',
                      'Title shown on Google. Defaults to your name.',
                    ),
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                  label: t('Descrizione del sito', 'Site description'),
                  maxLength: 300,
                  admin: {
                    description: t(
                      'Una o due frasi che compaiono sotto il titolo nei risultati di Google.',
                      'One or two sentences shown in search results.',
                    ),
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: t('Immagine per i social', 'Social image'),
                  filterOptions: { mimeType: { contains: 'image' } },
                  admin: {
                    description: t(
                      'L’immagine mostrata quando qualcuno condivide il sito (es. su WhatsApp). Se vuota si usa un’opera in evidenza.',
                      'Image shown when the site is shared. Defaults to a featured work.',
                    ),
                  },
                },
              ],
            },
          ],
        },
        {
          label: t('Privacy e statistiche', 'Privacy and analytics'),
          fields: [
            {
              name: 'privacy',
              type: 'richText',
              localized: true,
              label: t('Informativa privacy', 'Privacy policy'),
              admin: {
                description: t(
                  'Il testo della pagina Privacy. Se vuoto, il sito mostra un testo standard.',
                  'Privacy page text. A default text is shown if empty.',
                ),
              },
            },
            {
              name: 'analytics',
              type: 'group',
              label: t('Statistiche delle visite (facoltative)', 'Visit statistics (optional)'),
              admin: {
                description: t(
                  'Solo servizi rispettosi della privacy e senza cookie, così non serve il banner. Lascia vuoto se non li usi.',
                  'Only privacy-friendly, cookie-less services.',
                ),
              },
              fields: [
                {
                  name: 'provider',
                  type: 'select',
                  defaultValue: 'none',
                  label: t('Servizio', 'Provider'),
                  options: [
                    { value: 'none', label: t('Nessuno', 'None') },
                    { value: 'plausible', label: 'Plausible' },
                    { value: 'umami', label: 'Umami' },
                  ],
                },
                {
                  name: 'siteId',
                  type: 'text',
                  label: t('Dominio o ID del sito', 'Domain or site ID'),
                  admin: {
                    condition: (_, sibling) => sibling?.provider && sibling.provider !== 'none',
                    description: t(
                      'Plausible: il dominio (es. miosito.it). Umami: il "Website ID".',
                      'Plausible: the domain. Umami: the Website ID.',
                    ),
                  },
                },
                {
                  name: 'scriptUrl',
                  type: 'text',
                  label: t('Indirizzo dello script', 'Script URL'),
                  validate: (value: unknown) =>
                    !value || (typeof value === 'string' && /^https:\/\/\S+$/i.test(value))
                      ? true
                      : 'Deve essere un indirizzo che inizia con https://',
                  admin: {
                    condition: (_, sibling) => sibling?.provider && sibling.provider !== 'none',
                    description: t(
                      'Facoltativo. Se vuoto si usa quello ufficiale del servizio.',
                      'Optional. Defaults to the official script.',
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
}
