'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { confirmAction, unsubscribeAction } from '@/lib/newsletter/actions'

import { ErrorMessage, primaryButton } from '../forms/shared'

type Props = {
  kind: 'confirm' | 'unsubscribe'
  token: string
  button?: string | null
  done: { title?: string | null; text?: string | null }
  invalid: { title?: string | null; text?: string | null }
  homeLink?: string | null
}

/** The single button on the confirm / unsubscribe pages; the change happens on press, not on page load. */
export function TokenButton({ kind, token, button, done, invalid, homeLink }: Props) {
  const [state, setState] = useState<'ready' | 'done' | 'invalid'>('ready')
  const [pending, startTransition] = useTransition()

  const press = () =>
    startTransition(async () => {
      const result = await (kind === 'confirm' ? confirmAction(token) : unsubscribeAction(token))
      setState(result.ok ? 'done' : 'invalid')
    })

  if (state === 'ready') {
    return (
      <button className={primaryButton} disabled={pending} onClick={press} type="button">
        {button}
      </button>
    )
  }
  const message = state === 'done' ? done : invalid
  return (
    <div role="status">
      {message.title && <h2 className="font-heading text-2xl font-semibold text-navy">{message.title}</h2>}
      {message.text && (state === 'done' ? <p className="mt-2 text-body">{message.text}</p> : <ErrorMessage>{message.text}</ErrorMessage>)}
      {homeLink && (
        <p className="mt-6">
          <Link className="font-semibold text-accent underline underline-offset-4" href="/">
            {homeLink}
          </Link>
        </p>
      )}
    </div>
  )
}
