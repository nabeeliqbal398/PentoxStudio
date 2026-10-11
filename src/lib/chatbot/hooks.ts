import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, Payload } from 'payload'

import type { SourceFilter } from './sources'

// Publish hooks: when indexed content changes, queue a job that refreshes just that document in the knowledge base.
// Only while the chatbot is switched on in the admin, so sites that do not use it never download the embedding model.

type StatusDoc = { _status?: 'draft' | 'published' | null } | null | undefined
const isLive = (doc: StatusDoc) => !doc?._status || doc._status === 'published'

async function queue(payload: Payload, collection: SourceFilter['collection'], id: string) {
  try {
    const settings = await payload.findGlobal({ slug: 'chatbot-settings', depth: 0, overrideAccess: true })
    if (!settings.enabled) return
    await payload.jobs.queue({ task: 'index-knowledge', input: { collection, id }, queue: 'default' })
  } catch (error) {
    payload.logger.warn(`Could not queue chatbot re-indexing: ${(error as Error).message}`)
  }
}

export const reindexAfterChange =
  (collection: SourceFilter['collection']): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    if (req.context.disableRevalidate || req.query?.autosave === 'true') return doc
    if (isLive(doc) || isLive(previousDoc)) await queue(req.payload, collection, String(doc.id))
    return doc
  }

export const reindexAfterDelete =
  (collection: SourceFilter['collection']): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    if (!req.context.disableRevalidate) await queue(req.payload, collection, String(doc.id))
    return doc
  }

export const reindexSiteSettings: GlobalAfterChangeHook = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) await queue(req.payload, 'site-settings', 'site-settings')
  return doc
}
