// Theme and font options shown in Site settings. Kept free of React imports so the
// Payload config can use them.

export const themeOptions = [{ value: 'atelier-notturno', label: 'Atelier Notturno' }] as const
export type ThemeName = (typeof themeOptions)[number]['value']
export const defaultTheme: ThemeName = 'atelier-notturno'

export const fontPairingOptions = [
  { value: 'inter', label: 'Inter (moderno, pulito)' },
  { value: 'fraunces-inter', label: 'Fraunces + Inter (titoli con grazie)' },
  { value: 'space-grotesk', label: 'Space Grotesk + Inter (geometrico)' },
] as const
export type FontPairing = (typeof fontPairingOptions)[number]['value']
export const defaultFontPairing: FontPairing = 'inter'

export const defaultAccentColor = '#d7ff3a'
