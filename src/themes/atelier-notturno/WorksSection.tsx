import { toWorkItem } from '@/lib/works'
import type { HomePageProps } from '@/themes/types'

import { WorksBrowser } from './WorksBrowser'

export function WorksSection({ locale, dict, settings, artworks, categories }: HomePageProps) {
  const items = artworks.map((artwork) => toWorkItem(artwork, { locale, dict, settings }))

  return (
    <section className="page page--wide" id="works" aria-labelledby="works-title">
      <h2 id="works-title" className="section-title">
        {dict.nav.works}
      </h2>
      {items.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">{dict.works.empty}</p>
          <p>{dict.works.emptyHint}</p>
        </div>
      ) : (
        <WorksBrowser
          locale={locale}
          items={items}
          categories={categories.map((c) => ({ id: c.id, name: c.name ?? '' }))}
          defaultView={settings.defaultWorksView === 'cards' ? 'cards' : 'gallery'}
          labels={{
            all: dict.works.all,
            filters: dict.works.filtersLabel,
            view: dict.works.viewLabel,
            gallery: dict.works.gallery,
            cards: dict.works.cards,
            noResults: dict.works.noResults,
            lightbox: dict.lightbox,
          }}
        />
      )}
    </section>
  )
}
