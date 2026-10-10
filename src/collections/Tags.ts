import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: { useAsTitle: 'title', group: adminGroups.content },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [{ name: 'title', type: 'text', required: true }, slugField()],
}
