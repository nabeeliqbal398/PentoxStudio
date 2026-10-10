import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { sortOrderField } from '../fields/common'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'services', 'showOnHome', 'sortOrder'],
    group: adminGroups.content,
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('faqs')],
    afterDelete: [revalidateAfterDelete('faqs')],
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      admin: { description: 'Plain text (also used as the FAQPage schema answer).' },
    },
    { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'industries', type: 'relationship', relationTo: 'industries', hasMany: true },
    {
      name: 'topic',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Process', value: 'process' },
        { label: 'Service-specific', value: 'service' },
      ],
    },
    { name: 'showOnHome', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    sortOrderField,
  ],
}
