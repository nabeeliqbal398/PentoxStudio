'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Img } from '@/lib/media'

export type GalleryItem = { thumb: Img; full: Img; caption?: string }

type Labels = { open?: string | null; close?: string | null; previous?: string | null; next?: string | null }

/**
 * Two-column image gallery with a lightbox built on the native <dialog>: focus is trapped, Esc
 * closes, and the arrow keys move between images. Nothing animates, so reduced motion is respected.
 */
export function Gallery({ items, labels }: { items: GalleryItem[]; labels: Labels }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  const open = (next: number) => {
    setIndex(next)
    dialog.current?.showModal()
  }
  const close = () => dialog.current?.close()
  const count = items.length
  const step = useCallback(
    (delta: number) => setIndex((current) => (current === null ? current : (current + delta + count) % count)),
    [count],
  )

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    const onClose = () => setIndex(null)
    el.addEventListener('keydown', onKey)
    el.addEventListener('close', onClose)
    return () => {
      el.removeEventListener('keydown', onKey)
      el.removeEventListener('close', onClose)
    }
  }, [step])

  const current = index === null ? undefined : items[index]

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.full.src}>
            <button
              aria-label={[labels.open, item.caption].filter(Boolean).join(': ') || item.thumb.alt}
              className="block w-full overflow-hidden rounded-xl shadow-[0_8px_30px_rgba(28,36,75,.12)]"
              onClick={() => open(i)}
              type="button"
            >
              <Image
                alt={item.thumb.alt}
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105"
                height={item.thumb.height}
                sizes="(min-width: 640px) 45vw, 95vw"
                src={item.thumb.src}
                width={item.thumb.width}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        aria-label={current?.caption || current?.full.alt}
        className="m-auto max-h-[92vh] w-[min(1100px,94vw)] rounded-xl bg-transparent p-0 text-white backdrop:bg-black/85"
        onClick={(event) => event.target === dialog.current && close()}
        ref={dialog}
      >
        {current && (
          <figure className="relative flex flex-col items-center">
            <Image
              alt={current.full.alt}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
              height={current.full.height}
              sizes="94vw"
              src={current.full.src}
              width={current.full.width}
            />
            {current.caption && <figcaption className="mt-3 text-center text-sm text-white/85">{current.caption}</figcaption>}
          </figure>
        )}
        <button
          aria-label={labels.close ?? undefined}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-navy hover:bg-white"
          onClick={close}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        {items.length > 1 && (
          <>
            <button
              aria-label={labels.previous ?? undefined}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy hover:bg-white"
              onClick={() => step(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-6" />
            </button>
            <button
              aria-label={labels.next ?? undefined}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy hover:bg-white"
              onClick={() => step(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-6" />
            </button>
          </>
        )}
      </dialog>
    </>
  )
}
