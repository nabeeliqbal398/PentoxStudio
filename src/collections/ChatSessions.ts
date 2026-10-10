import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, nobody } from '../access'
import { adminGroups } from '../lib/adminGroups'

// Chatbot transcripts. Written by /api/chat (Phase 9) via the Local API.
export const ChatSessions: CollectionConfig = {
  slug: 'chat-sessions',
  labels: { singular: 'Chat session', plural: 'Chat sessions' },
  admin: {
    useAsTitle: 'sessionId',
    defaultColumns: ['sessionId', 'messageCount', 'leadCaptured', 'flagged', 'lastMessageAt'],
    group: adminGroups.leads,
  },
  defaultSort: '-lastMessageAt',
  access: {
    create: nobody,
    read: isAdminOrEditor,
    update: nobody,
    delete: isAdmin,
  },
  fields: [
    { name: 'sessionId', type: 'text', required: true, unique: true, index: true },
    { name: 'messageCount', type: 'number', defaultValue: 0 },
    { name: 'leadCaptured', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'flagged',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Set when a prompt-injection or abuse pattern was detected.' },
    },
    { name: 'startedAt', type: 'date' },
    { name: 'lastMessageAt', type: 'date', index: true },
    { name: 'pageUrl', type: 'text' },
    {
      name: 'ipHash',
      type: 'text',
      admin: { description: 'Salted hash for rate limiting. The raw IP is never stored.' },
    },
    { name: 'userAgent', type: 'text' },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
            { label: 'Tool', value: 'tool' },
            { label: 'System', value: 'system' },
          ],
        },
        { name: 'content', type: 'textarea', required: true },
        { name: 'at', type: 'date' },
      ],
    },
  ],
}
