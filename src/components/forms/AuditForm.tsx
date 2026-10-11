'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { submitAuditAction } from '@/lib/leads/actions'
import { rememberConversion } from '@/lib/track'

import {
  Consent,
  ErrorMessage,
  Field,
  HiddenFields,
  Turnstile,
  errorText,
  inputClass,
  primaryButton,
  resetTurnstile,
  useFormStart,
  withTracking,
} from './shared'

type Props = {
  text: {
    websiteLabel?: string | null
    goalLabel?: string | null
    submit?: string | null
    sending?: string | null
    nameLabel?: string | null
    emailLabel?: string | null
    whatsappLabel?: string | null
    contactHint?: string | null
    privacyText?: string | null
    privacyLinkLabel?: string | null
  }
  messages?: Parameters<typeof errorText>[1]
  turnstileSiteKey?: string
  privacyHref: string
}

/** One-step free-audit request: website URL, how to reach the visitor, and their main goal. */
export function AuditForm({ text, messages, turnstileSiteKey, privacyHref }: Props) {
  const router = useRouter()
  const id = useId()
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const onStart = useFormStart('free-audit')

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = withTracking(event.currentTarget)
    if (!data.get('email') && !data.get('whatsapp')) {
      setError(errorText('needContact', messages))
      return
    }
    startTransition(async () => {
      try {
        const result = await submitAuditAction(data)
        if (result.ok) {
          rememberConversion('audit_request', { form: 'free-audit' })
          router.push('/thank-you/')
          return
        }
        setError(errorText(result.code, messages))
        resetTurnstile()
      } catch {
        setError(errorText('failed', messages))
      }
    })
  }

  return (
    <form className="relative space-y-4 rounded-2xl bg-white p-6 shadow-soft md:p-8" onChange={onStart} onSubmit={onSubmit}>
      <HiddenFields source="free-audit" />
      <Field htmlFor={`${id}-site`} label={text.websiteLabel}>
        <input
          autoComplete="url"
          className={inputClass}
          id={`${id}-site`}
          inputMode="url"
          maxLength={300}
          name="website"
          placeholder="example.com"
          required
          type="text"
        />
      </Field>
      <Field htmlFor={`${id}-name`} label={text.nameLabel}>
        <input autoComplete="name" className={inputClass} id={`${id}-name`} maxLength={120} name="name" required type="text" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field htmlFor={`${id}-email`} label={text.emailLabel}>
          <input autoComplete="email" className={inputClass} id={`${id}-email`} maxLength={200} name="email" type="email" />
        </Field>
        <Field htmlFor={`${id}-wa`} label={text.whatsappLabel}>
          <input autoComplete="tel" className={inputClass} id={`${id}-wa`} inputMode="tel" maxLength={40} name="whatsapp" type="tel" />
        </Field>
      </div>
      {text.contactHint && <p className="-mt-2 text-xs text-muted">{text.contactHint}</p>}
      <Field htmlFor={`${id}-goal`} label={text.goalLabel}>
        <textarea className={inputClass} id={`${id}-goal`} maxLength={2000} name="message" rows={3} />
      </Field>
      <Consent href={privacyHref} id={`${id}-privacy`} linkLabel={text.privacyLinkLabel} text={text.privacyText} />
      <Turnstile siteKey={turnstileSiteKey} />
      <ErrorMessage>{error}</ErrorMessage>
      <button className={primaryButton} disabled={pending} type="submit">
        {pending ? text.sending : text.submit}
      </button>
    </form>
  )
}
