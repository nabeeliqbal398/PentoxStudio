import path from 'node:path'

import { EMBEDDING_DIMENSIONS, embeddingModel } from './config'

// Local sentence embeddings with @huggingface/transformers (ONNX, runs on the server CPU). No external
// embedding API is ever called; the model is downloaded once from the Hugging Face hub into .cache/ and reused.

type Extractor = (texts: string[], options: { pooling: 'mean'; normalize: boolean }) => Promise<{ tolist(): number[][] }>

const globalForModel = globalThis as unknown as { __pentoxExtractor?: Map<string, Promise<Extractor>> }

async function load(model: string): Promise<Extractor> {
  const { pipeline, env } = await import('@huggingface/transformers')
  env.cacheDir = path.resolve(process.cwd(), '.cache', 'transformers')
  return (await pipeline('feature-extraction', model)) as unknown as Extractor
}

function extractor(model: string): Promise<Extractor> {
  const cache = (globalForModel.__pentoxExtractor ??= new Map())
  let promise = cache.get(model)
  if (!promise) {
    promise = load(model)
    // A failed load (no network on first run) must not be cached forever.
    promise.catch(() => cache.delete(model))
    cache.set(model, promise)
  }
  return promise
}

/** Normalised embeddings, one 384-number vector per text. Throws if the model has another dimension. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return []
  const model = embeddingModel()
  const run = await extractor(model)
  const vectors = (await run(texts, { pooling: 'mean', normalize: true })).tolist()
  if (vectors[0]?.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `EMBEDDING_MODEL "${model}" produces ${vectors[0]?.length}-dimensional vectors, but the knowledge_chunks column is vector(${EMBEDDING_DIMENSIONS}). Use a 384-dimension model or add a migration.`,
    )
  }
  return vectors
}

/** pgvector text form: [0.1,0.2,...] */
export const vectorLiteral = (vector: number[]) => `[${vector.map((n) => Number(n.toFixed(6))).join(',')}]`
