import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicWhenTrue } from '../access'
import { sortOrderField } from '../fields/common'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Upwork / Clutch / partner badges.
export const Badges: CollectionConfig = {
  slug: 'badges',
  labels: { singular: 'Badge', plural: 'Badges' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'active', 'sortOrder'], group: adminGroups.content },
  access: {
    read: publicWhenTrue('active'),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('badges')],
    afterDelete: [revalidateAfterDelete('badges')],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'url', type: 'text', admin: { description: 'Link to the profile/listing that proves the badge.' } },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    sortOrderField,
  ],
}
