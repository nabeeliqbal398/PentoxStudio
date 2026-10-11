import { env } from '@/lib/env'

import { LivePreview } from '../ui/LivePreview'

/**
 * Renders only for a logged-in editor in draft mode (the admin Live Preview iframe or Preview
 * button). Public visitors never get it.
 */
export function DraftPreview({ enabled, banner }: { enabled: boolean; banner?: string | null }) {
  if (!enabled) return null
  return <LivePreview banner={banner ?? undefined} serverURL={env.NEXT_PUBLIC_SITE_URL} />
}
