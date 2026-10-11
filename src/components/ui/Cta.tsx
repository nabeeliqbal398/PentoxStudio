import { safeLink } from '@/lib/links'

import { SmartLink } from '../site/SmartLink'

const styles = {
  primary: 'bg-brand text-white hover:bg-brand-active focus-visible:bg-brand-active',
  outline: 'border-[1.5px] border-navy text-navy hover:bg-navy hover:text-white',
  light: 'bg-white text-navy hover:bg-surface-alt',
  outlineLight: 'border-[1.5px] border-white text-white hover:bg-white hover:text-navy',
} as const

export type CtaVariant = keyof typeof styles

/** A button-styled link. Renders nothing when the label or the URL is empty or unsafe. */
export function Cta({
  label,
  url,
  variant = 'primary',
  className = '',
  newTab,
}: {
  label?: string | null
  url?: string | null
  variant?: CtaVariant
  className?: string
  newTab?: boolean
}) {
  const link = safeLink(url)
  const text = label?.trim()
  if (!link || !text) return null
  return (
    <SmartLink
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
      link={link}
      newTab={newTab}
    >
      {text}
    </SmartLink>
  )
}
