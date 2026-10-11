import { getPayload } from 'payload'

import config from '@payload-config'

// Old URL → new URL map from the Redirects collection, used by src/proxy.ts. The proxy runs on
// every page request, so the map is held in memory and refreshed in the background:
//  - first request loads it, later requests answer from memory,
//  - after TTL_MS the next request still answers from memory and triggers a refresh,
//  - if a refresh fails the previous map keeps being served.
// Edits in the admin therefore take effect within about a minute, with no database query per request.

export type RedirectRule = { to: string; status: 301 | 302 }

const TTL_MS = 60_000

let rules: Map<string, RedirectRule> | undefined
let loadedAt = 0
let loading: Promise<void> | undefined

const normalise = (path: string) => (path.endsWith('/') || path.includes('?') ? path : `${path}/`).toLowerCase()

async function load() {
  const payload = await getPayload({ config })
  const next = new Map<string, RedirectRule>()
  let page = 1
  for (;;) {
    const result = await payload.find({
      collection: 'redirects',
      where: { active: { equals: true } },
      depth: 0,
      limit: 500,
      page,
      overrideAccess: true, // server-side lookup of an admin-only collection
      select: { from: true, to: true, statusCode: true },
    })
    for (const doc of result.docs) {
      if (!doc.from || !doc.to || normalise(doc.from) === normalise(doc.to)) continue // no self-redirects
      next.set(normalise(doc.from), { to: doc.to, status: doc.statusCode === '302' ? 302 : 301 })
    }
    if (!result.hasNextPage) break
    page += 1
  }
  rules = next
  loadedAt = Date.now()
}

function refresh(): Promise<void> {
  loading ??= load()
    .catch((error) => {
      console.error('Could not load redirects:', error instanceof Error ? error.message : error)
      loadedAt = Date.now() // retry after the TTL instead of on every request
    })
    .finally(() => {
      loading = undefined
    })
  return loading
}

export async function findRedirect(pathname: string): Promise<RedirectRule | undefined> {
  if (!rules) await refresh()
  else if (Date.now() - loadedAt > TTL_MS) void refresh()
  return rules?.get(normalise(pathname))
}
