import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, isLoggedIn } from '../access'
import { adminGroups } from '../lib/adminGroups'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const webp = { format: 'webp', options: { quality: 82 } } as const

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: adminGroups.media,
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and SEO.' },
    },
  ],
  upload: {
    // Project-root /media (git-ignored).
    staticDir: path.resolve(dirname, '../../media'),
    // No SVG: user-uploaded SVG can carry scripts.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 400, formatOptions: webp },
      { name: 'card', width: 800, formatOptions: webp },
      { name: 'portrait', width: 644, height: 972, position: 'centre', formatOptions: webp },
      { name: 'hero', width: 1600, formatOptions: webp },
      { name: 'og', width: 1200, height: 630, position: 'centre', formatOptions: webp },
    ],
  },
}
