import { createHash } from 'node:crypto'

// Turning site content into text chunks for the knowledge base. Pure functions (no database, no network).

type LexNode = { type?: string; text?: string; children?: LexNode[]; fields?: Record<string, unknown>; [key: string]: unknown }

/** Flattens a Lexical rich-text value to plain text, one line per block. FAQ / callout / CTA blocks keep their text. */
export function richTextToPlain(value: unknown): string {
  const root = (value as { root?: LexNode } | null | undefined)?.root
  if (!root) return ''
  const lines: string[] = []
  const inline = (node: LexNode): string =>
    typeof node.text === 'string' ? node.text : (node.children ?? []).map(inline).join('')

  const visit = (node: LexNode) => {
    switch (node.type) {
      case 'block': {
        const f = node.fields ?? {}
        const str = (key: string) => (typeof f[key] === 'string' ? (f[key] as string) : '')
        if (f.blockType === 'faq') {
          if (str('heading')) lines.push(str('heading'))
          for (const item of (f.items as { question?: string; answer?: string }[] | undefined) ?? []) {
            lines.push(`Q: ${item.question ?? ''}`, `A: ${item.answer ?? ''}`)
          }
        } else if (f.blockType === 'callout') lines.push([str('title'), str('body')].filter(Boolean).join(': '))
        else if (f.blockType === 'cta') lines.push([str('heading'), str('text')].filter(Boolean).join(' '))
        return
      }
      case 'paragraph':
      case 'heading':
      case 'listitem':
      case 'quote': {
        const text = inline(node).replace(/\s+/g, ' ').trim()
        if (text) lines.push(node.type === 'listitem' ? `- ${text}` : text)
        // nested lists inside list items
        for (const child of node.children ?? []) if (child.type === 'list') visit(child)
        return
      }
      default:
        for (const child of node.children ?? []) visit(child)
    }
  }
  visit(root)
  return lines.join('\n')
}

export type ChunkOptions = { target?: number; max?: number; overlap?: number }

/**
 * Splits text into chunks of roughly `target` characters (never above `max`), breaking at paragraph and sentence
 * boundaries and repeating the last `overlap` characters of a chunk at the start of the next so no fact is cut in half.
 */
export function chunkText(text: string, { target = 700, max = 1000, overlap = 100 }: ChunkOptions = {}): string[] {
  const clean = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  if (!clean) return []
  if (clean.length <= max) return [clean]

  // Units: paragraphs, with over-long ones split into sentences, and over-long sentences split by words.
  const units: string[] = []
  for (const paragraph of clean.split(/\n+/)) {
    if (paragraph.length <= target) {
      units.push(paragraph)
      continue
    }
    for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
      if (sentence.length <= target) units.push(sentence)
      else {
        let piece = ''
        for (const word of sentence.split(' ')) {
          if (piece && piece.length + word.length + 1 > target) {
            units.push(piece)
            piece = word
          } else piece = piece ? `${piece} ${word}` : word
        }
        if (piece) units.push(piece)
      }
    }
  }

  const chunks: string[] = []
  let current = ''
  for (const unit of units) {
    if (current && current.length + unit.length + 1 > target) {
      chunks.push(current)
      const tail = current.slice(-overlap)
      // Start the next chunk at a word boundary inside the overlap.
      current = `${tail.includes(' ') ? tail.slice(tail.indexOf(' ') + 1) : ''} ${unit}`.trim()
    } else current = current ? `${current}\n${unit}` : unit
  }
  if (current) chunks.push(current)
  return chunks.map((chunk) => chunk.slice(0, max))
}

export type KnowledgeSource = {
  sourceType: 'service' | 'faq' | 'package' | 'industry' | 'post' | 'site-settings' | 'page'
  sourceCollection: string
  sourceId: string
  title: string
  url?: string
  text: string
}

export type KnowledgeChunk = {
  sourceType: KnowledgeSource['sourceType']
  sourceCollection: string
  sourceId: string
  title: string
  url?: string
  chunkIndex: number
  /** What is embedded and shown to the model: the title is repeated at the top for context. */
  content: string
  contentHash: string
}

export const hashContent = (...parts: string[]) => createHash('sha1').update(parts.join('\u0000')).digest('hex')

/** All chunks of one source. `salt` (e.g. the embedding model) is mixed into the hash so a model change re-embeds. */
export function chunkSource(source: KnowledgeSource, salt = '', options?: ChunkOptions): KnowledgeChunk[] {
  return chunkText(source.text, options).map((piece, chunkIndex) => {
    const content = `${source.title}\n${piece}`
    return {
      sourceType: source.sourceType,
      sourceCollection: source.sourceCollection,
      sourceId: source.sourceId,
      title: source.title,
      url: source.url,
      chunkIndex,
      content,
      contentHash: hashContent(content, source.url ?? '', salt),
    }
  })
}
