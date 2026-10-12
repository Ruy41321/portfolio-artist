/** Builds a translated admin string (Italian first, English second). */
export function t(it: string, en: string): { it: string; en: string } {
  return { it, en }
}
