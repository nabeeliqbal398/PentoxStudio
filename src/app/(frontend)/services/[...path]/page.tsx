import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CardsGrid } from '@/components/sections/CardsGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { FaqSection } from '@/components/sections/FaqSection'
import { PageHero } from '@/components/sections/PageHero'
import { PostCards } from '@/components/sections/PostCards'
import { ProjectGrid } from '@/components/sections/Projects'
import { IndustryChips, PackagesSection, ServiceLinks, ToolsSection } from '@/components/sections/ServiceParts'
import { Breadcrumbs, type Crumb } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { JsonLd } from '@/components/site/JsonLd'
import { Cta } from '@/components/ui/Cta'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import {
  getCtaBand,
  getFaqs,
  getPackagesForService,
  getPostsForService,
  getProjects,
  getService,
  getSiteText,
  getSubServices,
  getViewer,
  one,
  populated,
} from '@/lib/content'
import { toImg } from '@/lib/media'
import { buildMetadata, serviceJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ path: string[] }> }

// /services/<service>/ and /services/<service>/<sub-service>/ only.
const servicePath = (segments: string[]) => (segments.length <= 2 ? `/services/${segments.join('/')}/` : undefined)

// Nothing is pre-built: each page renders on its first request, then is cached and refreshed by
// the revalidation hooks (or hourly). Drafts never enter this cache (see lib/content.ts).
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const target = servicePath(path)
  if (!target) return {}
  const viewer = await getViewer()
  const service = await getService(target, viewer)
  if (!service) return {}
  return buildMetadata({
    meta: service.meta,
    // A long copied-over heading would be cut off in search results: fall back to the shorter service name.
    title: service.hero?.heading && service.hero.heading.length <= 52 ? service.hero.heading : service.title,
    description: service.shortDescription,
    path: service.path || target,
    noindex: viewer.draft,
  })
}

export default async function ServicePage({ params }: Props) {
  const { path } = await params
  const target = servicePath(path)
  if (!target) notFound()

  const viewer = await getViewer()
  // Drafts (and sub-services of unpublished parents) are 404 for the public; editors in preview see them.
  const service = await getService(target, viewer)
  if (!service) notFound()

  const [text, band, subServices, packages, relatedProjects, posts, serviceFaqs] = await Promise.all([
    getSiteText(),
    getCtaBand(),
    getSubServices(service.id),
    getPackagesForService(service.id),
    getProjects({ serviceId: service.id, limit: 3 }),
    getPostsForService(service.id, 3),
    getFaqs({ serviceId: service.id }),
  ])

  const parent = one(service.parent)
  const labels = text.service
  const results = populated(service.results)
  const resultIds = new Set(results.map((project) => project.id))
  const faqs = [...populated(service.faqs), ...serviceFaqs].filter(
    (faq, index, all) => all.findIndex((other) => other.id === faq.id) === index,
  )

  const trail: Crumb[] = [{ label: text.common?.services || 'Services', href: '/services/' }]
  if (parent) trail.push({ label: parent.title, href: parent.path || `/services/${parent.slug}/` })
  trail.push({ label: service.title })

  const cta = service.cta
  const approach = service.approach

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <JsonLd data={serviceJsonLd({ name: service.title, description: service.shortDescription, path: service.path || target })} />
      <Breadcrumbs homeLabel={text.common?.home} items={trail} />

      {/* 1. Hero */}
      <PageHero
        actions={
          <>
            <Cta label={band?.primaryCta?.label} url={band?.primaryCta?.url} />
            <Cta label={band?.secondaryCta?.label} url={band?.secondaryCta?.url} variant="outline" />
          </>
        }
        heading={service.hero?.heading || service.title}
        image={toImg(one(service.hero?.image), 'hero')}
        intro={service.hero?.intro || service.shortDescription}
        trustLine={service.hero?.trustLine}
      />

      {/* 2. What's included */}
      <CardsGrid
        heading={labels?.included}
        id="service-included"
        items={service.deliverables?.map((item) => ({
          icon: item.icon,
          title: item.title,
          description: item.description,
        }))}
      />

      {/* 3. Our approach: numbered cards */}
      <CardsGrid
        heading={approach?.heading}
        id="service-approach"
        intro={approach?.intro}
        items={approach?.steps?.map((step) => ({
          title: step.title,
          description: step.description,
          image: toImg(one(step.image), 'card'),
        }))}
        numbered
      />

      {/* Optional long-form body (article-style service pages) */}
      {service.longform?.root?.children?.length ? (
        <Section>
          <RichText className="mx-auto" data={service.longform} />
        </Section>
      ) : null}

      {/* 4. Results */}
      <ProjectGrid heading={labels?.results} id="service-results" projects={results} />

      {/* 5. Packages */}
      <PackagesSection heading={labels?.packages} id="service-packages" packages={packages} priceFrom={labels?.priceFrom} />

      {/* 6. Tools & technologies */}
      <ToolsSection heading={labels?.tools} id="service-tools" tools={service.tools} />

      {/* 7. Industries */}
      <IndustryChips heading={labels?.industries} id="service-industries" industries={populated(service.industries)} />

      {/* 8. Why choose Pentox */}
      <CardsGrid
        heading={service.whyChoose?.heading}
        id="service-why"
        items={service.whyChoose?.items?.map((item) => ({
          icon: item.icon,
          title: item.title,
          description: item.description,
        }))}
      />

      {/* 9. CTA banner + estimator link */}
      <CtaBand override={cta} withForm={false}>
        <div className="mt-4">
          <Cta label={text.common?.estimator} url="/cost-estimator/" variant="outlineLight" />
        </div>
      </CtaBand>

      {/* 10. FAQ */}
      <FaqSection faqs={faqs} heading={labels?.faq} id="service-faq" />

      {/* 11. Related projects */}
      <ProjectGrid
        heading={labels?.relatedProjects}
        id="service-projects"
        projects={relatedProjects.filter((project) => !resultIds.has(project.id))}
      />

      {/* 12. Related blog posts */}
      <PostCards heading={labels?.relatedPosts} id="service-posts" posts={posts} />

      {/* 13. Sub-services */}
      <ServiceLinks
        heading={labels?.subServices}
        id="service-subs"
        learnMore={text.common?.learnMore}
        services={subServices}
      />

      {/* 14. Pre-footer CTA band with the lead form, this service pre-selected */}
      <CtaBand band={band} serviceId={service.id} />
    </>
  )
}

