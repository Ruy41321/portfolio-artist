import type { ServerProps } from 'payload'

import { pick } from './text'
import './admin.scss'

/** "View site" link at the bottom of the admin navigation. */
export default function ViewSiteLink({ i18n }: ServerProps) {
  return (
    <a className="pa-nav-link" href="/" target="_blank" rel="noopener">
      {pick(i18n?.language, { it: 'Vedi il sito ↗', en: 'View site ↗' })}
    </a>
  )
}
