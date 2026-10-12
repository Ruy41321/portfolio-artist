import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { safePreviewTarget } from '@/lib/preview'

export const dynamic = 'force-dynamic'

/** Enables draft mode for logged-in admin users and opens the requested page. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const target = safePreviewTarget(url.searchParams.get('path'))

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response('Accedi al pannello di amministrazione per vedere l’anteprima.', {
      status: 401,
    })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(target)
}
