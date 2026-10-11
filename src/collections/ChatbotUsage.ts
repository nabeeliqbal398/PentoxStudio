import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'

// Counters behind the chatbot's limits. One row per bucket: "day:2026-10-11" (replies that day, for the daily cap) and
// "ip:<salted hash>:2026-10-11T14" (messages from one visitor in one hour). Incremented atomically with raw SQL
// (src/lib/chatbot/limits.ts); old rows are purged automatically. No raw IP address is ever stored.
export const ChatbotUsage: CollectionConfig = {
  slug: 'chatbot-usage',
  labels: { singular: 'Chatbot usage counter', plural: 'Chatbot usage counters' },
  admin: {
    useAsTitle: 'bucket',
    defaultColumns: ['bucket', 'count', 'updatedAt'],
    group: adminGroups.settings,
    description: 'Daily reply counts (rows starting "day:") and hourly per-visitor counters used for rate limiting.',
  },
  defaultSort: '-updatedAt',
  access: { create: () => false, read: isAdminOrEditor, update: () => false, delete: isAdmin },
  fields: [
    { name: 'bucket', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
  ],
}
