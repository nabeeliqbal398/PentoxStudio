import { Section } from '../ui/Section'

type Item = { value: string; label: string }

/** Stats strip with real numbers from the Stats global. Hidden when the list is empty. */
export function Stats({ items }: { items?: Item[] | null }) {
  if (!items?.length) return null
  return (
    <section aria-label="Key figures" className="bg-navy py-10 text-white">
      <Section className="!py-0">
        <dl className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {items.map((item, index) => (
            <div className="flex flex-col-reverse" key={`${item.label}-${index}`}>
              <dd className="font-heading text-4xl font-bold">{item.value}</dd>
              <dt className="mt-1 text-sm text-white/80">{item.label}</dt>
            </div>
          ))}
        </dl>
      </Section>
    </section>
  )
}
