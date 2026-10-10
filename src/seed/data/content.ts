import type { GroupKey } from './services'

export const serviceGroups: { key: GroupKey; title: string; sortOrder: number }[] = [
  { key: 'marketing', title: 'Marketing', sortOrder: 10 },
  { key: 'design-media', title: 'Design & Media', sortOrder: 20 },
  { key: 'development-ai', title: 'Development & AI', sortOrder: 30 },
]

// Target industries are still to be confirmed with the client (capture/07 §12), so these are
// seeded as drafts with neutral placeholder text and flagged "TODO: client review".
export const industries = [
  { slug: 'restaurants', title: 'Restaurants', sortOrder: 10 },
  { slug: 'healthcare', title: 'Healthcare', sortOrder: 20 },
  { slug: 'real-estate', title: 'Real Estate', sortOrder: 30 },
  { slug: 'ecommerce', title: 'E-commerce', sortOrder: 40 },
  { slug: 'education', title: 'Education', sortOrder: 50 },
].map((industry) => ({
  ...industry,
  summary: `Digital marketing, design and development for ${industry.title.toLowerCase()}.`,
}))

// Reused from capture/02 (Local SEO and Printing & Designing pages). The Local SEO answer about
// "guaranteeing" results was dropped: it did not answer its own question and promised outcomes.
export const faqs: {
  service: string
  question: string
  answer: string
  sortOrder: number
}[] = [
  {
    service: 'local-seo',
    question: 'Why Is Local SEO Important for Your Business?',
    answer:
      'Local SEO is critical because it helps you to stand out from the competition and target users making local searches, such as "cake store in New York" or "accountant in Amsterdam". Reach a relevant consumer base that is ready to convert.',
    sortOrder: 10,
  },
  {
    service: 'local-seo',
    question: 'How Long Does It Take to See Results From Local SEO?',
    answer:
      'SEO takes time, and local SEO is no different. It can take between four to six months to experience real results. While this can be frustrating, growing your presence naturally is critical to ensure sustained success. Using black hat techniques for quicker results will only see you being penalized by Google, which could mean being removed from the search results altogether.',
    sortOrder: 20,
  },
  {
    service: 'local-seo',
    question: 'Do You Require a Minimum Commitment for SEO Services?',
    answer:
      'No, we do not have a minimum term on your contracts. We do recommend that you have a long-term approach when it comes to SEO, as it requires time, nourishment, and patience. But we do not tie you into long contracts here.',
    sortOrder: 30,
  },
  {
    service: 'local-seo',
    question: 'Can You Customize a Local SEO Strategy for My Business?',
    answer:
      'Yes, we believe that SEO should always be a collaborative and bespoke service. We will never operate with a one-size-fits-all approach, as we know that this does not bring about results. Instead, we will work with you to understand your business so that we can put together an SEO strategy that brings about the very best results for you.',
    sortOrder: 40,
  },
  {
    service: 'printing-design',
    question: 'Do you offer custom printing?',
    answer: 'Yes. Every project is customized according to your requirements.',
    sortOrder: 10,
  },
  {
    service: 'printing-design',
    question: 'Can you create my complete branding?',
    answer:
      'Absolutely. We provide logo design, stationery, packaging, social media graphics, and marketing materials.',
    sortOrder: 20,
  },
  {
    service: 'printing-design',
    question: 'Do you provide print-ready files?',
    answer: 'Yes. We deliver professional print-ready files suitable for commercial printing.',
    sortOrder: 30,
  },
  {
    service: 'printing-design',
    question: 'Can I request revisions?',
    answer: 'Yes. Revisions are included to ensure complete satisfaction.',
    sortOrder: 40,
  },
  {
    service: 'printing-design',
    question: 'Do you serve international clients?',
    answer: 'Yes. Pentox Studio works with businesses around the world.',
    sortOrder: 50,
  },
]

// The static part of the 301 map from capture/07 §9. Per-post /YYYY/MM/<slug>/ redirects are
// created by the blog migration script (Phase 7). /about-us/ is a new page, so no redirect.
export const redirects: { from: string; to: string; note?: string }[] = [
  { from: '/seo/', to: '/services/seo/' },
  { from: '/social-media-marketing/', to: '/services/social-media-marketing/' },
  { from: '/web-development/', to: '/services/web-development/' },
  { from: '/graphic-designing/', to: '/services/graphic-design/' },
  { from: '/video-editing/', to: '/services/video-editing/' },
  { from: '/digital-marketing/', to: '/services/digital-marketing/' },
  { from: '/local-seo/', to: '/services/seo/local-seo/' },
  { from: '/printing-designing-services/', to: '/services/graphic-design/printing-design/' },
  { from: '/service/', to: '/services/' },
  { from: '/gallery/', to: '/contact-us/', note: 'Orphan form page on the old site.' },
  { from: '/home-new/', to: '/', note: 'Draft alternate homepage on the old site.' },
]

export const menuOrder: Record<GroupKey, string[]> = {
  marketing: ['digital-marketing', 'social-media-marketing', 'seo', 'local-seo'],
  'design-media': ['graphic-design', 'printing-design', 'video-editing'],
  'development-ai': [
    'web-development',
    'ai-chatbots-agents',
    'custom-cms-crm-development',
    'cloud-devops',
    'mobile-app-development',
  ],
}
