import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

import { safeLink } from '@/lib/links'
import { one, toImg } from '@/lib/media'
import type { TocItem } from '@/lib/toc'
import type { Author, Service, SiteText } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { NewsletterSignup } from '../newsletter/NewsletterSignup'
import { Cta } from '../ui/Cta'
import { Section } from '../ui/Section'

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
    { name: labels?.shareFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, path: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z' },
    { name: labels?.shareLinkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, path: 'M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zM7.1 20.5H3.6V9h3.5v11.5z' },
    { name: labels?.shareX, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, path: 'M18.2 2.3h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9.1L.9 2.3h7l4.8 6.4 5.5-6.4zm-1.2 18h1.9L7.1 4.2H5.1L17 20.3z' },
    { name: labels?.shareWhatsapp, href: `https://wa.me/?text=${t}%20${u}`, path: null },
  ]
  return (
    <div className="flex flex-wrap items-center gap-3">
      {labels?.share && <p className="font-heading font-semibold text-navy">{labels.share}</p>}
      <ul className="flex gap-2">
        {links.map(({ name, href, path }) => (
          <li key={href}>
            <a
              aria-label={name ?? undefined}
              className="inline-flex size-10 items-center justify-center rounded-full border border-navy/30 text-navy hover:bg-navy hover:text-white"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {path ? (
                <svg aria-hidden="true" className="size-4 fill-current" focusable="false" viewBox="0 0 24 24">
                  <path d={path} />
                </svg>
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

/** Newsletter signup under the article (double opt-in). */
export function NewsletterSlot() {
  return (
    <Section className="max-w-2xl">
      <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)] md:p-8">
        <NewsletterSignup source="blog-post" />
      </div>
    </Section>
  )
}
