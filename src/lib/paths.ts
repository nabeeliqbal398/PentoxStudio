import { env } from './env'

type Doc = { slug?: string | null; path?: string | null } | null | undefined

// Public URL path for each routable collection (see capture/07-LOCKED-SCOPE.md §4).
export const collectionPaths: Record<string, (doc: Doc) => string | undefined> = {
  pages: (doc) => (doc?.slug ? `/${doc.slug}/` : undefined),
  services: (doc) => doc?.path ?? (doc?.slug ? `/services/${doc.slug}/` : undefined),
  industries: (doc) => (doc?.slug ? `/industries/${doc.slug}/` : undefined),
  locations: (doc) => (doc?.slug ? `/locations/${doc.slug}/` : undefined),
  posts: (doc) => (doc?.slug ? `/blog/${doc.slug}/` : undefined),
  portfolio: (doc) => (doc?.slug ? `/portfolio/${doc.slug}/` : undefined),
  categories: (doc) => (doc?.slug ? `/blog/category/${doc.slug}/` : undefined),
  authors: (doc) => (doc?.slug ? `/blog/author/${doc.slug}/` : undefined),
}

// Listing pages that show a collection's docs, revalidated together with the doc itself.
export const listingPaths: Record<string, string[]> = {
  services: ['/', '/services/'],
  industries: ['/', '/industries/'],
  posts: ['/', '/blog/'],
  portfolio: ['/', '/portfolio/'],
  categories: ['/blog/'],
  authors: ['/blog/'],
  faqs: ['/'],
  packages: ['/pricing/'],
  clients: ['/'],
  testimonials: ['/'],
  reviews: ['/'],
  badges: ['/'],
}

export const absoluteUrl = (path?: string | null): string | undefined =>
  path ? new URL(path, env.NEXT_PUBLIC_SITE_URL).toString() : undefined

/**
 * Preview URL for a site path. It goes through /next/preview/, which checks the editor's admin
 * session, switches on Next.js draft mode and redirects to the page.
 */
export const previewPathUrl = (path: string): string =>
  `${env.NEXT_PUBLIC_SITE_URL}/next/preview/?${new URLSearchParams({ path })}`

/** Live-preview iframe URL for a doc. Falls back to the site root when the slug is not set yet. */
export const previewUrl = (collection: string, doc: Doc): string =>
  previewPathUrl(collectionPaths[collection]?.(doc) ?? '/')
