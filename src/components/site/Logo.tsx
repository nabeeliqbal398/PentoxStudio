import Image from 'next/image'

import type { ImageInfo } from '@/lib/site-data'

type Fallback = { src: string; width: number; height: number }

// The CMS logo wins; the bundled brand file is only a fallback until one is uploaded.
export const LOGO_FALLBACK: Fallback = { src: '/brand/logo.webp', width: 339, height: 281 }
export const LOGO_WHITE_FALLBACK: Fallback = { src: '/brand/logo-white.webp', width: 1024, height: 1024 }

export function Logo({
  image,
  fallback,
  name,
  className,
  priority,
  sizes,
}: {
  image?: ImageInfo
  fallback: Fallback
  name: string
  className?: string
  priority?: boolean
  /** Displayed width (e.g. "64px"): stops the browser downloading a logo far larger than it is shown. */
  sizes?: string
}) {
  const source = image ?? { ...fallback, alt: name }
  return (
    <Image
      alt={image?.alt || name}
      className={className}
      height={source.height}
      priority={priority}
      sizes={sizes}
      src={'url' in source ? source.url : source.src}
      width={source.width}
    />
  )
}
