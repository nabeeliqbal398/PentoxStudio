import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Gallery, type GalleryItem } from '@/components/portfolio/Gallery'
import { CtaBand } from '@/components/sections/CtaBand'
import { ProjectCardView } from '@/components/sections/ProjectCard'
import { Testimonials } from '@/components/sections/Testimonials'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { JsonLd } from '@/components/site/JsonLd'
import { CmsImage } from '@/components/ui/CmsImage'
import { Cta } from '@/components/ui/Cta'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Squiggle } from '@/components/site/Squiggle'
import { getCtaBand, getProject, getProjectList, getSiteText, getViewer } from '@/lib/content'
import { youtubeEmbedUrl } from '@/lib/embeds'
import { one, populated, toImg } from '@/lib/media'
import { toCard } from '@/lib/portfolio'
import { buildMetadata, creativeWorkJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

// Nothing is pre-built: each case study renders on its first request, then is cached and refreshed
// by the revalidation hooks. Drafts never enter this cache (see lib/content.ts).
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const viewer = await getViewer()
  const project = await getProject(slug, viewer)
  if (!project) return {}
  return buildMetadata({
    meta: project.meta,
    title: project.title,
    description: project.summary,
    path: `/portfolio/${project.slug}/`,
    noindex: viewer.draft,
    fallbackImage: one(project.heroImage) ?? one(project.cardImage),
  })
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const viewer = await getViewer()
  // Draft projects are 404 for the public; editors in Live Preview can see them.
  const project = await getProject(slug, viewer)
  if (!project) notFound()

  const [text, band, list] = await Promise.all([getSiteText(), getCtaBand(), getProjectList(viewer)])
  const labels = text.portfolio
  const path = `/portfolio/${project.slug}/`

  const client = one(project.client)
  const clientLogo = toImg(one(client?.logo), 'card')
  const hero = toImg(one(project.heroImage), 'hero')
  const services = populated(project.services)
  const industries = populated(project.industries)
  const categories = populated(project.categories)
  const testimonial = one(project.testimonial)
  const video = youtubeEmbedUrl(project.videoUrl)

  const gallery: GalleryItem[] = (project.gallery ?? []).flatMap((item) => {
    const media = one(item.image)
    const thumb = toImg(media, 'card')
    const full = toImg(media, 'hero')
    return thumb && full ? [{ thumb, full, caption: item.caption || undefined }] : []
  })

  // Next project: the following one in the portfolio order, wrapping to the first.
  const at = list.findIndex((item) => item.id === project.id)
  const candidate = at >= 0 ? list[(at + 1) % list.length] : list[0]
  const next = candidate && candidate.id !== project.id ? candidate : undefined

  const results = project.results ?? []
  const deliverables = project.deliverables ?? []
  const allTags = [
    ...services.map((service) => ({ key: `s${service.id}`, label: service.title, href: service.path || `/services/${service.slug}/` })),
    ...industries.map((industry) => ({ key: `i${industry.id}`, label: industry.title, href: `/industries/${industry.slug}/` })),
    ...categories.map((category) => ({ key: `c${category.id}`, label: category.title, href: `/portfolio/?category=${category.slug}` })),
  ]
  // A category named like its service (e.g. "SEO") would show twice: keep the first.
  const tags = allTags.filter((tag, index) => allTags.findIndex((other) => other.label === tag.label) === index)

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <JsonLd
        data={creativeWorkJsonLd({
          name: project.title,
          description: project.summary,
          path,
          image: hero?.src ?? toImg(one(project.cardImage), 'hero')?.src,
          completedAt: project.completedAt,
          keywords: [...services, ...industries, ...categories].map((item) => item.title),
          client: client?.name,
          projectUrl: project.projectUrl && /^https?:\/\//i.test(project.projectUrl) ? project.projectUrl : undefined,
        })}
      />
      <Breadcrumbs
        homeLabel={text.common?.home}
        items={[{ label: labels?.breadcrumb || 'Portfolio', href: '/portfolio/' }, { label: project.title }]}
      />

      {/* Intro: name + client on the left, summary, deliverables and tags on the right */}
      <header className="mx-auto grid max-w-site gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
        <div>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-navy md:text-5xl">{project.title}</h1>
          {clientLogo && client && (
            <CmsImage className="mt-6 h-12 w-auto object-contain" img={{ ...clientLogo, alt: client.name }} />
          )}
          {!clientLogo && client && <p className="mt-4 text-lg text-muted">{client.name}</p>}
        </div>
        <div className="space-y-5">
          <p className="text-lg leading-relaxed text-body">{project.summary}</p>
          {deliverables.length > 0 && (
            <div>
              {labels?.workedOn && <p className="font-heading font-semibold text-navy">{labels.workedOn}</p>}
              <ul className="mt-2 list-disc space-y-1 pl-5 text-body">
                {deliverables.map((item) => (
                  <li key={item.id ?? item.item}>{item.item}</li>
                ))}
              </ul>
            </div>
          )}
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag.key}>
                  <Link
                    className="inline-block rounded-full border border-navy/30 px-4 py-1.5 text-sm text-navy hover:bg-navy hover:text-white"
                    href={tag.href}
                  >
                    {tag.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Cta label={labels?.visitProject} newTab url={project.projectUrl} variant="outline" />
        </div>
      </header>

      <Squiggle />

      {hero && (
        <Section className="!pb-4 !pt-10">
          <CmsImage
            className="h-auto w-full rounded-xl shadow-soft"
            img={hero}
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
          />
        </Section>
      )}

      {/* Challenge and solution */}
      {[
        { id: 'challenge', heading: labels?.challenge, body: project.challenge },
        { id: 'solution', heading: labels?.solution, body: project.solution },
      ].map(
        ({ id, heading, body }) =>
          body?.root?.children?.length ? (
            <Section className="max-w-3xl" key={id} labelledBy={heading ? `case-${id}` : undefined}>
              {heading && (
                <h2 className="mb-4 font-heading text-3xl font-semibold text-navy" id={`case-${id}`}>
                  {heading}
                </h2>
              )}
              <RichText data={body} />
            </Section>
          ) : null,
      )}

      {video && (
        <Section className="max-w-3xl !pt-0">
          <div className="aspect-video overflow-hidden rounded-xl">
            <iframe allowFullScreen className="size-full" loading="lazy" src={video} title={project.title} />
          </div>
        </Section>
      )}

      {/* Results: big numbers */}
      {results.length > 0 && (
        <Section labelledBy={labels?.results ? 'case-results' : undefined}>
          <div id="case-results">
            <SectionHeading heading={labels?.results} />
          </div>
          <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {results.map((result) => (
              <div className="flex flex-col-reverse" key={result.id ?? result.label}>
                <dd className="font-heading text-4xl font-bold text-brand md:text-5xl">{result.value}</dd>
                <dt className="mt-1 text-sm text-muted">{result.label}</dt>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* Gallery with lightbox */}
      {gallery.length > 0 && (
        <Section labelledBy={labels?.gallery ? 'case-gallery' : undefined}>
          <div id="case-gallery">
            <SectionHeading heading={labels?.gallery} />
          </div>
          <Gallery items={gallery} labels={{ open: labels?.openImage, close: labels?.close, previous: labels?.previous, next: labels?.next }} />
        </Section>
      )}

      {/* Linked testimonial (verified only for visitors) */}
      <Testimonials
        badges={[]}
        heading={labels?.testimonial}
        id="case-testimonial"
        reviews={[]}
        testimonials={testimonial ? [testimonial] : []}
      />

      {/* Tools used */}
      {(project.toolsUsed?.length ?? 0) > 0 && (
        <Section labelledBy={labels?.tools ? 'case-tools' : undefined}>
          <div id="case-tools">
            <SectionHeading heading={labels?.tools} />
          </div>
          <ul className="flex flex-wrap justify-center gap-3">
            {project.toolsUsed!.map((tool) => (
              <li
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-navy shadow-[0_4px_16px_rgba(28,36,75,.08)]"
                key={tool.id ?? tool.name}
              >
                {tool.name}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Next project */}
      {next && (
        <Section className="max-w-sm" labelledBy={labels?.nextProject ? 'case-next' : undefined}>
          <div id="case-next">
            <SectionHeading heading={labels?.nextProject} />
          </div>
          <ProjectCardView card={toCard(next)} />
        </Section>
      )}

      <CtaBand band={band} serviceId={services[0]?.id} />
    </>
  )
}
