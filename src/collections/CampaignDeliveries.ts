import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'

// One row per (campaign, subscriber). It is the sending ledger: a subscriber with a row is never
// emailed twice for the same campaign, which makes a campaign safe to resume after a crash or restart.
export const CampaignDeliveries: CollectionConfig = {
  slug: 'campaign-deliveries',
  labels: { singular: 'Campaign delivery', plural: 'Campaign deliveries' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'campaign', 'status', 'sentAt', 'error'],
    group: adminGroups.leads,
  },
  defaultSort: '-createdAt',
  access: {
    // Written only by the sending job (Local API); staff can read the log.
    create: () => false,
    read: isAdminOrEditor,
    update: () => false,
    delete: isAdmin,
  },
  indexes: [{ fields: ['campaign', 'subscriber'], unique: true }],
  fields: [
    { name: 'campaign', type: 'relationship', relationTo: 'campaigns', required: true, index: true },
    { name: 'subscriber', type: 'relationship', relationTo: 'subscribers', required: true, index: true },
    { name: 'email', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending (in progress)', value: 'pending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'sentAt', type: 'date' },
    { name: 'error', type: 'text' },
  ],
}
