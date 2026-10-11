import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import config from '@/payload.config'
import { confirmSubscription, subscribe, unsubscribe } from '@/lib/newsletter/subscribe'
import { signToken, verifyToken } from '@/lib/newsletter/tokens'
import { importSubscribers, parseCsv } from '@/lib/newsletter/csv'
import { htmlToText, renderCampaignBody } from '@/lib/newsletter/email'
import { countAudience, runBatch, startCampaign } from '@/lib/newsletter/send'

// Small limits and no pause between messages, so the tests are quick; email sending is captured, never sent.
vi.mock('@/lib/env', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/env')>()
  return { ...original, env: { ...original.env, NEWSLETTER_BATCH_SIZE: 2, NEWSLETTER_MESSAGE_DELAY_MS: 0, NEWSLETTER_DAILY_LIMIT: 1000, TURNSTILE_SECRET: undefined } }
})
vi.mock('@/lib/email/config', () => ({ isEmailConfigured: () => true }))

type Sent = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }
const outbox: Sent[] = []
vi.mock('@/lib/email', () => ({
  sendEmail: async (_payload: unknown, message: Sent) => {
    outbox.push(message)
    return { status: 'sent' }
  },
  leadNotifyAddress: () => undefined,
}))

const doc = (text: string) =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '', children: [{ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' }] },
      ],
    },
  }) as never

describe('signed tokens', () => {
  it('verifies only the right purpose, unexpired and untampered', () => {
    const confirm = signToken({ id: 5, p: 'c', n: 'abc', exp: Date.now() + 1000 })
    expect(verifyToken(confirm, 'c')).toMatchObject({ id: 5, n: 'abc' })
    expect(verifyToken(confirm, 'u')).toBeNull() // a confirm link cannot unsubscribe
    expect(verifyToken(confirm, 'c', Date.now() + 5000)).toBeNull() // expired
    expect(verifyToken(`${confirm.slice(0, -2)}xx`, 'c')).toBeNull() // altered signature
    const [body] = confirm.split('.')
    expect(verifyToken(`${body}.`, 'c')).toBeNull()
    expect(verifyToken('garbage', 'u')).toBeNull()
    expect(verifyToken(signToken({ id: 9, p: 'u' }), 'u', Date.now() + 10 * 365 * 24 * 3600 * 1000)).toMatchObject({ id: 9 }) // unsubscribe never expires
  })
})

describe('CSV parsing', () => {
  it('handles quotes, commas, CRLF and a BOM', () => {
    expect(parseCsv('﻿email,name\r\n"a@b.co","Smith, ""Al"""\r\n\r\nc@d.co,\n')).toEqual([
      ['email', 'name'],
      ['a@b.co', 'Smith, "Al"'],
      ['c@d.co', ''],
    ])
  })
})

describe('email rendering', () => {
  it('renders campaign content as HTML and plain text', async () => {
    const payload = await getPayload({ config: await config })
    const body = await renderCampaignBody(payload, doc('Hello <world> & friends'))
    expect(body.html).toContain('Hello &lt;world&gt; &amp; friends')
    expect(htmlToText('<p>Hi <a href="https://x.test/a?b=1&amp;c=2">link</a></p>')).toBe('Hi link (https://x.test/a?b=1&c=2)')
  })
})

describe('newsletter (database)', () => {
  let payload: Payload
  const tag = `itest-news-${Date.now()}`
  const addr = (name: string) => `${name}-${tag}@example.test`

  const cleanup = async () => {
    const subs = await payload.find({ collection: 'subscribers', where: { email: { like: tag } }, pagination: false, depth: 0, overrideAccess: true })
    const ids = subs.docs.map((s) => s.id)
    if (ids.length) await payload.delete({ collection: 'campaign-deliveries', where: { subscriber: { in: ids } }, overrideAccess: true })
    await payload.delete({ collection: 'subscribers', where: { email: { like: tag } }, overrideAccess: true })
    await payload.delete({ collection: 'campaigns', where: { subject: { like: tag } }, overrideAccess: true })
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await cleanup()
  })
  afterAll(cleanup)
  beforeEach(() => {
    outbox.length = 0
  })

  const ctx = (over = {}) => ({ ip: `198.51.100.${Math.floor(Math.random() * 200) + 1}`, ...over })

  it('double opt-in: pending until the emailed link is used, once', async () => {
    const email = addr('opt')
    expect(await subscribe(payload, { email, source: 'footer', consent: true }, ctx())).toEqual({ ok: true })
    const pending = (await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, overrideAccess: true })).docs[0]
    expect(pending.status).toBe('pending')
    expect(pending.consentAt).toBeTruthy()

    // The confirmation email carries a signed link; nobody is on the list yet.
    expect(outbox).toHaveLength(1)
    const link = /token=([^"&\s]+)/.exec(outbox[0].html)?.[1]
    expect(link).toBeTruthy()
    expect(outbox[0].html).toContain('Pentox Studio') // business name + address footer

    const token = decodeURIComponent(link!)
    expect(await confirmSubscription(payload, token)).toEqual({ ok: true })
    const active = await payload.findByID({ collection: 'subscribers', id: pending.id, overrideAccess: true })
    expect(active.status).toBe('active')
    expect(active.confirmedAt).toBeTruthy()
    expect(await confirmSubscription(payload, token)).toEqual({ ok: true }) // second click is harmless
    expect(await confirmSubscription(payload, 'tampered')).toEqual({ ok: false, code: 'invalid' })

    // Signing up again does not email an active subscriber.
    outbox.length = 0
    await subscribe(payload, { email, source: 'footer', consent: true }, ctx())
    expect(outbox).toHaveLength(0)
  })

  it('rejects missing consent, bad email, honeypot and instant submits without subscribing anyone', async () => {
    expect(await subscribe(payload, { email: addr('x1'), consent: false }, ctx())).toMatchObject({ ok: false, code: 'invalid' })
    expect(await subscribe(payload, { email: 'nope', consent: true }, ctx())).toMatchObject({ ok: false, code: 'invalid' })
    expect(await subscribe(payload, { email: addr('bot'), consent: true }, ctx({ honeypot: 'spam' }))).toEqual({ ok: true })
    expect(await subscribe(payload, { email: addr('fast'), consent: true }, ctx({ startedAt: Date.now() }))).toEqual({ ok: true })
    const count = await payload.count({ collection: 'subscribers', where: { email: { in: [addr('x1'), addr('bot'), addr('fast')] } }, overrideAccess: true })
    expect(count.totalDocs).toBe(0)
    expect(outbox).toHaveLength(0)
  })

  it('unsubscribing works from the signed link, and an unsubscribed address needs a fresh confirmation', async () => {
    const email = addr('unsub')
    const sub = await payload.create({ collection: 'subscribers', overrideAccess: true, data: { email, status: 'active', source: 'admin' } })
    expect(await unsubscribe(payload, signToken({ id: sub.id, p: 'u' }))).toEqual({ ok: true })
    const after = await payload.findByID({ collection: 'subscribers', id: sub.id, overrideAccess: true })
    expect(after.status).toBe('unsubscribed')
    expect(after.unsubscribedAt).toBeTruthy()
    expect(await unsubscribe(payload, signToken({ id: sub.id, p: 'c' }))).toEqual({ ok: false, code: 'invalid' })

    await subscribe(payload, { email, source: 'blog-post', consent: true }, ctx())
    expect((await payload.findByID({ collection: 'subscribers', id: sub.id, overrideAccess: true })).status).toBe('pending')
  })

  it('CSV import: dedupes, merges tags, never reactivates unsubscribed, and needs the consent confirmation', async () => {
    await payload.create({ collection: 'subscribers', overrideAccess: true, data: { email: addr('gone'), status: 'unsubscribed', source: 'admin' } })
    await payload.create({ collection: 'subscribers', overrideAccess: true, data: { email: addr('have'), status: 'active', source: 'admin', tags: ['old'] } })
    const csv = [
      'Email,Name,Tags,Consent',
      `${addr('new1')},One,"seo; clients",yes`,
      `${addr('NEW1')},Dup,,yes`,
      `${addr('new2')},Two,,no`,
      `${addr('gone')},Gone,,yes`,
      `${addr('have')},Have,newtag,yes`,
      'not-an-email,X,,yes',
    ].join('\n')

    const withoutConfirmation = await importSubscribers(payload, csv, { attested: false })
    expect(withoutConfirmation).toMatchObject({ created: 2, createdActive: 0, createdPending: 2, duplicatesInFile: 1, skippedUnsubscribed: 1, updated: 1 })
    expect(withoutConfirmation.invalid).toHaveLength(1)

    await payload.delete({ collection: 'subscribers', where: { email: { in: [addr('new1'), addr('new2')] } }, overrideAccess: true })
    const confirmed = await importSubscribers(payload, csv, { attested: true })
    expect(confirmed).toMatchObject({ created: 2, createdActive: 1, createdPending: 1 })

    const gone = (await payload.find({ collection: 'subscribers', where: { email: { equals: addr('gone') } }, overrideAccess: true })).docs[0]
    expect(gone.status).toBe('unsubscribed')
    const have = (await payload.find({ collection: 'subscribers', where: { email: { equals: addr('have') } }, overrideAccess: true })).docs[0]
    expect(have.tags).toEqual(expect.arrayContaining(['old', 'newtag']))
    expect((await importSubscribers(payload, 'name\nx', { attested: true })).missingColumn).toBe('email')
  })

  it('sends a campaign only to active subscribers, in batches, once each, with unsubscribe link, address and one-click headers', async () => {
    // Fresh audience: 3 active (tag "seo"), 1 pending, 1 unsubscribed.
    const make = (name: string, status: 'active' | 'pending' | 'unsubscribed') =>
      payload.create({ collection: 'subscribers', overrideAccess: true, data: { email: addr(name), status, source: 'admin', tags: [`${tag}-grp`] } })
    const [a1, a2, a3] = await Promise.all([make('c-a1', 'active'), make('c-a2', 'active'), make('c-a3', 'active')])
    await make('c-pending', 'pending')
    await make('c-unsub', 'unsubscribed')

    const campaign = await payload.create({
      collection: 'campaigns',
      overrideAccess: true,
      data: { subject: `Newsletter ${tag}`, content: doc('Hello subscribers'), audience: 'tags', audienceTags: [`${tag}-grp`], status: 'draft' },
    })
    expect(await countAudience(payload, campaign)).toBe(3)

    // A crash left a "pending" ledger row for a1: it must not be emailed again.
    await payload.create({ collection: 'campaign-deliveries', overrideAccess: true, data: { campaign: campaign.id, subscriber: a1.id, email: a1.email, status: 'pending' } })

    const started = await startCampaign(payload, campaign.id)
    expect(started).toEqual({ ok: true, recipients: 3 })

    const first = await runBatch(payload, campaign.id)
    expect(first.done).toBe(false) // batch size is 2, so there is more to do
    expect(first.nextRunAt).toBeInstanceOf(Date)
    const second = await runBatch(payload, campaign.id)
    expect(second.done).toBe(true)

    const recipients = outbox.map((message) => message.to).sort()
    expect(recipients).toEqual([a2.email, a3.email].sort()) // a1 interrupted, pending and unsubscribed never get mail
    for (const message of outbox) {
      expect(message.html).toContain('/newsletter/unsubscribe/?token=')
      expect(message.text).toContain('/newsletter/unsubscribe/?token=')
      expect(message.html).toContain('Zainab Tower') // the business address from Site settings
      expect(message.headers?.['List-Unsubscribe']).toMatch(/^<https?:\/\/.+\/api\/unsubscribe\/\?token=.+>$/)
      expect(message.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    }

    const done = await payload.findByID({ collection: 'campaigns', id: campaign.id, overrideAccess: true })
    expect(done.status).toBe('sent')
    expect(done.stats).toMatchObject({ sent: 2, failed: 1 })

    // Running it again sends nothing more.
    outbox.length = 0
    expect((await runBatch(payload, campaign.id)).done).toBe(true)
    expect(outbox).toHaveLength(0)
  })

  it('refuses to start a campaign with no matching active subscribers', async () => {
    const campaign = await payload.create({
      collection: 'campaigns',
      overrideAccess: true,
      data: { subject: `Empty ${tag}`, content: doc('x'), audience: 'tags', audienceTags: ['no-such-tag-xyz'], status: 'draft' },
    })
    expect(await startCampaign(payload, campaign.id)).toMatchObject({ ok: false })
  })
})
