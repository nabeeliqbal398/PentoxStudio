import Link from 'next/link'

import type { Industry } from '@/payload-types'

import { CmsIcon } from '../ui/CmsIcon'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

/** Icon grid of published industries. Hidden when none are published. */
export function IndustryGrid({
  industries,
  heading,
  intro,
  id,
  asPage,
}: {
  industries: Industry[]
  heading?: string | null
  intro?: string | null
  id: string
  /** On the hub page the grid is the main content and shows each industry's summary. */
  asPage?: boolean
}) {
  if (!industries.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} intro={intro} />
      </div>
      <ul className={`grid gap-5 ${asPage ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
        {industries.map((industry) => (
          <li
            className="relative rounded-2xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(28,36,75,.08)] transition-shadow focus-within:shadow-soft hover:shadow-soft"
            key={industry.id}
          >
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <CmsIcon name={industry.icon} />
            </span>
            <h3 className="mt-3 font-heading text-base font-semibold text-navy">
              <Link className="after:absolute after:inset-0 after:content-['']" href={`/industries/${industry.slug}/`}>
                {industry.title}
              </Link>
            </h3>
            {asPage && <p className="mt-2 text-sm text-body">{industry.summary}</p>}
          </li>
        ))}
      </ul>
    </Section>
  )
}
