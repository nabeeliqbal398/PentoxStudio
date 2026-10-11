import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Pagination } from '@/components/blog/Pagination'
import { PostCard } from '@/components/blog/PostCard'
import { CtaBand } from '@/components/sections/CtaBand'
import { PageHero } from '@/components/sections/PageHero'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { JsonLd } from '@/components/site/JsonLd'
import { Section } from '@/components/ui/Section'
import { blogHref, readBlogParams } from '@/lib/blog'
import { getAuthorBySlug, getBlogPosts, getCtaBand, getSiteText } from '@/lib/content'
import { safeLink } from '@/lib/links'
import { one, toImg } from '@/lib/media'
import { buildMetadata, personJsonLd } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, { page }] = await Promise.all([params, searchParams.then(readBlogParams)])
  const author = await getAuthorBySlug(slug)
  if (!author) return {}
  return buildMetadata({
    meta: author.meta,
    title: author.name,
    description: author.bio,
    path: blogHref(`/blog/author/${author.slug}/`, { page }),
  })
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams.then(readBlogParams)])
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const [text, band, result] = await Promise.all([
    getSiteText(),
    getCtaBand(),
    getBlogPosts({ authorId: author.id, page }),
  ])
  if (page > 1 && page > result.totalPages) notFound()
  const labels = text.blog
  const photo = toImg(one(author.photo), 'card')
  const path = `/blog/author/${author.slug}/`
  const socials = Object.values(author.socials ?? {}).flatMap((value) => {
    const link = typeof value === 'string' ? safeLink(value) : undefined
    return link?.kind === 'external' ? [link.href] : []
  })
  const expertise = (author.expertise ?? []).map((item) => item.topic)

  return (
    <>
      <JsonLd
        data={personJsonLd({
          name: author.name,
          path,
          jobTitle: author.jobTitle,
          description: author.bio,
          image: photo?.src,
          sameAs: socials,
          knowsAbout: expertise,
        })}
      />
      <Breadcrumbs
        homeLabel={text.common?.home}
        items={[{ label: labels?.breadcrumb || 'Blog', href: '/blog/' }, { label: author.name }]}
      />
      <PageHero
        eyebrow={labels?.authorEyebrow}
        heading={author.name}
        image={photo ? { ...photo, alt: author.name } : undefined}
        intro={[author.jobTitle, author.bio].filter(Boolean).join(' — ')}
      />
      <Section className="!pt-0">
        {(expertise.length > 0 || socials.length > 0) && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {expertise.map((topic) => (
              <span className="rounded-full bg-white px-4 py-1.5 text-sm text-navy shadow-[0_4px_16px_rgba(28,36,75,.08)]" key={topic}>
                {topic}
              </span>
            ))}
            {socials.map((href) => (
              <a
                className="rounded-full border border-navy/30 px-4 py-1.5 text-sm text-navy hover:bg-navy hover:text-white"
                href={href}
                key={href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {new URL(href).hostname.replace(/^www\./, '')}
              </a>
            ))}
          </div>
        )}
        {result.docs.length > 0 ? (
          <>
            {labels?.authorPosts && (
              <h2 className="mb-6 font-heading text-2xl font-semibold text-navy">{labels.authorPosts}</h2>
            )}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.docs.map((post) => (
                <li key={post.id}>
                  <PostCard labels={labels} post={post} />
                </li>
              ))}
            </ul>
            <Pagination base={path} labels={labels} page={result.page} params={{}} totalPages={result.totalPages} />
          </>
        ) : (
          labels?.noResults && <p className="text-center text-body">{labels.noResults}</p>
        )}
      </Section>
      <CtaBand band={band} />
    </>
  )
}
