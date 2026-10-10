// CMS-supplied URLs end up in href attributes, so only known-safe forms are allowed
// (no javascript:, data:, or protocol-relative URLs).

export type LinkKind = 'internal' | 'external' | 'mailto' | 'tel'

export type SafeLink = { href: string; kind: LinkKind }

export function safeLink(value: string | null | undefined): SafeLink | undefined {
  const href = value?.trim()
  if (!href) return undefined
  if (href.startsWith('/') && !href.startsWith('//')) return { href, kind: 'internal' }
  if (href.startsWith('#')) return { href, kind: 'internal' }
  if (/^https?:\/\//i.test(href)) return { href, kind: 'external' }
  if (/^mailto:/i.test(href)) return { href, kind: 'mailto' }
  if (/^tel:/i.test(href)) return { href, kind: 'tel' }
  return undefined
}

export const safeHref = (value: string | null | undefined): string | undefined =>
  safeLink(value)?.href
