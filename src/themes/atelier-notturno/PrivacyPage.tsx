import { RichText } from '@/components/ui/RichText'
import type { SimplePageProps } from '@/themes/types'

export function PrivacyPage({ dict, settings }: SimplePageProps) {
  const hasText = Boolean(settings.privacy?.root?.children?.length)
  return (
    <section className="page" aria-labelledby="privacy-title">
      <h1 id="privacy-title" className="page-title">
        {dict.privacy.title}
      </h1>
      {hasText ? (
        <RichText value={settings.privacy} className="prose" />
      ) : (
        <p>{dict.privacy.fallback}</p>
      )}
    </section>
  )
}
