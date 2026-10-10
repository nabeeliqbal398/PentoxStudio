import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { readingTimeMinutes } from '@/hooks/readingTime'
import { p, richText } from '@/seed/lexical'

let payload: Payload
const suffix = Date.now()
const createdUsers: (number | string)[] = []
const createdPosts: (number | string)[] = []

// Public (anonymous) reads/writes go through the same access rules as the REST API.
const anon = { overrideAccess: false } as const

describe('public access rules', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('shows published services but hides drafts', async () => {
    const { docs } = await payload.find({ collection: 'services', limit: 100, ...anon })
    const slugs = docs.map((doc) => doc.slug)
    expect(slugs).toContain('seo')
    expect(slugs).not.toContain('ai-chatbots-agents')
  })

  it('hides inactive (unpriced) packages and industries still in draft', async () => {
    const packages = await payload.find({ collection: 'packages', ...anon })
    expect(packages.totalDocs).toBe(0)
    const industries = await payload.find({ collection: 'industries', ...anon })
    expect(industries.totalDocs).toBe(0)
  })

  it.each(['leads', 'subscribers', 'campaigns', 'chat-sessions', 'knowledge-chunks', 'redirects', 'estimator-rules'] as const)(
    'refuses anonymous reads of %s',
    async (collection) => {
      await expect(payload.find({ collection, ...anon })).rejects.toThrow()
    },
  )

  it('refuses anonymous creation of leads and subscribers', async () => {
    await expect(
      payload.create({
        collection: 'leads',
        data: { name: 'x', source: 'manual', status: 'new' },
        ...anon,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'subscribers',
        data: { email: 'x@example.com', status: 'pending' },
        ...anon,
      }),
    ).rejects.toThrow()
  })

  it('does not expose the chatbot system prompt publicly', async () => {
    const settings = await payload.findGlobal({ slug: 'chatbot-settings', ...anon })
    expect(settings.systemPrompt).toBeUndefined()
  })
})

describe('posts', () => {
  afterAll(async () => {
    for (const id of createdPosts) await payload.delete({ collection: 'posts', id })
    for (const id of createdUsers) await payload.delete({ collection: 'users', id })
  })

  it('saves an author’s attempt to publish as a draft, and computes reading time', async () => {
    // The first user ever created is promoted to admin, so make sure an admin exists first.
    const admin = await payload.create({
      collection: 'users',
      data: { email: `admin-${suffix}@example.com`, password: 'Test-pass-123!', roles: ['admin'] },
    })
    const author = await payload.create({
      collection: 'users',
      data: { email: `author-${suffix}@example.com`, password: 'Test-pass-123!', roles: ['author'] },
    })
    createdUsers.push(admin.id, author.id)

    const post = await payload.create({
      collection: 'posts',
      user: { ...author, collection: 'users' },
      overrideAccess: false,
      data: {
        title: `Access test ${suffix}`,
        slug: `access-test-${suffix}`,
        content: richText([p(Array.from({ length: 450 }, () => 'word').join(' '))]),
        _status: 'published',
      },
    })
    createdPosts.push(post.id)

    expect(post._status).toBe('draft')
    expect(post.readingTime).toBe(3)
    expect(typeof post.createdBy === 'object' ? post.createdBy?.id : post.createdBy).toBe(author.id)
  })
})

describe('readingTimeMinutes', () => {
  it('is at least one minute and rounds up at 200 words per minute', () => {
    expect(readingTimeMinutes(richText([p('short')]))).toBe(1)
    expect(readingTimeMinutes(richText([p(Array(201).fill('w').join(' '))]))).toBe(2)
    expect(readingTimeMinutes(undefined)).toBe(1)
  })
})
