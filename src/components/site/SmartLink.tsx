import Link from 'next/link'
import type { ComponentProps } from 'react'

import type { SafeLink } from '@/lib/links'

type Props = Omit<ComponentProps<'a'>, 'href' | 'target'> & {
  link: SafeLink
  newTab?: boolean
}

/** Internal links use next/link; everything else is a plain anchor (new tabs get rel=noopener). */
export function SmartLink({ link, newTab, children, ...rest }: Props) {
  if (link.kind === 'internal') {
    return (
      <Link href={link.href} {...rest}>
        {children}
      </Link>
    )
  }
  const external = link.kind === 'external'
  return (
    <a
      href={link.href}
      target={newTab ? '_blank' : undefined}
      rel={external ? (newTab ? 'noopener noreferrer' : 'noopener') : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
