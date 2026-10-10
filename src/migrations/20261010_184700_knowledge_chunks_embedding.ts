import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload has no native pgvector field, so the embedding column lives outside the generated
// schema. The indexing job (Phase 9) writes it with raw SQL. 384 dimensions fit small
// sentence-embedding models (all-MiniLM-L6-v2, bge-small); change it in a new migration if the
// EMBEDDING_MODEL dimension changes.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
  await db.execute(sql`ALTER TABLE "knowledge_chunks" ADD COLUMN IF NOT EXISTS "embedding" vector(384);`)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_hnsw_idx"
    ON "knowledge_chunks" USING hnsw ("embedding" vector_cosine_ops);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "knowledge_chunks_embedding_hnsw_idx";`)
  await db.execute(sql`ALTER TABLE "knowledge_chunks" DROP COLUMN IF EXISTS "embedding";`)
  // The vector extension is left installed on purpose (shared with the initial migration).
}
