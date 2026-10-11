'use client'

import { useId, useRef, useState, useTransition } from 'react'

import { Consent, ErrorMessage, Turnstile, inputClass, primaryButton, resetTurnstile } from '../forms/shared'

type Text = {
  heading?: string | null
  text?: string | null
  emailLabel?: string | null
  emailPlaceholder?: string | null
  button?: string | null
  sending?: string | null
  consentText?: string | null
  privacyLinkLabel?: string | null
  success?: string | null
  errorInvalid?: string | null
  errorRate?: string | null
  errorVerification?: string | null
  errorFailed?: string | null
}

export type NewsletterFormProps = {
  text: Text
  source: 'footer' | 'blog-post' | 'home' | 'popup'
  turnstileSiteKey?: string
  privacyHref: string
  /** "dark" for the navy footer, "light" for white cards. */
  tone?: 'dark' | 'light'
}

/**
 * Newsletter signup (double opt-in): email + consent checkbox. It posts to /api/subscribe/, which only
 * creates a pending subscriber and emails a confirmation link; the visitor is not subscribed until they click it.
 */
export function NewsletterForm({ text, source, turnstileSiteKey, privacyHref, tone = 'light' }: NewsletterFormProps) {
  const id = useId()
  const startedAt = useRef(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const dark = tone === 'dark'

  const message = (code: string) =>
    ({ invalid: text.errorInvalid, rate: text.errorRate, verification: text.errorVerification, failed: text.errorFailed })[code] ||
    text.errorFailed ||
    ''

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    const data = new FormData(form)
    const body = {
      email: String(data.get('email') ?? ''),
      source,
      consent: data.get('consent') === 'on',
      hp: String(data.get('hp_site') ?? ''),
      t: startedAt.current,
      'cf-turnstile-response': String(data.get('cf-turnstile-response') ?? '') || undefined,
    }
    startTransition(async () => {
      try {
        const response = await fetch('/api/subscribe/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const result = (await response.json()) as { ok: boolean; code?: string }
        if (result.ok) {
          setDone(true)
          form.reset()
        } else {
          setError(message(result.code ?? 'failed'))
          resetTurnstile()
        }
      } catch {
        setError(message('failed'))
      }
    })
  }

  if (done) {
    return (
      <p className={dark ? 'text-white' : 'text-navy'} role="status">
        {text.success}
      </p>
    )
  }

  return (
    <form
      className="space-y-3"
      onFocus={() => {
        // Starts the "filled in too fast" timer on first interaction.
        if (!startedAt.current) startedAt.current = Date.now()
      }}
      onSubmit={onSubmit}
    >
      <div className="relative flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor={`${id}-email`}>
            {text.emailLabel}
          </label>
          <input
            autoComplete="email"
            className={`${inputClass} !rounded-full`}
            id={`${id}-email`}
            maxLength={200}
            name="email"
            placeholder={text.emailPlaceholder ?? undefined}
            required
            type="email"
          />
        </div>
        <button className={primaryButton} disabled={pending} type="submit">
          {pending ? text.sending : text.button}
        </button>
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this field empty
            <input autoComplete="off" name="hp_site" tabIndex={-1} type="text" />
          </label>
        </div>
      </div>
      <div className={dark ? 'text-white/80 [&_a]:!text-white [&_label]:!text-white/80' : ''}>
        <Consent
            href={privacyHref}
            id={`${id}-consent`}
            inputName="consent"
            linkLabel={text.privacyLinkLabel}
            text={text.consentText}
          />
      </div>
      <Turnstile siteKey={turnstileSiteKey} />
      <ErrorMessage>{error}</ErrorMessage>
    </form>
  )
}
