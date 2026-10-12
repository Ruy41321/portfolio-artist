import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Browsers that ask for /favicon.ico get the default icon (Site settings can set a custom one).
  rewrites: async () => [{ source: '/favicon.ico', destination: '/icon.svg' }],
  images: {
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
