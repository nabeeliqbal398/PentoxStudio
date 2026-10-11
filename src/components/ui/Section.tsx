import type { ReactNode } from 'react'

/** Standard page section: centred container with vertical rhythm. */
export function Section({
  children,
  className = '',
  id,
  labelledBy,
}: {
  children: ReactNode
  className?: string
  id?: string
  labelledBy?: string
}) {
  return (
    <section aria-labelledby={labelledBy} className={`mx-auto max-w-site px-4 py-12 md:py-16 ${className}`} id={id}>
      {children}
    </section>
  )
}
