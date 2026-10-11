import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { sortOrderField } from '../fields/common'
import { reviewFields } from '../fields/review'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { reindexAfterChange, reindexAfterDelete } from '../lib/chatbot/hooks'
import { previewUrl } from '../lib/paths'
import { draftVersions } from '../lib/versions'

export const Industries: CollectionConfig = {
  slug: 'industries',
  labels: { singular: 'Industry', plural: 'Industries' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'needsReview', 'sortOrder', 'updatedAt'],
    group: adminGroups.content,
    livePreview: { url: ({ data }) => previewUrl('industries', data) },
    preview: (data) => previewUrl('industries', data),
  },
  // Drafts so placeholder industries stay hidden until the client approves them.
  // Autosave keeps Live Preview in step with edits.
  versions: draftVersions,
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('industries'), reindexAfterChange('industries')],
    afterDelete: [revalidateAfterDelete('industries'), reindexAfterDelete('industries')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    sortOrderField,
    ...reviewFields,
    { name: 'summary', type: 'textarea', required: true, admin: { description: 'Card text.' } },
    { name: 'icon', type: 'text', admin: { description: 'lucide-react icon name.' } },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'intro', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'challenges',
      type: 'array',
      label: 'Industry challenges',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'recommendedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
  ],
}
