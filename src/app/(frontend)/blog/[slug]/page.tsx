import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PostCard } from '@/components/blog/PostCard'
import { AuthorBox, MidCta, NewsletterSlot, RelatedServiceBox, ShareButtons, Toc } from '@/components/blog/PostParts'
import { CtaBand } from '@/components/sections/CtaBand'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { JsonLd } from '@/components/site/JsonLd'
import { CmsImage } from '@/components/ui/CmsImage'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { fill, formatDate } from '@/lib/blog'
import { getCtaBand, getPost, getRelatedPosts, getSiteText, getViewer } from '@/lib/content'
import { one, populated, toImg } from '@/lib/media'
import { absoluteUrl } from '@/lib/paths'
import { blogPostingJsonLd, buildMetadata } from '@/lib/seo'
import { createHeadingIds, extractToc, splitForMidCta } from '@/lib/toc'

type Props = { params: Promise<{ slug: string }> }

// Nothing is pre-built: each post renders on its first request, then is cached and refreshed by the
// revalidation hooks. Drafts never enter this cache (see lib/content.ts).
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const viewer = await getViewer()
  const post = await getPost(slug, viewer)
  if (!post) return {}
  const metadata = buildMetadata({
    meta: post.meta,
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}/`,
    noindex: viewer.draft,
    fallbackImage: one(post.coverImage),
  })
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const viewer = await getViewer()
  // Draft posts are 404 for the public; editors in Live Preview can see them.
  const post = await getPost(slug, viewer)
  if (!post) notFound()

  const categories = populated(post.categories)
  const author = one(post.author)
  const service = one(post.relatedService) ?? one(categories.find((category) => one(category.service))?.service)
  const pickedIds = populated(post.relatedPosts).map((item) => item.id)

  const [text, band, related] = await Promise.all([
    getSiteText(),
    getCtaBand(),
    getRelatedPosts(
      post.id,
      categories.map((category) => category.id),
      pickedIds,
    ),
  ])
  const labels = text.blog
  const path = `/blog/${post.slug}/`
  const cover = toImg(one(post.coverImage), 'hero')

  // One counter hands out heading ids in document order for the TOC, a second one for the rendered body,
  // so the two always agree.
  const toc = extractToc(post.content)
  const bodyIds = createHeadingIds()
  const [firstHalf, secondHalf] = splitForMidCta(post.content)
  const updated = post.updatedAt && post.publishedAt && post.updatedAt.slice(0, 10) > post.publishedAt.slice(0, 10)

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <JsonLd
        data={blogPostingJsonLd({
          headline: post.title,
          description: post.excerpt,
          path,
          image: cover?.src,
          published: post.publishedAt,
          modified: post.updatedAt,
          author: author ? { name: author.name, path: `/blog/author/${author.slug}/` } : undefined,
          section: categories[0]?.title,
          keywords: categories.map((category) => category.title),
        })}
      />
      <Breadcrumbs
        homeLabel={text.common?.home}
        items={[{ label: labels?.breadcrumb || 'Blog', href: '/blog/' }, { label: post.title }]}
      />

      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <header>
          {categories[0] && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">
              <Link href={`/blog/category/${categories[0].slug}/`}>{categories[0].title}</Link>
            </p>
          )}
          <h1 className="font-heading text-3xl font-semibold leading-tight text-navy md:text-5xl">{post.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {author && (
              <span>
                {labels?.by}{' '}
                <Link className="font-medium text-navy hover:text-brand" href={`/blog/author/${author.slug}/`}>
                  {author.name}
                </Link>
              </span>
            )}
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
            {updated && (
              <span>
                {labels?.updated} <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </span>
            )}
            {post.readingTime ? <span>{fill(labels?.readTime, { minutes: post.readingTime })}</span> : null}
          </p>
        </header>

        {cover && (
          <CmsImage
            className="mt-8 h-auto w-full rounded-xl shadow-soft"
            img={cover}
            priority
            sizes="(min-width: 768px) 768px, 100vw"
          />
        )}

        <div className="mt-10">
          <Toc items={toc} labels={labels} />
          <RichText data={firstHalf} headingIds={bodyIds} />
          {secondHalf && (
            <>
              <MidCta labels={labels} />
              <RichText data={secondHalf} headingIds={bodyIds} />
            </>
          )}
        </div>

        <div className="mt-12 space-y-8 border-t border-line/40 pt-8">
          <ShareButtons labels={labels} title={post.title} url={absoluteUrl(path) ?? path} />
          {service && <RelatedServiceBox labels={labels} service={service} />}
          {author && <AuthorBox author={author} labels={labels} />}
        </div>
      </article>

      {related.length > 0 && (
        <Section labelledBy={labels?.relatedPosts ? 'related-posts' : undefined}>
          <div id="related-posts">
            <SectionHeading heading={labels?.relatedPosts} />
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <PostCard labels={labels} post={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <NewsletterSlot />
      <CtaBand band={band} serviceId={service?.id} />
    </>
  )
}
