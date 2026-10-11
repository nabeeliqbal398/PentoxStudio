import type { Endpoint } from 'payload'

import { hasRole } from '../../access'
import { embeddingModel } from './config'

// Admin-only endpoints behind the "Re-index" button (components/admin/ReindexButton.tsx).

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

export const reindexEndpoint: Endpoint = {
  path: '/reindex',
  method: 'post',
  handler: async (req) => {
    if (!hasRole(req.user, 'admin', 'editor')) return json({ error: 'Forbidden' }, 403)
    // Runs on the job queue (checked every minute); the first run downloads the embedding model.
    await req.payload.jobs.queue({ task: 'index-knowledge', input: {}, queue: 'default' })
    return json({ ok: true, queued: true })
  },
}

export const reindexStatusEndpoint: Endpoint = {
  path: '/reindex-status',
  method: 'get',
  handler: async (req) => {
    if (!hasRole(req.user, 'admin', 'editor')) return json({ error: 'Forbidden' }, 403)
    const [chunks, latest, pending] = await Promise.all([
      req.payload.count({ collection: 'knowledge-chunks', overrideAccess: true }),
      req.payload.find({ collection: 'knowledge-chunks', sort: '-indexedAt', limit: 1, depth: 0, overrideAccess: true }),
      req.payload.count({ collection: 'payload-jobs', where: { and: [{ taskSlug: { equals: 'index-knowledge' } }, { hasError: { not_equals: true } }, { completedAt: { exists: false } }] }, overrideAccess: true }).catch(() => ({ totalDocs: 0 })),
    ])
    return json({ chunks: chunks.totalDocs, lastIndexedAt: latest.docs[0]?.indexedAt ?? null, queued: pending.totalDocs, model: embeddingModel() })
  },
}
