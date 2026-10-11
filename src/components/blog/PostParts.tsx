import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { safeLink } from '@/lib/links'
import { one, toImg } from '@/lib/media'
import type { TocItem } from '@/lib/toc'
import type { Author, Service, SiteText } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { Cta } from '../ui/Cta'

type Labels = NonNullable<SiteText['blog']>

/** "On this page" list built from the post's H2/H3 headings. Hidden for posts with fewer than 3. */
export function Toc({ items, labels }: { items: TocItem[]; labels?: Labels | null }) {
  if (items.length < 3) return null
  return (
    <nav
      aria-label={labels?.toc ?? undefined}
      className="mb-10 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)]"
    >
      {labels?.toc && <p className="mb-3 font-heading font-semibold text-navy">{labels.toc}</p>}
      <ol className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li className={item.level === 3 ? 'ml-4' : ''} key={item.id}>
            <a className="text-body hover:text-brand" href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Share links (no scripts, no trackers): Facebook, LinkedIn, X and WhatsApp. */
export function ShareButtons({ url, title, labels }: { url: string; title: string; labels?: Labels | null }) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    { name: labels?.shareFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, mark: 'f' },
    { name: labels?.shareLinkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, mark: 'in' },
    { name: labels?.shareX, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, mark: 'X' },
    { name: labels?.shareWhatsapp, href: `https://wa.me/?text=${t}%20${u}`, mark: null },
  ]
  return (
    <div className="flex flex-wrap items-center gap-3">
      {labels?.share && <p className="font-heading font-semibold text-navy">{labels.share}</p>}
      <ul className="flex gap-2">
        {links.map(({ name, href, mark }) => (
          <li key={href}>
            <a
              aria-label={name ?? undefined}
              className="inline-flex size-10 items-center justify-center rounded-full border border-navy/30 text-navy hover:bg-navy hover:text-white"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {mark ? (
                <span aria-hidden="true" className="text-sm font-bold">
                  {mark}
                </span>
              ) : (
                <MessageCircle aria-hidden="true" className="size-4" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Author bio box under the article. The name links to the author page. */
export function AuthorBox({ author, labels }: { author: Author; labels?: Labels | null }) {
  const photo = toImg(one(author.photo), 'thumbnail')
  return (
    <aside className="flex gap-4 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)]">
      {photo && <CmsImage className="size-16 shrink-0 rounded-full object-cover" img={{ ...photo, alt: author.name }} />}
      <div>
        {labels?.aboutAuthor && (
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">{labels.aboutAuthor}</p>
        )}
        <p className="mt-1 font-heading text-lg font-semibold text-navy">
          <Link className="hover:text-brand" href={`/blog/author/${author.slug}/`}>
            {author.name}
          </Link>
        </p>
        {author.jobTitle && <p className="text-sm text-muted">{author.jobTitle}</p>}
        {author.bio && <p className="mt-2 text-body">{author.bio}</p>}
      </div>
    </aside>
  )
}

/** The service the post is about, with a link to its page. */
export function RelatedServiceBox({ service, labels }: { service: Service; labels?: Labels | null }) {
  return (
    <aside className="rounded-2xl border border-brand/30 bg-brand/5 p-6">
      {labels?.relatedService && (
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">{labels.relatedService}</p>
      )}
      <p className="mt-1 font-heading text-xl font-semibold text-navy">
        <Link className="hover:text-brand" href={service.path || `/services/${service.slug}/`}>
          {service.title}
        </Link>
      </p>
      <p className="mt-2 text-body">{service.shortDescription}</p>
    </aside>
  )
}

/** The CTA placed in the middle of an article. Hidden unless its heading and button are set in Page labels. */
export function MidCta({ labels }: { labels?: Labels | null }) {
  if (!labels?.midCtaHeading || !safeLink(labels.midCtaUrl)) return null
  return (
    <aside className="my-10 rounded-2xl bg-navy p-6 text-center text-white md:p-8">
      <p className="font-heading text-xl font-semibold md:text-2xl">{labels.midCtaHeading}</p>
      {labels.midCtaText && <p className="mx-auto mt-2 max-w-xl text-white/80">{labels.midCtaText}</p>}
      <div className="mt-4">
        <Cta label={labels.midCtaButton} url={labels.midCtaUrl} />
      </div>
    </aside>
  )
}

/**
 * Placeholder for the newsletter signup form (Phase 8: double opt-in subscribe form). It renders
 * nothing until then, but the post page already reserves its place after the related posts.
 */
export function NewsletterSlot() {
  return null
}
