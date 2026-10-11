import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../payload.config'
import { ensure, type Id, type SeedContext } from './helpers'
import { h, p, richText } from './lexical'

// DEV-ONLY demo content so the portfolio layouts can be seen before real case studies exist.
//   pnpm seed:demo          creates the demo items (idempotent)
//   pnpm seed:demo clean    removes everything this script created
// Everything is clearly fake: titles start with "DEMO –", projects are DRAFTS (never public, visible
// only through the admin preview), numbers are "+00%"-style placeholders, the client has no public
// permission and the testimonial is unverified. This file is NOT imported by `pnpm seed`.

const PREFIX = 'DEMO –'
const FILE_PREFIX = 'demo-seed-'

if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
  console.error('seed:demo is a development tool and refuses to run in production (pass --force to override).')
  process.exit(1)
}

async function placeholder(width: number, height: number, label: string, hue: number): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},55%,32%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},60%,52%)"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="46%" text-anchor="middle" font-family="Arial" font-size="${Math.round(width / 9)}" font-weight="700" fill="rgba(255,255,255,.9)">DEMO</text>
    <text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="${Math.round(width / 22)}" fill="rgba(255,255,255,.8)">${label}</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function ensureMedia(ctx: SeedContext, name: string, width: number, height: number, label: string, hue: number): Promise<Id> {
  const filename = `${FILE_PREFIX}${name}.png`
  const existing = await ctx.payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    ctx.skipped.push(`media: ${filename}`)
    return existing.docs[0].id
  }
  const data = await placeholder(width, height, label, hue)
  const doc = await ctx.payload.create({
    collection: 'media',
    data: { alt: `DEMO placeholder image (${label})` },
    file: { data, mimetype: 'image/png', name: filename, size: data.length },
    overrideAccess: true,
  })
  ctx.created.push(`media: ${filename}`)
  return doc.id
}

const demos = [
  {
    slug: 'demo-restaurant-website',
    title: `${PREFIX} Restaurant Website Redesign`,
    hue: 8,
    categories: ['web-development', 'branding'],
    services: ['web-development'],
    sortOrder: 10,
    summary: 'DEMO: placeholder text that shows how a case-study summary looks. Not a real project.',
    deliverables: ['Website design', 'Website development', 'Online menu'],
    results: [
      { value: '+00%', label: 'DEMO metric one' },
      { value: '000', label: 'DEMO metric two' },
      { value: '0.0x', label: 'DEMO metric three' },
    ],
    withTestimonial: true,
  },
  {
    slug: 'demo-local-seo-campaign',
    title: `${PREFIX} Local SEO Campaign`,
    hue: 200,
    categories: ['seo'],
    services: ['seo'],
    sortOrder: 20,
    summary: 'DEMO: a second placeholder case study, used to check the grid and the filter pills.',
    deliverables: ['Local SEO audit', 'Listing set-up', 'Monthly reporting'],
    results: [{ value: '+00%', label: 'DEMO metric one' }],
    withTestimonial: false,
  },
  {
    slug: 'demo-social-media-launch',
    title: `${PREFIX} Social Media Launch`,
    hue: 280,
    categories: ['social-media', 'branding'],
    services: ['social-media-marketing'],
    sortOrder: 30,
    summary: 'DEMO: a third placeholder case study, used to check the next-project card and the carousel.',
    deliverables: ['Content plan', 'Post design', 'Community management'],
    results: [],
    withTestimonial: false,
  },
]

async function ids(payload: Payload, collection: 'services' | 'portfolio-categories', slugs: string[]): Promise<Id[]> {
  if (!slugs.length) return []
  const { docs } = await payload.find({
    collection,
    where: { slug: { in: slugs } },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    draft: true,
  })
  return docs.map((doc) => doc.id)
}

async function create(ctx: SeedContext) {
  const { payload } = ctx

  // Portfolio categories normally come from `pnpm seed`; make sure the ones used here exist.
  const categoryTitles: Record<string, string> = {
    'web-development': 'Web Development',
    seo: 'SEO',
    branding: 'Branding',
    'social-media': 'Social Media',
  }
  for (const [slug, title] of Object.entries(categoryTitles)) {
    await ensure(ctx, 'portfolio-categories', { slug: { equals: slug } }, { title, slug, generateSlug: false }, { label: slug })
  }

  const logo = await ensureMedia(ctx, 'client-logo', 400, 200, 'client logo', 210)
  const client = await ensure(
    ctx,
    'clients',
    { name: { equals: `${PREFIX} Sample Client` } },
    { name: `${PREFIX} Sample Client`, logo, permissionConfirmed: false }, // not public
    { label: 'client' },
  )
  const testimonial = await ensure(
    ctx,
    'testimonials',
    { name: { equals: `${PREFIX} Sample Person` } },
    {
      name: `${PREFIX} Sample Person`,
      role: 'Owner',
      company: `${PREFIX} Sample Client`,
      quote: 'DEMO testimonial text. This is not a real client quote.',
      rating: 5,
      verified: false, // unverified: never shown publicly
    },
    { label: 'testimonial' },
  )

  for (const demo of demos) {
    const hero = await ensureMedia(ctx, `${demo.slug}-hero`, 1600, 900, 'hero image', demo.hue)
    const card = await ensureMedia(ctx, `${demo.slug}-card`, 800, 1200, 'portrait card', demo.hue)
    const gallery = await Promise.all(
      [1, 2, 3, 4].map((n) => ensureMedia(ctx, `${demo.slug}-gallery-${n}`, 1200, 900, `gallery image ${n}`, (demo.hue + n * 25) % 360)),
    )
    await ensure(
      ctx,
      'portfolio',
      { slug: { equals: demo.slug } },
      {
        title: demo.title,
        slug: demo.slug,
        generateSlug: false,
        client,
        services: await ids(payload, 'services', demo.services),
        categories: await ids(payload, 'portfolio-categories', demo.categories),
        featured: true,
        sortOrder: demo.sortOrder,
        summary: demo.summary,
        heroImage: hero,
        cardImage: card,
        deliverables: demo.deliverables.map((item) => ({ item })),
        challenge: richText([h('h3', 'DEMO challenge'), p('DEMO text describing the problem the client had. Replace with a real case study.')]),
        solution: richText([h('h3', 'DEMO solution'), p('DEMO text describing what was built. This is placeholder content only.')]),
        results: demo.results,
        gallery: gallery.map((image, index) => ({ image, caption: `DEMO caption ${index + 1}` })),
        testimonial: demo.withTestimonial ? testimonial : undefined,
        toolsUsed: [{ name: 'DEMO tool A' }, { name: 'DEMO tool B' }],
      },
      { draft: true, label: demo.slug },
    )
  }
}

async function clean(ctx: SeedContext) {
  const { payload } = ctx
  const removed = async (label: string, run: () => Promise<{ docs: unknown[] }>) =>
    ctx.created.push(`${label}: removed ${(await run()).docs.length}`)

  await removed('portfolio', () =>
    payload.delete({ collection: 'portfolio', where: { title: { like: PREFIX } }, overrideAccess: true, context: { disableRevalidate: true } }),
  )
  await removed('testimonials', () =>
    payload.delete({ collection: 'testimonials', where: { name: { like: PREFIX } }, overrideAccess: true }),
  )
  await removed('clients', () => payload.delete({ collection: 'clients', where: { name: { like: PREFIX } }, overrideAccess: true }))
  await removed('media', () =>
    payload.delete({ collection: 'media', where: { filename: { like: FILE_PREFIX } }, overrideAccess: true }),
  )
}

const payload = await getPayload({ config })
const ctx: SeedContext = { payload, created: [], skipped: [] }

try {
  if (process.argv.includes('clean')) await clean(ctx)
  else await create(ctx)
  payload.logger.info(`seed:demo finished: ${ctx.created.length} changed, ${ctx.skipped.length} already present.`)
  if (ctx.created.length) payload.logger.info(`Changed:\n  ${ctx.created.join('\n  ')}`)
  process.exit(0)
} catch (error) {
  payload.logger.error(error)
  process.exit(1)
}
