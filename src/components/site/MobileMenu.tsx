'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import type { HeaderInfo, SiteInfo } from '@/lib/site-data'

import { LOGO_WHITE_FALLBACK, Logo } from './Logo'
import { SmartLink } from './SmartLink'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Full-screen navy menu: grouped services, other links, CTA and contact details (all from the CMS). */
export function MobileMenu({
  open,
  onClose,
  site,
  header,
  returnFocus,
}: {
  open: boolean
  onClose: () => void
  site: SiteInfo
  header: HeaderInfo
  returnFocus: React.RefObject<HTMLElement | null>
}) {
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = returnFocus.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog.current) return
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [open, onClose, returnFocus])

  if (!open) return null

  const hasContact = site.phone || site.email || site.socials.length > 0

  return (
    <div
      aria-label="Menu"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-navy text-white"
      id="mobile-menu"
      ref={dialog}
      role="dialog"
    >
      <div className="mx-auto flex w-full max-w-site items-center justify-between px-4 py-3">
        <Link aria-label={`${site.businessName} home`} href="/" onClick={onClose}>
          <Logo
            className="h-14 w-auto"
            fallback={LOGO_WHITE_FALLBACK}
            image={site.logoWhite}
            name={site.businessName}
          />
        </Link>
        <button
          aria-label="Close menu"
          className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-white/70 hover:border-brand-active hover:text-brand-active focus-visible:border-brand-active"
          onClick={onClose}
          ref={closeButton}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-site flex-1 space-y-10 px-4 pb-12 pt-6">
        {header.groups.length > 0 && (
          <div className="space-y-6">
            {header.groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        className={`block py-1 font-heading text-white transition-colors hover:text-brand-active focus-visible:text-brand-active ${
                          item.isChild ? 'pl-5 text-lg text-white/80' : 'text-2xl'
                        }`}
                        href={item.href}
                        onClick={onClose}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {header.links.length > 0 && (
          <ul className="space-y-1 border-t border-white/15 pt-8">
            {header.links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <SmartLink
                  className="block py-1 font-heading text-3xl text-white transition-colors hover:text-brand-active focus-visible:text-brand-active"
                  link={link}
                  newTab={link.newTab}
                  onClick={onClose}
                >
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        )}

        {header.cta && (
          <SmartLink
            className="inline-block rounded-full bg-brand px-8 py-3 font-medium text-white hover:bg-brand-active"
            link={header.cta.link}
            onClick={onClose}
          >
            {header.cta.label}
          </SmartLink>
        )}

        {hasContact && (
          <div className="space-y-2 border-t border-white/15 pt-8 text-white/80">
            {site.phone && (
              <p>
                <a className="hover:text-white" href={site.phone.href}>
                  {site.phone.display}
                </a>
              </p>
            )}
            {site.email && (
              <p>
                <a className="hover:text-white" href={site.email.href}>
                  {site.email.address}
                </a>
              </p>
            )}
            {site.socials.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-2">
                {site.socials.map((social) => (
                  <li key={social.platform + social.href}>
                    <a className="hover:text-white" href={social.href} rel="noopener noreferrer" target="_blank">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
