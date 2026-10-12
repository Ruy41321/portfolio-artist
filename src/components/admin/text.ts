/** Picks the Italian or English variant of an admin string from the admin language. */
export function pick(language: string | undefined, text: { it: string; en: string }): string {
  return language === 'en' ? text.en : text.it
}
