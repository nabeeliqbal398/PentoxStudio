import Link from 'next/link'

import { blogHref } from '@/lib/blog'
import type { BlogCategory } from '@/lib/content'
import type { SiteText } from '@/payload-types'

const pill = 'inline-block rounded-full border-2 px-6 py-2 text-sm font-medium transition-colors'
const idle = 'border-line/70 text-muted hover:border-brand hover:text-brand'
const active = 'border-brand text-brand'

/** Search box (a plain GET form, so it works without JavaScript) and category pills. */
export function Toolbar({
  q,
  category,
  categories,
  labels,
}: {
  q: string
  category: string
  categories: BlogCategory[]
  labels?: SiteText['blog']
}) {
  return (
    <div className="mb-10 space-y-6">
      <form action="/blog/" className="mx-auto flex max-w-xl gap-2" role="search">
        {category && <input name="category" type="hidden" value={category} />}
        <label className="sr-only" htmlFor="blog-search">
          {labels?.searchLabel}
        </label>
        <input
          className="min-w-0 flex-1 rounded-full border border-line/60 bg-white px-5 py-3 text-body placeholder:text-muted focus:border-navy focus:outline-none"
          defaultValue={q}
          id="blog-search"
          maxLength={100}
          name="q"
          placeholder={labels?.searchPlaceholder ?? undefined}
          type="search"
        />
        <button className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-active" type="submit">
          {labels?.searchButton}
        </button>
      </form>
      {categories.length > 0 && (
        <nav aria-label={labels?.filterLabel ?? undefined}>
          <ul className="flex flex-wrap justify-center gap-3">
            <li>
              <Link
                aria-current={!category ? 'true' : undefined}
                className={`${pill} ${!category ? active : idle}`}
                href={blogHref('/blog/', { q })}
              >
                {labels?.all}
              </Link>
            </li>
            {categories.map(({ category: item }) => (
              <li key={item.id}>
                <Link
                  aria-current={category === item.slug ? 'true' : undefined}
                  className={`${pill} ${category === item.slug ? active : idle}`}
                  href={blogHref('/blog/', { q, category: item.slug ?? undefined })}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
