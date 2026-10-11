import type { TaskConfig } from 'payload'

import { reindex, reindexSource } from '../lib/chatbot/indexing'
import type { SourceFilter } from '../lib/chatbot/sources'

// index-knowledge: rebuilds the chatbot knowledge base. With no input it re-indexes everything (the admin
// "Re-index" button); with { collection, id } it refreshes one published document or drops it if it was unpublished
// (queued by the publish hooks in lib/chatbot/hooks.ts).
export const indexKnowledge: TaskConfig<'index-knowledge'> = {
  slug: 'index-knowledge',
  label: 'Index the chatbot knowledge base',
  inputSchema: [
    { name: 'collection', type: 'text' },
    { name: 'id', type: 'text' },
  ],
  outputSchema: [
    { name: 'sources', type: 'number' },
    { name: 'chunks', type: 'number' },
    { name: 'embedded', type: 'number' },
    { name: 'deleted', type: 'number' },
  ],
  retries: 1,
  handler: async ({ input, req }) => {
    const stats =
      input.collection && input.id
        ? await reindexSource(req.payload, input.collection as SourceFilter['collection'], input.id)
        : await reindex(req.payload)
    req.payload.logger.info(`Chatbot knowledge indexed: ${JSON.stringify(stats)}`)
    return { output: { sources: stats.sources, chunks: stats.chunks, embedded: stats.embedded, deleted: stats.deleted } }
  },
}
