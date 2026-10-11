'use client'

import { useEffect, useRef, useState } from 'react'

const SHAPES = '/brand/shapes.webp'

// Fixed decorative blob/hatch layer (public/brand/shapes.webp (a compressed copy of shapes.png)) with a very slight parallax.
// Purely visual: no pointer events, hidden from assistive tech, parallax off for reduced motion. The image is fetched
// only after the page has finished loading (it is decoration, so it must not compete with the content) and fades in.
export function BackgroundShapes() {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchImage = () => {
      const image = new Image()
      image.src = SHAPES
      image
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (!cancelled) setLoaded(true)
        })
    }
    if (document.readyState === 'complete') fetchImage()
    else window.addEventListener('load', fetchImage, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', fetchImage)
    }
  }, [])

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
        className={`absolute inset-x-0 -top-10 h-[calc(100%+80px)] bg-cover bg-center transition-opacity duration-700 will-change-transform ${loaded ? 'opacity-50' : 'opacity-0'}`}
        ref={ref}
        style={loaded ? { backgroundImage: `url(${SHAPES})` } : undefined}
      />
    </div>
  )
}
