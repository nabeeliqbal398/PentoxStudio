import type { Metadata } from 'next'

import type { Faq, Media, Review } from '../payload-types'
import { env } from './env'
import { toImg } from './media'
import { absoluteUrl } from './paths'
import type { SiteInfo } from './site-data'

// The SEO plugin stores title/description/image plus our focus keyword, canonical override and
// noindex flag in a `meta` group on every page-like doc.
export type SeoMeta =
  | {
      title?: string | null
      description?: string | null
      image?: number | Media | null
      canonicalOverride?: string | null
      noindex?: boolean | null
    }
  | null
  | undefined

type MetadataInput = {
  meta?: SeoMeta
  /** Used when the doc has no SEO title. Gets the " | Pentox Studio" suffix. */
  title?: string
  description?: string | null
  path: string
  /** Forces noindex (thank-you page, draft preview). */
  noindex?: boolean
  fallbackImage?: Media | number | null
}

/** The first candidate long enough to work as a meta description (70+ characters), else the first non-empty one. */
export const pickDescription = (...candidates: (string | null | undefined)[]): string | undefined => {
  const list = candidates.map((value) => value?.trim()).filter((value): value is string => Boolean(value))
  return list.find((value) => value.length >= 70) ?? list[0]
}

export function buildMetadata({ meta, title, description, path, noindex, fallbackImage }: MetadataInput): Metadata {
  const metaTitle = meta?.title?.trim()
  const metaDescription = meta?.description?.trim() || description?.trim() || undefined
  const canonical = meta?.canonicalOverride?.trim() || path
  const image = toImg(meta?.image as Media | null | undefined, 'og') ?? toImg(fallbackImage as Media | null | undefined, 'og')
  const hidden = noindex || meta?.noindex === true

  return {
    // An SEO title is written in full by the editor, so the site suffix is not added again.
    title: metaTitle ? { absolute: metaTitle } : title,
    description: metaDescription,
    alternates: { canonical },
    robots: hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      siteName: 'Pentox Studio',
      title: metaTitle || title,
      description: metaDescription,
      url: canonical,
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary' },
  }
}

// ---------------------------------------------------------------------------
// JSON-LD (capture/07 §9). Only facts that exist in the CMS are emitted: no ratings,
// price ranges, geo points or opening hours unless real data is present.
// ---------------------------------------------------------------------------

const ORG_ID = `${env.NEXT_PUBLIC_SITE_URL}/#organization`

const compact = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)),
  ) as T

export function organizationJsonLd(site: SiteInfo) {
  const logo = site.logo?.url ? absoluteUrl(site.logo.url) : absoluteUrl('/brand/logo.webp')
  const address = site.address
  return compact({
    '@context': 'https://schema.org',
    // Organization + ProfessionalService (a LocalBusiness subtype) with the Lahore NAP.
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: site.businessName,
    url: env.NEXT_PUBLIC_SITE_URL,
    logo,
    image: logo,
    email: site.email?.address,
    telephone: site.phone?.display,
    address: address && (address.street || address.city)
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: address.street,
          addressLocality: address.city,
          addressRegion: address.region,
          postalCode: address.postalCode,
          addressCountry: address.country,
        })
      : undefined,
    sameAs: site.socials.map((social) => social.href),
  })
}

export const websiteJsonLd = (site: SiteInfo) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${env.NEXT_PUBLIC_SITE_URL}/#website`,
  name: site.businessName,
  url: env.NEXT_PUBLIC_SITE_URL,
  publisher: { '@id': ORG_ID },
})

export const serviceJsonLd = (service: { name: string; description?: string | null; path: string }) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description ?? undefined,
    url: absoluteUrl(service.path),
    provider: { '@id': ORG_ID },
  })

export const faqJsonLd = (faqs: Pick<Faq, 'question' | 'answer'>[]) =>
  faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : undefined

/** One Review per genuine, verified review entered in the CMS. */
export const reviewsJsonLd = (reviews: Review[]) =>
  reviews.map((review) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: review.authorName },
    reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    reviewBody: review.text ?? undefined,
    datePublished: review.reviewedAt ?? undefined,
    itemReviewed: { '@id': ORG_ID },
  }))

export const webPageJsonLd = (page: { name: string; path: string; description?: string | null; type?: string }) =>
  compact({
    '@context': 'https://schema.org',
    '@type': page.type ?? 'WebPage',
    name: page.name,
    description: page.description ?? undefined,
    url: absoluteUrl(page.path),
    isPartOf: { '@id': `${env.NEXT_PUBLIC_SITE_URL}/#website` },
  })

/** Case study as a CreativeWork made by Pentox. Only fields that exist in the CMS are emitted. */
export const creativeWorkJsonLd = (project: {
  name: string
  description?: string | null
  path: string
  image?: string
  completedAt?: string | null
  keywords?: string[]
  client?: string
  projectUrl?: string
}) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: project.description ?? undefined,
    url: absoluteUrl(project.path),
    image: project.image ? absoluteUrl(project.image) : undefined,
    dateCreated: project.completedAt ?? undefined,
    keywords: project.keywords?.join(', '),
    creator: { '@id': ORG_ID },
    ...(project.client ? { sourceOrganization: { '@type': 'Organization', name: project.client } } : {}),
    ...(project.projectUrl ? { sameAs: project.projectUrl } : {}),
  })

/** The portfolio listing as a CollectionPage with an ItemList of its projects. */
export const portfolioListJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Portfolio',
  url: absoluteUrl('/portfolio/'),
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(item.path),
      name: item.name,
    })),
  },
})

/** BlogPosting for a post page. Only fields that exist are emitted (no ratings, no invented word counts). */
export const blogPostingJsonLd = (post: {
  headline: string
  description?: string | null
  path: string
  image?: string
  published?: string | null
  modified?: string | null
  author?: { name: string; path: string }
  section?: string
  keywords?: string[]
}) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.headline.slice(0, 110),
    description: post.description ?? undefined,
    image: post.image ? absoluteUrl(post.image) : undefined,
    datePublished: post.published ?? undefined,
    dateModified: post.modified ?? post.published ?? undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(post.path) },
    url: absoluteUrl(post.path),
    articleSection: post.section,
    keywords: post.keywords?.join(', '),
    author: post.author
      ? { '@type': 'Person', name: post.author.name, url: absoluteUrl(post.author.path) }
      : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  })

/** Person schema for an author page. */
export const personJsonLd = (person: {
  name: string
  path: string
  jobTitle?: string | null
  description?: string | null
  image?: string
  sameAs?: string[]
  knowsAbout?: string[]
}) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url: absoluteUrl(person.path),
    jobTitle: person.jobTitle ?? undefined,
    description: person.description ?? undefined,
    image: person.image ? absoluteUrl(person.image) : undefined,
    sameAs: person.sameAs,
    knowsAbout: person.knowsAbout,
    worksFor: { '@id': ORG_ID },
  })
