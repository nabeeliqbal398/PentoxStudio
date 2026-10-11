import Link from 'next/link'

import { blogHref, fill, type BlogParams } from '@/lib/blog'
import type { SiteText } from '@/payload-types'

const button =
  'rounded-full border-[1.5px] border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white'

/** Previous / next links plus "Page x of y". Links keep the search and category filters. */
export function Pagination({
  base,
  page,
  totalPages,
  params,
  labels,
}: {
  base: string
  page: number
  totalPages: number
  params: BlogParams
  labels?: SiteText['blog']
}) {
  if (totalPages <= 1) return null
  const status = fill(labels?.pageOf, { page, pages: totalPages })
  return (
    <nav aria-label={status || undefined} className="mt-10 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link className={button} href={blogHref(base, { ...params, page: page - 1 })} rel="prev">
          {labels?.previous}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">{status}</p>
      {page < totalPages ? (
        <Link className={button} href={blogHref(base, { ...params, page: page + 1 })} rel="next">
          {labels?.next}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
