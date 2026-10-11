'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import type { ProjectCardData } from '@/lib/portfolio'

import { ProjectCardView } from '../sections/ProjectCard'

type Category = { slug: string; title: string }

type Props = {
  cards: ProjectCardData[]
  categories: Category[]
  allLabel?: string | null
  filterLabel?: string | null
  emptyText?: string | null
}

const pill = 'inline-block rounded-full border-2 px-8 py-3 text-sm font-medium transition-colors'
const idle = 'border-line/70 text-muted hover:border-brand hover:text-brand'
const active = 'border-brand text-brand'

function Pills({ categories, current, allLabel, filterLabel, base }: Props & { current: string; base: string }) {
  if (!categories.length) return null
  const items = [{ slug: '', title: allLabel ?? '' }, ...categories].filter((item) => item.title)
  return (
    <nav aria-label={filterLabel ?? undefined} className="mb-10">
      <ul className="flex flex-wrap justify-center gap-3">
        {items.map((item) => (
          <li key={item.slug || 'all'}>
            {/* Real links: the URL (?category=slug) is the filter state, shareable and back-button friendly. */}
            <Link
              aria-current={current === item.slug ? 'true' : undefined}
              className={`${pill} ${current === item.slug ? active : idle}`}
              href={item.slug ? `${base}?category=${item.slug}` : base}
              replace
              scroll={false}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Grid({
  cards,
  current,
  emptyText,
  animate,
}: {
  cards: ProjectCardData[]
  current: string
  emptyText?: string | null
  animate: boolean
}) {
  const shown = current ? cards.filter((card) => card.categories.includes(current)) : cards
  if (!shown.length) return emptyText ? <p className="text-center text-body">{emptyText}</p> : null
  return (
    <motion.ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" layout={animate}>
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map((card) => (
          <motion.li
            animate={{ opacity: 1, scale: 1 }}
            exit={animate ? { opacity: 0, scale: 0.94 } : { opacity: 0 }}
            initial={animate ? { opacity: 0, scale: 0.94 } : false}
            key={card.id}
            layout={animate}
            transition={animate ? { duration: 0.3, ease: 'easeOut' } : { duration: 0 }}
          >
            <ProjectCardView card={card} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}

function Filtered(props: Props) {
  const params = useSearchParams()
  const pathname = usePathname()
  const requested = params.get('category') ?? ''
  // An unknown or empty category in the URL simply shows everything.
  const current = props.categories.some((category) => category.slug === requested) ? requested : ''
  // Visitors who ask for reduced motion get an instant swap: no fade, no layout animation.
  const animate = !useReducedMotion()
  return (
    <>
      <Pills {...props} base={pathname} current={current} />
      <Grid animate={animate} cards={props.cards} current={current} emptyText={props.emptyText} />
    </>
  )
}

/**
 * Portfolio filter pills + animated card grid. The server renders "All"; in the browser the
 * ?category= query picks the filter. Categories with no projects never appear as pills.
 */
export function PortfolioGrid(props: Props) {
  return (
    <Suspense
      fallback={
        <>
          <Pills {...props} base="/portfolio/" current="" />
          <Grid animate={false} cards={props.cards} current="" emptyText={props.emptyText} />
        </>
      }
    >
      <Filtered {...props} />
    </Suspense>
  )
}
