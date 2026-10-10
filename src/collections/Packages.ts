import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicWhenTrue } from '../access'
import { sortOrderField } from '../fields/common'
import { reviewFields } from '../fields/review'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Starter / Growth / Pro "starting from" packages per service. Prices come from here only.
export const Packages: CollectionConfig = {
  slug: 'packages',
  labels: { singular: 'Package', plural: 'Packages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'tier', 'startingFrom', 'active', 'needsReview'],
    group: adminGroups.content,
  },
  defaultSort: 'sortOrder',
  access: {
    // Only active packages are public, so unpriced placeholders never show.
    read: publicWhenTrue('active'),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('packages')],
    afterDelete: [revalidateAfterDelete('packages')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'service', type: 'relationship', relationTo: 'services', required: true, index: true },
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: [
        { label: 'Starter', value: 'starter' },
        { label: 'Growth', value: 'growth' },
        { label: 'Pro', value: 'pro' },
      ],
    },
    {
      name: 'startingFrom',
      type: 'number',
      min: 0,
      admin: { description: '"Starting from" price. Leave empty until the client confirms it.' },
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'PKR', value: 'PKR' },
        { label: 'USD', value: 'USD' },
      ],
    },
    { name: 'priceNote', type: 'text', admin: { description: 'e.g. "per month" or "one-time".' } },
    { name: 'features', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'highlighted', type: 'checkbox', defaultValue: false, admin: { description: 'Show as "Most popular".' } },
    { name: 'ctaLabel', type: 'text' },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Only active packages appear on the site.' },
    },
    sortOrderField,
    ...reviewFields,
  ],
}
