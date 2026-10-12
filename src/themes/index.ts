import { atelierNotturno } from './atelier-notturno'
import { defaultTheme } from './options'
import type { Theme } from './types'

const themes: Record<string, Theme> = {
  [atelierNotturno.name]: atelierNotturno,
}

/** Resolves the active theme from Site settings, falling back to the default one. */
export function getTheme(name: string | null | undefined): Theme {
  return (name && themes[name]) || themes[defaultTheme]
}
