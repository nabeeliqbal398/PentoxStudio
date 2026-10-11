'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, type ReactNode } from 'react'

/**
 * Scroll-snap carousel with previous/next buttons (no library, no animation of its own, so it
 * respects reduced motion). Items size themselves; use `perView` to choose how many fit.
 */
export function ScrollCarousel({
  children,
  label,
  perView = 'multi',
  tone = 'dark',
  controls = true,
}: {
  children: ReactNode
  label: string
  perView?: 'single' | 'multi'
  tone?: 'dark' | 'light'
  /** Previous/next buttons; pass false when there is only one item. */
  controls?: boolean
}) {
  const track = useRef<HTMLUListElement>(null)

  const scrollByPage = (direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' })
  }

  const button =
    tone === 'light'
      ? 'border-white/40 text-white hover:bg-white hover:text-navy'
      : 'border-navy/30 text-navy hover:bg-navy hover:text-white'

  return (
    <div aria-label={label} aria-roledescription="carousel" role="region">
      <ul
        className={`flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] ${
          perView === 'single' ? '[&>li]:w-full' : '[&>li]:w-[85%] sm:[&>li]:w-[45%] lg:[&>li]:w-[31%]'
        } [&>li]:shrink-0 [&>li]:snap-start`}
        ref={track}
        tabIndex={0}
      >
        {children}
      </ul>
      {controls && (
      <div className="mt-4 flex justify-center gap-3">
        <button
          aria-label="Previous"
          className={`rounded-full border p-2 transition-colors ${button}`}
          onClick={() => scrollByPage(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <button
          aria-label="Next"
          className={`rounded-full border p-2 transition-colors ${button}`}
          onClick={() => scrollByPage(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>
      )}
    </div>
  )
}
