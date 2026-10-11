import type { Payload } from 'payload'

import { leadSources } from '../../collections/Leads'
import { env } from '../env'
import { alertEmail, autoReplyEmail, type LeadEmailData } from '../email/templates'
import { leadNotifyAddress, sendEmail, type EmailResult } from '../email'
import { attributionSchema, type PublicLeadSource } from './schema'
import { burstLimited, dbRateLimited, hashIp, verifyTurnstile } from './spam'

// The one path every public form takes: spam checks → save to Leads → emails.
// The lead is saved BEFORE any email is attempted, and email problems never turn a saved lead into
// an error for the visitor (they are recorded on the lead instead).

export type LeadContext = {
  ip: string
  turnstileToken?: string
  /** Honeypot field value: real visitors never fill it. */
  honeypot?: string
  /** When the form was rendered (ms since epoch); instant submissions are bots. */
  startedAt?: number
  attribution?: unknown
  submittedPath?: string
  /** Runs the emails after the response is sent (Next's `after`). Omitted: runs inline. */
  defer?: (task: () => Promise<void>) => void
  now?: number
}

export type LeadInput = {
  source: PublicLeadSource
  name: string
  email?: string
  whatsapp?: string
  services?: { id: number; title: string }[]
  budget?: string
  timeline?: string
  message?: string
  website?: string
  estimate?: {
    service: number
    selections: Record<string, unknown>
    rangeMin?: number
    rangeMax?: number
    currency?: string
  }
  /** Extra lines for the emails (the detailed estimate). */
  estimateLines?: { label: string; value: string }[]
}

export type LeadFailure = 'rate' | 'verification' | 'failed'

export type LeadResult = { ok: true; leadId?: number | string } | { ok: false; code: LeadFailure }

const MIN_FILL_MS = 2500

export async function guardRequest(payload: Payload, ctx: LeadContext): Promise<LeadResult | undefined> {
  const now = ctx.now ?? Date.now()

  // Bots that fill the hidden field or submit instantly get a success response and nothing is saved.
  if (ctx.honeypot) return { ok: true }
  if (ctx.startedAt && now - ctx.startedAt < MIN_FILL_MS) return { ok: true }

  if (burstLimited(ctx.ip, now)) return { ok: false, code: 'rate' }
  if (!(await verifyTurnstile(ctx.turnstileToken, ctx.ip))) return { ok: false, code: 'verification' }
  // Without a client address (no proxy headers, e.g. local development) every visitor would share one
  // bucket, so the database limit only applies to identifiable addresses.
  if (ctx.ip !== 'unknown' && (await dbRateLimited(payload, hashIp(ctx.ip), now))) return { ok: false, code: 'rate' }
  return undefined
}

const sourceLabel = (source: string) => leadSources.find((item) => item.value === source)?.label ?? source

export async function createLead(payload: Payload, input: LeadInput, ctx: LeadContext): Promise<LeadResult> {
  const blocked = await guardRequest(payload, ctx)
  if (blocked) return blocked

  const attribution = attributionSchema.safeParse(ctx.attribution ?? {})

  let leadId: number | string
  try {
    const lead = await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        source: input.source,
        status: 'new',
        services: input.services?.map((service) => service.id),
        budget: input.budget,
        timeline: input.timeline,
        message: input.message,
        website: input.website,
        estimate: input.estimate,
        attribution: attribution.success ? attribution.data : undefined,
        submittedPath: ctx.submittedPath?.slice(0, 300),
        ipHash: hashIp(ctx.ip),
        consent: { privacyAccepted: true },
      },
    })
    leadId = lead.id
  } catch (error) {
    payload.logger.error(`Could not save lead: ${error instanceof Error ? error.message : String(error)}`)
    return { ok: false, code: 'failed' }
  }

  const notify = () => sendLeadEmails(payload, leadId, input)
  if (ctx.defer) ctx.defer(notify)
  else await notify()

  return { ok: true, leadId }
}

/** Auto-reply to the visitor + alert to LEAD_NOTIFY_TO. Never throws; records the outcome on the lead. */
export async function sendLeadEmails(payload: Payload, leadId: number | string, input: LeadInput): Promise<void> {
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
    const data: LeadEmailData = {
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp,
      sourceLabel: sourceLabel(input.source),
      services: input.services?.map((service) => service.title) ?? [],
      budget: input.budget,
      timeline: input.timeline,
      message: input.message,
      website: input.website,
      estimateLines: input.estimateLines,
      adminUrl: `${env.NEXT_PUBLIC_SITE_URL}/admin/collections/leads/${leadId}`,
      businessName: settings.businessName || 'Pentox Studio',
      responseTime: settings.responseTime || undefined,
    }

    const skipped = (reason: string): EmailResult => ({ status: 'skipped', reason })
    const notifyTo = leadNotifyAddress()

    const [autoReply, alert] = await Promise.all([
      input.email ? sendEmail(payload, { to: input.email, ...autoReplyEmail(data) }) : skipped('no email address'),
      notifyTo
        ? sendEmail(payload, { to: notifyTo, replyTo: input.email, ...alertEmail(data) })
        : skipped('LEAD_NOTIFY_TO is not set'),
    ])

    const failure = [autoReply, alert].find((result) => result.status !== 'sent' && 'reason' in result)
    await payload.update({
      collection: 'leads',
      id: leadId,
      overrideAccess: true,
      data: {
        emailLog: {
          autoReply: autoReply.status,
          alert: alert.status,
          error: failure && 'reason' in failure ? failure.reason : undefined,
        },
      },
    })
  } catch (error) {
    payload.logger.error(`Lead ${leadId} saved, but sending emails failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
