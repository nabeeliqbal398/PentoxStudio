import { getFeedPosts, getSiteText } from '@/lib/content'
import { env } from '@/lib/env'
import { populated } from '@/lib/media'

// RSS 2.0 feed of the 50 newest published posts. Drafts are never included (published-only queries).
export const revalidate = 3600

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')

export async function GET() {
  const [posts, text] = await Promise.all([getFeedPosts(), getSiteText()])
  const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const title = text.blog?.breadcrumb ? `Pentox Studio – ${text.blog.breadcrumb}` : 'Pentox Studio'

  const items = posts
    .map((post) => {
      const link = `${site}/blog/${post.slug}/`
      const categories = populated(post.categories)
        .map((category) => `<category>${escape(category.title)}</category>`)
        .join('')
      return `<item><title>${escape(post.title)}</title><link>${escape(link)}</link><guid isPermaLink="true">${escape(link)}</guid>${
        post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''
      }${post.excerpt ? `<description>${escape(post.excerpt)}</description>` : ''}${categories}</item>`
    })
    .join('')

  const lastBuild = posts[0]?.publishedAt ? new Date(posts[0].publishedAt).toUTCString() : new Date().toUTCString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(
    title,
  )}</title><link>${escape(`${site}/blog/`)}</link><description>${escape(title)}</description><language>en</language><lastBuildDate>${lastBuild}</lastBuildDate><atom:link href="${escape(
    `${site}/blog/rss.xml`,
  )}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' },
  })
}
