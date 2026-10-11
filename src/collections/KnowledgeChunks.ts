import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { adminGroups } from '../lib/adminGroups'

// Chatbot knowledge base. The `embedding vector(384)` column and its HNSW index are added by the
// `knowledge_chunks_embedding` migration (Payload has no native vector field); the indexing job
// (Phase 9) writes it with raw SQL. 384 matches small sentence-embedding models such as
// all-MiniLM-L6-v2 / bge-small. If EMBEDDING_MODEL changes dimension, add a migration.
export const KnowledgeChunks: CollectionConfig = {
  slug: 'knowledge-chunks',
  labels: { singular: 'Knowledge chunk', plural: 'Knowledge chunks' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sourceType', 'chunkIndex', 'indexedAt'],
    group: adminGroups.settings,
    description: 'Managed by the indexing job. Re-indexing replaces these automatically.',
    components: { beforeListTable: ['/components/admin/ReindexButton#ReindexButton'] },
  },
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [{ fields: ['sourceCollection', 'sourceId', 'chunkIndex'], unique: true }],
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Service', value: 'service' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Package', value: 'package' },
        { label: 'Industry', value: 'industry' },
        { label: 'Post', value: 'post' },
        { label: 'Site settings', value: 'site-settings' },
        { label: 'Page', value: 'page' },
      ],
    },
    { name: 'sourceCollection', type: 'text', required: true },
    { name: 'sourceId', type: 'text', required: true, index: true },
    { name: 'url', type: 'text', admin: { description: 'Public page this chunk came from (for citations).' } },
    { name: 'chunkIndex', type: 'number', required: true, defaultValue: 0 },
    { name: 'content', type: 'textarea', required: true },
    { name: 'contentHash', type: 'text', index: true, admin: { description: 'Skips re-embedding unchanged chunks.' } },
    { name: 'embeddingModel', type: 'text' },
    { name: 'indexedAt', type: 'date' },
  ],
}
