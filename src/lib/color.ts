import { defaultAccentColor } from '@/themes/options'

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** Returns a safe #rrggbb color (falls back to the default accent). */
export function normalizeHex(
  value: string | null | undefined,
  fallback = defaultAccentColor,
): string {
  const color = (value ?? '').trim()
  if (!HEX.test(color)) return fallback
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toLowerCase()
  }
  return color.toLowerCase()
}

/** WCAG relative luminance of a #rrggbb color. */
export function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Black or white, whichever is more readable on top of the given color. */
export function contrastText(hex: string): '#000000' | '#ffffff' {
  const l = luminance(normalizeHex(hex))
  const contrastWithBlack = (l + 0.05) / 0.05
  const contrastWithWhite = 1.05 / (l + 0.05)
  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#ffffff'
}
