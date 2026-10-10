import Link from 'next/link'

import { absoluteUrl } from '@/lib/paths'

import { JsonLd } from './JsonLd'

export type Crumb = { label: string; href?: string }

/**
 * Visible breadcrumb trail + BreadcrumbList schema. Pass the trail *after* Home; the last
 * item is the current page. Use on every page except the home page.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-site px-4 pt-4 text-sm text-muted">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: absoluteUrl(item.href) } : {}),
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((item, index) => {
          const last = index === trail.length - 1
          return (
            <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined} className="text-navy">
                  {item.label}
                </span>
              ) : (
                <Link className="hover:text-brand focus-visible:text-brand" href={item.href}>
                  {item.label}
                </Link>
              )}
              {!last && (
                <span aria-hidden="true" className="text-line">
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
