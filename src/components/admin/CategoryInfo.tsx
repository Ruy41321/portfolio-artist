import type { Payload } from 'payload'

import { pick } from './text'
import './admin.scss'

type Props = {
  payload: Payload
  data?: { id?: number | string } | null
  i18n?: { language?: string }
}

/** Shown in the category form: how many works use it and what happens if it is deleted. */
export default async function CategoryInfo({ payload, data, i18n }: Props) {
  const lang = i18n?.language
  const id = data?.id
  if (!id) {
    return (
      <div className="pa-info">
        <p>
          {pick(lang, {
            it: 'Scrivi il nome e salva. La categoria comparirà come filtro sul sito appena avrà almeno un’opera pubblicata.',
            en: 'Type the name and save. The category appears as a filter once it has at least one published artwork.',
          })}
        </p>
      </div>
    )
  }

  const { totalDocs } = await payload.count({
    collection: 'artworks',
    where: { category: { equals: id } },
  })
  return (
    <div className={`pa-info${totalDocs > 0 ? ' pa-info--warning' : ''}`}>
      <p>
        {totalDocs === 0
          ? pick(lang, {
              it: 'Nessuna opera usa questa categoria: non compare sul sito e puoi eliminarla senza problemi.',
              en: 'No artwork uses this category: it is not shown on the site and can be safely deleted.',
            })
          : pick(lang, {
              it: `${totalDocs === 1 ? 'Un’opera usa' : `${totalDocs} opere usano`} questa categoria. Se la elimini, le opere non vengono cancellate: restano senza categoria e sul sito compaiono solo in "Tutti".`,
              en: `${totalDocs} artwork(s) use this category. If you delete it, the artworks are kept without a category and only appear under "All".`,
            })}
      </p>
    </div>
  )
}
