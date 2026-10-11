import { ChevronDown } from 'lucide-react'

import { faqJsonLd } from '@/lib/seo'
import type { Faq } from '@/payload-types'

import { JsonLd } from '../site/JsonLd'
import { Section } from '../ui/Section'
import { SectionHeading } from '../ui/SectionHeading'

/** FAQ accordion (native <details>, no client JS) with FAQPage schema. Hidden when there are no FAQs. */
export function FaqSection({ faqs, heading, id }: { faqs: Pick<Faq, 'id' | 'question' | 'answer'>[]; heading?: string | null; id: string }) {
  if (!faqs.length) return null
  const schema = faqJsonLd(faqs)
  return (
    <Section labelledBy={heading ? id : undefined}>
      {schema && <JsonLd data={schema} />}
      <div id={id}>
        <SectionHeading heading={heading} />
      </div>
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((faq) => (
          <details className="group rounded-xl bg-white shadow-[0_8px_30px_rgba(28,36,75,.06)]" key={faq.id}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-heading font-semibold text-navy [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-body">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
