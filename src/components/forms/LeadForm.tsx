'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, useId } from 'react'

import { submitLeadAction } from '@/lib/leads/actions'
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
  secondaryButton,
  useFormStart,
  withTracking,
} from './shared'

type Text = {
  serviceStep?: string | null
  serviceHelp?: string | null
  detailsStep?: string | null
  contactStep?: string | null
  budgetLabel?: string | null
  timelineLabel?: string | null
  messageLabel?: string | null
  nameLabel?: string | null
  emailLabel?: string | null
  whatsappLabel?: string | null
  contactHint?: string | null
  privacyText?: string | null
  privacyLinkLabel?: string | null
  next?: string | null
  back?: string | null
  submit?: string | null
  sending?: string | null
  stepOf?: string | null
  chooseService?: string | null
}

export type LeadFormProps = {
  source: 'contact-form' | 'prefooter-form'
  services: { id: number; title: string; isChild: boolean }[]
  /** Service pages pass their own id so it is already ticked. */
  preselected?: number
  text: Text
  messages?: Parameters<typeof errorText>[1]
  budgets: string[]
  timelines: string[]
  turnstileSiteKey?: string
  privacyHref: string
}

/**
 * Three-step lead form: service → budget & timeline → contact details. Every step stays in one
 * <form> (inactive steps are only hidden), so a single FormData holds all answers. Validation is
 * repeated on the server; the browser checks are only for convenience.
 */
export function LeadForm({
  source,
  services,
  preselected,
  text,
  messages,
  budgets,
  timelines,
  turnstileSiteKey,
  privacyHref,
}: LeadFormProps) {
  const router = useRouter()
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const onStart = useFormStart(source)

  const hasServiceStep = services.length > 0
  const hasDetailsStep = budgets.length > 0 || timelines.length > 0
  // Steps with nothing to ask are skipped, so the form never shows an empty step.
  const steps = [hasServiceStep && 'service', hasDetailsStep && 'details', 'contact'].filter(Boolean) as string[]
  const current = steps[step]

  const goNext = () => {
    setError('')
    if (current === 'service') {
      const picked = formRef.current?.querySelectorAll('input[name="services"]:checked').length ?? 0
      if (!picked) {
        setError(text.chooseService ?? '')
        return
      }
    }
    setStep((value) => Math.min(value + 1, steps.length - 1))
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    if (!form.reportValidity()) return
    const data = withTracking(form)
    if (!data.get('email') && !data.get('whatsapp')) {
      setError(errorText('needContact', messages))
      return
    }
    startTransition(async () => {
      try {
        const result = await submitLeadAction(data)
        if (result.ok) {
          rememberConversion('form_submit', { form: source })
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

  const stepLabel = text.stepOf?.replace('{current}', String(step + 1)).replace('{total}', String(steps.length))
  const title = current === 'service' ? text.serviceStep : current === 'details' ? text.detailsStep : text.contactStep

  return (
    <form
      className="relative space-y-5 rounded-2xl bg-white p-6 text-left shadow-soft md:p-8"
      noValidate={false}
      onChange={onStart}
      onSubmit={onSubmit}
      ref={formRef}
    >
      <HiddenFields source={source} />

      <div>
        {steps.length > 1 && stepLabel && <p className="text-xs font-semibold uppercase tracking-widest text-brand">{stepLabel}</p>}
        {title && <h3 className="mt-1 font-heading text-xl font-semibold text-navy">{title}</h3>}
      </div>

      {hasServiceStep && (
        <fieldset className="space-y-3" hidden={current !== 'service'}>
          {text.serviceHelp && <legend className="mb-2 text-sm text-muted">{text.serviceHelp}</legend>}
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <label className="cursor-pointer" key={service.id}>
                <input
                  className="peer sr-only"
                  defaultChecked={service.id === preselected}
                  name="services"
                  type="checkbox"
                  value={service.id}
                />
                <span className="inline-block rounded-full border border-line/60 px-4 py-2 text-sm text-body transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  {service.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {hasDetailsStep && (
        <div className="space-y-4" hidden={current !== 'details'}>
          {budgets.length > 0 && (
            <Field htmlFor={`${id}-budget`} label={text.budgetLabel}>
              <select className={inputClass} defaultValue="" id={`${id}-budget`} name="budget">
                <option value="" />
                {budgets.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
          )}
          {timelines.length > 0 && (
            <Field htmlFor={`${id}-timeline`} label={text.timelineLabel}>
              <select className={inputClass} defaultValue="" id={`${id}-timeline`} name="timeline">
                <option value="" />
                {timelines.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
      )}

      <div className="space-y-4" hidden={current !== 'contact'}>
        <Field htmlFor={`${id}-name`} label={text.nameLabel}>
          <input autoComplete="name" className={inputClass} id={`${id}-name`} maxLength={120} name="name" required={current === 'contact'} type="text" />
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
        <Field htmlFor={`${id}-msg`} label={text.messageLabel}>
          <textarea className={inputClass} id={`${id}-msg`} maxLength={2000} name="message" rows={3} />
        </Field>
        <Consent href={privacyHref} id={`${id}-privacy`} linkLabel={text.privacyLinkLabel} text={text.privacyText} />
        {current === 'contact' && <Turnstile siteKey={turnstileSiteKey} />}
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <button className={secondaryButton} onClick={() => setStep(step - 1)} type="button">
            {text.back}
          </button>
        ) : (
          <span />
        )}
        {current === 'contact' ? (
          <button className={primaryButton} disabled={pending} type="submit">
            {pending ? text.sending : text.submit}
          </button>
        ) : (
          <button className={primaryButton} onClick={goNext} type="button">
            {text.next}
          </button>
        )}
      </div>
    </form>
  )
}
