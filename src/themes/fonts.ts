import localFont from 'next/font/local'

import type { FontPairing } from './options'

// Self-hosted variable fonts (no request to external font services at runtime or build time).

const inter = localFont({
  src: [
    { path: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2' },
    {
      path: '../../node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2',
    },
  ],
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
})

const fraunces = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2',
    },
  ],
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-fraunces',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

const spaceGrotesk = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
    },
  ],
  weight: '300 700',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-space-grotesk',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

/** Font class names to put on <html>, plus the CSS values of the body and heading fonts. */
export function fontPairingStyle(pairing: FontPairing | string | null | undefined): {
  className: string
  body: string
  heading: string
} {
  switch (pairing) {
    case 'fraunces-inter':
      return {
        className: `${inter.variable} ${fraunces.variable}`,
        body: 'var(--font-inter)',
        heading: 'var(--font-fraunces)',
      }
    case 'space-grotesk':
      return {
        className: `${inter.variable} ${spaceGrotesk.variable}`,
        body: 'var(--font-inter)',
        heading: 'var(--font-space-grotesk)',
      }
    default:
      return { className: inter.variable, body: 'var(--font-inter)', heading: 'var(--font-inter)' }
  }
}
