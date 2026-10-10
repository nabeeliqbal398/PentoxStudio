import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'

// Real numbers only. The stats strip is hidden while this list is empty.
export const Stats: GlobalConfig = {
  slug: 'stats',
  label: 'Stats',
  admin: { group: adminGroups.content },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: { afterChange: [revalidateGlobal('stats')] },
  fields: [
    {
      name: 'items',
      type: 'array',
      maxRows: 6,
      admin: { description: 'Only numbers you can back up. Leave empty to hide the strip.' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g. 120+' } },
        { name: 'label', type: 'text', required: true, admin: { description: 'e.g. Projects delivered' } },
        { name: 'source', type: 'text', admin: { description: 'Internal note: where this number comes from.' } },
      ],
    },
  ],
}
