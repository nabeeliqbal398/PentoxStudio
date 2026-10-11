'use server'

import { after } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import config from '@payload-config'

import { computeEstimate, formatMoney, formatRange, type EstimatorRule } from '../estimator'
import { getFormsText } from '../forms'
import { createLead, type LeadContext, type LeadFailure, type LeadInput } from './process'
import {
  auditFormSchema,
  estimatorLeadSchema,
  hasContactMethod,
  leadFormSchema,
  type PublicLeadSource,
} from './schema'
import { burstLimited, clientIp } from './spam'

// Server actions behind the public forms. Validation, spam checks, saving and emails live in
// ./process.ts; these functions only translate FormData and shape the response for the browser.

export type SubmitResult =
  | { ok: true }
  | { ok: false; code: 'invalid' | 'needContact' | LeadFailure }

export type EstimateResult =
  | { ok: true; priced: false }
  | { ok: true; priced: true; currency: string; min: number; max: number; range: string }
  | { ok: false; code: 'invalid' | 'rate' | 'failed' }

export type QuoteResult =
  | { ok: true; priced: false }
  | {
      ok: true
      priced: true
      range: string
      total: string
      lines: { label: string; amount: string }[]
      timeline?: string
    }
  | { ok: false; code: 'invalid' | 'needContact' | LeadFailure }

const str = (data: FormData, key: string) => {
  const value = data.get(key)
  return typeof value === 'string' ? value : ''
}

const ids = (data: FormData, key: string) =>
  data
    .getAll(key)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)

async function contextFrom(data: FormData): Promise<LeadContext> {
  const startedAt = Number(str(data, '_t'))
  let attribution: unknown
  try {
    attribution = JSON.parse(str(data, 'attribution') || '{}')
  } catch {
    attribution = {}
  }
  return {
    ip: clientIp(await headers()),
    honeypot: str(data, 'hp_site').trim() || undefined,
    startedAt: Number.isFinite(startedAt) && startedAt > 0 ? startedAt : undefined,
    turnstileToken: str(data, 'cf-turnstile-response') || undefined,
    attribution,
    submittedPath: str(data, 'submittedPath') || undefined,
    // Emails go out after the response, so a slow SMTP server never delays the visitor.
    defer: (task) => after(task),
  }
}

const contactFields = (data: FormData) => ({
  name: str(data, 'name'),
  email: str(data, 'email'),
  whatsapp: str(data, 'whatsapp'),
  privacy: str(data, 'privacy') === 'on' || str(data, 'privacy') === 'true',
})

async function publishedServices(ids: number[]) {
  if (!ids.length) return []
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'services',
    where: { and: [{ id: { in: ids } }, { _status: { equals: 'published' } }] },
    depth: 0,
    pagination: false,
    select: { title: true },
    overrideAccess: true,
  })
  return docs.map((doc) => ({ id: doc.id, title: doc.title }))
}

/** Checks an answer against the choices configured in the CMS (when there are any). */
async function checkChoice(value: string | undefined, list: 'budget' | 'timeline') {
  if (!value) return undefined
  const options = (await getFormsText()).options?.[list] ?? []
  return !options.length || options.some((option) => option.label === value) ? value : null
}

// ---------------------------------------------------------------------------------------------
// Multi-step form (contact page, pre-footer band, service pages)
// ---------------------------------------------------------------------------------------------

export async function submitLeadAction(data: FormData): Promise<SubmitResult> {
  const source = str(data, 'source')
  if (source !== 'contact-form' && source !== 'prefooter-form') return { ok: false, code: 'invalid' }

  const parsed = leadFormSchema.safeParse({
    ...contactFields(data),
    serviceIds: ids(data, 'services'),
    budget: str(data, 'budget'),
    timeline: str(data, 'timeline'),
    message: str(data, 'message'),
  })
  if (!parsed.success) return { ok: false, code: 'invalid' }
  if (!hasContactMethod(parsed.data)) return { ok: false, code: 'needContact' }

  const [budget, timeline] = await Promise.all([
    checkChoice(parsed.data.budget, 'budget'),
    checkChoice(parsed.data.timeline, 'timeline'),
  ])
  if (budget === null || timeline === null) return { ok: false, code: 'invalid' }

  const payload = await getPayload({ config })
  const input: LeadInput = {
    source: source as PublicLeadSource,
    name: parsed.data.name,
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp,
    services: await publishedServices(parsed.data.serviceIds),
    budget,
    timeline,
    message: parsed.data.message,
  }
  const result = await createLead(payload, input, await contextFrom(data))
  return result.ok ? { ok: true } : result
}

// ---------------------------------------------------------------------------------------------
// Free audit
// ---------------------------------------------------------------------------------------------

export async function submitAuditAction(data: FormData): Promise<SubmitResult> {
  const parsed = auditFormSchema.safeParse({
    ...contactFields(data),
    website: str(data, 'website'),
    message: str(data, 'message'),
  })
  if (!parsed.success) return { ok: false, code: 'invalid' }
  if (!hasContactMethod(parsed.data)) return { ok: false, code: 'needContact' }

  const payload = await getPayload({ config })
  const result = await createLead(
    payload,
    {
      source: 'free-audit',
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      website: parsed.data.website,
      message: parsed.data.message,
    },
    await contextFrom(data),
  )
  return result.ok ? { ok: true } : result
}

// ---------------------------------------------------------------------------------------------
// Cost estimator
// ---------------------------------------------------------------------------------------------

async function loadRule(serviceId: number): Promise<{ rule: EstimatorRule; title: string } | undefined> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'estimator-rules',
    where: { and: [{ service: { equals: serviceId } }, { active: { equals: true } }] },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const doc = docs[0]
  const service = doc && typeof doc.service === 'object' ? doc.service : undefined
  if (!doc || !service || service._status !== 'published') return undefined
  return { rule: doc, title: service.title }
}

/** Step 4: the price range only. The breakdown is released after the visitor leaves contact details. */
export async function estimateAction(input: {
  serviceId: number
  scope: string[]
  timeline?: string
}): Promise<EstimateResult> {
  if (burstLimited(`est:${clientIp(await headers())}`)) return { ok: false, code: 'rate' }
  if (!Number.isInteger(input.serviceId) || !Array.isArray(input.scope)) return { ok: false, code: 'invalid' }

  const loaded = await loadRule(input.serviceId)
  if (!loaded) return { ok: false, code: 'invalid' }

  const estimate = computeEstimate(loaded.rule, input.scope.map(String).slice(0, 50), input.timeline)
  if (!estimate.priced) return { ok: true, priced: false }
  return {
    ok: true,
    priced: true,
    currency: estimate.currency,
    min: estimate.min,
    max: estimate.max,
    range: formatRange(estimate),
  }
}

/** Step 5: save the lead, then (and only then) return the detailed quote. */
export async function submitEstimatorAction(data: FormData): Promise<QuoteResult> {
  const parsed = estimatorLeadSchema.safeParse({
    ...contactFields(data),
    serviceId: Number(str(data, 'serviceId')),
    scope: data.getAll('scope').filter((value): value is string => typeof value === 'string'),
    timeline: str(data, 'timeline'),
  })
  if (!parsed.success) return { ok: false, code: 'invalid' }
  if (!hasContactMethod(parsed.data)) return { ok: false, code: 'needContact' }

  const loaded = await loadRule(parsed.data.serviceId)
  if (!loaded) return { ok: false, code: 'invalid' }

  // The quote is recomputed here from the CMS rules; nothing the browser sends is trusted as a price.
  const estimate = computeEstimate(loaded.rule, parsed.data.scope, parsed.data.timeline)
  const text = (await getFormsText()).estimator
  const lineLabel = (label: string) => (label === 'base' ? text?.baseLabel || label : label)

  const emailLines: { label: string; value: string }[] = [{ label: 'Service', value: loaded.title }]
  if (estimate.priced) {
    for (const line of estimate.lines) emailLines.push({ label: lineLabel(line.label), value: formatMoney(line.amount, estimate.currency) })
    if (estimate.timeline) emailLines.push({ label: text?.timelineLine || 'Timeline', value: `${estimate.timeline.label} (×${estimate.timeline.multiplier})` })
    emailLines.push({ label: text?.totalLabel || 'Estimated total', value: formatRange(estimate) })
  }

  const payload = await getPayload({ config })
  const result = await createLead(
    payload,
    {
      source: 'estimator',
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      timeline: parsed.data.timeline,
      services: [{ id: parsed.data.serviceId, title: loaded.title }],
      message: parsed.data.scope.length ? parsed.data.scope.join('; ') : undefined,
      estimate: {
        service: parsed.data.serviceId,
        selections: { scope: parsed.data.scope, timeline: parsed.data.timeline ?? null },
        rangeMin: estimate.priced ? estimate.min : undefined,
        rangeMax: estimate.priced ? estimate.max : undefined,
        currency: estimate.priced ? estimate.currency : undefined,
      },
      estimateLines: emailLines,
    },
    await contextFrom(data),
  )
  if (!result.ok) return result
  if (!estimate.priced) return { ok: true, priced: false }

  return {
    ok: true,
    priced: true,
    range: formatRange(estimate),
    total: formatMoney(estimate.total, estimate.currency),
    lines: estimate.lines.map((line) => ({ label: lineLabel(line.label), amount: formatMoney(line.amount, estimate.currency) })),
    timeline: estimate.timeline ? `${estimate.timeline.label} (×${estimate.timeline.multiplier})` : undefined,
  }
}
