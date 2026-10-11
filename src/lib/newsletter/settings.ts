import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { Newsletter } from '../../payload-types'

// Wording for the signup form and the confirm/unsubscribe pages (cached; refreshed by the global's revalidation hook).
export const getNewsletterText = unstable_cache(
  async (): Promise<Newsletter> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'newsletter', depth: 0, overrideAccess: false })
  },
  ['newsletter:text'],
  { tags: ['global:newsletter'], revalidate: 3600 },
)
