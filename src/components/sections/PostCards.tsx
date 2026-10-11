import Link from 'next/link'

import { one, toImg } from '@/lib/media'
import type { Post } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })

/** Blog post cards. Hidden when there are no published posts. */
export function PostCards({ posts, heading, id }: { posts: Post[]; heading?: string | null; id: string }) {
  if (!posts.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => {
          const image = toImg(one(post.coverImage), 'card')
          return (
            <li
              className="relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(28,36,75,.08)] transition-shadow focus-within:shadow-soft hover:shadow-soft"
              key={post.id}
            >
              {image && <CmsImage className="aspect-[16/10] w-full object-cover" img={image} sizes="(min-width: 768px) 30vw, 100vw" />}
              <div className="p-5">
                {post.publishedAt && (
                  <time className="text-xs text-muted" dateTime={post.publishedAt}>
                    {dateFormat.format(new Date(post.publishedAt))}
                  </time>
                )}
                <h3 className="mt-1 font-heading text-lg font-semibold text-navy">
                  <Link className="after:absolute after:inset-0 after:content-['']" href={`/blog/${post.slug}/`}>
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && <p className="mt-2 line-clamp-3 text-body">{post.excerpt}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
