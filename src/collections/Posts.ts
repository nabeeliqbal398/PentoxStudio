import {
  slugField,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
} from 'payload'

import {
  hasRole,
  isAdminOrEditor,
  isLoggedIn,
  publishedOrOwn,
  staffOrOwn,
} from '../access'
import { readingTimeMinutes } from '../hooks/readingTime'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { adminGroups } from '../lib/adminGroups'
import { createDraftFromPost } from '../lib/newsletter/draft'
import { postNewsletterDraftEndpoint } from '../lib/newsletter/endpoints'
import { contentEditor } from '../lib/editor'
import { previewUrl } from '../lib/paths'
import { draftVersions } from '../lib/versions'

// Remember who created the post (authors may only edit their own).
const setCreatedBy: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user) return { ...data, createdBy: req.user.id }
  return data
}

// Authors write; admins/editors publish. An author's attempt to publish is saved as a draft.
const authorsCannotPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (req.user && !hasRole(req.user, 'admin', 'editor') && data._status === 'published') {
    return { ...data, _status: 'draft' }
  }
  return data
}

const setReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  if (data.content) return { ...data, readingTime: readingTimeMinutes(data.content) }
  return data
}

const setPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data._status === 'published' && !data.publishedAt) {
    return { ...data, publishedAt: new Date().toISOString() }
  }
  return data
}

// The sidebar checkbox "create a newsletter draft on first publish". It only ever creates a DRAFT campaign for
// an editor to review; nothing is sent automatically.
const newsletterDraftOnFirstPublish: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (doc.notifySubscribers && doc._status === 'published' && previousDoc?._status !== 'published' && !req.context.skipNewsletter) {
    const result = await createDraftFromPost(req.payload, doc.id)
    if (!result.ok) req.payload.logger.warn(`Newsletter draft for post ${doc.id} not created: ${result.error}`)
  }
  return doc
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'categories', '_status', 'publishedAt', 'updatedAt'],
    group: adminGroups.content,
    livePreview: { url: ({ data }) => previewUrl('posts', data) },
    preview: (data) => previewUrl('posts', data),
  },
  versions: draftVersions,
  defaultSort: '-publishedAt',
  endpoints: [postNewsletterDraftEndpoint],
  access: {
    read: publishedOrOwn,
    create: isLoggedIn,
    update: staffOrOwn,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [setCreatedBy, authorsCannotPublish, setReadingTime, setPublishedAt],
    afterChange: [revalidateAfterChange('posts'), newsletterDraftOnFirstPublish],
    afterDelete: [revalidateAfterDelete('posts')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'Max 300 characters. Used on cards and as the meta description fallback.' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', editor: contentEditor, required: true },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        position: 'sidebar',
        description: 'Shows the "Related service" box. Falls back to the category’s service.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Set automatically on first publish. Keep the original date for migrated posts.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true, description: 'Minutes (automatic).' },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'relatedPosts', type: 'relationship', relationTo: 'posts', hasMany: true },
    {
      name: 'newsletterDraft',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '/components/admin/PostNewsletterButton#PostNewsletterButton' } },
    },
    {
      name: 'notifySubscribers',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Creates a newsletter draft on first publish. Never sends automatically.',
      },
    },
    {
      name: 'legacyUrl',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Old WordPress path, e.g. /2026/09/my-post/ (redirects to the new URL).',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      access: { update: () => false },
      admin: { position: 'sidebar', readOnly: true, hidden: true },
    },
  ],
}
