import 'dotenv/config'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import { contentEditor } from '../lib/editor'
import config from '../payload.config'
import { categoryFor, cleanSlug, duplicateKey, type Entry } from './wp-util'
import { cleanWpHtml } from './wp-html'

// WordPress → Payload blog migration.
//   pnpm migrate:wp --dry-run     fetch + analyse everything, print a summary table, write NOTHING
//   pnpm migrate:wp               import every post as a DRAFT (re-runs skip posts already imported)
//   options: --limit=N  --only=<old-slug>  --replace (delete and re-import posts already imported)
//            --site=https://pentoxstudio.com  --file=capture/03-blog-posts.json  --author="Name"
// Nothing is invented: titles, excerpts, dates, bodies and images all come from the old site.

// ---------------------------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------------------------
const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const option = (name: string) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)

const DRY = flag('dry-run')
const REPLACE = flag('replace')
const LIMIT = Number(option('limit')) || undefined
const ONLY = option('only')
const SITE = (option('site') ?? 'https://pentoxstudio.com').replace(/\/$/, '')
const FILE = option('file') ?? 'capture/03-blog-posts.json'
const AUTHOR_OVERRIDE = option('author')
const SITE_HOST = new URL(SITE).hostname

// ---------------------------------------------------------------------------------------------
// Types and small helpers
// ---------------------------------------------------------------------------------------------
type Fetched = {
  html: string
  link?: string
  dateGmt?: string
  modifiedGmt?: string
  authorName?: string
  coverUrl?: string
  coverAlt?: string
  via: 'rest' | 'page'
}

type Row = {
  old: string
  slug: string
  date: string
  category: string
  words: number | string
  images: number | string
  status: string
  notes: string
}

const log = (...message: unknown[]) => console.log(...message)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

async function http(url: string, accept: string): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: accept, 'User-Agent': 'PentoxMigration/1.0 (+blog import)' },
        signal: AbortSignal.timeout(30_000),
        redirect: 'follow',
      })
      if (response.ok) return response
      lastError = new Error(`HTTP ${response.status}`)
      if (response.status < 500 && response.status !== 429) break
    } catch (error) {
      lastError = error
    }
    await sleep(1500)
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

// ---------------------------------------------------------------------------------------------
// Fetching the old site
// ---------------------------------------------------------------------------------------------
async function fetchPost(entry: Entry): Promise<Fetched> {
  try {
    const url = `${entry.source}${entry.source.includes('?') ? '&' : '?'}_embed=1`
    const posts = (await (await http(url, 'application/json')).json()) as Array<{
      link?: string
      date_gmt?: string
      modified_gmt?: string
      content?: { rendered?: string }
      _embedded?: {
        author?: { name?: string }[]
        'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[]
      }
    }>
    const post = posts[0]
    const html = post?.content?.rendered
    if (!html) throw new Error('REST API returned no body')
    return {
      html,
      link: post.link,
      dateGmt: post.date_gmt,
      modifiedGmt: post.modified_gmt,
      authorName: post._embedded?.author?.[0]?.name,
      coverUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
      coverAlt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text,
      via: 'rest',
    }
  } catch (restError) {
    // Fallback: scrape the public page.
    const html = await (await http(`${SITE}${entry.url}`, 'text/html')).text()
    const { document } = new JSDOM(html).window
    const body = document.querySelector('.entry-content, .post-content, article .elementor-widget-theme-post-content, article')
    if (!body?.innerHTML.trim()) {
      throw new Error(`no body from the REST API (${(restError as Error).message}) or the page`)
    }
    return { html: body.innerHTML, via: 'page' }
  }
}

// ---------------------------------------------------------------------------------------------
// Images → Media
// ---------------------------------------------------------------------------------------------
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_BYTES = 9_000_000

const bare = (host: string) => host.replace(/^www./, '')
const hostAllowed = (host: string) =>
  bare(host) === bare(SITE_HOST) || bare(host).endsWith(`.${bare(SITE_HOST)}`) || host.endsWith('.wp.com')

async function ensureMedia(payload: Payload, sourceUrl: string, alt: string): Promise<number | undefined> {
  let url: URL
  try {
    url = new URL(sourceUrl, `${SITE}/`)
  } catch {
    log(`    ! bad image URL ${sourceUrl}`)
    return undefined
  }
  if (url.protocol !== 'https:' || !hostAllowed(url.hostname)) {
    log(`    ! image skipped (host not allowed): ${url.hostname}`)
    return undefined
  }

  const base = path.basename(url.pathname).replace(/[^A-Za-z0-9._-]+/g, '-')
  const filename = `wp-${createHash('sha1').update(url.pathname).digest('hex').slice(0, 8)}-${base}`.replace(/\.(jpe?g|png|webp|avif)$/i, (ext) => ext.toLowerCase())

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  try {
    const response = await http(url.toString(), 'image/*')
    const type = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (!IMAGE_TYPES.has(type)) {
      log(`    ! image skipped (${type || 'unknown type'} is not supported): ${url.pathname}`)
      return undefined
    }
    let data: Buffer = Buffer.from(await response.arrayBuffer())
    let mimetype = type
    let name = filename
    if (data.length > MAX_BYTES) {
      data = await sharp(data).resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()
      mimetype = 'image/jpeg'
      name = filename.replace(/\.[a-z]+$/i, '.jpg')
    }
    const doc = await payload.create({
      collection: 'media',
      data: { alt: alt.slice(0, 250) },
      file: { data, mimetype, name, size: data.length },
      overrideAccess: true,
    })
    return doc.id
  } catch (error) {
    log(`    ! image failed (${(error as Error).message}): ${url.pathname}`)
    return undefined
  }
}

// ---------------------------------------------------------------------------------------------
// HTML → Lexical
// ---------------------------------------------------------------------------------------------
type LexNode = { type?: string; children?: LexNode[]; text?: string; [key: string]: unknown }

function replaceMarkers(root: { children: LexNode[] }, media: Map<number, number>) {
  const textOf = (node: LexNode): string => (typeof node.text === 'string' ? node.text : (node.children ?? []).map(textOf).join(''))
  root.children = root.children.flatMap((node): LexNode[] => {
    const match = node.type === 'paragraph' ? /^\[\[IMG:(\d+)\]\]$/.exec(textOf(node).trim()) : null
    if (!match) return [node]
    const id = media.get(Number(match[1]))
    // An image that could not be downloaded is simply left out.
    return id === undefined
      ? []
      : [{ type: 'upload', version: 3, format: '', id: createHash('md5').update(`${match[1]}-${id}`).digest('hex').slice(0, 24), relationTo: 'media', value: id, fields: null }]
  })
}

// ---------------------------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------------------------
async function ensureAuthor(payload: Payload, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const existing = await payload.find({ collection: 'authors', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })
  if (existing.docs[0]) return existing.docs[0].id
  const created = await payload.create({
    collection: 'authors',
    data: { name, slug, generateSlug: false },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  return created.id
}

const normalisePath = (value: string) => {
  let out = value.trim()
  if (!out.startsWith('/')) out = `/${out}`
  return out.endsWith('/') ? out : `${out}/`
}

async function ensureRedirect(payload: Payload, from: string, to: string, results: string[]) {
  const source = normalisePath(from)
  if (source === to) return
  const existing = await payload.find({ collection: 'redirects', where: { from: { equals: source } }, limit: 1, depth: 0, overrideAccess: true })
  if (existing.docs[0]) {
    if (existing.docs[0].to !== to) log(`    ! redirect ${source} already exists and points to ${existing.docs[0].to}; left as it is`)
    return
  }
  await payload.create({
    collection: 'redirects',
    data: { from: source, to, statusCode: '301', active: true, note: 'WordPress blog migration' },
    overrideAccess: true,
  })
  results.push(source)
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------
async function main() {
  const file = JSON.parse(fs.readFileSync(path.resolve(FILE), 'utf8')) as { posts: Entry[] }
  let entries = file.posts
  if (ONLY) entries = entries.filter((entry) => entry.slug === ONLY || cleanSlug(entry.slug) === ONLY)
  if (LIMIT) entries = entries.slice(0, LIMIT)
  if (!entries.length) throw new Error('No posts selected.')

  log(`${DRY ? 'DRY RUN (nothing will be written)' : 'IMPORT (posts are created as drafts)'} – ${entries.length} post(s) from ${FILE}, bodies from ${SITE}\n`)

  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.fromEditor({ config: await config, editor: contentEditor })

  // 1. Fetch every body first, so duplicates can be compared and internal links rewritten.
  const fetched = new Map<Entry, Fetched>()
  const failed = new Map<Entry, string>()
  for (const entry of entries) {
    process.stdout.write(`fetching ${entry.slug} … `)
    try {
      fetched.set(entry, await fetchPost(entry))
      log('ok')
    } catch (error) {
      failed.set(entry, (error as Error).message)
      log(`FAILED (${(error as Error).message}) – skipped`)
    }
    await sleep(250)
  }

  // 2. Old path → new path for every post (used to rewrite links inside bodies and to build redirects).
  const groups = new Map<string, Entry[]>()
  for (const entry of entries) groups.set(duplicateKey(entry.slug), [...(groups.get(duplicateKey(entry.slug)) ?? []), entry])

  const keeper = new Map<string, Entry>() // duplicate group → the one post that is imported
  const wordCount = (entry: Entry) => plain(fetched.get(entry)?.html ?? '').split(' ').filter(Boolean).length
  for (const [key, group] of groups) {
    if (group.length < 2) {
      keeper.set(key, group[0])
      continue
    }
    // Keep the most complete post (most words), the newest on a tie; every other URL redirects to it.
    const best = [...group].sort((a, b) => wordCount(b) - wordCount(a) || b.date.localeCompare(a.date))[0]
    keeper.set(key, best)
  }

  const slugOf = (entry: Entry) => (groups.get(duplicateKey(entry.slug))!.length > 1 ? duplicateKey(entry.slug) : cleanSlug(entry.slug))
  const used = new Set<string>()
  const newSlug = new Map<Entry, string>()
  for (const entry of entries) {
    const base = slugOf(entry)
    const isKeeper = keeper.get(duplicateKey(entry.slug)) === entry
    if (!isKeeper) {
      newSlug.set(entry, base) // redirect target = the keeper's slug (same base)
      continue
    }
    let slug = base
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
    used.add(slug)
    newSlug.set(entry, slug)
  }
  const postMap = new Map<string, string>()
  for (const entry of entries) postMap.set(entry.url, `/blog/${newSlug.get(entry)}/`)

  // 3. Lookups used for every post.
  const categories = await payload.find({ collection: 'categories', depth: 0, pagination: false, overrideAccess: true })
  const categoryBySlug = new Map(categories.docs.map((doc) => [doc.slug, doc]))
  const missingCategories = new Set<string>()

  const rows: Row[] = []
  const createdRedirects: string[] = []
  let authorId: number | string | undefined

  for (const entry of entries) {
    const slug = newSlug.get(entry)!
    const to = `/blog/${slug}/`
    const category = categoryFor(entry)
    const row: Row = { old: entry.slug, slug, date: entry.date, category, words: '-', images: '-', status: '', notes: '' }
    rows.push(row)

    const data = fetched.get(entry)
    if (!data) {
      row.status = 'FAILED (not fetched)'
      row.notes = failed.get(entry) ?? ''
      continue
    }

    const isKeeper = keeper.get(duplicateKey(entry.slug)) === entry
    const redirectFrom = [entry.url, data.link ? new URL(data.link).pathname : undefined].filter((value): value is string => Boolean(value))

    if (!isKeeper) {
      row.status = `DUPLICATE → ${to}`
      row.words = wordCount(entry)
      if (!DRY) for (const from of redirectFrom) await ensureRedirect(payload, from, to, createdRedirects)
      continue
    }

    const cleaned = cleanWpHtml(data.html, { title: entry.title, siteHost: SITE_HOST, postMap })
    row.words = cleaned.words
    row.images = cleaned.images.length + (entry.image || data.coverUrl ? 1 : 0)
    row.notes = cleaned.notes.join('; ')
    if (!categoryBySlug.get(category)) missingCategories.add(category)

    const existing = await payload.find({
      collection: 'posts',
      where: { legacyUrl: { equals: entry.url } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })

    if (DRY) {
      row.status = existing.docs[0] ? (REPLACE ? 'WOULD REPLACE' : 'SKIP (already imported)') : 'WOULD CREATE (draft)'
      continue
    }

    if (existing.docs[0] && !REPLACE) {
      row.status = 'SKIP (already imported)'
      for (const from of redirectFrom) await ensureRedirect(payload, from, to, createdRedirects)
      continue
    }
    if (existing.docs[0] && REPLACE) {
      await payload.delete({ collection: 'posts', id: existing.docs[0].id, overrideAccess: true, context: { disableRevalidate: true } })
    }

    // A different post may already use the slug.
    const clash = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true, overrideAccess: true })
    if (clash.docs[0]) {
      row.status = `FAILED (slug "${slug}" is used by another post)`
      continue
    }

    try {
      authorId ??= await ensureAuthor(payload, AUTHOR_OVERRIDE ?? (data.authorName && !/^(admin|administrator|wp-?admin)$/i.test(data.authorName) ? data.authorName : 'Pentox Studio'))

      // Images in the body, then the cover.
      const media = new Map<number, number>()
      for (const [index, image] of cleaned.images.entries()) {
        const id = await ensureMedia(payload, image.src, image.alt || entry.title)
        if (id !== undefined) media.set(index, id)
      }
      const coverUrl = entry.image ?? data.coverUrl
      const coverId = coverUrl ? await ensureMedia(payload, coverUrl, data.coverAlt || entry.title) : undefined

      const lexical = convertHTMLToLexical({ editorConfig, html: `<div>${cleaned.html}</div>`, JSDOM })
      replaceMarkers(lexical.root as unknown as { children: LexNode[] }, media)

      const categoryDoc = categoryBySlug.get(category)
      const publishedAt = data.dateGmt ? `${data.dateGmt}Z` : `${entry.date}T00:00:00.000Z`

      const post = await payload.create({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          title: entry.title,
          slug,
          generateSlug: false,
          excerpt: entry.excerpt?.slice(0, 300),
          coverImage: coverId,
          content: lexical as never,
          categories: categoryDoc ? [categoryDoc.id] : [],
          relatedService: typeof categoryDoc?.service === 'object' ? categoryDoc.service?.id : categoryDoc?.service,
          author: authorId as number,
          publishedAt,
          legacyUrl: entry.url,
          // Keep the old site's dates so the post does not look "updated" on the import day.
          createdAt: publishedAt,
          updatedAt: data.modifiedGmt ? `${data.modifiedGmt}Z` : publishedAt,
        },
      })
      row.status = existing.docs[0] ? 'REPLACED (draft)' : 'CREATED (draft)'
      row.notes = [row.notes, `id ${post.id}`].filter(Boolean).join('; ')
      for (const from of redirectFrom) await ensureRedirect(payload, from, to, createdRedirects)
    } catch (error) {
      row.status = `FAILED (${(error as Error).message.slice(0, 120)})`
    }
    await sleep(150)
  }

  console.table(rows)
  const count = (prefix: string) => rows.filter((row) => row.status.startsWith(prefix)).length
  log(
    `\n${DRY ? 'Would create' : 'Created'}: ${count(DRY ? 'WOULD CREATE' : 'CREATED') + count('REPLACED') + count('WOULD REPLACE')} | skipped (already imported): ${count('SKIP')} | duplicates → redirect: ${count('DUPLICATE')} | failed: ${count('FAILED')}`,
  )
  if (!DRY) log(`Redirects created: ${createdRedirects.length}`)
  if (missingCategories.size) log(`Category slugs not found (run "pnpm seed" first): ${[...missingCategories].join(', ')}`)
  if (DRY) log('Dry run: nothing was written.')
  process.exit(count('FAILED') && !DRY ? 1 : 0)
}

// Top-level await keeps `payload run` alive until the migration has finished.
try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
