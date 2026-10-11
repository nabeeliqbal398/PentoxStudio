'use client'

import { useDocumentInfo, useForm } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type Progress = {
  status?: string
  stats?: { recipients?: number; sent?: number; failed?: number }
  progress?: { lastError?: string | null; pausedUntil?: string | null }
}

const box: React.CSSProperties = { border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 12, marginBottom: 16 }
const button: React.CSSProperties = { marginRight: 8, marginBottom: 8 }

async function call(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as { error?: string; [key: string]: unknown }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}

/**
 * Sidebar panel on the campaign page: send a test, start (or resume) the send, stop it, and watch progress.
 * Save the campaign first: the buttons act on the saved version.
 */
export function CampaignActions() {
  const { id } = useDocumentInfo()
  const { getData } = useForm()
  const [testTo, setTestTo] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<Progress>({})

  const refresh = useCallback(async () => {
    if (!id) return
    try {
      const response = await fetch(`/api/campaigns/${id}?depth=0`, { credentials: 'include' })
      if (response.ok) setState((await response.json()) as Progress)
    } catch {
      // transient: the next poll retries
    }
  }, [id])

  useEffect(() => {
    // First load right after mount, then every 5 seconds (the send runs in the background).
    const first = setTimeout(() => void refresh(), 0)
    const timer = setInterval(() => void refresh(), 5000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [refresh])

  if (!id) return <p style={box}>Save the campaign first. Then you can send a test and start sending.</p>

  const run = async (action: () => Promise<string>) => {
    setBusy(true)
    setMessage(null)
    try {
      setMessage({ ok: true, text: await action() })
    } catch (error) {
      setMessage({ ok: false, text: (error as Error).message })
    } finally {
      setBusy(false)
      void refresh()
    }
  }

  const status = state.status ?? getData().status
  const stats = state.stats ?? {}
  const canStart = status === 'draft' || status === 'scheduled' || status === 'failed'

  return (
    <div style={box}>
      <strong>Send</strong>
      <p style={{ fontSize: 13, margin: '8px 0' }}>
        Status: <strong>{String(status ?? 'draft')}</strong>
        {stats.recipients ? (
          <>
            {' '}
            · {stats.sent ?? 0} / {stats.recipients} sent{stats.failed ? ` · ${stats.failed} failed` : ''}
          </>
        ) : null}
      </p>
      {state.progress?.pausedUntil && <p style={{ fontSize: 13 }}>Paused for the daily limit until {new Date(state.progress.pausedUntil).toLocaleString()}.</p>}
      {state.progress?.lastError && <p style={{ fontSize: 13, color: 'var(--theme-error-500)' }}>{state.progress.lastError}</p>}

      <label style={{ display: 'block', fontSize: 13, marginTop: 8 }} htmlFor="campaign-test-to">
        Send a test to
      </label>
      <input
        id="campaign-test-to"
        onChange={(event) => setTestTo(event.target.value)}
        placeholder="you@example.com"
        style={{ width: '100%', marginBottom: 8 }}
        type="email"
        value={testTo}
      />
      <button
        className="btn btn--style-secondary btn--size-small"
        disabled={busy || !testTo}
        onClick={() => run(async () => (await call(`/api/campaigns/${id}/test`, { to: testTo }), `Test sent to ${testTo}.`))}
        style={button}
        type="button"
      >
        <span className="btn__content">Send test</span>
      </button>

      {canStart && (
        <button
          className="btn btn--style-primary btn--size-small"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const audience = (await call(`/api/campaigns/${id}/audience`)) as { recipients?: number }
              const label = status === 'failed' ? 'Resume sending' : 'Send this campaign'
              if (!window.confirm(`${label} to ${audience.recipients ?? 0} active subscriber(s)? Save any changes first. This cannot be undone.`)) {
                return 'Cancelled.'
              }
              const result = (await call(`/api/campaigns/${id}/send`, {})) as { recipients?: number }
              return `Sending started to ${result.recipients} subscriber(s). It runs in batches in the background.`
            })
          }
          style={button}
          type="button"
        >
          <span className="btn__content">{status === 'failed' ? 'Resume sending' : 'Send now'}</span>
        </button>
      )}

      {status === 'sending' && (
        <button
          className="btn btn--style-secondary btn--size-small"
          disabled={busy}
          onClick={() => run(async () => (await call(`/api/campaigns/${id}/stop`, {}), 'Stopped. Use Resume sending to continue.'))}
          style={button}
          type="button"
        >
          <span className="btn__content">Stop</span>
        </button>
      )}

      {message && (
        <p role="status" style={{ fontSize: 13, color: message.ok ? 'inherit' : 'var(--theme-error-500)' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
