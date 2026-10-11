import Link from 'next/link'

import { toCard } from '@/lib/portfolio'
import type { Portfolio } from '@/payload-types'

import { ProjectCardView } from './ProjectCard'
import { Cta } from '../ui/Cta'
import { ScrollCarousel } from '../ui/ScrollCarousel'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

const projectHref = (project: Portfolio) => `/portfolio/${project.slug}/`

function ProjectCard({ project }: { project: Portfolio }) {
  return (
    <li>
      <ProjectCardView card={toCard(project)} />
    </li>
  )
}

/** Navy panel with the featured case studies in a carousel. Hidden when there are none. */
export function ProjectsCarousel({
  projects,
  heading,
  allLabel,
  id,
}: {
  projects: Portfolio[]
  heading?: string | null
  allLabel?: string | null
  id: string
}) {
  if (!projects.length) return null
  return (
    // The "All projects" pill straddles the panel's bottom edge (capture/06 §4.2), so the section keeps room below it.
    <section aria-labelledby={heading ? id : undefined} className="relative mb-10 bg-navy pb-16 pt-14 text-white md:pt-20">
      <div className="mx-auto max-w-site px-4">
        <div id={id}>
          <SectionHeading heading={heading} tone="light" />
        </div>
        <ScrollCarousel label={heading ?? 'Projects'} tone="light">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ScrollCarousel>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center">
        <Cta
          className="border-[1.5px] border-navy !text-navy shadow-soft hover:!border-brand hover:!text-brand"
          label={allLabel}
          url="/portfolio/"
          variant="light"
        />
      </div>
    </section>
  )
}

/** Three mini case-study cards with each project's headline number. Projects without results are skipped. */
export function ResultsCards({
  projects,
  heading,
  id,
}: {
  projects: Portfolio[]
  heading?: string | null
  id: string
}) {
  const withResult = projects.filter((project) => project.results?.length)
  if (!withResult.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {withResult.slice(0, 3).map((project) => {
          const headline = project.results![0]
          return (
            <li className="relative rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)]" key={project.id}>
              <p className="font-heading text-4xl font-bold text-brand">{headline.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{headline.label}</p>
              <h3 className="mt-4 font-heading text-lg font-semibold text-navy">
                <Link className="after:absolute after:inset-0 after:content-['']" href={projectHref(project)}>
                  {project.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-body">{project.summary}</p>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Simple card grid used for "Related projects" and "Featured case studies". */
export function ProjectGrid({
  projects,
  heading,
  id,
}: {
  projects: Portfolio[]
  heading?: string | null
  id: string
}) {
  if (!projects.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 [&>li]:shadow-[0_8px_30px_rgba(28,36,75,.08)]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ul>
    </Section>
  )
}
