import { unstable_cache } from 'next/cache'
import { draftMode, headers } from 'next/headers'
import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type {
  Badge,
  Faq,
  Footer,
  Home,
  Industry,
  Package,
  Page,
  Portfolio,
  PortfolioCategory,
  Post,
  Review,
  Service,
  ServiceGroup,
  SiteText,
  Stat,
  Testimonial,
  User,
} from '../payload-types'
import { one, populated } from './media'

// Everything the public pages read. Published content only, cached and tagged to match the
// revalidation hooks (src/hooks/revalidate.ts: tag = collection slug, "global:<slug>" for globals);
// the hourly fallback covers scheduled publishing. Drafts are reachable only through getViewer()
// below, for a logged-in editor who opened the page from the admin Live Preview.

const REVALIDATE_SECONDS = 3600

function cached<Args extends unknown[], R>(key: string, tags: string[], fn: (...args: Args) => Promise<R>) {
  return unstable_cache(fn, [`content:${key}`], { tags, revalidate: REVALIDATE_SECONDS })
}

const published: Where = { _status: { equals: 'published' } }

// ---------------------------------------------------------------------------
// Draft preview
// ---------------------------------------------------------------------------

export type Viewer = { draft: boolean; user?: User }

/**
 * Draft mode is switched on by /next/preview/ for a logged-in admin user. It is checked again here
 * against the admin session, so a stray draft cookie without a session never reveals drafts.
 */
export async function getViewer(): Promise<Viewer> {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return { draft: false }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ? { draft: true, user: user as User } : { draft: false }
}

// ---------------------------------------------------------------------------
// Single documents (services, industries, pages)
// ---------------------------------------------------------------------------

type Docs = { services: Service; industries: Industry; pages: Page; portfolio: Portfolio }
type DocCollection = keyof Docs
type DocField = 'slug' | 'path'

const findPublished = {
  services: cached('doc:services', ['services'], (field: DocField, value: string) => findOne('services', field, value)),
  industries: cached('doc:industries', ['industries'], (field: DocField, value: string) =>
    findOne('industries', field, value),
  ),
  pages: cached('doc:pages', ['pages'], (field: DocField, value: string) => findOne('pages', field, value)),
  portfolio: cached('doc:portfolio', ['portfolio', 'testimonials', 'clients'], (field: DocField, value: string) =>
    findOne('portfolio', field, value),
  ),
}

async function findOne<C extends DocCollection>(
  collection: C,
  field: DocField,
  value: string,
  viewer?: Viewer,
): Promise<Docs[C] | null> {
  const payload = await getPayload({ config })
  const draft = viewer?.draft === true
  const { docs } = await payload.find({
    collection,
    where: draft
      ? { [field]: { equals: value } }
      : { and: [{ [field]: { equals: value } }, published] },
    draft,
    depth: 2,
    limit: 1,
    pagination: false,
    user: draft ? viewer?.user : undefined,
    // Access rules always apply: anonymous visitors only ever see published docs.
    overrideAccess: false,
  })
  return (docs[0] as unknown as Docs[C]) ?? null
}

async function getDoc<C extends DocCollection>(
  collection: C,
  field: DocField,
  value: string,
  viewer: Viewer,
): Promise<Docs[C] | null> {
  if (viewer.draft) return findOne(collection, field, value, viewer)
  return (await findPublished[collection](field, value)) as Docs[C] | null
}

export async function getPage(slug: string, viewer: Viewer): Promise<Page | null> {
  return getDoc('pages', 'slug', slug, viewer)
}

export async function getIndustry(slug: string, viewer: Viewer): Promise<Industry | null> {
  return getDoc('industries', 'slug', slug, viewer)
}

export async function getProject(slug: string, viewer: Viewer): Promise<Portfolio | null> {
  return getDoc('portfolio', 'slug', slug, viewer)
}

/** `path` is the public URL path, e.g. /services/seo/local-seo/. Sub-services need a visible parent. */
export async function getService(path: string, viewer: Viewer): Promise<Service | null> {
  const service = await getDoc('services', 'path', path, viewer)
  if (!service) return null
  // A sub-service of an unpublished parent must not be reachable either. For visitors the parent is
  // unreadable (still an id); in preview the editor can read it, so let it through.
  if (service.parent && !viewer.draft && !one(service.parent)) return null
  return service
}

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------

export const getHome = cached('home', ['global:home', 'portfolio', 'testimonials', 'faqs'], async (): Promise<Home> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'home', depth: 2, overrideAccess: false })
})

export const getStats = cached('stats', ['global:stats'], async (): Promise<Stat['items']> => {
  const payload = await getPayload({ config })
  const stats = await payload.findGlobal({ slug: 'stats', depth: 0, overrideAccess: false })
  return (stats.items ?? []) as Stat['items']
})

export const getSiteText = cached('site-text', ['global:site-text'], async (): Promise<SiteText> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-text', depth: 0, overrideAccess: false })
})

export const getCtaBand = cached('cta-band', ['global:footer'], async (): Promise<Footer['ctaBand']> => {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: false })
  return footer.ctaBand
})

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export type ServiceGroupWithServices = {
  group: ServiceGroup
  services: (Service & { children: Service[] })[]
}

/** Published services grouped for cards: top-level services with their published sub-services. */
export const getServiceGroups = cached(
  'service-groups',
  ['services', 'service-groups'],
  async (): Promise<ServiceGroupWithServices[]> => {
    const payload = await getPayload({ config })
    const [groups, services] = await Promise.all([
      payload.find({ collection: 'service-groups', depth: 0, pagination: false, sort: 'sortOrder', overrideAccess: false }),
      payload.find({
        collection: 'services',
        where: published,
        depth: 1,
        pagination: false,
        sort: 'sortOrder',
        overrideAccess: false,
      }),
    ])
    const topLevel = services.docs.filter((service) => !service.parent)
    return groups.docs.flatMap((group) => {
      const inGroup = topLevel
        .filter((service) => one(service.group)?.id === group.id || service.group === group.id)
        .map((service) => ({
          ...service,
          children: services.docs.filter((child) => one(child.parent)?.id === service.id || child.parent === service.id),
        }))
      return inGroup.length ? [{ group, services: inGroup }] : []
    })
  },
)

export const getPublishedIndustries = cached('industries', ['industries'], async (): Promise<Industry[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'industries',
    where: published,
    depth: 1,
    pagination: false,
    sort: 'sortOrder',
    overrideAccess: false,
  })
  return docs
})

/**
 * Every project for the portfolio page and the next-project card. Visitors get published projects only
 * (cached). An editor previewing from the admin also sees drafts, so unpublished work can be checked in context.
 */
const getPublishedProjectList = cached(
  'project-list',
  ['portfolio', 'portfolio-categories', 'services'],
  async (): Promise<Portfolio[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'portfolio',
      where: published,
      depth: 1,
      pagination: false,
      sort: 'sortOrder',
      overrideAccess: false,
    })
    return docs
  },
)

export async function getProjectList(viewer: Viewer): Promise<Portfolio[]> {
  if (!viewer.draft) return getPublishedProjectList()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'portfolio',
    draft: true,
    depth: 1,
    pagination: false,
    sort: 'sortOrder',
    user: viewer.user,
    overrideAccess: false,
  })
  return docs
}

export const getPortfolioCategories = cached(
  'portfolio-categories',
  ['portfolio-categories'],
  async (): Promise<PortfolioCategory[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'portfolio-categories',
      depth: 0,
      pagination: false,
      sort: 'sortOrder',
      overrideAccess: false,
    })
    return docs
  },
)

export type ProjectQuery = { featured?: boolean; serviceId?: number; industryId?: number; limit?: number }

export const getProjects = cached(
  'projects',
  ['portfolio'],
  async ({ featured, serviceId, industryId, limit = 6 }: ProjectQuery = {}): Promise<Portfolio[]> => {
    const payload = await getPayload({ config })
    const and: Where[] = [published]
    if (featured) and.push({ featured: { equals: true } })
    if (serviceId) and.push({ services: { in: [serviceId] } })
    if (industryId) and.push({ industries: { in: [industryId] } })
    const { docs } = await payload.find({
      collection: 'portfolio',
      where: { and },
      depth: 1,
      limit,
      pagination: false,
      sort: 'sortOrder',
      overrideAccess: false,
    })
    return docs
  },
)

export type FaqQuery = { serviceId?: number; industryId?: number; showOnHome?: boolean }

export const getFaqs = cached(
  'faqs',
  ['faqs'],
  async ({ serviceId, industryId, showOnHome }: FaqQuery): Promise<Faq[]> => {
    const payload = await getPayload({ config })
    const or: Where[] = []
    if (serviceId) or.push({ services: { in: [serviceId] } })
    if (industryId) or.push({ industries: { in: [industryId] } })
    if (showOnHome) or.push({ showOnHome: { equals: true } })
    if (!or.length) return []
    const { docs } = await payload.find({
      collection: 'faqs',
      where: { or },
      depth: 0,
      pagination: false,
      sort: 'sortOrder',
      overrideAccess: false,
    })
    return docs
  },
)

/** Posts in the blog category that mirrors a service, or flagged with it as their related service. */
export const getPostsForService = cached(
  'posts-for-service',
  ['posts', 'categories', 'services'],
  async (serviceId: number, limit: number): Promise<Post[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'posts',
      where: {
        and: [published, { or: [{ 'categories.service': { equals: serviceId } }, { relatedService: { equals: serviceId } }] }],
      },
      depth: 1,
      limit,
      pagination: false,
      sort: '-publishedAt',
      overrideAccess: false,
    })
    return docs
  },
)

export const getLatestPosts = cached('latest-posts', ['posts'], async (limit: number): Promise<Post[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: published,
    depth: 1,
    limit,
    pagination: false,
    sort: '-publishedAt',
    overrideAccess: false,
  })
  return docs
})

export const getPackagesForService = cached('packages', ['packages'], async (serviceId: number): Promise<Package[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'packages',
    where: { service: { equals: serviceId } },
    depth: 0,
    pagination: false,
    sort: 'sortOrder',
    overrideAccess: false, // only active packages are public
  })
  return docs
})

export const getSubServices = cached('sub-services', ['services'], async (parentId: number): Promise<Service[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'services',
    where: { and: [published, { parent: { equals: parentId } }] },
    depth: 0,
    pagination: false,
    sort: 'sortOrder',
    overrideAccess: false,
  })
  return docs
})

export const getClients = cached('clients', ['clients'], async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'clients',
    depth: 1,
    pagination: false,
    sort: 'sortOrder',
    overrideAccess: false, // only clients who gave permission
  })
  return docs.filter((client) => one(client.logo))
})

export const getVerifiedTestimonials = cached('testimonials', ['testimonials'], async (): Promise<Testimonial[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'testimonials',
    depth: 1,
    pagination: false,
    sort: 'sortOrder',
    overrideAccess: false, // verified only
  })
  return docs
})

export const getVerifiedReviews = cached('reviews', ['reviews'], async (): Promise<Review[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'reviews', depth: 0, pagination: false, overrideAccess: false })
  return docs
})

export const getActiveBadges = cached('badges', ['badges'], async (): Promise<Badge[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'badges',
    depth: 1,
    pagination: false,
    sort: 'sortOrder',
    overrideAccess: false,
  })
  return docs
})

export { one, populated }
