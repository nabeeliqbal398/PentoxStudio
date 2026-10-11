const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' })

export const formatDate = (value?: string | null) => (value ? dateFormat.format(new Date(value)) : '')

/** Fills "{minutes} min read" style labels from the CMS. */
export const fill = (template: string | null | undefined, values: Record<string, string | number>) =>
  template
    ? Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template)
    : ''

export type BlogParams = { q?: string; category?: string; page?: number }

/** Blog listing URL for a set of filters (the URL is the state: shareable, back-button friendly). */
export function blogHref(base: string, { q, category, page }: BlogParams): string {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  if (page && page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

/** Reads ?q, ?category and ?page from Next's searchParams (first value only, sanitised). */
export function readBlogParams(search: Record<string, string | string[] | undefined>): {
  q: string
  category: string
  page: number
} {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? ''
  const page = Number.parseInt(first(search.page), 10)
  return {
    q: first(search.q).trim().slice(0, 100),
    category: first(search.category).trim().slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
  }
}
