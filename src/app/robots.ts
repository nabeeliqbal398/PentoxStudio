import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'

// /robots.txt. The admin, the API, the draft-preview entry and the personal newsletter / thank-you pages are
// blocked. A staging copy (NOINDEX_SITE=true) blocks everything.
export default function robots(): MetadataRoute.Robots {
  const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (env.NOINDEX_SITE === 'true') return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/next/', '/newsletter/', '/thank-you/'] }],
    sitemap: `${site}/sitemap.xml`,
  }
}
