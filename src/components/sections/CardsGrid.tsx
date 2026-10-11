import type { Img } from '@/lib/media'

import { CmsImage } from '../ui/CmsImage'
import { CmsIcon } from '../ui/CmsIcon'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

export type CardItem = { icon?: string | null; title: string; description?: string | null; image?: Img }

/** Icon cards (Why Pentox, values, what we'll cover, ...). Hidden when there are no items. */
export function CardsGrid({
  heading,
  intro,
  items,
  numbered,
  id,
}: {
  heading?: string | null
  intro?: string | null
  items?: CardItem[] | null
  numbered?: boolean
  id: string
}) {
  if (!items?.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} intro={intro} />
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(28,36,75,.08)]" key={`${item.title}-${index}`}>
            {item.image && <CmsImage className="aspect-[16/10] w-full object-cover" img={item.image} sizes="(min-width: 1024px) 30vw, 90vw" />}
            <div className="p-6">
            {numbered ? (
              <span className="font-heading text-3xl font-bold text-brand/80">{String(index + 1).padStart(2, '0')}</span>
            ) : (
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                <CmsIcon name={item.icon} />
              </span>
            )}
            <h3 className="mt-4 font-heading text-lg font-semibold text-navy">{item.title}</h3>
            {item.description && <p className="mt-2 text-body">{item.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
