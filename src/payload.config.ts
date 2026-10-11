import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Authors } from './collections/Authors'
import { Badges } from './collections/Badges'
import { CampaignDeliveries } from './collections/CampaignDeliveries'
import { Campaigns } from './collections/Campaigns'
import { Categories } from './collections/Categories'
import { ChatSessions } from './collections/ChatSessions'
import { ChatbotUsage } from './collections/ChatbotUsage'
import { Clients } from './collections/Clients'
import { EstimatorRules } from './collections/EstimatorRules'
import { Faqs } from './collections/Faqs'
import { Industries } from './collections/Industries'
import { KnowledgeChunks } from './collections/KnowledgeChunks'
import { Leads } from './collections/Leads'
import { Locations } from './collections/Locations'
import { Media } from './collections/Media'
import { Packages } from './collections/Packages'
import { Pages } from './collections/Pages'
import { Portfolio } from './collections/Portfolio'
import { PortfolioCategories } from './collections/PortfolioCategories'
import { Posts } from './collections/Posts'
import { Redirects } from './collections/Redirects'
import { Reviews } from './collections/Reviews'
import { ServiceGroups } from './collections/ServiceGroups'
import { Services } from './collections/Services'
import { Subscribers } from './collections/Subscribers'
import { Tags } from './collections/Tags'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { ChatbotSettings } from './globals/ChatbotSettings'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Home } from './globals/Home'
import { LeadForms } from './globals/LeadForms'
import { Newsletter } from './globals/Newsletter'
import { indexKnowledge } from './jobs/chatbot'
import { newsletterTasks } from './jobs/newsletter'
import { SiteSettings } from './globals/SiteSettings'
import { SiteText } from './globals/SiteText'
import { Stats } from './globals/Stats'
import { isEmailConfigured } from './lib/email/config'
import { env } from './lib/env'
import { absoluteUrl, collectionPaths } from './lib/paths'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Page-like collections that get the SEO tab (meta title/description/image, focus keyword, canonical, noindex).
const seoCollections = [
  'pages',
  'services',
  'industries',
  'locations',
  'posts',
  'portfolio',
  'categories',
  'authors',
]

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '– Pentox CMS',
      description: 'Pentox Studio content management',
      defaultOGImageType: 'off',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/favicon.png' }],
    },
    components: {
      beforeDashboard: ['/components/admin/LeadsDashboard#LeadsDashboard'],
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
    },
  },
  // Sidebar group order follows the first collection of each group:
  // Content → Leads & Audience → Media → Settings (globals are listed after).
  collections: [
    // Content
    Pages,
    Services,
    ServiceGroups,
    Industries,
    Locations,
    Posts,
    Categories,
    Tags,
    Authors,
    Faqs,
    Portfolio,
    PortfolioCategories,
    Clients,
    Testimonials,
    Reviews,
    Badges,
    Packages,
    EstimatorRules,
    // Leads & audience
    Leads,
    Subscribers,
    Campaigns,
    CampaignDeliveries,
    ChatSessions,
    // Media
    Media,
    // Settings
    Users,
    Redirects,
    KnowledgeChunks,
    ChatbotUsage,
  ],
  globals: [Home, Stats, SiteSettings, SiteText, LeadForms, Newsletter, Header, Footer, ChatbotSettings],
  editor: lexicalEditor(),
  // SMTP from .env. Without it no adapter is set and src/lib/email skips sending (leads are still saved).
  email: isEmailConfigured()
    ? nodemailerAdapter({
        defaultFromAddress: env.EMAIL_FROM!,
        defaultFromName: env.EMAIL_FROM_NAME ?? 'Pentox Studio',
        // Do not probe the SMTP server on every start (CLI scripts, builds); send failures are handled per lead.
        skipVerify: true,
        transportOptions: {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT ?? 587,
          secure: (env.SMTP_PORT ?? 587) === 465,
          auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
        },
      })
    : undefined,
  secret: env.PAYLOAD_SECRET,
  telemetry: false,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: { fileSize: 10_000_000 },
  },
  // Powers scheduled publish/unpublish (and the newsletter/indexing jobs in later phases).
  jobs: {
    // Every minute: scheduled publishing, newsletter batches and the campaign scheduler.
    autoRun: [{ cron: '* * * * *', limit: 10, queue: 'default' }],
    tasks: [...newsletterTasks, indexKnowledge],
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
    // Schema changes go through migrations (src/migrations), never auto-push.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: seoCollections,
      globals: ['home'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => {
        const name = doc?.title ?? doc?.name ?? doc?.city
        return name ? `${name} | Pentox Studio` : 'Pentox Studio'
      },
      generateDescription: ({ doc }) =>
        doc?.excerpt ?? doc?.shortDescription ?? doc?.summary ?? doc?.intro ?? '',
      generateURL: ({ doc, collectionSlug }) =>
        absoluteUrl(collectionSlug ? collectionPaths[collectionSlug]?.(doc) : '/') ?? '',
      fields: ({ defaultFields }) => [
        ...defaultFields,
        { name: 'focusKeyword', type: 'text', label: 'Focus keyword' },
        {
          name: 'canonicalOverride',
          type: 'text',
          admin: { description: 'Only if this page should point to a different canonical URL.' },
          validate: (value: string | null | undefined) =>
            !value || /^https?:\/\//.test(value) || 'Enter a full URL starting with https://',
        },
        {
          name: 'noindex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hide from search engines (noindex)',
        },
      ],
    }),
  ],
})
