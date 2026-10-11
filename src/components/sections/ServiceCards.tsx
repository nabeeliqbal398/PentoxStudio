import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import type { ServiceGroupWithServices } from '@/lib/content'
import { one, toImg } from '@/lib/media'

import { CmsImage } from '../ui/CmsImage'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

/**
 * Service cards in their three groups. The card illustration overhangs the top edge of the card;
 * cards without an illustration simply start with the title. The arrow button links to the service.
 */
export function ServiceCards({
  groups,
  heading,
  intro,
  learnMore,
  id,
}: {
  groups: ServiceGroupWithServices[]
  heading?: string | null
  intro?: string | null
  learnMore?: string | null
  id: string
}) {
  if (!groups.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} intro={intro} />
      </div>
      <div className="space-y-14">
        {groups.map(({ group, services }) => (
          <div key={group.id}>
            <h3 className="mb-2 font-heading text-xl font-semibold text-navy">{group.title}</h3>
            {group.description && <p className="mb-6 max-w-2xl text-body">{group.description}</p>}
            <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const image = toImg(one(service.cardImage), 'card')
                return (
                  <li
                    className="relative rounded-2xl bg-white px-6 pb-6 pt-8 shadow-[0_8px_30px_rgba(28,36,75,.08)] transition-shadow focus-within:shadow-soft hover:shadow-soft"
                    key={service.id}
                  >
                    {image && (
                      <CmsImage
                        className="-mt-16 mb-4 h-32 w-auto max-w-full object-contain"
                        img={image}
                        sizes="(min-width: 1024px) 30vw, 90vw"
                      />
                    )}
                    <h4 className="font-heading text-lg font-semibold text-navy">
                      <Link
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
                        href={service.path || `/services/${service.slug}/`}
                      >
                        {service.title}
                      </Link>
                    </h4>
                    <p className="mt-2 text-body">{service.shortDescription}</p>
                    {service.children.length > 0 && (
                      <p className="mt-3 text-sm text-muted">{service.children.map((child) => child.title).join(' · ')}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      {learnMore}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
