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
