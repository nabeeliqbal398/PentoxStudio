// Safe, minimal formatting for chatbot replies: **bold**, [label](link), bare /paths/ and https links.
// Returns plain data (no HTML), which the widget renders as React elements, so a reply can never inject markup.

export type Piece = { type: 'text' | 'bold' | 'link'; text: string; href?: string }

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|(https:\/\/[^\s<>()]+|\/(?:[a-z0-9][a-z0-9-]*\/)+)/gi

/** Only same-site paths and https links are linkable. */
export function safeHref(value: string): string | undefined {
  const href = value.trim().replace(/[.,;:!?]+$/, '')
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('\\')) return href
  if (/^https:\/\/[^\s]+$/i.test(href)) return href
  return undefined
}

export function inlinePieces(line: string): Piece[] {
  const pieces: Piece[] = []
  let last = 0
  for (const match of line.matchAll(TOKEN)) {
    if (match.index > last) pieces.push({ type: 'text', text: line.slice(last, match.index) })
    if (match[1]) pieces.push({ type: 'bold', text: match[1] })
    else {
      const href = safeHref(match[3] ?? match[4] ?? '')
      if (href) pieces.push({ type: 'link', text: match[2] ?? match[4] ?? href, href })
      else pieces.push({ type: 'text', text: match[0] })
    }
    last = match.index + match[0].length
  }
  if (last < line.length) pieces.push({ type: 'text', text: line.slice(last) })
  return pieces
}

export type Block = { kind: 'p'; pieces: Piece[] } | { kind: 'ul'; items: Piece[][] }

/** Paragraphs and "- " bullet lists. */
export function blocks(text: string): Block[] {
  const out: Block[] = []
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const lineText = raw.trim()
    if (!lineText) continue
    const bullet = /^[-*•]\s+(.*)$/.exec(lineText)
    if (bullet) {
      const last = out[out.length - 1]
      if (last?.kind === 'ul') last.items.push(inlinePieces(bullet[1]))
      else out.push({ kind: 'ul', items: [inlinePieces(bullet[1])] })
    } else out.push({ kind: 'p', pieces: inlinePieces(lineText) })
  }
  return out
}
