import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { sortOrderField } from '../fields/common'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Blog categories mirror the services (capture/07 §9), so posts link to their service page.
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'sortOrder'],
    group: adminGroups.content,
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('categories')],
    afterDelete: [revalidateAfterDelete('categories')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'description', type: 'textarea' },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: { description: 'The service this category mirrors (for related-service links).' },
    },
    sortOrderField,
  ],
}
