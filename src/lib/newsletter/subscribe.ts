import type { Payload } from 'payload'
import { z } from 'zod'

import { sendEmail } from '../email'
import { isEmailConfigured } from '../email/config'
import { burstLimited, verifyTurnstile } from '../leads/spam'
import { confirmationEmail, getSender } from './email'
import { CONFIRM_TTL_MS, newNonce, verifyToken } from './tokens'

// Double opt-in: signing up creates a PENDING subscriber and emails a confirmation link. Only clicking
// the link (confirmSubscription) makes the address ACTIVE, and only ACTIVE addresses ever receive a campaign.
// Responses never reveal whether an address is already on the list.

export const subscribeSources = ['footer', 'blog-post', 'home', 'popup'] as const
export type SubscribeSource = (typeof subscribeSources)[number]

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(200)),
  source: z.enum(subscribeSources).default('footer'),
  consent: z.literal(true),
})

export type SubscribeContext = {
  ip: string
  userAgent?: string
  honeypot?: string
  startedAt?: number
  turnstileToken?: string
  now?: number
}

export type SubscribeResult = { ok: true } | { ok: false; code: 'invalid' | 'rate' | 'verification' | 'failed' }

const MIN_FILL_MS = 2000
const RESEND_AFTER_MS = 5 * 60 * 1000
const PER_IP_PER_HOUR = 5

const confirmationSentAt = (expires?: string | null) => (expires ? new Date(expires).getTime() - CONFIRM_TTL_MS : 0)

export async function subscribe(payload: Payload, raw: unknown, ctx: SubscribeContext): Promise<SubscribeResult> {
  const now = ctx.now ?? Date.now()

  // Bots: filled honeypot or instant submit get a normal-looking success and nothing happens.
  if (ctx.honeypot) return { ok: true }
  if (ctx.startedAt && now - ctx.startedAt < MIN_FILL_MS) return { ok: true }

  if (burstLimited(`sub:${ctx.ip}`, now)) return { ok: false, code: 'rate' }

  const parsed = subscribeSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, code: 'invalid' }
  const { email, source } = parsed.data

  if (!(await verifyTurnstile(ctx.turnstileToken, ctx.ip))) return { ok: false, code: 'verification' }

  // Without SMTP no confirmation can be delivered, so the signup is not accepted.
  if (!isEmailConfigured()) return { ok: false, code: 'failed' }

  if (ctx.ip !== 'unknown') {
    const recent = await payload.count({
      collection: 'subscribers',
      where: { and: [{ consentIp: { equals: ctx.ip } }, { createdAt: { greater_than: new Date(now - 3_600_000).toISOString() } }] },
      overrideAccess: true,
    })
    if (recent.totalDocs >= PER_IP_PER_HOUR) return { ok: false, code: 'rate' }
  }

  const found = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })
  const existing = found.docs[0]
  if (existing?.status === 'active' || existing?.status === 'bounced') return { ok: true }
  if (existing?.status === 'pending' && now - confirmationSentAt(existing.confirmTokenExpires) < RESEND_AFTER_MS) return { ok: true }

  const nonce = newNonce()
  const evidence = {
    status: 'pending' as const,
    confirmToken: nonce,
    confirmTokenExpires: new Date(now + CONFIRM_TTL_MS).toISOString(),
    consentAt: new Date(now).toISOString(),
    consentIp: ctx.ip === 'unknown' ? undefined : ctx.ip,
    userAgent: ctx.userAgent?.slice(0, 300),
  }
  let id: number
  if (existing) {
    // Pending (resend) or unsubscribed (explicitly signing up again): a fresh confirmation is required either way.
    await payload.update({
      collection: 'subscribers',
      id: existing.id,
      overrideAccess: true,
      data: { ...evidence, source, unsubscribedAt: null },
    })
    id = existing.id
  } else {
    const created = await payload.create({ collection: 'subscribers', overrideAccess: true, data: { email, source, ...evidence } })
    id = created.id
  }

  const [sender, settings] = await Promise.all([
    getSender(payload),
    payload.findGlobal({ slug: 'newsletter', depth: 0, overrideAccess: true }),
  ])
  const message = confirmationEmail({ subscriberId: id, nonce, sender, text: settings.emails })
  const sent = await sendEmail(payload, { to: email, subject: message.subject, html: message.html, text: message.text })
  return sent.status === 'sent' ? { ok: true } : { ok: false, code: 'failed' }
}

export type TokenResult = { ok: true } | { ok: false; code: 'invalid' }

export async function confirmSubscription(payload: Payload, token: string | null | undefined, now = Date.now()): Promise<TokenResult> {
  const data = verifyToken(token, 'c', now)
  if (!data) return { ok: false, code: 'invalid' }
  const subscriber = await payload.findByID({ collection: 'subscribers', id: data.id, depth: 0, overrideAccess: true }).catch(() => null)
  if (!subscriber) return { ok: false, code: 'invalid' }
  if (subscriber.status === 'active') return { ok: true } // already confirmed: clicking twice is harmless
  // Single use: the nonce in the link must still be the one stored on the subscriber.
  if (subscriber.status !== 'pending' || !subscriber.confirmToken || subscriber.confirmToken !== data.n) return { ok: false, code: 'invalid' }
  await payload.update({
    collection: 'subscribers',
    id: subscriber.id,
    overrideAccess: true,
    data: { status: 'active', confirmedAt: new Date(now).toISOString(), confirmToken: null, confirmTokenExpires: null },
  })
  return { ok: true }
}

export async function unsubscribe(payload: Payload, token: string | null | undefined, now = Date.now()): Promise<TokenResult> {
  const data = verifyToken(token, 'u', now)
  if (!data) return { ok: false, code: 'invalid' }
  const subscriber = await payload.findByID({ collection: 'subscribers', id: data.id, depth: 0, overrideAccess: true }).catch(() => null)
  if (!subscriber) return { ok: false, code: 'invalid' }
  if (subscriber.status !== 'unsubscribed') {
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      overrideAccess: true,
      data: { status: 'unsubscribed', unsubscribedAt: new Date(now).toISOString(), confirmToken: null, confirmTokenExpires: null },
    })
  }
  return { ok: true }
}
