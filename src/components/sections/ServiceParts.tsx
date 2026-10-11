import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { one, toImg } from '@/lib/media'
import type { Industry, Package, Service } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { Cta } from '../ui/Cta'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

const serviceHref = (service: Pick<Service, 'path' | 'slug'>) => service.path || `/services/${service.slug}/`

/** Linked service cards: sub-services on a service page, recommended services on an industry page. */
export function ServiceLinks({
  services,
  heading,
  learnMore,
  id,
}: {
  services: Service[]
  heading?: string | null
  learnMore?: string | null
  id: string
}) {
  if (!services.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li
            className="relative rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)] transition-shadow focus-within:shadow-soft hover:shadow-soft"
            key={service.id}
          >
            <h3 className="font-heading text-lg font-semibold text-navy">
              <Link className="after:absolute after:inset-0 after:content-['']" href={serviceHref(service)}>
                {service.title}
              </Link>
            </h3>
            <p className="mt-2 text-body">{service.shortDescription}</p>
            {learnMore && (
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                {learnMore}
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

/**
 * Packages for the service. Only active packages are readable, and a price is shown only when the
 * client has entered one ("starting from"); unpriced packages show no number.
 */
export function PackagesSection({
  packages,
  heading,
  priceFrom,
  id,
}: {
  packages: Package[]
  heading?: string | null
  priceFrom?: string | null
  id: string
}) {
  if (!packages.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {packages.map((pack) => {
          const hasPrice = typeof pack.startingFrom === 'number'
          return (
            <li
              className={`rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)] ${pack.highlighted ? 'ring-2 ring-brand' : ''}`}
              key={pack.id}
            >
              <h3 className="font-heading text-xl font-semibold text-navy">{pack.title}</h3>
              {hasPrice && (
                <p className="mt-3">
                  {priceFrom && <span className="block text-xs uppercase tracking-wide text-muted">{priceFrom}</span>}
                  <span className="font-heading text-3xl font-bold text-brand">
                    {[pack.currency, pack.startingFrom!.toLocaleString('en-US')].filter(Boolean).join(' ')}
                  </span>
                  {pack.priceNote && <span className="ml-1 text-sm text-muted">{pack.priceNote}</span>}
                </p>
              )}
              {pack.features && pack.features.length > 0 && (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-body">
                  {pack.features.map((feature) => (
                    <li key={feature.id ?? feature.text}>{feature.text}</li>
                  ))}
                </ul>
              )}
              <div className="mt-5">
                <Cta label={pack.ctaLabel} url="/contact-us/" variant="outline" />
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Logo row of tools and technologies (name chips where there is no logo). */
export function ToolsSection({
  tools,
  heading,
  id,
}: {
  tools?: NonNullable<Service['tools']> | null
  heading?: string | null
  id: string
}) {
  if (!tools?.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-4">
        {tools.map((tool) => {
          const logo = toImg(one(tool.logo), 'thumbnail')
          return (
            <li
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy shadow-[0_4px_16px_rgba(28,36,75,.08)]"
              key={tool.id ?? tool.name}
            >
              {logo && <CmsImage className="h-6 w-auto" img={{ ...logo, alt: '' }} />}
              {tool.name}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Chips linking to the published industries a service is relevant to. */
export function IndustryChips({
  industries,
  heading,
  id,
}: {
  industries: Industry[]
  heading?: string | null
  id: string
}) {
  if (!industries.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="flex flex-wrap justify-center gap-3">
        {industries.map((industry) => (
          <li key={industry.id}>
            <Link
              className="inline-block rounded-full border border-navy/30 px-5 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white"
              href={`/industries/${industry.slug}/`}
            >
              {industry.title}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
