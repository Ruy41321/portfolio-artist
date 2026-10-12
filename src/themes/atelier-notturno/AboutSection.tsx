import { ArtImage } from '@/components/ui/ArtImage'
import { RichText } from '@/components/ui/RichText'
import { asMedia, imageData, localMediaUrl } from '@/lib/media'
import type { SiteContext } from '@/themes/types'

export function AboutSection({ dict, profile }: SiteContext) {
  const portrait = imageData(asMedia(profile.portrait), 'card')
  const cvPdf = asMedia(profile.cvPdf)
  const hasBio = Boolean(profile.bio?.root?.children?.length)
  const isEmpty = !portrait && !hasBio && !profile.statement && !profile.cv?.length

  return (
    <section className="page" id="about" aria-labelledby="about-title">
      <h2 id="about-title" className="section-title">
        {dict.nav.about}
      </h2>
      {isEmpty ? (
        <div className="empty-state">
          <p className="empty-state__title">{dict.about.emptyTitle}</p>
          <p>{dict.about.emptyText}</p>
        </div>
      ) : (
        <div className={`about${portrait ? '' : ' about--no-portrait'}`}>
          {portrait && (
            <div className="about__portrait">
              <ArtImage
                image={portrait}
                alt={portrait.alt || `${dict.about.portraitAlt} ${profile.name}`}
                sizes="(max-width: 900px) 280px, 220px"
                priority
              />
            </div>
          )}
          <div className="about__text">
            <RichText value={profile.bio} className="prose" />
            {profile.statement && (
              <blockquote className="statement">{profile.statement}</blockquote>
            )}
            {profile.cv && profile.cv.length > 0 && (
              <dl className="cv">
                {profile.cv.map((entry) => (
                  <div key={entry.id ?? `${entry.year}-${entry.text}`} className="cv__row">
                    <dt>{entry.year}</dt>
                    <dd>{entry.text}</dd>
                  </div>
                ))}
              </dl>
            )}
            {cvPdf?.url && (
              <p className="cv-download">
                <a href={localMediaUrl(cvPdf.url)} target="_blank" rel="noopener">
                  {dict.about.downloadCv} ↗
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
