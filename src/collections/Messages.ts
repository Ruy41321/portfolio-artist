import type { CollectionConfig } from 'payload'

import { authenticated, nobody } from '@/access'
import { t } from '@/i18n/admin'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: t('Messaggio', 'Message'), plural: t('Messaggi', 'Messages') },
  admin: {
    useAsTitle: 'name',
    group: t('Messaggi', 'Messages'),
    defaultColumns: ['name', 'email', 'read', 'createdAt'],
    description: t(
      'I messaggi arrivati dal modulo contatti del sito. Spunta "Letto" quando li hai gestiti.',
      'Messages sent through the contact form. Tick "Read" once handled.',
    ),
  },
  defaultSort: '-createdAt',
  access: {
    read: authenticated,
    // Created only by the contact form server action (Local API with overrideAccess).
    create: nobody,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: t('Nome', 'Name'),
      access: { update: () => false },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: t('Email', 'Email'),
      access: { update: () => false },
      admin: { description: t('Rispondi a questo indirizzo.', 'Reply to this address.') },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: t('Messaggio', 'Message'),
      access: { update: () => false },
    },
    {
      name: 'locale',
      type: 'text',
      label: t('Lingua del sito', 'Site language'),
      access: { update: () => false },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      label: t('Letto', 'Read'),
      admin: {
        position: 'sidebar',
        description: t('Spunta quando hai letto o risposto.', 'Tick when read or answered.'),
      },
    },
  ],
}
