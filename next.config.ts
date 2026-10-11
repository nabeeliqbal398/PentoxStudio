import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { ADMIN_CSP, baseSecurityHeaders } from './src/lib/security'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Matches the old WordPress URLs (see capture/07-LOCKED-SCOPE.md §4).
  trailingSlash: true,
  poweredByHeader: false,
  // Native / ONNX packages used by the local embedding model run from node_modules instead of being bundled.
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'onnxruntime-common'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
    ],
  },
  // Security and cache headers. The Content-Security-Policy of public pages is added per request in src/proxy.ts
  // (analytics origins depend on cookie consent); the admin gets its own policy here.
  async headers() {
    const production = process.env.NODE_ENV === 'production'
    return [
      { source: '/:path*', headers: baseSecurityHeaders(production) },
      { source: '/admin/:path*', headers: [{ key: 'Content-Security-Policy', value: ADMIN_CSP }, { key: 'Cache-Control', value: 'no-store' }] },
      // API responses are never cached, except the uploaded media files below.
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/media/file/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
    ]
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

const withPayloadConfig = withPayload(nextConfig, { devBundleServerPackages: false })

// withPayload adds "Accept-CH / Critical-CH: Sec-CH-Prefers-Color-Scheme" to EVERY route. The admin uses it to pick
// its theme before paint, but on the public site Critical-CH makes Chromium repeat every first page request (about
// 0.6 s slower in Lighthouse). Keep the hint for /admin only.
const payloadHeaders = withPayloadConfig.headers
withPayloadConfig.headers = async () =>
  ((await payloadHeaders?.()) ?? []).map((rule) =>
    rule.headers.some((header) => header.key === 'Critical-CH' || header.key === 'Accept-CH')
      ? { ...rule, source: '/admin/:path*' }
      : rule,
  )

export default withPayloadConfig
