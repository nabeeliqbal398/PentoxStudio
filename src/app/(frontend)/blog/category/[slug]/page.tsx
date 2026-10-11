import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Pagination } from '@/components/blog/Pagination'
import { PostCard } from '@/components/blog/PostCard'
import { CtaBand } from '@/components/sections/CtaBand'
import { PageHero } from '@/components/sections/PageHero'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Section } from '@/components/ui/Section'
import { blogHref, readBlogParams } from '@/lib/blog'
import { getBlogPosts, getCategoryBySlug, getCtaBand, getSiteText, one } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, { page }] = await Promise.all([params, searchParams.then(readBlogParams)])
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return buildMetadata({
    meta: category.meta,
    title: category.title,
    description: category.description,
    path: blogHref(`/blog/category/${category.slug}/`, { page }),
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams.then(readBlogParams)])
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [text, band, result] = await Promise.all([
    getSiteText(),
    getCtaBand(),
    getBlogPosts({ categoryId: category.id, page }),
  ])
  if (page > 1 && page > result.totalPages) notFound()
  const labels = text.blog
  const service = one(category.service)

  return (
    <>
      <Breadcrumbs
        homeLabel={text.common?.home}
        items={[{ label: labels?.breadcrumb || 'Blog', href: '/blog/' }, { label: category.title }]}
      />
      <PageHero eyebrow={labels?.categoryEyebrow} heading={category.title} intro={category.description} />
      <Section className="!pt-0">
        {service && (
          <p className="mb-8 text-center">
            <Link
              className="font-semibold text-accent underline underline-offset-4"
              href={service.path || `/services/${service.slug}/`}
            >
              {service.title}
            </Link>
          </p>
        )}
        {result.docs.length > 0 ? (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.docs.map((post) => (
                <li key={post.id}>
                  <PostCard labels={labels} post={post} />
                </li>
              ))}
            </ul>
            <Pagination
              base={`/blog/category/${category.slug}/`}
              labels={labels}
              page={result.page}
              params={{}}
              totalPages={result.totalPages}
            />
          </>
        ) : (
          labels?.noResults && <p className="text-center text-body">{labels.noResults}</p>
        )}
      </Section>
      <CtaBand band={band} serviceId={service?.id} />
    </>
  )
}
