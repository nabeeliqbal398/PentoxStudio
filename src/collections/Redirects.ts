import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'

// Old URL → new URL. Lookup/enforcement (proxy) is added with the public pages in Phase 4.
const normalize: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  const next = { ...data }
  if (typeof next.from === 'string') {
    let from = next.from.trim()
    if (!from.startsWith('/')) from = `/${from}`
    if (!from.endsWith('/') && !from.includes('?')) from = `${from}/`
    next.from = from
  }
  if (typeof next.to === 'string') next.to = next.to.trim()
  return next
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'statusCode', 'active'],
    group: adminGroups.settings,
    listSearchableFields: ['from', 'to'],
  },
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: { beforeValidate: [normalize] },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: string | null | undefined) =>
        (typeof value === 'string' && value.trim().length > 0) || 'Enter the old path, e.g. /seo/',
      admin: { description: 'Old path with trailing slash, e.g. /seo/' },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'New path (/services/seo/) or a full URL.' },
    },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { label: '301 – permanent', value: '301' },
        { label: '302 – temporary', value: '302' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    { name: 'note', type: 'text' },
  ],
}
