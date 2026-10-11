import type { Payload } from 'payload'

import { DEFAULT_SYSTEM_PROMPT } from '../globals/ChatbotSettings'
import { REVIEW_NOTE } from '../fields/review'
import { faqs, industries, menuOrder, redirects, serviceGroups } from './data/content'
import { pages, siteText } from './data/pages'
import { services, type GroupKey } from './data/services'
import { ensure, ensureGlobal, fillGlobal, type Id, type SeedContext } from './helpers'
import { richText } from './lexical'

const review = { needsReview: true, reviewNote: REVIEW_NOTE }

const BUTTON = { buttonLabel: 'Contact us', buttonUrl: '/contact-us/' }

async function seedPages(ctx: SeedContext) {
  for (const page of pages) {
    await ensure(
      ctx,
      'pages',
      { slug: { equals: page.slug } },
      {
        title: page.title,
        slug: page.slug,
        generateSlug: false,
        template: page.template,
        excerpt: page.excerpt,
        hero: page.hero,
        content: page.content ? richText(page.content) : undefined,
        highlights: page.highlights,
        secondary: page.secondary,
        needsReview: true,
        reviewNote: page.reviewNote,
      },
      { draft: page.draft, label: page.slug },
    )
  }
}

async function seedServiceGroups(ctx: SeedContext) {
  const ids = {} as Record<GroupKey, Id>
  for (const group of serviceGroups) {
    ids[group.key] = await ensure(
      ctx,
      'service-groups',
      { slug: { equals: group.key } },
      { title: group.title, slug: group.key, generateSlug: false, sortOrder: group.sortOrder },
      { label: group.key },
    )
  }
  return ids
}

async function seedServices(ctx: SeedContext, groups: Record<GroupKey, Id>) {
  const ids: Record<string, Id> = {}
  // Top-level services first so sub-services can reference their parent.
  const ordered = [...services].sort((a, b) => Number(Boolean(a.parent)) - Number(Boolean(b.parent)))

  for (const service of ordered) {
    const data: Record<string, unknown> = {
      title: service.title,
      slug: service.slug,
      generateSlug: false,
      group: groups[service.group],
      parent: service.parent ? ids[service.parent] : undefined,
      sortOrder: service.sortOrder,
      shortDescription: service.shortDescription,
      hero: service.hero,
      deliverables: service.deliverables,
      approach: service.approach,
      whyChoose: service.whyChoose,
      cta: service.cta ? { ...service.cta, ...BUTTON } : undefined,
      longform: service.longform ? richText(service.longform) : undefined,
      ...(service.isNew ? review : {}),
    }
    ids[service.slug] = await ensure(ctx, 'services', { slug: { equals: service.slug } }, data, {
      draft: Boolean(service.isNew),
      label: service.slug,
    })
  }
  return ids
}

async function seedIndustries(ctx: SeedContext) {
  for (const industry of industries) {
    await ensure(
      ctx,
      'industries',
      { slug: { equals: industry.slug } },
      { ...industry, generateSlug: false, ...review },
      { draft: true, label: industry.slug },
    )
  }
}

async function seedFaqs(ctx: SeedContext, serviceIds: Record<string, Id>) {
  for (const faq of faqs) {
    await ensure(
      ctx,
      'faqs',
      { question: { equals: faq.question } },
      {
        question: faq.question,
        answer: faq.answer,
        services: [serviceIds[faq.service]],
        topic: 'service',
        sortOrder: faq.sortOrder,
      },
      { label: faq.question.slice(0, 40) },
    )
  }
}

// Blog categories mirror the services (capture/07 §9).
async function seedCategories(ctx: SeedContext, serviceIds: Record<string, Id>) {
  for (const service of services) {
    await ensure(
      ctx,
      'categories',
      { slug: { equals: service.slug } },
      {
        title: service.title,
        slug: service.slug,
        generateSlug: false,
        service: serviceIds[service.slug],
        sortOrder: service.sortOrder,
      },
      { label: service.slug },
    )
  }
}

// Prices are unknown, so packages stay inactive and unpriced until the client confirms them.
const tiers = [
  { tier: 'starter', name: 'Starter', sortOrder: 1 },
  { tier: 'growth', name: 'Growth', sortOrder: 2 },
  { tier: 'pro', name: 'Pro', sortOrder: 3 },
] as const

async function seedPackages(ctx: SeedContext, serviceIds: Record<string, Id>) {
  for (const service of services.filter((item) => !item.parent)) {
    for (const tier of tiers) {
      await ensure(
        ctx,
        'packages',
        { and: [{ service: { equals: serviceIds[service.slug] } }, { tier: { equals: tier.tier } }] },
        {
          title: `${service.title} – ${tier.name}`,
          service: serviceIds[service.slug],
          tier: tier.tier,
          sortOrder: tier.sortOrder,
          active: false,
          ...review,
        },
        { label: `${service.slug}/${tier.tier}` },
      )
    }
  }
}

async function seedEstimatorRules(ctx: SeedContext, serviceIds: Record<string, Id>) {
  for (const service of services.filter((item) => !item.parent)) {
    await ensure(
      ctx,
      'estimator-rules',
      { service: { equals: serviceIds[service.slug] } },
      {
        title: `${service.title} estimator`,
        service: serviceIds[service.slug],
        active: false,
        ...review,
      },
      { label: service.slug },
    )
  }
}

async function seedRedirects(ctx: SeedContext) {
  for (const redirect of redirects) {
    await ensure(
      ctx,
      'redirects',
      { from: { equals: redirect.from } },
      { ...redirect, statusCode: '301', active: true },
      { label: redirect.from },
    )
  }
}

async function seedGlobals(
  ctx: SeedContext,
  groups: Record<GroupKey, Id>,
  serviceIds: Record<string, Id>,
) {
  await ensureGlobal(ctx, 'site-settings', (g) => !g.phone && !g.email, {
    businessName: 'Pentox Studio',
    phone: '+92 323 578 8660',
    whatsappNumber: '923235788660',
    email: 'pentoxstudio@gmail.com',
    address: {
      street: 'Office 64 MB floor, Zainab Tower, Model Town Link Rd, Bhatti Colony',
      city: 'Lahore',
      postalCode: '54400',
      country: 'Pakistan',
    },
    // The Facebook profile URL was stripped in the capture: add it from the client.
    socials: [
      { platform: 'instagram', url: 'https://www.instagram.com/pentoxstudio/' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/company/pentoxstudio' },
    ],
  })

  await ensureGlobal(ctx, 'header', (g) => !(g.megaMenu as unknown[] | undefined)?.length, {
    showTopBar: true,
    megaMenu: serviceGroups.map((group) => ({
      label: group.title,
      group: groups[group.key],
      items: menuOrder[group.key].map((slug) => ({ service: serviceIds[slug] })),
    })),
    navLinks: [
      { label: 'Industries', url: '/industries/' },
      { label: 'Portfolio', url: '/portfolio/' },
      { label: 'Pricing', url: '/pricing/' },
      { label: 'Blog', url: '/blog/' },
      { label: 'About', url: '/about-us/' },
      { label: 'Contact', url: '/contact-us/' },
    ],
    cta: { label: 'Free Audit', url: '/free-audit/' },
  })

  await ensureGlobal(ctx, 'footer', (g) => !(g.brandStrip as { heading?: string } | undefined)?.heading, {
    brandStrip: {
      heading: 'Let’s Build Your Brand',
      statement: 'We Are Creative Business Solutions Agency',
    },
    showServiceGroups: true,
    showIndustries: true,
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'About us', url: '/about-us/' },
          { label: 'Portfolio', url: '/portfolio/' },
          { label: 'Pricing', url: '/pricing/' },
          { label: 'Blog', url: '/blog/' },
          { label: 'Contact us', url: '/contact-us/' },
          { label: 'Book a call', url: '/book-a-call/' },
        ],
      },
    ],
    newsletter: {
      heading: 'Subscribe to our newsletter',
      text: 'Practical marketing and web tips. Unsubscribe anytime.',
    },
    legalLinks: [
      { label: 'Privacy Policy', url: '/privacy-policy/' },
      { label: 'Terms', url: '/terms/' },
      { label: 'Cookie Policy', url: '/cookie-policy/' },
    ],
    copyrightText: 'Copyright © {year} Pentox Studio. All Rights Reserved.',
  })

  // Home: hero and intro copy come from capture/02 (the cut-off intro sentence is fixed).
  // Nothing from /home-new/, no skill bars and no placeholder testimonials are seeded.
  await ensureGlobal(ctx, 'home', (g) => !(g.hero as { headline?: string } | undefined)?.headline, {
    hero: {
      eyebrow: 'Strategy | Creativity | Growth',
      headline: 'Let’s Get That Growth You Have Been Waiting For',
      highlightWord: 'Growth',
      subheadline:
        'Pentox Studio is a digital marketing agency in Pakistan helping startups, SMEs, and established businesses grow online.',
      primaryCta: { label: 'Get your free audit', url: '/free-audit/' },
      secondaryCta: { label: 'View services', url: '/services/' },
    },
    servicesSection: {
      heading: 'Our Services',
      intro:
        'Our team provides SEO services, website development, Google Ads management, social media marketing, branding, and guest posting to increase traffic, generate quality leads, and boost business growth.',
    },
    howWeWork: {
      heading: 'How we work',
      steps: [
        { title: 'Free audit', description: 'We review your website and goals.' },
        { title: 'Proposal', description: 'You get a clear scope, timeline and quote.' },
        { title: 'Build', description: 'We design and build it, with regular check-ins.' },
        { title: 'Grow', description: 'We launch, measure and keep improving.' },
      ],
    },
    estimatorTeaser: {
      heading: 'Estimate your project cost',
      text: 'Answer a few questions and get a price range.',
      buttonLabel: 'Try the estimator',
    },
    latestPosts: { heading: 'Latest from the blog', count: 3 },
  })

  await ensureGlobal(ctx, 'chatbot-settings', (g) => !g.greeting, {
    enabled: false,
    greeting: 'Hi! I’m the Pentox Studio assistant. How can I help?',
    fallbackText: 'Chat with us on WhatsApp instead.',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  })
}

// Defaults added in Phase 4. Filled field by field, so editors' own values are never replaced.
async function seedGlobalDefaults(ctx: SeedContext) {
  await fillGlobal(ctx, 'site-text', siteText)

  await fillGlobal(ctx, 'footer', {
    ctaBand: {
      heading: 'Get your free audit',
      text: 'Tell us about your website and your goals, and we will show you where the biggest opportunities are.',
      primaryCta: { label: 'Free Audit', url: '/free-audit/' },
      secondaryCta: { label: 'Book a Call', url: '/book-a-call/' },
    },
  })

  await fillGlobal(ctx, 'home', {
    projectsSection: { heading: 'Featured projects' },
    resultsSection: { heading: 'Results' },
    industriesSection: {
      heading: 'Industries we serve',
      intro: 'Marketing, design and development shaped around your industry.',
    },
    testimonialsSection: { heading: 'What our clients say' },
    faqSection: { heading: 'Frequently asked questions' },
  })

  // Address-based Google Maps embed (no API key needed). Replace it in Site settings if the client prefers another.
  await fillGlobal(ctx, 'site-settings', {
    mapEmbedUrl:
      'https://www.google.com/maps?q=Zainab+Tower,+Model+Town+Link+Road,+Lahore,+Pakistan&output=embed',
  })
}

export async function seed(payload: Payload) {
  const ctx: SeedContext = { payload, created: [], skipped: [] }

  const groups = await seedServiceGroups(ctx)
  const serviceIds = await seedServices(ctx, groups)
  await seedIndustries(ctx)
  await seedFaqs(ctx, serviceIds)
  await seedCategories(ctx, serviceIds)
  await seedPackages(ctx, serviceIds)
  await seedEstimatorRules(ctx, serviceIds)
  await seedRedirects(ctx)
  await seedPages(ctx)
  await seedGlobals(ctx, groups, serviceIds)
  await seedGlobalDefaults(ctx)

  payload.logger.info(`Seed finished: ${ctx.created.length} created, ${ctx.skipped.length} already present.`)
  if (ctx.created.length) payload.logger.info(`Created:\n  ${ctx.created.join('\n  ')}`)
}
