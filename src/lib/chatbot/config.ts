import { env } from '../env'

// Chatbot settings that come from .env. Values that are still the placeholders from .env.example
// ("your-...") count as "not set", so a half-filled .env never produces confusing errors.

const real = (value: string | undefined): string | undefined =>
  value && !/^your-/i.test(value.trim()) ? value.trim() : undefined

export const DEFAULT_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
/** Dimension of the knowledge_chunks.embedding column (see the knowledge_chunks_embedding migration). */
export const EMBEDDING_DIMENSIONS = 384

export const embeddingModel = () => real(env.EMBEDDING_MODEL) ?? DEFAULT_EMBEDDING_MODEL

export const groqApiKey = () => real(env.GROQ_API_KEY)
export const groqBaseUrl = () => (real(env.GROQ_BASE_URL) ?? 'https://api.groq.com/openai/v1').replace(/\/$/, '')
export const groqModel = (override?: string | null) => real(override ?? undefined) ?? real(env.GROQ_MODEL)

/** The chatbot can only run when a Groq key and a model are available. */
export const groqConfigured = (modelOverride?: string | null) => Boolean(groqApiKey() && groqModel(modelOverride))

// Hard limits that do not depend on the CMS.
export const MAX_INPUT_CHARS = 800
export const MAX_HISTORY_MESSAGES = 8
export const MAX_USER_MESSAGES_PER_SESSION = 40
export const RETRIEVE_TOP_K = 5
/** Cosine similarity below this is treated as "nothing relevant" (then the bot says it is not sure). */
export const MIN_SIMILARITY = 0.2
