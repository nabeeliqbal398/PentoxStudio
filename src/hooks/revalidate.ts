import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

import { collectionPaths, listingPaths } from '../lib/paths'

// Expire immediately (no stale-while-revalidate): an unpublished service or industry must disappear
// from the public site on the next request, not after a background refresh.
const EXPIRE_NOW = { expire: 0 }

// revalidatePath/Tag only work inside a Next.js request. Seed scripts, CLI and background jobs
// run outside one, so failures are logged at debug level instead of breaking the save.
const safely = (payload: Payload, label: string, fn: () => void) => {
  try {
    fn()
  } catch (error) {
    payload.logger.debug(`Skipped revalidation (${label}): ${(error as Error).message}`)
  }
}

// Every public page shows shared data (menus, footer, FAQs, related cards), and tag invalidation does not
// reach the cached pages that rendered it. So a change purges the whole layout: pages are then rebuilt
// lazily on their next visit. Content edits are infrequent, so correctness beats micro-optimising.
const revalidate = (payload: Payload, slug: string, paths: (string | undefined)[]) => {
  const unique = [...new Set([...paths, ...(listingPaths[slug] ?? [])])].filter(Boolean) as string[]
  safely(payload, slug, () => {
    unique.forEach((path) => revalidatePath(path))
    revalidatePath('/', 'layout')
    revalidateTag(slug, EXPIRE_NOW)
  })
}

type StatusDoc = { _status?: 'draft' | 'published' | null } | null | undefined

// Drafts-enabled docs only affect the public site while published (or when they stop being published).
const isLive = (doc: StatusDoc) => !doc?._status || doc._status === 'published'

export const revalidateAfterChange =
  (slug: string): CollectionAfterChangeHook =>
  ({ doc, previousDoc, req: { payload, context, query } }) => {
    if (context.disableRevalidate) return doc
    // Autosave only writes draft versions; it never changes what the public site shows.
    if (query?.autosave === 'true') return doc
    if (isLive(doc) || isLive(previousDoc)) {
      revalidate(payload, slug, [collectionPaths[slug]?.(doc), collectionPaths[slug]?.(previousDoc)])
    }
    return doc
  }

export const revalidateAfterDelete =
  (slug: string): CollectionAfterDeleteHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) revalidate(payload, slug, [collectionPaths[slug]?.(doc)])
    return doc
  }

export const revalidateGlobal =
  (slug: string): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      safely(payload, `global:${slug}`, () => {
        revalidatePath('/', 'layout')
        revalidateTag(`global:${slug}`, EXPIRE_NOW)
      })
    }
    return doc
  }
