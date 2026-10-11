import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'
import { exportLeadsEndpoint } from '../lib/leads/export'

export const leadSources = [
  { label: 'Contact form', value: 'contact-form' },
  { label: 'Pre-footer form', value: 'prefooter-form' },
  { label: 'Free audit', value: 'free-audit' },
  { label: 'Cost estimator', value: 'estimator' },
  { label: 'AI chatbot', value: 'chatbot' },
  { label: 'Book a call', value: 'book-call' },
  { label: 'Manual / other', value: 'manual' },
] as const

// Created by the public lead forms (src/lib/leads/process.ts) through the Local API; never writable by the public.
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'source', 'status', 'services', 'createdAt'],
    group: adminGroups.leads,
    listSearchableFields: ['name', 'email', 'phone', 'company'],
    components: { beforeListTable: ['/components/admin/ExportLeadsButton#ExportLeadsButton'] },
  },
  endpoints: [exportLeadsEndpoint],
  defaultSort: '-createdAt',
  access: {
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', index: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'company', type: 'text' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      index: true,
      options: [...leadSources],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'budget', type: 'text' },
    { name: 'timeline', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'website', type: 'text', admin: { description: 'Site to audit (free-audit requests).' } },
    {
      name: 'estimate',
      type: 'group',
      admin: { description: 'Filled by the cost estimator.' },
      fields: [
        { name: 'service', type: 'relationship', relationTo: 'services' },
        { name: 'selections', type: 'json' },
        { name: 'rangeMin', type: 'number' },
        { name: 'rangeMax', type: 'number' },
        { name: 'currency', type: 'text' },
      ],
    },
    { name: 'chatSession', type: 'relationship', relationTo: 'chat-sessions' },
    {
      name: 'notes',
      type: 'textarea',
      access: { read: isAdminField, update: isAdminField, create: isAdminField },
      admin: { description: 'Internal notes. Admin only.' },
    },
    {
      name: 'attribution',
      type: 'group',
      admin: { description: 'First-touch tracking captured with the form.' },
      fields: [
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
        { name: 'utmTerm', type: 'text' },
        { name: 'utmContent', type: 'text' },
        { name: 'referrer', type: 'text' },
        { name: 'landingPage', type: 'text' },
      ],
    },
    { name: 'submittedPath', type: 'text', admin: { description: 'Page the form was sent from.' } },
    {
      name: 'emailLog',
      type: 'group',
      label: 'Email delivery',
      admin: { description: 'Whether the auto-reply and the team alert went out (set automatically).' },
      fields: [
        { name: 'autoReply', type: 'select', options: ['sent', 'skipped', 'failed'], admin: { readOnly: true } },
        { name: 'alert', type: 'select', options: ['sent', 'skipped', 'failed'], admin: { readOnly: true } },
        { name: 'error', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      // SHA-256 of the visitor IP + server secret, used only for rate limiting. Never exposed over the API.
      name: 'ipHash',
      type: 'text',
      index: true,
      access: { read: () => false, update: () => false },
      admin: { hidden: true },
    },
    {
      name: 'consent',
      type: 'group',
      fields: [
        { name: 'privacyAccepted', type: 'checkbox' },
        { name: 'subscribeRequested', type: 'checkbox' },
      ],
    },
  ],
}
