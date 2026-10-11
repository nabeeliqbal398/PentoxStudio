import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'
import { entryUrl, getIndexableEntries } from '@/lib/indexable'

// /sitemap.xml: every public, indexable page and nothing else (see lib/indexable.ts for the rules).
// Rebuilt at most hourly and purged whenever content is published (hooks/revalidate.ts).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A staging site (NOINDEX_SITE=true) lists nothing.
  if (env.NOINDEX_SITE === 'true') return []
  const entries = await getIndexableEntries()
  return entries.map((entry) => ({
    url: entryUrl(entry),
    lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
  }))
}
