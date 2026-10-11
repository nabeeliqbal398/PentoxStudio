import type { Field, GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { previewPathUrl } from '../lib/paths'

const sectionToggles = [
  ['hero', 'Hero'],
  ['clientLogos', 'Client logo strip'],
  ['services', 'Services'],
  ['stats', 'Stats strip'],
  ['projects', 'Projects carousel'],
  ['results', 'Results (case-study cards)'],
  ['howWeWork', 'How we work'],
  ['industries', 'Industries we serve'],
  ['estimatorTeaser', 'Cost-estimator teaser'],
  ['testimonials', 'Testimonials'],
  ['latestPosts', 'Latest blog posts'],
  ['faq', 'FAQ'],
  ['ctaBand', 'Pre-footer CTA band'],
] as const

const toggleFields: Field[] = sectionToggles.map(([name, label]) => ({
  name,
  type: 'checkbox',
  label,
  defaultValue: true,
}))

const cta = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'label', type: 'text' },
    { name: 'url', type: 'text' },
  ],
})

// The 13 Home sections from capture/07 §6. A section also hides itself when its data is empty.
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home page',
  admin: {
    group: adminGroups.content,
    livePreview: { url: () => previewPathUrl('/') },
  },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('home')] },
  fields: [
    {
      name: 'sections',
      type: 'group',
      label: 'Show / hide sections',
      admin: { description: 'Turn whole sections off. Sections with no data are hidden automatically.' },
      fields: toggleFields,
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'headline', type: 'text' },
        { name: 'highlightWord', type: 'text', admin: { description: 'Word in the headline shown in red.' } },
        { name: 'subheadline', type: 'textarea' },
        cta('primaryCta', 'Primary button'),
        cta('secondaryCta', 'Secondary button'),
        {
          name: 'trustLine',
          type: 'text',
          admin: { description: 'Real numbers only (e.g. "N projects delivered"). Empty = hidden.' },
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'clientsSection',
      type: 'group',
      label: 'Client logos',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'intro', type: 'textarea' },
        { name: 'internationalLabel', type: 'text' },
        { name: 'domesticLabel', type: 'text' },
      ],
    },
    {
      name: 'servicesSection',
      type: 'group',
      label: 'Services section',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'intro', type: 'textarea' },
      ],
    },
    {
      name: 'projectsSection',
      type: 'group',
      label: 'Projects carousel',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'projects', type: 'relationship', relationTo: 'portfolio', hasMany: true },
      ],
    },
    {
      name: 'resultsSection',
      type: 'group',
      label: 'Results',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'projects', type: 'relationship', relationTo: 'portfolio', hasMany: true, maxRows: 3 },
      ],
    },
    {
      name: 'howWeWork',
      type: 'group',
      label: 'How we work',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'steps',
          type: 'array',
          maxRows: 4,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'industriesSection',
      type: 'group',
      label: 'Industries',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'intro', type: 'textarea' },
      ],
    },
    {
      name: 'estimatorTeaser',
      type: 'group',
      label: 'Cost-estimator teaser',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'text', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
      ],
    },
    {
      name: 'testimonialsSection',
      type: 'group',
      label: 'Testimonials',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'testimonials',
          type: 'relationship',
          relationTo: 'testimonials',
          hasMany: true,
          admin: { description: 'Real, verified testimonials only. Section is hidden when none.' },
        },
      ],
    },
    {
      name: 'latestPosts',
      type: 'group',
      label: 'Latest posts',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'count', type: 'number', defaultValue: 3, min: 1, max: 6 },
      ],
    },
    {
      name: 'faqSection',
      type: 'group',
      label: 'FAQ',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
      ],
    },
  ],
}
