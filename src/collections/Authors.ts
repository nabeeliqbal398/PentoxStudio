import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Public author profiles (bio, expertise, socials). Separate from Users so login data stays private.
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Author', plural: 'Authors' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'jobTitle', 'user', 'updatedAt'],
    group: adminGroups.content,
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('authors')],
    afterDelete: [revalidateAfterDelete('authors')],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ useAsSlug: 'name' }),
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Optional: the CMS login for this author.' },
    },
    { name: 'jobTitle', type: 'text' },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'expertise',
      type: 'array',
      fields: [{ name: 'topic', type: 'text', required: true }],
    },
    {
      name: 'socials',
      type: 'group',
      fields: [
        { name: 'linkedin', type: 'text' },
        { name: 'x', type: 'text', label: 'X / Twitter' },
        { name: 'instagram', type: 'text' },
        { name: 'website', type: 'text' },
      ],
    },
  ],
}
