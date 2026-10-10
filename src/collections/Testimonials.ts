import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicWhenTrue } from '../access'
import { sortOrderField } from '../fields/common'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Real testimonials only. The Home section is hidden when no verified testimonial exists.
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', 'rating', 'source', 'verified', 'featured'],
    group: adminGroups.content,
  },
  access: {
    read: publicWhenTrue('verified'),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('testimonials')],
    afterDelete: [revalidateAfterDelete('testimonials')],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'rating', type: 'number', min: 1, max: 5 },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Direct from client', value: 'direct' },
        { label: 'Google', value: 'google' },
        { label: 'Clutch', value: 'clutch' },
        { label: 'Upwork', value: 'upwork' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'sourceUrl', type: 'text', admin: { description: 'Link to the original review/message.' } },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Tick only for a genuine testimonial you can show proof of. Unverified ones stay hidden.',
      },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    sortOrderField,
  ],
}
