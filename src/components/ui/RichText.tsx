import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import type { RichTextValue } from '@/lib/richtext'

/** Renders rich text written in the admin (paragraphs, h2/h3, bold, italic, links, lists). */
export function RichText({
  value,
  className,
}: {
  value: RichTextValue | null | undefined
  className?: string
}) {
  if (!value?.root?.children?.length) return null
  return <LexicalRichText data={value as never} className={className} disableContainer={false} />
}
