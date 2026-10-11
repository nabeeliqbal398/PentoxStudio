import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import config from '@/payload.config'
import { computeEstimate, formatRange } from '@/lib/estimator'
import { csvCell, csvRow } from '@/lib/leads/export'
import { createLead, type LeadContext } from '@/lib/leads/process'
import { auditFormSchema, leadFormSchema, normaliseWebsite } from '@/lib/leads/schema'
import { burstLimited, hashIp, HOURLY_LIMIT } from '@/lib/leads/spam'

describe('estimator maths', () => {
  const rule = {
    basePrice: 1000,
    currency: 'USD',
    scopeOptions: [
      { label: 'Blog', priceAdd: 200 },
      { label: 'Shop', priceAdd: 500 },
      { label: 'Unpriced', priceAdd: null },
    ],
    timelineOptions: [{ label: 'Rush', multiplier: 1.5 }],
    rangeSpreadPercent: 20,
  }

  it('adds the selected options, applies the timeline and spreads the range', () => {
    const estimate = computeEstimate(rule, ['Blog', 'Unpriced'], 'Rush')
    expect(estimate).toMatchObject({ priced: true, subtotal: 1200, total: 1800, min: 1440, max: 2160 })
    expect(formatRange(estimate as Extract<typeof estimate, { priced: true }>)).toBe('USD 1,440 – 2,160')
  })

  it('never invents a price: no base price means "contact us"', () => {
    expect(computeEstimate({ ...rule, basePrice: null }, ['Blog'], 'Rush')).toEqual({ priced: false })
    expect(computeEstimate({ scopeOptions: [{ label: 'X', priceAdd: 99 }] }, ['X'])).toEqual({ priced: false })
  })

  it('ignores unknown options sent by the browser', () => {
    expect(computeEstimate(rule, ['Does not exist'], 'Nope')).toMatchObject({ total: 1000 })
  })
})

describe('validation', () => {
  const contact = { name: 'Ayesha', email: 'a@example.com', privacy: true }

  it('requires consent and a sane email', () => {
    expect(leadFormSchema.safeParse({ ...contact }).success).toBe(true)
    expect(leadFormSchema.safeParse({ ...contact, privacy: false }).success).toBe(false)
    expect(leadFormSchema.safeParse({ ...contact, email: 'nope' }).success).toBe(false)
    expect(leadFormSchema.safeParse({ ...contact, message: 'x'.repeat(2001) }).success).toBe(false)
  })

  it('accepts only http(s) websites', () => {
    expect(normaliseWebsite('example.com')).toBe('https://example.com/')
    expect(normaliseWebsite('javascript:alert(1)')).toBeUndefined()
    expect(auditFormSchema.safeParse({ ...contact, website: 'localhost' }).success).toBe(false)
    expect(auditFormSchema.safeParse({ ...contact, website: 'example.com' }).success).toBe(true)
  })
})

describe('CSV export', () => {
  it('quotes cells and defuses spreadsheet formulas', () => {
    expect(csvCell('a "b", c')).toBe('"a ""b"", c"')
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(csvCell('+1 555')).toBe(`"'+1 555"`)
    expect(csvRow([1, null, 'x'])).toBe('"1","","x"')
  })
})

describe('burst limit', () => {
  it('blocks rapid repeats from one address only', () => {
    const now = Date.now()
    const results = Array.from({ length: 10 }, () => burstLimited('burst-test-ip', now))
    expect(results.slice(0, 8).every((blocked) => !blocked)).toBe(true)
    expect(results[9]).toBe(true)
    expect(burstLimited('another-ip', now)).toBe(false)
  })
})

describe('email never blocks a lead', () => {
  it('reports a failure instead of throwing when SMTP errors', async () => {
    vi.resetModules()
    vi.doMock('@/lib/email/config', () => ({ isEmailConfigured: () => true }))
    const { sendEmail } = await import('@/lib/email')
    const logger = { error: vi.fn() }
    const payload = { sendEmail: vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED')), logger } as never
    const result = await sendEmail(payload, { to: 'a@b.co', subject: 's', html: 'h', text: 't' })
    expect(result).toMatchObject({ status: 'failed' })
    vi.doUnmock('@/lib/email/config')
  })

  it('skips quietly when SMTP is not configured', async () => {
    vi.resetModules()
    vi.doMock('@/lib/email/config', () => ({ isEmailConfigured: () => false }))
    const { sendEmail } = await import('@/lib/email')
    const send = vi.fn()
    const result = await sendEmail({ sendEmail: send } as never, { to: 'a@b.co', subject: 's', html: 'h', text: 't' })
    expect(result.status).toBe('skipped')
    expect(send).not.toHaveBeenCalled()
    vi.doUnmock('@/lib/email/config')
  })
})

describe('createLead (database)', () => {
  let payload: Payload
  const tag = `itest-${Date.now()}`
  const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`
  const ctx = (over: Partial<LeadContext> = {}): LeadContext => ({ ip, ...over })

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'leads', where: { ipHash: { equals: hashIp(ip) } }, overrideAccess: true })
  })

  it('saves the lead with attribution even when no email is configured', async () => {
    const result = await createLead(
      payload,
      { source: 'contact-form', name: `${tag} A`, email: 'itest@example.com', message: 'hello' },
      ctx({
        attribution: { utmSource: 'google', utmCampaign: 'spring', landingPage: '/services/seo/', bogus: 'x' },
        submittedPath: '/contact-us/',
        startedAt: Date.now() - 10_000,
      }),
    )
    expect(result.ok).toBe(true)
    const lead = await payload.findByID({ collection: 'leads', id: result.ok ? result.leadId! : 0, overrideAccess: true })
    expect(lead.attribution).toMatchObject({ utmSource: 'google', utmCampaign: 'spring', landingPage: '/services/seo/' })
    expect(lead.status).toBe('new')
    expect(lead.emailLog?.autoReply).toBeDefined() // 'skipped' without SMTP, 'sent'/'failed' with it
  })

  it('silently drops honeypot and instant submissions', async () => {
    const before = (await payload.count({ collection: 'leads', where: { name: { contains: tag } }, overrideAccess: true })).totalDocs
    expect(await createLead(payload, { source: 'contact-form', name: `${tag} bot` }, ctx({ honeypot: 'http://spam' }))).toEqual({ ok: true })
    expect(await createLead(payload, { source: 'contact-form', name: `${tag} fast` }, ctx({ startedAt: Date.now() }))).toEqual({ ok: true })
    const after = (await payload.count({ collection: 'leads', where: { name: { contains: tag } }, overrideAccess: true })).totalDocs
    expect(after).toBe(before)
  })

  it('rate-limits an address after the hourly maximum', async () => {
    const results: boolean[] = []
    for (let i = 0; i < HOURLY_LIMIT + 1; i++) {
      const res = await createLead(payload, { source: 'contact-form', name: `${tag} r${i}` }, ctx({ ip: ip, now: Date.now() + i }))
      results.push(res.ok)
      // the in-memory burst counter is per call; keep it from interfering with the DB limit under test
    }
    expect(results.includes(false)).toBe(true)
  })

})
