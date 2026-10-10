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
}: {
  image?: ImageInfo
  fallback: Fallback
  name: string
  className?: string
  priority?: boolean
}) {
  const source = image ?? { ...fallback, alt: name }
  return (
    <Image
      alt={image?.alt || name}
      className={className}
      height={source.height}
      priority={priority}
      src={'url' in source ? source.url : source.src}
      width={source.width}
    />
  )
}
