import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

import { collectionPaths, listingPaths } from '../lib/paths'

// revalidatePath/Tag only work inside a Next.js request. Seed scripts, CLI and background jobs
// run outside one, so failures are logged at debug level instead of breaking the save.
const safely = (payload: Payload, label: string, fn: () => void) => {
  try {
    fn()
  } catch (error) {
    payload.logger.debug(`Skipped revalidation (${label}): ${(error as Error).message}`)
  }
}

const revalidate = (payload: Payload, slug: string, paths: (string | undefined)[]) => {
  const unique = [...new Set([...paths, ...(listingPaths[slug] ?? [])])].filter(Boolean) as string[]
  safely(payload, slug, () => {
    unique.forEach((path) => revalidatePath(path))
    revalidateTag(slug, 'max')
  })
}

type StatusDoc = { _status?: 'draft' | 'published' | null } | null | undefined

// Drafts-enabled docs only affect the public site while published (or when they stop being published).
const isLive = (doc: StatusDoc) => !doc?._status || doc._status === 'published'

export const revalidateAfterChange =
  (slug: string): CollectionAfterChangeHook =>
  ({ doc, previousDoc, req: { payload, context } }) => {
    if (context.disableRevalidate) return doc
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
        revalidateTag(`global:${slug}`, 'max')
      })
    }
    return doc
  }
