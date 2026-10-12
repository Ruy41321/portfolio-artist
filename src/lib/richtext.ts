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

/** Plain text of a rich text value (for meta descriptions and structured data). */
export function richTextToPlain(value: RichTextValue | null | undefined): string {
  const parts: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: unknown; children?: unknown[]; type?: string }
    if (typeof n.text === 'string') parts.push(n.text)
    if (Array.isArray(n.children)) {
      n.children.forEach(walk)
      if (n.type === 'paragraph' || n.type === 'heading' || n.type === 'listitem') parts.push(' ')
    }
  }
  walk(value?.root)
  return parts.join('').replace(/\s+/g, ' ').trim()
}
