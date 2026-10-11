import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

type Step = { title: string; description?: string | null }

/** "How we work": numbered steps in a row. Hidden when there are no steps. */
export function Steps({ heading, steps, id }: { heading?: string | null; steps?: Step[] | null; id: string }) {
  if (!steps?.length) return null
  return (
    <Section labelledBy={heading ? id : undefined}>
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li className="relative rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(28,36,75,.08)]" key={`${step.title}-${index}`}>
            <span className="font-heading text-4xl font-bold text-brand/80">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-navy">{step.title}</h3>
            {step.description && <p className="mt-2 text-body">{step.description}</p>}
          </li>
        ))}
      </ol>
    </Section>
  )
}
