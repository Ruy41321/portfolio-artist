import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV !== 'production'

// Content Security Policy compatible with Next.js and the Payload admin. Scripts are limited
// to this site plus HTTPS sources (the optional analytics script configured in the admin).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https:${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https:${isDev ? ' ws: wss:' : ''}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  // HSTS is left to the TLS-terminating reverse proxy.
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Browsers that ask for /favicon.ico get the default icon (Site settings can set a custom one).
  rewrites: async () => [{ source: '/favicon.ico', destination: '/icon.svg' }],
  headers: async () => [
    { source: '/:path*', headers: securityHeaders },
    {
      // Uploaded files: cacheable by browsers and by a proxy/CDN in front of the app.
      source: '/api/media/file/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
      ],
    },
  ],
  images: {
    minimumCacheTTL: 86400,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const config = withPayload(nextConfig, { devBundleServerPackages: false })

// Payload asks every page for the color-scheme client hint with `Critical-CH`, which makes
// browsers restart the navigation. Only the admin needs it: keep those headers there.
const payloadHeaders = config.headers
config.headers = async () => {
  const rules = (await payloadHeaders?.()) ?? []
  return rules.map((rule) =>
    rule.source === '/:path*' && rule.headers.some((h) => h.key === 'Critical-CH')
      ? { ...rule, source: '/admin/:path*' }
      : rule,
  )
}

export default config
