'use client'

import Script from 'next/script'
import { useEffect, useRef, type ReactNode } from 'react'

import { attributionJson, trackEvent, type TrackEvent } from '@/lib/track'

export const inputClass =
  'w-full rounded-lg border border-line/60 bg-form-bg px-4 py-3 text-body placeholder:text-muted focus:border-navy focus:outline-none'

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label?: string | null
  htmlFor: string
  children: ReactNode
  hint?: string | null
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-form-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

/** Hidden anti-spam fields: a honeypot real visitors never see, the render time, and tracking data. */
export function HiddenFields({ source }: { source: string }) {
  const started = useRef<HTMLInputElement>(null)
  // Set after mount so the server-rendered HTML stays identical (no hydration mismatch).
  useEffect(() => {
    if (started.current) started.current.value = String(Date.now())
  }, [])
  return (
    <>
      <input name="source" type="hidden" value={source} />
      <input defaultValue="" name="_t" ref={started} type="hidden" />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input autoComplete="off" name="hp_site" tabIndex={-1} type="text" />
        </label>
      </div>
    </>
  )
}

/** Adds the tracking fields to the outgoing FormData (read from the first-touch cookie at send time). */
export function withTracking(form: HTMLFormElement): FormData {
  const data = new FormData(form)
  data.set('attribution', attributionJson())
  data.set('submittedPath', window.location.pathname)
  return data
}

/** Fires form_start once, the first time the visitor interacts with the form. */
export function useFormStart(form: string) {
  const started = useRef(false)
  return () => {
    if (started.current) return
    started.current = true
    trackEvent('form_start', { form })
  }
}

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void }
  }
}

/** Cloudflare Turnstile widget; renders (and loads Cloudflare's script) only when a site key is set. */
export function Turnstile({ siteKey }: { siteKey?: string }) {
  if (!siteKey) return null
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  )
}

export const resetTurnstile = () => window.turnstile?.reset()

export function Consent({
  text,
  linkLabel,
  href,
  id,
}: {
  text?: string | null
  linkLabel?: string | null
  href: string
  id: string
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-body" htmlFor={id}>
      <input className="mt-1 size-4 accent-brand" id={id} name="privacy" required type="checkbox" />
      <span>
        {text}{' '}
        <a className="text-accent underline underline-offset-2" href={href} rel="noopener" target="_blank">
          {linkLabel}
        </a>
      </span>
    </label>
  )
}

export const ErrorMessage = ({ children }: { children?: ReactNode }) =>
  children ? (
    <p className="rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand" role="alert">
      {children}
    </p>
  ) : null

export type ErrorCode = 'invalid' | 'needContact' | 'rate' | 'verification' | 'failed'

export const errorText = (
  code: ErrorCode,
  messages?: { invalid?: string | null; needContact?: string | null; rateLimited?: string | null; verification?: string | null; failed?: string | null } | null,
) => {
  const map: Record<ErrorCode, string | null | undefined> = {
    invalid: messages?.invalid,
    needContact: messages?.needContact,
    rate: messages?.rateLimited,
    verification: messages?.verification,
    failed: messages?.failed,
  }
  return map[code] || messages?.failed || ''
}

export const primaryButton =
  'inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-active disabled:opacity-60'
export const secondaryButton =
  'inline-flex items-center justify-center rounded-full border-[1.5px] border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white'

export type { TrackEvent }
