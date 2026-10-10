import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { sortOrderField } from '../fields/common'
import { adminGroups } from '../lib/adminGroups'

export const PortfolioCategories: CollectionConfig = {
  slug: 'portfolio-categories',
  labels: { singular: 'Portfolio category', plural: 'Portfolio categories' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'sortOrder'], group: adminGroups.content },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [{ name: 'title', type: 'text', required: true }, slugField(), sortOrderField],
}
