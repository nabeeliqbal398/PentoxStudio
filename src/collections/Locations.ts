import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { contentEditor } from '../lib/editor'
import { previewUrl } from '../lib/paths'
import { simpleDrafts } from '../lib/versions'

// Ready for /locations/<city>/ pages. Nothing is seeded: publish only with real local content.
export const Locations: CollectionConfig = {
  slug: 'locations',
  labels: { singular: 'Location', plural: 'Locations' },
  admin: {
    useAsTitle: 'city',
    defaultColumns: ['city', 'country', '_status', 'updatedAt'],
    group: adminGroups.content,
    preview: (data) => previewUrl('locations', data),
  },
  versions: simpleDrafts,
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('locations')],
    afterDelete: [revalidateAfterDelete('locations')],
  },
  fields: [
    { name: 'city', type: 'text', required: true },
    slugField({ useAsSlug: 'city' }),
    { name: 'country', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'content',
      type: 'richText',
      editor: contentEditor,
      admin: { description: 'Real local content only (thin or duplicate pages hurt SEO).' },
    },
    { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true },
  ],
}
