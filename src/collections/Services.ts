import {
  slugField,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
  type Where,
} from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { sortOrderField } from '../fields/common'
import { reviewFields } from '../fields/review'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { reindexAfterChange, reindexAfterDelete } from '../lib/chatbot/hooks'
import { contentEditor } from '../lib/editor'
import { previewUrl } from '../lib/paths'
import { draftVersions } from '../lib/versions'

// Stores the public URL path: /services/<slug>/ or /services/<parent>/<slug>/ for sub-services.
const setPath: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const slug = data.slug ?? originalDoc?.slug
  if (!slug) return data

  const parent = data.parent !== undefined ? data.parent : originalDoc?.parent
  const parentId = typeof parent === 'object' && parent ? parent.id : parent

  let path = `/services/${slug}/`
  if (parentId) {
    const parentDoc = await req.payload.findByID({
      collection: 'services',
      id: parentId,
      depth: 0,
      select: { slug: true },
      req,
    })
    if (parentDoc?.slug) path = `/services/${parentDoc.slug}/${slug}/`
  }
  return { ...data, path }
}

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'group', 'parent', '_status', 'needsReview', 'updatedAt'],
    group: adminGroups.content,
    livePreview: { url: ({ data }) => previewUrl('services', data) },
    preview: (data) => previewUrl('services', data),
  },
  versions: draftVersions,
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [setPath],
    afterChange: [revalidateAfterChange('services'), reindexAfterChange('services')],
    afterDelete: [revalidateAfterDelete('services'), reindexAfterDelete('services')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'path',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Public URL path (automatic).' },
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'service-groups',
      index: true,
      admin: { position: 'sidebar', description: 'Mega-menu group.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'services',
      index: true,
      filterOptions: ({ id }) => {
        const and: Where[] = [{ parent: { exists: false } }]
        if (id) and.push({ id: { not_equals: id } })
        return { and }
      },
      admin: { position: 'sidebar', description: 'Set only for sub-services (e.g. Local SEO → SEO).' },
    },
    sortOrderField,
    ...reviewFields,
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      admin: { description: 'Used on service cards, the mega menu and meta fallbacks.' },
    },
    { name: 'cardImage', type: 'upload', relationTo: 'media', admin: { description: 'Card illustration.' } },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', admin: { description: 'Keyword H1. Falls back to the title.' } },
        { name: 'intro', type: 'textarea', admin: { description: 'The problem this service solves.' } },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'trustLine',
          type: 'text',
          admin: { description: 'Real, verifiable proof only. Leave empty to hide.' },
        },
      ],
    },
    {
      name: 'deliverables',
      type: 'array',
      label: "What's included",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'text', admin: { description: 'lucide-react icon name.' } },
      ],
    },
    {
      name: 'approach',
      type: 'group',
      label: 'Our approach',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'intro', type: 'textarea' },
        {
          name: 'steps',
          type: 'array',
          maxRows: 6,
          admin: { description: 'Shown as numbered cards (01–06).' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    {
      name: 'results',
      type: 'relationship',
      relationTo: 'portfolio',
      hasMany: true,
      maxRows: 2,
      admin: { description: '1–2 case-study highlights. Hidden when empty.' },
    },
    {
      name: 'tools',
      type: 'array',
      label: 'Tools & technologies',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true },
    {
      name: 'whyChoose',
      type: 'group',
      label: 'Why choose Pentox',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          admin: { description: 'No unverifiable claims (e.g. "24/7 support", guarantees).' },
          fields: [
            { name: 'icon', type: 'text', admin: { description: 'lucide-react icon name.' } },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA banner',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'text', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
        { name: 'buttonUrl', type: 'text' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'faqs',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      admin: { description: '6–8 recommended. Powers the FAQPage schema.' },
    },
    {
      name: 'longform',
      type: 'richText',
      editor: contentEditor,
      admin: { description: 'Optional long-form body (used by article-style service pages).' },
    },
  ],
}
