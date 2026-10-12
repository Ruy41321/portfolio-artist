import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access'
import { t } from '@/i18n/admin'
import { getServerURL } from '@/lib/env'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: t('Utente', 'User'), plural: t('Utenti', 'Users') },
  admin: {
    useAsTitle: 'email',
    group: t('Impostazioni', 'Settings'),
    description: t(
      'Le persone che possono entrare in questo pannello.',
      'People who can sign in to this panel.',
    ),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 24 * 7,
    cookies: {
      // Behind HTTPS (reverse proxy) the session cookie is sent over secure connections only.
      secure: getServerURL().startsWith('https://'),
      sameSite: 'Lax',
    },
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: t('Nome', 'Name'),
      admin: { description: t('Facoltativo, solo per riconoscerti.', 'Optional.') },
    },
  ],
}
