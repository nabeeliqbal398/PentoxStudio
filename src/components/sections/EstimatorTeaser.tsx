import { Cta } from '../ui/Cta'
import { Section } from '../ui/Section'

/** Teaser panel (cost estimator, pricing). Hidden when it has neither a heading nor a button label. */
export function EstimatorTeaser({
  heading,
  text,
  buttonLabel,
  url,
}: {
  heading?: string | null
  text?: string | null
  buttonLabel?: string | null
  url?: string | null
}) {
  if (!heading && !buttonLabel) return null
  return (
    <Section>
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-line/40 bg-white px-6 py-10 text-center md:px-12">
        {heading && <h2 className="font-heading text-2xl font-semibold text-navy md:text-3xl">{heading}</h2>}
        {text && <p className="max-w-2xl text-body">{text}</p>}
        <Cta label={buttonLabel} url={url} />
      </div>
    </Section>
  )
}
