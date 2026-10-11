import Image from 'next/image'

import type { Img } from '@/lib/media'

/** next/image for a CMS media doc. Renders nothing when the image is missing. */
export function CmsImage({
  img,
  className,
  sizes,
  priority,
}: {
  img?: Img
  className?: string
  sizes?: string
  priority?: boolean
}) {
  if (!img) return null
  return (
    <Image
      alt={img.alt}
      className={className}
      height={img.height}
      priority={priority}
      sizes={sizes}
      src={img.src}
      width={img.width}
    />
  )
}
