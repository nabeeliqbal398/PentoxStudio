'use client'

import { useDocumentInfo, useWatchForm } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

// Pre-publish SEO checklist shown at the top of the SEO tab of every page-like document. Everything here is a
// WARNING only: nothing blocks saving or publishing. It re-checks as the editor types.

type Level = 'ok' | 'warn' | 'info'
type Check = { level: Level; text: string }

type LexNode = { type?: string; value?: unknown; fields?: { url?: string; linkType?: string }; children?: LexNode[] }

const isLexical = (value: unknown): value is { root: LexNode } =>
  typeof value === 'object' && value !== null && 'root' in value && (value as { root?: LexNode }).root?.type === 'root'

const IMAGE_KEYS = /^(image|heroImage|coverImage|cardImage|photo|logo|backgroundImage)$/

/** Walks the whole form value: rich text link counts, rich-text image ids and image fields. */
function scan(data: unknown) {
  let internalLinks = 0
  let externalLinks = 0
  let richText = false
  const mediaIds = new Set<number>()

  const visitLexical = (node: LexNode) => {
    if (node.type === 'link' || node.type === 'autolink') {
      const url = node.fields?.url ?? ''
      if (node.fields?.linkType === 'internal' || url.startsWith('/') || url.startsWith('#')) internalLinks += 1
      else if (/^https?:\/\//i.test(url)) {
        // Links to our own domain count as internal.
        try {
          if (new URL(url).host === window.location.host) internalLinks += 1
          else externalLinks += 1
        } catch {
          externalLinks += 1
        }
      }
    }
    if (node.type === 'upload' && typeof node.value === 'number') mediaIds.add(node.value)
    if (node.type === 'upload' && typeof node.value === 'object' && node.value && 'id' in node.value) mediaIds.add((node.value as { id: number }).id)
    node.children?.forEach(visitLexical)
  }

  const visit = (value: unknown, key?: string) => {
    if (isLexical(value)) {
      richText = true
      visitLexical(value.root)
    } else if (Array.isArray(value)) value.forEach((item) => visit(item))
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) visit(v, k)
    } else if (typeof value === 'number' && key && IMAGE_KEYS.test(key)) mediaIds.add(value)
  }
  visit(data)
  return { internalLinks, externalLinks, richText, mediaIds: [...mediaIds] }
}

const get = (data: Record<string, unknown>, path: string[]): unknown => path.reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], data)
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export function SeoChecklist() {
  const { getData } = useWatchForm()
  const { id, collectionSlug } = useDocumentInfo()
  const data = getData() as Record<string, unknown>

  const metaTitle = text(get(data, ['meta', 'title']))
  const metaDescription = text(get(data, ['meta', 'description']))
  const metaImage = get(data, ['meta', 'image'])
  const keyword = text(get(data, ['meta', 'focusKeyword'])).toLowerCase()
  const noindex = Boolean(get(data, ['meta', 'noindex']))
  const title = text(data.title) || text(data.name) || text(data.question)
  const slug = text(data.slug)
  const { internalLinks, richText, mediaIds } = scan(data)
  const mediaKey = mediaIds.join(',')

  const [alt, setAlt] = useState<Check | null>(null)
  const [dup, setDup] = useState<Check[]>([])

  // Alt text of every image used in the content (looked up in Media; fields are required there but can be too short).
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!mediaKey) {
        setAlt(null)
        return
      }
      try {
        const response = await fetch(`/api/media/?where[id][in]=${mediaKey}&depth=0&limit=100`, { credentials: 'include' })
        const result = (await response.json()) as { docs?: { alt?: string; filename?: string }[] }
        const weak = (result.docs ?? []).filter((doc) => !doc.alt || doc.alt.trim().length < 5 || /\.(jpe?g|png|webp|gif|avif)$/i.test(doc.alt))
        setAlt(weak.length ? { level: 'warn', text: `${weak.length} image(s) have missing or very short alt text (${weak.map((doc) => doc.filename).slice(0, 3).join(', ')}). Edit them in Media.` } : { level: 'ok', text: 'All images used here have alt text.' })
      } catch {
        setAlt(null)
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [mediaKey])

  // Another document with the same title or slug.
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!collectionSlug || (!title && !slug)) return
      const found: Check[] = []
      const query = async (field: string, value: string) => {
        const notSelf = id ? `&where[and][1][id][not_equals]=${id}` : ''
        const response = await fetch(
          `/api/${collectionSlug}/?where[and][0][${field}][equals]=${encodeURIComponent(value)}${notSelf}&limit=1&depth=0&draft=true`,
          { credentials: 'include' },
        )
        return response.ok ? ((await response.json()) as { totalDocs?: number }).totalDocs ?? 0 : 0
      }
      try {
        if (title && (await query(data.title !== undefined ? 'title' : data.name !== undefined ? 'name' : 'question', title)) > 0) {
          found.push({ level: 'warn', text: 'Another document has the same title. Duplicate titles confuse search engines.' })
        }
        if (slug && (await query('slug', slug)) > 0) found.push({ level: 'warn', text: 'Another document uses the same URL slug.' })
      } catch {
        // offline or no access: skip the duplicate check
      }
      setDup(found.length ? found : [{ level: 'ok', text: 'Title and slug are unique.' }])
    }, 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, id, collectionSlug])

  const checks: Check[] = []
  if (noindex) checks.push({ level: 'warn', text: 'This page is hidden from search engines (noindex is ticked).' })

  if (!metaTitle) checks.push({ level: 'warn', text: 'No SEO title: the page name will be used. Write one for search results.' })
  else if (metaTitle.length < 30) checks.push({ level: 'warn', text: `SEO title is short (${metaTitle.length} characters). Aim for 30–60.` })
  else if (metaTitle.length > 60) checks.push({ level: 'warn', text: `SEO title is long (${metaTitle.length} characters) and may be cut off. Aim for 30–60.` })
  else checks.push({ level: 'ok', text: `SEO title length is good (${metaTitle.length}).` })

  if (!metaDescription) checks.push({ level: 'warn', text: 'No meta description: search engines will pick text from the page. Aim for 70–160 characters.' })
  else if (metaDescription.length < 70) checks.push({ level: 'warn', text: `Meta description is short (${metaDescription.length} characters). Aim for 70–160.` })
  else if (metaDescription.length > 160) checks.push({ level: 'warn', text: `Meta description is long (${metaDescription.length} characters) and may be cut off. Aim for 70–160.` })
  else checks.push({ level: 'ok', text: `Meta description length is good (${metaDescription.length}).` })

  if (!metaImage) checks.push({ level: 'info', text: 'No social image: the site default is used when the page is shared.' })

  if (keyword) {
    const inTitle = (metaTitle || title).toLowerCase().includes(keyword)
    const inDescription = metaDescription.toLowerCase().includes(keyword)
    checks.push(
      inTitle && inDescription
        ? { level: 'ok', text: 'The focus keyword is in the title and the description.' }
        : { level: 'warn', text: `The focus keyword is missing from the ${!inTitle && !inDescription ? 'title and the description' : !inTitle ? 'title' : 'description'}.` },
    )
  } else checks.push({ level: 'info', text: 'No focus keyword set.' })

  if (richText) {
    checks.push(
      internalLinks > 0
        ? { level: 'ok', text: `${internalLinks} internal link(s) in the content.` }
        : { level: 'warn', text: 'No internal links in the content. Link to a related service, article or page.' },
    )
  }
  if (alt) checks.push(alt)
  checks.push(...dup)

  const warnings = checks.filter((check) => check.level === 'warn').length
  const icon = { ok: '✓', warn: '⚠', info: 'ℹ' }
  const color = { ok: 'var(--theme-success-600, #2e7d32)', warn: 'var(--theme-warning-600, #b26a00)', info: 'inherit' }

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 12, marginBottom: 24 }}>
      <strong>SEO checklist</strong>{' '}
      <span style={{ fontSize: 13 }}>{warnings ? `${warnings} warning${warnings > 1 ? 's' : ''}` : 'looks good'}</span>
      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, fontSize: 13 }}>
        {checks.map((check, index) => (
          <li key={index} style={{ color: color[check.level], margin: '4px 0' }}>
            <span aria-hidden="true">{icon[check.level]}</span> {check.text}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 12, margin: '8px 0 0' }}>These are warnings only. You can still save and publish.</p>
    </div>
  )
}
