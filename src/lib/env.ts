/** Public base URL of the site, without trailing slash. */
export function getServerURL(): string {
  const url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}
