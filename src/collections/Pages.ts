import { slugField, type CollectionConfig, type Field } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { reviewFields } from '../fields/review'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { contentEditor } from '../lib/editor'
import { previewUrl } from '../lib/paths'
import { draftVersions } from '../lib/versions'

const buttonFields: Field[] = [
  { name: 'buttonLabel', type: 'text' },
  { name: 'buttonUrl', type: 'text', admin: { description: 'Site path (e.g. /pricing/) or full URL.' } },
]

// Simple pages: legal pages, About, Contact, Book a call, Thank you, plus the copy of the
// Services and Industries hub pages (slugs "services" and "industries", template "hub").
// The template decides the layout; every block below is optional and hidden when empty.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'template', '_status', 'updatedAt'],
    group: adminGroups.content,
    livePreview: { url: ({ data }) => previewUrl('pages', data) },
    preview: (data) => previewUrl('pages', data),
  },
  versions: draftVersions,
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('pages')],
    afterDelete: [revalidateAfterDelete('pages')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'default',
      options: [
        { label: 'Standard (legal / text page)', value: 'default' },
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'Book a call', value: 'book-a-call' },
        { label: 'Thank you (noindex)', value: 'thank-you' },
        { label: 'Services hub', value: 'services-hub' },
        { label: 'Industries hub', value: 'industries-hub' },
      ],
      admin: { position: 'sidebar', description: 'Controls the page layout.' },
    },
    ...reviewFields,
    { name: 'excerpt', type: 'textarea', admin: { description: 'Short intro; used as the meta description fallback.' } },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'heading', type: 'text', admin: { description: 'The page H1. Falls back to the title.' } },
        { name: 'intro', type: 'textarea' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      editor: contentEditor,
      admin: { description: 'Main body (legal text, About story and mission, ...).' },
    },
    {
      name: 'highlights',
      type: 'group',
      label: 'Highlight cards',
      admin: {
        description:
          'About: values. Services hub: Why Pentox (verifiable points only). Book a call: what we will cover. Thank you: next steps.',
      },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'intro', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'icon', type: 'text', admin: { description: 'lucide-react icon name.' } },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'secondary',
      type: 'group',
      label: 'Second section',
      admin: {
        description:
          'About: office & reach. Services hub: pricing teaser. Contact: booking section intro. Hidden when empty.',
      },
      fields: [{ name: 'heading', type: 'text' }, { name: 'text', type: 'textarea' }, ...buttonFields],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA banner override',
      admin: { description: 'Leave empty to use the site-wide CTA band (Footer settings).' },
      fields: [{ name: 'heading', type: 'text' }, { name: 'text', type: 'textarea' }, ...buttonFields],
    },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
  ],
}
