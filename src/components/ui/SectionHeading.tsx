import { Squiggle } from '../site/Squiggle'

/** Eyebrow + H2 + squiggle + intro. Renders nothing when there is no heading or intro. */
export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = 'center',
  tone = 'dark',
  as: Tag = 'h2',
}: {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  align?: 'center' | 'left'
  tone?: 'dark' | 'light'
  as?: 'h1' | 'h2'
}) {
  if (!heading && !intro && !eyebrow) return null
  const light = tone === 'light'
  return (
    <div className={`mb-10 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
      )}
      {heading && (
        <Tag className={`font-heading text-3xl font-semibold md:text-4xl ${light ? 'text-white' : 'text-navy'}`}>
          {heading}
        </Tag>
      )}
      {heading && align === 'center' && <Squiggle className="mt-4" />}
      {intro && <p className={`mt-4 text-lg ${light ? 'text-white/80' : 'text-body'}`}>{intro}</p>}
    </div>
  )
}
