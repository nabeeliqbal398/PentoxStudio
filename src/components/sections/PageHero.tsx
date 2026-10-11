import type { ReactNode } from 'react'

import type { Img } from '@/lib/media'

import { CmsImage } from '../ui/CmsImage'

function Heading({ text, highlight }: { text: string; highlight?: string | null }) {
  const word = highlight?.trim()
  const at = word ? text.indexOf(word) : -1
  if (!word || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="text-brand">{word}</span>
      {text.slice(at + word.length)}
    </>
  )
}

/** Page hero: eyebrow, real-HTML H1 (optional red highlight word), intro, buttons, trust line, image. */
export function PageHero({
  eyebrow,
  heading,
  highlight,
  intro,
  actions,
  trustLine,
  image,
  priorityImage = true,
}: {
  eyebrow?: string | null
  heading: string
  highlight?: string | null
  intro?: string | null
  actions?: ReactNode
  trustLine?: string | null
  image?: Img
  priorityImage?: boolean
}) {
  return (
    <header className={`mx-auto grid max-w-site items-center gap-10 px-4 py-12 md:py-20 ${image ? 'md:grid-cols-2' : ''}`}>
      <div className={image ? '' : 'max-w-3xl'}>
        {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>}
        <h1 className="font-heading text-4xl font-semibold leading-tight text-navy md:text-5xl">
          <Heading highlight={highlight} text={heading} />
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">{intro}</p>}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        {trustLine && <p className="mt-5 text-sm font-medium text-muted">{trustLine}</p>}
      </div>
      {image && (
        <CmsImage
          className="mx-auto h-auto w-full max-w-xl rounded-2xl"
          img={image}
          priority={priorityImage}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      )}
    </header>
  )
}
