import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { reindexSiteSettings } from '../lib/chatbot/hooks'

// Business details (NAP), social links, booking and analytics IDs. Keep NAP identical everywhere.
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: adminGroups.settings },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('site-settings'), reindexSiteSettings] },
  fields: [
    { name: 'businessName', type: 'text', required: true, defaultValue: 'Pentox Studio' },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { description: 'Display format, e.g. +92 323 578 8660' } },
        {
          name: 'whatsappNumber',
          type: 'text',
          admin: { description: 'Digits only with country code, e.g. 923235788660' },
          validate: (value: string | null | undefined) =>
            !value || /^\d{8,15}$/.test(value) || 'Digits only, with country code.',
        },
      ],
    },
    { name: 'email', type: 'email' },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    {
      name: 'hours',
      type: 'array',
      admin: { description: 'Office hours. Leave empty until confirmed (nothing is shown or marked up).' },
      fields: [
        { name: 'days', type: 'text', required: true, admin: { description: 'e.g. Mon–Fri' } },
        { name: 'opens', type: 'text', required: true, admin: { description: '24h, e.g. 09:00' } },
        { name: 'closes', type: 'text', required: true, admin: { description: '24h, e.g. 18:00' } },
      ],
    },
    {
      name: 'responseTime',
      type: 'text',
      admin: { description: 'e.g. "We reply within one business day". Only state what you can keep.' },
    },
    { name: 'mapEmbedUrl', type: 'text', admin: { description: 'Google Maps embed (iframe src) URL.' } },
    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'X / Twitter', value: 'x' },
            { label: 'TikTok', value: 'tiktok' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'bookingUrl', type: 'text', admin: { description: 'Cal.com or Calendly link (embedded on /book-a-call/).' } },
    {
      name: 'analytics',
      type: 'group',
      admin: { description: 'Loaded only after cookie consent.' },
      fields: [
        { name: 'ga4Id', type: 'text', label: 'GA4 measurement ID' },
        { name: 'gtmId', type: 'text', label: 'GTM container ID' },
        { name: 'clarityId', type: 'text', label: 'Microsoft Clarity ID' },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Colour logo for light backgrounds.' },
    },
    { name: 'logoWhite', type: 'upload', relationTo: 'media', admin: { description: 'White logo for the navy footer.' } },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Fallback social-sharing image (1200×630).' },
    },
  ],
}
