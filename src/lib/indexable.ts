import { getPayload } from 'payload'

import config from '@payload-config'

import { absoluteUrl } from './paths'

// The list of public, indexable URLs. It feeds sitemap.xml and llms.txt, so both always agree. Everything is
// read with the PUBLIC access rules (overrideAccess: false, no user): drafts, scheduled-but-unpublished and
// admin-only content can never appear. Excluded on purpose: the thank-you page, the newsletter pages, pages with
// "noindex" ticked in their SEO tab, and every search / filtered / paginated URL (those are never listed).

export type IndexableEntry = {
  path: string
  type: 'home' | 'hub' | 'page' | 'service' | 'industry' | 'portfolio' | 'post' | 'category' | 'author'
  title: string
  description?: string
  lastModified?: string
}

type Meta = { noindex?: boolean | null } | null | undefined
const visible = (doc: { meta?: Meta }) => doc.meta?.noindex !== true

// Page docs that hold the copy of a hub route (e.g. slug "services" = the /services/ page).
const HUB_SLUGS = new Set(['services', 'industries', 'portfolio', 'blog'])
const HUBS: { path: string; slug: string; title: string }[] = [
  { path: '/services/', slug: 'services', title: 'Services' },
  { path: '/industries/', slug: 'industries', title: 'Industries' },
  { path: '/portfolio/', slug: 'portfolio', title: 'Portfolio' },
  { path: '/blog/', slug: 'blog', title: 'Blog' },
]

export async function getIndexableEntries(): Promise<IndexableEntry[]> {
  const payload = await getPayload({ config })
  const open = { depth: 1, pagination: false as const, overrideAccess: false as const }
  const out: IndexableEntry[] = []

  const [home, pages, services, industries, projects, posts, categories, authors] = await Promise.all([
    payload.findGlobal({ slug: 'home', depth: 0, overrideAccess: false }),
    payload.find({ collection: 'pages', ...open, depth: 0 }),
    payload.find({ collection: 'services', ...open, sort: 'sortOrder' }),
    payload.find({ collection: 'industries', ...open, sort: 'sortOrder' }),
    payload.find({ collection: 'portfolio', ...open, depth: 0, sort: 'sortOrder' }),
    payload.find({ collection: 'posts', ...open, depth: 0, sort: '-publishedAt' }),
    payload.find({ collection: 'categories', ...open, depth: 0, sort: 'sortOrder' }),
    payload.find({ collection: 'authors', ...open, depth: 0 }),
  ])

  if (visible(home)) {
    out.push({ path: '/', type: 'home', title: 'Home', description: home.hero?.subheadline ?? undefined, lastModified: home.updatedAt ?? undefined })
  }

  const hubPage = (slug: string) => pages.docs.find((page) => page.slug === slug)
  for (const hub of HUBS) {
    const page = hubPage(hub.slug)
    if (page && !visible(page)) continue
    // The portfolio and industries hubs are only worth indexing once they have something to list.
    if (hub.slug === 'portfolio' && !projects.docs.length) continue
    if (hub.slug === 'industries' && !industries.docs.length) continue
    if (hub.slug === 'blog' && !posts.docs.length) continue
    out.push({
      path: hub.path,
      type: 'hub',
      title: page?.hero?.heading || page?.title || hub.title,
      description: page?.excerpt || page?.hero?.intro || undefined,
      lastModified: page?.updatedAt,
    })
  }

  for (const page of pages.docs) {
    if (!page.slug || HUB_SLUGS.has(page.slug) || page.template === 'thank-you' || !visible(page)) continue
    out.push({
      path: `/${page.slug}/`,
      type: 'page',
      title: page.hero?.heading || page.title,
      description: page.excerpt || page.hero?.intro || undefined,
      lastModified: page.updatedAt,
    })
  }

  for (const service of services.docs) {
    if (!visible(service)) continue
    // A sub-service whose parent is not public is not reachable (the page 404s), so it is not listed.
    if (service.parent && typeof service.parent !== 'object') continue
    out.push({
      path: service.path || `/services/${service.slug}/`,
      type: 'service',
      title: service.hero?.heading || service.title,
      description: service.shortDescription,
      lastModified: service.updatedAt,
    })
  }

  for (const industry of industries.docs) {
    if (!visible(industry)) continue
    out.push({ path: `/industries/${industry.slug}/`, type: 'industry', title: industry.title, description: industry.summary, lastModified: industry.updatedAt })
  }

  for (const project of projects.docs) {
    if (!visible(project)) continue
    out.push({ path: `/portfolio/${project.slug}/`, type: 'portfolio', title: project.title, description: project.summary, lastModified: project.updatedAt })
  }

  const usedCategories = new Set<number>()
  const usedAuthors = new Set<number>()
  for (const post of posts.docs) {
    if (!visible(post)) continue
    out.push({ path: `/blog/${post.slug}/`, type: 'post', title: post.title, description: post.excerpt ?? undefined, lastModified: post.updatedAt })
    for (const category of post.categories ?? []) usedCategories.add(typeof category === 'object' ? category.id : category)
    if (post.author) usedAuthors.add(typeof post.author === 'object' ? post.author.id : post.author)
  }

  // Category and author pages are listed only when they have at least one published post.
  for (const category of categories.docs) {
    if (usedCategories.has(category.id) && visible(category)) {
      out.push({ path: `/blog/category/${category.slug}/`, type: 'category', title: category.title, description: category.description ?? undefined, lastModified: category.updatedAt })
    }
  }
  for (const author of authors.docs) {
    if (usedAuthors.has(author.id) && visible(author)) {
      out.push({ path: `/blog/author/${author.slug}/`, type: 'author', title: author.name, description: author.bio ?? undefined, lastModified: author.updatedAt })
    }
  }

  // One entry per URL.
  const seen = new Set<string>()
  return out.filter((entry) => (seen.has(entry.path) ? false : (seen.add(entry.path), true)))
}

export const entryUrl = (entry: IndexableEntry) => absoluteUrl(entry.path) ?? entry.path
