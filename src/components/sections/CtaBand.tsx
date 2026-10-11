import type { ReactNode } from 'react'

import type { Footer } from '@/payload-types'

import { Cta } from '../ui/Cta'

type Band = {
  heading?: string | null
  text?: string | null
  primaryCta?: { label?: string | null; url?: string | null } | null
  secondaryCta?: { label?: string | null; url?: string | null } | null
  buttonLabel?: string | null
  buttonUrl?: string | null
}

/**
 * Pre-footer CTA band ("Get your free audit"). Content is the site-wide band from the Footer
 * settings unless a page/service supplies its own. `children` is where the multi-step lead form
 * goes in a later phase. Hidden when there is nothing to show.
 */
export function CtaBand({
  band,
  override,
  children,
}: {
  band?: Footer['ctaBand']
  override?: Band | null
  children?: ReactNode
}) {
  const own = override?.heading ? override : undefined
  const content: Band | undefined | null = own ?? band
  if (!content?.heading) return null
  const primary = own
    ? { label: own.buttonLabel, url: own.buttonUrl }
    : { label: content.primaryCta?.label, url: content.primaryCta?.url }
  const secondary = own ? undefined : content.secondaryCta

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:py-16">
      <div className="rounded-3xl bg-navy px-6 py-12 text-center text-white md:px-12 md:py-16">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">{content.heading}</h2>
        {content.text && <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{content.text}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Cta label={primary.label} url={primary.url} />
          <Cta label={secondary?.label} url={secondary?.url} variant="outlineLight" />
        </div>
        {children}
      </div>
    </section>
  )
}
