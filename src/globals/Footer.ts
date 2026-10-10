import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: adminGroups.settings },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('footer')] },
  fields: [
    {
      name: 'brandStrip',
      type: 'group',
      label: 'Brand strip',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'statement', type: 'textarea' },
      ],
    },
    {
      name: 'showServiceGroups',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Grouped service links, built from the Services.' },
    },
    { name: 'showIndustries', type: 'checkbox', defaultValue: true },
    {
      name: 'columns',
      type: 'array',
      label: 'Link columns',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'newsletter',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'text', type: 'text' },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'copyrightText',
      type: 'text',
      admin: { description: '{year} is replaced with the current year.' },
    },
  ],
}
