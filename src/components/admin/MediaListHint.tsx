import type { ServerProps } from 'payload'

import { pick } from './text'
import './admin.scss'

/** Hint above the media list explaining how to upload many images at once. */
export default function MediaListHint({ i18n }: ServerProps) {
  return (
    <div className="pa-info">
      <p>
        {pick(i18n?.language, {
          it: 'Per caricare tante immagini insieme usa il pulsante "Caricamento in Blocco" qui sopra e trascina le foto. Poi apri un’immagine e premi "Crea un’opera da questa immagine".',
          en: 'To upload many images at once use the "Bulk Upload" button above and drop your photos. Then open an image and press "Create an artwork from this image".',
        })}
      </p>
    </div>
  )
}
