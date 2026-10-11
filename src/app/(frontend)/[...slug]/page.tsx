import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageView } from '@/components/templates/PageView'
import { getPage, getViewer } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string[] }> }

// Single-segment URLs (/about-us/, /contact-us/, /privacy-policy/, ...) are Pages-collection docs.
// Everything else that no other route handles lands here too and renders the branded 404.
// Older URLs listed in the Redirects collection are redirected earlier, by src/proxy.ts.
// Specific routes (/services/, /industries/, later /blog/ ...) take precedence over this one.
const slugOf = (segments: string[]) => (segments.length === 1 ? segments[0] : undefined)

// Nothing is pre-built: each page renders on its first request, then is cached and refreshed by
// the revalidation hooks (or hourly). Drafts never enter this cache (see lib/content.ts).
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = slugOf((await params).slug)
  if (!slug) return {}
  const viewer = await getViewer()
  const page = await getPage(slug, viewer)
  if (!page) return {}
  return buildMetadata({
    meta: page.meta,
    title: page.hero?.heading || page.title,
    description: page.excerpt || page.hero?.intro,
    path: `/${page.slug}/`,
    // The thank-you page is never indexed, and neither is a draft preview.
    noindex: page.template === 'thank-you' || viewer.draft,
  })
}

export default async function CmsPage({ params }: Props) {
  const slug = slugOf((await params).slug)
  if (!slug) notFound()

  const viewer = await getViewer()
  // Draft and unknown pages are 404 for the public; editors in Live Preview can see drafts.
  const page = await getPage(slug, viewer)
  if (!page) notFound()

  return <PageView page={page} path={`/${page.slug}/`} viewer={viewer} />
}
