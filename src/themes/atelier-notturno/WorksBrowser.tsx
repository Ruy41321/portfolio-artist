'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Lightbox, type LightboxItem } from '@/components/ui/Lightbox'
import type { Locale } from '@/i18n/config'
import type { WorkItem } from '@/lib/works'

type View = 'gallery' | 'cards'

type Props = {
  locale: Locale
  items: WorkItem[]
  categories: { id: number; name: string }[]
  defaultView: View
  labels: {
    all: string
    filters: string
    view: string
    gallery: string
    cards: string
    noResults: string
    showMore: string
    lightbox: { label: string; close: string; previous: string; next: string; details: string }
  }
}

const VIEW_STORAGE_KEY = 'portfolio.worksView'
const ALL = 'all'
/** Works rendered at first and added each time the visitor reaches the end of the grid. */
const PAGE_SIZE = 24

function readStoredView(): View | null {
  try {
    const value = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return value === 'gallery' || value === 'cards' ? value : null
  } catch {
    return null
  }
}

function meta(item: WorkItem): string {
  return [item.technique, item.dimensions].filter(Boolean).join(' · ')
}

function objectPosition(item: WorkItem): string | undefined {
  const { cover } = item
  return cover?.focalX !== undefined && cover?.focalY !== undefined
    ? `${cover.focalX}% ${cover.focalY}%`
    : undefined
}

/** Category filters, Gallery/Cards switch, works grid and lightbox (with URL sync). */
export function WorksBrowser({ locale, items, categories, defaultView, labels }: Props) {
  const [category, setCategory] = useState<string>(ALL)
  const [view, setView] = useState<View>(defaultView)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [renderCount, setRenderCount] = useState(PAGE_SIZE)
  const sentinel = useRef<HTMLDivElement>(null)
  const pushedHistory = useRef(false)
  const baseUrl = useRef<string>(`/${locale}`)

  useEffect(() => {
    const stored = readStoredView()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the visitor's saved preference after hydration
    if (stored) setView(stored)
  }, [])

  const changeView = (next: View) => {
    setView(next)
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next)
    } catch {
      // Storage unavailable (private mode): the choice simply is not remembered.
    }
  }

  const visible = useMemo(
    () => (category === ALL ? items : items.filter((i) => String(i.categoryId) === category)),
    [category, items],
  )

  const rendered = visible.slice(0, renderCount)
  const hasMore = renderCount < visible.length
  const showMore = useCallback(() => setRenderCount((count) => count + PAGE_SIZE), [])

  useEffect(() => {
    const target = sentinel.current
    if (!target || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) showMore()
      },
      { rootMargin: '800px 0px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, showMore, renderCount])

  const selectCategory = (id: string) => {
    setCategory(id)
    setRenderCount(PAGE_SIZE)
  }

  const close = useCallback(() => {
    setOpenIndex(null)
    if (pushedHistory.current) {
      pushedHistory.current = false
      window.history.back()
    } else {
      window.history.replaceState(null, '', baseUrl.current)
    }
  }, [])

  const open = (index: number) => {
    const item = visible[index]
    if (!item) return
    baseUrl.current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    window.history.pushState({ lightbox: item.slug }, '', item.href)
    pushedHistory.current = true
    setOpenIndex(index)
  }

  const navigate = useCallback(
    (index: number) => {
      const item = visible[index]
      if (!item) return
      window.history.replaceState({ lightbox: item.slug }, '', item.href)
      setOpenIndex(index)
    },
    [visible],
  )

  useEffect(() => {
    const onPopState = () => {
      if (pushedHistory.current) {
        pushedHistory.current = false
        setOpenIndex(null)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      visible.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.large,
        details: (
          <>
            <h3 className="lightbox__title">{item.title}</h3>
            {item.year && <p className="lightbox__year">{item.year}</p>}
            {meta(item) && <p>{meta(item)}</p>}
            {item.shortDescription && <p className="lightbox__desc">{item.shortDescription}</p>}
            <p className="tags">
              {item.categoryName && <span>{item.categoryName}</span>}
              <span className={`tag--${item.availability}`}>{item.availabilityLabel}</span>
              {item.price && <span>{item.price}</span>}
            </p>
            <a className="lightbox__link" href={item.href}>
              {labels.lightbox.details} →
            </a>
          </>
        ),
      })),
    [visible, labels.lightbox.details],
  )

  const onCardClick = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    open(index)
  }

  return (
    <>
      <div className="toolbar">
        <div className="filters" role="group" aria-label={labels.filters}>
          {[
            { id: ALL, name: labels.all },
            ...categories.map((c) => ({ ...c, id: String(c.id) })),
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              className={category === c.id ? 'is-on' : undefined}
              onClick={() => selectCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="view-toggle" role="group" aria-label={labels.view}>
          <button
            type="button"
            aria-pressed={view === 'gallery'}
            className={view === 'gallery' ? 'is-on' : undefined}
            onClick={() => changeView('gallery')}
            title={labels.gallery}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="6" height="9" />
              <rect x="9" y="1" width="6" height="5" />
              <rect x="1" y="12" width="6" height="3" />
              <rect x="9" y="8" width="6" height="7" />
            </svg>
            <span className="view-toggle__label">{labels.gallery}</span>
          </button>
          <button
            type="button"
            aria-pressed={view === 'cards'}
            className={view === 'cards' ? 'is-on' : undefined}
            onClick={() => changeView('cards')}
            title={labels.cards}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="6" height="4" />
              <rect x="1" y="6" width="6" height="2" />
              <rect x="9" y="1" width="6" height="4" />
              <rect x="9" y="6" width="6" height="2" />
              <rect x="1" y="10" width="6" height="4" />
              <rect x="9" y="10" width="6" height="4" />
            </svg>
            <span className="view-toggle__label">{labels.cards}</span>
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">{labels.noResults}</p>
      ) : view === 'gallery' ? (
        <ul className="masonry" data-view="gallery">
          {rendered.map((item, index) => (
            <li key={item.id} className="masonry__item">
              <a href={item.href} className="work-card" onClick={(e) => onCardClick(e, index)}>
                {item.cover && (
                  <Image
                    src={item.cover.url}
                    width={item.cover.width}
                    height={item.cover.height}
                    alt={item.cover.alt}
                    sizes="(max-width: 700px) 100vw, (max-width: 1400px) 50vw, 33vw"
                    placeholder={item.cover.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={item.cover.blurDataURL}
                    priority={index < 3}
                    className="work-card__image"
                  />
                )}
                <span className="work-card__caption">
                  <span className="work-card__title">{item.title}</span>
                  {item.year && <span className="work-card__year">{item.year}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="cards" data-view="cards">
          {rendered.map((item, index) => (
            <li key={item.id}>
              <a href={item.href} className="card" onClick={(e) => onCardClick(e, index)}>
                <span className="card__thumb">
                  {item.cover && (
                    <Image
                      src={item.cover.url}
                      fill
                      alt={item.cover.alt}
                      sizes="(max-width: 700px) 100vw, (max-width: 1400px) 50vw, 33vw"
                      placeholder={item.cover.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={item.cover.blurDataURL}
                      priority={index < 3}
                      style={{ objectFit: 'cover', objectPosition: objectPosition(item) }}
                    />
                  )}
                </span>
                <span className="card__body">
                  <span className="card__title">
                    <span>{item.title}</span>
                    {item.year && <span className="card__year">{item.year}</span>}
                  </span>
                  <span className="card__text">
                    {meta(item)}
                    {meta(item) && item.shortDescription ? '. ' : ''}
                    {item.shortDescription}
                  </span>
                  <span className="tags">
                    {item.categoryName && <span>{item.categoryName}</span>}
                    <span className={`tag--${item.availability}`}>{item.availabilityLabel}</span>
                    {item.price && <span>{item.price}</span>}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div ref={sentinel} className="works-more">
          <button type="button" className="works-more__button" onClick={showMore}>
            {labels.showMore}
          </button>
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          items={lightboxItems}
          index={openIndex}
          labels={labels.lightbox}
          onClose={close}
          onNavigate={navigate}
        />
      )}
    </>
  )
}
