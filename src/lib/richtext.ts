import type { Artwork } from '@/payload-types'

export type RichTextValue = Artwork['description']

/** Builds a Lexical rich text value made of plain paragraphs (used by seed and tests). */
export function paragraphs(...texts: string[]): RichTextValue {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: texts.map((text) => ({
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 },
        ],
      })),
    },
  }
}
