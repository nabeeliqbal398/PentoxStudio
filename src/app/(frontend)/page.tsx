import type { Metadata } from 'next'
import Link from 'next/link'

import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { Section } from '@/components/ui/Section'
import { ClientLogos } from '@/components/sections/ClientLogos'
import { CtaBand } from '@/components/sections/CtaBand'
import { EstimatorTeaser } from '@/components/sections/EstimatorTeaser'
import { FaqSection } from '@/components/sections/FaqSection'
import { IndustryGrid } from '@/components/sections/IndustryGrid'
import { PageHero } from '@/components/sections/PageHero'
import { PostCards } from '@/components/sections/PostCards'
import { ProjectsCarousel, ResultsCards } from '@/components/sections/Projects'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { Stats } from '@/components/sections/Stats'
import { Steps } from '@/components/sections/Steps'
import { Testimonials } from '@/components/sections/Testimonials'
import { DraftPreview } from '@/components/site/DraftPreview'
import { JsonLd } from '@/components/site/JsonLd'
import { Cta } from '@/components/ui/Cta'
import {
  getActiveBadges,
  getClients,
  getCtaBand,
  getFaqs,
  getHome,
  getLatestPosts,
  getProjects,
  getPublishedIndustries,
  getServiceGroups,
  getSiteText,
  getStats,
  getVerifiedReviews,
  getVerifiedTestimonials,
  getViewer,
  populated,
} from '@/lib/content'
import { one, toImg } from '@/lib/media'
import { buildMetadata, organizationJsonLd, reviewsJsonLd, websiteJsonLd } from '@/lib/seo'
import { getSiteInfo } from '@/lib/site-data'

export async function generateMetadata(): Promise<Metadata> {
  const [home, viewer] = await Promise.all([getHome(), getViewer()])
  return buildMetadata({
    // Without an SEO title set in the admin the home page still needs a real <title>.
    meta: { ...home.meta, title: home.meta?.title || 'Pentox Studio | Digital Marketing Agency in Lahore, Pakistan' },
    description: home.hero?.subheadline,
    path: '/',
    noindex: viewer.draft,
  })
}

export default async function HomePage() {
  const [viewer, home, site, text, stats, groups, industries, clients, allTestimonials, reviews, badges, band] =
    await Promise.all([
      getViewer(),
      getHome(),
      getSiteInfo(),
      getSiteText(),
      getStats(),
      getServiceGroups(),
      getPublishedIndustries(),
      getClients(),
      getVerifiedTestimonials(),
      getVerifiedReviews(),
      getActiveBadges(),
      getCtaBand(),
    ])

  // A section shows when it is switched on in the CMS and has data (each component also hides itself when empty).
  const on = (key: keyof NonNullable<typeof home.sections>) => home.sections?.[key] !== false

  const picked = populated(home.projectsSection?.projects)
  const resultPicks = populated(home.resultsSection?.projects)
  const pickedTestimonials = populated(home.testimonialsSection?.testimonials)
  const pickedFaqs = populated(home.faqSection?.faqs)

  const [featured, posts, homeFaqs] = await Promise.all([
    picked.length && resultPicks.length ? Promise.resolve([]) : getProjects({ featured: true, limit: 6 }),
    on('latestPosts') ? getLatestPosts(home.latestPosts?.count ?? 3) : Promise.resolve([]),
    pickedFaqs.length ? Promise.resolve([]) : getFaqs({ showOnHome: true }),
  ])

  const projects = picked.length ? picked : featured
  const results = resultPicks.length ? resultPicks : featured.slice(0, 3)
  const testimonials = pickedTestimonials.length ? pickedTestimonials : allTestimonials
  const faqs = pickedFaqs.length ? pickedFaqs : homeFaqs
  const hero = home.hero

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <JsonLd data={organizationJsonLd(site)} />
      <JsonLd data={websiteJsonLd(site)} />
      {reviews.length > 0 && on('testimonials') &&
        reviewsJsonLd(reviews).map((review, index) => <JsonLd data={review} key={index} />)}

      {/* 1. Hero */}
      {on('hero') && hero?.headline && (
        <PageHero
          actions={
            <>
              <Cta label={hero.primaryCta?.label} url={hero.primaryCta?.url} />
              <Cta label={hero.secondaryCta?.label} url={hero.secondaryCta?.url} variant="outline" />
            </>
          }
          eyebrow={hero.eyebrow}
          heading={hero.headline}
          highlight={hero.highlightWord}
          image={toImg(one(hero.image), 'hero')}
          intro={hero.subheadline}
          trustLine={hero.trustLine}
        />
      )}

      {/* 2. Client logo strip */}
      {on('clientLogos') && (
        <ClientLogos
          clients={clients}
          domesticLabel={home.clientsSection?.domesticLabel}
          heading={home.clientsSection?.heading}
          intro={home.clientsSection?.intro}
          internationalLabel={home.clientsSection?.internationalLabel}
        />
      )}

      {/* 3. Services */}
      {on('services') && (
        <>
          <ServiceCards
            groups={groups}
            heading={home.servicesSection?.heading}
            id="home-services"
            intro={home.servicesSection?.intro}
            learnMore={text.common?.learnMore}
          />
          {groups.length > 0 && text.common?.viewAllServices && (
            <p className="-mt-4 pb-8 text-center">
              <Link className="font-semibold text-accent underline underline-offset-4" href="/services/">
                {text.common.viewAllServices}
              </Link>
            </p>
          )}
        </>
      )}

      {/* 4. Stats strip */}
      {on('stats') && <Stats items={stats} />}

      {/* 5. Projects carousel */}
      {on('projects') && (
        <ProjectsCarousel
          allLabel={text.common?.viewAllProjects}
          heading={home.projectsSection?.heading}
          id="home-projects"
          projects={projects}
        />
      )}

      {/* 6. Results */}
      {on('results') && <ResultsCards heading={home.resultsSection?.heading} id="home-results" projects={results} />}

      {/* 7. How we work */}
      {on('howWeWork') && <Steps heading={home.howWeWork?.heading} id="home-how" steps={home.howWeWork?.steps} />}

      {/* 8. Industries we serve */}
      {on('industries') && (
        <IndustryGrid
          heading={home.industriesSection?.heading}
          id="home-industries"
          industries={industries}
          intro={home.industriesSection?.intro}
        />
      )}

      {/* 9. Cost-estimator teaser */}
      {on('estimatorTeaser') && (
        <EstimatorTeaser
          buttonLabel={home.estimatorTeaser?.buttonLabel}
          heading={home.estimatorTeaser?.heading}
          text={home.estimatorTeaser?.text}
          url="/cost-estimator/"
        />
      )}

      {/* 10. Testimonials (real only; hidden when there are none) */}
      {on('testimonials') && (
        <Testimonials
          badges={badges}
          heading={home.testimonialsSection?.heading}
          id="home-testimonials"
          reviews={reviews}
          testimonials={testimonials}
        />
      )}

      {/* 11. Latest blog posts */}
      {on('latestPosts') && <PostCards heading={home.latestPosts?.heading} id="home-posts" posts={posts} />}

      {/* 12. FAQ */}
      {on('faq') && <FaqSection faqs={faqs} heading={home.faqSection?.heading} id="home-faq" />}

      {/* Optional: newsletter signup (off by default; switch on in the Home page settings) */}
      {home.sections?.newsletter === true && (
        <Section className="max-w-2xl">
          <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)] md:p-8">
            <NewsletterSignup source="home" />
          </div>
        </Section>
      )}

      {/* 13. Pre-footer CTA band */}
      {on('ctaBand') && <CtaBand band={band} />}
    </>
  )
}
