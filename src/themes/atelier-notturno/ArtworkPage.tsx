import { ArtImage } from '@/components/ui/ArtImage'
import { RichText } from '@/components/ui/RichText'
import { asMedia, imageData } from '@/lib/media'
import { artworkHref, priceLabel } from '@/lib/works'
import type { ArtworkPageProps } from '@/themes/types'

export function ArtworkPage({ locale, dict, settings, artwork, previous, next }: ArtworkPageProps) {
  const images = (artwork.images ?? [])
    .map((image) => imageData(asMedia(image), 'large'))
    .filter((image): image is NonNullable<typeof image> => image !== null)
  const category = typeof artwork.category === 'object' ? artwork.category : null
  const price = priceLabel(artwork, settings, locale)
  const details: [string, string | number | null | undefined][] = [
    [dict.artwork.year, artwork.year],
    [dict.artwork.technique, artwork.technique],
    [dict.artwork.dimensions, artwork.dimensions],
    [dict.artwork.category, category?.name],
    [dict.artwork.price, price],
  ]

  return (
    <article className="artwork" aria-labelledby="artwork-title">
      <p className="artwork__back">
        <a href={`/${locale}#works`}>← {dict.artwork.back}</a>
      </p>
      <div className="artwork__layout">
        <div className="artwork__images">
          {images.map((image, index) => (
            <figure key={image.url} className="artwork__figure">
              <ArtImage
                image={image}
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 60vw"
                alt={
                  image.alt ||
                  `${artwork.title} — ${dict.artwork.image} ${index + 1} ${dict.artwork.of} ${images.length}`
                }
              />
            </figure>
          ))}
        </div>
        <div className="artwork__info">
          <h1 id="artwork-title" className="artwork__title">
            {artwork.title}
          </h1>
          <dl className="artwork__details">
            {details
              .filter(([, value]) => value !== null && value !== undefined && value !== '')
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          <p className="tags">
            <span className={`tag--${artwork.availability}`}>
              {dict.availability[artwork.availability ?? 'available']}
            </span>
          </p>
          <RichText value={artwork.description} className="prose" />
          {settings.enableContactForm !== false && (
            <p className="artwork__inquire">
              <a className="btn" href={`/${locale}#contact`}>
                {dict.artwork.inquire}
              </a>
            </p>
          )}
        </div>
      </div>
      {(previous || next) && (
        <nav className="artwork__pager" aria-label={dict.nav.works}>
          {previous ? (
            <a href={artworkHref(locale, previous.slug ?? '')} rel="prev">
              ← {dict.artwork.previous}
              <span>{previous.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a href={artworkHref(locale, next.slug ?? '')} rel="next" className="artwork__next">
              {dict.artwork.next} →<span>{next.title}</span>
            </a>
          )}
        </nav>
      )}
    </article>
  )
}
