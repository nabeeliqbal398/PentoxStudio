import { slugField, type CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrStaff } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { contentEditor } from '../lib/editor'
import { previewUrl } from '../lib/paths'
import { draftVersions } from '../lib/versions'

// Simple pages: legal pages (privacy, terms, cookies), About, etc.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: adminGroups.content,
    livePreview: { url: ({ data }) => previewUrl('pages', data) },
    preview: (data) => previewUrl('pages', data),
  },
  versions: draftVersions,
  access: {
    read: publishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange('pages')],
    afterDelete: [revalidateAfterDelete('pages')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'excerpt', type: 'textarea', admin: { description: 'Short intro under the title.' } },
    { name: 'content', type: 'richText', editor: contentEditor, required: true },
  ],
}
