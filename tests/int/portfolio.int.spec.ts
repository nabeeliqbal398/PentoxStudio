import { describe, expect, it } from 'vitest'

import { mediaSrc, toImg } from '@/lib/media'
import { toCard } from '@/lib/portfolio'
import type { Media, Portfolio } from '@/payload-types'

describe('media URLs', () => {
  it('drops the trailing slash Payload adds, which next/image rejects', () => {
    expect(mediaSrc('/api/media/file/a.png/')).toBe('/api/media/file/a.png')
    expect(mediaSrc('/api/media/file/a.png')).toBe('/api/media/file/a.png')
  })

  it('uses the requested size and ignores unpopulated ids', () => {
    const media = {
      id: 1,
      alt: 'x',
      url: '/api/media/file/a.png/',
      width: 100,
      height: 100,
      sizes: { portrait: { url: '/api/media/file/a-644x972.webp/', width: 644, height: 972 } },
    } as Media
    expect(toImg(media, 'portrait')).toMatchObject({ src: '/api/media/file/a-644x972.webp', width: 644 })
    expect(toImg(5)).toBeUndefined()
  })
})

describe('portfolio card data', () => {
  it('tags with the first service and lists category slugs for the filter', () => {
    const card = toCard({
      id: 1,
      title: 'P',
      slug: 'p',
      services: [{ id: 2, title: 'SEO' }],
      categories: [{ id: 3, title: 'SEO', slug: 'seo' }, 4],
    } as unknown as Portfolio)
    expect(card).toMatchObject({ slug: 'p', tag: 'SEO', categories: ['seo'] })
  })
})
