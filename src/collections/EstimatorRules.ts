import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { reviewFields } from '../fields/review'
import { adminGroups } from '../lib/adminGroups'

// Price rules for the cost estimator wizard. Read server-side only, never exposed over the public API.
export const EstimatorRules: CollectionConfig = {
  slug: 'estimator-rules',
  labels: { singular: 'Estimator rule', plural: 'Estimator rules' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'active', 'needsReview'],
    group: adminGroups.content,
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'service', type: 'relationship', relationTo: 'services', required: true, unique: true },
    {
      name: 'basePrice',
      type: 'number',
      min: 0,
      admin: { description: 'Starting price for this service. Empty until confirmed.' },
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'PKR', value: 'PKR' },
        { label: 'USD', value: 'USD' },
      ],
    },
    {
      name: 'scopeOptions',
      type: 'array',
      label: 'Scope / feature options',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'priceAdd', type: 'number', admin: { description: 'Added to the base price.' } },
      ],
    },
    {
      name: 'timelineOptions',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'multiplier', type: 'number', defaultValue: 1, admin: { description: 'Applied to the total.' } },
      ],
    },
    {
      name: 'rangeSpreadPercent',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'How wide the shown range is around the estimate (e.g. 20 → ±20%).' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Turn on once prices are confirmed.' },
    },
    ...reviewFields,
  ],
}
