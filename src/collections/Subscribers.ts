import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, nobody } from '../access'
import { adminGroups } from '../lib/adminGroups'

const normalizeEmail: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.email && typeof data.email === 'string') {
    return { ...data, email: data.email.trim().toLowerCase() }
  }
  return data
}

// Newsletter audience. Public signup goes through /api/subscribe (Phase 8) with double opt-in;
// there is no public REST create, and subscriber data is never exposed publicly.
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Subscriber', plural: 'Subscribers' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'status', 'source', 'tags', 'createdAt'],
    group: adminGroups.leads,
    listSearchableFields: ['email', 'name'],
  },
  defaultSort: '-createdAt',
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: { beforeValidate: [normalizeEmail] },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'name', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending (not confirmed)', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      index: true,
      defaultValue: 'admin',
      options: [
        { label: 'Footer form', value: 'footer' },
        { label: 'Blog post', value: 'blog-post' },
        { label: 'Popup', value: 'popup' },
        { label: 'CSV import', value: 'import' },
        { label: 'Contact / lead form', value: 'lead-form' },
        { label: 'Added by admin', value: 'admin' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Used to target campaigns, e.g. seo, clients.' },
    },
    { name: 'confirmedAt', type: 'date' },
    { name: 'unsubscribedAt', type: 'date' },
    // Consent evidence
    { name: 'consentAt', type: 'date' },
    { name: 'consentIp', type: 'text' },
    { name: 'userAgent', type: 'text' },
    // Bearer tokens: never readable or writable through the API.
    {
      name: 'confirmToken',
      type: 'text',
      index: true,
      access: { read: nobody, create: nobody, update: nobody },
      admin: { hidden: true },
    },
    {
      name: 'confirmTokenExpires',
      type: 'date',
      access: { read: nobody, create: nobody, update: nobody },
      admin: { hidden: true },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      index: true,
      access: { read: nobody, create: nobody, update: nobody },
      admin: { hidden: true },
    },
  ],
}
