import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publicWhenTrue } from '../access'
import { sortOrderField } from '../fields/common'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'permissionConfirmed', 'featured', 'sortOrder'],
    group: adminGroups.content,
  },
  access: {
    // Logos are public only once the client has given permission.
    read: publicWhenTrue('permissionConfirmed'),
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('clients')],
    afterDelete: [revalidateAfterDelete('clients')],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
    {
      name: 'permissionConfirmed',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Tick only when the client agreed to show their name/logo publicly.' },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    sortOrderField,
  ],
}
