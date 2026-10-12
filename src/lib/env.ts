/**
 * Public base URL of the site, without trailing slash.
 * Read through a computed key so the bundler does not inline the build-time value:
 * the same Docker image must work on any domain set at runtime.
 */
export function getServerURL(): string {
  const key = ['NEXT_PUBLIC', 'SERVER_URL'].join('_')
  const url = process.env[key] || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${getServerURL()}${path.startsWith('/') ? '' : '/'}${path}`
}
