import { JSDOM } from 'jsdom'

// Turns the HTML body that WordPress (Elementor) returns into a flat list of clean content blocks.
// Pure functions: no network, no database. The caller downloads images and converts the result to Lexical.

export const IMAGE_MARKER = (n: number) => `[[IMG:${n}]]`

export type ImageRef = { src: string; alt: string }

export type CleanResult = {
  /** Clean HTML: headings, paragraphs, lists, quotes, tables; images replaced by [[IMG:n]] paragraphs. */
  html: string
  images: ImageRef[]
  words: number
  /** Things that were dropped (iframes, scripts, a duplicate table of contents, ...), for the report. */
  notes: string[]
}

const BLOCK = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'TABLE', 'BLOCKQUOTE', 'PRE', 'HR', 'FIGURE', 'IMG'])
const DROP = 'script,style,noscript,iframe,form,button,svg,input,select,textarea,nav'

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export function slugFromText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Options = {
  title: string
  /** Old and new site paths: an absolute link to the old site becomes a relative link. */
  siteHost: string
  /** Old post path (/2026/07/slug/) → new path (/blog/slug/). */
  postMap: Map<string, string>
}

function rewriteHref(href: string, { siteHost, postMap }: Options): string | undefined {
  const raw = href.trim()
  if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return undefined
  if (raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return raw
  let url: URL
  try {
    url = new URL(raw, `https://${siteHost}/`)
  } catch {
    return undefined
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
  if (url.hostname.replace(/^www\./, '') !== siteHost.replace(/^www\./, '')) return url.toString()
  // A link to the old site itself: point at the new blog URL when it is a migrated post; otherwise keep
  // the path (the redirects proxy handles old page URLs).
  const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
  return (postMap.get(path) ?? path) + url.hash
}

export function cleanWpHtml(html: string, options: Options): CleanResult {
  const { document } = new JSDOM(`<body>${html}</body>`).window
  const notes: string[] = []
  const dropped = document.querySelectorAll(DROP)
  if (dropped.length) {
    const counts = new Map<string, number>()
    dropped.forEach((el) => counts.set(el.tagName.toLowerCase(), (counts.get(el.tagName.toLowerCase()) ?? 0) + 1))
    notes.push(`dropped ${[...counts].map(([tag, n]) => `${n}×<${tag}>`).join(' ')}`)
    dropped.forEach((el) => el.remove())
  }

  // 1. Flatten the Elementor wrappers into top-level content blocks.
  const blocks: Element[] = []
  const collect = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (BLOCK.has(child.tagName)) blocks.push(child)
      else collect(child)
    }
  }
  collect(document.body)

  // 2. Images become [[IMG:n]] marker paragraphs (they are downloaded and linked later).
  const images: ImageRef[] = []
  const out: string[] = []
  const pushImages = (block: Element) => {
    const found = block.tagName === 'IMG' ? [block] : Array.from(block.querySelectorAll('img'))
    for (const img of found) {
      const src = img.getAttribute('data-src') || img.getAttribute('src') || ''
      if (!src || src.startsWith('data:')) continue
      images.push({ src, alt: (img.getAttribute('alt') ?? '').trim() })
      out.push(`<p>${IMAGE_MARKER(images.length - 1)}</p>`)
    }
    found.forEach((img) => img.remove())
  }

  let tocDropped = false
  blocks.forEach((original) => {
    let block = original
    pushImages(block)
    if (block.tagName === 'IMG') return

    const text = (block.textContent ?? '').replace(/ /g, ' ').trim()

    // Links: relative where they point at the old site, unsafe ones removed.
    block.querySelectorAll('a').forEach((a) => {
      const next = rewriteHref(a.getAttribute('href') ?? '', options)
      if (next) a.setAttribute('href', next)
      else a.replaceWith(...Array.from(a.childNodes))
    })

    // The manual "Table of Contents" (heading/bold line + list of #anchors) duplicates the generated one.
    if (/^table of contents$/i.test(text)) {
      tocDropped = true
      notes.push('dropped in-body table of contents')
      return
    }
    if ((block.tagName === 'UL' || block.tagName === 'OL') && tocDropped === true) {
      const links = Array.from(block.querySelectorAll('a'))
      if (links.length >= 3 && links.every((a) => (a.getAttribute('href') ?? '').startsWith('#'))) {
        tocDropped = false
        return
      }
    }

    if (!text && block.tagName !== 'HR' && !block.querySelector('img')) return // empty paragraph

    // The post's own H1/H2 repeating the title is dropped: the page already shows the title as its H1.
    if (/^H[1-2]$/.test(block.tagName) && !out.some((chunk) => /^<h[2-4]/.test(chunk)) && normalise(text) === normalise(options.title)) {
      notes.push('dropped heading that repeated the title')
      return
    }

    // Our headings are H2-H4 only (the page title is the H1).
    if (block.tagName === 'H1') block = retag(block, 'h2')
    if (block.tagName === 'H5' || block.tagName === 'H6') block = retag(block, 'h4')

    out.push(block.tagName === 'FIGURE' ? figureToHtml(block) : stripAttributes(block))
  })

  const textContent = out.join(' ').replace(/<[^>]+>/g, ' ').replace(/\[\[IMG:\d+\]\]/g, ' ')
  return {
    html: out.join('\n'),
    images,
    words: textContent.split(/\s+/).filter(Boolean).length,
    notes,
  }
}

function retag(el: Element, tag: string): Element {
  const next = el.ownerDocument.createElement(tag)
  next.innerHTML = el.innerHTML
  return next
}

/** A figure keeps only its caption (the image itself was already pulled out). */
function figureToHtml(figure: Element): string {
  const caption = figure.querySelector('figcaption')?.textContent?.trim()
  return caption ? `<p><em>${escapeHtml(caption)}</em></p>` : ''
}

const KEEP_ATTRS: Record<string, string[]> = { A: ['href'], TD: ['colspan', 'rowspan'], TH: ['colspan', 'rowspan'] }

/** Serialises a block with only the attributes that matter (href, table spans): no WordPress classes or styles. */
function stripAttributes(block: Element): string {
  const clone = block.cloneNode(true) as Element
  // Headings nested in other blocks follow the same H2-H4 rule.
  clone.querySelectorAll('h1,h5,h6').forEach((h) => h.replaceWith(retag(h, h.tagName === 'H1' ? 'h2' : 'h4')))
  const strip = (el: Element) => {
    const keep = KEEP_ATTRS[el.tagName] ?? []
    for (const attr of Array.from(el.attributes)) if (!keep.includes(attr.name)) el.removeAttribute(attr.name)
    Array.from(el.children).forEach(strip)
  }
  strip(clone)
  return clone.outerHTML
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
