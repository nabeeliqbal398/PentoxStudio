import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'
import { contentEditor } from '../lib/editor'

// Newsletter campaigns. Batched SMTP sending runs as a Payload job (Phase 8).
export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  labels: { singular: 'Campaign', plural: 'Campaigns' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'audience', 'scheduledAt', 'sentAt'],
    group: adminGroups.leads,
  },
  defaultSort: '-createdAt',
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'subject', type: 'text', required: true },
    { name: 'preheader', type: 'text' },
    { name: 'content', type: 'richText', editor: contentEditor, required: true },
    { name: 'fromPost', type: 'relationship', relationTo: 'posts', admin: { position: 'sidebar' } },
    {
      name: 'audience',
      type: 'select',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'All active subscribers', value: 'all' },
        { label: 'By tags', value: 'tags' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'audienceTags',
      type: 'text',
      hasMany: true,
      admin: { position: 'sidebar', condition: (data) => data?.audience === 'tags' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'scheduledAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'sentAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'sendTestTo',
      type: 'email',
      admin: { description: 'Address for the "Send test" action.' },
    },
    {
      name: 'stats',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        { name: 'recipients', type: 'number', defaultValue: 0 },
        { name: 'sent', type: 'number', defaultValue: 0 },
        { name: 'failed', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
