'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

/** `raised` lifts it above the chat launcher when the chatbot is on. */
export function BackToTop({ raised = false }: { raised?: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <button
      aria-label="Back to top"
      className={`fixed ${raised ? 'bottom-[8.25rem] md:bottom-24' : 'bottom-20 md:bottom-6'} right-4 z-30 flex size-11 items-center justify-center rounded-full border-[1.5px] border-navy bg-white text-navy transition-[opacity,background-color,color] hover:bg-brand hover:text-white focus-visible:bg-brand focus-visible:text-white md:right-6 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={toTop}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      <ChevronUp aria-hidden="true" className="size-5" />
    </button>
  )
}
