import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Pagination } from '@/components/blog/Pagination'
import { PostCard } from '@/components/blog/PostCard'
import { Toolbar } from '@/components/blog/Toolbar'
import { CtaBand } from '@/components/sections/CtaBand'
import { PageHero } from '@/components/sections/PageHero'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DraftPreview } from '@/components/site/DraftPreview'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { blogHref, readBlogParams } from '@/lib/blog'
import {
  getBlogCategories,
  getBlogPosts,
  getCtaBand,
  getFeaturedPost,
  getPage,
  getSiteText,
  getViewer,
} from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

// Copy for the hero lives in the Pages collection (slug "blog", template "Blog hub").
// The page reads ?q= (search), ?category= and ?page= from the URL, so every state is shareable.
// Search and filtered views are noindex and point their canonical at /blog/; /blog/?page=n pages are indexable.
const HUB_SLUG = 'blog'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category, page } = readBlogParams(await searchParams)
  const viewer = await getViewer()
  const [pageDoc, text] = await Promise.all([getPage(HUB_SLUG, viewer), getSiteText()])
  const filtered = Boolean(q || category)
  const metadata = buildMetadata({
    meta: pageDoc?.meta,
    title: pageDoc?.hero?.heading || pageDoc?.title || text.blog?.breadcrumb || undefined,
    description: pageDoc?.excerpt || pageDoc?.hero?.intro,
    path: filtered ? '/blog/' : blogHref('/blog/', { page }),
    noindex: viewer.draft || filtered,
  })
  return { ...metadata, alternates: { ...metadata.alternates, types: { 'application/rss+xml': '/blog/rss.xml' } } }
}

export default async function BlogPage({ searchParams }: Props) {
  const { q, category, page } = readBlogParams(await searchParams)
  const viewer = await getViewer()
  const [pageDoc, text, categories, band] = await Promise.all([
    getPage(HUB_SLUG, viewer),
    getSiteText(),
    getBlogCategories(),
    getCtaBand(),
  ])
  const labels = text.blog
  const active = categories.find((item) => item.category.slug === category)
  const unfiltered = !q && !active
  // The featured post is shown on top of page 1 of the unfiltered blog and left out of the grid.
  const featuredPost = unfiltered ? await getFeaturedPost() : null
  const featured = page === 1 ? featuredPost : null

  const result = await getBlogPosts({
    q,
    categoryId: active?.category.id,
    page,
    excludeId: featuredPost?.id,
  })
  if (page > 1 && page > result.totalPages) notFound()

  const heading = pageDoc?.hero?.heading || pageDoc?.title || labels?.breadcrumb
  const params = { q, category: active?.category.slug ?? undefined }

  return (
    <>
      <DraftPreview banner={text.common?.previewBanner} enabled={viewer.draft} />
      <Breadcrumbs homeLabel={text.common?.home} items={[{ label: labels?.breadcrumb || heading || 'Blog' }]} />
      {heading && <PageHero eyebrow={pageDoc?.hero?.eyebrow} heading={heading} intro={pageDoc?.hero?.intro} />}

      <Section className="!pt-0">
        <Toolbar categories={categories} category={active?.category.slug ?? ''} labels={labels} q={q} />

        {featured && (
          <div className="mb-12">
            <SectionHeading align="left" heading={labels?.featured} />
            <PostCard labels={labels} post={featured} priority />
          </div>
        )}

        {result.docs.length > 0 ? (
          <>
            {unfiltered && page === 1 && labels?.latest && <SectionHeading align="left" heading={labels.latest} />}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.docs.map((post) => (
                <li key={post.id}>
                  <PostCard labels={labels} post={post} />
                </li>
              ))}
            </ul>
            <Pagination base="/blog/" labels={labels} page={result.page} params={params} totalPages={result.totalPages} />
          </>
        ) : (
          !featured && (
            <div className="text-center">
              {labels?.noResults && <p className="text-body">{labels.noResults}</p>}
              {!unfiltered && labels?.clear && (
                <p className="mt-3">
                  <Link className="font-semibold text-accent underline underline-offset-4" href="/blog/">
                    {labels.clear}
                  </Link>
                </p>
              )}
            </div>
          )
        )}
      </Section>

      <CtaBand band={band} override={pageDoc?.cta} />
    </>
  )
}
