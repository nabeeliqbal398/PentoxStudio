'use client'

import { useState } from 'react'

type Summary = {
  rows: number
  created: number
  createdActive: number
  createdPending: number
  updated: number
  duplicatesInFile: number
  skippedUnsubscribed: number
  skippedBounced: number
  invalid: { line: number; value: string }[]
}

const box: React.CSSProperties = { border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 16, marginBottom: 24 }

/** Above the Subscribers list: CSV export and CSV import (with the consent confirmation). */
export function SubscribersTools() {
  const [attested, setAttested] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)

  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const file = (form.elements.namedItem('file') as HTMLInputElement).files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    setSummary(null)
    try {
      const body = new FormData()
      body.set('file', file)
      body.set('attested', String(attested))
      const response = await fetch('/api/subscribers/import', { method: 'POST', body, credentials: 'include' })
      const data = (await response.json()) as { error?: string; summary?: Summary }
      if (!response.ok || !data.summary) throw new Error(data.error || 'Import failed.')
      setSummary(data.summary)
      form.reset()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={box}>
      <strong>Import / export</strong>
      <p style={{ margin: '8px 0' }}>
        {/* A file download, so a plain link (not client-side navigation) is what is wanted. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn btn--style-secondary btn--size-small" href="/api/subscribers/export/">
          <span className="btn__content">Export all subscribers (CSV)</span>
        </a>{' '}
        <span style={{ fontSize: 13 }}>Optional filters: add <code>?status=active</code> or <code>?tag=clients</code> to the link.</span>
      </p>

      <form onSubmit={upload} style={{ marginTop: 12 }}>
        <p style={{ fontSize: 13, margin: '0 0 8px' }}>
          Import a CSV with the columns <code>email</code> (required), <code>name</code>, <code>tags</code>, <code>consent</code> (yes/no) and{' '}
          <code>consent_date</code>. Duplicates are merged. Rows are imported as <strong>pending</strong> (they get nothing until they
          confirm) unless the row says consent = yes <em>and</em> you tick the box below. Unsubscribed addresses are never re-added.
        </p>
        <input accept=".csv,text/csv" name="file" required type="file" />
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '8px 0', fontSize: 13 }}>
          <input checked={attested} onChange={(event) => setAttested(event.target.checked)} type="checkbox" />
          <span>I confirm the contacts marked &quot;consent = yes&quot; agreed to receive our emails and I can show proof of it.</span>
        </label>
        <button className="btn btn--style-primary btn--size-small" disabled={busy} type="submit">
          <span className="btn__content">{busy ? 'Importing…' : 'Import CSV'}</span>
        </button>
      </form>

      {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}
      {summary && (
        <div role="status" style={{ marginTop: 12, fontSize: 13 }}>
          <strong>Import finished.</strong> {summary.rows} row(s): {summary.created} added ({summary.createdActive} active, {summary.createdPending}{' '}
          pending), {summary.updated} existing updated, {summary.duplicatesInFile} duplicate(s) in the file, {summary.skippedUnsubscribed} skipped
          (unsubscribed), {summary.skippedBounced} skipped (bounced), {summary.invalid.length} invalid.
          {summary.invalid.length > 0 && (
            <ul>
              {summary.invalid.slice(0, 10).map((item) => (
                <li key={item.line}>
                  line {item.line}: {item.value || '(empty)'}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
