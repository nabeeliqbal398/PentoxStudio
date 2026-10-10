import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { Media } from '../payload-types'
import { env } from './env'
import { safeLink, type SafeLink } from './links'

// Everything the site chrome (header, footer, menus, floating buttons) shows comes from here,
// which reads the Header / Footer / Site settings globals and the *published* services.
// Results are cached and tagged to match the revalidation hooks in src/hooks/revalidate.ts;
// the time-based fallback covers changes made outside a request (e.g. scheduled publishing).

const REVALIDATE_SECONDS = 3600

export type ImageInfo = { url: string; alt: string; width: number; height: number }

export type NavLink = SafeLink & { label: string; newTab: boolean }

export type ServiceLink = { id: number | string; title: string; href: string; description?: string; isChild: boolean }

export type MenuGroup = { label: string; items: ServiceLink[] }

export type SocialLink = { platform: string; label: string; href: string }

export type SiteInfo = {
  businessName: string
  phone?: { display: string; href: string }
  whatsapp?: { number: string; href: string }
  email?: { address: string; href: string }
  addressLines: string[]
  hours: string[]
  responseTime?: string
  socials: SocialLink[]
  logo?: ImageInfo
  logoWhite?: ImageInfo
  analytics: { ga4Id?: string; gtmId?: string; clarityId?: string }
}

export type HeaderInfo = {
  showTopBar: boolean
  groups: MenuGroup[]
  links: NavLink[]
  cta?: { label: string; link: SafeLink }
}

export type FooterInfo = {
  brandHeading?: string
  brandStatement?: string
  serviceGroups: MenuGroup[]
  industries: { id: number | string; title: string; href: string }[]
  columns: { title: string; links: NavLink[] }[]
  legalLinks: NavLink[]
  copyrightText?: string
}

const text = (value: string | null | undefined): string | undefined => value?.trim() || undefined

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  x: 'X',
  tiktok: 'TikTok',
}

// IDs are interpolated into inline analytics snippets, so accept only their documented shapes.
const analyticsId = (value: string | null | undefined, pattern: RegExp): string | undefined => {
  const id = text(value)
  return id && pattern.test(id) ? id : undefined
}

function toImage(media: number | Media | null | undefined): ImageInfo | undefined {
  if (!media || typeof media !== 'object' || !media.url || !media.width || !media.height) return undefined
  return { url: media.url, alt: media.alt, width: media.width, height: media.height }
}

function toNavLink(item: { label: string; url: string; openInNewTab?: boolean | null }): NavLink | undefined {
  const link = safeLink(item.url)
  const label = text(item.label)
  return link && label ? { ...link, label, newTab: Boolean(item.openInNewTab) } : undefined
}

type PublishedService = {
  id: number | string
  title: string
  href: string
  description?: string
  groupId?: number | string
  parentId?: number | string
  sortOrder: number
}

const idOf = (value: number | string | { id: number | string } | null | undefined) =>
  value && typeof value === 'object' ? value.id : (value ?? undefined)

/**
 * Published services only. Access control (`publishedOrStaff`) plus the explicit `_status` filter
 * mean drafts can never reach the menus. Sub-services of an unpublished parent are dropped too,
 * so a link never points below a page that returns 404.
 */
const loadPublishedServices = unstable_cache(
  async (): Promise<PublishedService[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      depth: 0,
      pagination: false,
      sort: 'sortOrder',
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        path: true,
        shortDescription: true,
        group: true,
        parent: true,
        sortOrder: true,
      },
    })

    const topLevel = new Set(docs.filter((doc) => !doc.parent).map((doc) => doc.id))
    return docs
      .filter((doc) => !doc.parent || topLevel.has(idOf(doc.parent) as number))
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        href: doc.path || `/services/${doc.slug}/`,
        description: text(doc.shortDescription),
        groupId: idOf(doc.group),
        parentId: idOf(doc.parent),
        sortOrder: doc.sortOrder ?? 0,
      }))
  },
  ['chrome:published-services'],
  { tags: ['services'], revalidate: REVALIDATE_SECONDS },
)

const toServiceLink = (service: PublishedService): ServiceLink => ({
  id: service.id,
  title: service.title,
  href: service.href,
  description: service.description,
  isChild: service.parentId !== undefined,
})

export const getSiteInfo = unstable_cache(
  async (): Promise<SiteInfo> => {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: false })

    const phoneDisplay = text(settings.phone)
    const phoneDigits = phoneDisplay?.replace(/[^\d+]/g, '')
    const whatsappNumber = text(settings.whatsappNumber ?? env.WHATSAPP_NUMBER)
    const email = text(settings.email)
    const address = settings.address
    const city = [text(address?.city), text(address?.region)].filter(Boolean).join(', ')

    return {
      businessName: settings.businessName,
      phone: phoneDisplay && phoneDigits ? { display: phoneDisplay, href: `tel:${phoneDigits}` } : undefined,
      whatsapp: whatsappNumber
        ? { number: whatsappNumber, href: `https://wa.me/${whatsappNumber}` }
        : undefined,
      email: email ? { address: email, href: `mailto:${email}` } : undefined,
      addressLines: [text(address?.street), [city, text(address?.postalCode)].filter(Boolean).join(' '), text(address?.country)]
        .filter((line): line is string => Boolean(line)),
      hours: (settings.hours ?? []).map((row) => `${row.days} ${row.opens}–${row.closes}`),
      responseTime: text(settings.responseTime),
      socials: (settings.socials ?? []).flatMap((social) => {
        const link = safeLink(social.url)
        return link?.kind === 'external'
          ? [{ platform: social.platform, label: SOCIAL_LABELS[social.platform] ?? social.platform, href: link.href }]
          : []
      }),
      logo: toImage(settings.logo),
      logoWhite: toImage(settings.logoWhite),
      analytics: {
        ga4Id: analyticsId(settings.analytics?.ga4Id ?? env.NEXT_PUBLIC_GA_ID, /^G-[A-Z0-9]{4,}$/i),
        gtmId: analyticsId(settings.analytics?.gtmId ?? env.NEXT_PUBLIC_GTM_ID, /^GTM-[A-Z0-9]{4,}$/i),
        clarityId: analyticsId(settings.analytics?.clarityId ?? env.NEXT_PUBLIC_CLARITY_ID, /^[a-z0-9]{4,}$/i),
      },
    }
  },
  ['chrome:site-info'],
  { tags: ['global:site-settings'], revalidate: REVALIDATE_SECONDS },
)

export const getHeaderInfo = unstable_cache(
  async (): Promise<HeaderInfo> => {
    const payload = await getPayload({ config })
    const [header, services] = await Promise.all([
      payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: false }),
      loadPublishedServices(),
    ])
    const byId = new Map(services.map((service) => [service.id, service]))

    const groups = (header.megaMenu ?? []).flatMap((group): MenuGroup[] => {
      const items = (group.items ?? []).flatMap((item): ServiceLink[] => {
        const service = byId.get(idOf(item.service) as number)
        if (!service) return [] // draft, deleted or orphaned: never linked
        const link = toServiceLink(service)
        return [{ ...link, title: text(item.labelOverride) ?? link.title }]
      })
      const label = text(group.label)
      return items.length && label ? [{ label, items }] : []
    })

    const ctaLabel = text(header.cta?.label)
    const ctaLink = safeLink(header.cta?.url)

    return {
      showTopBar: header.showTopBar !== false,
      groups,
      links: (header.navLinks ?? []).flatMap((item) => toNavLink(item) ?? []),
      cta: ctaLabel && ctaLink ? { label: ctaLabel, link: ctaLink } : undefined,
    }
  },
  ['chrome:header'],
  { tags: ['global:header', 'services', 'service-groups'], revalidate: REVALIDATE_SECONDS },
)

export const getFooterInfo = unstable_cache(
  async (): Promise<FooterInfo> => {
    const payload = await getPayload({ config })
    const [footer, services, groupDocs, industryDocs] = await Promise.all([
      payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: false }),
      loadPublishedServices(),
      payload.find({
        collection: 'service-groups',
        depth: 0,
        pagination: false,
        sort: 'sortOrder',
        overrideAccess: false,
      }),
      payload.find({
        collection: 'industries',
        where: { _status: { equals: 'published' } },
        depth: 0,
        pagination: false,
        sort: 'sortOrder',
        overrideAccess: false,
        select: { title: true, slug: true },
      }),
    ])

    const serviceGroups = footer.showServiceGroups === false
      ? []
      : groupDocs.docs.flatMap((group): MenuGroup[] => {
          const inGroup = services.filter((service) => service.groupId === group.id)
          // Parents first, each followed by its own sub-services.
          const items = inGroup
            .filter((service) => service.parentId === undefined)
            .flatMap((parent) => [
              parent,
              ...inGroup.filter((service) => service.parentId === parent.id),
            ])
            .map(toServiceLink)
          return items.length ? [{ label: group.title, items }] : []
        })

    return {
      brandHeading: text(footer.brandStrip?.heading),
      brandStatement: text(footer.brandStrip?.statement),
      serviceGroups,
      industries:
        footer.showIndustries === false
          ? []
          : industryDocs.docs.map((doc) => ({ id: doc.id, title: doc.title, href: `/industries/${doc.slug}/` })),
      columns: (footer.columns ?? []).flatMap((column) => {
        const links = (column.links ?? []).flatMap((item) => toNavLink({ ...item }) ?? [])
        const title = text(column.title)
        return title && links.length ? [{ title, links }] : []
      }),
      legalLinks: (footer.legalLinks ?? []).flatMap((item) => toNavLink({ ...item }) ?? []),
      copyrightText: text(footer.copyrightText),
    }
  },
  ['chrome:footer'],
  { tags: ['global:footer', 'services', 'service-groups', 'industries'], revalidate: REVALIDATE_SECONDS },
)

/** First few top-level published services, for the 404 page. */
export async function getPopularServices(limit = 6): Promise<ServiceLink[]> {
  const services = await loadPublishedServices()
  return services
    .filter((service) => service.parentId === undefined)
    .slice(0, limit)
    .map(toServiceLink)
}

export type StickyAction = 'call' | 'whatsapp' | 'quote'

/** Which buttons the mobile sticky bar shows: only those with real data behind them. */
export function stickyActions(site: SiteInfo, header: HeaderInfo): StickyAction[] {
  return [
    site.phone ? 'call' : undefined,
    site.whatsapp ? 'whatsapp' : undefined,
    header.cta ? 'quote' : undefined,
  ].filter((action): action is StickyAction => Boolean(action))
}
