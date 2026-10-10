import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { sortOrderField } from '../fields/common'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// The three mega-menu groups: Marketing / Design & Media / Development & AI.
export const ServiceGroups: CollectionConfig = {
  slug: 'service-groups',
  labels: { singular: 'Service group', plural: 'Service groups' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'updatedAt'],
    group: adminGroups.content,
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('service-groups')],
    afterDelete: [revalidateAfterDelete('service-groups')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'description', type: 'textarea' },
    sortOrderField,
  ],
}
