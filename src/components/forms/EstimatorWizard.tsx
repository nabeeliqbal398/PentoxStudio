'use client'

import { useId, useRef, useState, useTransition } from 'react'

import {
  estimateAction,
  submitEstimatorAction,
  type EstimateResult,
  type QuoteResult,
} from '@/lib/leads/actions'
import { trackEvent } from '@/lib/track'
import type { EstimatorService } from '@/lib/forms'

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
  serviceTitle?: string | null
  scopeTitle?: string | null
  scopeHelp?: string | null
  timelineTitle?: string | null
  resultTitle?: string | null
  rangeLabel?: string | null
  contactUsTitle?: string | null
  contactUsText?: string | null
  unlockTitle?: string | null
  unlockText?: string | null
  unlockButton?: string | null
  requestButton?: string | null
  breakdownTitle?: string | null
  timelineLine?: string | null
  totalLabel?: string | null
  disclaimer?: string | null
  thanks?: string | null
  restart?: string | null
}

type FormText = {
  nameLabel?: string | null
  emailLabel?: string | null
  whatsappLabel?: string | null
  contactHint?: string | null
  privacyText?: string | null
  privacyLinkLabel?: string | null
  next?: string | null
  back?: string | null
  sending?: string | null
}

type Props = {
  services: EstimatorService[]
  text: Text
  formText: FormText
  messages?: Parameters<typeof errorText>[1]
  turnstileSiteKey?: string
  privacyHref: string
}

type Phase = 'service' | 'scope' | 'timeline' | 'result' | 'done'

/**
 * Cost estimator: service → scope → timeline → price range → contact details → detailed quote.
 * Prices never reach the browser until the server returns them: the range after the answers, the
 * breakdown only after the lead has been saved. A service whose rule has no price shows "contact us".
 */
export function EstimatorWizard({ services, text, formText, messages, turnstileSiteKey, privacyHref }: Props) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [phase, setPhase] = useState<Phase>('service')
  const [serviceId, setServiceId] = useState<number | undefined>()
  const [scope, setScope] = useState<string[]>([])
  const [timeline, setTimeline] = useState('')
  const [estimate, setEstimate] = useState<EstimateResult | undefined>()
  const [quote, setQuote] = useState<QuoteResult | undefined>()
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const onStart = useFormStart('estimator')

  const service = services.find((item) => item.id === serviceId)

  const reset = () => {
    setPhase('service')
    setServiceId(undefined)
    setScope([])
    setTimeline('')
    setEstimate(undefined)
    setQuote(undefined)
    setError('')
  }

  const choose = (item: EstimatorService) => {
    onStart()
    setServiceId(item.id)
    setScope([])
    setTimeline('')
    setEstimate(undefined)
    setError('')
    setPhase(item.scope.length ? 'scope' : item.timelines.length ? 'timeline' : 'result')
    if (!item.scope.length && !item.timelines.length) void runEstimate(item.id, [], '')
  }

  const runEstimate = async (forService: number, forScope: string[], forTimeline: string) => {
    setError('')
    const result = await estimateAction({ serviceId: forService, scope: forScope, timeline: forTimeline || undefined })
    if (!result.ok) {
      setError(errorText(result.code === 'rate' ? 'rate' : 'failed', messages))
      return
    }
    setEstimate(result)
    setPhase('result')
  }

  const afterScope = () => {
    if (service?.timelines.length) setPhase('timeline')
    else startTransition(() => runEstimate(service!.id, scope, ''))
  }

  const toggleScope = (label: string) =>
    setScope((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]))

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
        const result = await submitEstimatorAction(data)
        if (result.ok) {
          setQuote(result)
          setPhase('done')
          trackEvent('estimator_complete', { service: service?.title })
          return
        }
        setError(errorText(result.code, messages))
        resetTurnstile()
      } catch {
        setError(errorText('failed', messages))
      }
    })
  }

  const priced = estimate?.ok && estimate.priced ? estimate : undefined

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-soft md:p-8">
      {phase === 'service' && (
        <section>
          {text.serviceTitle && <h2 className="font-heading text-xl font-semibold text-navy">{text.serviceTitle}</h2>}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((item) => (
              <li key={item.id}>
                <button
                  className="w-full rounded-xl border border-line/60 px-4 py-3 text-left font-medium text-navy transition-colors hover:border-brand hover:bg-brand/5"
                  onClick={() => choose(item)}
                  type="button"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {phase === 'scope' && service && (
        <section>
          {text.scopeTitle && <h2 className="font-heading text-xl font-semibold text-navy">{text.scopeTitle}</h2>}
          {text.scopeHelp && <p className="mt-1 text-sm text-muted">{text.scopeHelp}</p>}
          <ul className="mt-4 space-y-2">
            {service.scope.map((option) => (
              <li key={option.label}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/60 p-3 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                  <input
                    checked={scope.includes(option.label)}
                    className="mt-1 size-4 accent-brand"
                    onChange={() => toggleScope(option.label)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-medium text-navy">{option.label}</span>
                    {option.description && <span className="block text-sm text-muted">{option.description}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between">
            <button className={secondaryButton} onClick={reset} type="button">
              {formText.back}
            </button>
            <button className={primaryButton} disabled={pending} onClick={afterScope} type="button">
              {formText.next}
            </button>
          </div>
        </section>
      )}

      {phase === 'timeline' && service && (
        <section>
          {text.timelineTitle && <h2 className="font-heading text-xl font-semibold text-navy">{text.timelineTitle}</h2>}
          <ul className="mt-4 space-y-2">
            {service.timelines.map((label) => (
              <li key={label}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line/60 p-3 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                  <input
                    checked={timeline === label}
                    className="size-4 accent-brand"
                    name={`${id}-timeline`}
                    onChange={() => setTimeline(label)}
                    type="radio"
                  />
                  <span className="font-medium text-navy">{label}</span>
                </label>
              </li>
            ))}
          </ul>
          <ErrorMessage>{error}</ErrorMessage>
          <div className="mt-6 flex justify-between">
            <button className={secondaryButton} onClick={() => setPhase(service.scope.length ? 'scope' : 'service')} type="button">
              {formText.back}
            </button>
            <button
              className={primaryButton}
              disabled={pending || !timeline}
              onClick={() => startTransition(() => runEstimate(service.id, scope, timeline))}
              type="button"
            >
              {formText.next}
            </button>
          </div>
        </section>
      )}

      {phase === 'result' && service && (
        <section className="space-y-5">
          {text.resultTitle && <h2 className="font-heading text-xl font-semibold text-navy">{text.resultTitle}</h2>}
          {priced ? (
            <div className="rounded-xl bg-navy p-5 text-center text-white">
              {text.rangeLabel && <p className="text-sm text-white/80">{text.rangeLabel}</p>}
              <p className="mt-1 font-heading text-3xl font-bold">{priced.range}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-alt p-5">
              {text.contactUsTitle && <p className="font-heading text-lg font-semibold text-navy">{text.contactUsTitle}</p>}
              {text.contactUsText && <p className="mt-1 text-body">{text.contactUsText}</p>}
            </div>
          )}
          {text.disclaimer && priced && <p className="text-xs text-muted">{text.disclaimer}</p>}

          <form className="relative space-y-4" onSubmit={onSubmit} ref={formRef}>
            <HiddenFields source="estimator" />
            <input name="serviceId" type="hidden" value={service.id} />
            <input name="timeline" type="hidden" value={timeline} />
            {scope.map((label) => (
              <input key={label} name="scope" type="hidden" value={label} />
            ))}
            <div>
              {priced && text.unlockTitle && <h3 className="font-heading text-lg font-semibold text-navy">{text.unlockTitle}</h3>}
              {priced && text.unlockText && <p className="text-sm text-body">{text.unlockText}</p>}
            </div>
            <Field htmlFor={`${id}-name`} label={formText.nameLabel}>
              <input autoComplete="name" className={inputClass} id={`${id}-name`} maxLength={120} name="name" required type="text" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field htmlFor={`${id}-email`} label={formText.emailLabel}>
                <input autoComplete="email" className={inputClass} id={`${id}-email`} maxLength={200} name="email" type="email" />
              </Field>
              <Field htmlFor={`${id}-wa`} label={formText.whatsappLabel}>
                <input autoComplete="tel" className={inputClass} id={`${id}-wa`} inputMode="tel" maxLength={40} name="whatsapp" type="tel" />
              </Field>
            </div>
            {formText.contactHint && <p className="-mt-2 text-xs text-muted">{formText.contactHint}</p>}
            <Consent href={privacyHref} id={`${id}-privacy`} linkLabel={formText.privacyLinkLabel} text={formText.privacyText} />
            <Turnstile siteKey={turnstileSiteKey} />
            <ErrorMessage>{error}</ErrorMessage>
            <div className="flex justify-between gap-3">
              <button className={secondaryButton} onClick={reset} type="button">
                {text.restart}
              </button>
              <button className={primaryButton} disabled={pending} type="submit">
                {pending ? formText.sending : priced ? text.unlockButton : text.requestButton}
              </button>
            </div>
          </form>
        </section>
      )}

      {phase === 'done' && quote?.ok && (
        <section className="space-y-4">
          {quote.priced ? (
            <>
              {text.breakdownTitle && <h2 className="font-heading text-xl font-semibold text-navy">{text.breakdownTitle}</h2>}
              <dl className="divide-y divide-line/40 rounded-xl border border-line/40">
                {quote.lines.map((line) => (
                  <div className="flex justify-between gap-4 p-3" key={line.label}>
                    <dt className="text-body">{line.label}</dt>
                    <dd className="font-medium text-navy">{line.amount}</dd>
                  </div>
                ))}
                {quote.timeline && (
                  <div className="flex justify-between gap-4 p-3">
                    <dt className="text-body">{text.timelineLine}</dt>
                    <dd className="font-medium text-navy">{quote.timeline}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 bg-surface-alt p-3">
                  <dt className="font-semibold text-navy">{text.totalLabel}</dt>
                  <dd className="font-heading font-bold text-brand">{quote.range}</dd>
                </div>
              </dl>
              {text.disclaimer && <p className="text-xs text-muted">{text.disclaimer}</p>}
            </>
          ) : (
            text.contactUsTitle && <h2 className="font-heading text-xl font-semibold text-navy">{text.contactUsTitle}</h2>
          )}
          {text.thanks && <p className="text-body">{text.thanks}</p>}
          <button className={secondaryButton} onClick={reset} type="button">
            {text.restart}
          </button>
        </section>
      )}

      {phase !== 'result' && phase !== 'timeline' && error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  )
}
