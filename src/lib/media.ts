import type { Media } from '../payload-types'

export type SizeName = 'thumbnail' | 'card' | 'portrait' | 'hero' | 'og'

export type Img = { src: string; alt: string; width: number; height: number }

/**
 * Payload appends a trailing slash to media URLs when `trailingSlash` is on. The file route works with or
 * without it, but next/image refuses a source ending in a slash (HTTP 400), so it is removed here.
 */
export const mediaSrc = (url: string) => url.replace(/\/+$/, '')

/** Populated media docs only (an unpopulated id or a missing file gives undefined). */
export function toImg(media: number | Media | null | undefined, size?: SizeName): Img | undefined {
  if (!media || typeof media !== 'object') return undefined
  const sized = size ? media.sizes?.[size] : undefined
  const source = sized?.url && sized.width && sized.height ? sized : media
  if (!source.url || !source.width || !source.height) return undefined
  return { src: mediaSrc(source.url), alt: media.alt, width: source.width, height: source.height }
}

/** Keeps only populated docs from a relationship that may hold ids (unreadable or draft docs). */
export const populated = <T extends object>(values: (number | T)[] | null | undefined): T[] =>
  (values ?? []).filter((value): value is T => typeof value === 'object' && value !== null)

export const one = <T extends object>(value: number | T | null | undefined): T | undefined =>
  typeof value === 'object' && value !== null ? value : undefined
