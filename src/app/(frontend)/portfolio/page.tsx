import type { Metadata } from 'next'

import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid'
import { CtaBand } from '@/components/sections/CtaBand'
import { PageHero } from '@/components/sections/PageHero'
import { Stats } from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { JsonLd } from '@/components/site/JsonLd'
import { Section } from '@/components/ui/Section'
import {
  getActiveBadges,
  getCtaBand,
  getPage,
  getPortfolioCategories,
  getProjectList,
  getSiteText,
  getStats,
  getVerifiedReviews,
  getVerifiedTestimonials,
  getViewer,
} from '@/lib/content'
import { toCard } from '@/lib/portfolio'
import { buildMetadata, portfolioListJsonLd } from '@/lib/seo'

// Copy for the hero lives in the Pages collection (slug "portfolio", template "Portfolio hub").
// The ?category= filter is applied in the browser, so this page stays cacheable; its canonical URL
// is always /portfolio/ so filtered views are never indexed as separate pages.
const HUB_SLUG = 'portfolio'

export async function generateMetadata(): Promise<Metadata> {
  const viewer = await getViewer()
  const [page, text] = await Promise.all([getPage(HUB_SLUG, viewer), getSiteText()])
  return buildMetadata({
    meta: page?.meta,
    title: page?.hero?.heading || page?.title || text.portfolio?.breadcrumb || undefined,
    description: page?.excerpt || page?.hero?.intro,
    path: '/portfolio/',
    noindex: viewer.draft,
  })
}

export default async function PortfolioPage() {
  const viewer = await getViewer()
  const [page, text, projects, categories, stats, band, testimonials, reviews, badges] = await Promise.all([
    getPage(HUB_SLUG, viewer),
    getSiteText(),
    getProjectList(viewer),
    getPortfolioCategories(),
    getStats(),
    getCtaBand(),
    getVerifiedTestimonials(),
    getVerifiedReviews(),
    getActiveBadges(),
  ])

  const cards = projects.map(toCard)
  // Only categories that have at least one project become pills.
  const usedSlugs = new Set(cards.flatMap((card) => card.categories))
  const pills = categories.flatMap((category) =>
    category.slug && usedSlugs.has(category.slug) ? [{ slug: category.slug, title: category.title }] : [],
  )
  const heading = page?.hero?.heading || page?.title || text.portfolio?.breadcrumb

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      {!viewer.draft && cards.length > 0 && (
        <JsonLd data={portfolioListJsonLd(cards.map((card) => ({ name: card.title, path: `/portfolio/${card.slug}/` })))} />
      )}
      <Breadcrumbs homeLabel={text.common?.home} items={[{ label: text.portfolio?.breadcrumb || heading || 'Portfolio' }]} />
      {heading && <PageHero eyebrow={page?.hero?.eyebrow} heading={heading} intro={page?.hero?.intro} />}

      {cards.length > 0 && (
        <Section className="!pt-0">
          <PortfolioGrid
            allLabel={text.portfolio?.all}
            cards={cards}
            categories={pills}
            emptyText={text.portfolio?.empty}
            filterLabel={text.portfolio?.filterLabel}
          />
        </Section>
      )}

      <Stats items={stats} />
      <Testimonials
        badges={badges}
        heading={text.portfolio?.proof}
        id="portfolio-proof"
        reviews={reviews}
        testimonials={testimonials}
      />
      <CtaBand band={band} override={page?.cta} />
    </>
  )
}
