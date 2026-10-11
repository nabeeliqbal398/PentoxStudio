import { describe, expect, it } from 'vitest'

import { blogHref, fill, readBlogParams } from '@/lib/blog'
import { createHeadingIds, extractToc, slugify, splitForMidCta } from '@/lib/toc'
import { cleanWpHtml } from '../../src/migrate/wp-html'
import { categoryFor, cleanSlug, duplicateKey } from '../../src/migrate/wp-util'

const heading = (tag: string, text: string) => ({ type: 'heading', tag, children: [{ type: 'text', text }] })
const para = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const doc = (children: unknown[]) => ({ root: { type: 'root', children } }) as never

describe('WordPress slug cleaning', () => {
  it('removes the junk prefixes of the old site', () => {
    expect(cleanSlug('https-pentoxstudio-com-blogs-ai-seo-services')).toBe('ai-seo-services')
    expect(cleanSlug('https-pentoxstudio-com-google-ads-cost-in-pakistan-2026')).toBe('google-ads-cost-in-pakistan-2026')
    expect(cleanSlug('url-slug-blog-digital-marketing-in-pakistan-complete-guide')).toBe('digital-marketing-in-pakistan-complete-guide')
    expect(cleanSlug('blog-technical-seo-services')).toBe('technical-seo-services')
    expect(cleanSlug('digital-marketing-strategy')).toBe('digital-marketing-strategy')
  })

  it('groups the three "Top Digital Marketing Agency" posts', () => {
    const keys = ['top-digital-marketing-agency-pakistan', 'top-digital-marketing-agency-pakistan-2', 'top-digital-marketing-agency-pakistan-3'].map(duplicateKey)
    expect(new Set(keys).size).toBe(1)
  })

  it('assigns a service category by topic', () => {
    const entry = (title: string) => ({ title, slug: 'x', date: '', url: '', source: '' })
    expect(categoryFor(entry('Local SEO for Small Businesses'))).toBe('local-seo')
    expect(categoryFor(entry('Technical SEO Services'))).toBe('seo')
    expect(categoryFor(entry('Graphic Design Cost in Pakistan'))).toBe('graphic-design')
    expect(categoryFor(entry('Something else entirely'))).toBe('digital-marketing')
  })
})

describe('WordPress HTML cleaning', () => {
  const options = { title: 'My Post', siteHost: 'pentoxstudio.com', postMap: new Map([['/2026/07/old/', '/blog/new/']]) }

  it('flattens wrappers, drops scripts/buttons, the title heading and the in-body TOC', () => {
    const html = `<div class="elementor"><div><script>x()</script>
      <h2 class="wp-block-heading">My Post</h2>
      <p><strong>Table of Contents</strong></p>
      <ol><li><a href="#a">A</a></li><li><a href="#b">B</a></li><li><a href="#c">C</a></li></ol>
      <h1>Real heading</h1><p>Hello <a href="https://pentoxstudio.com/2026/07/old/">old post</a> and <a href="https://pentoxstudio.com/seo/">seo</a>.</p>
      <p>&nbsp;</p><h5>Small</h5><button>Buy</button></div></div>`
    const result = cleanWpHtml(html, options)
    expect(result.html).not.toContain('Table of Contents')
    expect(result.html).not.toContain('<script')
    expect(result.html).toContain('<h2>Real heading</h2>')
    expect(result.html).toContain('<h4>Small</h4>')
    expect(result.html).toContain('href="/blog/new/"')
    expect(result.html).toContain('href="/seo/"')
    expect(result.html).not.toContain('class=')
    expect(result.notes.join(' ')).toMatch(/table of contents/)
  })

  it('turns images into markers and keeps their alt text', () => {
    const result = cleanWpHtml('<figure><img src="/wp-content/uploads/a.png" alt="A chart"><figcaption>Caption</figcaption></figure>', options)
    expect(result.images).toEqual([{ src: '/wp-content/uploads/a.png', alt: 'A chart' }])
    expect(result.html).toContain('[[IMG:0]]')
    expect(result.html).toContain('Caption')
  })

  it('removes javascript: links', () => {
    expect(cleanWpHtml('<p><a href="javascript:alert(1)">x</a></p>', options).html).not.toContain('javascript:')
  })
})

describe('table of contents', () => {
  it('numbers duplicate headings the same way in the TOC and the body', () => {
    const data = doc([heading('h2', 'Intro'), para('a'), heading('h3', 'Intro'), heading('h4', 'ignored')])
    expect(extractToc(data).map((item) => item.id)).toEqual(['intro', 'intro-2'])
    const ids = createHeadingIds()
    expect([ids.next('Intro'), ids.next('Intro')]).toEqual(['intro', 'intro-2'])
    expect(slugify('Cost & Pricing: 2026!')).toBe('cost-and-pricing-2026')
  })

  it('splits long bodies at a heading near the middle and leaves short ones whole', () => {
    const long = doc([...Array.from({ length: 5 }, (_, i) => para(`p${i}`)), heading('h2', 'Middle'), ...Array.from({ length: 5 }, (_, i) => para(`q${i}`))])
    const [first, second] = splitForMidCta(long)
    expect((first.root.children as { type: string }[]).length + (second!.root.children as unknown[]).length).toBe(11)
    expect((second!.root.children[0] as { type: string }).type).toBe('heading')
    expect(splitForMidCta(doc([para('a'), para('b')]))[1]).toBeNull()
  })
})

describe('blog URL state', () => {
  it('reads and rebuilds search, category and page', () => {
    expect(readBlogParams({ q: ' seo ', category: 'seo', page: '3' })).toEqual({ q: 'seo', category: 'seo', page: 3 })
    expect(readBlogParams({ page: 'abc' }).page).toBe(1)
    expect(readBlogParams({ page: ['2', '5'] }).page).toBe(2)
    expect(blogHref('/blog/', { q: 'a b', category: 'seo', page: 2 })).toBe('/blog/?q=a+b&category=seo&page=2')
    expect(blogHref('/blog/', { page: 1 })).toBe('/blog/')
    expect(fill('{minutes} min read', { minutes: 7 })).toBe('7 min read')
  })
})
