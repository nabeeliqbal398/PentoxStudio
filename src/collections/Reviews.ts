import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicWhenTrue } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Genuine third-party reviews (Google, Clutch, Upwork), entered manually. Review schema only for these.
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'platform', 'rating', 'reviewedAt', 'verified'],
    group: adminGroups.content,
  },
  access: {
    read: publicWhenTrue('verified'),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('reviews')],
    afterDelete: [revalidateAfterDelete('reviews')],
  },
  fields: [
    { name: 'authorName', type: 'text', required: true },
    {
      name: 'platform',
      type: 'select',
      required: true,
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Clutch', value: 'clutch' },
        { label: 'Upwork', value: 'upwork' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'text', type: 'textarea' },
    { name: 'reviewUrl', type: 'text', admin: { description: 'Link to the review on the platform.' } },
    { name: 'reviewedAt', type: 'date' },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Tick only for a review that exists on the platform.' },
    },
  ],
}
