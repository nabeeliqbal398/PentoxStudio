import Link from 'next/link'

import { fill, formatDate } from '@/lib/blog'
import { one, populated, toImg } from '@/lib/media'
import type { Post, SiteText } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'

type Labels = NonNullable<SiteText['blog']>

/** Blog post card: cover, category tag, date, title, excerpt, reading time. The whole card is one link. */
export function PostCard({ post, labels, priority }: { post: Post; labels?: Labels | null; priority?: boolean }) {
  const image = toImg(one(post.coverImage), 'card')
  const category = populated(post.categories)[0]
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(28,36,75,.08)] transition-shadow focus-within:shadow-soft hover:shadow-soft">
      {image && (
        <CmsImage
          className="aspect-[16/10] w-full object-cover"
          img={image}
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
        />
      )}
      <div className="flex flex-1 flex-col p-5">
        {category && <p className="text-xs font-semibold uppercase tracking-widest text-brand">{category.title}</p>}
        <h3 className="mt-1 font-heading text-lg font-semibold leading-snug text-navy">
          <Link className="after:absolute after:inset-0 after:content-['']" href={`/blog/${post.slug}/`}>
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-body">{post.excerpt}</p>}
        <p className="mt-auto pt-4 text-xs text-muted">
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          {post.readingTime ? ` · ${fill(labels?.readTime, { minutes: post.readingTime })}` : ''}
        </p>
      </div>
    </article>
  )
}
