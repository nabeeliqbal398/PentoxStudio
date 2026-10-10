const WORDS_PER_MINUTE = 200

// Collects every text node from a serialized Lexical editor state (including nested blocks).
const collectText = (node: unknown, out: string[]) => {
  if (!node || typeof node !== 'object') return
  const value = node as { text?: unknown; children?: unknown[]; fields?: unknown }
  if (typeof value.text === 'string') out.push(value.text)
  value.children?.forEach((child) => collectText(child, out))
  if (value.fields && typeof value.fields === 'object') {
    Object.values(value.fields).forEach((field) => {
      if (typeof field === 'string') out.push(field)
      else if (Array.isArray(field)) field.forEach((item) => collectText(item, out))
      else collectText(field, out)
    })
  }
}

export const readingTimeMinutes = (content: unknown): number => {
  const parts: string[] = []
  const root = (content as { root?: unknown } | null | undefined)?.root
  collectText(root, parts)
  const words = parts.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
