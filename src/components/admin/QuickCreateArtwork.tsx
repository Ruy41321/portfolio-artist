'use client'

import { Button, useConfig, useDocumentInfo, useFormFields, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { pick } from './text'
import './admin.scss'

/** Button in the image form: creates a draft artwork that uses this image and opens it. */
export default function QuickCreateArtwork() {
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const { i18n } = useTranslation()
  const router = useRouter()
  const mimeType = useFormFields(([fields]) => fields?.mimeType?.value as string | undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lang = i18n?.language

  if (!id || (mimeType && !mimeType.startsWith('image/'))) return null

  const onClick = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${config.serverURL}${config.routes.api}/artworks/from-media/${id}`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(String(res.status))
      const { id: artworkId } = (await res.json()) as { id: number }
      router.push(`${config.routes.admin}/collections/artworks/${artworkId}`)
    } catch {
      setError(
        pick(lang, {
          it: 'Non è stato possibile creare l’opera. Riprova.',
          en: 'Could not create the artwork. Please try again.',
        }),
      )
      setBusy(false)
    }
  }

  return (
    <div className="pa-quick-create">
      <Button buttonStyle="secondary" disabled={busy} onClick={onClick}>
        {pick(lang, {
          it: 'Crea un’opera da questa immagine',
          en: 'Create an artwork from this image',
        })}
      </Button>
      <p>
        {error ??
          pick(lang, {
            it: 'Crea una bozza di opera con questa immagine: poi completi titolo, tecnica e descrizione.',
            en: 'Creates a draft artwork with this image; then fill in title, technique and description.',
          })}
      </p>
    </div>
  )
}
