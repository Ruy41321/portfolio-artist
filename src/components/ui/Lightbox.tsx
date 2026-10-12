'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, type ReactNode } from 'react'

import type { ImageData } from '@/lib/media'

export type LightboxItem = {
  id: number
  title: string
  image: ImageData | null
  details: ReactNode
}

type Labels = { label: string; close: string; previous: string; next: string }

type Props = {
  items: LightboxItem[]
  index: number
  labels: Labels
  onClose: () => void
  onNavigate: (index: number) => void
}

const SWIPE_THRESHOLD = 50

/**
 * Accessible full-screen viewer: keyboard navigation (Esc, ←, →), focus trap,
 * focus restore on close and swipe gestures on touch screens.
 */
export function Lightbox({ items, index, labels, onClose, onNavigate }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const item = items[index]
  const hasMany = items.length > 1

  const go = useCallback(
    (delta: number) => onNavigate((index + delta + items.length) % items.length),
    [index, items.length, onNavigate],
  )

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowRight' && hasMany) {
        go(1)
      } else if (event.key === 'ArrowLeft' && hasMany) {
        go(-1)
      } else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, hasMany, onClose])

  if (!item) return null

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${labels.label}: ${item.title}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0]
        touchStart.current = { x: touch.clientX, y: touch.clientY }
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current
        touchStart.current = null
        if (!start || !hasMany) return
        const touch = event.changedTouches[0]
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
      }}
    >
      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose}>
        {labels.close} <span aria-hidden="true">✕</span>
      </button>
      {hasMany && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          onClick={() => go(-1)}
          aria-label={labels.previous}
        >
          <span aria-hidden="true">←</span>
        </button>
      )}
      <figure className="lightbox__figure">
        {item.image && (
          <Image
            key={item.id}
            src={item.image.url}
            width={item.image.width}
            height={item.image.height}
            alt={item.image.alt}
            sizes="(max-width: 900px) 100vw, 65vw"
            placeholder={item.image.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={item.image.blurDataURL}
            className="lightbox__image"
          />
        )}
        <figcaption className="lightbox__meta" aria-live="polite">
          {item.details}
        </figcaption>
      </figure>
      {hasMany && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          onClick={() => go(1)}
          aria-label={labels.next}
        >
          <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  )
}
