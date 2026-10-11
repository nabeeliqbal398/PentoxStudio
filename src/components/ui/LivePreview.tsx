'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Rendered only in draft mode (editors inside the admin Live Preview). Re-renders the page from
 * the server whenever the document is saved or autosaved.
 */
export function LivePreview({ serverURL, banner }: { serverURL: string; banner?: string }) {
  const router = useRouter()
  return (
    <>
      <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
      {banner && (
        <p className="sticky top-0 z-[60] bg-navy px-4 py-1.5 text-center text-xs font-medium text-white">{banner}</p>
      )}
    </>
  )
}
