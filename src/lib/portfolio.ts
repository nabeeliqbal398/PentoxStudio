import type { Portfolio } from '../payload-types'
import { one, populated, toImg, type Img } from './media'

/** Plain, serialisable data for a portfolio card (safe to pass to client components). */
export type ProjectCardData = {
  id: number
  slug: string
  title: string
  /** Small red label above the title: the first service, else the first category. */
  tag?: string
  image?: Img
  /** Category slugs, used by the filter pills. */
  categories: string[]
}

export function toCard(project: Portfolio): ProjectCardData {
  const categories = populated(project.categories)
  const service = populated(project.services)[0]
  return {
    id: project.id,
    slug: project.slug ?? String(project.id),
    title: project.title,
    tag: service?.title ?? categories[0]?.title,
    image: toImg(one(project.cardImage), 'portrait') ?? toImg(one(project.heroImage), 'card'),
    categories: categories.flatMap((category) => (category.slug ? [category.slug] : [])),
  }
}
