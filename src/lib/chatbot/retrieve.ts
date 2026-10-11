import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { MIN_SIMILARITY, RETRIEVE_TOP_K } from './config'
import { embedTexts, vectorLiteral } from './embed'

export type RetrievedChunk = {
  id: number
  title: string
  content: string
  url: string | null
  sourceType: string
  /** Cosine similarity, 0..1 (higher is closer). */
  score: number
}

/**
 * The most similar knowledge chunks for a question: pgvector cosine distance on the HNSW index.
 * Chunks below MIN_SIMILARITY are dropped, so an unrelated question retrieves nothing (and the bot says it is not sure).
 */
export async function retrieve(
  payload: Payload,
  query: string,
  { k = RETRIEVE_TOP_K, minScore = MIN_SIMILARITY, embed = embedTexts }: { k?: number; minScore?: number; embed?: (texts: string[]) => Promise<number[][]> } = {},
): Promise<RetrievedChunk[]> {
  const [vector] = await embed([query])
  if (!vector) return []
  const literal = vectorLiteral(vector)
  const result = await payload.db.drizzle.execute(sql`
    SELECT id, title, content, url, source_type AS "sourceType", 1 - (embedding <=> ${literal}::vector) AS score
    FROM knowledge_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${literal}::vector
    LIMIT ${k}
  `)
  return (result.rows as RetrievedChunk[])
    .map((row) => ({ ...row, score: Number(row.score) }))
    .filter((row) => row.score >= minScore)
}
