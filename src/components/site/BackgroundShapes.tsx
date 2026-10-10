'use client'

import { useEffect, useRef } from 'react'

// Fixed decorative blob/hatch layer (public/brand/shapes.png) with a very slight parallax.
// Purely visual: no pointer events, hidden from assistive tech, parallax off for reduced motion.
export function BackgroundShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!el || query.matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const offset = Math.min(window.scrollY * 0.04, 40)
      el.style.transform = `translate3d(0, ${-offset}px, 0)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-x-0 -top-10 h-[calc(100%+80px)] bg-cover bg-center opacity-50 will-change-transform"
        ref={ref}
        style={{ backgroundImage: 'url(/brand/shapes.png)' }}
      />
    </div>
  )
}
