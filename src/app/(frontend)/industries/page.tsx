import type { Metadata } from 'next'

import { CtaBand } from '@/components/sections/CtaBand'
import { FaqSection } from '@/components/sections/FaqSection'
import { IndustryGrid } from '@/components/sections/IndustryGrid'
import { PageHero } from '@/components/sections/PageHero'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { Section } from '@/components/ui/Section'
import { getCtaBand, getPage, getPublishedIndustries, getSiteText, getViewer, populated } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

// Copy for this page lives in the Pages collection (slug "industries", template "Industries hub").
const HUB_SLUG = 'industries'

export async function generateMetadata(): Promise<Metadata> {
  const viewer = await getViewer()
  const [page, text] = await Promise.all([getPage(HUB_SLUG, viewer), getSiteText()])
  return buildMetadata({
    meta: page?.meta,
    title: page?.hero?.heading || page?.title || text.common?.industries || undefined,
    description: page?.excerpt || page?.hero?.intro,
    path: '/industries/',
    noindex: viewer.draft,
  })
}

export default async function IndustriesHubPage() {
  const viewer = await getViewer()
  const [page, text, industries, band] = await Promise.all([
    getPage(HUB_SLUG, viewer),
    getSiteText(),
    getPublishedIndustries(),
    getCtaBand(),
  ])
  const heading = page?.hero?.heading || page?.title || text.common?.industries

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <Breadcrumbs homeLabel={text.common?.home} items={[{ label: text.common?.industries || heading || 'Industries' }]} />
      {heading && <PageHero eyebrow={page?.hero?.eyebrow} heading={heading} intro={page?.hero?.intro} />}

      <IndustryGrid asPage id="hub-industries" industries={industries} />
      {!industries.length && text.hubs?.noIndustries && (
        <Section>
          <p className="text-center text-body">{text.hubs.noIndustries}</p>
        </Section>
      )}

      <FaqSection faqs={populated(page?.faqs)} heading={text.hubs?.faq} id="industries-faq" />
      <CtaBand band={band} override={page?.cta} />
    </>
  )
}
