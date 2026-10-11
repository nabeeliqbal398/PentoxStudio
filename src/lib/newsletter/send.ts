import type { Payload, Where } from 'payload'

import type { Campaign } from '../../payload-types'
import { sendEmail } from '../email'
import { isEmailConfigured } from '../email/config'
import { env } from '../env'
import { campaignMessage, getSender, renderCampaignBody, type RenderedBody } from './email'

// Batched, throttled, resumable campaign sending.
//
//  * Only ACTIVE (confirmed, not unsubscribed) subscribers are ever selected, re-checked on every batch.
//  * The Campaign Deliveries collection is a ledger with one row per (campaign, subscriber): nobody is emailed
//    twice for a campaign, even after a crash or a restart, and a half-finished campaign continues where it stopped.
//  * Limits come from .env (NEWSLETTER_*): batch size, pause between batches, pause between messages and a daily cap,
//    so Gmail / Hostinger sending limits are respected. When the daily cap is reached the campaign waits for tomorrow.
//  * If every message in a batch fails (SMTP down, wrong password) the campaign stops as "failed" with the reason and
//    can be resumed from the admin once fixed.

export const sendSettings = () => ({
  batchSize: env.NEWSLETTER_BATCH_SIZE ?? 20,
  delaySeconds: env.NEWSLETTER_BATCH_DELAY_SECONDS ?? 60,
  messageDelayMs: env.NEWSLETTER_MESSAGE_DELAY_MS ?? 1000,
  dailyLimit: env.NEWSLETTER_DAILY_LIMIT ?? 400,
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const LOCK_MS = 10 * 60 * 1000

/** Active subscribers for a campaign: everyone, or only those carrying one of the chosen tags. */
export function audienceWhere(campaign: Pick<Campaign, 'audience' | 'audienceTags'>): Where {
  const and: Where[] = [{ status: { equals: 'active' } }]
  if (campaign.audience === 'tags') and.push({ tags: { in: campaign.audienceTags?.length ? campaign.audienceTags : ['__none__'] } })
  return { and }
}

export async function countAudience(payload: Payload, campaign: Pick<Campaign, 'audience' | 'audienceTags'>) {
  return (await payload.count({ collection: 'subscribers', where: audienceWhere(campaign), overrideAccess: true })).totalDocs
}

export type StartResult = { ok: true; recipients: number } | { ok: false; error: string }

/** Checks everything that must be true before sending, then marks the campaign as sending. */
export async function startCampaign(payload: Payload, id: number): Promise<StartResult> {
  const campaign = await payload.findByID({ collection: 'campaigns', id, depth: 0, overrideAccess: true }).catch(() => null)
  if (!campaign) return { ok: false, error: 'Campaign not found.' }
  if (!['draft', 'scheduled', 'failed'].includes(campaign.status)) return { ok: false, error: `A ${campaign.status} campaign cannot be started.` }
  if (!isEmailConfigured()) return { ok: false, error: 'SMTP is not configured (set SMTP_HOST and EMAIL_FROM in .env).' }
  const sender = await getSender(payload)
  if (!sender.address) return { ok: false, error: 'The business address is missing in Site settings. Every newsletter must carry it.' }
  if (!campaign.subject?.trim() || !campaign.content?.root?.children?.length) return { ok: false, error: 'The campaign needs a subject and content.' }

  const recipients = await countAudience(payload, campaign)
  if (!recipients) return { ok: false, error: 'No active subscribers match this audience.' }

  const resuming = campaign.status === 'failed' && Boolean(campaign.progress?.startedAt)
  await payload.update({
    collection: 'campaigns',
    id,
    overrideAccess: true,
    data: {
      status: 'sending',
      progress: {
        cursor: resuming ? (campaign.progress?.cursor ?? 0) : 0,
        startedAt: resuming ? campaign.progress?.startedAt : new Date().toISOString(),
        lockedUntil: null,
        pausedUntil: null,
        lastError: null,
      },
      stats: { ...campaign.stats, recipients: resuming ? Math.max(campaign.stats?.recipients ?? 0, recipients) : recipients },
    },
  })
  return { ok: true, recipients }
}

export type BatchResult = {
  /** The campaign has nothing more to send (finished, or no longer in "sending"). */
  done: boolean
  /** When the next batch should run (absent when done). */
  nextRunAt?: Date
  sent: number
  failed: number
  note?: string
}

const bodyCache = new Map<string, RenderedBody>()

async function bodyFor(payload: Payload, campaign: Campaign): Promise<RenderedBody> {
  const key = `${campaign.id}:${campaign.updatedAt}`
  const cached = bodyCache.get(key)
  if (cached) return cached
  const body = await renderCampaignBody(payload, campaign.content)
  if (bodyCache.size > 20) bodyCache.clear()
  bodyCache.set(key, body)
  return body
}

const utcMidnight = (now: number) => {
  const d = new Date(now)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Sends one batch of a campaign. Safe to call repeatedly; see the notes at the top of the file. */
export async function runBatch(payload: Payload, campaignId: number, now = Date.now()): Promise<BatchResult> {
  const settings = sendSettings()
  const campaign = await payload.findByID({ collection: 'campaigns', id: campaignId, depth: 0, overrideAccess: true }).catch(() => null)
  if (!campaign || campaign.status !== 'sending') return { done: true, sent: 0, failed: 0, note: 'not sending' }

  const lockedUntil = campaign.progress?.lockedUntil ? new Date(campaign.progress.lockedUntil).getTime() : 0
  if (lockedUntil > now) return { done: false, nextRunAt: new Date(lockedUntil + 1000), sent: 0, failed: 0, note: 'another batch is running' }

  const patch = (data: Record<string, unknown>) =>
    payload.update({ collection: 'campaigns', id: campaignId, overrideAccess: true, data: data as never })
  const progress = { ...campaign.progress }

  const fail = async (error: string): Promise<BatchResult> => {
    await patch({ status: 'failed', progress: { ...progress, lockedUntil: null, lastError: error.slice(0, 250) } })
    return { done: true, sent: 0, failed: 0, note: error }
  }

  if (!isEmailConfigured()) return fail('SMTP is not configured (set SMTP_HOST and EMAIL_FROM in .env).')
  const sender = await getSender(payload)
  if (!sender.address) return fail('The business address is missing in Site settings.')

  // Daily cap across all campaigns.
  const sentToday = (
    await payload.count({
      collection: 'campaign-deliveries',
      where: { and: [{ status: { equals: 'sent' } }, { sentAt: { greater_than_equal: new Date(utcMidnight(now)).toISOString() } }] },
      overrideAccess: true,
    })
  ).totalDocs
  const room = settings.dailyLimit - sentToday
  if (room <= 0) {
    const resumeAt = new Date(utcMidnight(now) + 24 * 3600 * 1000 + 5 * 60 * 1000)
    await patch({ progress: { ...progress, pausedUntil: resumeAt.toISOString(), lockedUntil: null } })
    return { done: false, nextRunAt: resumeAt, sent: 0, failed: 0, note: 'daily limit reached' }
  }
  const size = Math.min(settings.batchSize, room)

  await patch({ progress: { ...progress, lockedUntil: new Date(now + LOCK_MS).toISOString(), pausedUntil: null } })

  const where = audienceWhere(campaign)
  ;(where.and as Where[]).push({ id: { greater_than: progress.cursor ?? 0 } })
  const batch = await payload.find({ collection: 'subscribers', where, sort: 'id', limit: size, depth: 0, pagination: false, overrideAccess: true })

  const settingsDoc = await payload.findGlobal({ slug: 'newsletter', depth: 0, overrideAccess: true })
  const body = batch.docs.length ? await bodyFor(payload, campaign) : { html: '', text: '' }

  let sent = 0
  let failed = 0
  let cursor = progress.cursor ?? 0
  let lastError = ''
  for (const subscriber of batch.docs) {
    cursor = subscriber.id
    const prior = await payload.find({
      collection: 'campaign-deliveries',
      where: { and: [{ campaign: { equals: campaignId } }, { subscriber: { equals: subscriber.id } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (prior.docs[0]) {
      // A crash can leave a row "pending": it may or may not have been sent, so it is never sent again.
      if (prior.docs[0].status === 'pending') {
        await payload.update({ collection: 'campaign-deliveries', id: prior.docs[0].id, overrideAccess: true, data: { status: 'failed', error: 'Interrupted: not retried to avoid a duplicate email.' } })
      }
      continue
    }
    const delivery = await payload.create({
      collection: 'campaign-deliveries',
      overrideAccess: true,
      data: { campaign: campaignId, subscriber: subscriber.id, email: subscriber.email, status: 'pending' },
    })
    const message = campaignMessage({
      subject: campaign.subject,
      preheader: campaign.preheader,
      body,
      subscriberId: subscriber.id,
      sender,
      text: settingsDoc.emails,
    })
    const result = await sendEmail(payload, { to: subscriber.email, subject: campaign.subject, html: message.html, text: message.text, headers: message.headers })
    if (result.status === 'sent') {
      sent += 1
      await payload.update({ collection: 'campaign-deliveries', id: delivery.id, overrideAccess: true, data: { status: 'sent', sentAt: new Date().toISOString() } })
    } else {
      failed += 1
      lastError = 'reason' in result ? result.reason : 'unknown error'
      await payload.update({ collection: 'campaign-deliveries', id: delivery.id, overrideAccess: true, data: { status: 'failed', error: lastError.slice(0, 250) } })
    }
    if (settings.messageDelayMs) await sleep(settings.messageDelayMs)
  }

  const count = async (status: 'sent' | 'failed') =>
    (await payload.count({ collection: 'campaign-deliveries', where: { and: [{ campaign: { equals: campaignId } }, { status: { equals: status } }] }, overrideAccess: true })).totalDocs
  const [totalSent, totalFailed] = await Promise.all([count('sent'), count('failed')])
  const stats = { ...campaign.stats, sent: totalSent, failed: totalFailed }

  // Every message in a batch failed: SMTP is probably down or misconfigured. Stop and keep the position.
  if (batch.docs.length >= 3 && sent === 0 && failed === batch.docs.length) {
    await patch({ status: 'failed', stats, progress: { ...progress, cursor: progress.cursor ?? 0, lockedUntil: null, lastError: `All ${failed} messages in the batch failed: ${lastError}`.slice(0, 250) } })
    return { done: true, sent, failed, note: 'all messages failed' }
  }

  // Fewer subscribers than requested means the audience is exhausted.
  if (batch.docs.length < size) {
    await patch({ status: 'sent', sentAt: new Date().toISOString(), stats, progress: { ...progress, cursor, lockedUntil: null, pausedUntil: null, lastError: null } })
    return { done: true, sent, failed }
  }

  await patch({ stats, progress: { ...progress, cursor, lockedUntil: null, lastError: lastError || null } })
  return { done: false, nextRunAt: new Date(now + settings.delaySeconds * 1000), sent, failed }
}

/** "Send test": one copy of the campaign to one address. Never touches subscribers or the ledger. */
export async function sendTest(payload: Payload, campaignId: number, to: string) {
  const campaign = await payload.findByID({ collection: 'campaigns', id: campaignId, depth: 0, overrideAccess: true }).catch(() => null)
  if (!campaign) return { ok: false as const, error: 'Campaign not found.' }
  if (!isEmailConfigured()) return { ok: false as const, error: 'SMTP is not configured (set SMTP_HOST and EMAIL_FROM in .env).' }
  const [sender, settingsDoc, body] = await Promise.all([
    getSender(payload),
    payload.findGlobal({ slug: 'newsletter', depth: 0, overrideAccess: true }),
    renderCampaignBody(payload, campaign.content),
  ])
  const message = campaignMessage({ subject: `[TEST] ${campaign.subject}`, preheader: campaign.preheader, body, subscriberId: 0, sender, text: settingsDoc.emails, test: true })
  const result = await sendEmail(payload, { to, subject: `[TEST] ${campaign.subject}`, html: message.html, text: message.text })
  return result.status === 'sent' ? { ok: true as const } : { ok: false as const, error: 'reason' in result ? result.reason : 'Not sent.' }
}
