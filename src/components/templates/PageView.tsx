import { BookingEmbed, MapEmbed } from '@/components/sections/Embeds'
import { CardsGrid } from '@/components/sections/CardsGrid'
import { ClientLogos } from '@/components/sections/ClientLogos'
import { ContactDetails } from '@/components/sections/ContactDetails'
import { CtaBand } from '@/components/sections/CtaBand'
import { FaqSection } from '@/components/sections/FaqSection'
import { PageHero } from '@/components/sections/PageHero'
import { ProjectGrid } from '@/components/sections/Projects'
import { Stats } from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { JsonLd } from '@/components/site/JsonLd'
import { Cta } from '@/components/ui/Cta'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  getClients,
  getCtaBand,
  getProjects,
  getSiteText,
  getStats,
  getVerifiedTestimonials,
  populated,
  type Viewer,
} from '@/lib/content'
import { organizationJsonLd, webPageJsonLd } from '@/lib/seo'
import { getSiteInfo, type SiteInfo } from '@/lib/site-data'
import type { Page, SiteText } from '@/payload-types'

type Ctx = { page: Page; site: SiteInfo; text: SiteText; path: string }

function Body({ page }: { page: Page }) {
  if (!page.content?.root?.children?.length) return null
  return (
    <Section className="max-w-3xl">
      <RichText data={page.content} />
    </Section>
  )
}

function ContactActions({ site, text }: { site: SiteInfo; text: SiteText }) {
  return (
    <>
      <Cta label={text.common?.whatsapp} newTab url={site.whatsapp?.href} />
      <Cta label={text.common?.call} url={site.phone?.href} variant="outline" />
      <Cta label={text.common?.email} url={site.email?.href} variant="outline" />
    </>
  )
}

async function AboutPage({ page, site, text, path }: Ctx) {
  const [stats, clients, band] = await Promise.all([getStats(), getClients(), getCtaBand()])
  const secondary = page.secondary
  return (
    <>
      <JsonLd data={organizationJsonLd(site)} />
      <JsonLd data={webPageJsonLd({ name: page.title, path, description: page.excerpt, type: 'AboutPage' })} />
      <PageHero eyebrow={page.hero?.eyebrow} heading={page.hero?.heading || page.title} intro={page.hero?.intro} />
      <Body page={page} />
      <CardsGrid
        heading={page.highlights?.heading}
        id="about-values"
        intro={page.highlights?.intro}
        items={page.highlights?.items}
      />
      <Stats items={stats} />
      <ClientLogos clients={clients} />
      {(secondary?.heading || secondary?.text || site.addressLines.length > 0) && (
        <Section>
          <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(28,36,75,.08)] md:p-12">
            <SectionHeading align="left" heading={secondary?.heading} intro={secondary?.text} />
            {site.addressLines.length > 0 && (
              <address className="not-italic text-body">
                {site.addressLines.map((line) => (
                  <span className="block" key={line}>
                    {line}
                  </span>
                ))}
              </address>
            )}
          </div>
        </Section>
      )}
      <FaqSection faqs={populated(page.faqs)} heading={text.contact?.faq} id="about-faq" />
      <CtaBand band={band} override={page.cta} />
    </>
  )
}

function ContactPage({ page, site, text, path }: Ctx) {
  const secondary = page.secondary
  return (
    <>
      <JsonLd data={organizationJsonLd(site)} />
      <JsonLd data={webPageJsonLd({ name: page.title, path, description: page.excerpt, type: 'ContactPage' })} />
      <PageHero eyebrow={page.hero?.eyebrow} heading={page.hero?.heading || page.title} intro={page.hero?.intro} />
      <Section className="!pt-0">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* The multi-step lead form goes in this column in Phase 5; until then, direct contact. */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)] md:p-8">
            {text.contact?.reachUs && (
              <h2 className="mb-5 font-heading text-2xl font-semibold text-navy">{text.contact.reachUs}</h2>
            )}
            <div className="flex flex-wrap gap-3">
              <ContactActions site={site} text={text} />
              <Cta label={text.common?.bookCall} url="/book-a-call/" variant="outline" />
            </div>
          </div>
          <ContactDetails labels={text.contact} site={site} />
        </div>
      </Section>
      <BookingEmbed
        heading={secondary?.heading || text.contact?.booking}
        id="contact-booking"
        intro={secondary?.text}
        openLabel={text.common?.openBooking}
        url={site.bookingUrl}
      />
      <MapEmbed heading={text.contact?.map} id="contact-map" url={site.mapEmbedUrl} />
      <FaqSection faqs={populated(page.faqs)} heading={text.contact?.faq} id="contact-faq" />
    </>
  )
}

async function BookCallPage({ page, site, text, path }: Ctx) {
  const [testimonials, band] = await Promise.all([getVerifiedTestimonials(), getCtaBand()])
  const featured = testimonials.filter((item) => item.featured)
  const shown = (featured.length ? featured : testimonials).slice(0, 1)
  return (
    <>
      <JsonLd data={webPageJsonLd({ name: page.title, path, description: page.excerpt })} />
      <PageHero eyebrow={page.hero?.eyebrow} heading={page.hero?.heading || page.title} intro={page.hero?.intro} />
      <BookingEmbed
        heading={text.contact?.booking}
        id="book-embed"
        openLabel={text.common?.openBooking}
        url={site.bookingUrl}
      />
      {!site.bookingUrl && (
        <Section className="!pt-0">
          <div className="flex flex-wrap justify-center gap-3">
            <ContactActions site={site} text={text} />
          </div>
        </Section>
      )}
      <CardsGrid
        heading={page.highlights?.heading}
        id="book-covers"
        intro={page.highlights?.intro}
        items={page.highlights?.items}
      />
      <Testimonials
        badges={[]}
        heading={text.contact?.testimonial}
        id="book-testimonial"
        reviews={[]}
        testimonials={shown}
      />
      <FaqSection faqs={populated(page.faqs)} heading={text.contact?.faq} id="book-faq" />
      <CtaBand band={band} override={page.cta} />
    </>
  )
}

async function ThankYouPage({ page, site, text }: Ctx) {
  // Confirmation, expected response time, WhatsApp, Book a call, then proof. Conversion events
  // (dataLayer) are fired by the lead form in Phase 5. This page is noindex.
  const projects = await getProjects({ featured: true, limit: 3 })
  return (
    <>
      <PageHero
        actions={
          <>
            <Cta label={text.common?.whatsapp} newTab url={site.whatsapp?.href} />
            <Cta label={text.common?.bookCall} url="/book-a-call/" variant="outline" />
          </>
        }
        eyebrow={page.hero?.eyebrow}
        heading={page.hero?.heading || page.title}
        intro={page.hero?.intro}
        trustLine={site.responseTime}
      />
      <CardsGrid
        heading={page.highlights?.heading}
        id="thanks-next"
        intro={page.highlights?.intro}
        items={page.highlights?.items}
      />
      <ProjectGrid heading={text.contact?.thankYouProjects} id="thanks-projects" projects={projects} />
    </>
  )
}

function DefaultPage({ page }: Ctx) {
  return (
    <>
      <PageHero eyebrow={page.hero?.eyebrow} heading={page.hero?.heading || page.title} intro={page.hero?.intro || page.excerpt} />
      <Body page={page} />
    </>
  )
}

/** Renders a Pages-collection document with the layout chosen by its template. */
export async function PageView({ page, viewer, path }: { page: Page; viewer: Viewer; path: string }) {
  const [site, text] = await Promise.all([getSiteInfo(), getSiteText()])
  const ctx: Ctx = { page, site, text, path }
  const View =
    page.template === 'about'
      ? AboutPage
      : page.template === 'contact'
        ? ContactPage
        : page.template === 'book-a-call'
          ? BookCallPage
          : page.template === 'thank-you'
            ? ThankYouPage
            : DefaultPage

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <Breadcrumbs homeLabel={text.common?.home} items={[{ label: page.title }]} />
      <View {...ctx} />
    </>
  )
}

