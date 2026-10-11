import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { chunkSource, type KnowledgeChunk } from './chunk'
import { embeddingModel } from './config'
import { embedTexts, vectorLiteral } from './embed'
import { collectSources, type SourceFilter } from './sources'

// Keeps the KnowledgeChunks table in step with the published site content.
//  * Only public, published content is read (see sources.ts), so drafts and admin-only data are never indexed.
//  * A chunk is re-embedded only when its text (or the embedding model) changed: its contentHash is written AFTER the
//    vector, so an interrupted run simply redoes the chunks that did not finish.
//  * Content that was unpublished or deleted has its chunks removed.

export type IndexStats = { sources: number; chunks: number; embedded: number; unchanged: number; deleted: number }

const BATCH = 16

type Embedder = (texts: string[]) => Promise<number[][]>

async function setVector(payload: Payload, id: number, vector: number[]) {
  await payload.db.drizzle.execute(sql`UPDATE knowledge_chunks SET embedding = ${vectorLiteral(vector)}::vector WHERE id = ${id}`)
}

export async function reindex(
  payload: Payload,
  only?: SourceFilter,
  { embed = embedTexts, now = () => new Date() }: { embed?: Embedder; now?: () => Date } = {},
): Promise<IndexStats> {
  const model = embeddingModel()
  const stats: IndexStats = { sources: 0, chunks: 0, embedded: 0, unchanged: 0, deleted: 0 }

  const sources = await collectSources(payload, only)
  stats.sources = sources.length
  const wanted = new Map<string, KnowledgeChunk[]>()
  for (const source of sources) wanted.set(`${source.sourceCollection}:${source.sourceId}`, chunkSource(source, model))

  // Existing rows (limited to the affected source when re-indexing one document).
  const existing = await payload.find({
    collection: 'knowledge-chunks',
    where: only
      ? { and: [{ sourceCollection: { equals: only.collection } }, ...(only.id !== undefined && only.collection !== 'site-settings' ? [{ sourceId: { equals: String(only.id) } }] : [])] }
      : undefined,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const rows = new Map(existing.docs.map((row) => [`${row.sourceCollection}:${row.sourceId}:${row.chunkIndex}`, row]))

  // 1. Remove chunks whose source is gone or no longer has that chunk.
  for (const row of existing.docs) {
    const chunks = wanted.get(`${row.sourceCollection}:${row.sourceId}`)
    if (!chunks || row.chunkIndex >= chunks.length) {
      await payload.delete({ collection: 'knowledge-chunks', id: row.id, overrideAccess: true })
      rows.delete(`${row.sourceCollection}:${row.sourceId}:${row.chunkIndex}`)
      stats.deleted += 1
    }
  }

  // 2. Work out which chunks need (re-)embedding.
  const todo: KnowledgeChunk[] = []
  for (const chunks of wanted.values()) {
    for (const chunk of chunks) {
      stats.chunks += 1
      const row = rows.get(`${chunk.sourceCollection}:${chunk.sourceId}:${chunk.chunkIndex}`)
      if (row && row.contentHash === chunk.contentHash && row.embeddingModel === model) stats.unchanged += 1
      else todo.push(chunk)
    }
  }

  // 3. Embed in batches and write text, vector and finally the hash.
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH)
    const vectors = await embed(batch.map((chunk) => chunk.content))
    for (const [n, chunk] of batch.entries()) {
      const key = `${chunk.sourceCollection}:${chunk.sourceId}:${chunk.chunkIndex}`
      const data = {
        title: chunk.title,
        sourceType: chunk.sourceType,
        sourceCollection: chunk.sourceCollection,
        sourceId: chunk.sourceId,
        url: chunk.url,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        contentHash: null as string | null,
      }
      const row = rows.get(key)
      const saved = row
        ? await payload.update({ collection: 'knowledge-chunks', id: row.id, data, overrideAccess: true })
        : await payload.create({ collection: 'knowledge-chunks', data, overrideAccess: true })
      await setVector(payload, saved.id, vectors[n])
      await payload.update({
        collection: 'knowledge-chunks',
        id: saved.id,
        data: { contentHash: chunk.contentHash, embeddingModel: model, indexedAt: now().toISOString() },
        overrideAccess: true,
      })
      stats.embedded += 1
    }
  }
  return stats
}

/** Re-index one document (or drop it from the knowledge base if it is no longer public). */
export const reindexSource = (payload: Payload, collection: SourceFilter['collection'], id: string | number, deps?: Parameters<typeof reindex>[2]) =>
  reindex(payload, { collection, id }, deps)
