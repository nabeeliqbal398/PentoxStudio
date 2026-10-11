'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

/**
 * Sidebar button on a post: creates (or opens) a newsletter campaign DRAFT for it. Nothing is ever sent from
 * here: an editor reviews the draft and starts the send from the campaign page.
 */
export function PostNewsletterButton() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [campaign, setCampaign] = useState<{ id: number; existing: boolean } | null>(null)

  if (!id) return null

  const create = async () => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/posts/${id}/newsletter-draft`, { method: 'POST', credentials: 'include' })
      const data = (await response.json()) as { id?: number; existing?: boolean; error?: string }
      if (!response.ok || !data.id) throw new Error(data.error || 'Could not create the draft.')
      setCampaign({ id: data.id, existing: Boolean(data.existing) })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={create} type="button">
        <span className="btn__content">Create newsletter draft</span>
      </button>
      <p style={{ fontSize: 12, margin: '6px 0 0' }}>Creates a draft campaign from this post. Nothing is sent.</p>
      {campaign && (
        <p role="status" style={{ fontSize: 13 }}>
          {campaign.existing ? 'A draft already exists: ' : 'Draft created: '}
          <a href={`/admin/collections/campaigns/${campaign.id}`}>open the campaign</a>
        </p>
      )}
      {error && <p style={{ color: 'var(--theme-error-500)', fontSize: 13 }}>{error}</p>}
    </div>
  )
}
