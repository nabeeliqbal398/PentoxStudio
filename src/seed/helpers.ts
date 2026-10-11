import type { CollectionSlug, GlobalSlug, Payload, Where } from 'payload'

export type SeedContext = {
  payload: Payload
  created: string[]
  skipped: string[]
}

export type Id = number | string

type Options = {
  /** Create as a draft (collections with versions.drafts). Otherwise it is published. */
  draft?: boolean
  label?: string
}

// The seed runs outside a Next request, so skip revalidation hooks.
const context = { disableRevalidate: true }

/**
 * Idempotent create: returns the existing doc's id when `where` matches, otherwise creates it.
 * Existing docs are never overwritten, so editors' changes survive re-running `pnpm seed`.
 */
export async function ensure(
  ctx: SeedContext,
  collection: CollectionSlug,
  where: Where,
  data: Record<string, unknown>,
  { draft = false, label }: Options = {},
): Promise<Id> {
  const name = `${collection}: ${label ?? JSON.stringify(where)}`
  const existing = await ctx.payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    draft: true,
  })
  if (existing.docs[0]) {
    ctx.skipped.push(name)
    return existing.docs[0].id
  }

  const doc = await ctx.payload.create({
    collection,
    data: (draft ? data : { ...data, _status: 'published' }) as never,
    draft,
    context,
    overrideAccess: true,
  })
  ctx.created.push(name)
  return doc.id
}

/** Fills a global only while its marker field is still empty, so edits are never overwritten. */
export async function ensureGlobal(
  ctx: SeedContext,
  slug: GlobalSlug,
  isEmpty: (current: Record<string, unknown>) => boolean,
  data: Record<string, unknown>,
): Promise<void> {
  const current = (await ctx.payload.findGlobal({
    slug,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>

  if (!isEmpty(current)) {
    ctx.skipped.push(`global: ${slug}`)
    return
  }
  await ctx.payload.updateGlobal({ slug, data: data as never, context, overrideAccess: true })
  ctx.created.push(`global: ${slug}`)
}

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Copies `defaults` into `current` only where `current` has no value yet. Returns whether anything changed. */
function fillMissing(current: Record<string, unknown>, defaults: Record<string, unknown>): boolean {
  let changed = false
  for (const [key, value] of Object.entries(defaults)) {
    if (isPlainObject(value)) {
      const existing = isPlainObject(current[key]) ? (current[key] as Record<string, unknown>) : {}
      if (fillMissing(existing, value)) {
        current[key] = existing
        changed = true
      }
    } else if (isEmpty(current[key])) {
      current[key] = value
      changed = true
    }
  }
  return changed
}

/**
 * Adds default values to a global field by field, never replacing anything an editor already
 * entered. Lets later phases add new defaults to a global that was seeded earlier.
 */
export async function fillGlobal(
  ctx: SeedContext,
  slug: GlobalSlug,
  defaults: Record<string, unknown>,
): Promise<void> {
  const current = (await ctx.payload.findGlobal({
    slug,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>

  const data = structuredClone(current)
  if (!fillMissing(data, defaults)) {
    ctx.skipped.push(`global: ${slug} (defaults)`)
    return
  }
  await ctx.payload.updateGlobal({ slug, data: data as never, context, overrideAccess: true })
  ctx.created.push(`global: ${slug} (defaults)`)
}
