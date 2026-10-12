import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { safePreviewTarget } from '@/lib/preview'

export const dynamic = 'force-dynamic'

/** Leaves draft mode and goes back to the published page. */
export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode()
  draft.disable()
  redirect(safePreviewTarget(new URL(request.url).searchParams.get('path')))
}
