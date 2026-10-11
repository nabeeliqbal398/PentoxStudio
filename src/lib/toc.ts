import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

// Table of contents + mid-article split for long Lexical bodies (blog posts).

type LexNode = { type?: string; tag?: string; text?: string; children?: LexNode[] }

const textOf = (node: LexNode): string =>
  typeof node.text === 'string' ? node.text : (node.children ?? []).map(textOf).join('')

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section'

/** Hands out unique heading ids in document order ("intro", "intro-2", ...). */
export type HeadingIds = { next: (text: string) => string }

export function createHeadingIds(): HeadingIds {
  const seen = new Map<string, number>()
  return {
    next(text) {
      const base = slugify(text)
      const count = (seen.get(base) ?? 0) + 1
      seen.set(base, count)
      return count === 1 ? base : `${base}-${count}`
    },
  }
}

export type TocItem = { level: 2 | 3; text: string; id: string }

/** H2/H3 headings in order, with the same ids the renderer gives them (use a fresh createHeadingIds()). */
export function extractToc(data: DefaultTypedEditorState | null | undefined, ids = createHeadingIds()): TocItem[] {
  const children = (data?.root?.children ?? []) as LexNode[]
  return children.flatMap((node) => {
    if (node.type !== 'heading') return []
    const text = textOf(node).trim()
    if (!text) return []
    const id = ids.next(text)
    return node.tag === 'h2' || node.tag === 'h3' ? [{ level: node.tag === 'h2' ? (2 as const) : (3 as const), text, id }] : []
  })
}

/**
 * Splits the body for the mid-article CTA: at the heading nearest the middle (so the break never
 * lands inside a section's first paragraph), or at the middle block if there are no headings.
 * Short bodies are not split.
 */
export function splitForMidCta(data: DefaultTypedEditorState): [DefaultTypedEditorState, DefaultTypedEditorState | null] {
  const children = data.root.children as LexNode[]
  if (children.length < 8) return [data, null]
  const middle = Math.floor(children.length / 2)
  let at = middle
  let best = Infinity
  children.forEach((node, index) => {
    if (node.type === 'heading' && index > 2 && index < children.length - 2 && Math.abs(index - middle) < best) {
      best = Math.abs(index - middle)
      at = index
    }
  })
  const part = (items: unknown[]) => ({ ...data, root: { ...data.root, children: items } }) as DefaultTypedEditorState
  return [part(children.slice(0, at)), part(children.slice(at))]
}
