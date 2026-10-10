import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header & menu',
  admin: { group: adminGroups.settings },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('header')] },
  fields: [
    {
      name: 'showTopBar',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Phone, email and social icons (taken from Site settings).' },
    },
    {
      name: 'megaMenu',
      type: 'array',
      label: 'Services mega menu',
      admin: { description: 'Groups shown under "Services": Marketing / Design & Media / Development & AI.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'group', type: 'relationship', relationTo: 'service-groups' },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'service', type: 'relationship', relationTo: 'services', required: true },
            { name: 'labelOverride', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Other links',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA button',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}
