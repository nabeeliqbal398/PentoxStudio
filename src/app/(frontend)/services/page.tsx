import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { CardsGrid } from '@/components/sections/CardsGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { EstimatorTeaser } from '@/components/sections/EstimatorTeaser'
import { FaqSection } from '@/components/sections/FaqSection'
import { PageHero } from '@/components/sections/PageHero'
import { ProjectGrid } from '@/components/sections/Projects'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { Steps } from '@/components/sections/Steps'
import { DraftPreview } from '@/components/site/DraftPreview'
import { Cta } from '@/components/ui/Cta'
import {
  getCtaBand,
  getHome,
  getPage,
  getProjects,
  getServiceGroups,
  getSiteText,
  getViewer,
  populated,
} from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

// Copy for this page lives in the Pages collection (slug "services", template "Services hub").
const HUB_SLUG = 'services'

export async function generateMetadata(): Promise<Metadata> {
  const viewer = await getViewer()
  const [page, text] = await Promise.all([getPage(HUB_SLUG, viewer), getSiteText()])
  return buildMetadata({
    meta: page?.meta,
    title: page?.hero?.heading || page?.title || text.common?.services || undefined,
    description: page?.excerpt || page?.hero?.intro,
    path: '/services/',
    noindex: viewer.draft,
  })
}

export default async function ServicesHubPage() {
  const viewer = await getViewer()
  const [page, text, groups, home, featured, band] = await Promise.all([
    getPage(HUB_SLUG, viewer),
    getSiteText(),
    getServiceGroups(),
    getHome(),
    getProjects({ featured: true, limit: 3 }),
    getCtaBand(),
  ])
  const heading = page?.hero?.heading || page?.title || text.common?.services
  const secondary = page?.secondary

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <Breadcrumbs homeLabel={text.common?.home} items={[{ label: text.common?.services || heading || 'Services' }]} />
      {heading && (
        <PageHero
          actions={
            <>
              <Cta label={band?.primaryCta?.label} url={band?.primaryCta?.url} />
              <Cta label={band?.secondaryCta?.label} url={band?.secondaryCta?.url} variant="outline" />
            </>
          }
          eyebrow={page?.hero?.eyebrow}
          heading={heading}
          intro={page?.hero?.intro}
        />
      )}

      <ServiceCards groups={groups} id="hub-services" learnMore={text.common?.learnMore} />

      <CardsGrid
        heading={page?.highlights?.heading}
        id="hub-why"
        intro={page?.highlights?.intro}
        items={page?.highlights?.items}
      />

      <Steps heading={text.hubs?.howWeWork} id="hub-how" steps={home.howWeWork?.steps} />

      <ProjectGrid heading={text.hubs?.featuredProjects} id="hub-projects" projects={featured} />

      <EstimatorTeaser
        buttonLabel={secondary?.buttonLabel}
        heading={secondary?.heading}
        text={secondary?.text}
        url={secondary?.buttonUrl}
      />

      <FaqSection faqs={populated(page?.faqs)} heading={text.hubs?.faq} id="hub-faq" />

      <CtaBand band={band} override={page?.cta} />
    </>
  )
}
