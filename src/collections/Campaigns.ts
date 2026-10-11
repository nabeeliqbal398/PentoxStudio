import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'
import { contentEditor } from '../lib/editor'
import {
  campaignAudienceEndpoint,
  campaignSendEndpoint,
  campaignStopEndpoint,
  campaignTestEndpoint,
} from '../lib/newsletter/endpoints'

// Newsletter campaigns. Batched, throttled SMTP sending runs as a Payload job (src/jobs/newsletter.ts,
// src/lib/newsletter/send.ts). The Send test / Send / Stop buttons live in the sidebar (CampaignActions).
export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  labels: { singular: 'Campaign', plural: 'Campaigns' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'audience', 'scheduledAt', 'sentAt'],
    group: adminGroups.leads,
  },
  defaultSort: '-createdAt',
  endpoints: [campaignAudienceEndpoint, campaignTestEndpoint, campaignSendEndpoint, campaignStopEndpoint],
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'actions',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '/components/admin/CampaignActions#CampaignActions' } },
    },
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
    {
      name: 'progress',
      type: 'group',
      admin: { readOnly: true, description: 'Where the send is up to (set by the sending job).' },
      fields: [
        { name: 'cursor', type: 'number', defaultValue: 0, admin: { description: 'ID of the last subscriber handled.' } },
        { name: 'startedAt', type: 'date' },
        { name: 'lockedUntil', type: 'date' },
        { name: 'pausedUntil', type: 'date', admin: { description: 'Set while waiting for the daily sending limit to reset.' } },
        { name: 'lastError', type: 'text' },
      ],
    },
  ],
}
