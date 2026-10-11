import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CardsGrid } from '@/components/sections/CardsGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { FaqSection } from '@/components/sections/FaqSection'
import { PageHero } from '@/components/sections/PageHero'
import { ProjectGrid } from '@/components/sections/Projects'
import { ServiceLinks } from '@/components/sections/ServiceParts'
import { Stats } from '@/components/sections/Stats'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { Cta } from '@/components/ui/Cta'
import {
  getCtaBand,
  getFaqs,
  getIndustry,
  getProjects,
  getSiteText,
  getStats,
  getViewer,
  populated,
} from '@/lib/content'
import { toImg, one } from '@/lib/media'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

// Nothing is pre-built: each page renders on its first request, then is cached and refreshed by
// the revalidation hooks (or hourly). Drafts never enter this cache (see lib/content.ts).
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const viewer = await getViewer()
  const industry = await getIndustry(slug, viewer)
  if (!industry) return {}
  return buildMetadata({
    meta: industry.meta,
    title: industry.hero?.heading || industry.title,
    description: industry.summary,
    path: `/industries/${industry.slug}/`,
    noindex: viewer.draft,
  })
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params
  const viewer = await getViewer()
  // Draft industries are 404 for the public; editors in Live Preview can see them.
  const industry = await getIndustry(slug, viewer)
  if (!industry) notFound()

  const [text, band, stats, projects, industryFaqs] = await Promise.all([
    getSiteText(),
    getCtaBand(),
    getStats(),
    getProjects({ industryId: industry.id, limit: 3 }),
    getFaqs({ industryId: industry.id }),
  ])
  const labels = text.industry
  const faqs = [...populated(industry.faqs), ...industryFaqs].filter(
    (faq, index, all) => all.findIndex((other) => other.id === faq.id) === index,
  )

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <Breadcrumbs
        homeLabel={text.common?.home}
        items={[{ label: text.common?.industries || 'Industries', href: '/industries/' }, { label: industry.title }]}
      />

      <PageHero
        actions={
          <>
            <Cta label={band?.primaryCta?.label} url={band?.primaryCta?.url} />
            <Cta label={band?.secondaryCta?.label} url={band?.secondaryCta?.url} variant="outline" />
          </>
        }
        heading={industry.hero?.heading || industry.title}
        image={toImg(one(industry.hero?.image), 'hero')}
        intro={industry.hero?.intro || industry.summary}
      />

      <CardsGrid
        heading={labels?.challenges}
        id="industry-challenges"
        items={industry.challenges?.map((item) => ({ title: item.title, description: item.description }))}
        numbered
      />

      <ServiceLinks
        heading={labels?.services}
        id="industry-services"
        learnMore={text.common?.learnMore}
        services={populated(industry.recommendedServices)}
      />

      <ProjectGrid heading={labels?.projects} id="industry-projects" projects={projects} />

      <Stats items={stats} />

      <FaqSection faqs={faqs} heading={labels?.faq} id="industry-faq" />

      <CtaBand band={band} />
    </>
  )
}
