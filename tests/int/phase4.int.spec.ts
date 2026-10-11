import { describe, expect, it } from 'vitest'

import { bookingEmbedUrl, mapEmbedSrc } from '../../src/lib/embeds'
import { previewPathUrl } from '../../src/lib/paths'

describe('embed allow-lists', () => {
  it('frames only Cal.com / Calendly booking links', () => {
    expect(bookingEmbedUrl('https://cal.com/pentox/intro')).toContain('embed=true')
    expect(bookingEmbedUrl('https://calendly.com/pentox/30min')).toContain('calendly.com')
    expect(bookingEmbedUrl('https://evil.example/book')).toBeUndefined()
    expect(bookingEmbedUrl('http://cal.com/pentox')).toBeUndefined()
    expect(bookingEmbedUrl('javascript:alert(1)')).toBeUndefined()
    expect(bookingEmbedUrl(undefined)).toBeUndefined()
  })

  it('frames only Google Maps embeds', () => {
    expect(mapEmbedSrc('https://www.google.com/maps?q=Lahore&output=embed')).toBeDefined()
    expect(mapEmbedSrc('https://www.google.com/search?q=x')).toBeUndefined()
    expect(mapEmbedSrc('https://evil.example/maps')).toBeUndefined()
    expect(mapEmbedSrc('data:text/html,hi')).toBeUndefined()
  })
})

describe('preview URL', () => {
  it('routes through /next/preview/ with the target path encoded', () => {
    const url = new URL(previewPathUrl('/services/seo/'))
    expect(url.pathname).toBe('/next/preview/')
    expect(url.searchParams.get('path')).toBe('/services/seo/')
  })
})
