import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { sortOrderField } from '../fields/common'
import { youtubeUrlField } from '../fields/youtube'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { contentEditor } from '../lib/editor'
import { previewUrl } from '../lib/paths'
import { draftVersions } from '../lib/versions'

export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  labels: { singular: 'Project', plural: 'Portfolio' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'services', 'featured', '_status', 'sortOrder'],
    group: adminGroups.content,
    livePreview: { url: ({ data }) => previewUrl('portfolio', data) },
    preview: (data) => previewUrl('portfolio', data),
  },
  versions: draftVersions,
  defaultSort: 'sortOrder',
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('portfolio')],
    afterDelete: [revalidateAfterDelete('portfolio')],
  },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'Real project name.' } },
    slugField(),
    { name: 'client', type: 'relationship', relationTo: 'clients' },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      index: true,
      admin: { position: 'sidebar', description: 'Used for the portfolio filter pills.' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'portfolio-categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    sortOrderField,
    { name: 'completedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'cardImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Portrait card image (644×972 size is generated).' },
    },
    {
      name: 'deliverables',
      type: 'array',
      label: 'We worked on',
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'challenge', type: 'richText', editor: contentEditor },
    { name: 'solution', type: 'richText', editor: contentEditor },
    {
      name: 'results',
      type: 'array',
      admin: { description: 'Real, verifiable numbers only.' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. +180%' } },
        { name: 'label', type: 'text', required: true, admin: { description: 'e.g. Organic traffic' } },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    youtubeUrlField('videoUrl'),
    { name: 'projectUrl', type: 'text' },
    {
      name: 'testimonial',
      type: 'relationship',
      relationTo: 'testimonials',
      admin: { description: 'Only a real, verified testimonial.' },
    },
    { name: 'toolsUsed', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
  ],
}
