'use client'

import { useCallback, useEffect, useState } from 'react'

type Status = { chunks: number; lastIndexedAt: string | null; queued: number; model: string }

const BASE = '/api/globals/chatbot-settings'

/**
 * Admin button that rebuilds the chatbot knowledge base from the published site content. It queues a background
 * job (checked every minute); the first run downloads the embedding model, so it can take a few minutes.
 */
export function ReindexButton() {
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${BASE}/reindex-status/`, { credentials: 'include' })
      if (response.ok) setStatus((await response.json()) as Status)
    } catch {
      // the next poll retries
    }
  }, [])

  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0)
    const timer = setInterval(() => void refresh(), 5000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [refresh])

  const start = async () => {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`${BASE}/reindex/`, { method: 'POST', credentials: 'include' })
      if (!response.ok) throw new Error('Could not queue the job.')
      setMessage('Re-indexing queued. It starts within a minute and runs in the background.')
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
      void refresh()
    }
  }

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 12, marginBottom: 24 }}>
      <strong>Knowledge base</strong>
      <p style={{ fontSize: 13, margin: '8px 0' }}>
        {status ? (
          <>
            {status.chunks} chunk(s) indexed with <code>{status.model}</code>
            {status.lastIndexedAt ? <> · last indexed {new Date(status.lastIndexedAt).toLocaleString()}</> : null}
            {status.queued ? <> · {status.queued} job(s) waiting or running</> : null}
          </>
        ) : (
          'Loading…'
        )}
      </p>
      <p style={{ fontSize: 13, margin: '0 0 8px' }}>
        Only published services, FAQs, active packages, industries, posts and the business details are indexed. Publishing or
        changing them re-indexes automatically while the chatbot is enabled; use this button for the first build or after
        enabling the chatbot.
      </p>
      <button className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={start} type="button">
        <span className="btn__content">Re-index knowledge base</span>
      </button>
      {message && (
        <p role="status" style={{ fontSize: 13 }}>
          {message}
        </p>
      )}
    </div>
  )
}
