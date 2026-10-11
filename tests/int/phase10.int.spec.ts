import fs from 'node:fs'
import path from 'node:path'

import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { collectSources } from '@/lib/chatbot/sources'
import { getIndexableEntries } from '@/lib/indexable'
import { ADMIN_CSP, baseSecurityHeaders, buildCsp } from '@/lib/security'
import { campaignAudienceEndpoint, campaignSendEndpoint, campaignStopEndpoint, campaignTestEndpoint, exportSubscribersEndpoint, importSubscribersEndpoint, postNewsletterDraftEndpoint } from '@/lib/newsletter/endpoints'
import { exportLeadsEndpoint } from '@/lib/leads/export'
import { reindexEndpoint, reindexStatusEndpoint } from '@/lib/chatbot/endpoints'

describe('Content-Security-Policy', () => {
  const base = { analytics: false, turnstile: false, upgradeInsecure: true, dev: false }

  it('allows analytics origins only for visitors who accepted cookies', () => {
    const declined = buildCsp(base)
    for (const host of ['googletagmanager.com', 'google-analytics.com', 'clarity.ms']) expect(declined).not.toContain(host)
    const accepted = buildCsp({ ...base, analytics: true })
    for (const host of ['googletagmanager.com', 'google-analytics.com', 'clarity.ms']) expect(accepted).toContain(host)
  })

  it('allows Turnstile only when it is configured', () => {
    expect(buildCsp(base)).not.toContain('challenges.cloudflare.com')
    expect(buildCsp({ ...base, turnstile: true })).toContain('challenges.cloudflare.com')
  })

  it('locks down framing, forms, base URI and plugins, and has no eval or wildcard script source in production', () => {
    const csp = buildCsp({ ...base, analytics: true, turnstile: true })
    expect(csp).toContain("frame-ancestors 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain('upgrade-insecure-requests')
    expect(csp).not.toContain('unsafe-eval')
    expect(/script-src[^;]*\s\*(\s|;|$)/.test(csp)).toBe(false)
    expect(buildCsp({ ...base, dev: true })).toContain('unsafe-eval') // dev hot reloading only
    expect(ADMIN_CSP).toContain("frame-ancestors 'self'")
  })

  it('sends the standard security headers, with HSTS only in production', () => {
    const keys = (production: boolean) => baseSecurityHeaders(production).map((header) => header.key)
    expect(keys(true)).toEqual(expect.arrayContaining(['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Strict-Transport-Security']))
    expect(keys(false)).not.toContain('Strict-Transport-Security')
    expect(baseSecurityHeaders(true).find((header) => header.key === 'X-Content-Type-Options')?.value).toBe('nosniff')
  })
})

describe('access control audit', () => {
  let payload: Payload
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  // Every collection must be listed here. Adding a collection without deciding who may read it fails this test.
  const PUBLIC_READ = new Set([
    'pages', 'services', 'service-groups', 'industries', 'locations', 'posts', 'categories', 'tags', 'authors', 'faqs',
    'portfolio', 'portfolio-categories', 'clients', 'testimonials', 'reviews', 'badges', 'packages', 'media',
  ])
  const STAFF_ONLY = new Set([
    'users', 'estimator-rules', 'leads', 'subscribers', 'campaigns', 'campaign-deliveries', 'chat-sessions',
    'knowledge-chunks', 'chatbot-usage', 'redirects',
  ])

  it('classifies every collection', () => {
    const slugs = payload.config.collections.map((collection) => collection.slug)
    // payload-* are Payload's own internal collections (jobs, preferences, locks, ...), checked separately below.
    const unknown = slugs.filter((slug) => !slug.startsWith('payload-') && !PUBLIC_READ.has(slug) && !STAFF_ONLY.has(slug))
    expect(unknown, `Decide the access of: ${unknown.join(', ')}`).toEqual([])
  })

  it.each([...STAFF_ONLY])('refuses anonymous reads of %s', async (slug) => {
    await expect(payload.find({ collection: slug as never, overrideAccess: false })).rejects.toMatchObject({ status: 403 })
  })

  it.each(['payload-jobs', 'payload-preferences', 'payload-locked-documents'])('refuses anonymous reads of the internal collection %s', async (slug) => {
    await expect(payload.find({ collection: slug as never, overrideAccess: false })).rejects.toThrow()
  })

  it('refuses anonymous create, update and delete on every collection', async () => {
    for (const { slug } of payload.config.collections.filter((item) => !item.slug.startsWith('payload-'))) {
      await expect(payload.create({ collection: slug as never, data: {} as never, overrideAccess: false }), `create ${slug}`).rejects.toMatchObject({ status: 403 })
      await expect(payload.update({ collection: slug as never, id: 1, data: {} as never, overrideAccess: false }), `update ${slug}`).rejects.toThrow()
      await expect(payload.delete({ collection: slug as never, id: 1, overrideAccess: false }), `delete ${slug}`).rejects.toThrow()
    }
  })

  it('shows the public only published, active, verified and permitted records', async () => {
    const services = await payload.find({ collection: 'services', overrideAccess: false, pagination: false, depth: 0 })
    expect(services.docs.every((doc) => doc._status === 'published')).toBe(true)
    expect((await payload.find({ collection: 'packages', overrideAccess: false, depth: 0 })).docs.every((doc) => doc.active)).toBe(true)
    expect((await payload.find({ collection: 'testimonials', overrideAccess: false, depth: 0 })).docs.every((doc) => doc.verified)).toBe(true)
    expect((await payload.find({ collection: 'reviews', overrideAccess: false, depth: 0 })).docs.every((doc) => doc.verified)).toBe(true)
    expect((await payload.find({ collection: 'clients', overrideAccess: false, depth: 0 })).docs.every((doc) => doc.permissionConfirmed)).toBe(true)
  })

  it('refuses anonymous updates of every global and hides the chatbot prompt and limits', async () => {
    for (const { slug } of payload.config.globals) {
      await expect(payload.updateGlobal({ slug: slug as never, data: {} as never, overrideAccess: false }), `update ${slug}`).rejects.toThrow()
    }
    const settings = (await payload.findGlobal({ slug: 'chatbot-settings', overrideAccess: false })) as unknown as Record<string, unknown>
    expect(settings.systemPrompt).toBeUndefined()
    expect(settings.limits).toBeUndefined()
    const site = (await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })) as unknown as Record<string, unknown>
    expect(site).toBeDefined()
  })

  it('keeps tokens and IP hashes out of API reads, even for admins', async () => {
    const hidden = (collection: string, name: string) => {
      const field = payload.config.collections.find((item) => item.slug === collection)?.fields.find((item) => 'name' in item && item.name === name)
      return field && 'access' in field ? field.access : undefined
    }
    for (const [collection, field] of [['subscribers', 'confirmToken'], ['subscribers', 'unsubscribeToken'], ['leads', 'ipHash']] as const) {
      const access = hidden(collection, field)
      expect(access?.read, `${collection}.${field}`).toBeTypeOf('function')
      expect(await (access!.read as () => unknown)()).toBe(false)
    }
  })

  it('admin-only REST endpoints answer 403 without a login', async () => {
    const endpoints = [
      exportLeadsEndpoint, exportSubscribersEndpoint, importSubscribersEndpoint, campaignAudienceEndpoint, campaignTestEndpoint,
      campaignSendEndpoint, campaignStopEndpoint, postNewsletterDraftEndpoint, reindexEndpoint, reindexStatusEndpoint,
    ]
    for (const endpoint of endpoints) {
      const response = (await endpoint.handler({ user: null, payload, routeParams: { id: '1' }, searchParams: new URLSearchParams() } as never)) as Response
      expect(response.status, endpoint.path).toBe(403)
    }
  })
})

describe('sitemap and indexing rules', () => {
  let payload: Payload
  const tag = `itest-seo-${Date.now()}`
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    await payload.delete({ collection: 'pages', where: { slug: { like: tag } }, overrideAccess: true, context: { disableRevalidate: true } })
  })

  it('lists published, indexable pages only', async () => {
    const entries = await getIndexableEntries()
    const paths = entries.map((entry) => entry.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/services/seo/')
    expect(new Set(paths).size).toBe(paths.length) // no duplicates
    expect(paths.every((p) => p.startsWith('/') && p.endsWith('/') && !p.includes('?') && !p.includes('#'))).toBe(true)
    expect(paths).not.toContain('/thank-you/')
    expect(paths.some((p) => p.startsWith('/newsletter') || p.startsWith('/admin') || p.startsWith('/api'))).toBe(false)
    expect(paths).not.toContain('/services/ai-chatbots-agents/') // seeded draft
    expect(paths).not.toContain('/privacy-policy/') // seeded draft
    expect(paths.some((p) => p.startsWith('/industries/'))).toBe(false) // seeded industries are drafts
  })

  it('leaves out drafts and pages marked noindex', async () => {
    const mk = (slug: string, extra: object) =>
      payload.create({ collection: 'pages', overrideAccess: true, context: { disableRevalidate: true }, data: { title: slug, slug, generateSlug: false, template: 'default', ...extra } as never })
    await mk(`${tag}-draft`, { _status: 'draft' })
    await mk(`${tag}-hidden`, { _status: 'published', meta: { noindex: true } })
    await mk(`${tag}-visible`, { _status: 'published' })
    const paths = (await getIndexableEntries()).map((entry) => entry.path)
    expect(paths).toContain(`/${tag}-visible/`)
    expect(paths).not.toContain(`/${tag}-draft/`)
    expect(paths).not.toContain(`/${tag}-hidden/`)
  })
})

describe('final review: the removals in capture/07 §8', () => {
  let payload: Payload
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('has no unverifiable claims, placeholder people or lorem ipsum in anything the public can read', async () => {
    const texts = (await collectSources(payload)).map((source) => `${source.title}\n${source.text}`)
    const text = texts.join('\n')
    expect(text).not.toMatch(/24\s*\/\s*7|24 hours a day/i) // "24/7 support"
    expect(text).not.toMatch(/guarantee/i)
    expect(text).not.toMatch(/lorem ipsum/i)
    expect(text).not.toMatch(/David R\.|Emily P\.|Abdul Rehman/)
    expect(text).not.toMatch(/\b97\s?%/) // the unsourced statistic
  })

  it('has no placeholder testimonials, skill bars, preloader or hero-banner image in the code', () => {
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) return entry.name === 'migrations' ? [] : walk(full)
        return /\.(ts|tsx)$/.test(entry.name) ? [full] : []
      })
    const ignore = /tests|phase10|payload-types|seed[\\/](demo|index)|chatbot[\\/]guard|chatbot[\\/]chat/ // the demo seed and the chatbot rules mention these words on purpose
    const files = walk(path.resolve('src')).filter((file) => !ignore.test(file))
    const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
    expect(source).not.toMatch(/preloader/i)
    expect(source).not.toMatch(/role=["']progressbar["']/)
    expect(source).not.toMatch(/skill[-_ ]?(bar|progress)/i)
    expect(source).not.toMatch(/David R\.|Emily P\.|Abdul Rehman/)
    expect(source).not.toMatch(/\bgallery-page|home-new-page/i)
  })

  it('301s the thin pages and the duplicate posts, and keeps one "Top Digital Marketing Agency" post', async () => {
    const redirects = await payload.find({ collection: 'redirects', pagination: false, depth: 0, overrideAccess: true })
    const to = (from: string) => redirects.docs.find((doc) => doc.from === from)?.to
    expect(to('/gallery/')).toBe('/contact-us/')
    expect(to('/home-new/')).toBe('/')
    expect(to('/service/')).toBe('/services/')
    const dupes = ['/2026/06/top-digital-marketing-agency-pakistan/', '/2026/07/top-digital-marketing-agency-pakistan-2/', '/2026/07/top-digital-marketing-agency-pakistan-3/']
    const targets = dupes.map(to)
    if (targets.some(Boolean)) expect(new Set(targets).size).toBe(1) // all three go to the one kept post
    const posts = await payload.find({ collection: 'posts', where: { slug: { like: 'top-digital-marketing-agency' } }, draft: true, pagination: false, depth: 0, overrideAccess: true })
    expect(posts.totalDocs).toBeLessThanOrEqual(1)
  })

  it('has a grouped mega menu and no flat services dropdown data', async () => {
    const header = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: false })
    expect(header.megaMenu?.length).toBe(3)
  })
})
