'use server'

import { headers } from 'next/headers'

import { isLocale } from '@/i18n/config'
import { clientIp, submitContactMessage, type ContactResult } from '@/lib/contact'
import { getPayloadClient } from '@/lib/data'

/** Server action behind the public contact form. */
export async function sendContactMessage(
  _previous: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const locale = formData.get('locale')
  const payload = await getPayloadClient()
  return submitContactMessage(
    payload,
    {
      name: formData.get('name') ?? '',
      email: formData.get('email') ?? '',
      message: formData.get('message') ?? '',
    },
    {
      ip: clientIp(await headers()),
      locale: isLocale(locale) ? locale : 'it',
      honeypot: (formData.get('website') as string | null) || null,
    },
  )
}
