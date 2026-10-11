import { Star } from 'lucide-react'

import { safeLink } from '@/lib/links'
import { one, toImg } from '@/lib/media'
import type { Badge, Review, Testimonial } from '@/payload-types'

import { CmsImage } from '../ui/CmsImage'
import { ScrollCarousel } from '../ui/ScrollCarousel'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

const SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  clutch: 'Clutch',
  upwork: 'Upwork',
  linkedin: 'LinkedIn',
}

function Stars({ rating }: { rating?: number | null }) {
  if (!rating) return null
  return (
    <p aria-label={`${rating} out of 5`} className="flex gap-0.5 text-amber-500" role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <Star aria-hidden="true" className={`size-4 ${i < rating ? 'fill-current' : 'text-line/60'}`} key={i} />
      ))}
    </p>
  )
}

function TestimonialSlide({ testimonial }: { testimonial: Testimonial }) {
  const avatar = toImg(one(testimonial.avatar), 'thumbnail')
  const source = testimonial.source ? SOURCE_LABELS[testimonial.source] : undefined
  const sourceLink = safeLink(testimonial.sourceUrl)
  return (
    <li className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(28,36,75,.08)] md:p-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <Stars rating={testimonial.rating} />
        <blockquote className="font-heading text-xl leading-relaxed text-navy md:text-2xl">
          “{testimonial.quote}”
        </blockquote>
        <div className="flex items-center gap-3">
          {avatar && <CmsImage className="size-12 rounded-full object-cover" img={{ ...avatar, alt: testimonial.name }} />}
          <p className="text-left text-sm">
            <span className="block font-semibold text-navy">{testimonial.name}</span>
            <span className="text-muted">{[testimonial.role, testimonial.company].filter(Boolean).join(', ')}</span>
          </p>
        </div>
        {source && (
          <p className="text-xs text-muted">
            {sourceLink?.kind === 'external' ? (
              <a className="underline underline-offset-2" href={sourceLink.href} rel="noopener noreferrer" target="_blank">
                {source}
              </a>
            ) : (
              source
            )}
          </p>
        )}
      </div>
    </li>
  )
}

/**
 * Real entries only: verified testimonials, genuine reviews (Google, Clutch, ...) and platform badges.
 * The section does not render when all three are empty.
 */
export function Testimonials({
  testimonials,
  reviews,
  badges,
  heading,
  id,
}: {
  testimonials: Testimonial[]
  reviews: Review[]
  badges: Badge[]
  heading?: string | null
  id: string
}) {
  if (!testimonials.length && !reviews.length && !badges.length) return null
  const badgeItems = badges.flatMap((badge) => {
    const img = toImg(one(badge.image), 'card')
    return img ? [{ badge, img }] : []
  })
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      {testimonials.length > 0 && (
        <ScrollCarousel controls={testimonials.length > 1} label={heading ?? 'Testimonials'} perView="single">
          {testimonials.map((testimonial) => (
            <TestimonialSlide key={testimonial.id} testimonial={testimonial} />
          ))}
        </ScrollCarousel>
      )}

      {reviews.length > 0 && (
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => {
            const link = safeLink(review.reviewUrl)
            return (
              <li className="rounded-2xl bg-white p-5 text-sm shadow-[0_8px_30px_rgba(28,36,75,.08)]" key={review.id}>
                <Stars rating={review.rating} />
                {review.text && <p className="mt-2 line-clamp-4 text-body">{review.text}</p>}
                <p className="mt-3 font-semibold text-navy">
                  {review.authorName}
                  <span className="font-normal text-muted"> · {SOURCE_LABELS[review.platform] ?? review.platform}</span>
                </p>
                {link?.kind === 'external' && (
                  <a className="text-accent underline underline-offset-2" href={link.href} rel="noopener noreferrer" target="_blank">
                    {SOURCE_LABELS[review.platform] ?? review.platform}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {badgeItems.length > 0 && (
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {badgeItems.map(({ badge, img }) => {
            const link = safeLink(badge.url)
            const image = <CmsImage className="h-14 w-auto object-contain" img={{ ...img, alt: badge.name }} />
            return (
              <li key={badge.id}>
                {link?.kind === 'external' ? (
                  <a href={link.href} rel="noopener noreferrer" target="_blank">
                    {image}
                  </a>
                ) : (
                  image
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
