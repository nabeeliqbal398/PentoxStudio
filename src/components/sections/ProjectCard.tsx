import Link from 'next/link'

import type { ProjectCardData } from '@/lib/portfolio'

import { CmsImage } from '../ui/CmsImage'

/**
 * Portrait (2:3) project card: cover image, bottom gradient, red service tag over a white title.
 * The whole card is one link. Presentational only, so it works in server and client components.
 */
export function ProjectCardView({ card, className = '' }: { card: ProjectCardData; className?: string }) {
  return (
    <div className={`group relative aspect-[2/3] overflow-hidden rounded-xl bg-navy ${className}`}>
      {card.image && (
        <CmsImage
          className="absolute inset-0 size-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
          img={card.image}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[rgba(13,13,13,.65)] via-transparent to-transparent transition-colors group-hover:from-[rgba(13,13,13,.8)]"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        {card.tag && <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b70]">{card.tag}</p>}
        <h3 className="mt-1 font-heading text-2xl font-normal leading-snug">
          <Link className="after:absolute after:inset-0 after:content-['']" href={`/portfolio/${card.slug}/`}>
            {card.title}
          </Link>
        </h3>
      </div>
    </div>
  )
}
